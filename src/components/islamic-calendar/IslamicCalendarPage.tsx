import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Bell, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useIslamicDate } from '../../hooks/useIslamicDate';

interface IslamicCalendarPageProps {
  onBack: () => void;
}

export const IslamicCalendarPage: React.FC<IslamicCalendarPageProps> = ({ onBack }) => {
  const { islamicDate, gregorianDate, prayerTimes } = useIslamicDate();
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'prayers'>('calendar');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary-500 text-white p-6 rounded-b-[2rem]">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Islamic Calendar</h1>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold">{format(gregorianDate, 'MMMM d, yyyy')}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-white/90">{islamicDate.day} {islamicDate.month}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {islamicDate.year} AH
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-white/80 text-sm">
            <MapPin size={14} className="mr-1" />
            <span>Kampala</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab('calendar')}
          className={`flex-1 py-3 text-sm font-medium ${
            selectedTab === 'calendar'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setSelectedTab('prayers')}
          className={`flex-1 py-3 text-sm font-medium ${
            selectedTab === 'prayers'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Prayer Times
        </button>
      </div>

      <div className="p-4 space-y-6">
        {selectedTab === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {islamicDate.month} {islamicDate.year}
              </h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <ChevronRight size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <button
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm ${
                    i === 15
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Islamic Events */}
            {islamicDate.event && (
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-1">
                  Upcoming Event
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{islamicDate.event}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Clock size={24} className="text-primary-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Prayer Times
              </h3>
            </div>

            <div className="space-y-4">
              {prayerTimes.map((prayer) => (
                <div
                  key={prayer.name}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {prayer.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {prayer.time}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                    <Bell
                      size={20}
                      className="text-primary-500 dark:text-primary-400"
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Calendar icon component
function Calendar(props: { size: number; className?: string }) {
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
      className={props.className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
