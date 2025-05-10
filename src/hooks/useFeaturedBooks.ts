import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];

const CACHE_KEY = 'featured_books_cache';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

interface CacheData {
  timestamp: number;
  books: Book[];
}

export function useFeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedBooks = (): CacheData | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

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

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      setBooks(data || []);
      setCachedBooks(data || []);
    } catch (err) {
      console.error('Error fetching featured books:', err);
      setError('Failed to load featured books');
      
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
