import SwiftUI

/// Live table of active connections with the ability to close them.
struct ConnectionsView: View {
    @EnvironmentObject private var state: AppState
    @State private var filter = ""

    private var filtered: [Connection] {
        guard !filter.isEmpty else { return state.connections }
        return state.connections.filter {
            $0.metadata.displayDestination.localizedCaseInsensitiveContains(filter)
                || ($0.metadata.process?.localizedCaseInsensitiveContains(filter) ?? false)
        }
    }

    var body: some View {
        Group {
            if state.connections.isEmpty {
                ContentUnavailablePlaceholder(
                    title: "No active connections",
                    subtitle: "Traffic flowing through the core will appear here.",
                    systemImage: "link"
                )
            } else {
                Table(filtered) {
                    TableColumn("Host") { Text($0.metadata.displayDestination) }
                    TableColumn("Network") { Text($0.metadata.network.uppercased()) }
                    TableColumn("Chains") { Text($0.chains.reversed().joined(separator: " → ")) }
                    TableColumn("Rule") { Text($0.rule) }
                    TableColumn("Up") { Text(ByteFormatter.string($0.upload)) }
                    TableColumn("Down") { Text(ByteFormatter.string($0.download)) }
                    TableColumn("") { conn in
                        Button {
                            Task { await state.closeConnection(conn.id) }
                        } label: {
                            Image(systemName: "xmark.circle")
                        }
                        .buttonStyle(.borderless)
                    }
                }
            }
        }
        .searchable(text: $filter, placement: .toolbar, prompt: "Filter by host or process")
        .toolbar {
            Button(role: .destructive) {
                Task { await state.closeAllConnections() }
            } label: {
                Label("Close All", systemImage: "xmark.octagon")
            }
        }
    }
}
