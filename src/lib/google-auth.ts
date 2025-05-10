import { jwtDecode } from 'jwt-decode';
import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

// Updated with the new client ID
export const GOOGLE_CLIENT_ID = '831711717763-1hssdodv0bb9ghfeoobf5alvr029enfi.apps.googleusercontent.com';

let googleScriptLoaded = false;
let googleInitialized = false;

export function initializeGoogleAuth() {
  if (googleScriptLoaded) {
    if (!googleInitialized && window.google?.accounts?.id) {
      initializeGoogleClient();
    }
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      initializeGoogleClient();
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.body.appendChild(script);
  });
}

function initializeGoogleClient() {
  if (!window.google?.accounts?.id || googleInitialized) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  googleInitialized = true;
}

export async function handleGoogleSignIn(response: GoogleCredentialResponse) {
  try {
    const decoded = jwtDecode<GoogleUserInfo>(response.credential);
    const { email, name, picture, sub: googleUserId } = decoded;

    // First, try to sign in with Google credentials
    const { data: { session }, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (!signInError && session) {
      return session;
    }

    // If OAuth fails, fall back to email/password
    const { data: { session: emailSession }, error: emailSignInError } = await supabase.auth.signInWithPassword({
      email,
      password: `google_${googleUserId}`
    });

    if (!emailSignInError && emailSession) {
      return emailSession;
    }

    // If sign in fails, create new account
    const { data: { session: newSession }, error: signUpError } = await supabase.auth.signUp({
      email,
      password: `google_${googleUserId}`,
      options: {
        data: {
          name,
          avatar_url: picture,
          google_id: googleUserId
        }
      }
    });

    if (signUpError) throw signUpError;
    return newSession;

  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export function renderGoogleButton(elementId: string, theme: 'light' | 'dark' = 'light') {
  if (!window.google?.accounts?.id) {
    console.error('Google Sign-In not initialized');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  window.google.accounts.id.renderButton(element, {
    theme,
    size: 'large',
    type: 'standard',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: element.offsetWidth
  });

  // Force button to be visible
  const buttonFrame = element.querySelector('iframe');
  if (buttonFrame) {
    buttonFrame.style.visibility = 'visible';
    buttonFrame.style.position = 'static';
  }
}

// Check if running on Android
export function isAndroidPlatform(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}
