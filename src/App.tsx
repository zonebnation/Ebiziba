import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { Library } from './components/Library';
import { Videos } from './components/Videos';
import { Stories } from './components/Stories';
import { Profile } from './components/Profile';
//import { Quran } from './components/Quran';
import { Kulaane } from './components/Kulaane';
import { IslamicCalendarPage } from './components/islamic-calendar/IslamicCalendarPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import { initializePurchases } from './lib/purchases';
import { initializePushNotifications, scheduleStoryNotification } from './lib/notifications';
//import { QuranMiniPlayer } from './components/quran/QuranMiniPlayer';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ProfileNameForm } from './components/ProfileNameForm';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { initializeBookNotifications, scheduleBookNotification, handleAppReopen } from './lib/book-notifications';
import { getDeviceInfo, DeviceType } from './lib/device-detection';

// Google Client ID - Updated with the new client ID
const GOOGLE_CLIENT_ID = '831711717763-1hssdodv0bb9ghfeoobf5alvr029enfi.apps.googleusercontent.com';

// Main content component that uses navigation context
const MainContent: React.FC = () => {
  const { currentScreen, navigate } = useNavigation();
  const { user } = useAuth();
  const { deviceInfo, updateDeviceInfo } = useDevice();
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showNameForm, setShowNameForm] = useState(false);
  const [notificationStoryId, setNotificationStoryId] = useState<string | null>(null);
  const [notificationBookId, setNotificationBookId] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if app is running in standalone mode (installed PWA)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  // Initialize services
  useEffect(() => {
    initializePurchases().catch(console.error);
    initializePushNotifications().catch(console.error);
    initializeBookNotifications().catch(console.error);
    
    // Set up app state listeners for native platforms
    if (Capacitor.isNativePlatform()) {
      // Listen for app state changes
      const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
        
        if (isActive) {
          // App came to foreground
          setLastActivityTime(Date.now());
          updateDeviceInfo();
        } else {
          // App went to background
          // This is handled by the notifications.ts module
        }
      });
      
      // Listen for notification navigation events
      const handleNotificationNavigation = (event: CustomEvent) => {
        const { type, id } = event.detail;
        
        if (type === 'story' && id) {
          setNotificationStoryId(id);
          navigate('stories');
        }
      };
      
      // Listen for book notification navigation events
      const handleBookNotificationNavigation = (event: CustomEvent) => {
        const { type, id } = event.detail;
        
        if (type === 'book' && id) {
          setNotificationBookId(id);
          navigate('library');
        }
      };
      
      // Add event listeners
      window.addEventListener('notificationNavigation', handleNotificationNavigation as EventListener);
      window.addEventListener('bookNotificationNavigation', handleBookNotificationNavigation as EventListener);
      
      // Add handler for app reopening
      window.handleAppReopen = (pauseDuration: number) => {
        handleAppReopen(pauseDuration);
      };
      
      return () => {
        appStateListener.remove();
        window.removeEventListener('notificationNavigation', handleNotificationNavigation as EventListener);
        window.removeEventListener('bookNotificationNavigation', handleBookNotificationNavigation as EventListener);
        delete window.handleAppReopen;
      };
    }
  }, [navigate, updateDeviceInfo]);

  // Check if we need to show the name form after Google login
  useEffect(() => {
    if (user && (!user.name || user.name === 'User' || user.name === user.email?.split('@')[0])) {
      // User has logged in but doesn't have a proper name set
      setShowNameForm(true);
    }
  }, [user]);

  // Set up activity tracking to prevent app from going blank
  const updateLastActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  useEffect(() => {
    // Add event listeners to track user activity
    const events = ['click', 'touchstart', 'mousemove', 'keydown', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Set up periodic check to keep app alive
    const keepAliveInterval = setInterval(() => {
      // Force a small state update every 30 seconds to keep React alive
      setLastActivityTime(prev => {
        // If more than 5 minutes since last activity, trigger a small re-render
        if (Date.now() - prev > 5 * 60 * 1000) {
          console.log('Keeping app alive after inactivity');
          return Date.now();
        }
        return prev;
      });
    }, 30000);
    
    return () => {
      // Clean up event listeners
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(keepAliveInterval);
    };
  }, [updateLastActivity]);

  // Memory management - clean up unused resources periodically
  useEffect(() => {
    const memoryCleanupInterval = setInterval(() => {
      // Clean up any image caches if not in Quran section
      if (currentScreen !== 'Kulaane') {
        // Clear any large caches when not needed
        if (window.imageCache && typeof window.imageCache.clear === 'function') {
          window.imageCache.clear();
        }
        
        // Force garbage collection hint (not guaranteed but helps)
        if (window.gc) {
          try {
            window.gc();
          } catch (e) {
            // Ignore if not available
          }
        }
      }
    }, 60000); // Run every minute

    return () => {
      clearInterval(memoryCleanupInterval);
    };
  }, [currentScreen]);

  // Schedule a story notification when the user opens the app
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Schedule a notification for a random story after a delay
      const timer = setTimeout(() => {
        scheduleStoryNotification({
          id: '1',
          title: 'Omusajja Yaggwa Mu Kabuyonjo',
          excerpt: 'Omusajja yaggwa mu kaabuyonjo, naye bantu batono abaakitegeela nti aguddeyo...'
        }).catch(console.error);
      }, 60000); // 1 minute after app is loaded
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Navigate to story from notification if needed
  useEffect(() => {
    if (notificationStoryId && currentScreen === 'stories') {
      // In a real app, you would select the specific story
      console.log('Should open story with ID:', notificationStoryId);
      setNotificationStoryId(null);
    }
  }, [notificationStoryId, currentScreen]);
  
  // Navigate to book from notification if needed
  useEffect(() => {
    if (notificationBookId && currentScreen === 'library') {
      // In a real app, you would select the specific book
      console.log('Should open book with ID:', notificationBookId);
      setNotificationBookId(null);
    }
  }, [notificationBookId, currentScreen]);

  // Schedule a book notification when the app is closed
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Schedule a book notification for 24 hours from now
      scheduleBookNotification();
    }
  }, []);

  // Adjust padding based on device type
  const getContentPadding = () => {
    if (deviceInfo.type === DeviceType.MOBILE) {
      return deviceInfo.isSmallScreen ? 'pb-16' : 'pb-20';
    }
    return 'pb-24';
  };

  // Get safe area classes for installed app
  const getSafeAreaClasses = () => {
    if (isStandalone || Capacitor.isNativePlatform()) {
      return 'has-safe-area';
    }
    return '';
  };

  const renderContent = () => {
    if (showCalendar) {
      return <IslamicCalendarPage onBack={() => setShowCalendar(false)} />;
    }

    switch (currentScreen) {
      case 'home':
        return <Home setActiveTab={navigate} setShowCalendar={setShowCalendar} />;
      case 'library':
        return <Library notificationBookId={notificationBookId} />;
      case 'videos':
        return <Videos />;
      case 'stories':
        return <Stories notificationStoryId={notificationStoryId} />;
      case 'profile':
        return <Profile />;
      case 'Kulaane':  // Corrected from 'Kulaane' to 'Kulaane'
        return <Kulaane />;
      default:
        return <Home setActiveTab={navigate} setShowCalendar={setShowCalendar} />;
    }
  };

  return (
    <div 
      className={`min-h-screen w-full bg-surface-50 dark:bg-gray-900 transition-colors duration-200 app-alive ${getContentPadding()} ${getSafeAreaClasses()}`}
      data-last-activity={lastActivityTime} // This helps trigger re-renders
      data-device-type={deviceInfo.type}
      data-screen-size={deviceInfo.screenSize}
      data-standalone={isStandalone ? 'true' : 'false'}
    >
      <div className="max-w-md mx-auto">
        {renderContent()}
      </div>
      <Navigation 
        activeTab={currentScreen} 
        setActiveTab={(tab) => {
          navigate(tab);
          setShowCalendar(false);
          updateLastActivity();
        }} 
      />
      
      {/* Quran Mini Player - shows when audio is playing in background */}

      {/* Profile Name Form */}
      <AnimatePresence>
        {showNameForm && (
          <ProfileNameForm onComplete={() => setShowNameForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="error-container p-8 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 dark:text-gray-300">Error 403 please contact support.</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <DeviceProvider>
            <NavigationProvider>
              <MainContent />
            </NavigationProvider>
          </DeviceProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

// Add global type for window
declare global {
  interface Window {
    imageCache?: {
      clear: () => void;
    };
    gc?: () => void;
    handleVolumeButtonPress?: () => void;
    handleAppReopen?: (pauseDuration: number) => void;
  }
}

export default App;
