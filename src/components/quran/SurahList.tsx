import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Surah } from '../../lib/quran-api';

interface SurahListProps {
  surahs: Surah[];
  onSurahSelect: (surah: Surah) => void;
}

export const SurahList: React.FC<SurahListProps> = ({ surahs, onSurahSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = surahs.filter(surah => 
    searchQuery
      ? surah.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.surahNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.surahNameArabic.includes(searchQuery) ||
        surah.id.toString().includes(searchQuery)
      : true
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search surah by name or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-[#8B4513] dark:focus:border-[#8B4513] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {/* Surahs List */}
      <div className="space-y-2">
        {filteredSurahs.map((surah, index) => (
          <motion.div
            key={surah.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            onClick={() => onSurahSelect(surah)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#F8F0E3] dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E3] dark:bg-[#8B4513]/20 flex items-center justify-center font-medium text-[#8B4513]">
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
        ))}

        {filteredSurahs.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No surahs found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
