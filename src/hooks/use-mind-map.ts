import { createContext, useContext } from 'react';
import { MindMapContextType } from '@/contexts/MindMapContext';

export const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export const useMindMap = (): MindMapContextType => {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
};
