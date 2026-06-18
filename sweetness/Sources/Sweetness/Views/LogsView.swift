import SwiftUI

/// Streams core logs with level colouring and auto-scroll.
struct LogsView: View {
    @EnvironmentObject private var state: AppState
    @State private var autoScroll = true

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 2) {
                    ForEach(state.logs) { entry in
                        HStack(alignment: .top, spacing: 8) {
                            Text(entry.type.uppercased())
                                .font(.caption2.monospaced())
                                .foregroundStyle(color(for: entry.type))
                                .frame(width: 64, alignment: .leading)
                            Text(entry.payload)
                                .font(.caption.monospaced())
                                .textSelection(.enabled)
                        }
                        .id(entry.id)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(12)
            }
            .onChange(of: state.logs.count) { _ in
                if autoScroll, let last = state.logs.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
        .toolbar {
            Toggle("Auto-scroll", isOn: $autoScroll)
            Button {
                state.logs.removeAll()
            } label: {
                Label("Clear", systemImage: "trash")
            }
        }
    }

    private func color(for type: String) -> Color {
        switch type.lowercased() {
        case "error": return .red
        case "warning": return .orange
        case "info": return .blue
        case "debug": return .secondary
        default: return .primary
        }
    }
}
