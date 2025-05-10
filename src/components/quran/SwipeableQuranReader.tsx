import React, { useState, useEffect, useRef } from 'react';
import { Book, Settings, Loader, AlertCircle, List, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSurahs, fetchPage, useQuranPreferences, type Surah, type Page } from '../../lib/quran-api';
import { SurahList } from './SurahList';
import { PageTurner } from './PageTurner';
import { addBookmark, isBookmarked, removeBookmark } from '../../utils/quran-bookmarks';
import QuranAudioService from '../../lib/quran-audio-service';
import { preloadQuranPageRange, downloadQuranPagesForOffline } from '../../utils/quran-image-loader';
import { Capacitor } from '@capacitor/core';

interface SwipeableQuranReaderProps {
  onChangeLanguage?: () => void;
  onOpenBookmarks?: () => void;
}

export const SwipeableQuranReader: React.FC<SwipeableQuranReaderProps> = ({ 
  onChangeLanguage,
  onOpenBookmarks
}) => {
  const { reciterId, lastReadPage, setLastReadPage } = useQuranPreferences();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSurahList, setShowSurahList] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [backgroundAudio, setBackgroundAudio] = useState<boolean>(true);
  const [pageCache, setPageCache] = useState<Map<number, Page>>(new Map());
  const [showDownloadDialog, setShowDownloadDialog] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  // Audio service reference
  const audioService = useRef<QuranAudioService>(QuranAudioService.getInstance());
  
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
        
        // Initialize audio service
        const service = audioService.current;
        
        // Set reciter
        service.setReciter(reciterId);
        
        // Load auto-advance preference
        const savedAutoAdvance = localStorage.getItem('quran-auto-advance');
        if (savedAutoAdvance !== null) {
          const autoAdvanceValue = savedAutoAdvance === 'true';
          setAutoAdvance(autoAdvanceValue);
          service.setAutoAdvance(autoAdvanceValue);
        } else {
          service.setAutoAdvance(true);
        }
        
        // Set up callbacks
        service.onPageComplete((nextPage) => {
          loadPage(nextPage);
        });
        
        service.onPlayStateChange((playing) => {
          setIsPlaying(playing);
          setIsLoadingAudio(false);
        });
        
        service.onLoadingStateChange((loading) => {
          setIsLoadingAudio(loading);
        });
      } catch (err) {
        console.error('Error initializing Quran reader:', err);
        setError('Waliwo ekisobu mu kutandika Quran reader. Gezaako nate.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
    
    // Cleanup
    return () => {
      // Only stop audio if background audio is disabled
      if (!backgroundAudio) {
        audioService.current.stop();
      }
      
      // Clear callbacks
      audioService.current.onPageComplete(null);
      audioService.current.onPlayStateChange(null);
      audioService.current.onLoadingStateChange(null);
    };
  }, [lastReadPage, reciterId]);

  // Update reciter when it changes
  useEffect(() => {
    audioService.current.setReciter(reciterId);
  }, [reciterId]);

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

      // Check if page is in cache
      if (pageCache.has(pageNumber)) {
        setCurrentPage(pageCache.get(pageNumber)!);
        setLastReadPage(pageNumber);
        setLoading(false);
        
        // Preload adjacent pages
        preloadQuranPageRange(pageNumber, 5);
        return;
      }

      const pageData = await fetchPage(pageNumber);
      if (!pageData) throw new Error(`Failed to load page ${pageNumber}`);

      // Add to cache
      setPageCache(prev => {
        const newCache = new Map(prev);
        newCache.set(pageNumber, pageData);
        // Limit cache size to 20 pages
        if (newCache.size > 20) {
          // Remove oldest entry that's not near current page
          const keysToConsiderForRemoval = Array.from(newCache.keys())
            .filter(key => Math.abs(key - pageNumber) > 5)
            .sort((a, b) => a - b);
          
          if (keysToConsiderForRemoval.length > 0) {
            newCache.delete(keysToConsiderForRemoval[0]);
          }
        }
        return newCache;
      });

      setCurrentPage(pageData);
      setLastReadPage(pageNumber);
      
      // Preload adjacent pages
      preloadQuranPageRange(pageNumber, 5);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Waliwo ekisobu mu kulaba olupapula. Gezaako nate.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurahSelect = async (surah: Surah) => {
    try {
      // Stop current playback
      audioService.current.stop();
      
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
      setError('Waliwo ekisobu mu kulonda surah. Gezaako nate.');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!currentPage) return;
      
      if (!isPlaying) {
        setIsLoadingAudio(true);
        await audioService.current.playPage(currentPage.pageNumber);
      } else {
        audioService.current.pause();
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
      setError('Waliwo ekisobu mu kuzanya audio. Gezaako nate.');
      setIsLoadingAudio(false);
    }
  };

  const nextPage = () => {
    if (currentPage && currentPage.pageNumber < 604) {
      // Stop current playback
      audioService.current.stop();
      loadPage(currentPage.pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (currentPage && currentPage.pageNumber > 1) {
      // Stop current playback
      audioService.current.stop();
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

  const toggleAutoAdvance = () => {
    const newValue = !autoAdvance;
    setAutoAdvance(newValue);
    audioService.current.setAutoAdvance(newValue);
    localStorage.setItem('quran-auto-advance', newValue.toString());
  };

  const toggleBackgroundAudio = () => {
    const newValue = !backgroundAudio;
    setBackgroundAudio(newValue);
    localStorage.setItem('quran-background-audio', newValue.toString());
  };

  const handleDownloadPages = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('Okukuŋŋaanya olupapula kusoboka ku kifuufu kyokka');
      return;
    }
    
    try {
      setIsDownloading(true);
      setDownloadProgress({ current: 0, total: 10 });
      
      const result = await downloadQuranPagesForOffline(
        1, 
        10, 
        (current, total) => setDownloadProgress({ current, total })
      );
      
      if (result.success > 0) {
        // Show success message
        setError(`Olupapula ${result.success} lukuŋŋaanyiziddwa. ${result.failed > 0 ? `Olupapula ${result.failed} lulemeddwa.` : ''}`);
      } else {
        setError('Waliwo ekisobu mu kukuŋŋaanya olupapula');
      }
    } catch (err) {
      console.error('Error downloading pages:', err);
      setError('Waliwo ekisobu mu kukuŋŋaanya olupapula');
    } finally {
      setIsDownloading(false);
      setShowDownloadDialog(false);
    }
  };

  if (loading && !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-10 h-10 text-[#8B4513] animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Quran etunduluzibwa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F0E3] dark:bg-gray-900">
      {/* Audio notification when playing in background */}
      {isPlaying && (
        <div className="fixed top-0 left-0 right-0 bg-[#8B4513] text-white py-1 px-4 text-sm flex items-center justify-between z-50">
          <span>Quran recitation playing</span>
          <button 
            onClick={() => audioService.current.stop()}
            className="p-1 bg-white/20 rounded-full"
          >
            <VolumeX size={16} />
          </button>
        </div>
      )}
      
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
                <h1 className="text-2xl font-bold text-[#8B4513] dark:text-white">The Holy Quran</h1>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowSurahList(false)}
                    className="p-2 rounded-lg bg-[#8B4513] text-white"
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
            <div className="bg-[#8B4513] text-white p-6 rounded-b-[2rem]">
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
                <div className="flex space-x-2">
                  <button
                    onClick={onOpenBookmarks}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Bookmark size={20} />
                  </button>
                  <button
                    onClick={onChangeLanguage}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Settings size={20} />
                  </button>
                </div>
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
              
              {/* Download button for Android */}
              {Capacitor.isNativePlatform() && (
                <button
                  onClick={() => setShowDownloadDialog(true)}
                  className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-sm flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Kuŋŋaanya Olupapula</span>
                </button>
              )}
            </div>
            
            {/* Page Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-[#8B4513] animate-spin" />
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      if (currentPage) {
                        loadPage(currentPage.pageNumber);
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-[#8B4513] text-white rounded-lg"
                  >
                    Gezaako Nate
                  </button>
                </div>
              ) : currentPage ? (
                <PageTurner
                  currentPage={currentPage}
                  onNextPage={nextPage}
                  onPreviousPage={previousPage}
                  isBookmarked={bookmarked}
                  onToggleBookmark={toggleBookmark}
                  isPlaying={isPlaying}
                  onToggleAudio={toggleAudio}
                  isLastPage={currentPage.pageNumber >= 604}
                  isFirstPage={currentPage.pageNumber <= 1}
                />
              ) : null}
            </div>

            {/* Audio Settings */}
            <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isLoadingAudio ? (
                    <Loader size={18} className="text-[#8B4513] animate-spin" />
                  ) : (
                    <Volume2 size={18} className="text-[#8B4513]" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isLoadingAudio ? "Audio etunduluzibwa..." : "Audio Settings"}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Auto-advance</span>
                    <button 
                      onClick={toggleAutoAdvance}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        autoAdvance ? 'bg-[#8B4513]' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span 
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          autoAdvance ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Background play</span>
                    <button 
                      onClick={toggleBackgroundAudio}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        backgroundAudio ? 'bg-[#8B4513]' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span 
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          backgroundAudio ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Download Dialog */}
      <AnimatePresence>
        {showDownloadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Kuŋŋaanya Olupapula lwa Quran
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Kino kijja kukuŋŋaanya olupapula lwa Quran ku kifuufu kyo osobole okulaba nga tolina data.
                </p>
                
                {isDownloading && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                      Olupapula {downloadProgress.current} ku {downloadProgress.total}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDownloadDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={isDownloading}
                  >
                    Sazaamu
                  </button>
                  <button
                    onClick={handleDownloadPages}
                    disabled={isDownloading}
                    className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <span className="flex items-center justify-center">
                        <Loader size={16} className="mr-2 animate-spin" />
                        Kuŋŋaanya...
                      </span>
                    ) : (
                      "Kuŋŋaanya"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwipeableQuranReader;
