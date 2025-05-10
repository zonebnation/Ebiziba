import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileNameFormProps {
  onComplete: () => void;
}

export const ProfileNameForm: React.FC<ProfileNameFormProps> = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Erinnya lyetaagisa');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await updateProfile({ name });
      onComplete();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Waliwo ekisobu mu kutereka erinnya lyo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Erinnya Lyo
            </h2>
            <button
              onClick={onComplete}
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
                Erinnya Lyo Lyonna
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800"
                placeholder="Wandiika erinnya lyo lyonna"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Erinnya lino lye linaalabikiranga mu profayiro yo.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onComplete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Sazaamu
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    <span>Tereka</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
