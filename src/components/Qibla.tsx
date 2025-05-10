import React from 'react';
import { Compass } from 'lucide-react';

export const Qibla: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Qibla Direction</h1>
      <div className="relative w-64 h-64 mb-8">
        <div className="absolute inset-0 border-4 border-green-600 rounded-full"></div>
        <Compass size={64} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600" />
      </div>
      <p className="text-center text-gray-600">
        Point your device towards the arrow to find the Qibla direction
      </p>
    </div>
  );
};
