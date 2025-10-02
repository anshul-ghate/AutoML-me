import React from 'react';
import { EnhancedTrainingPanel } from './EnhancedTrainingPanel';

// Simple wrapper for backward compatibility
export const TrainingPanel: React.FC = () => {
  return <EnhancedTrainingPanel />;
};

export default TrainingPanel;
