'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface SettingsContextType {
  isOpen: boolean;
  targetTab: string | null;
  openSettings: (tabId?: string) => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function SearchParamsHandler({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      onOpen();
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('settings');
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${newQuery}`);
    }
  }, [searchParams, router, pathname, onOpen]);

  return null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetTab, setTargetTab] = useState<string | null>(null);

  const openSettings = (tabId?: string) => {
    if (tabId) setTargetTab(tabId);
    setIsOpen(true);
  };
  const closeSettings = () => {
    setIsOpen(false);
    setTimeout(() => setTargetTab(null), 300); // clear after animation
  };

  return (
    <SettingsContext.Provider value={{ isOpen, targetTab, openSettings, closeSettings }}>
      <Suspense fallback={null}>
        <SearchParamsHandler onOpen={openSettings} />
      </Suspense>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
