import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Dua } from '../types';

const SAMPLE_DUAS: Dua[] = [
  {
    id: '1',
    title: 'Dua y\'okuzuukuka',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-lathee ahyana ba\'da ma amatana wa-ilayhin-nushoor',
    translation: 'Amatendo gonna ga Allah eyatuzuukiza oluvannyuma lw\'okutussa era gy\'ali gye tulidda.',
    category: 'Okuzuukuka'
  },
  {
    id: '2',
    title: 'Dua y\'okulya',
    arabicText: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    transliteration: 'Bismillahi wa \'ala barakatillah',
    translation: 'Mu linnya lya Allah era ku mikisa gye.',
    category: 'Emmere'
  }
];

export const Duas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Du'a</h1>
      
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Noonya Du'a..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      <div className="space-y-4">
        {SAMPLE_DUAS.map((dua) => (
          <div key={dua.id} className="bg-white rounded-lg shadow-md p-4">
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {dua.category}
            </span>
            <h3 className="font-semibold text-lg mt-2">{dua.title}</h3>
            <p className="text-right font-arabic text-xl my-3 text-gray-800">
              {dua.arabicText}
            </p>
            <p className="text-sm text-gray-600 italic mb-2">
              {dua.transliteration}
            </p>
            <p className="text-sm text-gray-700">
              {dua.translation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
