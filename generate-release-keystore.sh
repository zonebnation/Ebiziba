#!/bin/bash

# Check if keystore already exists
if [ -f "release.keystore" ]; then
    echo "release.keystore already exists. Delete it first if you want to create a new one."
    exit 1
fi

# Generate a new keystore
echo "Generating new release keystore..."
echo "You will be prompted to enter information for the certificate."
echo "For 'first and last name', enter your name or your organization name."
echo ""

keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000

# Check if keystore was created successfully
if [ -f "release.keystore" ]; then
    echo ""
    echo "Keystore created successfully!"
    echo ""
    echo "Now getting the SHA-1 fingerprint:"
    keytool -list -v -keystore release.keystore -alias release | grep "SHA1"
    
    echo ""
    echo "Make sure to keep your keystore file and password safe!"
    echo "You'll need them to sign your app for production."
    echo ""
    echo "Update your capacitor.config.json with the keystore information:"
    echo '  "android": {'
    echo '    "buildOptions": {'
    echo '      "keystorePath": "release.keystore",'
    echo '      "keystoreAlias": "release"'
    echo '    },'
    echo '  }'
else
    echo "Failed to create keystore."
fi
