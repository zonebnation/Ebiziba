import React, { useState, useRef } from 'react';
import { Upload, X, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { findSurahByPage } from '../../lib/quran-api';
import { supabase } from '../../lib/supabase';

interface QuranPageUploaderProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuranPageUploader: React.FC<QuranPageUploaderProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsInitialized, setIpfsInitialized] = useState(true);
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
      setError('Image file size must be less than 500KB');
      return;
    }

    setImageFile(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to upload Quran pages');
      return;
    }

    if (!imageFile || pageNumber < 1 || pageNumber > 604) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Read file as base64
      const reader = new FileReader();
      
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
        
        // Update progress
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 50; // First 50% is reading the file
            setUploadProgress(percent);
          }
        };
      });

      // Get surah info for this page
      const surah = findSurahByPage(pageNumber);
      const surahInfo = surah ? {
        id: surah.id,
        name: surah.surahNameArabic,
        englishName: surah.surahName
      } : undefined;

      // Generate a mock CID for the page
      const mockCid = `mock-quran-page-${pageNumber.toString().padStart(3, '0')}`;
      
      // Register in Supabase
      const { error: dbError } = await supabase
        .from('ipfs_content')
        .insert({
          cid: mockCid,
          title: `Quran Page ${pageNumber}`,
          type: 'quran_page',
          metadata: surahInfo ? { surahInfo } : null,
          created_at: new Date().toISOString()
        });
      
      if (dbError) throw dbError;
      
      setUploadProgress(100);
      
      // Clear form
      setPageNumber(1);
      setImageFile(null);
      
      onSuccess?.();
    } catch (err) {
      console.error('Error uploading Quran page:', err);
      setError('Failed to upload Quran page. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!ipfsInitialized) {
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
                Upload Quran Page
              </h2>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                IPFS service is not initialized. This feature requires IPFS to be properly configured.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
              Upload Quran Page
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page Number (1-604)
              </label>
              <input
                type="number"
                min={1}
                max={604}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                placeholder="Enter page number"
                disabled={uploading}
              />
            </div>

            <div>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-2 ${
                  imageFile
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={uploading}
              >
                <Upload 
                  size={24} 
                  className={imageFile ? 'text-green-500' : 'text-gray-400'} 
                />
                <div className="text-sm text-center">
                  {imageFile ? (
                    <span className="text-green-500">{imageFile.name}</span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Click to upload Quran page image
                      <br />
                      <span className="text-xs">PNG, JPG or WebP (Max 500KB)</span>
                    </span>
                  )}
                </div>
              </button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Uploading... {Math.round(uploadProgress)}%
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
                disabled={uploading || !imageFile}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
