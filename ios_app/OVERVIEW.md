// JPE Sims 4 Mod Translator iOS App

This directory contains the iOS application for the JPE Sims 4 Mod Translator project. The iOS app provides mobile access to mod creation and management features.

## Directory Structure:
```
ios_app/
├── JPETranslator.xcodeproj/      # Xcode project file
├── JPETranslator/
│   ├── Assets.xcassets/          # All asset catalogs
│   ├── Base.lproj/               # Storyboards and interface files
│   ├── AppDelegate.swift         # App lifecycle management
│   ├── SceneDelegate.swift       # Scene lifecycle management
│   ├── ViewController.swift      # Main view controller
│   ├── Models/                   # Data models for the app
│   │   └── ProjectModel.swift    # Project data structures
│   ├── Services/                 # Backend services
│   │   └── TranslationService.swift  # API communication
│   ├── Views/                    # UI components
│   │   └── ProjectListView.swift # SwiftUI views
│   └── Utils/                    # Utility functions
├── Package.swift                 # Swift Package Manager manifest
├── README.md                    # Project documentation
└── Info.plist                   # App configuration
```

## Setup Instructions:
1. Open JPETranslator.xcodeproj in Xcode
2. Verify you're using iOS 14.0+ as the minimum deployment target
3. Build and run on simulator or connected device

## Features:
- View and edit JPE mod files
- Validate mod syntax
- Sync projects with cloud API
- Manage projects remotely
- Preview mod definitions

## Configuration:
The iOS app connects to the backend translation engine via REST API at https://api.jpe-sims4.com