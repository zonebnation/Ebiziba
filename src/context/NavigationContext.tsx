import React, { createContext, useContext, useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

type NavigationState = {
  history: string[];
  currentScreen: string;
  params?: Record<string, any>;
};

interface NavigationContextType {
  navigate: (screen: string, params?: Record<string, any>) => void;
  goBack: () => boolean;
  currentScreen: string;
  params?: Record<string, any>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    history: ['home'],
    currentScreen: 'home',
    params: undefined
  });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Set up hardware back button handler for Android
      const backButtonListener = App.addListener('backButton', () => {
        // Prevent default behavior (app exit) by handling it ourselves
        const didGoBack = goBack();
        
        // Only exit app if we're at the root screen and can't go back further
        if (!didGoBack) {
          // This is the root screen, let the system handle the back button
          // which will minimize the app rather than exit it immediately
          App.exitApp();
        }
      });

      return () => {
        backButtonListener.remove();
      };
    }
  }, [state.history]);

  const navigate = (screen: string, params?: Record<string, any>) => {
    setState(prevState => ({
      history: [...prevState.history, screen],
      currentScreen: screen,
      params
    }));
  };

  const goBack = (): boolean => {
    if (state.history.length <= 1) {
      return false; // Can't go back further
    }

    setState(prevState => {
      const newHistory = [...prevState.history];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      
      return {
        history: newHistory,
        currentScreen: previousScreen,
        params: undefined // Clear params when going back
      };
    });
    
    return true; // Successfully went back
  };

  return (
    <NavigationContext.Provider value={{
      navigate,
      goBack,
      currentScreen: state.currentScreen,
      params: state.params
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
