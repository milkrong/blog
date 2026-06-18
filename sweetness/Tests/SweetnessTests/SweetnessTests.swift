import XCTest
@testable import Sweetness

final class SweetnessTests: XCTestCase {
    func testSubscriptionUsageParsing() throws {
        let header = "upload=100; download=900; total=10000; expire=1700000000"
        let usage = try XCTUnwrap(SubscriptionUsage.parse(header: header))

        XCTAssertEqual(usage.upload, 100)
        XCTAssertEqual(usage.download, 900)
        XCTAssertEqual(usage.total, 10000)
        XCTAssertEqual(usage.used, 1000)
        XCTAssertEqual(usage.remaining, 9000)
        XCTAssertEqual(usage.fraction, 0.1, accuracy: 0.0001)
        XCTAssertEqual(usage.expire, Date(timeIntervalSince1970: 1_700_000_000))
    }

    func testSubscriptionUsageParsingMissingFieldsReturnsNil() {
        XCTAssertNil(SubscriptionUsage.parse(header: "upload=1; download=2"))
        XCTAssertNil(SubscriptionUsage.parse(header: "garbage"))
    }

    func testProxyGroupDetection() {
        let group = Proxy(name: "PROXY", type: "Selector", now: "A", all: ["A", "B"])
        let node = Proxy(name: "A", type: "ss")

        XCTAssertTrue(group.isGroup)
        XCTAssertTrue(group.isSelectable)
        XCTAssertFalse(node.isGroup)
    }

    func testProxyLatestDelayIgnoresZero() {
        var proxy = Proxy(name: "A", type: "ss")
        proxy.history = [DelayHistory(time: "t", delay: 0)]
        XCTAssertNil(proxy.latestDelay)

        proxy.history = [DelayHistory(time: "t", delay: 123)]
        XCTAssertEqual(proxy.latestDelay, 123)
    }

    func testProxiesResponseDecoding() throws {
        let json = """
        { "proxies": { "DIRECT": { "name": "DIRECT", "type": "Direct" } } }
        """.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(ProxiesResponse.self, from: json)
        XCTAssertEqual(decoded.proxies["DIRECT"]?.type, "Direct")
    }

    func testClashConfigModeDecoding() throws {
        let json = """
        { "mode": "rule", "mixed-port": 7890, "allow-lan": false }
        """.data(using: .utf8)!
        let config = try JSONDecoder().decode(ClashConfig.self, from: json)
        XCTAssertEqual(config.mode, .rule)
        XCTAssertEqual(config.mixedPort, 7890)
        XCTAssertEqual(config.allowLan, false)
    }
}
