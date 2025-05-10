import React from 'react';
import { motion } from 'framer-motion';
import { Book, Video, Users, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';

export const AdminStats: React.FC = () => {
  const { totalBooks, totalVideos, totalUsers, totalRevenue, loading, error, refreshStats } = useAdminStats();

  const stats = [
    {
      label: 'Total Books',
      value: totalBooks.toString(),
      icon: Book,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Videos',
      value: totalVideos.toString(),
      icon: Video,
      color: 'bg-green-500',
    },
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Revenue',
      value: `UGX ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refreshStats}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors inline-flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard Overview
        </h3>
        <button
          onClick={refreshStats}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw 
            size={20} 
            className={`text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md ${
              loading ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
