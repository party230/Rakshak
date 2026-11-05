/**
 * Expo app configuration.
 *
 * This file replaces app.json so we can read a few values from environment
 * variables (useful for EAS cloud builds, where the Firebase config files are
 * uploaded as "file" environment variables instead of being committed).
 */
import type { ExpoConfig } from 'expo/config';

// Android package name and iOS bundle ID. They must match the apps you add in
// the Firebase console.
const ANDROID_PACKAGE = 'in.rakshak.app';
// With a free Apple account the bundle ID must be unique across all of Apple.
// If Xcode says it is taken, set RAKSHAK_IOS_BUNDLE_ID (see README, iPhone setup).
const IOS_BUNDLE_ID = process.env.RAKSHAK_IOS_BUNDLE_ID ?? 'in.rakshak.app';

// Paste the ID that `eas init` prints here (README, Android setup step 3).
const EAS_PROJECT_ID = '';

const config: ExpoConfig = {
  name: 'Rakshak',
  slug: 'rakshak',
  scheme: 'rakshak',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#FFFFFF',
  ios: {
    bundleIdentifier: IOS_BUNDLE_ID,
    supportsTablet: false,
    // Downloaded from the Firebase console (iOS app). Not committed to git.
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
  },
  android: {
    package: ANDROID_PACKAGE,
    // Downloaded from the Firebase console (Android app). Not committed to git.
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#E8EFFA',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  extra: EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {},
  plugins: [
    'expo-router',
    // React Native Firebase: sets up the native Firebase SDKs.
    '@react-native-firebase/app',
    // Adds the iOS URL scheme Firebase phone login needs for its fallback check.
    '@react-native-firebase/auth',
    [
      'expo-build-properties',
      {
        // Firebase's iOS SDK is only shipped as dynamic frameworks now.
        ios: { useFrameworks: 'dynamic' },
      },
    ],
  ],
};

export default config;
