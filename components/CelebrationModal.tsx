import React from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  achievement?: string;
  stats?: Array<{ label: string; value: string | number }>;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div />;
};

export default CelebrationModal;
