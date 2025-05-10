import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingSlideProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  icon,
  color,
  isActive
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6"
      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <div 
        className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        {title}
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 text-center max-w-xs">
        {description}
      </p>
    </motion.div>
  );
};
