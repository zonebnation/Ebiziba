import { v5 as uuidv5 } from 'uuid';
import DeviceDetector from 'device-detector-js';

// Namespace for device fingerprinting
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Interface for device information
interface DeviceInfo {
  browser: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
  device: {
    type?: string;
    brand?: string;
    model?: string;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  language: string;
  timezone: string;
  userAgent: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  plugins?: string[];
  canvas?: string;
  webgl?: string;
  localStorage?: boolean;
  sessionStorage?: boolean;
  cookiesEnabled?: boolean;
  androidId?: string;
}

/**
 * Generate a unique device fingerprint
 * This combines multiple device characteristics to create a unique identifier
 * that persists even if the user clears cookies or creates a new account
 */
export async function generateDeviceFingerprint(): Promise<string> {
  try {
    // Get device information
    const deviceInfo = await collectDeviceInfo();
    
    // Create a stable string representation of device info
    const deviceInfoString = JSON.stringify(deviceInfo, Object.keys(deviceInfo).sort());
    
    // Generate a UUID v5 based on the device info
    const fingerprint = uuidv5(deviceInfoString, NAMESPACE);
    
    // Store the fingerprint in localStorage for future use
    localStorage.setItem('device_fingerprint', fingerprint);
    
    return fingerprint;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    
    // Fallback to a less reliable method if the main one fails
    return generateFallbackFingerprint();
  }
}

/**
 * Get the stored device fingerprint or generate a new one
 */
export async function getDeviceFingerprint(): Promise<string> {
  const storedFingerprint = localStorage.getItem('device_fingerprint');
  
  if (storedFingerprint) {
    return storedFingerprint;
  }
  
  return generateDeviceFingerprint();
}

/**
 * Collect various device information to create a unique fingerprint
 */
async function collectDeviceInfo(): Promise<DeviceInfo> {
  // Parse user agent
  const detector = new DeviceDetector();
  const userAgent = navigator.userAgent;
  const result = detector.parse(userAgent);
  
  // Get screen information
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth
  };
  
  // Get browser plugins
  const plugins = Array.from(navigator.plugins || [])
    .map(plugin => plugin.name)
    .sort();
  
  // Get canvas fingerprint
  const canvasFingerprint = await getCanvasFingerprint();
  
  // Get WebGL fingerprint
  const webglFingerprint = await getWebGLFingerprint();
  
  // Get Android ID if available
  const androidId = await getAndroidId();
  
  // Combine all information
  const deviceInfo: DeviceInfo = {
    browser: {
      name: result.client?.name,
      version: result.client?.version
    },
    os: {
      name: result.os?.name,
      version: result.os?.version
    },
    device: {
      type: result.device?.type,
      brand: result.device?.brand,
      model: result.device?.model
    },
    screen: screenInfo,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory,
    plugins,
    canvas: canvasFingerprint,
    webgl: webglFingerprint,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    cookiesEnabled: navigator.cookieEnabled,
    androidId
  };
  
  return deviceInfo;
}

/**
 * Generate a canvas fingerprint
 */
async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Ebizimba Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Ebizimba Fingerprint', 4, 17);
    
    // Get canvas data URL
    return canvas.toDataURL().replace('data:image/png;base64,', '').substring(0, 50);
  } catch (error) {
    console.error('Error generating canvas fingerprint:', error);
    return '';
  }
}

/**
 * Generate a WebGL fingerprint
 */
async function getWebGLFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return '';
    
    // Get WebGL renderer and vendor
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    if (!debugInfo) return '';
    
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    
    return `${vendor}:${renderer}`;
  } catch (error) {
    console.error('Error generating WebGL fingerprint:', error);
    return '';
  }
}

/**
 * Get Android ID if available through the Android interface
 */
async function getAndroidId(): Promise<string | undefined> {
  try {
    // Check if Android interface is available
    if ((window as any).Android && (window as any).Android.getDeviceId) {
      return (window as any).Android.getDeviceId();
    }
    return undefined;
  } catch (error) {
    console.error('Error getting Android ID:', error);
    return undefined;
  }
}

/**
 * Generate a fallback fingerprint if the main method fails
 */
function generateFallbackFingerprint(): string {
  // Create a simple fingerprint based on available information
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency,
    window.screen.colorDepth,
    window.screen.width + 'x' + window.screen.height
  ];
  
  // Join components and hash them
  const deviceString = components.join('###');
  
  // Generate a UUID v5 based on the device string
  const fingerprint = uuidv5(deviceString, NAMESPACE);
  
  // Store the fingerprint in localStorage for future use
  localStorage.setItem('device_fingerprint', fingerprint);
  
  return fingerprint;
}

/**
 * Check if the device has been modified to avoid detection
 * This helps identify attempts to bypass the trial system
 */
export function detectDeviceModification(): boolean {
  try {
    // Check for inconsistencies in browser data
    const hasInconsistentData = checkDataInconsistencies();
    
    // Check for virtual environment
    const isVirtualEnvironment = checkVirtualEnvironment();
    
    // Check for developer tools
    const hasDeveloperTools = checkDeveloperTools();
    
    return hasInconsistentData || isVirtualEnvironment || hasDeveloperTools;
  } catch (error) {
    console.error('Error detecting device modification:', error);
    return false;
  }
}

/**
 * Check for inconsistencies in browser data
 */
function checkDataInconsistencies(): boolean {
  // Check if user agent is consistent with platform
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  
  if (userAgent.includes('android') && !platform.includes('linux')) {
    return true;
  }
  
  if (userAgent.includes('iphone') && !platform.includes('iphone')) {
    return true;
  }
  
  // Check for timezone inconsistency
  const timezoneOffset = new Date().getTimezoneOffset();
  const storedOffset = parseInt(localStorage.getItem('timezone_offset') || '0', 10);
  
  if (storedOffset !== 0 && Math.abs(timezoneOffset - storedOffset) > 60) {
    return true;
  }
  
  // Store current timezone offset
  localStorage.setItem('timezone_offset', timezoneOffset.toString());
  
  return false;
}

/**
 * Check if the app is running in a virtual environment
 */
function checkVirtualEnvironment(): boolean {
  // Check for emulator-specific properties
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('emulator') || 
      userAgent.includes('android sdk built for x86') ||
      userAgent.includes('generic')) {
    return true;
  }
  
  return false;
}

/**
 * Check if developer tools are enabled
 */
function checkDeveloperTools(): boolean {
  // This is a simple check and can be bypassed, but adds another layer
  try {
    const devToolsEnabled = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    return devToolsEnabled && (window as any).chrome && (window as any).chrome.devtools;
  } catch (error) {
    return false;
  }
}
