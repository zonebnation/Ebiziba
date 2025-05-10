import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Share2, ArrowLeft } from 'lucide-react';

interface StoryViewerProps {
  story: {
    title: string;
    content: string;
    readTime: number;
  };
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        alert('Sharing is not supported in this browser. You can copy the URL manually.');
        // Could implement a "copy to clipboard" functionality here as an alternative
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <Share2 size={24} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {story.title}
          </h1>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{story.readTime} min read</span>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          {story.content.split('\n').map((paragraph, index) => (
            <p
              key={index}
              className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;
