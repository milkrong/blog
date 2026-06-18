import Foundation

/// A lightweight `UserDefaults`-backed property wrapper usable outside of
/// SwiftUI views (e.g. inside an `ObservableObject`). Unlike `@AppStorage`,
/// it does not publish changes, so use it for settings read on demand.
@propertyWrapper
struct AppStorageBacked<Value> {
    let key: String
    let defaultValue: Value
    let store: UserDefaults

    init(_ key: String, default defaultValue: Value, store: UserDefaults = .standard) {
        self.key = key
        self.defaultValue = defaultValue
        self.store = store
    }

    var wrappedValue: Value {
        get { store.object(forKey: key) as? Value ?? defaultValue }
        set { store.set(newValue, forKey: key) }
    }
}
