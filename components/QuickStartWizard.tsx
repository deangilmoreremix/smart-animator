import React from 'react';

interface QuickStartWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNavigate: (page: 'contacts' | 'animator' | 'distribution') => void;
}

const QuickStartWizard: React.FC<QuickStartWizardProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div />;
};

export default QuickStartWizard;
