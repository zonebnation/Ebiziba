import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface VideoUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size must be less than 100MB');
      return;
    }

    setVideoFile(file);
    setError(null);
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for thumbnail');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Thumbnail image size must be less than 2MB');
      return;
    }

    setThumbnailFile(file);
    setError(null);
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

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

    if (!user) {
      setError('Please sign in to upload videos');
      return;
    }

    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload video and thumbnail
      const [videoUrl, thumbnailUrl] = await Promise.all([
        uploadFile(videoFile, 'videos'),
        uploadFile(thumbnailFile, 'thumbnails')
      ]);

      // Create reel record in database
      const { error: dbError } = await supabase
        .from('reels')
        .insert({
          title,
          description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          user_id: user.id
        });

      if (dbError) throw dbError;

      // Clear form
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);

      onSuccess?.();
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video. Please try again.');
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
              Upload Video
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
                placeholder="Enter video title"
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
                placeholder="Enter video description"
                rows={3}
                disabled={uploading}
              />
            </div>

            <div className="space-y-4">
              {/* Video Upload */}
              <div>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoSelect}
                  accept="video/*"
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className={`w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-2 ${
                    videoFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={uploading}
                >
                  <Upload 
                    size={24} 
                    className={videoFile ? 'text-green-500' : 'text-gray-400'} 
                  />
                  <div className="text-sm text-center">
                    {videoFile ? (
                      <span className="text-green-500">{videoFile.name}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Click to upload video
                        <br />
                        <span className="text-xs">MP4, WebM or OGG (Max 100MB)</span>
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className={`w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-2 ${
                    thumbnailFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={uploading}
                >
                  <ImageIcon 
                    size={24} 
                    className={thumbnailFile ? 'text-green-500' : 'text-gray-400'} 
                  />
                  <div className="text-sm text-center">
                    {thumbnailFile ? (
                      <span className="text-green-500">{thumbnailFile.name}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Click to upload thumbnail
                        <br />
                        <span className="text-xs">JPG, PNG or GIF (Max 2MB)</span>
                      </span>
                    )}
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
                disabled={uploading || !videoFile || !thumbnailFile}
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
