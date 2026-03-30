"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Globe,
  Archive,
  Microscope,
  Trophy,
  CreditCard,
  Plus,
  ChevronDown,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import UserNav from './UserNav';
import { Suspense } from 'react';

const EXPLORE_DATA = {
  categories: ["Programming", "Business", "Science", "Design", "Career", "Mathematics"],
  featured: [
    { title: "Machine Learning", slug: "machine-learning-from-scratch" },
    { title: "AWS Cloud", slug: "aws-for-developers-a-hands-on-4-week-roadmap" },
    { title: "Cybersecurity", slug: "cybersecurity-vulnerability-assessment-penetration-testing-simulation" }
  ]
};

const ARCHIVE_DATA = [
  { region: "Worldwide", exams: ["IMO", "IPhO", "IChO"] },
  { region: "India", exams: ["GATE", "JEE", "NEET", "UPSC"] },
  { region: "USA & UK", exams: ["AMC", "AIME", "STEP", "PAT"] }
];

const RESEARCH_DOMAINS = [
  "AI Safety", "Foundational Papers", "Computer Vision", 
  "Reinforcement Learning", "Generative AI", "AI Agents"
];

export default function PublicHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

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

  const DesktopDropdown = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => {
    const isOpen = activeDropdown === id;
    return (
        <div className="relative h-full flex items-center">
            <button 
                onClick={() => setActiveDropdown(isOpen ? null : id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-semibold transition-all tracking-tight rounded-lg hover:bg-sidebar/40 ${
                    isOpen ? 'text-text-heading bg-sidebar/50' : 'text-text-muted hover:text-text-heading'
                }`}
            >
                {label}
                <ChevronDown className={`w-3.5 h-3.5 opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-[calc(100%-8px)] left-0 pt-4 z-[100] animate-in fade-in zoom-in-95 duration-200 ease-out">
                    <div className="bg-header border border-border shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden min-w-[460px] backdrop-blur-xl">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <header 
      ref={headerRef}
      className={`manrope-body sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
            ? 'bg-header/90 backdrop-blur-md h-[56px] border-b border-border/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
            : 'bg-header h-[68px] border-b border-transparent'
      }`}
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-10 h-full">
          <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity active:scale-95 duration-200">
            <img src="/apple-touch-icon.png" alt="" className="w-8 h-8" />
            <span className="text-[17px] font-bold text-text-heading tracking-tight hidden md:block">EulerFold</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 h-full">
            <DesktopDropdown id="explore" label="Explore">
              <div className="flex divide-x divide-border">
                <div className="p-6 w-52 bg-sidebar/30">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-60">Categories</span>
                  <div className="space-y-1">
                    {EXPLORE_DATA.categories.map(cat => (
                      <Link key={cat} href={`/explore?category=${cat}`} className="block text-[13px] font-medium text-text-muted hover:text-accent transition-colors py-1.5">{cat}</Link>
                    ))}
                  </div>
                </div>
                <div className="p-6 flex-1 bg-header">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-60">Featured Paths</span>
                  <div className="space-y-4">
                    {EXPLORE_DATA.featured.map(r => (
                      <Link key={r.slug} href={`/roadmap/${r.slug}`} className="flex items-center justify-between group/item">
                        <span className="text-[13px] font-semibold text-text-heading group-hover/item:text-accent transition-colors">{r.title}</span>
                        <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                      </Link>
                    ))}
                    <Link href="/explore" className="pt-4 border-t border-border flex items-center gap-2 text-[12px] font-bold text-accent hover:gap-3 transition-all">
                      Browse Full Directory <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </DesktopDropdown>

            <Link href="/leaderboard" className="px-3 py-1.5 text-[14px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Rankings</Link>

            <DesktopDropdown id="archives" label="Archives">
              <div className="p-6 grid grid-cols-3 gap-8">
                {ARCHIVE_DATA.map(reg => (
                  <div key={reg.region}>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-60">{reg.region}</span>
                    <div className="space-y-2">
                      {reg.exams.map(ex => (
                        <Link key={ex} href={`/archive/exams/previous-year-papers/${ex.toLowerCase()}`} className="block text-[13px] font-medium text-text-heading hover:text-accent transition-colors">{ex}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/archive/exams/previous-year-papers" className="mx-4 mb-4 p-4 bg-sidebar/50 rounded-xl flex items-center justify-between group/full border border-border/50 hover:border-accent/30 transition-all">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-text-heading">Global Exam Archive</span>
                    <span className="text-[11px] text-text-muted">Access thousands of papers</span>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover/full:text-accent transition-colors" />
              </Link>
            </DesktopDropdown>

            <DesktopDropdown id="research" label="Research">
              <div className="p-6 bg-header">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-5 opacity-60">Access Research Topics</span>
                <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                  {RESEARCH_DOMAINS.map(domain => (
                    <Link key={domain} href={`/research-decoded?category=${domain}`} className="text-[13px] font-semibold text-text-heading hover:text-accent transition-colors flex items-center gap-2.5 group/d">
                      <div className="w-1.5 h-1.5 rounded-full bg-border group-hover/d:bg-accent transition-colors" />
                      {domain}
                    </Link>
                  ))}
                </div>
                <Link href="/research-decoded" className="mt-8 flex items-center gap-2 text-[12px] font-bold text-accent hover:gap-3 transition-all">
                  Access Research Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </DesktopDropdown>

            <Link href="/pricing" className="px-3 py-1.5 text-[14px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Pricing</Link>
          </nav>
        </div>

        {/* Right: Auth & CTAs */}
        <div className="flex items-center gap-5">
          <Suspense fallback={<div className="w-20 h-8 bg-border/20 animate-pulse rounded-full" />}>
            <UserNav />
          </Suspense>
          
          <Link href="/generate" className="hidden xs:flex items-center gap-2 bg-text-heading text-background px-5 py-2.5 rounded-full text-[13px] font-bold tracking-tight hover:opacity-90 active:scale-95 transition-all shadow-md">
            <Plus className="w-4 h-4" /> <span>New Goal</span>
          </Link>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-text-muted hover:text-text-heading transition-colors" aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 top-[var(--announcement-height,0px)] bg-header/98 backdrop-blur-2xl z-[45] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
        style={{ marginTop: isScrolled ? '56px' : '68px' }}
      >
        <div className="px-6 py-10 flex flex-col gap-10 h-full overflow-y-auto">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] block mb-4 opacity-50">Menu Navigation</span>
            <div className="grid grid-cols-1 gap-3">
              {[
                { l: "Explore Paths", h: "/explore", i: Globe },
                { l: "Leaderboard", h: "/leaderboard", i: Trophy },
                { l: "Exam Archives", h: "/archive/exams/previous-year-papers", i: Archive },
                { l: "Research Decoded", h: "/research-decoded", i: Microscope },
                { l: "Pricing Plans", h: "/pricing", i: CreditCard }
              ].map(item => (
                <Link key={item.h} href={item.h} className="flex items-center justify-between p-4.5 bg-sidebar/40 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                        <item.i className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-[15px] font-bold text-text-heading">{item.l}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted opacity-30" />
                </Link>
              ))}
            </div>
          </div>
          <Link href="/generate" className="mt-auto w-full bg-text-heading text-background py-4.5 rounded-2xl flex items-center justify-center gap-3 text-[15px] font-bold shadow-xl active:scale-[0.98] transition-transform">
            <Plus className="w-5 h-5" /> Create Custom Roadmap
          </Link>
        </div>
      </div>
    </header>
  );
}
