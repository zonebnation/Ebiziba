import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Loader, Check, AlertCircle } from 'lucide-react';
import { downloadQuranPagesForOffline } from '../../utils/quran-image-loader';
import { Capacitor } from '@capacitor/core';

interface OfflineDownloadManagerProps {
  onClose: () => void;
}

export const OfflineDownloadManager: React.FC<OfflineDownloadManagerProps> = ({ onClose }) => {
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('Okukuŋŋaanya olupapula kusoboka ku kifuufu kyokka');
      return;
    }

    if (startPage < 1 || startPage > 604 || endPage < 1 || endPage > 604 || startPage > endPage) {
      setError('Yingiza ennamba z\'olupapula ezituufu (1-604)');
      return;
    }

    if (endPage - startPage > 50) {
      setError('Kuŋŋaanya olupapula 50 oba lutono okwewala okuziyiza');
      return;
    }

    try {
      setIsDownloading(true);
      setError(null);
      setResult(null);
      setProgress({ current: 0, total: endPage - startPage + 1 });

      const result = await downloadQuranPagesForOffline(
        startPage,
        endPage,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setResult(result);
    } catch (err) {
      console.error('Error downloading Quran pages:', err);
      setError('Waliwo ekisobu mu kukuŋŋaanya olupapula. Gezaako nate.');
    } finally {
      setIsDownloading(false);
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
              Kuŋŋaanya Olupapula lwa Quran
            </h2>
            <button
              onClick={onClose}
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

          {result && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">
                Okukuŋŋaanya Kuwedde
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Olupapula {result.success} lukuŋŋaanyiziddwa bulungi
              </p>
              {result.failed > 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Olupapula {result.failed} lulemeddwa
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Olupapula Olutandika
                </label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  disabled={isDownloading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Olupapula Olukomekkereza
                </label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={endPage}
                  onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  disabled={isDownloading}
                />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Kino kijja kukuŋŋaanya olupapula lwa Quran ku kifuufu kyo osobole okulaba nga tolina data.
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-300 mt-1">
                    Kuŋŋaanya olupapula 50 oba lutono okwewala okuziyiza.
                  </p>
                </div>
              </div>
            </div>

            {isDownloading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Olupapula {progress.current} ku {progress.total}...
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isDownloading}
              >
                Sazaamu
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDownloading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center">
                    <Download size={18} className="mr-1" />
                    <span>Kuŋŋaanya</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OfflineDownloadManager;
