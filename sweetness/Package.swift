// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Sweetness",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "Sweetness", targets: ["Sweetness"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "Sweetness",
            path: "Sources/Sweetness"
        ),
        .testTarget(
            name: "SweetnessTests",
            dependencies: ["Sweetness"],
            path: "Tests/SweetnessTests"
        )
    ]
)
