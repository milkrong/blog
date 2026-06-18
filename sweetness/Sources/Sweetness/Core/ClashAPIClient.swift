import Foundation

/// Connection details for the Mihomo/Clash external controller (RESTful API).
struct ControllerEndpoint: Hashable {
    var host: String = "127.0.0.1"
    var port: Int = 9090
    var secret: String = ""
    var useTLS: Bool = false

    var baseURL: URL {
        var components = URLComponents()
        components.scheme = useTLS ? "https" : "http"
        components.host = host
        components.port = port
        return components.url!
    }

    var webSocketScheme: String { useTLS ? "wss" : "ws" }
}

enum ClashAPIError: Error, LocalizedError {
    case invalidResponse
    case http(status: Int, body: String)
    case decoding(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "The controller returned an invalid response."
        case let .http(status, body):
            return "Controller error \(status): \(body)"
        case let .decoding(error):
            return "Failed to decode controller response: \(error.localizedDescription)"
        }
    }
}

/// Thin async client over the Mihomo/Clash external controller API.
///
/// Reference: https://wiki.metacubex.one/en/api/
actor ClashAPIClient {
    private var endpoint: ControllerEndpoint
    private let session: URLSession

    init(endpoint: ControllerEndpoint = ControllerEndpoint(),
         session: URLSession = .shared) {
        self.endpoint = endpoint
        self.session = session
    }

    func update(endpoint: ControllerEndpoint) {
        self.endpoint = endpoint
    }

    var currentEndpoint: ControllerEndpoint { endpoint }

    // MARK: - Requests

    private func request(
        _ path: String,
        method: String = "GET",
        query: [URLQueryItem] = [],
        body: Data? = nil
    ) -> URLRequest {
        var components = URLComponents(
            url: endpoint.baseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        )!
        if !query.isEmpty { components.queryItems = query }

        var request = URLRequest(url: components.url!)
        request.httpMethod = method
        request.httpBody = body
        if body != nil {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if !endpoint.secret.isEmpty {
            request.setValue("Bearer \(endpoint.secret)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    private func send<T: Decodable>(_ request: URLRequest, as type: T.Type) async throws -> T {
        let (data, response) = try await session.data(for: request)
        try Self.validate(response, data: data)
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw ClashAPIError.decoding(error)
        }
    }

    @discardableResult
    private func send(_ request: URLRequest) async throws -> Data {
        let (data, response) = try await session.data(for: request)
        try Self.validate(response, data: data)
        return data
    }

    private static func validate(_ response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else {
            throw ClashAPIError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            throw ClashAPIError.http(
                status: http.statusCode,
                body: String(data: data, encoding: .utf8) ?? ""
            )
        }
    }

    // MARK: - Health

    /// Returns the controller version, useful as a connectivity probe.
    func version() async throws -> String {
        struct VersionResponse: Decodable { let version: String }
        return try await send(request("version"), as: VersionResponse.self).version
    }

    // MARK: - Config

    func configs() async throws -> ClashConfig {
        try await send(request("configs"), as: ClashConfig.self)
    }

    /// Patches a subset of the runtime config (mode, ports, allow-lan, …).
    func patchConfig(_ patch: [String: Any]) async throws {
        let body = try JSONSerialization.data(withJSONObject: patch)
        try await send(request("configs", method: "PATCH", body: body))
    }

    func setMode(_ mode: ClashConfig.Mode) async throws {
        try await patchConfig(["mode": mode.rawValue])
    }

    /// Tells the core to reload a config file from disk.
    func reloadConfig(path: String) async throws {
        let body = try JSONSerialization.data(withJSONObject: ["path": path])
        try await send(request("configs", method: "PUT", body: body))
    }

    // MARK: - Proxies

    func proxies() async throws -> [String: Proxy] {
        try await send(request("proxies"), as: ProxiesResponse.self).proxies
    }

    /// Selects `name` as the active member of selector `group`.
    func select(group: String, member name: String) async throws {
        let body = try JSONSerialization.data(withJSONObject: ["name": name])
        let path = "proxies/\(group.addingPathPercentEncoding)"
        try await send(request(path, method: "PUT", body: body))
    }

    /// Measures the delay for a single proxy against `testURL`.
    func delay(for proxy: String, testURL: String, timeout: Int = 5000) async throws -> Int {
        let query = [
            URLQueryItem(name: "url", value: testURL),
            URLQueryItem(name: "timeout", value: String(timeout))
        ]
        let path = "proxies/\(proxy.addingPathPercentEncoding)/delay"
        return try await send(request(path, query: query), as: DelayResponse.self).delay
    }

    /// Measures delay for every member of a group in one call (Mihomo).
    func groupDelay(for group: String, testURL: String, timeout: Int = 5000) async throws -> [String: Int] {
        let query = [
            URLQueryItem(name: "url", value: testURL),
            URLQueryItem(name: "timeout", value: String(timeout))
        ]
        let path = "group/\(group.addingPathPercentEncoding)/delay"
        return try await send(request(path, query: query), as: [String: Int].self)
    }

    // MARK: - Connections

    func connections() async throws -> ConnectionsSnapshot {
        try await send(request("connections"), as: ConnectionsSnapshot.self)
    }

    func closeConnection(id: String) async throws {
        try await send(request("connections/\(id)", method: "DELETE"))
    }

    func closeAllConnections() async throws {
        try await send(request("connections", method: "DELETE"))
    }
}

private extension String {
    var addingPathPercentEncoding: String {
        addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? self
    }
}
