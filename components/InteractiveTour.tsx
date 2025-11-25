import React from 'react';

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentPage: string;
}

const InteractiveTour: React.FC<InteractiveTourProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div />;
};

export default InteractiveTour;
