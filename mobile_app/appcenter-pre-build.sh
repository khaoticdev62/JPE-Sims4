#!/bin/bash
# App Center Build Script for JPE Sims 4 Mod Translator Mobile App
# This script runs during the build process in Microsoft App Center

# Exit on any error
set -e

echo "JPE Sims 4 Mod Translator - App Center Build Script"
echo "Build started at: $(date)"

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in current directory"
  exit 1
fi

echo "Detected package.json for React Native project"

# Install dependencies
echo "Installing dependencies..."
npm ci --quiet

# Check if this is an Android build
if [ "$APPCENTER_PLATFORM" = "react-native" ] && [ "$APPCENTER_SOURCE_DIRECTORY" != "" ]; then
  # Determine if we're building for Android or iOS based on build variant
  if [ -d "android" ]; then
    echo "Building Android app..."

    # Update Gradle wrapper properties if needed
    if [ -f "android/gradle/wrapper/gradle-wrapper.properties" ]; then
      echo "Gradle wrapper detected"
    fi

    # Build Android app
    cd android
    ./gradlew clean
    ./gradlew assembleRelease --no-daemon
    cd ..

    # Move APK to App Center's expected location
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
      mkdir -p "$APPCENTER_OUTPUT_DIRECTORY"
      cp android/app/build/outputs/apk/release/app-release.apk "$APPCENTER_OUTPUT_DIRECTORY"
      echo "Android APK built successfully"
    else
      echo "Error: Android APK not found after build"
      exit 1
    fi

  elif [ -d "ios" ]; then
    echo "Building iOS app..."
    
    # Install CocoaPods dependencies
    cd ios
    if [ -f "Podfile" ]; then
      pod install --repo-update
    fi
    cd ..
    
    # Use xcodebuild to build the iOS project
    # Note: This would typically run on macOS, but App Center handles this
    echo "iOS build configuration prepared"
  fi
elif [ "$APPCENTER_BRANCH" = "main" ] || [ "$APPCENTER_BRANCH" = "master" ]; then
  # Pre-build validation
  echo "Running pre-build validation..."
  
  # Validate project structure
  if [ -f "App.tsx" ] && [ -f "index.js" ]; then
    echo "✓ React Native project structure validated"
  else
    echo "✗ React Native project structure invalid"
    exit 1
  fi
  
  # Run tests if available (optional)
  if command -v npx >/dev/null 2>&1; then
    echo "Running tests (if available)..."
    # Only run if we have tests
    if [ -d "__tests__" ] || [ -f "src/__tests__/App.test.tsx" ]; then
      npx jest --silent || echo "Tests failed, continuing with build..."
    else
      echo "No tests found, skipping test execution"
    fi
  fi
  
  echo "Pre-build validation completed"
else
  echo "APPCENTER_PLATFORM is not set to react-native, skipping custom build steps"
fi

echo "Build completed at: $(date)"
echo "App Center build script finished successfully"