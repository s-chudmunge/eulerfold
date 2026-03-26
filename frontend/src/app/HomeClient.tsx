"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Globe, 
  ArrowRight, 
  User, 
  Compass, 
  Microscope, 
  AlertCircle, 
  X, 
  Trophy, 
  HelpCircle, 
  GraduationCap,
  Menu,
  LogOut,
  MoreHorizontal,
  MessageSquare,
  Home,
  Archive,
  CreditCard,
  LayoutDashboard,
  Turtle,
  Zap,
  Coins,
  Flame,
  Gem
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { exploreAPI, ExploreRoadmap } from '@/lib/api';
import { navigation, papers } from './research-decoded/generatedData';
import { archiveData } from './archive/generatedArchiveData';
import { cleanSearchQuery, getSearchKeywords } from '@/lib/search';
import AppSidebar from '@/components/AppSidebar';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import Fuse from 'fuse.js';

const EXAM_FULL_NAMES: Record<string, string> = {
  "AIME": "American Invitational Mathematics Examination",
  "AMC": "American Mathematics Competitions",
  "AP": "Advanced Placement",
  "CSIR_NET": "CSIR National Eligibility Test",
  "ENGAA": "Engineering Admissions Assessment",
  "GATE": "Graduate Aptitude Test in Engineering",
  "IAO": "International Astronomy Olympiad",
  "IChO": "International Chemistry Olympiad",
  "IMO": "International Mathematical Olympiad",
  "IOI": "International Olympiad in Informatics",
  "IPhO": "International Physics Olympiad",
  "JAM": "Joint Admission Test for Masters",
  "JEST": "Joint Entrance Screening Test",
  "MAT": "Mathematics Admissions Test",
  "NSAA": "Natural Sciences Admissions Assessment",
  "PAT": "Physics Aptitude Test",
  "Putnam": "William Lowell Putnam Mathematical Competition",
  "STEP": "Sixth Term Examination Paper",
  "TIFR": "Tata Institute of Fundamental Research",
  "UGC_NET": "UGC National Eligibility Test"
};

const EXAM_LOGOS: Record<string, string> = {
  "IMO": "/assets/logos/IMO.png",
  "IPhO": "/assets/logos/IPhO.png",
  "MAT": "/assets/logos/MAT.png",
  "PAT": "/assets/logos/PAT.png"
};

interface UnifiedSuggestion {
  id?: string | number;
  title: string;
  path: string;
  type: 'Roadmap' | 'Paper' | 'Exam' | 'Archive';
  relevance: number;
  icon?: any;
  logo?: string;
  metadata?: any;
}

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="text-teal-600 dark:text-teal-400 font-bold">{part}</span> 
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

export default function HomeClient() {
  const [query, setQuery] = useState('');
  const [allSuggestions, setAllSuggestions] = useState<UnifiedSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'New Goal', icon: Plus, href: '/generate' },
    { label: 'Explore', icon: Globe, href: '/explore' },
    { label: 'Learn', icon: GraduationCap, href: '/learn' },
    { label: 'Research', icon: Microscope, href: '/research-decoded' },
    { label: 'Archives', icon: Archive, href: '/archive/exams/previous-year-papers' },
    { label: 'Rankings', icon: Trophy, href: '/leaderboard' },
    { label: 'Pricing', icon: CreditCard, href: '/pricing' },
    { label: 'Help', icon: HelpCircle, href: '/help' },
  ];

  useEffect(() => {
    if (searchParams.get('message') === 'login_required') {
      setShowLoginMessage(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      const timer = setTimeout(() => setShowLoginMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setAllSuggestions([]);
        setActiveIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const q = query.toLowerCase().trim();
        const cleanedQuery = cleanSearchQuery(query);
        const keywords = getSearchKeywords(query);
        
        // 1. Fetch Roadmaps from API
        const roadmapResults = await exploreAPI.getExploreRoadmaps(query.trim(), 0, 5);
        
        const combinedResults: UnifiedSuggestion[] = [];

        // Add Roadmaps
        roadmapResults.forEach(r => {
          let relevance = 0;
          if (r.title.toLowerCase() === q) relevance = 2000;
          else if (r.title.toLowerCase().includes(q)) relevance = 1000;
          else relevance = 500;
          
          combinedResults.push({
            id: r.id,
            title: r.title,
            path: `/roadmap/${r.slug}`,
            type: 'Roadmap',
            relevance,
            icon: Compass
          });
        });

        // 2. Fuzzy Search Research Papers
        const flatPapers = navigation.flatMap(cat => 
          cat.sections.map(sec => ({
            ...sec,
            category: cat.title,
            intro: (papers as any)[sec.slug]?.intro || "",
            authors: (papers as any)[sec.slug]?.authors || ""
          }))
        );

        const paperFuse = new Fuse(flatPapers, {
          keys: ['title', 'intro', 'authors'],
          threshold: 0.4,
          includeScore: true
        });

        const paperResults = paperFuse.search(query).slice(0, 3);
        paperResults.forEach(res => {
          combinedResults.push({
            title: res.item.title,
            path: `/research-decoded/${res.item.slug}`,
            type: 'Paper',
            relevance: (1 - (res.score || 0)) * 1200,
            icon: Microscope
          });
        });

        // 3. Filter Archive Papers & Exams
        archiveData.forEach(cat => {
          const catTitle = cat.title.toLowerCase();
          const catId = cat.id.toLowerCase();
          const catFullName = (EXAM_FULL_NAMES[cat.title] || "").toLowerCase();
          
          let catRelevance = 0;
          if (catTitle === q || catId === q) catRelevance = 1500;
          else if (catTitle.includes(q) || catId.includes(q)) catRelevance = 800;
          else if (catFullName.includes(q)) catRelevance = 600;
          
          if (catRelevance > 0) {
            combinedResults.push({
              title: `${cat.title} Previous Year Papers`,
              relevance: catRelevance,
              path: `/archive/exams/previous-year-papers/${catId}`,
              type: 'Exam',
              icon: Archive,
              logo: EXAM_LOGOS[cat.title]
            });
          }

          cat.entries.forEach(entry => {
            const subject = (entry.subject === 'Main Paper' ? 'Paper' : entry.subject).toLowerCase();
            const year = entry.year.toLowerCase();
            const fullName = `${cat.title} ${subject} ${year}`.toLowerCase();
            const altName = `${catFullName} ${subject} ${year}`.toLowerCase();
            
            let relevance = 0;
            if (fullName === q) relevance = 2500;
            else if (fullName.includes(q) || altName.includes(q)) relevance = 1100;
            else {
              const queryKeywords = q.split(/\s+/).filter(k => k.length > 0);
              let matches = 0;
              for (const kw of queryKeywords) {
                if (fullName.includes(kw) || altName.includes(kw)) matches++;
              }
              if (matches === queryKeywords.length) relevance = 900;
              else if (matches > 0) relevance = (matches / queryKeywords.length) * 700;
            }

            if (relevance > 0) {
              combinedResults.push({
                title: `${cat.title} ${entry.subject === 'Main Paper' ? 'Paper' : entry.subject} ${entry.year}`,
                relevance,
                path: `/archive/exams/previous-year-papers/${catId}/${entry.slug}`,
                type: 'Archive',
                icon: Archive,
                logo: EXAM_LOGOS[cat.title]
              });
            }
          });
        });

        // Global sort by relevance
        const sorted = combinedResults
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 8);

        setAllSuggestions(sorted);
        setActiveIndex(-1);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
        setProfile(data);
      }
    };
    checkUser();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        router.push(allSuggestions[activeIndex].path);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/generate?subject=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-black dark:text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Login Required Message */}
      {showLoginMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="px-4 py-1.5 bg-sidebar/50 dark:bg-white/5 backdrop-blur-md rounded-full border border-border dark:border-white/10">
            <p className="manrope-body text-[11px] font-medium text-gray-400 dark:text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>
        </div>
      )}

      {/* Minimal Sidebar */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`fixed left-0 top-0 bottom-0 z-[100] bg-sidebar/95 backdrop-blur-xl border-r border-border dark:border-white/[0.05] transition-all duration-300 ease-in-out flex flex-col pt-6 pb-2 ${isSidebarExpanded ? 'w-[200px]' : 'w-[64px]'} ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="mb-8 shrink-0 h-8 flex items-center overflow-hidden">
          <Link 
            href="/" 
            className={`flex items-center transition-all duration-300 ${isSidebarExpanded ? 'px-6 gap-3' : 'w-[64px] justify-center'}`}
          >
            <div className="relative">
              <img src="/apple-touch-icon.png" alt="" className="w-7 h-7 object-contain shrink-0" />
            </div>
            {isSidebarExpanded && (
              <span className="font-bold text-[13px] tracking-tight inconsolata-ui whitespace-nowrap text-slate-950 dark:text-white">
                EulerFold
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-hidden">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
          <Link 
            key={item.label}
            href={item.href}
            className={`flex items-center gap-4 px-3 py-2 rounded-xl transition-all duration-200 group ${active ? 'bg-black/5 dark:bg-white/5 shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <item.icon className={`w-3.5 h-3.5 transition-colors shrink-0 ${active ? 'text-slate-950 dark:text-white stroke-[2px]' : 'text-gray-500 dark:text-gray-400 group-hover:text-slate-950 dark:group-hover:text-white'}`} />
            <span className={`text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'} ${active ? 'text-slate-950 dark:text-white' : 'text-gray-500 group-hover:text-slate-950 dark:group-hover:text-white'}`}>
              {item.label}
            </span>
          </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-3 mt-auto relative" ref={menuRef}>
            {isMenuOpen && (
              <div className="absolute left-[calc(100%+12px)] bottom-2 w-48 bg-background dark:bg-surface border border-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[110] animate-in fade-in slide-in-from-left-1 duration-200">
                <div className="p-1.5">
                  <div className="px-2 py-1.5 border-b border-border dark:border-white/5 mb-1.5">
                    <p className="text-[10px] text-gray-400 lowercase font-medium">signed in as</p>
                    <p className="text-[11px] font-bold truncate text-black dark:text-white">{user.email}</p>
                  </div>
                  {[
                    { label: 'public profile', icon: User, path: profile?.username ? `/u/${profile.username}` : '/dashboard' },
                    { label: 'feedback', icon: MessageSquare, path: '/help' },
                    { label: 'home page', icon: Home, path: '/' },
                  ].map((item) => (
                    <button 
                      key={item.label}
                      className="flex items-center gap-3 w-full px-2 py-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => { router.push(item.path); setIsMenuOpen(false); }}
                    >
                      <item.icon className="w-3.5 h-3.5" /> 
                      <span className="lowercase">{item.label}</span>
                    </button>
                  ))}
                  <div className="h-px bg-border dark:bg-white/5 my-1.5 mx-1" />
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-2 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" /> 
                    <span className="lowercase">sign out</span>
                  </button>
                </div>
              </div>
            )}
            
            <div 
              className={`flex items-center rounded-xl cursor-pointer group ${isSidebarExpanded ? 'px-3 py-2 gap-3 border border-border dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5' : 'w-10 h-10 mx-auto justify-center hover:bg-black/5 dark:hover:bg-white/5'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/10 shrink-0 overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>
              {isSidebarExpanded && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-black dark:text-white truncate leading-none">
                      {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 lowercase tracking-tight">
                        <Flame className="w-2.5 h-2.5 text-orange-500" />
                        <span>{profile?.current_streak || 0}d</span>
                      </div>
                      <div className="w-px h-2 bg-border dark:bg-white/10" />
                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 lowercase tracking-tight">
                        <Gem className="w-2.5 h-2.5 text-blue-400" />
                        <span>{profile?.eulercoins || 0}</span>
                      </div>
                    </div>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden absolute top-6 right-4 p-2"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </aside>

      {/* Mobile Menu Button */}
      {!isMobileSidebarOpen && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed top-5 left-5 z-[90] md:hidden p-2 bg-background/80 dark:bg-background/80 backdrop-blur-xl border border-border dark:border-white/5 rounded-xl shadow-sm"
        >          <Menu className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {/* Top Right Auth/Profile */}
      <div className="absolute top-5 right-6 z-50 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
              <User className="w-3 h-3" /> Dashboard
            </Link>
            <Link 
              href={profile?.username ? `/u/${profile.username}` : "/dashboard"}
              className="w-7 h-7 rounded-full bg-sidebar dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover grayscale-[0.5]" />
              ) : (
                <span className="text-[9px] font-bold text-teal-600 uppercase">
                  {user.email?.substring(0, 1)}
                </span>
              )}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign in
            </button>
            <Link 
              href="/generate"
              className="bg-black dark:bg-white text-white dark:text-black px-3.5 py-1.5 rounded-full text-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              New Goal
            </Link>
          </div>
        )}
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 md:ml-[64px]">
        <div className="w-full max-w-lg">

          <div className="flex flex-col items-center justify-center mb-12">
            <div className="scale-[1.2] mb-4">
              <EulerLogoCanvas size={32} />
            </div>
            <h2 className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.3em] uppercase opacity-80">
              EulerFold
            </h2>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-3 manrope-body text-black dark:text-white">
              What do you want to learn?
            </h1>
            <p className="text-gray-500 text-[13px] manrope-body font-medium max-w-sm mx-auto leading-relaxed">
              EulerFold is an AI-powered platform that builds personalized, structured roadmaps to help you master any skill with verified proof-of-work.
            </p>
          </div>

          <div className="relative group mb-6 z-50">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input 
                type="text"
                placeholder="Search roadmaps, research, or exam papers..."
                className="w-full bg-sidebar/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-24 py-2.5 text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all manrope-body placeholder:text-gray-500 dark:placeholder:text-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.trim().length >= 2) && (allSuggestions.length > 0 || isLoading) && (
              <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-background border border-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                
                {isLoading ? (
                  <div className="px-4 py-3 text-[11px] text-gray-400 font-medium flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-black dark:bg-white animate-pulse" />
                    Searching...
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar py-1">
                    {allSuggestions.map((s, idx) => (
                      <Link 
                        key={idx} 
                        href={s.path}
                        className={`flex items-center justify-between px-4 py-2 hover:bg-sidebar dark:hover:bg-background/5 transition-colors group/item ${idx === activeIndex ? 'bg-sidebar dark:bg-white/5' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {s.logo ? (
                            <div className="w-3.5 h-3.5 bg-background rounded border border-border overflow-hidden flex items-center justify-center p-0.5 shrink-0 grayscale group-hover/item:grayscale-0 transition-all">
                              <img src={s.logo} alt="" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <s.icon className={`w-3.5 h-3.5 text-gray-400 transition-colors ${
                              s.type === 'Archive' || s.type === 'Exam' ? 'group-hover/item:text-amber-600' :
                              s.type === 'Roadmap' ? 'group-hover/item:text-teal-600' :
                              'group-hover/item:text-indigo-600'
                            }`} />
                          )}
                          <span className="text-[13px] font-medium text-black dark:text-white truncate">
                            <HighlightMatch text={s.title} query={query} />
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tight opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap ml-2">
                          {s.type}
                        </span>
                      </Link>
                    ))}

                    <Link 
                      href={`/explore?search=${encodeURIComponent(query.trim())}`}
                      className="flex items-center justify-between px-4 py-2 border-t border-gray-50 dark:border-white/5 hover:bg-sidebar dark:hover:bg-background/5 transition-colors group/item"
                    >
                      <span className="text-[11px] font-bold text-black dark:text-white opacity-40 group-hover/item:opacity-100 transition-opacity">
                        See all results for "{query.trim()}"
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover/item:text-black dark:group-hover/item:text-white transition-all -translate-x-1 group-hover/item:translate-x-0" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link 
              href={query.trim() ? `/generate?subject=${encodeURIComponent(query.trim())}` : "/generate"}
              className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5"
            >
              <Plus className="w-3 h-3" /> Create roadmap
            </Link>
            <Link 
              href="/explore"
              className="inline-flex items-center justify-center bg-background dark:bg-transparent text-black dark:text-white border border-border dark:border-white/10 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:bg-sidebar dark:hover:bg-background/5 gap-1.5"
            >
              <Globe className="w-3 h-3 text-gray-400" /> Browse library
            </Link>
          </div>

          <div className="mt-24 mb-12">
            {/* Social proof placeholder - can be updated with real user stats later */}
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-12 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity grayscale">
              <img src="/apple-touch-icon.png" alt="" className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px] tracking-tight inconsolata-ui text-black dark:text-white">EulerFold</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Website</h4>
            <div className="flex flex-col gap-1">
              <Link href="/dashboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
              <Link href="/login" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Sign in</Link>
              <Link href="/explore" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Explore</Link>
              <Link href="/generate" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Generate</Link>
              <Link href="/learn" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Learn</Link>
              <Link href="/pricing" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
              <Link href="/leaderboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Leaderboard</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Resources</h4>
            <div className="flex flex-col gap-1">
              <Link href="/research-decoded" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Research</Link>
              <Link href="/help" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Help center</Link>
              <Link href="/settings" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Settings</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Company</h4>
            <div className="flex flex-col gap-1">
              <Link href="/terms" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Terms of service</Link>
              <Link href="/privacy" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Social</h4>
            <div className="flex flex-col gap-1">
              <a href="mailto:hello@eulerfold.com" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Contact support</a>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-medium text-gray-400 inconsolata-ui opacity-50">
            © {new Date().getFullYear()} EulerFold.
          </p>
        </div>
      </footer>
      
      {/* Purpose & Compliance */}
      <div className="w-full px-6 pb-8 text-center bg-background">
        <p className="text-[8px] text-gray-400 dark:text-gray-600 font-medium inconsolata-ui max-w-2xl mx-auto leading-relaxed opacity-40 hover:opacity-100 transition-opacity tracking-tight">
          EulerFold uses advanced AI to build personalized, structured roadmaps tailored to your specific goals and current knowledge level. Our mission is to bridge the gap between information and mastery.
        </p>
      </div>
    </div>
  );
}
