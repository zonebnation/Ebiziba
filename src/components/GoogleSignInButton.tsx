import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onSuccess, 
  onError,
  className = "w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
}) => {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    // Listen for Google Sign-In results from Android
    const handleGoogleSignInResult = async (event: CustomEvent<any>) => {
      try {
        setIsLoading(true);
        const account = event.detail;
        
        console.log('Received Google Sign-In result:', account);
        
        // Process the account data
        const googleData = {
          token: account.idToken,
          googleUserId: account.id,
          email: account.email,
          name: account.name,
          picture: account.photoUrl
        };
        
        // Call the googleLogin function from AuthContext
        await googleLogin(googleData);
        onSuccess?.();
      } catch (error: any) {
        console.error('Error handling Google Sign-In result:', error);
        onError?.(error.message || 'Okuyingira mu Google kugaanye');
      } finally {
        setIsLoading(false);
      }
    };
    
    const handleGoogleSignInError = (event: CustomEvent<string>) => {
      console.error('Google Sign-In error event received:', event.detail);
      setIsLoading(false);
      onError?.(event.detail || 'Okuyingira mu Google kugaanye');
    };
    
    window.addEventListener('googleSignInResult', handleGoogleSignInResult as EventListener);
    window.addEventListener('googleSignInError', handleGoogleSignInError as EventListener);
    
    return () => {
      window.removeEventListener('googleSignInResult', handleGoogleSignInResult as EventListener);
      window.removeEventListener('googleSignInError', handleGoogleSignInError as EventListener);
    };
  }, [googleLogin, onSuccess, onError]);

  const handleSignIn = () => {
    try {
      setIsLoading(true);
      
      // Check if we're on Android and have the native interface
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        if (window.Android?.googleSignIn) {
          console.log('Calling native Android googleSignIn method');
          window.Android.googleSignIn();
        } else {
          console.error('Android interface exists but googleSignIn method is missing');
          setIsLoading(false);
          onError?.('Okuyingira mu Google tekusoboka ku kifuufu kino');
        }
      } else {
        // For web or if native method is not available
        console.error('Not on Android platform or Android interface not available');
        setIsLoading(false);
        onError?.('Okuyingira mu Google tekusoboka ku kifuufu kino');
      }
    } catch (error) {
      console.error('Error initiating Google Sign-In:', error);
      setIsLoading(false);
      onError?.('Waliwo ekisobu mu kutandika okuyingira mu Google');
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Yingira ne Google</span>
        </>
      )}
    </button>
  );
}
