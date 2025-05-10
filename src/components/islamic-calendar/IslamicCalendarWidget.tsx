import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useIslamicDate } from '../../hooks/useIslamicDate';

interface IslamicCalendarWidgetProps {
  onClose: () => void;
  onExpand: () => void;
}

export const IslamicCalendarWidget: React.FC<IslamicCalendarWidgetProps> = ({ onClose, onExpand }) => {
  const { islamicDate, gregorianDate } = useIslamicDate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-80 border border-surface-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar size={18} />
            <h3 className="font-semibold">Islamic Calendar</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExpand}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <p className="text-xl font-bold">{format(gregorianDate, 'MMMM d, yyyy')}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-white/90">{islamicDate.day} {islamicDate.month}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {islamicDate.year} AH
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Islamic Event */}
        {islamicDate.event && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Event</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {islamicDate.event}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Calendar icon component
function Calendar(props: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size} 
      height={props.size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
