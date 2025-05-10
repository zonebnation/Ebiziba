import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

interface AndroidGoogleSignInResponse {
  idToken: string;
  email: string;
  name: string;
  id: string;
  photoUrl?: string;
}

// Handle Google Sign-In response from Android
export async function handleAndroidGoogleSignIn(response: AndroidGoogleSignInResponse) {
  try {
    console.log('Processing Android Google Sign-In response:', response);
    
    if (!response.idToken) {
      throw new Error('Missing ID token from Google Sign-In response');
    }
    
    // First try to sign in with ID token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.idToken,
    });

    if (!signInError && signInData.user) {
      console.log('Successfully signed in with ID token');
      
      // Update profile with latest info
      await supabase
        .from('profiles')
        .upsert({
          id: signInData.user.id,
          name: response.name,
          email: response.email,
          avatar_url: response.photoUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      return signInData.session;
    }
    
    console.log('ID token sign-in failed, trying password auth');

    // If ID token sign-in fails, try password auth
    const { data: passwordData, error: passwordError } = await supabase.auth.signInWithPassword({
      email: response.email,
      password: `google_${response.id}`
    });

    if (!passwordError && passwordData.user) {
      console.log('Successfully signed in with password');
      return passwordData.session;
    }
    
    console.log('Password auth failed, trying to sign up');

    // If both sign-in methods fail, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: response.email,
      password: `google_${response.id}`,
      options: {
        data: {
          name: response.name,
          avatar_url: response.photoUrl,
          google_id: response.id
        }
      }
    });

    if (signUpError) {
      // If error is related to token, try the fallback RPC function
      if (signUpError.message.includes('token') || signUpError.message.includes('JWT')) {
        console.log('Trying fallback RPC function for Google Sign-In');
        
        const { data: fallbackData, error: fallbackError } = await supabase.rpc(
          'handle_google_signin_fallback',
          {
            p_email: response.email,
            p_google_id: response.id,
            p_name: response.name,
            p_avatar_url: response.photoUrl || null
          }
        );
        
        if (fallbackError) {
          console.error('Fallback RPC failed:', fallbackError);
          throw fallbackError;
        }
        
        console.log('Fallback RPC succeeded:', fallbackData);
        
        // Now try to sign in with the password from the fallback
        const { data: finalSignIn, error: finalError } = await supabase.auth.signInWithPassword({
          email: response.email,
          password: `google_${response.id}`
        });
        
        if (finalError) {
          throw finalError;
        }
        
        return finalSignIn.session;
      }
      
      console.error('Sign-up failed:', signUpError);
      throw signUpError;
    }

    console.log('Successfully signed up new user');
    
    // Create profile for new user
    if (signUpData.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          name: response.name,
          email: response.email,
          avatar_url: response.photoUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
    }

    return signUpData.session;
  } catch (error) {
    console.error('Error handling Android Google Sign-In:', error);
    throw error;
  }
}

// Check if running on Android
export function isAndroidPlatform(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}
