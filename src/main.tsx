import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { scheduleMemoryCleanup, monitorMemoryUsage } from './lib/memory-manager';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Set viewport height CSS variable for mobile browsers
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set it on initial load
setViewportHeight();

// Update on resize
window.addEventListener('resize', () => {
  setViewportHeight();
});

// Update on orientation change
window.addEventListener('orientationchange', () => {
  // Small delay to ensure the browser has updated the viewport dimensions
  setTimeout(setViewportHeight, 100);
});

const root = createRoot(rootElement);

// Set up memory management
const cleanupCancel = scheduleMemoryCleanup(60000); // Run cleanup every minute
const monitorCancel = monitorMemoryUsage(100, 200, 30000); // Monitor memory usage

// Handle visibility changes to prevent app from going blank when returning
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Force a small re-render when app becomes visible again
    const appElement = document.getElementById('root');
    if (appElement) {
      appElement.classList.add('app-visible');
      setTimeout(() => {
        appElement.classList.remove('app-visible');
      }, 10);
    }
    
    // Update viewport height
    setViewportHeight();
  }
});

// Add global handler for Google Sign-In results from Android
window.handleGoogleSignInResult = (account) => {
  console.log('Received Google Sign-In result from Android:', account);
  // Dispatch a custom event that can be caught by the app
  const event = new CustomEvent('googleSignInResult', { detail: account });
  window.dispatchEvent(event);
};

window.handleGoogleSignInError = (error) => {
  console.error('Google Sign-In error from Android:', error);
  // Dispatch a custom event that can be caught by the app
  const event = new CustomEvent('googleSignInError', { detail: error });
  window.dispatchEvent(event);
};

// Add global handler for volume button press from Android
window.handleVolumeButtonPress = () => {
  console.log('Volume button pressed');
  // Dispatch a custom event that can be caught by the app
  const event = new CustomEvent('volumeButtonPressed');
  window.dispatchEvent(event);
};

// Add global handler for app reopen after being closed
window.handleAppReopen = (pauseDuration) => {
  console.log('App reopened after being closed for', pauseDuration, 'ms');
  // This will be implemented in App.tsx
};

// Handle errors that might cause the app to go blank
window.addEventListener('error', (event) => {
  console.error('Caught unhandled error:', event.error);
  // Prevent the app from going completely blank on errors
  const appElement = document.getElementById('root');
  if (appElement && appElement.innerHTML === '') {
    appElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>The app encountered an error. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #0AC5A0; color: white; border: none; border-radius: 4px; margin-top: 16px;">
          Refresh App
        </button>
      </div>
    `;
  }
});

// Add type definitions for the global window object
declare global {
  interface Window {
    handleGoogleSignInResult: (account: any) => void;
    handleGoogleSignInError: (error: string) => void;
    handleVolumeButtonPress: () => void;
    handleAppReopen: (pauseDuration: number) => void;
    Android?: {
      googleSignIn: () => void;
      enableRotation: () => void;
      disableRotation: () => void;
      getDeviceId: () => string;
      isFirstLaunch: () => boolean;
      handleVolumeButtonPress: () => void;
    };
    imageCache?: {
      clear: () => void;
    };
    gc?: () => void;
  }
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
