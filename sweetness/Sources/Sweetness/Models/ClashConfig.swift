import Foundation

/// The mutable runtime configuration exposed by the core's `/configs`
/// endpoint. Only the fields Sweetness reads or writes are modelled.
struct ClashConfig: Codable, Hashable {
    enum Mode: String, Codable, CaseIterable, Identifiable {
        case rule
        case global
        case direct

        var id: String { rawValue }

        var displayName: String {
            switch self {
            case .rule: return "Rule"
            case .global: return "Global"
            case .direct: return "Direct"
            }
        }
    }

    enum LogLevel: String, Codable, CaseIterable, Identifiable {
        case silent
        case error
        case warning
        case info
        case debug

        var id: String { rawValue }
    }

    var port: Int?
    var socksPort: Int?
    var mixedPort: Int?
    var allowLan: Bool?
    var mode: Mode
    var logLevel: LogLevel?
    var tun: TunConfig?

    private enum CodingKeys: String, CodingKey {
        case port
        case socksPort = "socks-port"
        case mixedPort = "mixed-port"
        case allowLan = "allow-lan"
        case mode
        case logLevel = "log-level"
        case tun
    }
}

struct TunConfig: Codable, Hashable {
    var enable: Bool
    var stack: String?
    var device: String?
}

/// A single line from the `/logs` WebSocket.
struct LogEntry: Codable, Hashable, Identifiable {
    var type: String
    var payload: String
    let id = UUID()
    let timestamp = Date()

    private enum CodingKeys: String, CodingKey {
        case type, payload
    }
}
