"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ExternalLink, 
  ArrowRight,
  Globe,
  Archive,
  Microscope,
  Trophy,
  CreditCard
} from 'lucide-react';
import UserNav from './UserNav';
import { Suspense } from 'react';

const EXPLORE_CATEGORIES = [
  "Programming", "Business", "Science", "Design", "Career", "Other"
];

const TOP_ROADMAPS = [
  { title: "Machine Learning from Scratch", slug: "machine-learning-from-scratch" },
  { title: "AWS for Developers: A 4-Week Roadmap", slug: "aws-for-developers-a-hands-on-4-week-roadmap" },
  { title: "Finance for Investing and Trading", slug: "finance-for-investing-and-trading-a-2-week-roadmap" },
  { title: "Frontend Animation & Motion Design", slug: "frontend-animation-motion-design-with-css-and-framer-motion" },
  { title: "Cybersecurity: Penetration Testing", slug: "cybersecurity-vulnerability-assessment-penetration-testing-simulation" }
];

const ARCHIVE_REGIONS = [
  { name: "Worldwide", exams: ["IMO", "IPhO", "IChO"] },
  { name: "India", exams: ["GATE", "JEE", "NEET", "CAT", "UPSC"] },
  { name: "USA", exams: ["AMC", "AIME", "AP"] },
  { name: "UK", exams: ["STEP", "PAT", "ENGAA"] }
];

const RESEARCH_CATEGORIES = [
  "AI Safety & Alignment", "Foundational Papers", "Computer Vision", 
  "Reinforcement Learning", "Scientific Breakthroughs", "Diffusion & Generative", 
  "Novel Architectures", "Multimodal", "AI Agents & Reasoning"
];

export default function PublicHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const NavItem = ({ name, label, dropdown }: { name: string, label: string, dropdown?: React.ReactNode }) => (
    <div className="relative">
      <button 
        onClick={() => dropdown ? toggleDropdown(name) : null}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] md:text-[13px] font-bold tracking-tight uppercase transition-colors hover:text-text-heading ${openDropdown === name ? 'text-text-heading' : 'text-text-muted'}`}
      >
        {label}
        {dropdown && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === name ? 'rotate-180' : ''}`} />
        )}
      </button>

      {dropdown && openDropdown === name && (
        <div className="absolute top-[calc(100%+8px)] left-0 min-w-[320px] md:min-w-[480px] bg-background border border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
          {dropdown}
        </div>
      )}
    </div>
  );

  const ExploreDropdown = (
    <div className="flex divide-x divide-border">
      <div className="flex-1 p-4 bg-sidebar/10">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Categories</h4>
        <div className="grid grid-cols-1 gap-1">
          {EXPLORE_CATEGORIES.map(cat => (
            <Link 
              key={cat} 
              href={`/explore?category=${cat}`}
              className="px-2 py-1.5 text-[12px] font-medium text-text-primary hover:bg-background hover:text-teal-600 rounded-lg transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-[1.5] p-4 bg-background">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Popular Roadmaps</h4>
        <div className="space-y-1">
          {TOP_ROADMAPS.map(roadmap => (
            <Link 
              key={roadmap.slug} 
              href={`/roadmap/${roadmap.slug}`}
              className="flex items-center justify-between group px-2 py-1.5 text-[12px] font-medium text-text-primary hover:bg-sidebar/30 rounded-lg transition-colors"
            >
              <span className="truncate">{roadmap.title}</span>
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-600" />
            </Link>
          ))}
        </div>
        <Link href="/explore" className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:opacity-80 transition-opacity px-2 pt-2 border-t border-border/50">
          Browse all roadmaps <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );

  const ArchiveDropdown = (
    <div className="flex divide-x divide-border">
      <div className="flex-[2] p-4 bg-sidebar/10">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4">Exam Archives</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {ARCHIVE_REGIONS.map(region => (
            <div key={region.name}>
              <p className="text-[11px] font-bold text-text-heading mb-1.5">{region.name}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {region.exams.map(exam => (
                  <Link 
                    key={exam} 
                    href={`/archive/exams/previous-year-papers/${exam.toLowerCase()}`}
                    className="text-[11px] font-medium text-text-muted hover:text-teal-600 transition-colors"
                  >
                    {exam}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 bg-background flex flex-col justify-between">
        <Link 
          href="/archive/exams/previous-year-papers" 
          className="block p-3 bg-sidebar/20 rounded-xl border border-border/50 hover:border-teal-600/30 transition-colors group"
        >
          <Archive className="w-5 h-5 text-teal-600 mb-2" />
          <p className="text-[12px] font-bold text-text-heading mb-1 group-hover:text-teal-600 transition-colors">Browse full archive</p>
          <p className="text-[10px] text-text-muted leading-relaxed">Access papers for global competitions and national entrance exams.</p>
          <ArrowRight className="w-3.5 h-3.5 mt-2 text-teal-600 translate-x-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );

  const ResearchDropdown = (
    <div className="p-4 bg-background">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Research Domains</h4>
      <div className="grid grid-cols-2 gap-1 min-w-[400px]">
        {RESEARCH_CATEGORIES.map(cat => (
          <Link 
            key={cat} 
            href={`/research-decoded?category=${cat}`}
            className="px-2 py-1.5 text-[12px] font-medium text-text-primary hover:bg-sidebar/40 hover:text-teal-600 rounded-lg transition-colors"
          >
            {cat}
          </Link>
        ))}
      </div>
      <Link href="/research-decoded" className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:opacity-80 transition-opacity px-2 pt-2 border-t border-border/50">
        All breakthrough papers <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );

  return (
    <header 
      className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 sticky" 
      style={{ top: 'var(--announcement-height, 0px)' }}
      ref={dropdownRef}
    >
      <div className="w-full h-full px-4 md:px-6 flex items-center justify-between">
        
        {/* Left Section: Logo + Nav */}
        <div className="flex items-center gap-4 md:gap-8 h-full">
          <Link href="/" className="flex items-center group shrink-0">
            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            <span className="ml-3 text-[14px] font-bold text-text-heading hidden sm:block">EulerFold</span>
          </Link>

          <div className="h-4 w-px bg-border mx-2 hidden lg:block"></div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 h-full">
            <NavItem name="explore" label="Explore" dropdown={ExploreDropdown} />
            <Link href="/leaderboard" className="px-3 py-1.5 text-[12px] md:text-[13px] font-bold tracking-tight uppercase text-text-muted hover:text-text-heading transition-colors">
              Rankings
            </Link>
            <NavItem name="archive" label="Archives" dropdown={ArchiveDropdown} />
            <NavItem name="research" label="Research" dropdown={ResearchDropdown} />
            <Link href="/pricing" className="px-3 py-1.5 text-[12px] md:text-[13px] font-bold tracking-tight uppercase text-text-muted hover:text-text-heading transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Section: Auth + Mobile Menu */}
        <div className="flex items-center gap-4 h-full">
          <Suspense fallback={
            <div className="flex items-center gap-x-6 text-[14px] font-medium text-text-muted animate-pulse">
              <div className="w-12 h-4 bg-border rounded"></div>
              <div className="w-16 h-8 bg-text-heading rounded-full opacity-20"></div>
            </div>
          }>
            <UserNav />
          </Suspense>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-text-muted hover:text-text-heading transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden absolute top-[48px] left-0 right-0 bg-background border-b border-border shadow-2xl animate-in slide-in-from-top-4 duration-300 z-[90] overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 48px - var(--announcement-height, 0px))' }}
        >
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Discovery</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/explore" className="flex items-center gap-2 text-[13px] font-bold text-text-heading"><Globe className="w-4 h-4" /> Explore</Link>
                <Link href="/leaderboard" className="flex items-center gap-2 text-[13px] font-bold text-text-heading"><Trophy className="w-4 h-4" /> Rankings</Link>
                <Link href="/archive/exams/previous-year-papers" className="flex items-center gap-2 text-[13px] font-bold text-text-heading"><Archive className="w-4 h-4" /> Archives</Link>
                <Link href="/research-decoded" className="flex items-center gap-2 text-[13px] font-bold text-text-heading"><Microscope className="w-4 h-4" /> Research</Link>
                <Link href="/pricing" className="flex items-center gap-2 text-[13px] font-bold text-text-heading"><CreditCard className="w-4 h-4" /> Pricing</Link>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Link 
                href="/generate"
                className="flex items-center justify-center w-full bg-text-heading dark:bg-white text-background dark:text-black py-3 rounded-xl text-[14px] font-bold tracking-tight uppercase transition-all"
              >
                Create Roadmap
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
