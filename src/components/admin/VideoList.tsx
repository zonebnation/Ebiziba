import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { VideoEditor } from './VideoEditor';
import type { Database } from '../../types/supabase';

type Reel = Database['public']['Tables']['reels']['Row'];

export const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Reel | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('reels')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      setVideos(videos.filter(video => video.id !== videoId));
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video');
    }
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
          onClick={fetchVideos}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-700 rounded-xl p-4 flex items-center space-x-4"
          >
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {video.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {video.description}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{video.likes || 0} likes</span>
                <span>{video.comments || 0} comments</span>
                <span>{video.shares || 0} shares</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingVideo(video)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Edit2 size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleDelete(video.id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No videos found
          </div>
        )}
      </div>

      {editingVideo && (
        <VideoEditor
          video={editingVideo}
          onSave={(updatedVideo) => {
            setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
            setEditingVideo(null);
          }}
          onCancel={() => setEditingVideo(null)}
        />
      )}
    </>
  );
};
