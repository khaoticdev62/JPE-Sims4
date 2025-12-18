# JPE Sims 4 Mod Translator - Mobile App Build and Deployment Guide

This guide explains how to build and deploy the cross-platform mobile application using Microsoft App Center from your Windows development environment.

## 🚀 **Overview**

The JPE Sims 4 Mod Translator mobile app is built using React Native, allowing for a single codebase that targets both iOS and Android. Microsoft App Center enables Windows developers to build and distribute iOS apps without requiring a Mac.

## 🏗️ **Project Structure for App Center**

```
mobile_app/                          # Root directory for mobile app
├── package.json                     # Dependencies and build scripts
├── appcenter-pre-build.sh          # App Center pre-build script
├── appcenter-post-clone.sh         # App Center post-clone script
├── App.tsx                         # Main application file
├── index.js                        # Application entry point
├── android/                        # Android-specific files
│   └── app/
│       └── build.gradle            # Android build configuration
├── ios/                            # iOS-specific files
│   └── JPETranslator/
│       └── Info.plist              # iOS app configuration
├── src/
│   ├── components/                 # Reusable UI components
│   ├── screens/                    # App screens
│   ├── services/                   # API and business logic
│   ├── models/                     # Data models
│   ├── utils/                      # Helper utilities
│   └── types/                      # TypeScript type definitions
├── assets/                         # Images, icons, and other assets
├── README.md                       # Project documentation
└── OVERVIEW.md                     # Architecture documentation
```

## 🔧 **App Center Project Setup**

### **Step 1: Create App Center Account**
1. Visit [appcenter.ms](https://appcenter.ms)
2. Sign in with your Microsoft account
3. Create a new organization or use your personal account

### **Step 2: Create Android App**
1. Click "Add new" → "Add new app"
2. App name: "jpe-sims4-translator-android"
3. OS: Android
4. Platform: React Native
5. Click "Add new app"

### **Step 3: Create iOS App**
1. Click "Add new" → "Add new app"
2. App name: "jpe-sims4-translator-ios"
3. OS: iOS
4. Platform: React Native
5. Click "Add new app"

### **Step 4: Connect Repository**
For each app:
1. Navigate to "Build" tab
2. Choose your Git provider (GitHub, Bitbucket, etc.)
3. Select your repository containing the mobile_app directory
4. For Android app:
   - Branch: `main` or `master`
   - Build directory: `mobile_app/android`
   - Gradle build file: `mobile_app/android/build.gradle`
5. For iOS app:
   - Branch: `main` or `master`
   - Workspace/Project path: `mobile_app/ios/JPETranslator.xcodeproj`
   - Build configuration: `Release`

## ⚙️ **Build Configuration**

### **Environment Variables (Set in App Center)**
1. Go to Build → Build Settings
2. Add these environment variables:
   - `NODE_VERSION=18.17.0` (or latest LTS)
   - `JAVA_VERSION=11` (for Android builds)
   - `REACT_NATIVE_CLI_VERSION=2.0.1`

### **Build Scripts**
App Center will automatically run the scripts in the repository root:
- `appcenter-pre-build.sh` - Runs before build
- `appcenter-post-clone.sh` - Runs after cloning repo

## 📱 **Build Process**

### **Android Builds**
App Center automatically:
1. Clones the repository
2. Sets up Node.js and Java environments
3. Runs `npm install`
4. Builds the Android project using Gradle
5. Creates a signed APK in `app/build/outputs/apk/release/`
6. Packages the APK for distribution

### **iOS Builds (on App Center's Mac infrastructure)**
App Center automatically:
1. Clones the repository
2. Sets up Xcode and iOS build tools
3. Runs `npm install`
4. Installs CocoaPods dependencies
5. Builds the iOS project using xcodebuild
6. Creates an IPA file
7. Packages the IPA for distribution

## 🧪 **Testing Configuration**

1. In App Center, navigate to "Test" tab
2. Upload your test files or use automated UI tests
3. Configure test runs for both platforms
4. Monitor test results in the dashboard

## 📦 **Distribution Setup**

### **For Internal Testing:**
1. Go to "Distribute" tab → "Groups"
2. Create a new distribution group (e.g., "Beta Testers")
3. Add tester emails to the group
4. When builds complete, they'll be automatically distributed

### **For Public Distribution:**
1. Connect to App Store (iOS) or Google Play Store (Android)
2. Configure store credentials in App Center
3. Set up automatic deployment for successful builds

## 🛠️ **Troubleshooting Common Issues**

### **Android Build Issues:**
- If you get "Could not find com.android.tools.build:gradle", ensure your `android/build.gradle` has the correct classpath
- If you get "Build tools revision not found", specify the exact build tools version in `android/app/build.gradle`

### **iOS Build Issues:**
- Code signing issues: Ensure proper certificates and provisioning profiles in App Center
- Architecture conflicts: Make sure your dependencies are compatible with iOS

### **React Native Issues:**
- If you get Metro bundling errors, ensure your `metro.config.js` is properly configured
- Check that all native dependencies have proper Android and iOS implementations

## 📋 **Deployment Checklist**

Before building:

- [ ] Repository is properly connected to App Center
- [ ] Environment variables are configured
- [ ] Build scripts are in place and correct
- [ ] App icons and splash screens are properly configured
- [ ] Backend API endpoints are correctly configured for mobile
- [ ] Testing framework (if any) is properly set up
- [ ] Distribution groups or store connections are configured

## 🎯 **Success Metrics**

Your mobile app is properly configured when:
- [ ] Both Android and iOS builds complete successfully in App Center
- [ ] Generated APK/IPA files install correctly on devices
- [ ] App connects to your backend translation engine
- [ ] All core functionality works as expected
- [ ] Distribution groups receive updates automatically

## 📞 **Support**

If you encounter issues:
- Check the App Center build logs for detailed error information
- Verify all file paths in your project configuration
- Ensure all native modules have proper platform-specific implementations
- Consult the React Native and App Center documentation for specific errors