# Microsoft App Center Configuration for JPE Sims 4 Mod Translator

Microsoft App Center is a cloud-based build and distribution service that allows you to build iOS and Android apps in the cloud without needing a Mac. This is perfect for your Windows development environment.

## 🔧 **Configuration Steps:**

### **1. Create App Center Account**
1. Go to [appcenter.ms](https://appcenter.ms)
2. Sign in with your Microsoft account
3. Create a new organization or use personal account
4. Create new apps for both iOS and Android platforms

### **2. Create App in App Center**
1. Click "Add new" → "Add new app"
2. For first app: 
   - App name: "jpe-sims4-mod-translator-android"
   - OS: Android
   - Platform: React Native
3. Repeat to create iOS app:
   - App name: "jpe-sims4-mod-translator-ios"  
   - OS: iOS
   - Platform: React Native

### **3. Configure Build Settings**

#### **Android Configuration:**
In your `mobile_app/android/app/build.gradle`, ensure these settings:

```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion

    defaultConfig {
        applicationId "com.jpe.sims4.translator"  // Use your unique ID
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### **iOS Configuration:**
In your `mobile_app/ios/JPETranslator/Info.plist`, ensure these settings:

```xml
<key>CFBundleIdentifier</key>
<string>com.jpe.sims4.translator</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

### **4. App Center Build Configuration**

Create `appcenter-post-clone.sh` for custom build steps:

```bash
#!/usr/bin/env bash

# Install dependencies
npm install

# Install pods for iOS
cd ios
pod install
cd ..

echo "Post-clone script completed"
```

### **5. Setup Build Branches**
1. Connect your GitHub/Bitbucket repository to App Center
2. Select your `mobile_app` directory as the source
3. For Android builds, select `mobile_app/android` as Gradle project directory
4. For iOS builds, select `mobile_app/ios` as Xcode project directory

### **6. Environment Variables to Set in App Center:**
- `NODE_ENV=production`
- `REACT_NATIVE_APP_CENTER=true`

## 📦 **Build Process:**

App Center will automatically:
1. Clone your repository
2. Install dependencies (npm install)
3. Build the app for selected platform
4. Generate APK (Android) or IPA (iOS) file
5. Provide download link for distribution

## 📱 **Distribution:**

After successful builds:
1. Navigate to the "Distribute" section in each app
2. Create a distribution group (e.g., "Testers")
3. Upload new builds directly or through CI/CD
4. Get install links for internal testing or production distribution

## 🧪 **Testing:**

For internal testing, App Center provides:
- Device cloud for automated UI testing
- Crashes and analytics tracking
- Beta distribution capabilities

## 🛠️ **Troubleshooting:**

Common issues and solutions:
1. `Could not resolve dependencies` - Ensure all dependencies in package.json are compatible
2. `Build tools version not found` - Specify correct build tools version in gradle.properties
3. `Signing issues` - Set up proper code signing certificates for iOS

The App Center integration enables full cross-platform development capabilities from your Windows machine - you can build, test, and distribute both iOS and Android apps without needing a Mac!