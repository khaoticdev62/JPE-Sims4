# JPE Sims 4 Mod Translator - iOS Application

This is the iOS companion application for the JPE Sims 4 Mod Translator desktop application. It enables users to view, edit, and manage their Sims 4 mod projects on iOS devices.

## Features

- View and edit JPE mod files
- Validate mod syntax
- Sync projects with cloud storage
- Browse and organize projects
- Preview mod definitions

## Architecture

The iOS app is built using SwiftUI and UIKit components with the following structure:

- **Views**: User interface components
- **Models**: Data structures and business logic
- **Services**: Network, storage, and translation services
- **Utils**: Helper functions and utilities

## Project Structure

```
JPETranslator/
├── Assets.xcassets/     # App icons, images, and colors
├── Base.lproj/          # Storyboard files
├── AppDelegate.swift    # App lifecycle management
├── SceneDelegate.swift  # Scene lifecycle management
├── ViewController.swift # Main view controller
├── Models/              # Data models
├── Services/            # Backend services
├── Views/               # UI components
└── Utils/               # Utility functions
```

## Setup Instructions

1. Open the project in Xcode
2. Ensure you have iOS 14.0+ development tools
3. Build and run on simulator or device

## Dependencies

- iOS 14.0+
- Foundation
- UIKit
- SwiftUI (for newer components)

## Integration

This app integrates with the core JPE translation engine through REST API calls to the cloud service. The desktop application handles the complex parsing and generation, while the mobile app provides a streamlined editing experience.