import Foundation

/// Manages the lifecycle of the bundled Mihomo (Clash.Meta) core process:
/// locating the binary, launching it against a config + working directory,
/// streaming its stdout, and terminating it cleanly.
@MainActor
final class MihomoManager: ObservableObject {
    enum State: Equatable {
        case stopped
        case starting
        case running(pid: Int32)
        case failed(String)
    }

    @Published private(set) var state: State = .stopped
    @Published private(set) var recentOutput: [String] = []

    private var process: Process?
    private let maxOutputLines = 500

    /// Directory containing the `mihomo` binary. By default we look next to the
    /// app bundle's resources; a developer build falls back to a sibling
    /// `Cores` directory.
    var binaryURL: URL?

    /// The home directory passed to the core via `-d`. Holds the active config,
    /// GeoIP/GeoSite databases and the cache.
    let workingDirectory: URL

    init(workingDirectory: URL, binaryURL: URL? = nil) {
        self.workingDirectory = workingDirectory
        self.binaryURL = binaryURL ?? Self.defaultBinaryURL()
    }

    static func defaultBinaryURL() -> URL? {
        if let bundled = Bundle.main.url(forResource: "mihomo", withExtension: nil) {
            return bundled
        }
        let candidates = [
            "/usr/local/bin/mihomo",
            "/opt/homebrew/bin/mihomo"
        ]
        return candidates.first { FileManager.default.isExecutableFile(atPath: $0) }
            .map { URL(fileURLWithPath: $0) }
    }

    var isRunning: Bool {
        if case .running = state { return true }
        return false
    }

    func start(configPath: String) throws {
        guard !isRunning else { return }
        guard let binaryURL else {
            state = .failed("Mihomo core binary not found.")
            throw NSError(domain: "MihomoManager", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "Mihomo core binary not found."])
        }

        try FileManager.default.createDirectory(
            at: workingDirectory, withIntermediateDirectories: true)

        let process = Process()
        process.executableURL = binaryURL
        process.arguments = ["-d", workingDirectory.path, "-f", configPath]

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe
        pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            Task { @MainActor in self?.appendOutput(text) }
        }

        process.terminationHandler = { [weak self] proc in
            Task { @MainActor in
                if proc.terminationStatus == 0 {
                    self?.state = .stopped
                } else if self?.isRunning == true {
                    self?.state = .failed("Core exited with status \(proc.terminationStatus).")
                }
            }
        }

        state = .starting
        try process.run()
        self.process = process
        state = .running(pid: process.processIdentifier)
    }

    func stop() {
        guard let process, process.isRunning else {
            state = .stopped
            return
        }
        process.terminate()
        self.process = nil
        state = .stopped
    }

    /// Restarts the core; useful after switching profiles.
    func restart(configPath: String) throws {
        stop()
        try start(configPath: configPath)
    }

    private func appendOutput(_ text: String) {
        let lines = text.split(whereSeparator: \.isNewline).map(String.init)
        recentOutput.append(contentsOf: lines)
        if recentOutput.count > maxOutputLines {
            recentOutput.removeFirst(recentOutput.count - maxOutputLines)
        }
    }
}
