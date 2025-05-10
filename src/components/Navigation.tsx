import React from 'react';
import { Home, BookOpen, Video, BookText, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../lib/device-detection';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center w-full h-full py-2",
      isActive ? "text-primary-500" : "text-surface-400 dark:text-gray-400 hover:text-surface-600 dark:hover:text-gray-300"
    )}
  >
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-gradient-to-b from-primary-50 dark:from-primary-900/20 to-primary-100/50 dark:to-primary-900/10 rounded-2xl"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <div className="flex flex-col items-center justify-center relative">
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </div>
    {isActive && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary-500"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </motion.button>
);

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { deviceInfo } = useDevice();

  // Adjust navigation height and padding based on device
  const getNavClasses = () => {
    const baseClasses = "fixed bottom-4 left-4 right-4 glass-effect rounded-2xl shadow-lg shadow-black/[0.03] flex justify-around items-center py-2 max-w-md mx-auto border-t border-surface-100 dark:border-gray-800 z-50";

    // Adjust for small screens
    if (deviceInfo.isSmallScreen) {
      return `${baseClasses} py-1 bottom-2 left-2 right-2`;
    }

    // Adjust for iPhone with notch
    if (deviceInfo.platform === 'ios' && deviceInfo.viewportHeight > 800) {
      return `${baseClasses} pb-6`; // Extra padding for iPhone with home indicator
    }

    return baseClasses;
  };

  // Adjust icon size based on device
  const getIconSize = () => {
    if (deviceInfo.type === DeviceType.MOBILE && deviceInfo.isSmallScreen) {
      return 18; // Smaller icons for small mobile devices
    }
    return 22; // Default size, slightly reduced from original 24
  };
  
  const iconSize = getIconSize();

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={getNavClasses()}
    >
      <NavItem
        icon={<Home size={iconSize} className="stroke-[1.5]" />}
        label="Home"
        isActive={activeTab === 'home'}
        onClick={() => setActiveTab('home')}
      />
      <NavItem
        icon={<BookOpen size={iconSize} className="stroke-[1.5]" />}
        label="Ebitabo"
        isActive={activeTab === 'library'}
        onClick={() => setActiveTab('library')}
      />

      <NavItem
        icon={<BookText size={iconSize} className="stroke-[1.5]" />}
        label="Kulaane"
        isActive={activeTab === 'Kulaane'}
        onClick={() => setActiveTab('Kulaane')}
      />
      <NavItem
        icon={<User size={iconSize} className="stroke-[1.5]" />}
        label="Profile"
        isActive={activeTab === 'profile'}
        onClick={() => setActiveTab('profile')}
      />
    </motion.nav>
  );
};
