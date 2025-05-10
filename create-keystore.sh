#!/bin/bash

# Check if keystore already exists
if [ -f "release.keystore" ]; then
    echo "release.keystore already exists. Delete it first if you want to create a new one."
    exit 1
fi

# Generate a new keystore
echo "Generating new release keystore..."
echo "Using the following information:"
echo "  Keystore password: ebizimba"
echo "  Key alias: release"
echo "  Key password: ebizimba"
echo ""

# Create the keystore with predefined answers
keytool -genkey -v \
    -keystore release.keystore \
    -alias release \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass ebizimba \
    -keypass ebizimba \
    -dname "CN=Ebizimba Omusiraamu, OU=Development, O=Ebizimba, L=Kampala, ST=Kampala, C=UG"

# Check if keystore was created successfully
if [ -f "release.keystore" ]; then
    echo ""
    echo "Keystore created successfully!"
    echo ""
    echo "Now getting the SHA-1 fingerprint:"
    keytool -list -v -keystore release.keystore -alias release -storepass ebizimba | grep "SHA1"
    
    echo ""
    echo "Make sure to keep your keystore file and password safe!"
    echo "You'll need them to sign your app for production."
    echo ""
    echo "The keystore has been configured with:"
    echo "  - Keystore path: release.keystore"
    echo "  - Keystore password: ebizimba"
    echo "  - Key alias: release"
    echo "  - Key password: ebizimba"
    echo ""
    echo "These settings are already configured in capacitor.config.json and android/app/build.gradle"
else
    echo "Failed to create keystore."
fi

# Copy keystore to android directory for direct access
if [ -f "release.keystore" ]; then
    cp release.keystore android/
    echo "Copied keystore to android/ directory for build process"
fi
