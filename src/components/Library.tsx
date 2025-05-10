import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Preferences } from '@capacitor/preferences';
import { Lock, BookOpen, Loader, RefreshCw, ArrowLeft, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { purchaseBook, restorePurchases } from '../lib/purchases';
import type { Database } from '../types/supabase';
import { useBookTrial } from '../hooks/useBookTrial';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { useNavigation } from '../context/NavigationContext';
import IPFSService from '../lib/ipfs-service';
import { lazyLoadBookComponents } from '../lib/code-splitting';
import { AuthModal } from './modals/AuthModal';
import { scheduleBookNotification } from '../lib/book-notifications';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../lib/device-detection';

// Lazy load BookViewer component
const { BookViewer } = lazyLoadBookComponents();

type Book = Database['public']['Tables']['books']['Row'];

interface LibraryProps {
  notificationBookId?: string | null;
}

export const Library: React.FC<LibraryProps> = ({ notificationBookId }) => {
  const { user } = useAuth();
  const { goBack } = useNavigation();
  const { deviceInfo } = useDevice();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [restoringPurchases, setRestoringPurchases] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { checkTrialStatus, startTrial, deviceId, isLoading, deviceModified } = useBookTrial();
  const [activeTrials, setActiveTrials] = useState<Record<string, { isActive: boolean; trialEnd?: string }>>({});
  const [ipfsInitialized, setIpfsInitialized] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: 'read' | 'purchase', book: Book} | null>(null);
  const [trialAttempts, setTrialAttempts] = useState<Record<string, number>>({});
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize IPFS service
    const initIpfs = async () => {
      try {
        const ipfsService = IPFSService.getInstance();
        const initialized = await ipfsService.initialize();
        setIpfsInitialized(initialized);
      } catch (error) {
        console.error('Failed to initialize IPFS service:', error);
      }
    };

    initIpfs();

    const loadBooks = async () => {
      try {
        const { value: booksValue } = await Preferences.get({ key: 'books' });
        const { value: lastRefreshValue } = await Preferences.get({ key: 'lastBooksRefresh' });

        let lastRefreshDate: Date | null = null;
        if (lastRefreshValue) {
          lastRefreshDate = new Date(JSON.parse(lastRefreshValue));
        }

        const needsRefresh = !lastRefreshDate || isAfter(new Date(), subDays(lastRefreshDate, -2)); // Check if last refresh was more than 2 days ago

        if (value) {
          const parsedBooks = JSON.parse(value);
 setBooks(parsedBooks);
 if (needsRefresh) {
 fetchBooks(); // Fetch in background if needed
 } else {
          setLoading(false);
        } else {
          fetchBooks();
        }
      } catch (error) {
        console.error('Error loading books from preferences:', error);
        fetchBooks(); // Fallback to fetching from backend on error
      }
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPurchasedBooks();

      // If there was a pending action and user just logged in, execute it
      if (pendingAction) {
        if (pendingAction.type === 'read') {
          handleReadBook(pendingAction.book);
        } else if (pendingAction.type === 'purchase') {
          handlePurchase(pendingAction.book);
        }
        setPendingAction(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if (books.length > 0 && !isLoading) {
      const checkTrials = async () => {
        for (const book of books) {
          try {
            const status = await checkTrialStatus(book);
            if (status.isActive) {
              setActiveTrials(prev => ({
                ...prev,
                [book.id]: { isActive: true, trialEnd: status.trialEnd }
              }));
            } else if (status.message && status.message.includes('Device modification detected')) {
              // Handle device modification detection
              setError('Enkyukakyuka mu kifuufu erabiddwa. Okugezesa okwa bwerere tekusoboka ku bifuufu ebikyusiddwa.');
              break;
            }
          } catch (err) {
            console.error('Error checking trial status:', err);
          }
        }
      };

      checkTrials();
    }
  }, [books, isLoading, deviceId, deviceModified]);

  // Check if a specific book from notification should be opened
  useEffect(() => {
    if (notificationBookId && books.length > 0) {
      const book = books.find(b => b.id === notificationBookId);
      if (book) {
        // Scroll to the book element if it exists
        const bookElement = document.getElementById(`book-${notificationBookId}`);
        if (bookElement) {
          bookElement.scrollIntoView({ behavior: 'smooth' });
        }
        handleReadBook(book);
      }
    }
  }, [notificationBookId, books]);

  async function fetchBooks() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);

      await Preferences.set({ key: 'books', value: JSON.stringify(data) });
 await Preferences.set({ key: 'lastBooksRefresh', value: JSON.stringify(new Date()) });

      // Schedule a notification for a random book
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomBook = data[randomIndex];
        scheduleBookNotification();
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Waliwo ekisobu mu kulaba ebitabo. Gezaako nate oluvannyuma.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPurchasedBooks() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setPurchasedBooks(data.map(item => item.book_id));
    } catch (err) {
      console.error('Error fetching purchased books:', err);
    }
  }

  const handlePurchase = async (book: Book) => {
    if (!user) {
      setPendingAction({ type: 'purchase', book });
      setShowAuthModal(true);
      return;
    }

    try {
      setPurchasing(book.id);
      const isPurchased = await purchaseBook(book);

      if (!isPurchased) {
        throw new Error('Okukakasa okugula kugaanye');
      }

      const { error } = await supabase
        .from('user_books')
        .insert([{ user_id: user.id, book_id: book.id }]);

      if (error) throw error;
      setPurchasedBooks(prev => [...prev, book.id]);

    } catch (err: any) {
      console.error('Error purchasing book:', err);
      setError(err.message || 'Waliwo ekisobu mu kugula ekitabo. Gezaako nate.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setRestoringPurchases(true);
      const entitlements = await restorePurchases();

      const purchasedIds = Object.keys(entitlements)
        .filter(key => key.startsWith('book_'))
        .map(key => key.replace('book_', ''));

      if (purchasedIds.length > 0) {
        const { error } = await supabase
          .from('user_books')
          .upsert(
            purchasedIds.map(bookId => ({
              user_id: user.id,
              book_id: bookId
            }))
          );

        if (error) throw error;
        await fetchPurchasedBooks();
      }
    } catch (err) {
      console.error('Error restoring purchases:', err);
      setError('Waliwo ekisobu mu kuzzawo ebiguliddwa. Gezaako nate.');
    } finally {
      setRestoringPurchases(false);
    }
  };

  const handleReadBook = async (book: Book) => {
    if (!user) {
      setPendingAction({ type: 'read', book });
      setShowAuthModal(true);
      return;
    }

    const isPurchased = purchasedBooks.includes(book.id);
    const trial = activeTrials[book.id];

    if (!isPurchased && !trial?.isActive) {
      try {
        // Check if we've already attempted to start a trial for this book too many times
        const attempts = trialAttempts[book.id] || 0;
        if (attempts >= 3) {
          setError('Ogezezzaako emirundi mingi okutandika okugezesa ekitabo kino. Gula okusobola okweyongera.');
          return;
        }

        // Increment trial attempts
        setTrialAttempts(prev => ({
          ...prev,
          [book.id]: attempts + 1
        }));

        const status = await checkTrialStatus(book);

        if (status.message && status.message.includes('Device modification detected')) {
          setError('Enkyukakyuka mu kifuufu erabiddwa. Okugezesa okwa bwerere tekusoboka ku bifuufu ebikyusiddwa.');
          return;
        }

        if (status.isEligible) {
          const trialStatus = await startTrial(book, user.id);
          if (trialStatus.isActive) {
            setActiveTrials(prev => ({
              ...prev,
              [book.id]: { isActive: true, trialEnd: trialStatus.trialEnd }
            }));
          } else {
            setError(trialStatus.message || 'Tekisobose kutandika kugezesa');
            return;
          }
        } else {
          setError('Ekifuufu kino kimaze okukozesa okugezesa kw\'ekitabo kino. Gula okusobola okweyongera okusoma.');
          return;
        }
      } catch (err) {
        console.error('Error handling trial:', err);
        setError('Waliwo ekisobu mu kutandika okugezesa. Gezaako nate.');
        return;
      }
    }

    try {
      await supabase
        .from('book_access_logs')
        .insert([{
          user_id: user.id,
          book_id: book.id,
          ip_address: null,
          user_agent: navigator.userAgent
        }]);

      setSelectedBook(book);
    } catch (err) {
      console.error('Error accessing book:', err);
      setError('Waliwo ekisobu mu kutuuka ku kitabo. Gezaako nate.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex items-center space-x-1">
          <Loader className="animate-spin" size={24} />
          <span className="text-gray-600 dark:text-gray-300">...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
          {error}
          <button
            onClick={() => {
              setError(null);
              fetchBooks();
            }}
            className="mt-2 text-sm font-medium hover:text-red-600"
          >
            Gezaako Nate
          </button>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          Tewali bitabo bisangiddwa
        </p>
        <button
          onClick={fetchBooks}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          Gezaako Nate
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={goBack}
                className="mr-3 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ebitabo Byaffe</h1>
            </div>
            <button
              onClick={handleRestorePurchases}
              disabled={restoringPurchases}
              className="flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600"
            >
              <RefreshCw size={12} className={restoringPurchases ? 'animate-spin' : ''} />
              <span>Restore Purchase</span>
            </button>
          </div>

          <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl">
            <h2 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-2">
              Somera Bwerere
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Oyinza Okusoma Ekitabo kyonna Ku Bwerere okumala Essaawa 24
            </p>
          </div>

          {/* Scrollable List with One Book Per Row */}
          <div ref={listRef} className="space-y-6 pb-16 mx-4">
            {books.map((book) => {
              const isPurchased = purchasedBooks.includes(book.id);
              const trial = activeTrials[book.id];

              return (
                <motion.div
                  id={`book-${book.id}`}
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md"
                >
                  <div className="relative w-full" style={{ paddingBottom: "150%" }}>
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-contain rounded-t-lg"
                    />
                    {trial?.isActive && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                        Okugezesa kuggwaako mu {formatDistanceToNow(new Date(trial.trialEnd!))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">
                        {book.title}
                      </h3>
                      <p className="text-md text-gray-600 dark:text-gray-400 mb-3">
                        {book.author}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                        {book.description}
                      </p>
                      {!isPurchased && !trial?.isActive && (
                        <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                          {book.digital_price.toLocaleString()} UGX
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      {isPurchased || trial?.isActive ? (
                        <button
                          onClick={() => handleReadBook(book)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <BookOpen size={20} className="mr-2" />
                          {trial?.isActive ? 'Weyongere n\'Okugezesa' : 'Soma Kati'}
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReadBook(book)}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                          >
                            <BookOpen size={16} className="mr-2" />
                            Trial
                          </button>
                          <button
                            onClick={() => handlePurchase(book)}
                            className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                            disabled={purchasing === book.id}
                          >
                            {purchasing === book.id ? (
                              <Loader size={16} className="animate-spin mr-2" />
                            ) : (
                              <LogIn size={16} className="mr-2" />
                            )}
                            Gula
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Loader className="w-10 h-10 text-white animate-spin" />
        </div>
      }>
        <AnimatePresence>
          {selectedBook && (
            <BookViewer
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => {
              setShowAuthModal(false);
              setPendingAction(null);
            }}
            onSuccess={() => {
              setShowAuthModal(false);
              // The pending action will be handled in the useEffect that watches for user changes
            }}
            message={
              pendingAction?.type === 'read'
                ? "Yingira okusobola okutandika okugezesa okwa bwerere"
                : "Yingira okusobola okugula ekitabo kino"
            }
          />
        )}
      </AnimatePresence>
    </>
  );
};
