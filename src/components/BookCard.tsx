import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { OptimizedImage } from '../utils/image-loader';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];

interface BookCardProps {
  book: Book;
  isPurchased: boolean;
  trial?: { isActive: boolean; trialEnd?: string };
  onClick: () => void;
  onPurchase: () => void;
  className?: string;
  imageHeight?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isPurchased,
  trial,
  onClick,
  onPurchase,
  className = '',
  imageHeight = 'h-48'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden ${className}`}
    >
      <div className="relative">
        <OptimizedImage
          src={book.cover_url}
          alt={book.title}
          className={`w-full ${imageHeight} object-cover`}
          fallbackSrc="https://via.placeholder.com/300x400?text=Book+Cover"
        />
        {trial?.isActive && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
            Okugezesa kuggwaako mu {formatDistanceToNow(new Date(trial.trialEnd!))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {book.author}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
          {book.description}
        </p>
        {!isPurchased && !trial?.isActive && (
          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
            {book.digital_price.toLocaleString()} UGX
          </p>
        )}
        {isPurchased || trial?.isActive ? (
          <button
            onClick={onClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {trial?.isActive ? 'Weyongere n\'Okugezesa' : 'Soma Kati'}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={onClick}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Tandika Okugezesa
            </button>
            <button
              onClick={onPurchase}
              className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Gula
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
