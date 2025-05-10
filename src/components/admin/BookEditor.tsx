import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];

interface BookEditorProps {
  book: Book;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

export const BookEditor: React.FC<BookEditorProps> = ({ book, onSave, onCancel }) => {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [price, setPrice] = useState(book.digital_price.toString());
  const [language, setLanguage] = useState(book.language);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const handleCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for cover');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Cover image size must be less than 2MB');
      return;
    }

    setCoverFile(file);
    setError(null);
  };

  const handleContentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file for content');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Content file size must be less than 50MB');
      return;
    }

    setContentFile(file);
    setError(null);
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${book.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          setUploadProgress(percent);
        }
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      let updates: Partial<Book> = {
        title,
        description,
        author,
        language,
        digital_price: parseInt(price)
      };

      // Upload new files if selected
      if (coverFile) {
        updates.cover_url = await uploadFile(coverFile, 'covers');
      }

      if (contentFile) {
        updates.content_url = await uploadFile(contentFile, 'books');
      }

      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', book.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update');

      onSave(data);
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Book
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
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                placeholder="Enter book title"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                placeholder="Enter author name"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                placeholder="Enter book description"
                rows={3}
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (UGX)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  placeholder="Enter price"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                  disabled={uploading}
                >
                  <option value="Luganda">Luganda</option>
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Cover Upload */}
              <div>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={uploading}
                >
                  <Upload size={24} className="text-gray-400" />
                  <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                    Click to upload new cover image
                    <br />
                    <span className="text-xs">Optional - JPG, PNG or GIF (Max 2MB)</span>
                  </div>
                </button>
              </div>

              {/* Content Upload */}
              <div>
                <input
                  type="file"
                  ref={contentInputRef}
                  onChange={handleContentSelect}
                  accept=".pdf"
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => contentInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={uploading}
                >
                  <Upload size={24} className="text-gray-400" />
                  <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                    Click to upload new book content
                    <br />
                    <span className="text-xs">Optional - PDF only (Max 50MB)</span>
                  </div>
                </button>
              </div>
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
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
