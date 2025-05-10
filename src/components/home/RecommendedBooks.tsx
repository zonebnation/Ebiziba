import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight, Loader, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecommendedBooks } from '../../hooks/useRecommendedBooks';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface RecommendedBooksProps {
  onNavigate: (tab: string) => void;
}

export const RecommendedBooks: React.FC<RecommendedBooksProps> = ({ onNavigate }) => {
  const { books, loading, error, refreshBooks } = useRecommendedBooks();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const { user } = useAuth();
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Get seasonal title based on current date
  const getSeasonalTitle = () => {
    const now = new Date();
    const ramadanStart = new Date('2024-03-10');
    const ramadanEnd = new Date('2024-04-09');

    if (now >= ramadanStart && now <= ramadanEnd) {
      return {
        title: 'Ebitabo Bya Ramadhan',
        subtitle: 'Okuyiga ku mwezi omutukuvu'
      };
    } else if (now.getMonth() === 11) {
      return {
        title: 'Ebitabo Bya Zakat',
        subtitle: 'Okumanya ku kutongoza emmaali'
      };
    }
    return {
      title: 'Ebitabo Ebikutuukira',
      subtitle: 'Tukulonze ebitabo ebiyinza okukusanyusa'
    };
  };

  // Fetch recently viewed books if user is logged in
  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    }
  }, [user]);

  // Extract and set categories from books when they load
  useEffect(() => {
    if (books && books.length > 0) {
      const categories = Array.from(
        new Set(books.flatMap(book => book.categories || []))
      ).filter(Boolean).slice(0, 3);

      setFeaturedCategories(categories);
      setFilteredBooks(books);
    }
  }, [books]);

  // Filter books when category changes
  useEffect(() => {
    if (books && books.length > 0) {
      if (activeCategory === 'all') {
        setFilteredBooks(books);
      } else {
        setFilteredBooks(
          books.filter(book =>
            book.categories && book.categories.includes(activeCategory)
          )
        );
      }
    }
  }, [activeCategory, books]);

  // Fetch recently viewed books from the database
  const fetchRecentlyViewed = async () => {
    if (!user) return;

    try {
      setLoadingRecent(true);

      const { data, error } = await supabase
        .from('book_access_logs')
        .select('book_id, created_at, books(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (data && data.length > 0) {
        const recentBooks = data.map(log => log.books);
        setRecentlyViewed(recentBooks);
      }
    } catch (err) {
      console.error('Error fetching recently viewed books:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const { title, subtitle } = getSeasonalTitle();

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-500 dark:text-red-400 text-center">
          <p>{error}</p>
          <button
            onClick={refreshBooks}
            className="mt-4 text-sm font-medium hover:text-red-600"
          >
            Gezaako Nate
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-surface-800 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-surface-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <button
          onClick={() => onNavigate('library')}
          className="text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors flex items-center"
        >
          Laba Byonna
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Category filters */}
      {featuredCategories.length > 0 && (
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Byonna
          </button>
          {featuredCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Recently viewed section */}
      {user && recentlyViewed.length > 0 && !loading && !loadingRecent && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Ebyasoma Buli Kaakati
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {recentlyViewed.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg flex"
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="ml-2 flex-1">
                  <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
                  <button
                    onClick={() => onNavigate('library')}
                    className="mt-1 flex items-center text-xs text-primary-500"
                  >
                    <BookOpen size={12} className="mr-1" />
                    Ddamu Osome
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {loading || loadingRecent ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {filteredBooks.slice(0, 4).map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {book.featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                      <Star size={12} className="mr-1" />
                      Featured
                    </div>
                  )}
                  {book.new && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {book.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {book.digital_price.toLocaleString()} UGX
                    </span>
                    <button 
                      onClick={() => onNavigate('library')}
                      className="text-white bg-primary-500 hover:bg-primary-600 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Gula
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('library')}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 bg-surface-50 dark:bg-gray-800 hover:bg-surface-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
          >
            <span className="font-medium">Laba Ebitabo Byonna</span>
            <ArrowRight size={18} />
          </button>
        </>
      )}
    </motion.div>
  );
};
