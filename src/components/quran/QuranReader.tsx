import React, { useState, useEffect, useRef } from 'react';
import { Book, Bookmark, Settings, PlayCircle, PauseCircle, Loader, AlertCircle, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { fetchSurahs, fetchPage, getPageAudioUrl, useQuranPreferences, type Surah, type Page } from '../../lib/quran-api';
import { SurahList } from './SurahList';
import { addBookmark, isBookmarked, removeBookmark } from '../../utils/quran-bookmarks';

interface QuranReaderProps {
  onChangeLanguage?: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({ onChangeLanguage }) => {
  const { reciterId, lastReadPage, setLastReadPage } = useQuranPreferences();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSurahList, setShowSurahList] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        // Load surahs
        const data = await fetchSurahs();
        setSurahs(data);
        
        // Load last read page if available
        if (lastReadPage) {
          await loadPage(lastReadPage);
        }
      } catch (err) {
        console.error('Error initializing Quran reader:', err);
        setError('Failed to initialize Quran reader. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [lastReadPage]);

  // Check if current page is bookmarked
  useEffect(() => {
    if (currentPage) {
      setBookmarked(isBookmarked(currentPage.pageNumber));
    }
  }, [currentPage]);

  const loadPage = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const pageData = await fetchPage(pageNumber);
      if (!pageData) throw new Error(`Failed to load page ${pageNumber}`);

      setCurrentPage(pageData);
      setLastReadPage(pageNumber);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Failed to load page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurahSelect = async (surah: Surah) => {
    try {
      stopPlayback();
      
      if (!surah || !surah.id) {
        setError('Invalid surah data');
        return;
      }
      
      if (!surah.startPage) {
        setError(`Could not determine start page for surah ${surah.surahName}`);
        return;
      }

      await loadPage(surah.startPage);
      setShowSurahList(false);
    } catch (err) {
      console.error('Error selecting surah:', err);
      setError('Failed to load surah. Please try again.');
    }
  };

  const playPage = async () => {
    if (!currentPage) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.src = getPageAudioUrl(reciterId, currentPage.pageNumber);
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextPage = () => {
    if (currentPage && currentPage.pageNumber < 604) {
      stopPlayback();
      setSwipeDirection('left');
      loadPage(currentPage.pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (currentPage && currentPage.pageNumber > 1) {
      stopPlayback();
      setSwipeDirection('right');
      loadPage(currentPage.pageNumber - 1);
    }
  };

  const toggleBookmark = () => {
    if (!currentPage) return;
    
    if (bookmarked) {
      removeBookmark(currentPage.pageNumber);
    } else {
      addBookmark(currentPage.pageNumber);
    }
    
    setBookmarked(!bookmarked);
  };

  // Set up swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextPage(),
    onSwipedRight: () => previousPage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    swipeDuration: 500
  });

  if (loading && !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading Quran data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Audio element for recitation */}
      <audio 
        ref={audioRef} 
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />
      
      <AnimatePresence mode="wait">
        {showSurahList ? (
          <motion.div
            key="surah-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">The Holy Quran</h1>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowSurahList(false)}
                    className="p-2 rounded-lg bg-primary-500 text-white"
                  >
                    <Book size={20} />
                  </button>
                  <button 
                    onClick={onChangeLanguage}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>
              
              <SurahList 
                surahs={surahs} 
                onSurahSelect={handleSurahSelect} 
              />
            </div>
          </motion.div>
        ) : (
          <div className="pb-20">
            {/* Page Header */}
            <div className="bg-primary-500 text-white p-6 rounded-b-[2rem]">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowSurahList(true)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <List size={20} />
                </button>
                <h1 className="text-xl font-bold">
                  Page {currentPage?.pageNumber}
                </h1>
                <button
                  onClick={onChangeLanguage}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Settings size={20} />
                </button>
              </div>
              {currentPage?.surahInfo && (
                <div className="text-center">
                  <p className="text-white/90 text-lg">
                    {currentPage.surahInfo.name}
                  </p>
                  <p className="text-white/90 text-sm mt-1">
                    {currentPage.surahInfo.englishName}
                  </p>
                </div>
              )}
            </div>
            
            {/* Page Content with Swipe */}
            <div className="p-4" {...swipeHandlers}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500">{error}</p>
                </div>
              ) : currentPage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage.pageNumber}
                    initial={{ 
                      opacity: 0, 
                      x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0 
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ 
                      opacity: 0, 
                      x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-lg shadow-lg">
                      <img
                        src={currentPage.imageUrl}
                        alt={`Quran Page ${currentPage.pageNumber}`}
                        className="w-full rounded-lg"
                        onError={() => setError(`Failed to load page image ${currentPage.pageNumber}`)}
                      />
                    </div>
                    
                    {/* Bookmark indicator */}
                    {bookmarked && (
                      <div className="absolute top-2 right-2">
                        <Bookmark size={24} className="text-primary-500 fill-primary-500" />
                      </div>
                    )}
                    
                    {/* Swipe Hints */}
                    <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-start opacity-0">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          &larr;
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-end opacity-0">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ x: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          &rarr;
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : null}
              
              {/* Page turning instructions (shown only once) */}
              {currentPage && !localStorage.getItem('quran-swipe-hint-shown') && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg text-center text-sm"
                  onAnimationComplete={() => {
                    setTimeout(() => {
                      localStorage.setItem('quran-swipe-hint-shown', 'true');
                    }, 5000);
                  }}
                >
                  <p className="text-primary-600 dark:text-primary-400">
                    Swipe left or right to turn pages
                  </p>
                </motion.div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="fixed bottom-20 left-0 right-0 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex items-center space-x-4">
                <button
                  onClick={toggleBookmark}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Bookmark 
                    size={24} 
                    className={`${bookmarked ? 'text-primary-500 fill-primary-500' : 'text-gray-600 dark:text-gray-300'}`} 
                  />
                </button>
                
                <button
                  onClick={isPlaying ? stopPlayback : playPage}
                  className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <PauseCircle size={24} className="text-white" />
                  ) : (
                    <PlayCircle size={24} className="text-white" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Page Number Indicator */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300">
                {currentPage?.pageNumber} / 604
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
