import SwiftUI

/// Controller endpoint, core paths, and behaviour preferences.
struct SettingsView: View {
    @EnvironmentObject private var state: AppState

    @State private var host = ""
    @State private var port = ""
    @State private var secret = ""
    @State private var testURL = ""

    var body: some View {
        Form {
            Section("External Controller") {
                TextField("Host", text: $host)
                TextField("Port", text: $port)
                SecureField("Secret", text: $secret)
                Button("Connect") { applyEndpoint() }
            }

            Section("Latency Test") {
                TextField("Test URL", text: $testURL)
            }

            Section("Core") {
                LabeledContent("Working directory",
                               value: state.profiles.runDirectory.path)
                LabeledContent("Core binary",
                               value: state.core.binaryURL?.path ?? "Not found")
                LabeledContent("Status", value: coreStatusText)
            }

            if let error = state.lastError {
                Section("Last Error") {
                    Text(error).foregroundStyle(.red).font(.caption)
                }
            }
        }
        .formStyle(.grouped)
        .padding()
        .onAppear(perform: loadCurrent)
    }

    private var coreStatusText: String {
        switch state.core.state {
        case .stopped: return "Stopped"
        case .starting: return "Starting…"
        case let .running(pid): return "Running (pid \(pid))"
        case let .failed(message): return "Failed: \(message)"
        }
    }

    private func loadCurrent() {
        host = state.endpoint.host
        port = String(state.endpoint.port)
        secret = state.endpoint.secret
        testURL = state.testURL
    }

    private func applyEndpoint() {
        state.endpoint.host = host
        state.endpoint.port = Int(port) ?? 9090
        state.endpoint.secret = secret
        state.testURL = testURL
        Task { await state.connectController() }
    }
}
