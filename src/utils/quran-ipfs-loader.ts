// This is a simplified version that doesn't use IPFS
// It uses local assets and fallback URLs instead

// Cache for preloaded images
const imageCache = new Map<number, HTMLImageElement>();

// Maximum number of images to keep in memory cache
const MAX_CACHE_SIZE = 20;

// Fallback image sources (used if primary source fails)
const FALLBACK_SOURCES = [
  (page: string) => `https://quran-images.s3.amazonaws.com/pages/${page}.png`,
  (page: string) => `https://islamic-network.github.io/cdn/quran/images/page${page}.png`
];

// Make cache available globally for memory management
if (typeof window !== 'undefined') {
  window.imageCache = {
    clear: () => {
      imageCache.clear();
    }
  };
}

/**
 * Get URL for a Quran page
 * @param pageNumber The page number
 * @returns URL to the page image
 */
export function getQuranPageUrl(pageNumber: number): string {
  // Format page number with leading zeros
  const formattedPage = pageNumber.toString().padStart(3, '0');
  
  // Return local URL
  return `/assets/quran-pages/${formattedPage}.png`;
}

/**
 * Preload a Quran page image
 * @param pageNumber The page number to preload
 * @returns A promise that resolves when the image is loaded
 */
export function preloadQuranPage(pageNumber: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check if already in cache
    if (imageCache.has(pageNumber)) {
      resolve(imageCache.get(pageNumber)!);
      return;
    }

    // Format page number with leading zeros
    const formattedPage = pageNumber.toString().padStart(3, '0');
    
    // Create new image
    const img = new Image();
    
    img.onload = () => {
      // Add to cache
      imageCache.set(pageNumber, img);
      
      // Trim cache if needed
      if (imageCache.size > MAX_CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
      
      resolve(img);
    };
    
    img.onerror = () => {
      // Try fallback sources
      tryLoadFromFallbacks(formattedPage, 0)
        .then(img => {
          imageCache.set(pageNumber, img);
          resolve(img);
        })
        .catch(reject);
    };
    
    img.src = getQuranPageUrl(pageNumber);
  });
}

/**
 * Try loading an image from fallback sources
 * @param formattedPage Formatted page number (e.g., "001")
 * @param sourceIndex Index of the fallback source to try
 * @returns A promise that resolves with the loaded image
 */
function tryLoadFromFallbacks(formattedPage: string, sourceIndex: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (sourceIndex >= FALLBACK_SOURCES.length) {
      reject(new Error(`Failed to load page ${formattedPage} from all fallback sources`));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      // Try next source
      tryLoadFromFallbacks(formattedPage, sourceIndex + 1)
        .then(resolve)
        .catch(reject);
    };
    
    img.src = FALLBACK_SOURCES[sourceIndex](formattedPage);
  });
}

/**
 * Preload a range of Quran pages
 * @param currentPage The current page number
 * @param range How many pages to preload in each direction
 */
export function preloadQuranPageRange(currentPage: number, range: number = 5): void {
  // Preload pages ahead
  for (let i = 1; i <= range; i++) {
    const nextPage = currentPage + i;
    if (nextPage <= 604) {
      preloadQuranPage(nextPage).catch(() => {
        // Silently fail for preloading
      });
    }
  }
  
  // Preload pages behind
  for (let i = 1; i <= Math.floor(range/2); i++) {
    const prevPage = currentPage - i;
    if (prevPage >= 1) {
      preloadQuranPage(prevPage).catch(() => {
        // Silently fail for preloading
      });
    }
  }
}

/**
 * Clear the image cache
 */
export function clearQuranImageCache(): void {
  imageCache.clear();
}

/**
 * Force reload an image in the cache
 * @param pageNumber The page number to reload
 */
export function reloadQuranPage(pageNumber: number): void {
  // Remove from cache
  imageCache.delete(pageNumber);
  
  // Preload again
  preloadQuranPage(pageNumber).catch(console.error);
}
