import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

export const OnboardingFeature: React.FC<OnboardingFeatureProps> = ({
  icon,
  title,
  description,
  delay
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start space-x-4"
    >
      <div className="bg-primary-500 p-3 rounded-lg text-white">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
