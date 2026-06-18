import Foundation

/// A single sample from the `/traffic` WebSocket: instantaneous up/down rates
/// in bytes per second.
struct TrafficSample: Codable, Hashable, Identifiable {
    var up: Int64
    var down: Int64
    var timestamp: Date = Date()

    var id: Date { timestamp }

    private enum CodingKeys: String, CodingKey {
        case up, down
    }
}

/// A sample from the `/memory` WebSocket (Mihomo only).
struct MemorySample: Codable, Hashable {
    var inuse: Int64
    var oslimit: Int64
}

/// Cumulative connection totals reported by `/connections`.
struct ConnectionsSnapshot: Codable, Hashable {
    var downloadTotal: Int64
    var uploadTotal: Int64
    var connections: [Connection]
    var memory: Int64?
}

struct Connection: Codable, Hashable, Identifiable {
    var id: String
    var upload: Int64
    var download: Int64
    var start: String
    var chains: [String]
    var rule: String
    var rulePayload: String
    var metadata: ConnectionMetadata
}

struct ConnectionMetadata: Codable, Hashable {
    var network: String
    var type: String
    var sourceIP: String
    var destinationIP: String
    var sourcePort: String
    var destinationPort: String
    var host: String
    var process: String?

    var displayDestination: String {
        if !host.isEmpty { return host }
        return destinationIP
    }
}
