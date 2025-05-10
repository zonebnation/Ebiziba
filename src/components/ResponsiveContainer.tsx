import React from 'react';
import { useDevice } from '../context/DeviceContext';
import { DeviceType, ScreenSize } from '../lib/device-detection';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  smallScreenClassName?: string;
  mediumScreenClassName?: string;
  largeScreenClassName?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  smallScreenClassName = '',
  mediumScreenClassName = '',
  largeScreenClassName = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = ''
}) => {
  const { deviceInfo } = useDevice();
  
  // Determine classes based on screen size
  let screenSizeClass = '';
  if (deviceInfo.isSmallScreen) {
    screenSizeClass = smallScreenClassName;
  } else if (deviceInfo.isMediumScreen) {
    screenSizeClass = mediumScreenClassName;
  } else if (deviceInfo.isLargeScreen) {
    screenSizeClass = largeScreenClassName;
  }
  
  // Determine classes based on device type
  let deviceTypeClass = '';
  if (deviceInfo.type === DeviceType.MOBILE) {
    deviceTypeClass = mobileClassName;
  } else if (deviceInfo.type === DeviceType.TABLET) {
    deviceTypeClass = tabletClassName;
  } else if (deviceInfo.type === DeviceType.DESKTOP) {
    deviceTypeClass = desktopClassName;
  }
  
  // Combine all classes
  const combinedClassName = `${className} ${screenSizeClass} ${deviceTypeClass}`.trim();
  
  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  className?: string;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
}> = ({
  children,
  className = '',
  mobileSize = 'text-sm',
  tabletSize = 'text-base',
  desktopSize = 'text-lg'
}) => {
  const { deviceInfo } = useDevice();
  
  let sizeClass = '';
  if (deviceInfo.type === DeviceType.MOBILE) {
    sizeClass = mobileSize;
  } else if (deviceInfo.type === DeviceType.TABLET) {
    sizeClass = tabletSize;
  } else {
    sizeClass = desktopSize;
  }
  
  return (
    <div className={`${className} ${sizeClass}`}>
      {children}
    </div>
  );
};
