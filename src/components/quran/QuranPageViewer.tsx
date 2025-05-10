import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, PauseCircle, Bookmark, Share2, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPageAudioUrl, useQuranPreferences, findSurahByPage } from '../../lib/quran-api';
import { preloadQuranPage, preloadQuranPageRange, getQuranPageUrl, getIpfsUrl } from '../../utils/quran-ipfs-loader';

interface QuranPageViewerProps {
  pageNumber: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onBookmark?: () => void;
}

export const QuranPageViewer: React.FC<QuranPageViewerProps> = ({
  pageNumber,
  onNextPage,
  onPreviousPage,
  onBookmark
}) => {
  const { reciterId } = useQuranPreferences();
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [surahName, setSurahName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Reset states when page changes
    setIsPlaying(false);
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
    setGatewayIndex(0);
    
    // Find surah info for this page
    const surah = findSurahByPage(pageNumber);
    if (surah) {
      setSurahName(`${surah.surahName} (${surah.surahNameArabic})`);
    } else {
      setSurahName(null);
    }
    
    // Stop audio if playing
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    // Load image from IPFS
    setImageUrl(getIpfsUrl(pageNumber, 0));
    
    // Preload adjacent pages
    preloadQuranPageRange(pageNumber, 5);
  }, [pageNumber]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = getPageAudioUrl(reciterId, pageNumber);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Quran Page ${pageNumber}${surahName ? ` - ${surahName}` : ''}`,
        text: `Reading Quran page ${pageNumber}${surahName ? ` from ${surahName}` : ''}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setRetryCount(0);
  };

  const handleImageError = () => {
    // Try next gateway if available
    if (gatewayIndex < 3) {
      const nextGatewayIndex = gatewayIndex + 1;
      setGatewayIndex(nextGatewayIndex);
      setImageUrl(getIpfsUrl(pageNumber, nextGatewayIndex));
      return;
    }
    
    // If all gateways failed, try fallback sources
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      
      // Try fallback sources
      const formattedPage = pageNumber.toString().padStart(3, '0');
      const fallbackSources = [
        `/assets/quran-pages/${formattedPage}.png`,
        `https://quran-images.s3.amazonaws.com/pages/${formattedPage}.png`,
        `https://islamic-network.github.io/cdn/quran/images/page${formattedPage}.png`
      ];
      
      setImageUrl(fallbackSources[retryCount % fallbackSources.length]);
    } else {
      setImageLoaded(false);
      setImageError(true);
    }
  };

  const retryLoading = () => {
    setRetryCount(0);
    setGatewayIndex(0);
    setImageError(false);
    setImageLoaded(false);
    setImageUrl(getIpfsUrl(pageNumber, 0));
  };

  return (
    <div className="relative">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      {/* Page Image */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader className="w-10 h-10 text-[#8B4513] animate-spin" />
          </div>
        )}
        
        {imageError && (
          <div className="aspect-[3/4] flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center p-4">
            <div>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="mb-2">Failed to load page image from IPFS</p>
              <button 
                onClick={retryLoading}
                className="px-4 py-2 bg-[#8B4513] text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Quran Page ${pageNumber}`}
            className={`w-full ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Surah Name Overlay */}
        {surahName && imageLoaded && (
          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <div className="bg-black/30 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {surahName}
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onPreviousPage}
          disabled={pageNumber <= 1}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onBookmark}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md"
          >
            <Bookmark size={24} className="text-[#8B4513]" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 bg-[#8B4513] rounded-full shadow-md"
          >
            {isPlaying ? (
              <PauseCircle size={24} className="text-white" />
            ) : (
              <PlayCircle size={24} className="text-white" />
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md"
          >
            <Share2 size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        <button
          onClick={onNextPage}
          disabled={pageNumber >= 604}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>
      
      {/* Page Number */}
      <div className="mt-4 text-center">
        <span className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300">
          Page {pageNumber} of 604
        </span>
      </div>
    </div>
  );
};
