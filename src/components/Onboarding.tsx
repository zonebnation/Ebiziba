import React from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  // Immediately mark onboarding as completed and call onComplete
  React.useEffect(() => {
    localStorage.setItem('onboarding-completed', 'true');
    onComplete();
  }, [onComplete]);
  
  // Return null to render nothing
  return null;
};
