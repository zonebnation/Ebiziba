import React, { useState, useEffect } from 'react';
import { BookOpen, Video, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface QuickActionsProps {
  onNavigate: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const [bookCount, setBookCount] = useState<number | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch book count
        const { count: booksCount, error: booksError } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true });
        
        if (booksError) throw booksError;
        setBookCount(booksCount);
        
        // Fetch video count
        const { count: videosCount, error: videosError } = await supabase
          .from('reels')
          .select('*', { count: 'exact', head: true });
        
        if (videosError) throw videosError;
        setVideoCount(videosCount);
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  const formatCount = (count: number | null): string => {
    if (count === null) return 'Loading...';
    if (count === 0) return 'No items yet';
    if (count === 1) return '1 item';
    return `${count}+ items`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-4"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card p-6 card-hover cursor-pointer group"
        onClick={() => onNavigate('library')}
      >
        <div className="w-12 h-12 rounded-2xl primary-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <BookOpen size={24} className="text-white" />
        </div>
        <h3 className="font-semibold text-surface-800 dark:text-white text-lg">Ebitabo</h3>
        <p className="text-sm text-surface-500 dark:text-gray-400 mt-1">
          {loading ? 'Loading...' : bookCount === 1 ? '1 ekitabo' : `${bookCount}+ ebitabo`}
        </p>
        <div className="mt-4 flex items-center text-primary-500">
          <span className="text-sm font-medium">Laba</span>
          <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
      

    </motion.div>
  );
};
