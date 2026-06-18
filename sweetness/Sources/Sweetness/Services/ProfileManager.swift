import Foundation

/// Persists profiles and their raw YAML on disk, and imports/updates remote
/// subscriptions. Storage layout:
///
///     <appSupport>/Sweetness/
///       profiles.json          // [Profile] index
///       profiles/<fileName>    // raw YAML per profile
///       run/config.yaml        // the config currently fed to the core
@MainActor
final class ProfileManager: ObservableObject {
    @Published private(set) var profiles: [Profile] = []
    @Published var activeProfileID: UUID?

    private let fileManager = FileManager.default
    private let session: URLSession

    let rootDirectory: URL
    var profilesDirectory: URL { rootDirectory.appendingPathComponent("profiles") }
    var runDirectory: URL { rootDirectory.appendingPathComponent("run") }
    var indexURL: URL { rootDirectory.appendingPathComponent("profiles.json") }

    /// The config file path handed to the Mihomo core.
    var activeConfigURL: URL { runDirectory.appendingPathComponent("config.yaml") }

    init(rootDirectory: URL? = nil, session: URLSession = .shared) {
        self.session = session
        self.rootDirectory = rootDirectory ?? Self.defaultRootDirectory()
        createDirectories()
        load()
    }

    static func defaultRootDirectory() -> URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("Sweetness", isDirectory: true)
    }

    private func createDirectories() {
        for dir in [rootDirectory, profilesDirectory, runDirectory] {
            try? fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
        }
    }

    // MARK: - Persistence

    func load() {
        guard let data = try? Data(contentsOf: indexURL),
              let stored = try? JSONDecoder.iso.decode([Profile].self, from: data) else {
            profiles = []
            return
        }
        profiles = stored
        if activeProfileID == nil { activeProfileID = profiles.first?.id }
    }

    private func persistIndex() {
        guard let data = try? JSONEncoder.iso.encode(profiles) else { return }
        try? data.write(to: indexURL, options: .atomic)
    }

    func rawConfig(for profile: Profile) throws -> String {
        let url = profilesDirectory.appendingPathComponent(profile.fileName)
        return try String(contentsOf: url, encoding: .utf8)
    }

    // MARK: - Mutations

    func addLocalProfile(name: String, yaml: String) throws {
        let fileName = "\(UUID().uuidString).yaml"
        try yaml.write(to: profilesDirectory.appendingPathComponent(fileName),
                       atomically: true, encoding: .utf8)
        var profile = Profile(name: name, source: .local, fileName: fileName)
        profile.updatedAt = Date()
        profiles.append(profile)
        if activeProfileID == nil { activeProfileID = profile.id }
        persistIndex()
    }

    /// Imports a profile from a subscription URL, downloading and storing its
    /// YAML and parsing the `Subscription-Userinfo` header when present.
    @discardableResult
    func importRemoteProfile(name: String, url: String,
                             updateInterval: TimeInterval? = nil) async throws -> Profile {
        let (yaml, usage) = try await fetchSubscription(url: url)
        let fileName = "\(UUID().uuidString).yaml"
        try yaml.write(to: profilesDirectory.appendingPathComponent(fileName),
                       atomically: true, encoding: .utf8)

        let profile = Profile(
            name: name, source: .remote, url: url,
            fileName: fileName, updateInterval: updateInterval, usage: usage
        )
        profiles.append(profile)
        if activeProfileID == nil { activeProfileID = profile.id }
        persistIndex()
        return profile
    }

    /// Re-downloads a remote profile in place.
    func update(_ profile: Profile) async throws {
        guard profile.source == .remote, let url = profile.url else { return }
        let (yaml, usage) = try await fetchSubscription(url: url)
        try yaml.write(to: profilesDirectory.appendingPathComponent(profile.fileName),
                       atomically: true, encoding: .utf8)
        if let index = profiles.firstIndex(where: { $0.id == profile.id }) {
            profiles[index].usage = usage
            profiles[index].updatedAt = Date()
            persistIndex()
        }
    }

    func delete(_ profile: Profile) {
        try? fileManager.removeItem(at: profilesDirectory.appendingPathComponent(profile.fileName))
        profiles.removeAll { $0.id == profile.id }
        if activeProfileID == profile.id { activeProfileID = profiles.first?.id }
        persistIndex()
    }

    func rename(_ profile: Profile, to name: String) {
        guard let index = profiles.firstIndex(where: { $0.id == profile.id }) else { return }
        profiles[index].name = name
        persistIndex()
    }

    /// Copies the active profile's YAML into the core's run directory so it can
    /// be loaded. Returns the path to hand to the core.
    @discardableResult
    func materializeActiveConfig() throws -> URL {
        guard let id = activeProfileID,
              let profile = profiles.first(where: { $0.id == id }) else {
            throw NSError(domain: "ProfileManager", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "No active profile selected."])
        }
        let yaml = try rawConfig(for: profile)
        try yaml.write(to: activeConfigURL, atomically: true, encoding: .utf8)
        return activeConfigURL
    }

    // MARK: - Networking

    private func fetchSubscription(url: String) async throws -> (String, SubscriptionUsage?) {
        guard let requestURL = URL(string: url) else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: requestURL)
        // Many providers gate the clash config behind a UA check.
        request.setValue("clash-verge/sweetness", forHTTPHeaderField: "User-Agent")

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse,
              (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        guard let yaml = String(data: data, encoding: .utf8) else {
            throw URLError(.cannotDecodeContentData)
        }
        let usage = (http.value(forHTTPHeaderField: "Subscription-Userinfo"))
            .flatMap(SubscriptionUsage.parse)
        return (yaml, usage)
    }
}

extension JSONDecoder {
    static var iso: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

extension JSONEncoder {
    static var iso: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }
}
