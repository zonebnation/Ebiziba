import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Define paths for storing Quran data
const BASE_DIR = 'quran';
const PAGES_DIR = `${BASE_DIR}/pages`;
const AUDIO_DIR = `${BASE_DIR}/audio`;
const META_FILE = `${BASE_DIR}/meta.json`;

// Request storage permission
export async function requestStoragePermission(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true; // Always return true for web platform
    }

    // Check if base directory exists first
    try {
      await Filesystem.stat({
        path: BASE_DIR,
        directory: Directory.Documents
      });
      // Directory exists, return true
      return true;
    } catch {
      // Directory doesn't exist, try to create it
      await Filesystem.mkdir({
        path: BASE_DIR,
        directory: Directory.Documents,
        recursive: true
      });
      return true;
    }
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
}

// Create necessary directories for Quran storage
export async function initializeQuranStorage(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) return;

    // Create subdirectories
    await createDirectory(PAGES_DIR);
    await createDirectory(AUDIO_DIR);
    
    // Create metadata file if it doesn't exist
    const metaExists = await fileExists(META_FILE);
    if (!metaExists) {
      await Filesystem.writeFile({
        path: META_FILE,
        data: JSON.stringify({
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
        }),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
    }
  } catch (error) {
    console.error('Error initializing Quran storage:', error);
  }
}

// Check if a specific page is cached locally
export async function isPageCached(pageNumber: number): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) return false;
    
    const pagePath = `${PAGES_DIR}/page_${pageNumber}.json`;
    return await fileExists(pagePath);
  } catch (error) {
    console.error(`Error checking if page ${pageNumber} is cached:`, error);
    return false;
  }
}

// Check if page audio is cached locally
export async function isPageAudioCached(
  reciterId: number,
  pageNumber: number
): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) return false;
    
    const audioPath = `${AUDIO_DIR}/reciter_${reciterId}_page_${formatPageNumber(pageNumber)}.mp3`;
    return await fileExists(audioPath);
  } catch (error) {
    console.error(`Error checking if audio is cached:`, error);
    return false;
  }
}

// Cache a page
export async function cachePage(pageNumber: number, data: any): Promise<string> {
  try {
    if (!Capacitor.isNativePlatform()) return '';
    
    // Ensure directory exists
    await createDirectory(PAGES_DIR);
    
    const pagePath = `${PAGES_DIR}/page_${pageNumber}.json`;
    await Filesystem.writeFile({
      path: pagePath,
      data: JSON.stringify(data),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    
    return pagePath;
  } catch (error) {
    console.error(`Error caching page ${pageNumber}:`, error);
    throw error;
  }
}

// Cache page audio
export async function cachePageAudio(
  reciterId: number,
  pageNumber: number,
  audioData: Blob
): Promise<string> {
  try {
    if (!Capacitor.isNativePlatform()) return '';
    
    // Ensure directory exists
    await createDirectory(AUDIO_DIR);
    
    const audioPath = `${AUDIO_DIR}/reciter_${reciterId}_page_${formatPageNumber(pageNumber)}.mp3`;
    
    // Convert Blob to base64
    const base64Data = await blobToBase64(audioData);
    
    await Filesystem.writeFile({
      path: audioPath,
      data: base64Data,
      directory: Directory.Documents
    });
    
    return audioPath;
  } catch (error) {
    console.error(`Error caching audio:`, error);
    throw error;
  }
}

// Get cached page
export async function getCachedPage(pageNumber: number): Promise<any> {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    
    const pagePath = `${PAGES_DIR}/page_${pageNumber}.json`;
    if (!await fileExists(pagePath)) return null;
    
    const { data } = await Filesystem.readFile({
      path: pagePath,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting cached page ${pageNumber}:`, error);
    return null;
  }
}

// Get cached audio URL
export async function getCachedPageAudioUrl(
  reciterId: number,
  pageNumber: number
): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    
    const audioPath = `${AUDIO_DIR}/reciter_${reciterId}_page_${formatPageNumber(pageNumber)}.mp3`;
    if (!await fileExists(audioPath)) return null;
    
    // Get the full path to the file
    const { uri } = await Filesystem.getUri({
      path: audioPath,
      directory: Directory.Documents
    });
    
    return uri;
  } catch (error) {
    console.error(`Error getting cached audio URL:`, error);
    return null;
  }
}

// Helper function to check if file exists
async function fileExists(path: string): Promise<boolean> {
  try {
    await Filesystem.stat({
      path,
      directory: Directory.Documents
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to create directory if it doesn't exist
async function createDirectory(path: string): Promise<void> {
  try {
    // Check if directory exists first
    try {
      await Filesystem.stat({
        path,
        directory: Directory.Documents
      });
    } catch {
      // Directory doesn't exist, create it
      await Filesystem.mkdir({
        path,
        directory: Directory.Documents,
        recursive: true
      });
    }
  } catch (error) {
    console.error(`Error creating directory ${path}:`, error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper function to format page number for filenames
function formatPageNumber(pageNumber: number): string {
  return pageNumber.toString().padStart(3, '0');
}
