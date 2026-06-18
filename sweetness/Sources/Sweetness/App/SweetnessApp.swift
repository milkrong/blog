import SwiftUI

@main
struct SweetnessApp: App {
    @StateObject private var state = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(state)
                .frame(minWidth: 900, minHeight: 600)
                .task { await state.connectController() }
        }
        .windowStyle(.titleBar)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }

        Settings {
            SettingsView()
                .environmentObject(state)
                .frame(width: 480, height: 420)
        }
    }
}
