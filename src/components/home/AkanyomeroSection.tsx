import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AkanyomeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-secondary-500 flex items-center justify-center">
          <HelpCircle size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-surface-800 dark:text-white">
            Abamanyi byebagamba
          </h2>
          <p className="text-xs text-surface-500 dark:text-gray-400">
            Akabonero Kabanoonya Okumanya
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Ekitundu kino kijja kujja mangu. Tukyakolako.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ekitundu kino kijja kuba n'okuddibwamu kw'ebibuuzo ebikwata ku ddiini y'obusiraamu.
        </p>
      </div>
    </motion.div>
  );
};
