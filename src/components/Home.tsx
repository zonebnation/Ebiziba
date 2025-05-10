import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from './home/Header';
import { QuickActions } from './home/QuickActions';
import { Library } from './Library';
import { DonationSection } from './home/DonationSection';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../lib/device-detection';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  setShowCalendar: (show: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab, setShowCalendar }) => {
  const { user } = useAuth();
  const { deviceInfo } = useDevice();

  // Get appropriate padding based on device type
  const getBottomPadding = () => {
    if (deviceInfo.type === DeviceType.MOBILE) {
      return 'pb-24'; // Extra padding on mobile for the navigation bar
    }
    return 'pb-20';
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${getBottomPadding()}`}>
      {/* Header Card */}
      <div className="bg-[#F4A020] text-white p-6 rounded-b-[2rem] relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Salaam</h1>
            {user && (
              <p className="text-white/90 mt-1 text-lg">
                {user.name?.split(' ')[0]}
              </p>
            )}
          </div>
          <Header
            user={user}
            onCalendarClick={() => {}}
          />
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
       {/* <QuickActions onNavigate={setActiveTab} />*/}

        {/* Library Component - Wrapped in a div with padding to prevent overlapping issues */}
        <div className="pb-4">
          <Library notificationBookId={null} />
        </div>

        {/* Donation Section */}
        <DonationSection />
      </div>
    </div>
  );
};
