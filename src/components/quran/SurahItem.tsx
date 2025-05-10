import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { Surah } from '../../lib/quran-api';

interface SurahItemProps {
  surah: Surah;
  onClick: (surah: Surah) => void;
}

export const SurahItem: React.FC<SurahItemProps> = ({ surah, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(surah)}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#F8F0E3] dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#F8F0E3] dark:bg-[#8B4513]/20 flex items-center justify-center font-medium text-[#8B4513]">
          {surah.id}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {surah.surahName}
            </h3>
            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              {surah.revelationPlace}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {surah.surahNameTranslation} • {surah.totalAyah} verses
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </motion.div>
  );
};
