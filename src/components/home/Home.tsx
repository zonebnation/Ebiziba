import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { FeaturedContent } from './FeaturedContent';
import { QuickActions } from './QuickActions';
import { RecommendedBooks } from './RecommendedBooks';
import { FeaturedStory } from './FeaturedStory';
import { DonationSection } from './DonationSection';
import { AkanyomeroSection } from './AkanyomeroSection';
import { library } from './library';
import { useIslamicDate } from '../../hooks/useIslamicDate';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  setShowCalendar: (show: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab, setShowCalendar }) => {
  const { user } = useAuth();
  const { islamicDate, gregorianDate } = useIslamicDate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header Card */}
      <div className="bg-[#F4A020] text-white p-6 rounded-b-[2rem] relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Salaam</h1>
            {user && (
              <p className="text-white/90 mt-1 text-lg">
                {user.name.split(' ')[0]}
              </p>
            )}
          </div>
          <Header 
            user={user} 
            onCalendarClick={() => setShowCalendar(true)} 
          />
        </div>

        {/* Calendar Section */}
        <div 
          className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between"
          onClick={() => setShowCalendar(true)}
        >
          <div className="flex items-center">
            <Calendar size={20} className="mr-2" />
            <div>
              <p className="text-xl font-bold">{format(gregorianDate, 'MMMM d, yyyy')}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-white/90">{islamicDate.day} {islamicDate.month}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {islamicDate.year} AH
                </span>
              </div>
            </div>
          </div>
          <span className="text-sm">Kampala</span>
        </div>

        {/* Decorative clouds */}
        <div className="absolute top-4 right-8 opacity-20">
          <div className="w-16 h-6 bg-white rounded-full" />
        </div>
        <div className="absolute top-8 right-12 opacity-10">
          <div className="w-12 h-4 bg-white rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">




        {/* Quick Actions */}
        <QuickActions onNavigate={setActiveTab} />

        {/* Recommended Books */}
        <library onNavigate={setActiveTab} />

        {/* Donation Section */}
        <DonationSection />
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
