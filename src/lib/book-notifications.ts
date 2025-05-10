import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];

// Track when notifications were last sent
const LAST_BOOK_NOTIFICATION_KEY = 'last-book-notification-time';
const BOOK_NOTIFICATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Initialize notifications
export async function initializeBookNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Book notifications are only available on native platforms');
    return;
  }

  try {
    // Request permission
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display === 'granted') {
      console.log('Book notification permissions granted');
      
      // Add listeners for local notifications
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Book notification received:', notification);
      });
      
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Book notification action performed:', notification);
        handleBookNotificationAction(notification);
      });
    } else {
      console.log('Book notification permissions denied');
    }
  } catch (error) {
    console.error('Error initializing book notifications:', error);
  }
}

// Schedule a notification for a book after 24 hours
export async function scheduleBookNotification(delayMs = BOOK_NOTIFICATION_INTERVAL) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Check if we've sent a notification recently
    const lastNotificationTime = localStorage.getItem(LAST_BOOK_NOTIFICATION_KEY);
    const now = Date.now();
    
    if (lastNotificationTime && now - parseInt(lastNotificationTime) < BOOK_NOTIFICATION_INTERVAL) {
      console.log('Book notification was sent recently, skipping');
      return;
    }
    
    // Get a random book to recommend
    const book = await getRandomBook();
    if (!book) {
      console.log('No books available for notification');
      return;
    }
    
    // Schedule the notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(book.id.substring(0, 8), 16) || 1, // Convert part of UUID to number
          title: 'Ekitabo Ekipya Ekulindirira!',
          body: `${book.title} - ${book.author}. Komawo osome ekitabo kino!`,
          schedule: { at: new Date(now + delayMs) },
          extra: {
            type: 'book',
            bookId: book.id
          }
        }
      ]
    });
    
    // Save the time we sent this notification
    localStorage.setItem(LAST_BOOK_NOTIFICATION_KEY, now.toString());
    
    console.log('Book notification scheduled for:', new Date(now + delayMs));
  } catch (error) {
    console.error('Error scheduling book notification:', error);
  }
}

// Get a random book from the database
async function getRandomBook(): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .limit(10); // Get 10 books to choose from
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Pick a random book
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    console.error('Error getting random book:', error);
    return null;
  }
}

// Handle notification action (when user taps on notification)
function handleBookNotificationAction(notification: any) {
  const data = notification.notification.data || {};
  
  if (data.type === 'book' && data.bookId) {
    // Dispatch a custom event that the app can listen for
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('bookNotificationNavigation', { 
        detail: { type: 'book', id: data.bookId }
      });
      window.dispatchEvent(event);
    }
  }
}

// Handle app reopening after being closed
export function handleAppReopen(pauseDuration: number) {
  // If app was closed for more than 24 hours, schedule a notification
  if (pauseDuration >= BOOK_NOTIFICATION_INTERVAL) {
    // Schedule notification for 24 hours from now
    scheduleBookNotification();
  }
}
