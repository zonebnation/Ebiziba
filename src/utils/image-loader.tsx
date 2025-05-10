/**
 * Utility for optimized image loading and caching
 * Helps with reliable image loading across different devices
 */

import { Capacitor } from '@capacitor/core';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../lib/device-detection';
import React from 'react';

// Cache for preloaded images
const imageCache = new Map<string, HTMLImageElement>();

// Maximum number of images to keep in memory cache
const MAX_CACHE_SIZE = 30;

// Fallback image URL
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x200?text=Image+Not+Available';

/**
 * Load an image with retry mechanism and fallbacks
 * @param src Original image URL
 * @param fallbackSrc Optional fallback URL if original fails
 * @param maxRetries Maximum number of retry attempts
 * @returns Promise that resolves to the loaded image URL
 */
export async function loadImage(
  src: string, 
  fallbackSrc: string = FALLBACK_IMAGE,
  maxRetries: number = 3
): Promise<string> {
  // Check if image is already in cache
  if (imageCache.has(src)) {
    return src;
  }
  
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    
    const tryLoad = () => {
      const img = new Image();
      
      img.onload = () => {
        // Add to cache
        imageCache.set(src, img);
        
        // Trim cache if needed
        if (imageCache.size > MAX_CACHE_SIZE) {
          const firstKey = imageCache.keys().next().value;
          imageCache.delete(firstKey);
        }
        
        resolve(src);
      };
      
      img.onerror = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retry ${retryCount} loading image: ${src}`);
          setTimeout(tryLoad, 1000); // Wait 1 second before retry
        } else if (fallbackSrc && fallbackSrc !== src) {
          console.log(`Using fallback for image: ${src}`);
          resolve(fallbackSrc);
        } else {
          console.error(`Failed to load image after ${maxRetries} retries: ${src}`);
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      
      // Add cache busting for some devices
      const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
      img.src = cacheBuster;
    };
    
    tryLoad();
  });
}

/**
 * React hook for loading images with fallbacks
 * @param src Original image URL
 * @param fallbackSrc Optional fallback URL
 * @returns Object with loaded image URL and loading state
 */
export function useImageLoader(src: string, fallbackSrc: string = FALLBACK_IMAGE) {
  const [imageUrl, setImageUrl] = React.useState<string>(src);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { deviceInfo } = useDevice();
  
  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Add special handling for tablets
    const isTablet = deviceInfo.type === DeviceType.TABLET;
    const maxRetries = isTablet ? 5 : 3; // More retries for tablets
    
    loadImage(src, fallbackSrc, maxRetries)
      .then(url => {
        setImageUrl(url);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Image loading error:', err);
        setImageUrl(fallbackSrc);
        setError(err.message);
        setIsLoading(false);
      });
  }, [src, fallbackSrc, deviceInfo.type]);
  
  return { imageUrl, isLoading, error };
}

/**
 * Optimized image component with loading and error handling
 */
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, fallbackSrc = FALLBACK_IMAGE, className = '', onLoad, onError }) => {
  const { imageUrl, isLoading, error } = useImageLoader(src, fallbackSrc);
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={alt} 
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => {
          onLoad?.();
        }}
        onError={() => {
          onError?.();
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400 text-center p-2">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Preload multiple images
 * @param urls Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => 
    loadImage(url).catch(err => {
      console.warn(`Failed to preload image: ${url}`, err);
      return null;
    })
  );
  
  return Promise.all(promises).then(() => {});
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}

// Make cache available globally for memory management
if (typeof window !== 'undefined') {
  (window as any).imageCache = {
    clear: clearImageCache
  };
}
