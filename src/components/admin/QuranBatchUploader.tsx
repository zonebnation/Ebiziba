import React, { useState } from 'react';
import { X, Loader, AlertCircle, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadQuranPageBatch } from '../../utils/quran-ipfs-uploader';

interface QuranBatchUploaderProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuranBatchUploader: React.FC<QuranBatchUploaderProps> = ({ onSuccess, onCancel }) => {
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; failed: number; pages: number[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (startPage < 1 || startPage > 604 || endPage < 1 || endPage > 604 || startPage > endPage) {
      setError('Please enter valid page numbers (1-604)');
      return;
    }

    if (endPage - startPage > 50) {
      setError('Please upload a maximum of 50 pages at once to avoid timeouts');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResults(null);
      setProgress({ current: 0, total: endPage - startPage + 1 });

      const results = await uploadQuranPageBatch(
        startPage,
        endPage,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setResults(results);
      
      if (results.success > 0) {
        onSuccess?.();
      }
    } catch (err) {
      console.error('Error uploading Quran pages:', err);
      setError('Failed to upload Quran pages. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Batch Upload Quran Pages
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          {results && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">
                Upload Results
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Successfully uploaded: {results.success} pages
              </p>
              {results.failed > 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Failed to upload: {results.failed} pages
                </p>
              )}
              {results.pages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Uploaded pages: {results.pages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Page
                </label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Page
                </label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={endPage}
                  onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    This will upload Quran pages from your local assets to IPFS. Make sure the pages exist in the <code>/public/assets/quran-pages/</code> directory.
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-300 mt-1">
                    Limit batch size to 50 pages to avoid timeouts.
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Uploading page {progress.current} of {progress.total}...
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center">
                    <Upload size={18} className="mr-1" />
                    <span>Upload Batch</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
