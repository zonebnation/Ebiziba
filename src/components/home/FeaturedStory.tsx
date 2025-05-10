import React from 'react';
import { motion } from 'framer-motion';
import { BookText, ChevronRight, Clock } from 'lucide-react';
import { useStories } from '../../hooks/useStories';

interface FeaturedStoryProps {
  onNavigate: (tab: string) => void;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({ onNavigate }) => {
  const { stories, loading } = useStories();

  if (loading || !stories.length) return null;

  const featuredStory = stories[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-secondary-500 flex items-center justify-center">
            <BookText size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-800 dark:text-white">Emboozi y'Olunaku</h2>
            <p className="text-xs text-surface-500 dark:text-gray-400">Daily Islamic Story</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {featuredStory.title}
        </h3>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
          <Clock size={14} className="mr-1" />
          <span>Dakiika {featuredStory.readTime} okusoma</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
          {featuredStory.excerpt}
        </p>

        <button
          onClick={() => onNavigate('stories')}
          className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <span>Soma Emboozi Yonna</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
