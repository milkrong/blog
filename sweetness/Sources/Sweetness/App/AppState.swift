import Foundation
import SwiftUI

/// Top-level observable application state. Owns the core manager, the API
/// client and the live data streams, and exposes high-level intents to the UI.
@MainActor
final class AppState: ObservableObject {
    // Sub-systems
    let profiles: ProfileManager
    let core: MihomoManager
    private(set) var api: ClashAPIClient

    // Connectivity
    @Published var endpoint = ControllerEndpoint()
    @Published var isControllerReachable = false

    // Runtime config / proxies
    @Published var config: ClashConfig?
    @Published var proxies: [String: Proxy] = [:]
    @Published var lastError: String?

    // System proxy
    @Published var systemProxyEnabled = false
    @Published var tunModeEnabled = false

    // Live telemetry
    @Published var trafficHistory: [TrafficSample] = []
    @Published var currentTraffic = TrafficSample(up: 0, down: 0)
    @Published var memoryInUse: Int64 = 0
    @Published var totalUpload: Int64 = 0
    @Published var totalDownload: Int64 = 0
    @Published var logs: [LogEntry] = []
    @Published var connections: [Connection] = []

    // Preferred URL for latency tests.
    @AppStorageBacked("testURL", default: "https://www.gstatic.com/generate_204")
    var testURL: String

    private var streamTasks: [Task<Void, Never>] = []
    private let maxTrafficSamples = 120
    private let maxLogLines = 500

    init() {
        let profiles = ProfileManager()
        self.profiles = profiles
        self.core = MihomoManager(workingDirectory: profiles.runDirectory)
        self.api = ClashAPIClient(endpoint: endpoint)
    }

    // MARK: - Lifecycle

    /// Boots the core with the active profile and connects to its controller.
    func startCore() async {
        do {
            let configURL = try profiles.materializeActiveConfig()
            try core.start(configPath: configURL.path)
            // Give the core a moment to bind its controller before probing.
            try await Task.sleep(nanoseconds: 700_000_000)
            await connectController()
        } catch {
            report(error)
        }
    }

    func stopCore() {
        teardownStreams()
        core.stop()
        isControllerReachable = false
    }

    func switchProfile(to id: UUID) async {
        profiles.activeProfileID = id
        guard core.isRunning else { return }
        do {
            let configURL = try profiles.materializeActiveConfig()
            try core.restart(configPath: configURL.path)
            try await Task.sleep(nanoseconds: 700_000_000)
            await connectController()
        } catch {
            report(error)
        }
    }

    // MARK: - Controller

    func connectController() async {
        await api.update(endpoint: endpoint)
        do {
            _ = try await api.version()
            isControllerReachable = true
            await refreshConfig()
            await refreshProxies()
            startStreams()
        } catch {
            isControllerReachable = false
            report(error)
        }
    }

    func refreshConfig() async {
        do { config = try await api.configs() }
        catch { report(error) }
    }

    func refreshProxies() async {
        do { proxies = try await api.proxies() }
        catch { report(error) }
    }

    func setMode(_ mode: ClashConfig.Mode) async {
        do {
            try await api.setMode(mode)
            await refreshConfig()
        } catch { report(error) }
    }

    // MARK: - Proxy selection & testing

    func select(group: String, member: String) async {
        do {
            try await api.select(group: group, member: member)
            await refreshProxies()
        } catch { report(error) }
    }

    func testDelay(for proxy: String) async -> Int? {
        do { return try await api.delay(for: proxy, testURL: testURL) }
        catch { return nil }
    }

    func testGroup(_ group: String) async {
        _ = try? await api.groupDelay(for: group, testURL: testURL)
        await refreshProxies()
    }

    // MARK: - System proxy

    func setSystemProxy(_ enabled: Bool) {
        do {
            if enabled {
                let port = config?.mixedPort ?? config?.port ?? 7890
                try SystemProxy.enable(.init(httpPort: port, socksPort: config?.socksPort))
            } else {
                try SystemProxy.disable()
            }
            systemProxyEnabled = enabled
        } catch {
            report(error)
        }
    }

    // MARK: - Connections

    func closeConnection(_ id: String) async {
        try? await api.closeConnection(id: id)
    }

    func closeAllConnections() async {
        try? await api.closeAllConnections()
    }

    // MARK: - Streams

    private func startStreams() {
        teardownStreams()
        let stream = StreamClient(endpoint: endpoint)

        streamTasks.append(Task { [weak self] in
            guard let self else { return }
            do {
                for try await sample in stream.stream(path: "traffic", as: TrafficSample.self) {
                    await self.ingest(traffic: sample)
                }
            } catch { /* socket closed */ }
        })

        streamTasks.append(Task { [weak self] in
            guard let self else { return }
            do {
                for try await entry in stream.stream(path: "logs", as: LogEntry.self) {
                    await self.ingest(log: entry)
                }
            } catch {}
        })

        streamTasks.append(Task { [weak self] in
            guard let self else { return }
            do {
                for try await snapshot in stream.stream(path: "connections", as: ConnectionsSnapshot.self) {
                    await self.ingest(connections: snapshot)
                }
            } catch {}
        })
    }

    private func teardownStreams() {
        streamTasks.forEach { $0.cancel() }
        streamTasks.removeAll()
    }

    private func ingest(traffic: TrafficSample) {
        currentTraffic = traffic
        trafficHistory.append(traffic)
        if trafficHistory.count > maxTrafficSamples {
            trafficHistory.removeFirst(trafficHistory.count - maxTrafficSamples)
        }
    }

    private func ingest(log: LogEntry) {
        logs.append(log)
        if logs.count > maxLogLines {
            logs.removeFirst(logs.count - maxLogLines)
        }
    }

    private func ingest(connections snapshot: ConnectionsSnapshot) {
        connections = snapshot.connections
        totalUpload = snapshot.uploadTotal
        totalDownload = snapshot.downloadTotal
        if let memory = snapshot.memory { memoryInUse = memory }
    }

    // MARK: - Errors

    private func report(_ error: Error) {
        lastError = error.localizedDescription
    }
}
