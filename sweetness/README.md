# Sweetness 🍬

A native macOS proxy client built with **Swift + SwiftUI**, designed as a
spiritual counterpart to [Clash Verge](https://github.com/clash-verge-rev/clash-verge-rev).

Where Clash Verge is built on Tauri (Rust + a web front-end), Sweetness drives
the same [Mihomo (Clash.Meta)](https://github.com/MetaCubeX/mihomo) core from a
fully native AppKit/SwiftUI app — no web view, no Electron, no JavaScript.

> **Status: foundational scaffold.** The architecture, core/controller plumbing,
> data models, subscription handling and the full UI shell are in place and
> unit-tested. Bundling/auto-downloading the Mihomo core binary, a privileged
> helper for system-proxy/TUN, and YAML profile editing are the next milestones
> (see the roadmap below).

## Why native?

| | Clash Verge | Sweetness |
|---|---|---|
| UI stack | Tauri + React | SwiftUI / AppKit |
| Language | Rust + TS | Swift |
| Footprint | WebView runtime | Native, lightweight |
| Proxy core | Mihomo | Mihomo (same) |

## Architecture

```
Sources/Sweetness/
├── App/
│   ├── SweetnessApp.swift      App entry point + scenes
│   └── AppState.swift          Root ObservableObject wiring everything together
├── Core/
│   ├── MihomoManager.swift     Launches/stops the bundled core process
│   ├── ClashAPIClient.swift    Async REST client for the external controller
│   ├── StreamClient.swift      WebSocket streams (traffic/logs/connections)
│   └── SystemProxy.swift       macOS system-proxy toggling via networksetup
├── Models/                     Codable models mirroring the controller API
├── Services/
│   └── ProfileManager.swift    Subscription import/update + on-disk storage
├── Views/                      SwiftUI screens (Dashboard, Proxies, Profiles,
│                               Connections, Logs, Settings)
└── Utilities/                  Formatters & helpers
```

The app talks to the core exclusively through Mihomo's
[external controller API](https://wiki.metacubex.one/en/api/), exactly as Clash
Verge does. That keeps the GUI decoupled from the core and makes it trivial to
point Sweetness at an already-running core during development.

### Data flow

1. `ProfileManager` imports a subscription, stores its YAML, and materializes the
   active profile into the core's run directory.
2. `MihomoManager` launches `mihomo -d <runDir> -f <config>`.
3. `ClashAPIClient` connects to the controller (`127.0.0.1:9090` by default),
   reads config/proxies, and issues selection/delay/mode commands.
4. `StreamClient` opens WebSockets for live traffic, logs and connections.
5. `AppState` aggregates all of the above into `@Published` state the SwiftUI
   views render.

## Features implemented

- ✅ Sidebar navigation shell (Dashboard / Proxies / Profiles / Connections / Logs / Settings)
- ✅ Mihomo core process lifecycle management
- ✅ Full async REST client (version, configs, proxies, selection, delay, connections)
- ✅ Live traffic / logs / connections WebSocket streaming
- ✅ Dashboard with throughput sparkline, totals, mode switch, system-proxy toggle
- ✅ Proxy group browsing, node selection, per-node & per-group latency tests
- ✅ Subscription import/update with `Subscription-Userinfo` quota parsing
- ✅ macOS system-proxy enable/disable via `networksetup`
- ✅ Settings for controller endpoint + latency test URL
- ✅ Unit tests for the parsing/model layer

## Roadmap

- [ ] Bundle & auto-update the Mihomo core binary + GeoIP/GeoSite databases
- [ ] Privileged helper (SMAppService) for TUN mode and sandbox-safe proxy edits
- [ ] In-app YAML profile editor with validation
- [ ] Rules view & per-rule provider management
- [ ] Profile merge/override scripts (Clash Verge "Merge"/"Script" parity)
- [ ] Menu-bar extra with quick mode/proxy switching
- [ ] Launch-at-login, auto-connect, hotkeys
- [ ] App icon, packaging, notarization & DMG release

## Building

Requires macOS 13+ and the Swift 5.9 toolchain (Xcode 15+).

```bash
cd sweetness

# Run the test suite (model/parsing layer — no GUI needed)
swift test

# Build & run the app
swift run Sweetness
```

To drive a core by hand while developing the UI, start Mihomo separately and
point Settings → External Controller at it:

```bash
mihomo -d ./Resources -f ./Resources/config.sample.yaml
```

## License

MIT — see the repository root.
