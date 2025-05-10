import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bookmark, Trash2 } from 'lucide-react';

interface Bookmark {
  pageNumber: number;
  surahName?: string;
  timestamp: number;
}

interface BookmarksManagerProps {
  onClose: () => void;
  onSelectBookmark: (pageNumber: number) => void;
}

export const BookmarksManager: React.FC<BookmarksManagerProps> = ({ onClose, onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    // Load bookmarks from localStorage
    const storedBookmarks = localStorage.getItem('quran-bookmarks');
    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks));
      } catch (err) {
        console.error('Error parsing bookmarks:', err);
        setBookmarks([]);
      }
    }
  }, []);

  const handleRemoveBookmark = (pageNumber: number) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.pageNumber !== pageNumber);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('quran-bookmarks', JSON.stringify(updatedBookmarks));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <div className="flex items-center space-x-2">
              <Bookmark size={20} />
              <h2 className="text-xl font-semibold">Bookmarks</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-white/80 text-sm">
            Your saved Quran pages
          </p>
        </div>

        <div className="p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                You don't have any bookmarks yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add bookmarks while reading to save your progress
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.pageNumber}
                  className="bg-[#F8F0E3] dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectBookmark(bookmark.pageNumber);
                      onClose();
                    }}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Page {bookmark.pageNumber}
                    </h3>
                    {bookmark.surahName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {bookmark.surahName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(bookmark.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.pageNumber)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
