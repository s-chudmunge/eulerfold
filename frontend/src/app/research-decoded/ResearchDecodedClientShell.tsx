'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import PublicHeader from '@/components/PublicHeader';
import { papers } from './generatedData';
import ResearchNavigationSidebar from '@/components/research-lab/ResearchNavigationSidebar';

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);
  return null;
}

export default function ResearchDecodedClientShell({
  children,
  navigation
}: {
  children: React.ReactNode;
  navigation: any[];
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLElement>(null);

  const handleSearchParams = React.useCallback((params: URLSearchParams) => {
    setSearchQuery(params.get('q') || "");
    setSearchParams(new URLSearchParams(params.toString()));
    
    const categoryId = params.get('category');
    if (categoryId && pathname === '/research-decoded') {
      setTimeout(() => {
        const element = document.getElementById(categoryId);
        const container = scrollContainerRef.current;
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top;
          
          container.scrollTo({
            top: container.scrollTop + relativeTop - 20,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [pathname]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden transition-all duration-300"
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      <React.Suspense fallback={null}>
        <SearchParamsHandler onParams={handleSearchParams} />
      </React.Suspense>
      
      {/* 1. Global Public Header - Ensure it has high z-index to stay on top */}
      <div className="relative z-[150]">
        <PublicHeader />
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        <ResearchNavigationSidebar hideTrigger currentSlug={pathname?.split('/').pop()} />

        <main ref={scrollContainerRef} className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar bg-background transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
