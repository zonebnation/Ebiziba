import React from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Immediately call onFinish to skip the splash screen
  React.useEffect(() => {
    onFinish();
  }, [onFinish]);
  
  // Return null to render nothing
  return null;
};
