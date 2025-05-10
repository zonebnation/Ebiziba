import React from 'react';
import { FileText, Lock } from 'lucide-react';
import type { Article } from '../types';

const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Engeri y\'okusaala esswala ettaano',
    content: 'Okunnyonnyola okujjuvu ku ngeri y\'okusaala esswala ettaano ez\'obukulu...',
    author: 'Sheikh Umar Nsereko',
    date: '2024-03-15',
    category: 'Esswala',
    isPremium: true
  },
  {
    id: '2',
    title: 'Okusiiba omwezi gwa Ramadhan',
    content: 'Ebikwata ku kusiiba n\'engeri y\'okukutuukiriza...',
    author: 'Sheikh Umar Nsereko',
    date: '2024-03-14',
    category: 'Okusiiba',
    isPremium: false
  }
];

export const Articles: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ebibuuzo n'Okuddibwamu</h1>
      <div className="space-y-4">
        {SAMPLE_ARTICLES.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{article.title}</h3>
              {article.isPremium && (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Lock size={12} className="mr-1" />
                  Premium
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {article.author} • {new Date(article.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.content}</p>
            <button 
              className={`w-full flex items-center justify-center py-2 px-4 rounded-lg ${
                article.isPremium 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-green-600 text-white'
              }`}
            >
              <FileText size={16} className="mr-2" />
              {article.isPremium ? 'Sasula Osome' : 'Soma'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
