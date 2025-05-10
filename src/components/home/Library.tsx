import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, BookOpen, Loader, RefreshCw, ArrowLeft, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { purchaseBook, restorePurchases } from '../lib/purchases';
import type { Database } from '../types/supabase';
import { useBookTrial } from '../hooks/useBookTrial';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '../context/NavigationContext';
import { AuthModal } from './modals/AuthModal';
import { scheduleBookNotification } from '../lib/book-notifications';

// Lazy load BookViewer component (assuming this is defined elsewhere)
const BookViewer = React.lazy(() => import('./BookViewer'));

type Book = Database['public']['Tables']['books']['Row'];

interface LibraryProps {
  notificationBookId?: string | null;
}

export const Library: React.FC<LibraryProps> = ({ notificationBookId }) => {
  const { user } = useAuth();
  const { goBack } = useNavigation();
  const { deviceId, isLoading: deviceLoading, deviceModified, error: deviceError, checkTrialStatus, startTrial } = useBookTrial();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [restoringPurchases, setRestoringPurchases] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTrials, setActiveTrials] = useState<Record<string, { isActive: boolean; trialEnd?: string }>>({});
  const [pendingAction, setPendingAction] = useState<{ type: 'read' | 'purchase'; book: Book } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPurchasedBooks();
      if (pendingAction) {
        if (pendingAction.type === 'read') handleReadBook(pendingAction.book);
        else if (pendingAction.type === 'purchase') handlePurchase(pendingAction.book);
        setPendingAction(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if (books.length > 0 && !deviceLoading) {
      const checkTrials = async () => {
        for (const book of books) {
          const status = await checkTrialStatus(book);
          if (status.isActive) {
            setActiveTrials(prev => ({
              ...prev,
              [book.id]: { isActive: true, trialEnd: status.trialEnd },
            }));
          } else if (status.message?.includes('Device modification detected')) {
            setError('Device modification detected. Trials are disabled.');
            break;
          }
        }
      };
      checkTrials();
    }
  }, [books, deviceLoading, deviceId, deviceModified]);

  useEffect(() => {
    if (notificationBookId && books.length > 0) {
      const book = books.find(b => b.id === notificationBookId);
      if (book) {
        const bookElement = document.getElementById(`book-${notificationBookId}`);
        if (bookElement) bookElement.scrollIntoView({ behavior: 'smooth' });
        handleReadBook(book);
      }
    }
  }, [notificationBookId, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBooks(data || []);
      if (data?.length) scheduleBookNotification();
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedBooks = async () => {
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
      setError('Failed to load purchased books.');
    }
  };

  const handlePurchase = async (book: Book) => {
    if (!user) {
      setPendingAction({ type: 'purchase', book });
      setShowAuthModal(true);
      return;
    }
    try {
      setPurchasing(book.id);
      const isPurchased = await purchaseBook(book);
      if (!isPurchased) throw new Error('Purchase failed.');
      const { error } = await supabase
        .from('user_books')
        .insert([{ user_id: user.id, book_id: book.id }]);
      if (error) throw error;
      setPurchasedBooks(prev => [...prev, book.id]);
    } catch (err) {
      console.error('Error purchasing book:', err);
      setError('Failed to purchase book. Please try again.');
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
          .upsert(purchasedIds.map(bookId => ({ user_id: user.id, book_id: bookId })));
        if (error) throw error;
        await fetchPurchasedBooks();
      }
    } catch (err) {
      console.error('Error restoring purchases:', err);
      setError('Failed to restore purchases. Please try again.');
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
      const status = await checkTrialStatus(book);
      if (status.message?.includes('Device modification detected')) {
        setError('Device modification detected. Trials are disabled.');
        return;
      }
      if (status.isEligible) {
        const trialStatus = await startTrial(book, user.id);
        if (trialStatus.isActive) {
          setActiveTrials(prev => ({
            ...prev,
            [book.id]: { isActive: true, trialEnd: trialStatus.trialEnd },
          }));
        } else {
          setError(trialStatus.message || 'Failed to start trial.');
          return;
        }
      } else {
        setError('This device has already used the trial for this book. Please purchase to continue.');
        return;
      }
    }

    try {
      await supabase.from('book_access_logs').insert([
        {
          user_id: user.id,
          book_id: book.id,
          user_agent: navigator.userAgent,
        },
      ]);
      setSelectedBook(book);
    } catch (err) {
      console.error('Error accessing book:', err);
      setError('Failed to access book. Please try again.');
    }
  };

  if (loading || deviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  }

  if (error || deviceError) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
          {error || deviceError}
          <button
            onClick={() => {
              setError(null);
              fetchBooks();
            }}
            className="mt-2 text-sm font-medium hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">No books found.</p>
        <button onClick={fetchBooks} className="px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
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
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Our Books</h1>
            </div>
            <button
              onClick={handleRestorePurchases}
              disabled={restoringPurchases}
              className="flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600"
            >
              <RefreshCw size={12} className={restoringPurchases ? 'animate-spin' : ''} />
              <span>Restore Purchases</span>
            </button>
          </div>

          <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl">
            <h2 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-2">
              Free Trial
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You can read any book for free for 24 hours.
            </p>
          </div>

          <div ref={listRef} className="space-y-6 pb-16 mx-4">
            {books.map(book => {
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
                  <div className="relative w-full" style={{ paddingBottom: '150%' }}>
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-contain rounded-t-lg"
                    />
                    {trial?.isActive && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                        Trial ends in {formatDistanceToNow(new Date(trial.trialEnd!))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">{book.title}</h3>
                      <p className="text-md text-gray-600 dark:text-gray-400 mb-3">{book.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{book.description}</p>
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
                          {trial?.isActive ? 'Continue Trial' : 'Read Now'}
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReadBook(book)}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                          >
                            <BookOpen size={16} className="mr-2" />
                            Start Trial
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
                            Purchase
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

      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
        }
      >
        <AnimatePresence>
          {selectedBook && <BookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />}
        </AnimatePresence>
      </Suspense>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => {
              setShowAuthModal(false);
              setPendingAction(null);
            }}
            onSuccess={() => setShowAuthModal(false)}
            message={
              pendingAction?.type === 'read'
                ? 'Login to start a free trial.'
                : 'Login to purchase this book.'
            }
          />
        )}
      </AnimatePresence>
    </>
  );
};
