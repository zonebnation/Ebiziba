import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Music, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import QuranAudioService from '../../lib/quran-audio-service';

interface QuranAudioControlsProps {
  minimized?: boolean;
  onExpand?: () => void;
}

export const QuranAudioControls: React.FC<QuranAudioControlsProps> = ({ 
  minimized = false,
  onExpand
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [backgroundAudio, setBackgroundAudio] = useState(true);
  
  useEffect(() => {
    const audioService = QuranAudioService.getInstance();
    
    // Set initial states
    setIsPlaying(audioService.isAudioPlaying());
    setIsLoading(audioService.isAudioLoading());
    setCurrentPage(audioService.getCurrentPage());
    setAutoAdvance(audioService.getAutoAdvance());
    
    // Load background audio preference
    const savedBackgroundAudio = localStorage.getItem('quran-background-audio');
    if (savedBackgroundAudio !== null) {
      setBackgroundAudio(savedBackgroundAudio === 'true');
    }
    
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
  
  const togglePlayback = () => {
    const audioService = QuranAudioService.getInstance();
    audioService.togglePlayback();
  };
  
  const toggleAutoAdvance = () => {
    const newValue = !autoAdvance;
    setAutoAdvance(newValue);
    
    const audioService = QuranAudioService.getInstance();
    audioService.setAutoAdvance(newValue);
    
    localStorage.setItem('quran-auto-advance', newValue.toString());
  };
  
  const toggleBackgroundAudio = () => {
    const newValue = !backgroundAudio;
    setBackgroundAudio(newValue);
    localStorage.setItem('quran-background-audio', newValue.toString());
  };
  
  if (minimized) {
    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg z-40"
        onClick={onExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Loader size={18} className="text-[#8B4513] animate-spin" />
            ) : isPlaying ? (
              <Volume2 size={18} className="text-[#8B4513] animate-pulse" />
            ) : (
              <VolumeX size={18} className="text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isPlaying ? 'Quran playing' : 'Quran paused'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
            className="p-2 bg-[#F8F0E3] dark:bg-[#8B4513]/20 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size={16} className="text-[#8B4513] animate-spin" />
            ) : isPlaying ? (
              <VolumeX size={16} className="text-[#8B4513]" />
            ) : (
              <Volume2 size={16} className="text-[#8B4513]" />
            )}
          </button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg z-40"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Loader size={20} className="text-[#8B4513] animate-spin" />
            ) : (
              <Volume2 size={20} className="text-[#8B4513]" />
            )}
            <div>
              <span className="font-medium text-gray-800 dark:text-white">
                Quran Audio
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page {currentPage}
              </p>
            </div>
          </div>
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg ${
              isPlaying 
                ? 'bg-red-500 text-white' 
                : 'bg-[#8B4513] text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : isPlaying ? (
              'Stop'
            ) : (
              'Play'
            )}
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Auto-advance setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SkipForward size={18} className="text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-advance pages
              </span>
            </div>
            <button 
              onClick={toggleAutoAdvance}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoAdvance ? 'bg-[#8B4513]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoAdvance ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
          
          {/* Background audio setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music size={18} className="text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Background playback
              </span>
            </div>
            <button 
              onClick={toggleBackgroundAudio}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                backgroundAudio ? 'bg-[#8B4513]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  backgroundAudio ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
