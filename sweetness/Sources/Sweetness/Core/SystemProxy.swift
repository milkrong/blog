import Foundation

/// Toggles the macOS system HTTP/HTTPS/SOCKS proxy via `networksetup`, scoped
/// to every active network service. This is the same mechanism Clash Verge
/// uses for "system proxy" mode.
///
/// Note: `networksetup` requires the calling process to be permitted to modify
/// network settings; in a sandboxed/notarized app this is typically done
/// through a privileged helper. This implementation targets a non-sandboxed
/// build and documents the helper hand-off for later.
enum SystemProxy {
    struct Settings {
        var host: String = "127.0.0.1"
        var httpPort: Int
        var socksPort: Int?
        /// Hosts that should bypass the proxy.
        var bypass: [String] = [
            "127.0.0.1", "localhost", "*.local",
            "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"
        ]
    }

    /// Names of the network services that are currently enabled (Wi-Fi,
    /// Ethernet, …).
    static func activeNetworkServices() throws -> [String] {
        let output = try run("/usr/sbin/networksetup", ["-listallnetworkservices"])
        return output
            .split(separator: "\n")
            .dropFirst() // first line is an informational header
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty && !$0.hasPrefix("*") }
    }

    static func enable(_ settings: Settings) throws {
        for service in try activeNetworkServices() {
            try run("/usr/sbin/networksetup",
                    ["-setwebproxy", service, settings.host, String(settings.httpPort)])
            try run("/usr/sbin/networksetup",
                    ["-setsecurewebproxy", service, settings.host, String(settings.httpPort)])
            if let socks = settings.socksPort {
                try run("/usr/sbin/networksetup",
                        ["-setsocksfirewallproxy", service, settings.host, String(socks)])
            }
            try run("/usr/sbin/networksetup",
                    ["-setproxybypassdomains", service] + settings.bypass)
            try run("/usr/sbin/networksetup", ["-setwebproxystate", service, "on"])
            try run("/usr/sbin/networksetup", ["-setsecurewebproxystate", service, "on"])
            if settings.socksPort != nil {
                try run("/usr/sbin/networksetup", ["-setsocksfirewallproxystate", service, "on"])
            }
        }
    }

    static func disable() throws {
        for service in try activeNetworkServices() {
            try run("/usr/sbin/networksetup", ["-setwebproxystate", service, "off"])
            try run("/usr/sbin/networksetup", ["-setsecurewebproxystate", service, "off"])
            try run("/usr/sbin/networksetup", ["-setsocksfirewallproxystate", service, "off"])
        }
    }

    @discardableResult
    private static func run(_ launchPath: String, _ arguments: [String]) throws -> String {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: launchPath)
        process.arguments = arguments

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        try process.run()
        process.waitUntilExit()

        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = String(data: data, encoding: .utf8) ?? ""

        guard process.terminationStatus == 0 else {
            throw NSError(
                domain: "SystemProxy",
                code: Int(process.terminationStatus),
                userInfo: [NSLocalizedDescriptionKey: output]
            )
        }
        return output
    }
}
