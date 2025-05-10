import React, { useState, useEffect, Suspense } from 'react';
import { BookText, Globe, Settings, AlertCircle, Bookmark, Loader, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuranPreferences } from '../lib/quran-api';
import { lazyLoadQuranComponents } from '../lib/code-splitting';
import { Capacitor } from '@capacitor/core';

// Lazy load components
const { 
  SwipeableQuranReader, 
  QuranSettings, 
  BookmarksManager, 
  QuranLanguageSelector 
} = lazyLoadQuranComponents();

// Lazy load the OfflineDownloadManager
const OfflineDownloadManager = React.lazy(() => import('./quran/OfflineDownloadManager').then(module => ({ default: module.OfflineDownloadManager })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[80vh]">
    <div className="flex flex-col items-center space-y-4">
      <Loader className="w-10 h-10 text-[#8B4513] animate-spin" />
      <p className="text-gray-600 dark:text-gray-300">Quran components etunduluzibwa...</p>
    </div>
  </div>
);

export const Quran: React.FC = () => {
  const { language, setLanguage, lastReadPage, setLastReadPage } = useQuranPreferences();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showDownloadManager, setShowDownloadManager] = useState(false);
  const [showLugandaMessage, setShowLugandaMessage] = useState(false);

  useEffect(() => {
    // Check if language is already set
    if (!language) {
      setShowLanguageSelector(true);
    } else if (language === 'luganda') {
      setShowLugandaMessage(true);
    }
  }, [language]);

  // Function to handle language selection
  const handleLanguageSelect = (selected: 'english' | 'luganda') => {
    setLanguage(selected);
    setShowLanguageSelector(false);
    
    if (selected === 'luganda') {
      setShowLugandaMessage(true);
    } else {
      setShowLugandaMessage(false);
    }
  };

  // Function to handle settings
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // Function to handle bookmarks
  const handleOpenBookmarks = () => {
    setShowBookmarks(true);
  };

  // Function to handle download manager
  const handleOpenDownloadManager = () => {
    setShowDownloadManager(true);
  };

  // Function to handle bookmark selection
  const handleSelectBookmark = (pageNumber: number) => {
    setLastReadPage(pageNumber);
    setShowLugandaMessage(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F0E3] dark:bg-gray-900">
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          {showSettings && (
            <QuranSettings onClose={() => setShowSettings(false)} />
          )}
          
          {showBookmarks && (
            <BookmarksManager 
              onClose={() => setShowBookmarks(false)} 
              onSelectBookmark={handleSelectBookmark}
            />
          )}
          
          {showDownloadManager && Capacitor.isNativePlatform() && (
            <OfflineDownloadManager onClose={() => setShowDownloadManager(false)} />
          )}
          
          {showLanguageSelector ? (
            <QuranLanguageSelector onSelectLanguage={handleLanguageSelect} />
          ) : showLugandaMessage ? (
            <motion.div
              key="luganda-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 flex flex-col items-center justify-center min-h-[80vh]"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Kulaane Mu Luganda Ejja Kujja Mubwangu
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8">
                  Tukola ku kuteekateeka engeri y'okusoma Kulaane mu luganda. Tujja kukumanyisa nga tumaze.
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => setShowLanguageSelector(true)}
                    className="px-4 py-2 bg-[#8B4513] hover:bg-[#6B3003] text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Globe size={18} />
                    <span>Change Language</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('english');
                      setShowLugandaMessage(false);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                  >
                    Use English
                  </button>
                </div>
                
                {Capacitor.isNativePlatform() && (
                  <button
                    onClick={handleOpenDownloadManager}
                    className="mt-8 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors flex items-center justify-center mx-auto"
                  >
                    <Download size={18} className="mr-2" />
                    <span>Kuŋŋaanya Olupapula lwa Quran</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <SwipeableQuranReader 
              onChangeLanguage={handleOpenSettings}
              onOpenBookmarks={handleOpenBookmarks}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};
