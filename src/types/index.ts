export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  isPremium: boolean;
  isSubscribed?: boolean;
}

export interface Reel {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  isPremium: boolean;
}

export interface Dua {
  id: string;
  title: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  category: string;
}

export interface PrayerTime {
  name: string;
  time: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  date: string;
  category: string;
  isPremium?: boolean;
}

export interface BookNotification {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  scheduledFor: Date;
}

// Empty interface to fix typescript error with window object
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
        };
      };
    };
    Android?: {
      enableRotation: () => void;
      disableRotation: () => void;
      getDeviceId: () => string;
      isFirstLaunch: () => boolean;
      googleSignIn: () => void;
      handleVolumeButtonPress: () => void;
    };
    imageCache?: {
      clear: () => void;
    };
    gc?: () => void;
    handleGoogleSignInResult: (account: any) => void;
    handleGoogleSignInError: (error: string) => void;
    handleVolumeButtonPress: () => void;
    handleAppReopen: (pauseDuration: number) => void;
  }
}
