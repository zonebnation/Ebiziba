import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];

const CACHE_KEY = 'recommended_books_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  timestamp: number;
  books: Book[];
}

export function useRecommendedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRamadan = () => {
    const now = new Date();
    const ramadanStart = new Date('2024-03-10');
    const ramadanEnd = new Date('2024-04-09');
    return now >= ramadanStart && now <= ramadanEnd;
  };

  const isZakatSeason = () => {
    const now = new Date();
    return now.getMonth() === 11; // December
  };

  const getCachedBooks = (): CacheData | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  };

  const setCachedBooks = (books: Book[]) => {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      books
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchBooks = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = getCachedBooks();
        if (cached) {
          setBooks(cached.books);
          setLoading(false);
          return;
        }
      }

      let query = supabase.from('books').select('*');

      // Filter based on season
      if (isRamadan()) {
        query = query.ilike('title', '%ramadhan%');
      } else if (isZakatSeason()) {
        query = query.ilike('title', '%zakat%');
      } else {
        // For non-seasonal periods, get random books
        query = query.limit(3).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // If no seasonal books found, get general books
      if (data.length === 0) {
        const { data: generalBooks, error: generalError } = await supabase
          .from('books')
          .select('*')
          .limit(3)
          .order('created_at', { ascending: false });

        if (generalError) throw generalError;
        setBooks(generalBooks || []);
        setCachedBooks(generalBooks || []);
      } else {
        setBooks(data);
        setCachedBooks(data);
      }
    } catch (err) {
      console.error('Error fetching recommended books:', err);
      setError('Failed to load recommended books');
      
      // Try to use cached data as fallback
      const cached = getCachedBooks();
      if (cached) {
        setBooks(cached.books);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, loading, error, refreshBooks: () => fetchBooks(true) };
}
