import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeviceInfo, DeviceInfo, listenForOrientationChanges } from '../lib/device-detection';

interface DeviceContextType {
  deviceInfo: DeviceInfo;
  updateDeviceInfo: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo());

  const updateDeviceInfo = () => {
    setDeviceInfo(getDeviceInfo());
  };

  useEffect(() => {
    // Update device info on mount
    updateDeviceInfo();
    
    // Listen for orientation changes
    const cleanup = listenForOrientationChanges((isPortrait) => {
      updateDeviceInfo();
    });
    
    // Listen for resize events
    const handleResize = () => {
      updateDeviceInfo();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceInfo, updateDeviceInfo }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
