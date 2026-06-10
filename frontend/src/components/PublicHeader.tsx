"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Plus,
  ChevronDown,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import UserNav from './UserNav';
import { Suspense } from 'react';

const NAVIGATION_DATA = {
  platforms: {
    label: "Platforms",
    columns: [
      {
        title: "Build & Plan",
        links: [
          { label: "Roadmap Generator", href: "/generate", description: "AI custom learning paths" },
          { label: "Study Planner", href: "/planner", description: "Dynamic tracking" },
          { label: "Practice Portal", href: "/practice", description: "Skill validation" }
        ]
      },
      {
        title: "Career",
        links: [
          { label: "Job Decoded", href: "/generate?mode=job", description: "Skill gap analysis" },
          { label: "Goal Builder", href: "/generate", description: "Objective tracking" }
        ]
      }
    ],
    featured: {
      title: "Featured",
      label: "Build-a-Path v2",
      description: "Our new reasoning engine for complex technical roadmaps is now live.",
      href: "/generate",
      cta: "Learn more"
    }
  },
  research: {
    label: "Research",
    columns: [
      {
        title: "Decoded",
        links: [
          { label: "Research Decoded", href: "/research-decoded", description: "Paper breakdowns" },
          { label: "Technical Articles", href: "/articles", description: "Deep dives" },
          { label: "DeepSeek R1 Logic", href: "/research-decoded/deepseek-r1-incentivizing-reasoning" }
        ]
      },
      {
        title: "Foundations",
        links: [
          { label: "Transformer Architecture", href: "/articles/transformer" },
          { label: "Scaling Laws", href: "/articles/scaling-laws" },
          { label: "Alignment Research", href: "/research-decoded?subject=safety" }
        ]
      }
    ],
    featured: {
      title: "Latest",
      label: "AlphaFold 3 Logic",
      description: "A deep dive into how biological structures are predicted with AI.",
      href: "/research-decoded/alphafold-3-logic",
      cta: "Read more"
    }
  },
  library: {
    label: "Library",
    columns: [
      {
        title: "Directory",
        links: [
          { label: "Global Explore", href: "/explore" },
          { label: "Learning Hub", href: "/learn" },
          { label: "Leaderboard", href: "/leaderboard" }
        ]
      },
      {
        title: "Archives",
        links: [
          { label: "Previous Papers", href: "/archive/exams/previous-year-papers" },
          { label: "JEE & GATE Vault", href: "/archive/exams/previous-year-papers" },
          { label: "Olympiad Archives", href: "/archive/exams/previous-year-papers/imo" }
        ]
      }
    ]
  }
};

export default function PublicHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const headerHeight = activeDropdown ? '64px' : (isScrolled ? '48px' : '64px');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        setTheme('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('eulerfold-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleClickOutside = (event: MouseEvent) => {
        if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
            setActiveDropdown(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const NavLink = ({ href, label }: { href: string, label: string }) => (
    <Link 
      href={href} 
      className="text-[14px] font-medium text-text-muted hover:text-text-heading transition-colors duration-200"
    >
      {label}
    </Link>
  );

  const MegaMenu = ({ id, data }: { id: string, data: any }) => {
    const isOpen = activeDropdown === id;
    
    return (
      <div className="static h-full">
        <button 
          onMouseEnter={() => setActiveDropdown(id)}
          className={`flex items-center gap-1 text-[14px] font-medium transition-colors duration-200 h-full relative z-[70] ${
            isOpen ? 'text-text-heading' : 'text-text-muted hover:text-text-heading'
          }`}
        >
          {data.label}
          <ChevronDown className={`w-3 h-3 opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-80' : ''}`} />
        </button>
        
        {isOpen && (
          <div 
            className="fixed left-0 w-screen bg-header border-b border-border animate-in fade-in slide-in-from-top-0 duration-300 z-[100]"
            style={{ top: `calc(${headerHeight} + var(--announcement-height, 0px))` }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
              <div className={`grid gap-8 ${data.featured ? 'col-span-8 grid-cols-2' : 'col-span-12 grid-cols-3'}`}>
                {data.columns.map((col: any) => (
                  <div key={col.title}>
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 opacity-60">
                      {col.title}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {col.links.map((link: any) => (
                        <Link key={link.href} href={link.href} className="group flex flex-col max-w-xs">
                          <span className="text-[15px] font-semibold text-text-heading group-hover:text-teal-700 transition-colors leading-tight">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="text-[12px] text-text-muted opacity-70 leading-snug mt-0.5">
                              {link.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {data.featured && (
                <div className="col-span-4 border-l border-border/40 pl-8 flex flex-col justify-center">
                  <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 opacity-60">
                    {data.featured.title}
                  </h3>
                  <div className="group bg-surface/30 p-4 rounded-lg border border-border/20">
                    <span className="text-[15px] font-bold text-text-heading block mb-1 group-hover:text-teal-700 transition-colors">
                      {data.featured.label}
                    </span>
                    <p className="text-[13px] text-text-muted leading-relaxed mb-3 opacity-80">
                      {data.featured.description}
                    </p>
                    <Link href={data.featured.href} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700 hover:text-teal-800 transition-colors">
                      {data.featured.cta} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 w-full bg-header transition-all duration-300 ${
        activeDropdown 
          ? 'h-[64px] border-b border-transparent' 
          : isScrolled 
            ? 'h-[48px] border-b border-border' 
            : 'h-[64px] border-b border-transparent'
      }`}
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      {/* Backdrop */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 bg-black/[0.05] dark:bg-black/60 backdrop-blur-md z-[40] animate-in fade-in duration-300"
          style={{ top: `calc(${headerHeight} + var(--announcement-height, 0px))` }}
          onMouseEnter={() => setActiveDropdown(null)}
        />
      )}

      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between relative z-[60]">
        
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="group flex items-center gap-2 hover:opacity-100 transition-opacity">
            <img src="/apple-touch-icon.png" alt="" className="w-6 h-6" />
            <span className="text-[16px] font-bold text-text-heading tracking-tight hidden md:block">
              Euler<span className="group-hover:text-teal-700 transition-colors duration-300">Fold</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 h-full">
            <MegaMenu id="platforms" data={NAVIGATION_DATA.platforms} />
            <MegaMenu id="research" data={NAVIGATION_DATA.research} />
            <MegaMenu id="library" data={NAVIGATION_DATA.library} />
            <NavLink href="/about" label="About" />
            <NavLink href="/pricing" label="Pricing" />
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-text-muted opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          <Suspense fallback={<div className="w-6 h-6 rounded-full bg-border/10 animate-pulse" />}>
            <UserNav />
          </Suspense>
          
          <Link href="/generate" className="hidden xs:flex items-center gap-1.5 bg-text-heading text-background px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-tight hover:opacity-90 transition-all">
            <Plus className="w-3.5 h-3.5" /> <span>New Goal</span>
          </Link>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 text-text-muted hover:text-text-heading transition-colors" aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div 
        className={`lg:hidden fixed inset-0 bg-header z-[45] transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: isScrolled ? '48px' : '64px' }}
      >
        <div className="px-6 py-10 flex flex-col gap-10 h-full overflow-y-auto pb-32">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-60">Tools</span>
              <Link href="/generate" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Generator</Link>
              <Link href="/planner" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Planner</Link>
              <Link href="/practice" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Practice</Link>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-8">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-60">Research & Library</span>
              <Link href="/research-decoded" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Research</Link>
              <Link href="/articles" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Articles</Link>
              <Link href="/explore" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Library</Link>
              <Link href="/leaderboard" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Leaderboard</Link>
            </div>
            
            <div className="flex flex-col gap-4 border-t border-border pt-8">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-60">Platform</span>
              <Link href="/about" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">About</Link>
              <Link href="/pricing" className="text-2xl font-bold text-text-heading hover:text-teal-700 transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-10 pb-6">
            <Link href="/generate" className="w-full bg-text-heading text-background py-5 rounded-xl flex items-center justify-center gap-3 text-[16px] font-bold active:scale-95 transition-all">
              <Plus className="w-5 h-5" /> Get Started
            </Link>
          </div>
        </div>      </div>
    </header>
  );
}
