import SwiftUI

/// Live overview: traffic rate, totals, mode switch, and a sparkline of recent
/// throughput.
struct DashboardView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                modePicker

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 200), spacing: 16)], spacing: 16) {
                    StatCard(title: "Upload", value: ByteFormatter.rate(state.currentTraffic.up),
                             systemImage: "arrow.up.circle", tint: .orange)
                    StatCard(title: "Download", value: ByteFormatter.rate(state.currentTraffic.down),
                             systemImage: "arrow.down.circle", tint: .blue)
                    StatCard(title: "Uploaded", value: ByteFormatter.string(state.totalUpload),
                             systemImage: "arrow.up.to.line", tint: .orange)
                    StatCard(title: "Downloaded", value: ByteFormatter.string(state.totalDownload),
                             systemImage: "arrow.down.to.line", tint: .blue)
                    StatCard(title: "Connections", value: "\(state.connections.count)",
                             systemImage: "link", tint: .green)
                    StatCard(title: "Memory", value: ByteFormatter.string(state.memoryInUse),
                             systemImage: "memorychip", tint: .purple)
                }

                TrafficChart(samples: state.trafficHistory)
                    .frame(height: 160)

                Toggle("System Proxy", isOn: Binding(
                    get: { state.systemProxyEnabled },
                    set: { state.setSystemProxy($0) }
                ))
                .toggleStyle(.switch)
            }
            .padding(20)
        }
    }

    private var modePicker: some View {
        Picker("Mode", selection: Binding(
            get: { state.config?.mode ?? .rule },
            set: { mode in Task { await state.setMode(mode) } }
        )) {
            ForEach(ClashConfig.Mode.allCases) { mode in
                Text(mode.displayName).tag(mode)
            }
        }
        .pickerStyle(.segmented)
        .disabled(!state.isControllerReachable)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let systemImage: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: systemImage)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.monospacedDigit())
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(tint.opacity(0.10), in: RoundedRectangle(cornerRadius: 12))
    }
}

/// Minimal dependency-free throughput sparkline rendered with a `Path`.
struct TrafficChart: View {
    let samples: [TrafficSample]

    var body: some View {
        GeometryReader { geo in
            let maxValue = max(samples.map { max($0.up, $0.down) }.max() ?? 1, 1)
            ZStack {
                line(for: \.down, in: geo.size, max: maxValue, color: .blue)
                line(for: \.up, in: geo.size, max: maxValue, color: .orange)
            }
            .background(Color.secondary.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
        }
    }

    private func line(for key: KeyPath<TrafficSample, Int64>,
                      in size: CGSize, max maxValue: Int64, color: Color) -> some View {
        Path { path in
            guard samples.count > 1 else { return }
            let stepX = size.width / CGFloat(samples.count - 1)
            for (index, sample) in samples.enumerated() {
                let x = CGFloat(index) * stepX
                let ratio = CGFloat(sample[keyPath: key]) / CGFloat(maxValue)
                let y = size.height - ratio * size.height
                if index == 0 { path.move(to: CGPoint(x: x, y: y)) }
                else { path.addLine(to: CGPoint(x: x, y: y)) }
            }
        }
        .stroke(color, style: StrokeStyle(lineWidth: 1.5, lineJoin: .round))
    }
}
