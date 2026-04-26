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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTopSearchFocused, setIsTopSearchFocused] = useState(false);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
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

  // Initialize expanded sections from localStorage or defaults
  useEffect(() => {
    const stored = localStorage.getItem('research-decoded-sidebar-expansion');
    let initialState: Record<string, boolean> = {};
    
    if (stored) {
      try {
        initialState = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse sidebar expansion state:', e);
      }
    }

    // Default logic: expand category containing the active paper
    const activeCategory = navigation.find(nav => 
      nav.sections.some((section: any) => pathname?.includes(section.slug))
    );

    if (activeCategory && !stored) {
      initialState[activeCategory.id] = true;
    } else if (!stored) {
      if (navigation.length > 0) {
        initialState[navigation[0].id] = true;
      }
    }

    setExpandedSections(initialState);

    // Sidebar collapse state
    const collapsed = localStorage.getItem('research-decoded-sidebar-collapsed') === 'true';
    setIsSidebarCollapsed(collapsed);
  }, [pathname, navigation]);

  // Persist expansion state to localStorage
  useEffect(() => {
    if (Object.keys(expandedSections).length > 0) {
      localStorage.setItem('research-decoded-sidebar-expansion', JSON.stringify(expandedSections));
    }
  }, [expandedSections]);

  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('research-decoded-sidebar-collapsed', String(newState));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const updateSearchQuery = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredNavigation = navigation.map(nav => ({
    ...nav,
    sections: nav.sections.filter((section: any) => {
      const searchLower = searchQuery.toLowerCase();
      const paper = papers[section.slug];
      const authorStr = (paper?.authors || "").toLowerCase();
      return section.title.toLowerCase().includes(searchLower) || authorStr.includes(searchLower);
    })
  })).filter(nav => nav.sections.length > 0);

  const topSearchResults = navigation
    .flatMap(nav => nav.sections)
    .filter((section: any) => {
      const searchLower = searchQuery.toLowerCase();
      const paper = papers[section.slug];
      const authorStr = (paper?.authors || "").toLowerCase();
      return section.title.toLowerCase().includes(searchLower) || authorStr.includes(searchLower);
    })
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
      <React.Suspense fallback={null}>
        <SearchParamsHandler onParams={handleSearchParams} />
      </React.Suspense>
      
      {/* 1. Global Public Header - Ensure it has high z-index to stay on top */}
      <div className="relative z-[150]">
        <PublicHeader />
      </div>

      {/* 2. Sub-header with Search and Sidebar Toggle */}
      <div className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 relative z-[140]">
        <div className="w-full px-4 md:px-6 flex h-full items-center">
          {/* Left section: Toggle */}
          <div className="flex items-center w-[40px] md:w-[200px] shrink-0">
            {/* Desktop toggle moved to sidebar edge */}

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex md:hidden items-center justify-center p-2 hover:bg-sidebar rounded-lg text-text-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Center section: Search Bar (Centered) */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[500px]">
              <input 
                autoComplete="off" 
                className="w-full pl-10 h-8 pr-3 rounded-full border border-border bg-sidebar focus:bg-background focus:ring-1 focus:ring-[var(--accent)] transition-all text-[13px] text-text-primary outline-none placeholder:text-text-muted" 
                placeholder="Search across all breakthroughs..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                onFocus={() => setIsTopSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsTopSearchFocused(false), 200)}
              />
              <Search className="absolute left-3.5 text-text-muted top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" />
              
              {/* Dropdown Results */}
              {isTopSearchFocused && searchQuery && topSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-sidebar border border-border rounded-xl shadow-2xl z-[150] overflow-hidden">
                  {topSearchResults.map((result: any, idx: number) => (
                    <Link
                      key={idx}
                      href={`/research-decoded/${result.slug}?${searchParams.toString()}`}
                      className="block px-4 py-3 text-[13px] text-text-primary hover:bg-background transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-bold text-text-heading">{result.title}</div>
                      <div className="text-[11px] text-text-muted truncate opacity-80">{result.intro || 'Access full paper decoding'}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right section: Placeholder for balance */}
          <div className="hidden md:flex items-center justify-end w-[200px] shrink-0">
          </div>
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[130] md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Desktop Sidebar Toggle Button (Floating on Edge) */}
        <button
          onClick={toggleSidebarCollapse}
          className={`
            hidden md:flex absolute top-1/2 -translate-y-1/2 z-[130]
            w-5 h-10 bg-sidebar border border-border border-l-0 rounded-r-lg
            items-center justify-center hover:bg-background transition-all duration-300 group shadow-sm
            ${isSidebarCollapsed ? 'left-0' : 'left-[320px]'}
          `}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
          )}
        </button>

        {/* Left Sidebar */}
        <aside 
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            manrope-body bg-sidebar border-r border-border transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'md:w-0 md:opacity-0 md:-translate-x-4' : 'md:w-[320px] md:opacity-100 md:translate-x-0'}
            flex flex-col h-full overflow-y-auto no-scrollbar fixed md:relative inset-y-0 left-0 z-[120] shrink-0
          `}
        >
          <div className="md:hidden h-[48px] px-4 border-b border-border shrink-0 flex items-center justify-end">
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-callout-bg rounded-lg text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Removed: Jump to paper search input from sidebar */}

          <nav className="flex-1 px-2.5 pt-4 pb-16 space-y-1">
            {filteredNavigation.map((nav) => {
              const isExpanded = searchQuery ? true : !!expandedSections[nav.id];
              
              return (
                <div key={nav.id} className="mb-0.5">
                  <button 
                    onClick={() => toggleSection(nav.id)}
                    className={`w-full flex items-center px-4 py-3 text-[14px] font-bold group transition-all text-left rounded-xl ${
                      isExpanded ? 'text-text-heading bg-background/30' : 'text-text-muted hover:text-text-primary hover:bg-background/50'
                    }`}
                  >
                    <span className="flex-1 uppercase tracking-tight">{nav.title}</span>
                    <ChevronRight 
                      className={`w-3.5 h-3.5 opacity-40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 space-y-1 ml-1 animate-in fade-in slide-in-from-left-1 duration-200">
                      {nav.sections.map((section: any, idx: number) => {
                        const active = pathname?.includes(section.slug);
                        return (
                          <Link 
                            key={idx}
                            href={`/research-decoded/${section.slug}?${searchParams.toString()}`}
                            onClick={() => setIsSidebarOpen(false)}
                            style={active ? { background: 'var(--active-bg)' } : {}}
                            className={`block py-2.5 px-5 text-[16px] rounded-xl transition-all ${
                              active 
                                ? 'text-[var(--active-text)] font-bold shadow-sm border border-border/50' 
                                : 'text-text-muted font-medium hover:text-text-primary hover:bg-background/50'
                            }`}
                          >
                            {section.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredNavigation.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-text-muted italic">No papers found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </nav>
        </aside>

        <main ref={scrollContainerRef} className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar bg-background transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
