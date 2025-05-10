import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, BookOpen, BarChart2, Users, Settings, Database, BookText, Loader } from 'lucide-react';
import { AdminStats } from './AdminStats';
import { lazyLoadAdminComponents, lazyLoadVideoComponents, lazyLoadBookComponents } from '../../lib/code-splitting';

// Lazy load components
const { 
  IPFSContentManager, 
  QuranPageManager 
} = lazyLoadAdminComponents();

const { VideoUpload } = lazyLoadVideoComponents();
const { BookUpload } = lazyLoadBookComponents();
const { VideoList } = lazyLoadAdminComponents();
const { BookList } = lazyLoadAdminComponents();

interface AdminConsoleProps {
  onClose: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'videos' | 'books' | 'users' | 'ipfs' | 'quran'>('stats');
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showBookUpload, setShowBookUpload] = useState(false);

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'quran', label: 'Quran Pages', icon: BookText },
    { id: 'ipfs', label: 'IPFS Content', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Admin Console</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          }>
            <AnimatePresence mode="wait">
              {activeTab === 'stats' && <AdminStats />}

              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Video Management
                    </h3>
                    <button
                      onClick={() => setShowVideoUpload(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Upload Video
                    </button>
                  </div>
                  <VideoList />
                </div>
              )}

              {activeTab === 'books' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Book Management
                    </h3>
                    <button
                      onClick={() => setShowBookUpload(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Add Book
                    </button>
                  </div>
                  <BookList />
                </div>
              )}

              {activeTab === 'quran' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quran Page Management
                  </h3>
                  <QuranPageManager />
                </div>
              )}

              {activeTab === 'ipfs' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    IPFS Content Management
                  </h3>
                  <IPFSContentManager />
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Management
                  </h3>
                  {/* User list will go here */}
                </div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </motion.div>

      {/* Video Upload Modal */}
      <AnimatePresence>
        {showVideoUpload && (
          <VideoUpload
            onSuccess={() => {
              setShowVideoUpload(false);
              // Refresh video list
            }}
            onCancel={() => setShowVideoUpload(false)}
          />
        )}
      </AnimatePresence>

      {/* Book Upload Modal */}
      <AnimatePresence>
        {showBookUpload && (
          <BookUpload
            onSuccess={() => {
              setShowBookUpload(false);
              // Refresh book list
            }}
            onCancel={() => setShowBookUpload(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
