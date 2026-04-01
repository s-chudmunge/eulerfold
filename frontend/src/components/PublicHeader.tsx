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
  ExternalLink,
  Cpu,
  Laptop,
  Atom,
  TrendingUp,
  Dna,
  Calculator,
  Gamepad2,
  Coins,
  Palette,
  Briefcase,
  Database,
  GraduationCap
} from 'lucide-react';
import UserNav from './UserNav';
import { Suspense } from 'react';

const ROADMAP_DATA = {
  categories: [
    { name: "Programming", icon: Laptop, href: "/explore?category=Programming" },
    { name: "AI & Machine Learning", icon: Cpu, href: "/explore?category=AI/ML" },
    { name: "Mathematics", icon: Calculator, href: "/explore?category=Mathematics" },
    { name: "System Design", icon: Database, href: "/explore?category=System Design" },
    { name: "Cloud & DevOps", icon: Atom, href: "/explore?category=Cloud" },
    { name: "Data Science", icon: TrendingUp, href: "/explore?category=Data Science" },
    { name: "Cybersecurity", icon: Dna, href: "/explore?category=Security" },
    { name: "Quantum Computing", icon: Atom, href: "/explore?category=Quantum" },
    { name: "Blockchain & Web3", icon: Coins, href: "/explore?category=Blockchain" },
    { name: "Game Development", icon: Gamepad2, href: "/explore?category=Game Dev" },
    { name: "Design & UX", icon: Palette, href: "/explore?category=Design" },
    { name: "Business & Career", icon: Briefcase, href: "/explore?category=Business" }
  ],
  featured: [
    { title: "Machine Learning from Scratch", slug: "machine-learning-from-scratch" },
    { title: "LLM Fine-Tuning Mastery", slug: "llm-fine-tuning-from-scratch" },
    { title: "FastAPI & AI Integration", slug: "fastapi-and-ai-integration-building-production-ready-agentic-systems" },
    { title: "System Design for SWE", slug: "cs-fundamentals-and-system-design-for-swe-interviews" },
    { title: "AWS for Developers", slug: "aws-for-developers-a-hands-on-4-week-roadmap" },
    { title: "SQL & Database Design", slug: "sql-mastery-database-design-roadmap" },
    { title: "Python Data Science", slug: "python-data-science-expert-level-roadmap" },
    { title: "Web3 & Blockchain", slug: "web3-blockchain-developer-roadmap" },
    { title: "Prompt Engineering", slug: "prompt-engineering-mastery" },
    { title: "Cybersecurity Simulation", slug: "cybersecurity-vulnerability-assessment-penetration-testing-simulation" }
  ]
};

const EXAM_CATEGORIES = [
  {
    title: "International & Olympiads",
    exams: [
      { name: "IMO Mathematics", slug: "imo" },
      { name: "IPhO Physics", slug: "ipho" },
      { name: "IChO Chemistry", slug: "icho" },
      { name: "IOI Informatics", slug: "ioi" },
      { name: "IAO Astronomy", slug: "iao" },
      { name: "Putnam Math", slug: "putnam" }
    ]
  },
  {
    title: "India Competitive",
    exams: [
      { name: "JEE Advanced", slug: "jee_advance" },
      { name: "GATE Engineering", slug: "gate" },
      { name: "UPSC Civil Services", slug: "upsc" },
      { name: "NEET Medical", slug: "neet" },
      { name: "JAM / TIFR GS", slug: "jam" },
      { name: "CAT / MBA", slug: "cat" }
    ]
  },
  {
    title: "USA & UK Admissions",
    exams: [
      { name: "AP Exams", slug: "ap" },
      { name: "AMC / AIME", slug: "amc" },
      { name: "STEP / MAT", slug: "step" },
      { name: "PAT Physics", slug: "pat" },
      { name: "ENGAA / NSAA", slug: "engaa" },
      { name: "GRE / GMAT", slug: "gre" }
    ]
  }
];

const RESEARCH_DATA = {
  categories: [
    { name: "AI Safety & Alignment", href: "/research-decoded?category=safety" },
    { name: "Large Language Models", href: "/research-decoded?category=llms" },
    { name: "Quantum Computing", href: "/research-decoded?category=quantum" },
    { name: "Foundational Algorithms", href: "/research-decoded?category=algorithms" },
    { name: "Computational Theory", href: "/research-decoded?category=theory" },
    { name: "Computer Vision", href: "/research-decoded?category=vision" },
    { name: "Reinforcement Learning", href: "/research-decoded?category=rl" },
    { name: "AI Agents & Reasoning", href: "/research-decoded?category=agents" },
    { name: "Scientific Breakthroughs", href: "/research-decoded?category=science" },
    { name: "Robotics & Embodied AI", href: "/research-decoded?category=robotics" },
    { name: "Multimodal Models", href: "/research-decoded?category=multimodal" },
    { name: "Diffusion & Generative", href: "/research-decoded?category=generative" },
    { name: "Network Science", href: "/research-decoded?category=networks" },
    { name: "Foundational Papers", href: "/research-decoded?category=foundational" },
    { name: "Fine-tuning & Efficiency", href: "/research-decoded?category=efficiency" },
    { name: "Novel Architectures", href: "/research-decoded?category=architectures" },
    { name: "Biology & Science AI", href: "/research-decoded?category=science-ai" }
  ],
  featured: [
    { title: "DeepSeek R1", slug: "deepseek-r1-incentivizing-reasoning" },
    { title: "Attention Is All You Need", slug: "attention-is-all-you-need" },
    { title: "Dijkstra: Graph Problems", slug: "dijkstra-graph-problems" },
    { title: "Cook: Theorem-Proving", slug: "cook-complexity-theorem-proving" },
    { title: "AlphaFold 2", slug: "alphafold-2-structure-prediction" },
    { title: "GPT-4 Technical Report", slug: "gpt-4-technical-report" },
    { title: "LoRA Adaptation", slug: "lora-low-rank-adaptation" },
    { title: "Flash Attention", slug: "flash-attention-io-aware" },
    { title: "Segment Anything (SAM)", slug: "segment-anything-model" },
    { title: "ResNet-50 Architecture", slug: "resnet-deep-residual-learning" }
  ]
};

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

  const DesktopDropdown = ({ id, label, children, width = "min-w-[440px]" }: { id: string, label: string, children: React.ReactNode, width?: string }) => {
    const isOpen = activeDropdown === id;
    return (
        <div className="relative h-full flex items-center">
            <button 
                onClick={() => setActiveDropdown(isOpen ? null : id)}
                onMouseEnter={() => {
                  if (activeDropdown !== null) setActiveDropdown(id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13.5px] font-semibold transition-all tracking-tight rounded-lg hover:bg-sidebar/40 ${
                    isOpen ? 'text-text-heading bg-sidebar/50' : 'text-text-muted hover:text-text-heading'
                }`}
            >
                {label}
                <ChevronDown className={`w-3 h-3 opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-[calc(100%-8px)] left-0 pt-3 z-[100] animate-in fade-in zoom-in-95 duration-200 ease-out">
                    <div className={`bg-header border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden ${width} backdrop-blur-md`}>
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
            ? 'bg-header/90 backdrop-blur-md h-[54px] border-b border-border/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
            : 'bg-header h-[64px] border-b border-transparent'
      }`}
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity active:scale-95 duration-200">
            <img src="/apple-touch-icon.png" alt="" className="w-7 h-7" />
            <span className="text-[16px] font-bold text-text-heading tracking-tight hidden md:block">EulerFold</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 h-full">
            <Link href="/learn" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Learn</Link>
            
            <DesktopDropdown id="roadmaps" label="Roadmaps" width="min-w-[500px]">
              <div className="flex divide-x divide-border/60">
                <div className="p-5 w-56 bg-sidebar/20">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-3.5 opacity-50">Categories</span>
                  <div className="grid grid-cols-1 gap-y-0.5">
                    {ROADMAP_DATA.categories.map(cat => (
                      <Link key={cat.name} href={cat.href} className="flex items-center gap-2 text-[12.5px] font-medium text-text-muted hover:text-accent transition-colors py-1 group/cat">
                        <cat.icon className="w-3 h-3 opacity-30 group-hover/cat:opacity-100 transition-opacity" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="p-5 flex-1 bg-header">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-3.5 opacity-50">Featured Roadmaps</span>
                  <div className="space-y-3.5">
                    {ROADMAP_DATA.featured.map(r => (
                      <Link key={r.slug} href={`/roadmap/${r.slug}`} className="flex items-center justify-between group/item">
                        <span className="text-[12.5px] font-semibold text-text-heading group-hover/item:text-accent transition-colors">{r.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                      </Link>
                    ))}
                    <Link href="/explore" className="pt-3.5 border-t border-border/60 flex items-center gap-2 text-[11px] font-bold text-accent hover:gap-2.5 transition-all">
                      Browse Full Directory <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </DesktopDropdown>

            <DesktopDropdown id="exams" label="Exams" width="min-w-[600px]">
              <div className="p-5 grid grid-cols-3 gap-6">
                {EXAM_CATEGORIES.map(reg => (
                  <div key={reg.title}>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-3.5 opacity-50">{reg.title}</span>
                    <div className="space-y-2">
                      {reg.exams.map(ex => (
                        <Link key={ex.slug} href={`/archive/exams/previous-year-papers/${ex.slug}`} className="block text-[12.5px] font-semibold text-text-heading hover:text-accent transition-colors">{ex.name}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/archive/exams/previous-year-papers" className="mx-3 mb-3 p-3 bg-sidebar/30 rounded-lg flex items-center justify-between group/full border border-border/40 hover:border-accent/30 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center">
                        <Archive className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <span className="text-[12.5px] font-bold text-text-heading">Exam Archive</span>
                        <span className="text-[10px] text-text-muted">Access thousands of papers across all domains</span>
                    </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover/full:text-accent transition-colors" />
              </Link>
            </DesktopDropdown>

            <DesktopDropdown id="research" label="Research" width="min-w-[620px]">
              <div className="flex divide-x divide-border/60">
                <div className="p-5 w-72 bg-sidebar/20">
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">Domains</span>
                   <div className="grid grid-cols-1 gap-y-0.5">
                     {RESEARCH_DATA.categories.map(cat => (
                        <Link key={cat.name} href={cat.href} className="block text-[12.5px] font-semibold text-text-heading hover:text-accent transition-colors py-1">
                          {cat.name}
                        </Link>
                     ))}
                   </div>
                </div>
                <div className="p-5 flex-1 bg-header">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">Latest Decoded Papers</span>
                  <div className="space-y-3">
                    {RESEARCH_DATA.featured.map(paper => (
                      <Link key={paper.slug} href={`/research-decoded/${paper.slug}`} className="block group/p">
                        <span className="text-[12.5px] font-semibold text-text-heading group-hover/p:text-accent transition-colors line-clamp-1">{paper.title}</span>
                      </Link>
                    ))}
                    <Link href="/research-decoded" className="pt-3.5 border-t border-border/60 flex items-center gap-2 text-[11px] font-bold text-accent hover:gap-2.5 transition-all">
                      Access Research Portal <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </DesktopDropdown>

            <Link href="/leaderboard" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Leaderboard</Link>
            <Link href="/pricing" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Pricing</Link>
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
                { l: "Learning Hub", h: "/learn", i: GraduationCap },
                { l: "Roadmap Explorer", h: "/explore", i: Globe },
                { l: "Global Leaderboard", h: "/leaderboard", i: Trophy },
                { l: "Exams & Papers", h: "/archive/exams/previous-year-papers", i: Archive },
                { l: "Research Portal", h: "/research-decoded", i: Microscope },
                { l: "Premium Plans", h: "/pricing", i: CreditCard }
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
