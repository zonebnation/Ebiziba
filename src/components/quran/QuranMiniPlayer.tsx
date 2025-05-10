import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuranAudioService from '../../lib/quran-audio-service';
import { QuranAudioControls } from './QuranAudioControls';

export const QuranMiniPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const audioService = QuranAudioService.getInstance();
    
    // Set initial states
    setIsPlaying(audioService.isAudioPlaying());
    setCurrentPage(audioService.getCurrentPage());
    
    // Set up listeners
    const playStateListener = (playing: boolean) => {
      setIsPlaying(playing);
    };
    
    const pageChangeListener = (page: number) => {
      setCurrentPage(page);
    };
    
    const loadingStateListener = (loading: boolean) => {
      setIsLoading(loading);
    };
    
    audioService.onPlayStateChange(playStateListener);
    audioService.onPageComplete(pageChangeListener);
    audioService.onLoadingStateChange(loadingStateListener);
    
    return () => {
      // Clean up listeners
      audioService.onPlayStateChange(null);
      audioService.onPageComplete(null);
      audioService.onLoadingStateChange(null);
    };
  }, []);
  
  // Only show if audio is playing
  if (!isPlaying) return null;
  
  return (
    <AnimatePresence>
      {expanded ? (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-0 right-0 z-50"
        >
          <QuranAudioControls />
          <button
            onClick={() => setExpanded(false)}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#8B4513] text-white p-1 rounded-full"
          >
            <ChevronUp size={20} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="minimized"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg z-50 flex items-center justify-between"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center space-x-2 ml-2">
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#8B4513] border-t-transparent animate-spin" />
            ) : (
              <Volume2 size={18} className="text-[#8B4513] animate-pulse" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quran Page {currentPage}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              QuranAudioService.getInstance().togglePlayback();
            }}
            className="p-2 bg-[#8B4513] rounded-full"
          >
            {isPlaying ? (
              <VolumeX size={16} className="text-white" />
            ) : (
              <Volume2 size={16} className="text-white" />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
