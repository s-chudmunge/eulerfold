'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PracticeContextType {
  isPracticeModalOpen: boolean;
  openPracticeModal: () => void;
  closePracticeModal: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  const openPracticeModal = () => setIsPracticeModalOpen(true);
  const closePracticeModal = () => setIsPracticeModalOpen(false);

  return (
    <PracticeContext.Provider value={{ isPracticeModalOpen, openPracticeModal, closePracticeModal }}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
}
