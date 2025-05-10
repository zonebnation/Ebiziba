import { findSurahByPage } from '../lib/quran-api';

interface QuranBookmark {
  pageNumber: number;
  surahName?: string;
  timestamp: number;
}

// Add a bookmark
export function addBookmark(pageNumber: number): void {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) return;
  
  try {
    // Get existing bookmarks
    const bookmarks = getBookmarks();
    
    // Check if bookmark already exists
    if (bookmarks.some(b => b.pageNumber === pageNumber)) {
      return; // Already bookmarked
    }
    
    // Find surah info for this page
    const surah = findSurahByPage(pageNumber);
    
    // Create new bookmark
    const newBookmark: QuranBookmark = {
      pageNumber,
      surahName: surah ? `${surah.surahName} (${surah.surahNameArabic})` : undefined,
      timestamp: Date.now()
    };
    
    // Add to bookmarks and save
    bookmarks.push(newBookmark);
    saveBookmarks(bookmarks);
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

// Remove a bookmark
export function removeBookmark(pageNumber: number): void {
  try {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(b => b.pageNumber !== pageNumber);
    saveBookmarks(updatedBookmarks);
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

// Check if a page is bookmarked
export function isBookmarked(pageNumber: number): boolean {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.pageNumber === pageNumber);
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
}

// Get all bookmarks
export function getBookmarks(): QuranBookmark[] {
  try {
    const storedBookmarks = localStorage.getItem('quran-bookmarks');
    return storedBookmarks ? JSON.parse(storedBookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
}

// Save bookmarks to localStorage
function saveBookmarks(bookmarks: QuranBookmark[]): void {
  try {
    localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}
