import React from 'react';
import { Bell } from 'lucide-react';
import type { PrayerTime } from '../types';

const PRAYER_TIMES: PrayerTime[] = [
  { name: 'Fajr', time: '05:30' },
  { name: 'Dhuhr', time: '12:30' },
  { name: 'Asr', time: '15:45' },
  { name: 'Maghrib', time: '18:15' },
  { name: 'Isha', time: '19:45' },
];

export const Prayer: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Prayer Times</h1>
      <div className="bg-white rounded-lg shadow-md">
        {PRAYER_TIMES.map((prayer, index) => (
          <div
            key={prayer.name}
            className={`flex justify-between items-center p-4 ${
              index !== PRAYER_TIMES.length - 1 ? 'border-b' : ''
            }`}
          >
            <div>
              <h3 className="font-semibold">{prayer.name}</h3>
              <p className="text-gray-600">{prayer.time}</p>
            </div>
            <button className="text-green-600">
              <Bell size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
