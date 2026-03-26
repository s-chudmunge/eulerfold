"use client";

import React, { useState, useEffect } from 'react';
import { Inconsolata, Manrope } from 'next/font/google';
import { 
  Search,
  ChevronRight,
  Menu,
  X,
  Github,
  ArrowRight,
  Microscope
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { navigation } from './generatedData';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

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

export default function ResearchDecodedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTopSearchFocused, setIsTopSearchFocused] = useState(false);
  const [user, setUser] = useState<any>(null);
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
      nav.sections.some(section => pathname?.includes(section.slug))
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
  }, [pathname]);

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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const updateSearchQuery = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' } 
        },
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const filteredNavigation = navigation.map(nav => ({
    ...nav,
    sections: nav.sections.filter(section => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(nav => nav.sections.length > 0);

  const topSearchResults = navigation
    .flatMap(nav => nav.sections)
    .filter(section => section.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  return (
    <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden`}>
      <React.Suspense fallback={null}>
        <SearchQueryHandler setSearchQuery={setSearchQuery} setSearchParams={setSearchParams} />
      </React.Suspense>
      {/* 1. Global Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0">
        <div className="w-full px-6 flex h-full items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Logo Part */}
            <Link className="mr-8 flex items-center group shrink-0" href="/">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>

            {/* Search Input container pushed to right */}
            <div className="flex-1 flex justify-end mr-8">
              <div className="relative w-full max-w-[400px]">
                <input 
                  autoComplete="off" 
                  className="w-full pl-10 h-10 pr-3 rounded-md border border-border bg-sidebar focus:bg-background focus:ring-1 focus:ring-[var(--accent)] transition-all text-[13px] text-text-primary outline-none placeholder:text-text-muted" 
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
                    {topSearchResults.map((result, idx) => (
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
          <div className="p-5 border-b border-border shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Microscope className="w-4 h-4 text-accent" />
              <h1 className="text-[15px] font-bold leading-tight tracking-tight text-text-heading whitespace-nowrap">
                Research Decoded
              </h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-callout-bg rounded-lg text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-5 py-4 border-b border-border shrink-0">
            <div className="relative">
              <input 
                className="w-full flex items-center rounded-full border border-border bg-background pl-9 pr-4 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
                placeholder="Jump to paper..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            </div>
          </div>

          <nav className="flex-1 px-4 pt-6 pb-16 space-y-2">
            {filteredNavigation.map((nav) => {
              const isExpanded = searchQuery ? true : !!expandedSections[nav.id];
              
              return (
                <div key={nav.id} className="mb-4">
                  <button 
                    onClick={() => toggleSection(nav.id)}
                    className="w-full flex items-center px-2 py-1.5 text-[12px] font-bold text-text-muted group hover:text-text-primary transition-colors text-left"
                  >
                    <span className="flex-1">{nav.title}</span>
                    <ChevronRight 
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1.5 space-y-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {nav.sections.map((section, idx) => {
                        const active = pathname?.includes(section.slug);
                        return (
                          <Link 
                            key={idx}
                            href={`/research-decoded/${section.slug}?${searchParams.toString()}`}
                            onClick={() => setIsSidebarOpen(false)}
                            style={active ? { background: 'var(--active-bg)' } : {}}
                            className={`block py-2 px-4 text-[13px] rounded-xl transition-all ${
                              active 
                                ? 'text-[var(--active-text)] font-bold shadow-lg border border-border' 
                                : 'text-text-muted font-medium hover:text-text-primary hover:bg-background'
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
