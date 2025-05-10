# Google API Setup for Android

## Required Information

1. **Package Name**: `com.ebizimba.islam`
   - This is defined in your `android/app/build.gradle` file

2. **SHA-1 Certificate Fingerprint**
   - For development (debug keystore): Run the provided script
   - For production (release keystore): You'll need to generate this separately

## How to Get SHA-1 Certificate Fingerprint

### For Debug Keystore (Development)

Run the following command:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line starting with "SHA1:" in the output.

### For Release Keystore (Production)

If you already have a release keystore:

```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your_alias
```

You'll be prompted for the keystore password.

If you don't have a release keystore yet, create one:

```bash
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

## Verifying Ownership
npm ru
Google may ask you to verify ownership of your app. This can be done in several ways:

1. **Digital Asset Links JSON File**:
   - Create a file at `https://yourdomain.com/.well-known/assetlinks.json`
   - Follow Google's instructions for the content

2. **DNS Verification**:
   - Add a TXT record to your domain's DNS settings
   - Follow Google's instructions for the record content

3. **Google Search Console**:
   - Verify your domain in Google Search Console
   - This may be sufficient for some API verifications

## Setting Up Google Sign-In for Android

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Android" as the application type
6. Enter your package name and SHA-1 certificate fingerprint
7. Click "Create"

## Updating Your App with the New Client ID

Once you have your Android OAuth client ID, update your app:

1. Add the client ID to your Google Sign-In configuration
2. Make sure the package name in your app matches exactly what you registered

## Testing

After setting up:

1. Build and run your appon an Android device or emulator
2. Test the Google Sign-In functionality
3. Check the logs for any authentication errors
