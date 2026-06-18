import SwiftUI

/// Manage configuration profiles: import subscriptions, activate, update, and
/// delete.
struct ProfilesView: View {
    @EnvironmentObject private var state: AppState
    @State private var showingImport = false

    private var profiles: [Profile] { state.profiles.profiles }

    var body: some View {
        Group {
            if profiles.isEmpty {
                ContentUnavailablePlaceholder(
                    title: "No profiles",
                    subtitle: "Import a subscription URL to get started.",
                    systemImage: "doc.on.doc"
                )
            } else {
                List {
                    ForEach(profiles) { profile in
                        ProfileRow(profile: profile)
                    }
                }
            }
        }
        .toolbar {
            Button { showingImport = true } label: {
                Label("Import", systemImage: "plus")
            }
        }
        .sheet(isPresented: $showingImport) {
            ImportProfileSheet()
        }
    }
}

struct ProfileRow: View {
    @EnvironmentObject private var state: AppState
    let profile: Profile
    @State private var isUpdating = false

    private var isActive: Bool { state.profiles.activeProfileID == profile.id }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: isActive ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(isActive ? Color.accentColor : .secondary)
                .onTapGesture { Task { await state.switchProfile(to: profile.id) } }

            VStack(alignment: .leading, spacing: 3) {
                Text(profile.name).font(.headline)
                if let usage = profile.usage {
                    UsageBar(usage: usage)
                }
                Text("Updated \(profile.updatedAt.shortRelative)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if profile.source == .remote {
                Button {
                    Task {
                        isUpdating = true
                        try? await state.profiles.update(profile)
                        isUpdating = false
                    }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.borderless)
                .disabled(isUpdating)
            }

            Button(role: .destructive) {
                state.profiles.delete(profile)
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.borderless)
        }
        .padding(.vertical, 4)
    }
}

struct UsageBar: View {
    let usage: SubscriptionUsage

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            ProgressView(value: usage.fraction)
                .frame(maxWidth: 240)
            HStack {
                Text("\(ByteFormatter.string(usage.used)) / \(ByteFormatter.string(usage.total))")
                if let expire = usage.expire {
                    Text("· expires \(expire.formatted(date: .abbreviated, time: .omitted))")
                }
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
    }
}

struct ImportProfileSheet: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var url = ""
    @State private var isImporting = false
    @State private var errorText: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Import Subscription").font(.title2.bold())

            TextField("Name", text: $name)
            TextField("Subscription URL", text: $url)
                .textFieldStyle(.roundedBorder)

            if let errorText {
                Text(errorText).font(.caption).foregroundStyle(.red)
            }

            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Import") { performImport() }
                    .keyboardShortcut(.defaultAction)
                    .disabled(url.isEmpty || isImporting)
            }
        }
        .padding(20)
        .frame(width: 420)
    }

    private func performImport() {
        isImporting = true
        errorText = nil
        Task {
            do {
                let displayName = name.isEmpty ? "Subscription" : name
                try await state.profiles.importRemoteProfile(name: displayName, url: url)
                dismiss()
            } catch {
                errorText = error.localizedDescription
            }
            isImporting = false
        }
    }
}
