import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, RefreshCw, Trash2, ExternalLink, Plus, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { QuranPageUploader } from './QuranPageUploader';
import { QuranBatchUploader } from './QuranBatchUploader';
import { checkQuranPagesAvailability } from '../../utils/quran-ipfs-uploader';

interface QuranPageItem {
  id: string;
  cid: string;
  title: string;
  pageNumber: number;
  created_at: string;
}

export const QuranPageManager: React.FC = () => {
  const [pages, setPages] = useState<QuranPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ipfsInitialized, setIpfsInitialized] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showBatchUploader, setShowBatchUploader] = useState(false);
  const [availablePages, setAvailablePages] = useState<number[]>([]);
  const [missingPages, setMissingPages] = useState<number[]>([]);

  useEffect(() => {
    // Initialize IPFS service
    const initIpfs = async () => {
      try {
        setIpfsInitialized(true);
        fetchPages();
        checkAvailability();
      } catch (error) {
        console.error('Failed to initialize IPFS service:', error);
        setError('Failed to initialize IPFS service');
        setLoading(false);
      }
    };
    
    initIpfs();
  }, []);

  const checkAvailability = async () => {
    try {
      const { available, missing } = await checkQuranPagesAvailability();
      setAvailablePages(available);
      setMissingPages(missing);
    } catch (error) {
      console.error('Error checking Quran pages availability:', error);
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ipfs_content')
        .select('*')
        .eq('type', 'quran_page')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process data to extract page numbers
      const processedPages = data?.map(item => {
        // Extract page number from title
        const pageMatch = item.title.match(/Page\s*(\d+)/i);
        const pageNumber = pageMatch && pageMatch[1] ? parseInt(pageMatch[1], 10) : 0;
        
        return {
          ...item,
          pageNumber
        };
      }).filter(item => item.pageNumber > 0) || [];
      
      setPages(processedPages);
    } catch (err) {
      console.error('Error fetching Quran pages:', err);
      setError('Failed to load Quran pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Quran page? This will only remove it from the registry, not from IPFS.')) return;

    try {
      const { error } = await supabase
        .from('ipfs_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPages(pages.filter(item => item.id !== id));
      
      // Refresh availability
      checkAvailability();
    } catch (err) {
      console.error('Error deleting Quran page:', err);
      alert('Failed to delete page');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    setShowBatchUploader(false);
    fetchPages();
    checkAvailability();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchPages}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!ipfsInitialized) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
        <p className="text-yellow-600 dark:text-yellow-400 mb-4">
          IPFS service is not initialized. This feature requires IPFS to be properly configured.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quran Pages in IPFS
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {availablePages.length} of 604 pages available ({((availablePages.length / 604) * 100).toFixed(1)}%)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchPages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowBatchUploader(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors"
          >
            <Upload size={18} />
            <span>Batch Upload</span>
          </button>
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Single Page</span>
          </button>
        </div>
      </div>

      {/* Missing Pages Summary */}
      {missingPages.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4">
          <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
            Missing Pages: {missingPages.length}
          </h4>
          <div className="flex flex-wrap gap-1">
            {missingPages.length > 100 ? (
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                {missingPages.slice(0, 20).join(', ')}... and {missingPages.length - 20} more
              </p>
            ) : (
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                {missingPages.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No Quran pages found in IPFS</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Upload Quran pages to reduce app size
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="relative">
                  <img
                    src={`/assets/quran-pages/${page.pageNumber.toString().padStart(3, '0')}.png`}
                    alt={`Quran Page ${page.pageNumber}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    Page {page.pageNumber}
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(page.created_at)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono truncate">
                    {page.cid}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Uploader Modals */}
      <AnimatePresence>
        {showUploader && (
          <QuranPageUploader
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploader(false)}
          />
        )}
        
        {showBatchUploader && (
          <QuranBatchUploader
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowBatchUploader(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
