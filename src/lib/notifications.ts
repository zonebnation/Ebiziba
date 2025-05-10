import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';
import { scheduleBookNotification } from './book-notifications';

// Track app state
let isAppActive = true;
let hasNotificationPermission = false;
let notificationScheduled = false;
let appPauseTime: number | null = null;

export async function initializePushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native platforms');
    return;
  }

  try {
    // Request permission
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      hasNotificationPermission = true;
      
      // Register for push notifications
      await PushNotifications.register();

      // Add listeners
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
        // Here you would typically send this token to your backend
        saveNotificationToken(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration failed:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        handleNotificationAction(notification);
      });
      
      // Initialize local notifications
      await initializeLocalNotifications();
      
      // Set up app state listeners
      setupAppStateListeners();
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

async function initializeLocalNotifications() {
  try {
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display === 'granted') {
      hasNotificationPermission = true;
      
      // Add listeners for local notifications
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Local notification received:', notification);
      });
      
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Local notification action performed:', notification);
        handleNotificationAction(notification);
      });
    }
  } catch (error) {
    console.error('Error initializing local notifications:', error);
  }
}

function setupAppStateListeners() {
  // Listen for app state changes
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active:', isActive);
    
    if (isActive) {
      // App came to foreground
      isAppActive = true;
      
      // If app was paused for a significant time, schedule a book notification
      if (appPauseTime) {
        const pauseDuration = Date.now() - appPauseTime;
        if (pauseDuration > 5 * 60 * 1000) { // 5 minutes
          // Schedule a book notification for 24 hours from now
          scheduleBookNotification();
        }
      }
      
      appPauseTime = null;
      notificationScheduled = false;
    } else {
      // App went to background
      isAppActive = false;
      appPauseTime = Date.now();
      
      // Schedule notification after a delay
      scheduleReturnNotification();
    }
  });
  
  // Listen for back button press (might indicate app closing)
  App.addListener('backButton', () => {
    if (!isAppActive) {
      // App is already in background, this might be a close action
      scheduleReturnNotification();
    }
  });
}

async function scheduleReturnNotification() {
  if (!hasNotificationPermission || notificationScheduled) return;
  
  try {
    notificationScheduled = true;
    
    // Get a random story to promote
    const story = await getRandomStory();
    
    // Schedule notification to be delivered after 5 minutes
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Emboozi Empya Ekulindirira!',
          body: story ? `${story.title} - ${story.excerpt}` : 'Komawo osome emboozi empya!',
          schedule: { at: new Date(Date.now() + 5 * 60 * 1000) },
          extra: {
            type: 'story',
            storyId: story?.id || '1'
          }
        }
      ]
    });
    
    console.log('Return notification scheduled');
    
    // Also schedule a book notification for 24 hours later
    scheduleBookNotification();
  } catch (error) {
    console.error('Error scheduling notification:', error);
    notificationScheduled = false;
  }
}

async function getRandomStory() {
  try {
    // In a real app, you would fetch this from your database
    // For now, we'll use a mock story
    return {
      id: '1',
      title: 'Omusajja Yaggwa Mu Kabuyonjo',
      excerpt: 'Omusajja yaggwa mu kaabuyonjo, naye bantu batono abaakitegeela nti aguddeyo...'
    };
  } catch (error) {
    console.error('Error getting random story:', error);
    return null;
  }
}

function handleNotificationAction(notification: any) {
  // Navigate to the appropriate screen based on notification data
  const data = notification.notification.data || {};
  
  if (data.type === 'story') {
    // In a real app, you would navigate to the story screen
    console.log('Should navigate to story with ID:', data.storyId);
    
    // You could dispatch a custom event that your app listens for
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('notificationNavigation', { 
        detail: { type: 'story', id: data.storyId }
      });
      window.dispatchEvent(event);
    }
  } else if (data.type === 'book') {
    // Handle book notification
    console.log('Should navigate to book with ID:', data.bookId);
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('bookNotificationNavigation', { 
        detail: { type: 'book', id: data.bookId }
      });
      window.dispatchEvent(event);
    }
  }
}

async function saveNotificationToken(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Save token to user's profile
      await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          device_token: token,
          platform: Capacitor.getPlatform(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, device_token'
        });
    }
  } catch (error) {
    console.error('Error saving notification token:', error);
  }
}

export async function scheduleStoryNotification(story: { title: string; excerpt: string; id: string }) {
  if (!Capacitor.isNativePlatform() || !hasNotificationPermission) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(story.id) || 1,
          title: 'Emboozi Empya: ' + story.title,
          body: story.excerpt,
          schedule: { at: new Date(Date.now() + 60 * 1000) }, // 1 minute from now
          extra: {
            type: 'story',
            storyId: story.id
          }
        }
      ]
    });
    
    console.log('Story notification scheduled');
  } catch (error) {
    console.error('Error scheduling story notification:', error);
  }
}

export async function cancelAllNotifications() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await LocalNotifications.cancelAll();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}
