// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "JPETranslator",
    platforms: [
        .iOS(.v14)
    ],
    products: [
        .library(
            name: "JPETranslator",
            targets: ["JPETranslator"]
        )
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
    ],
    targets: [
        .target(
            name: "JPETranslator",
            dependencies: [],
            path: ".",
            sources: [
                "AppDelegate.swift",
                "SceneDelegate.swift",
                "ViewController.swift",
                "Models/",
                "Services/",
                "Views/"
            ]
        ),
        .testTarget(
            name: "JPETranslatorTests",
            dependencies: ["JPETranslator"]
        )
    ]
)