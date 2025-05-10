/**
 * Memory management utility to prevent app from going blank
 * after extended periods of use
 */

// Cache of weak references to large objects
const weakCache = new Map<string, WeakRef<any>>();

// Registry to track when objects can be garbage collected
const finalizationRegistry = new FinalizationRegistry((key: string) => {
  weakCache.delete(key);
});

// Maximum number of items to keep in various caches
const MAX_CACHE_SIZES = {
  images: 20,
  pages: 10,
  audio: 5
};

/**
 * Store an object in the weak cache
 * @param key Cache key
 * @param value Object to store
 */
export function storeInWeakCache(key: string, value: any): void {
  const ref = new WeakRef(value);
  weakCache.set(key, ref);
  finalizationRegistry.register(value, key);
}

/**
 * Get an object from the weak cache
 * @param key Cache key
 * @returns The cached object or undefined if not found or collected
 */
export function getFromWeakCache(key: string): any | undefined {
  const ref = weakCache.get(key);
  return ref?.deref();
}

/**
 * Clear all image elements from the DOM that are not visible
 * This helps reduce memory usage from cached images
 */
export function clearHiddenImages(): void {
  try {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Check if image is not visible
      const rect = img.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0 &&
                        rect.left < window.innerWidth && rect.right >= 0;
      
      if (!isVisible && !img.dataset.keepAlive) {
        // For hidden images, remove src to free memory
        const originalSrc = img.src;
        img.dataset.originalSrc = originalSrc;
        img.src = '';
      } else if (img.dataset.originalSrc && isVisible) {
        // Restore src for images that become visible again
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
    });
  } catch (error) {
    console.error('Error clearing hidden images:', error);
  }
}

/**
 * Clear unused audio elements
 */
export function clearUnusedAudio(): void {
  try {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.paused && !audio.dataset.keepAlive) {
        audio.src = '';
        audio.load();
      }
    });
  } catch (error) {
    console.error('Error clearing unused audio:', error);
  }
}

/**
 * Limit the size of a cache to prevent memory leaks
 * @param cache The cache to limit
 * @param maxSize Maximum number of items to keep
 */
export function limitCacheSize<K, V>(cache: Map<K, V>, maxSize: number): void {
  if (cache.size <= maxSize) return;
  
  // Remove oldest entries
  const keysToRemove = Array.from(cache.keys()).slice(0, cache.size - maxSize);
  keysToRemove.forEach(key => cache.delete(key));
}

/**
 * Schedule periodic memory cleanup
 * @param intervalMs Interval in milliseconds between cleanups
 * @returns Function to cancel the scheduled cleanups
 */
export function scheduleMemoryCleanup(intervalMs: number = 60000): () => void {
  const interval = setInterval(() => {
    clearHiddenImages();
    clearUnusedAudio();
    
    // Force garbage collection hint if available
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Ignore if not available
      }
    }
  }, intervalMs);
  
  return () => clearInterval(interval);
}

/**
 * Keep the app alive by forcing small re-renders
 * @param callback Function to call periodically to keep app alive
 * @param intervalMs Interval in milliseconds
 * @returns Function to cancel the keep-alive
 */
export function keepAppAlive(callback: () => void, intervalMs: number = 30000): () => void {
  const interval = setInterval(() => {
    callback();
  }, intervalMs);
  
  return () => clearInterval(interval);
}

/**
 * Monitor memory usage and log warnings if it gets too high
 * @param warningThresholdMB Memory threshold in MB to trigger warnings
 * @param criticalThresholdMB Memory threshold in MB to trigger critical actions
 * @param intervalMs Interval in milliseconds between checks
 * @returns Function to cancel monitoring
 */
export function monitorMemoryUsage(
  warningThresholdMB: number = 100,
  criticalThresholdMB: number = 200,
  intervalMs: number = 30000
): () => void {
  // Only works if performance.memory is available
  if (!window.performance || !(performance as any).memory) {
    return () => {};
  }
  
  const interval = setInterval(() => {
    const memory = (performance as any).memory;
    const usedHeapSizeMB = memory.usedJSHeapSize / (1024 * 1024);
    
    if (usedHeapSizeMB > criticalThresholdMB) {
      console.warn(`Critical memory usage: ${usedHeapSizeMB.toFixed(2)} MB`);
      // Take emergency actions
      clearHiddenImages();
      clearUnusedAudio();
      
      // Clear all image caches
      if (window.imageCache && typeof window.imageCache.clear === 'function') {
        window.imageCache.clear();
      }
      
      // Force reload if extremely critical
      if (usedHeapSizeMB > criticalThresholdMB * 1.5) {
        console.error(`Memory usage critical, reloading app: ${usedHeapSizeMB.toFixed(2)} MB`);
        window.location.reload();
      }
    } else if (usedHeapSizeMB > warningThresholdMB) {
      console.warn(`High memory usage: ${usedHeapSizeMB.toFixed(2)} MB`);
      // Take preventive actions
      clearHiddenImages();
    }
  }, intervalMs);
  
  return () => clearInterval(interval);
}
