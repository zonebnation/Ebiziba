import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';

interface QuranLanguageSelectorProps {
  onSelectLanguage: (language: 'english' | 'luganda') => void;
}

export const QuranLanguageSelector: React.FC<QuranLanguageSelectorProps> = ({ 
  onSelectLanguage 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#F8F0E3] dark:bg-[#8B4513]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe size={32} className="text-[#8B4513]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Language
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select your preferred language for the Quran
        </p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectLanguage('english')}
          className="w-full bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-between border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F8F0E3] dark:bg-[#8B4513]/20 flex items-center justify-center mr-4">
              <span className="text-lg font-bold text-[#8B4513]">EN</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">English</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quran with English translation</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-[#8B4513]" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectLanguage('luganda')}
          className="w-full bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-between border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F8F0E3] dark:bg-[#8B4513]/20 flex items-center justify-center mr-4">
              <span className="text-lg font-bold text-[#8B4513]">LG</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Luganda</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kulaane mu Luganda</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-[#8B4513]" />
        </motion.button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          You can change the language later in settings
        </p>
      </div>
    </motion.div>
  );
};
