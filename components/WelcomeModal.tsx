import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div />;
};

export default WelcomeModal;
