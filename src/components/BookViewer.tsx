import React, { useEffect, useState, useRef } from 'react';
import { X, Maximize, Minimize, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '../types/supabase';
import { useNavigation } from '../context/NavigationContext';
import IPFSService from '../lib/ipfs-service';

type Book = Database['public']['Tables']['books']['Row'];

interface BookViewerProps {
  book: Book;
  onClose: () => void;
}

const BookViewer: React.FC<BookViewerProps> = ({ book, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(Date.now());
  const { goBack } = useNavigation();

  const reloadIframe = () => {
    setKey(Date.now());
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadIframe();
      }
    };

    if ((window as any).Android) {
      (window as any).Android.enableRotation();
    }

    window.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        reloadIframe();
      }
    }, 30000);
    
    const loadBookContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const ipfsService = IPFSService.getInstance();
        
        if (book.content_url.includes('ipfs.io') || book.content_url.includes('ipfs://')) {
          const cidRegex = /ipfs(?::\/\/|\.io\/ipfs\/)([a-zA-Z0-9]+)/;
          const match = book.content_url.match(cidRegex);
          
          if (match && match[1]) {
            const cid = match[1];
            
            try {
              await ipfsService.getContent(cid);
              setContentUrl(ipfsService.getContentUrl(cid));
            } catch (err) {
              console.error('Failed to load book from IPFS:', err);
              setContentUrl(book.content_url);
            }
          } else {
            setContentUrl(book.content_url);
          }
        } else {
          try {
            const bookCid = ipfsService.getBookCid(book.id);
            if (bookCid) {
              await ipfsService.getContent(bookCid);
              setContentUrl(ipfsService.getContentUrl(bookCid));
            } else {
              console.log('Book not found in IPFS registry, using original URL');
              setContentUrl(book.content_url);
            }
          } catch (err) {
            console.error('Failed to load book from IPFS by ID:', err);
            setContentUrl(book.content_url);
          }
        }
      } catch (err) {
        console.error('Error loading book content:', err);
        setError('Failed to load book content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookContent();
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);

      if ((window as any).Android) {
        (window as any).Android.disableRotation();
      }
    };
  }, [onClose, isFullscreen, book.content_url, book.id]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleClose = () => {
    goBack();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50"
      ref={containerRef}
    >
      <div className="w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-white">Loading book content...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-white mb-4">{error}</p>
            <button 
              onClick={reloadIframe}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : contentUrl ? (
          <iframe
            key={key}
            ref={iframeRef}
            src={contentUrl}
            className="w-full h-full border-none bg-white"
            title={book.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            loading="eager"
            allow="fullscreen"
            importance="high"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-white">No content URL available for this book.</p>
          </div>
        )}

        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
          >
            {isFullscreen ? (
              <Minimize size={24} className="text-white" />
            ) : (
              <Maximize size={24} className="text-white" />
            )}
          </button>
          {!isFullscreen && (
            <button
              onClick={handleClose}
              className="p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          )}
        </div>
        
        <div className="absolute top-4 left-4">
          <button
            onClick={handleClose}
            className="p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookViewer;
