import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Bookmark, PlayCircle, PauseCircle, Loader, AlertCircle } from 'lucide-react';
import { Page } from '../../lib/quran-api';
import QuranAudioService from '../../lib/quran-audio-service';
import { getQuranImageUrl } from '../../utils/quran-image-loader';

interface PageTurnerProps {
  currentPage: Page;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isPlaying: boolean;
  onToggleAudio: () => void;
  isLastPage: boolean;
  isFirstPage: boolean;
}

export const PageTurner: React.FC<PageTurnerProps> = ({
  currentPage,
  onNextPage,
  onPreviousPage,
  isBookmarked,
  onToggleBookmark,
  isPlaying,
  onToggleAudio,
  isLastPage,
  isFirstPage
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const audioService = useRef(QuranAudioService.getInstance());
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
    setRetryCount(0);
    
    // Show swipe hint if it's the first time
    if (!localStorage.getItem('quran-swipe-hint-shown')) {
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('quran-swipe-hint-shown', 'true');
      }, 3000);
    }
    
    // Set up audio service page complete callback
    audioService.current.onPageComplete((nextPage) => {
      if (!isLastPage) {
        onNextPage();
      }
    });
    
    return () => {
      // Clean up
      audioService.current.onPageComplete(null);
    };
  }, [currentPage.pageNumber, isLastPage, onNextPage]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
    setRetryCount(0);
  };

  const handleImageError = () => {
    // Try next source with retry mechanism
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setImageError(false);
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  };

  const handleRetry = () => {
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isLastPage) {
        setSwipeDirection('left');
        onNextPage();
      }
    },
    onSwipedRight: () => {
      if (!isFirstPage) {
        setSwipeDirection('right');
        onPreviousPage();
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  return (
    <div className="relative" {...swipeHandlers}>
      {/* Book Container */}
      <div className="relative mx-auto max-w-md overflow-hidden perspective-1000">
        {/* Book Spine and Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#8B4513]/40 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/10 to-transparent z-10"></div>
        
        {/* Book Page */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage.pageNumber}
            initial={{ 
              opacity: 0, 
              x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0,
              rotateY: swipeDirection === 'left' ? 15 : swipeDirection === 'right' ? -15 : 0
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              rotateY: 0
            }}
            exit={{ 
              opacity: 0, 
              x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0,
              rotateY: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="relative bg-[#FFF8E1] dark:bg-[#E8DFC4] rounded-lg overflow-hidden shadow-xl"
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              transformOrigin: swipeDirection === 'left' ? 'left center' : 'right center'
            }}
          >
            {/* Page Background Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581022295087-35e593704911?q=80&w=1000')] bg-cover opacity-5"></div>
            
            {/* Page Border */}
            <div className="absolute inset-0 border-8 border-[#E8DFC4]/50 dark:border-[#D4C9A8]/50 rounded-lg pointer-events-none"></div>
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#FFF8E1] dark:bg-[#E8DFC4] z-20">
                <Loader className="w-10 h-10 text-[#8B4513] animate-spin" />
              </div>
            )}
            
            {/* Error State */}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF8E1] dark:bg-[#E8DFC4] p-4 z-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-500 text-center mb-4">Waliwo ekisobu mu kulaba olupapula luno</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-[#8B4513] text-white rounded-lg"
                >
                  Gezaako Nate
                </button>
              </div>
            )}
            
            {/* Page Image */}
            <img
              ref={imageRef}
              src={getQuranImageUrl(currentPage.pageNumber, retryCount)}
              alt={`Quran Page ${currentPage.pageNumber}`}
              className="w-full"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                opacity: isLoading || imageError ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
            />
            
            {/* Page Decorative Border */}
            <div className="absolute inset-0 pointer-events-none border-8 border-[#FFF8E1]/80 dark:border-[#E8DFC4]/80 rounded-lg"></div>
            
            {/* Bookmark Indicator */}
            {isBookmarked && (
              <div className="absolute -top-1 right-8 transform -translate-y-1/2">
                <div className="w-8 h-16 bg-red-500 rounded-b-lg shadow-md"></div>
              </div>
            )}
            
            {/* Page Curl Effect (when swiping) */}
            {swipeDirection && (
              <div 
                className={`absolute inset-0 bg-gradient-to-${swipeDirection === 'left' ? 'l' : 'r'} from-transparent to-black/10 pointer-events-none`}
                style={{
                  opacity: 0.3,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Page Number */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#8B4513]/80 text-white px-4 py-1 rounded-full text-sm">
          {currentPage.pageNumber} / 604
        </div>
      </div>
      
      {/* Swipe Hint */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-30"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg text-center">
            <p className="text-gray-800 dark:text-white font-medium">
              Swipe left or right to turn pages
            </p>
            <div className="flex justify-center space-x-8 mt-4">
              <motion.div
                animate={{ x: [-10, 0, -10] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center"
              >
                <span className="text-2xl">👈</span>
                <span className="ml-2">Previous</span>
              </motion.div>
              <motion.div
                animate={{ x: [10, 0, 10] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center"
              >
                <span className="mr-2">Next</span>
                <span className="text-2xl">👉</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Page Turn Indicators */}
      <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start opacity-0 hover:opacity-30 transition-opacity">
        {!isFirstPage && (
          <div className="w-10 h-10 bg-[#8B4513]/20 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ x: [-5, 0, -5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ←
            </motion.div>
          </div>
        )}
      </div>
      
      <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-end opacity-0 hover:opacity-30 transition-opacity">
        {!isLastPage && (
          <div className="w-10 h-10 bg-[#8B4513]/20 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ x: [5, 0, 5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              →
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-6 flex justify-center space-x-6">
        <button
          onClick={onToggleBookmark}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md"
        >
          <Bookmark 
            size={24} 
            className={`${isBookmarked ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
          />
        </button>
        
        <button
          onClick={onToggleAudio}
          className="p-3 bg-[#8B4513] rounded-full shadow-md"
          disabled={isLoading}
        >
          {isPlaying ? (
            <PauseCircle size={24} className="text-white" />
          ) : (
            <PlayCircle size={24} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
