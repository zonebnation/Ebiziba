# Release Build Guide for Ebizimba Omusiraamu

This guide will help you build a signed release version of the Ebizimba Omusiraamu app for distribution.

## Prerequisites

1. Make sure you have the release keystore file (`release.keystore`) in the root of your project
2. Ensure the keystore password and alias are correctly configured

## Building a Release APK

### Option 1: Using npm scripts

Run the following command to build a release APK:

```bash
npm run android:build
```

This will:
1. Build the web assets
2. Sync them to the Android project
3. Build a signed release APK

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: Using Android Studio

1. Open the Android project in Android Studio:
```bash
npm run android
```

2. From the menu, select Build > Generate Signed Bundle / APK
3. Select APK
4. Choose the existing keystore:
   - Keystore path: `release.keystore`
   - Keystore password: `ebizimba`
   - Key alias: `release`
   - Key password: `ebizimba`
5. Select release build variant and finish

## Building an App Bundle for Google Play

### Option 1: Using npm scripts

Run the following command to build a release bundle:

```bash
npm run android:bundle
```

The bundle will be located at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Option 2: Using Android Studio

1. Open the Android project in Android Studio
2. From the menu, select Build > Generate Signed Bundle / APK
3. Select Android App Bundle
4. Choose the existing keystore with the same credentials as above
5. Select release build variant and finish

## Important Notes

1. **Keep your keystore safe**: The same keystore must be used for all future updates
2. **Remember your passwords**: If you lose the keystore or passwords, you won't be able to update your app

## SHA-1 Certificate Fingerprint

Your app's SHA-1 fingerprint for the release keystore is:
```
D0:0E:CF:E8:F3:FE:E5:D4:8D:81:4B:0C:4C:CC:9D:41:3A:F8:14:E0
```

This fingerprint has been registered with Google for authentication services.

## Testing the Release Build

Before uploading to Google Play:

1. Install the release APK on a test device
2. Verify all functionality works correctly
3. Test Google Sign-In and other authentication methods
4. Check that in-app purchases work properly

## Troubleshooting

If you encounter signing issues:

1. Verify the keystore path in `capacitor.config.json`
2. Check that the passwords in the build configuration match your keystore
3. Ensure the keystore is valid and not corrupted
