import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Database, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import IPFSService from '../../lib/ipfs-service';

interface IPFSContent {
  id: string;
  cid: string;
  title: string;
  type: string;
  chunks?: string[];
  mime_type?: string;
  size?: number;
  created_at: string;
}

export const IPFSContentManager: React.FC = () => {
  const [content, setContent] = useState<IPFSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ipfsInitialized, setIpfsInitialized] = useState(false);

  useEffect(() => {
    // Initialize IPFS service
    const initIpfs = async () => {
      try {
        const ipfsService = IPFSService.getInstance();
        const initialized = await ipfsService.initialize();
        setIpfsInitialized(initialized);
        
        if (initialized) {
          fetchContent();
        }
      } catch (error) {
        console.error('Failed to initialize IPFS service:', error);
        setError('Failed to initialize IPFS service');
        setLoading(false);
      }
    };
    
    initIpfs();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ipfs_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      console.error('Error fetching IPFS content:', err);
      setError('Failed to load IPFS content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This will only remove it from the registry, not from IPFS.')) return;

    try {
      const { error } = await supabase
        .from('ipfs_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContent(content.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting IPFS content:', err);
      alert('Failed to delete content');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return '📚';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🔊';
      case 'video':
        return '🎬';
      default:
        return '📄';
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
          onClick={fetchContent}
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
        <Database className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
        <p className="text-yellow-600 dark:text-yellow-400 mb-4">
          IPFS service is not initialized. This feature requires IPFS to be properly configured.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          IPFS Content Registry
        </h3>
        <button
          onClick={fetchContent}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No IPFS content found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-700 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getContentTypeIcon(item.type)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {item.type}
                      </span>
                      {item.mime_type && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {item.mime_type}
                        </span>
                      )}
                      {item.size && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {formatSize(item.size)}
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-mono break-all">
                      {item.cid}
                    </p>
                    {item.chunks && item.chunks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.chunks.length} chunks
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://ipfs.io/ipfs/${item.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink size={20} className="text-gray-500 dark:text-gray-400" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
