'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search,
  ChevronRight,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

function SearchQueryHandler({ 
  setSearchQuery, 
  setSearchParams 
}: { 
  setSearchQuery: (val: string) => void,
  setSearchParams: (params: URLSearchParams) => void
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || "");
    setSearchParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams, setSearchQuery, setSearchParams]);

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
  const [isTopSearchFocused, setIsTopSearchFocused] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();

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
      // If no active paper and no stored state, expand first category
      if (navigation.length > 0) {
        initialState[navigation[0].id] = true;
      }
    }

    setExpandedSections(initialState);
  }, [pathname, navigation]);

  // Persist expansion state to localStorage
  useEffect(() => {
    if (Object.keys(expandedSections).length > 0) {
      localStorage.setItem('research-decoded-sidebar-expansion', JSON.stringify(expandedSections));
    }
  }, [expandedSections]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Close sidebar on route change
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

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  };

  const filteredNavigation = navigation.map(nav => ({
    ...nav,
    sections: nav.sections.filter((section: any) => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(nav => nav.sections.length > 0);

  const topSearchResults = navigation
    .flatMap(nav => nav.sections)
    .filter((section: any) => section.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
      <React.Suspense fallback={null}>
        <SearchQueryHandler setSearchQuery={setSearchQuery} setSearchParams={setSearchParams} />
      </React.Suspense>
      {/* 1. Global Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0">
        <div className="w-full px-6 flex h-full items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Logo Part */}
            <Link className="flex items-center group shrink-0" href="/">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>

            <div className="h-4 w-px bg-border mx-4 hidden md:block"></div>

            <div className="flex items-center gap-2.5 mr-8">
              <h1 className="text-[14px] font-bold leading-tight tracking-tight text-text-heading whitespace-nowrap">
                Research Decoded
              </h1>
            </div>

            {/* Search Input container centered */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-[400px]">
                <input 
                  autoComplete="off" 
                  className="w-full pl-10 h-8 pr-3 rounded-md border border-border bg-sidebar focus:bg-background focus:ring-1 focus:ring-[var(--accent)] transition-all text-[13px] text-text-primary outline-none placeholder:text-text-muted" 
                  placeholder="Search papers..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  onFocus={() => setIsTopSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsTopSearchFocused(false), 200)}
                />
                <Search className="absolute left-3 text-text-muted top-1/2 transform -translate-y-1/2 w-4 h-4" />
                
                {/* Dropdown Results */}
                {isTopSearchFocused && searchQuery && topSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-border rounded-lg shadow-2xl z-[150] overflow-hidden">
                    {topSearchResults.map((result: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/research-decoded/${result.slug}?${searchParams.toString()}`}
                        className="block px-4 py-2.5 text-[13px] text-text-primary hover:bg-background transition-colors border-b border-border last:border-0"
                      >
                        {result.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Minimal Nav */}
          <nav aria-label="Main" className="hidden lg:block ml-4">
            <ul className="flex items-center gap-x-6 text-[14px] font-medium text-text-muted">
              {user ? (
                <>
                  <li className="hover:text-text-heading transition-colors">
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link 
                      href="/settings"
                      className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-5 py-1.5 text-[var(--bg-main)] font-bold hover:opacity-90 transition-opacity"
                    >
                      Profile
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="hover:text-text-heading transition-colors">
                    <button onClick={handleSignIn}>Log In</button>
                  </li>
                  <li>
                    <button 
                      onClick={handleSignIn}
                      className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-5 py-1.5 text-[var(--bg-main)] font-bold hover:opacity-90 transition-opacity"
                    >
                      Sign In
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } manrope-body bg-sidebar border-r border-border transition-transform duration-200 w-[260px] flex flex-col h-full overflow-y-auto no-scrollbar fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 shrink-0`}
        >
          <div className="p-5 border-b border-border shrink-0 flex items-center justify-between md:hidden">
            <div className="flex items-center">
              <h1 className="text-[15px] font-bold leading-tight tracking-tight text-text-heading whitespace-nowrap">
                Research Decoded
              </h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-callout-bg rounded-lg text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-4 py-4 border-b border-border shrink-0">
            <div className="relative">
              <input 
                className="w-full flex items-center rounded-full border border-border bg-background pl-9 pr-4 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
                placeholder="Jump to paper..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            </div>
          </div>

          <nav className="flex-1 px-2.5 pt-4 pb-16 space-y-1">
            {filteredNavigation.map((nav) => {
              const isExpanded = searchQuery ? true : !!expandedSections[nav.id];
              
              return (
                <div key={nav.id} className="mb-0.5">
                  <button 
                    onClick={() => toggleSection(nav.id)}
                    className={`w-full flex items-center px-3 py-2 text-[12px] font-bold group transition-all text-left rounded-lg ${
                      isExpanded ? 'text-text-heading bg-background/30' : 'text-text-muted hover:text-text-primary hover:bg-background/50'
                    }`}
                  >
                    <span className="flex-1 uppercase tracking-tight">{nav.title}</span>
                    <ChevronRight 
                      className={`w-3.5 h-3.5 opacity-40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-0.5 space-y-0.5 ml-1 animate-in fade-in slide-in-from-left-1 duration-200">
                      {nav.sections.map((section: any, idx: number) => {
                        const active = pathname?.includes(section.slug);
                        return (
                          <Link 
                            key={idx}
                            href={`/research-decoded/${section.slug}?${searchParams.toString()}`}
                            onClick={() => setIsSidebarOpen(false)}
                            style={active ? { background: 'var(--active-bg)' } : {}}
                            className={`block py-1.5 px-4 text-[13px] rounded-lg transition-all ${
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
          
          <div className="p-4 border-t border-border">
            <p className="inconsolata-ui text-[10px] font-bold text-text-muted text-center uppercase tracking-widest opacity-60">
              Verified Explorer
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar bg-background">
          {/* Mobile-only hamburger bar */}
          <div className="md:hidden sticky top-0 z-30 bg-background border-b border-border flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-callout-bg rounded-lg text-text-primary"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="inconsolata-ui text-[12px] font-bold uppercase tracking-widest text-text-muted">Research Index</span>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
