import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface GoogleData {
  token: string;
  googleUserId: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleData: GoogleData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfile(authUser: User) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('No authenticated user');

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', auth.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is expected if profile doesn't exist
        throw fetchError;
      }

      if (existingProfile) {
        // Profile exists, use it
        setUser(existingProfile);
      } else {
        // Profile doesn't exist, create it
        const newProfile = {
          id: auth.user.id,
          name: auth.user.user_metadata.name || auth.user.email?.split('@')[0] || 'User',
          email: auth.user.email || '',
          avatar_url: auth.user.user_metadata.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: profile, error } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (error) throw error;
        setUser(profile);
      }
    } catch (error) {
      console.error('Error handling profile:', error);
      setUser(null);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('No account exists with this email. Would you like to sign up?');
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleData: GoogleData) => {
    try {
      setIsLoading(true);
      console.log('Processing Google login with data:', googleData);
      
      if (!googleData.token) {
        throw new Error('Missing ID token from Google');
      }
      
      // Try to sign in with JWT token from Google
      const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleData.token,
      });

      if (!signInError && signInData.user) {
        console.log('Successfully signed in with ID token');
        
        // Update user profile with Google data
        await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            name: googleData.name,
            email: googleData.email,
            avatar_url: googleData.picture,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        return;
      }

      console.log('ID token sign-in failed, trying fallback method');

      // If sign in fails, try the fallback RPC function
      const { data: fallbackData, error: fallbackError } = await supabase.rpc(
        'handle_google_signin_fallback',
        {
          p_email: googleData.email,
          p_google_id: googleData.googleUserId,
          p_name: googleData.name,
          p_avatar_url: googleData.picture || null
        }
      );
      
      if (fallbackError) {
        console.error('Fallback RPC failed:', fallbackError);
        
        // If fallback fails, try direct sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: googleData.email,
          password: `google_${googleData.googleUserId}`,
          options: {
            data: {
              name: googleData.name,
              avatar_url: googleData.picture,
              google_id: googleData.googleUserId
            }
          }
        });
        
        if (signUpError) {
          // If sign up fails, try direct sign in
          const { error: directSignInError } = await supabase.auth.signInWithPassword({
            email: googleData.email,
            password: `google_${googleData.googleUserId}`
          });
          
          if (directSignInError) {
            throw directSignInError;
          }
        }
      } else {
        console.log('Fallback RPC succeeded:', fallbackData);
        
        // Try to sign in with the password from the fallback
        const { error: finalError } = await supabase.auth.signInWithPassword({
          email: googleData.email,
          password: `google_${googleData.googleUserId}`
        });
        
        if (finalError) {
          throw finalError;
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in.');
      }

      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('Signup failed - no user returned');

      // Profile will be created by the auth state change handler

    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      if (!user) throw new Error('No user logged in');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      googleLogin,
      logout, 
      updateProfile,
      uploadAvatar,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { UserProfile };
