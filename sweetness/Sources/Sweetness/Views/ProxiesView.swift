import SwiftUI

/// Lists proxy groups and their members, allowing selection and latency tests.
struct ProxiesView: View {
    @EnvironmentObject private var state: AppState

    private var groups: [Proxy] {
        state.proxies.values
            .filter { $0.isGroup }
            .sorted { $0.name < $1.name }
    }

    var body: some View {
        Group {
            if groups.isEmpty {
                ContentUnavailablePlaceholder(
                    title: "No proxies",
                    subtitle: "Start the core and select a profile to see proxy groups.",
                    systemImage: "globe"
                )
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(groups) { group in
                            ProxyGroupSection(group: group)
                        }
                    }
                    .padding(20)
                }
            }
        }
        .toolbar {
            Button {
                Task { await state.refreshProxies() }
            } label: {
                Image(systemName: "arrow.clockwise")
            }
        }
    }
}

struct ProxyGroupSection: View {
    @EnvironmentObject private var state: AppState
    let group: Proxy

    private var members: [Proxy] {
        (group.all ?? []).compactMap { state.proxies[$0] }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(group.name).font(.headline)
                Text(group.type)
                    .font(.caption)
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(.secondary.opacity(0.15), in: Capsule())
                Spacer()
                Button("Test") { Task { await state.testGroup(group.name) } }
                    .controlSize(.small)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 10)], spacing: 10) {
                ForEach(members) { member in
                    ProxyNodeCell(
                        member: member,
                        isSelected: group.now == member.name,
                        selectable: group.isSelectable
                    ) {
                        Task { await state.select(group: group.name, member: member.name) }
                    }
                }
            }
        }
    }
}

struct ProxyNodeCell: View {
    let member: Proxy
    let isSelected: Bool
    let selectable: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: { if selectable { onSelect() } }) {
            VStack(alignment: .leading, spacing: 4) {
                Text(member.name)
                    .font(.callout)
                    .lineLimit(1)
                HStack {
                    Text(member.type)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Spacer()
                    DelayBadge(delay: member.latestDelay)
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(isSelected ? Color.accentColor.opacity(0.18) : Color.secondary.opacity(0.07))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .strokeBorder(isSelected ? Color.accentColor : .clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }
}

struct DelayBadge: View {
    let delay: Int?

    var body: some View {
        if let delay {
            Text("\(delay) ms")
                .font(.caption2.monospacedDigit())
                .foregroundStyle(color(for: delay))
        } else {
            Text("—")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }

    private func color(for delay: Int) -> Color {
        switch delay {
        case ..<200: return .green
        case ..<500: return .yellow
        default: return .orange
        }
    }
}

struct ContentUnavailablePlaceholder: View {
    let title: String
    let subtitle: String
    let systemImage: String

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text(title).font(.title3.bold())
            Text(subtitle)
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}
