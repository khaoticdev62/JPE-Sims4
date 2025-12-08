# JPE Sims 4 Mod Translator - Mobile App

Cross-platform mobile application for creating Sims 4 mods with simple English using the JPE (Just Plain English) language.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
2. Navigate to the mobile_app directory
3. Install dependencies:

```bash
cd mobile_app
npm install
```

### Running the Application

#### Android
```bash
npx react-native run-android
```

#### iOS (macOS only)
```bash
npx react-native run-ios
```

## 🏗️ Architecture

The application follows a standard React Native architecture:

- `src/components/` - Reusable UI components
- `src/screens/` - App screens/views
- `src/services/` - API and business logic services
- `src/models/` - Data models and structures
- `src/utils/` - Helper functions and utilities
- `src/types/` - TypeScript type definitions

## 🛠 Dependencies

- React Native 0.72.7
- React Navigation 6.x
- TypeScript
- Axios for API communication
- React Native Elements for UI components

## 🔧 Development

To start the Metro bundler:

```bash
npx react-native start
```

## 🧪 Testing

Run unit tests:
```bash
npm test
```

## 📋 Features

- Project management
- Mod creation with JPE language
- Build and export functionality
- Settings and preferences
- Cross-platform compatibility (iOS & Android)