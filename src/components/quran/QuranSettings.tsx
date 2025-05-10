import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Check, Globe, SkipForward, Music } from 'lucide-react';
import { useQuranPreferences, fetchReciters, type Reciter } from '../../lib/quran-api';
import { useTheme } from '../../context/ThemeContext';
import QuranAudioService from '../../lib/quran-audio-service';

interface QuranSettingsProps {
  onClose: () => void;
}

export const QuranSettings: React.FC<QuranSettingsProps> = ({ onClose }) => {
  const { language, setLanguage, reciterId, setReciterId } = useQuranPreferences();
  const { theme } = useTheme();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(() => {
    const saved = localStorage.getItem('quran-auto-advance');
    return saved !== null ? saved === 'true' : true;
  });
  const [backgroundAudio, setBackgroundAudio] = useState(() => {
    const saved = localStorage.getItem('quran-background-audio');
    return saved !== null ? saved === 'true' : true;
  });

  // Fetch reciters when component mounts
  useEffect(() => {
    const loadReciters = async () => {
      try {
        setLoading(true);
        const data = await fetchReciters();
        setReciters(data);
      } catch (error) {
        console.error('Error fetching reciters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReciters();
  }, []);

  const handleToggleAutoAdvance = () => {
    const newValue = !autoAdvance;
    setAutoAdvance(newValue);
    localStorage.setItem('quran-auto-advance', newValue.toString());
    QuranAudioService.getInstance().setAutoAdvance(newValue);
  };

  const handleToggleBackgroundAudio = () => {
    const newValue = !backgroundAudio;
    setBackgroundAudio(newValue);
    localStorage.setItem('quran-background-audio', newValue.toString());
  };

  return (
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
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#8B4513] text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Quran Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-white/80 text-sm">
            Customize your Quran reading experience
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe size={20} className="mr-2 text-[#8B4513]" />
              Translation Language
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setLanguage('english')}
                className={`w-full p-4 rounded-lg flex items-center justify-between ${
                  language === 'english'
                    ? 'bg-[#F8F0E3] dark:bg-[#8B4513]/20 border border-[#8B4513]/20 dark:border-[#8B4513]/40'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇺🇸</span>
                  <span className="font-medium text-gray-900 dark:text-white">English</span>
                </div>
                {language === 'english' && (
                  <Check size={20} className="text-[#8B4513]" />
                )}
              </button>

              <button
                onClick={() => setLanguage('luganda')}
                className={`w-full p-4 rounded-lg flex items-center justify-between ${
                  language === 'luganda'
                    ? 'bg-[#F8F0E3] dark:bg-[#8B4513]/20 border border-[#8B4513]/20 dark:border-[#8B4513]/40'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇺🇬</span>
                  <span className="font-medium text-gray-900 dark:text-white">Luganda</span>
                </div>
                {language === 'luganda' && (
                  <Check size={20} className="text-[#8B4513]" />
                )}
              </button>
            </div>
            
            {language === 'luganda' && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                Luganda translation is coming soon. English will be used instead.
              </div>
            )}
          </div>

          {/* Reciter Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Volume2 size={20} className="mr-2 text-[#8B4513]" />
              Reciter
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reciters.map((reciter) => (
                <button
                  key={reciter.id + (reciter.style || '')}
                  onClick={() => setReciterId(reciter.id)}
                  className={`w-full p-3 rounded-lg flex items-center justify-between ${
                    reciterId === reciter.id
                      ? 'bg-[#F8F0E3] dark:bg-[#8B4513]/20 border border-[#8B4513]/20 dark:border-[#8B4513]/40'
                      : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reciter.name}
                    </span>
                    {reciter.style && (
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {reciter.style}
                      </span>
                    )}
                  </div>
                  {reciterId === reciter.id && (
                    <Check size={20} className="text-[#8B4513]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Playback Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Music size={20} className="mr-2 text-[#8B4513]" />
              Audio Playback
            </h3>
            
            <div className="space-y-4">
              {/* Auto-advance setting */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <SkipForward size={18} className="text-[#8B4513]" />
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Auto-advance pages</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically move to next page when audio finishes
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleToggleAutoAdvance}
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Music size={18} className="text-[#8B4513]" />
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Background playback</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Continue playing audio when you leave the Quran section
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleToggleBackgroundAudio}
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

          {/* Bottom Save Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#8B4513] hover:bg-[#6B3003] text-white rounded-xl transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
