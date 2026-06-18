import SwiftUI

/// Sidebar-driven main window, mirroring Clash Verge's navigation.
struct RootView: View {
    @EnvironmentObject private var state: AppState
    @State private var selection: Panel? = .dashboard

    enum Panel: String, CaseIterable, Identifiable {
        case dashboard = "Dashboard"
        case proxies = "Proxies"
        case profiles = "Profiles"
        case connections = "Connections"
        case logs = "Logs"
        case settings = "Settings"

        var id: String { rawValue }

        var systemImage: String {
            switch self {
            case .dashboard: return "speedometer"
            case .proxies: return "globe"
            case .profiles: return "doc.on.doc"
            case .connections: return "link"
            case .logs: return "text.alignleft"
            case .settings: return "gearshape"
            }
        }
    }

    var body: some View {
        NavigationSplitView {
            List(Panel.allCases, selection: $selection) { panel in
                Label(panel.rawValue, systemImage: panel.systemImage)
                    .tag(panel)
            }
            .navigationSplitViewColumnWidth(min: 180, ideal: 200, max: 240)
            .safeAreaInset(edge: .bottom) {
                ControllerStatusBar()
                    .padding(8)
            }
        } detail: {
            detail
                .navigationTitle(selection?.rawValue ?? "Sweetness")
        }
    }

    @ViewBuilder
    private var detail: some View {
        switch selection ?? .dashboard {
        case .dashboard: DashboardView()
        case .proxies: ProxiesView()
        case .profiles: ProfilesView()
        case .connections: ConnectionsView()
        case .logs: LogsView()
        case .settings: SettingsView()
        }
    }
}

/// Compact reachability + core control affordance shown at the foot of the
/// sidebar.
struct ControllerStatusBar: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(state.isControllerReachable ? Color.green : Color.secondary)
                .frame(width: 8, height: 8)
            Text(state.isControllerReachable ? "Connected" : "Offline")
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            if state.core.isRunning {
                Button("Stop") { state.stopCore() }
                    .controlSize(.small)
            } else {
                Button("Start") { Task { await state.startCore() } }
                    .controlSize(.small)
            }
        }
    }
}
