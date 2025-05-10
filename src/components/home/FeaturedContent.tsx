import React from 'react';
import { ChevronRight, BookOpen, Clock, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useFeaturedBooks } from '../../hooks/useFeaturedBooks';

interface FeaturedContentProps {
  onNavigate?: (tab: string) => void;
}

export const FeaturedContent: React.FC<FeaturedContentProps> = ({ onNavigate }) => {
  const { books, loading, error, refreshBooks } = useFeaturedBooks();

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="text-red-500 dark:text-red-400 text-center">
          <p>{error}</p>
          <button
            onClick={refreshBooks}
            className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
          >
            Gezaako Nate
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl primary-gradient flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-800 dark:text-white">Ebitabo Ebipya</h2>
            <p className="text-xs text-surface-500 dark:text-gray-400">&nbsp;</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate?.('library')}
          className="text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors flex items-center"
        >
          Laba Byonna
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : (
        <ScrollArea.Root className="w-full">
          <ScrollArea.Viewport className="w-full overflow-x-auto">
            <div className="flex space-x-4 pb-4 min-w-max">
              {books.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-[300px] h-[220px] rounded-3xl overflow-hidden card-hover cursor-pointer group"
                  onClick={() => onNavigate?.('library')}
                >
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                      </div>
                      <span className="text-sm text-white/90 flex items-center backdrop-blur-sm bg-black/20 px-2 py-1 rounded-full">
                        <Clock size={14} className="mr-1" />
                        {book.digital_price.toLocaleString()} UGX
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white line-clamp-2">{book.title}</h3>
                    <p className="text-white/90 text-sm mt-1">{book.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="horizontal"
            className="flex h-1 translate-y-4 touch-none select-none bg-surface-100/50 dark:bg-gray-800/50 rounded-full"
          >
            <ScrollArea.Thumb className="flex-1 bg-surface-300/50 dark:bg-gray-700/50 rounded-full backdrop-blur-sm" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      )}
    </motion.div>
  );
};
