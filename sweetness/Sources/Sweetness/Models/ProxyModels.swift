import Foundation

/// A single proxy node or proxy group as reported by the Mihomo/Clash
/// `GET /proxies` endpoint.
struct Proxy: Identifiable, Codable, Hashable {
    var name: String
    var type: String

    /// For selector / url-test groups: the currently selected member.
    var now: String?

    /// For groups: the names of member proxies.
    var all: [String]?

    /// Latency history (last entries first is provider-dependent).
    var history: [DelayHistory]?

    /// Whether the core considers this node usable.
    var alive: Bool?

    var id: String { name }

    /// Latest measured delay in milliseconds, `nil` if untested or timed out.
    var latestDelay: Int? {
        guard let delay = history?.last?.delay, delay > 0 else { return nil }
        return delay
    }

    /// Groups are selectable containers (Selector, URLTest, Fallback, …).
    var isGroup: Bool { all != nil }

    var isSelectable: Bool {
        type == "Selector" || type == "Fallback" || type == "LoadBalance"
    }
}

struct DelayHistory: Codable, Hashable {
    var time: String
    var delay: Int
}

/// Wrapper for `GET /proxies` which returns `{ "proxies": { name: Proxy } }`.
struct ProxiesResponse: Codable {
    var proxies: [String: Proxy]
}

/// Response from a delay test: `{ "delay": 123 }`.
struct DelayResponse: Codable {
    var delay: Int
}
