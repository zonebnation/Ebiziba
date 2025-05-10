import { Capacitor } from '@capacitor/core';
import DeviceDetector from 'device-detector-js';

// Device type constants
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown'
}

// Screen size breakpoints
export enum ScreenSize {
  XS = 'xs',    // < 576px
  SM = 'sm',    // >= 576px
  MD = 'md',    // >= 768px
  LG = 'lg',    // >= 992px
  XL = 'xl',    // >= 1200px
  XXL = 'xxl'   // >= 1400px
}

// Device info interface
export interface DeviceInfo {
  type: DeviceType;
  screenSize: ScreenSize;
  isNative: boolean;
  platform: string;
  os: string;
  osVersion: string;
  browser?: string;
  browserVersion?: string;
  model?: string;
  brand?: string;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isPortrait: boolean;
  pixelRatio: number;
  viewportHeight: number;
  viewportWidth: number;
  safeAreaInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Get current screen size based on width
export function getScreenSize(width: number): ScreenSize {
  if (width < 576) return ScreenSize.XS;
  if (width < 768) return ScreenSize.SM;
  if (width < 992) return ScreenSize.MD;
  if (width < 1200) return ScreenSize.LG;
  if (width < 1400) return ScreenSize.XL;
  return ScreenSize.XXL;
}

// Get device type based on user agent and screen size
export function getDeviceType(userAgent: string, width: number): DeviceType {
  // Use device-detector-js to parse user agent
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);
  
  // If device-detector-js detected a mobile or tablet, use that
  if (device.device?.type === 'smartphone' || device.device?.type === 'feature phone') {
    return DeviceType.MOBILE;
  }
  
  if (device.device?.type === 'tablet') {
    return DeviceType.TABLET;
  }
  
  // Fallback to screen size detection
  if (width < 768) {
    return DeviceType.MOBILE;
  }
  
  if (width < 1024) {
    return DeviceType.TABLET;
  }
  
  return DeviceType.DESKTOP;
}

// Get device information
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  // Use device-detector-js to parse user agent
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);
  
  const screenSize = getScreenSize(width);
  const deviceType = getDeviceType(userAgent, width);
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  
  // Get safe area insets if available (for iOS)
  const safeAreaInsets = typeof window !== 'undefined' && 
    (window as any).SafeArea ? 
    (window as any).SafeArea.insets : 
    { top: 0, right: 0, bottom: 0, left: 0 };
  
  return {
    type: deviceType,
    screenSize,
    isNative,
    platform,
    os: device.os?.name || 'unknown',
    osVersion: device.os?.version || 'unknown',
    browser: device.client?.name,
    browserVersion: device.client?.version,
    model: device.device?.model,
    brand: device.device?.brand,
    isSmallScreen: width < 768,
    isMediumScreen: width >= 768 && width < 1024,
    isLargeScreen: width >= 1024,
    isPortrait: height > width,
    pixelRatio: window.devicePixelRatio || 1,
    viewportHeight: height,
    viewportWidth: width,
    safeAreaInsets
  };
}

// Check if device has notch (iPhone X and newer)
export function hasNotch(): boolean {
  // iOS detection
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  if (!iOS) return false;
  
  // iPhone X detection
  return (
    // Check for iOS devices with notch
    (window.screen.height === 812 && window.screen.width === 375) || // iPhone X, XS, 11 Pro
    (window.screen.height === 896 && window.screen.width === 414) || // iPhone XR, XS Max, 11, 11 Pro Max
    (window.screen.height === 844 && window.screen.width === 390) || // iPhone 12, 12 Pro, 13, 13 Pro
    (window.screen.height === 926 && window.screen.width === 428) || // iPhone 12 Pro Max, 13 Pro Max
    (window.screen.height === 780 && window.screen.width === 360) || // iPhone 12 mini, 13 mini
    (window.screen.height === 852 && window.screen.width === 393) || // iPhone 14, 14 Pro
    (window.screen.height === 932 && window.screen.width === 430)    // iPhone 14 Pro Max
  );
}

// Check if device is a small Android device
export function isSmallAndroidDevice(): boolean {
  const isAndroid = /Android/.test(navigator.userAgent);
  if (!isAndroid) return false;
  
  // Check for small screen Android devices
  return window.innerHeight < 700 || window.innerWidth < 360;
}

// Get bottom navigation height based on device
export function getBottomNavHeight(): number {
  if (hasNotch()) {
    return 84; // Extra space for iPhone with notch
  }
  
  if (isSmallAndroidDevice()) {
    return 64; // Smaller height for small Android devices
  }
  
  return 76; // Default height
}

// Listen for orientation changes
export function listenForOrientationChanges(callback: (isPortrait: boolean) => void): () => void {
  const handleResize = () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    callback(isPortrait);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
