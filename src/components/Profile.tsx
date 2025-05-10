import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Settings, Moon, Sun, Bell, Shield, HelpCircle, LogOut, Camera, Loader, Lock, Edit, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import * as Avatar from '@radix-ui/react-avatar';
import { Login } from './Login';
import { lazyLoadAdminComponents } from '../lib/code-splitting';
import { motion } from 'framer-motion';

// Lazy load AdminConsole
const { AdminConsole } = lazyLoadAdminComponents();

export const Profile: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, uploadAvatar, updateProfile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAvatar(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName === user.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateProfile({ name: newName });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      setNewName(user.name); // Reset to original name on error
    }
  };

  const menuItems = [
    { icon: Bell, label: 'Obubaka', onClick: () => {} },
    { icon: Shield, label: 'Obukuumi', onClick: () => {} },
    { icon: HelpCircle, label: 'Obuyambi', onClick: () => {} },
    { icon: LogOut, label: 'Fuluma', onClick: logout, danger: true },
  ];

  if (isAdmin) {
    menuItems.unshift({
      icon: Lock,
      label: 'Admin Console',
      onClick: () => setShowAdminConsole(true)
    });
  }

  return (
    <>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface-50 dark:bg-gray-800 hover:bg-surface-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                className="relative w-16 h-16 rounded-2xl overflow-hidden group"
                disabled={isUploading}
              >
                <Avatar.Root className="w-full h-full">
                  <Avatar.Image
                    src={user.avatar_url}
                    className="w-full h-full object-cover"
                  />
                  <Avatar.Fallback className="w-full h-full bg-surface-100 dark:bg-gray-700 flex items-center justify-center text-surface-500 dark:text-gray-400">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploading ? (
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-xl font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                    onBlur={handleNameUpdate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameUpdate();
                      } else if (e.key === 'Escape') {
                        setNewName(user.name);
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="p-1 bg-primary-500 text-white rounded-lg"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mr-2">
                    {user.name}
                    {isAdmin && (
                      <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <button className="p-2 rounded-xl bg-surface-50 dark:bg-gray-800 hover:bg-surface-100 dark:hover:bg-gray-700 transition-colors">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="mt-6 p-4 bg-surface-50 dark:bg-gray-800 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Weyungidde ku {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-surface-50 dark:hover:bg-gray-800 transition-colors ${
                  item.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Console Modal */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Loader className="w-10 h-10 text-white animate-spin" />
        </div>
      }>
        {showAdminConsole && (
          <AdminConsole onClose={() => setShowAdminConsole(false)} />
        )}
      </Suspense>
    </>
  );
};
