import Foundation

/// A configuration profile (subscription or local file) that Sweetness can
/// activate by feeding it into the Mihomo core. Mirrors the concept of a
/// "profile" in Clash Verge.
struct Profile: Identifiable, Codable, Hashable {
    enum Source: String, Codable {
        case remote   // imported from a subscription URL
        case local    // hand-authored / imported file
    }

    let id: UUID
    var name: String
    var source: Source

    /// Subscription URL, only meaningful for `.remote` profiles.
    var url: String?

    /// File name (relative to the profiles directory) holding the raw YAML.
    var fileName: String

    /// How often, in seconds, a remote profile should auto-update. `nil`
    /// disables auto-update.
    var updateInterval: TimeInterval?

    var createdAt: Date
    var updatedAt: Date

    /// Traffic usage info parsed from the `Subscription-Userinfo` response
    /// header, if the provider exposes it.
    var usage: SubscriptionUsage?

    init(
        id: UUID = UUID(),
        name: String,
        source: Source,
        url: String? = nil,
        fileName: String,
        updateInterval: TimeInterval? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        usage: SubscriptionUsage? = nil
    ) {
        self.id = id
        self.name = name
        self.source = source
        self.url = url
        self.fileName = fileName
        self.updateInterval = updateInterval
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.usage = usage
    }
}

/// Parsed contents of a `Subscription-Userinfo` header:
/// `upload=…; download=…; total=…; expire=…`.
struct SubscriptionUsage: Codable, Hashable {
    var upload: Int64
    var download: Int64
    var total: Int64
    var expire: Date?

    var used: Int64 { upload + download }
    var remaining: Int64 { max(total - used, 0) }

    var fraction: Double {
        guard total > 0 else { return 0 }
        return min(Double(used) / Double(total), 1)
    }

    /// Parses a raw header value into a `SubscriptionUsage`.
    static func parse(header: String) -> SubscriptionUsage? {
        var fields: [String: Int64] = [:]
        for pair in header.split(separator: ";") {
            let kv = pair.split(separator: "=", maxSplits: 1)
            guard kv.count == 2,
                  let value = Int64(kv[1].trimmingCharacters(in: .whitespaces)) else { continue }
            fields[kv[0].trimmingCharacters(in: .whitespaces)] = value
        }
        guard let upload = fields["upload"],
              let download = fields["download"],
              let total = fields["total"] else { return nil }

        let expire = fields["expire"].map { Date(timeIntervalSince1970: TimeInterval($0)) }
        return SubscriptionUsage(upload: upload, download: download, total: total, expire: expire)
    }
}
