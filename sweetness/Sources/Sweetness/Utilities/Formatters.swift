import Foundation

enum ByteFormatter {
    private static let formatter: ByteCountFormatter = {
        let f = ByteCountFormatter()
        f.countStyle = .binary
        f.allowsNonnumericFormatting = false
        return f
    }()

    /// Human-readable size, e.g. "1.2 MB".
    static func string(_ bytes: Int64) -> String {
        formatter.string(fromByteCount: bytes)
    }

    /// Human-readable rate, e.g. "1.2 MB/s".
    static func rate(_ bytesPerSecond: Int64) -> String {
        string(bytesPerSecond) + "/s"
    }
}

extension Date {
    /// Short relative description like "3m ago".
    var shortRelative: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}
