#!/bin/bash

# Display the package name from AndroidManifest.xml
echo "Package Name:"
echo "com.ebizimba.islam"
echo ""

# Get the debug keystore path
if [ -f "$HOME/.android/debug.keystore" ]; then
    KEYSTORE_PATH="$HOME/.android/debug.keystore"
elif [ -f "$ANDROID_HOME/debug.keystore" ]; then
    KEYSTORE_PATH="$ANDROID_HOME/debug.keystore"
else
    echo "Debug keystore not found in standard locations."
    echo "You may need to specify the path manually."
    exit 1
fi

echo "Using keystore: $KEYSTORE_PATH"
echo ""

# Get SHA-1 fingerprint
echo "SHA-1 Certificate Fingerprint:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias androiddebugkey -storepass android -keypass android | grep "SHA1" | cut -d ":" -f 2- | xargs

echo ""
echo "Note: The above SHA-1 is for the debug keystore."
echo "For production, you'll need to generate a release keystore and get its SHA-1."
echo ""
echo "To verify ownership, you'll need to add a verification file to your website or DNS records."
echo "Follow the instructions provided by Google in the API Console."
