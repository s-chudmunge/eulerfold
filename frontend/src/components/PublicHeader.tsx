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
  BookOpen,
  Trophy,
  CreditCard,
  Plus,
  Terminal,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Cpu,
  Laptop,
  Code,
  Monitor,
  Server,
  Network,
  Cloud,
  Smartphone,
  Shield,
  Atom,
  TrendingUp,
  Dna,
  Calculator,
  Gamepad2,
  Coins,
  Palette,
  Briefcase,
  Compass,
  Database,
  GraduationCap,
  Calendar
} from 'lucide-react';
import UserNav from './UserNav';
import { Suspense } from 'react';

const ROADMAP_DATA = {
  categories: [
    { name: "Programming", icon: Code, href: "/explore?category=Programming" },
    { name: "AI & Machine Learning", icon: Cpu, href: "/explore?category=AI/ML" },
    { name: "Frontend", icon: Monitor, href: "/explore?category=Frontend" },
    { name: "Backend", icon: Server, href: "/explore?category=Backend" },
    { name: "Data Science", icon: TrendingUp, href: "/explore?category=Data Science" },
    { name: "System Design", icon: Network, href: "/explore?category=System Design" },
    { name: "Cloud & DevOps", icon: Cloud, href: "/explore?category=Cloud" },
    { name: "Mobile Development", icon: Smartphone, href: "/explore?category=Mobile" },
    { name: "Cybersecurity", icon: Shield, href: "/explore?category=Security" },
    { name: "Quantum Computing", icon: Atom, href: "/explore?category=Quantum" },
    { name: "Blockchain & Web3", icon: Coins, href: "/explore?category=Blockchain" },
    { name: "Game Development", icon: Gamepad2, href: "/explore?category=Game Dev" },
    { name: "ECE & Hardware", icon: Cpu, href: "/explore?category=ECE & Hardware" },
    { name: "Product Management", icon: Briefcase, href: "/explore?category=Product Management" },
    { name: "Marketing", icon: TrendingUp, href: "/explore?category=Marketing" },
    { name: "Design & UX", icon: Palette, href: "/explore?category=Design" },
    { name: "Business & Startup", icon: Briefcase, href: "/explore?category=Business" },
    { name: "Career & Interview", icon: Compass, href: "/explore?category=Career" }
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

const ARTICLES_DATA = {
  categories: [
    { name: "Architectures", href: "/articles?category=Architectures" },
    { name: "Optimization", href: "/articles?category=Optimization" },
    { name: "Theory", href: "/articles?category=Theory" },
    { name: "Science AI", href: "/articles?category=Science AI" }
  ],
  featured: [
    { title: "Transformer Architecture", slug: "transformer" },
    { title: "AlphaFold (Proteins)", slug: "how-does-alphafold-predict-protein-structures" },
    { title: "Protein Language Models", slug: "what-are-protein-language-models" },
    { title: "Mixture of Experts (MoE)", slug: "mixture-of-experts" },
    { title: "Drug Discovery", slug: "how-is-ai-accelerating-drug-discovery" },
    { title: "RLHF (Alignment)", slug: "rlhf" },
    { title: "Digital Twin (Cell)", slug: "how-is-ai-building-a-digital-twin-of-the-cell" },
    { title: "Vector Embeddings", slug: "embeddings" },
    { title: "Vanishing Gradient", slug: "vanishing-gradient" },
    { title: "Backpropagation", slug: "backpropagation" },
    { title: "Double Descent", slug: "double-descent" },
    { title: "Latent Space", slug: "latent-space" },
    { title: "Weather Prediction", slug: "how-does-ai-predict-extreme-weather" },
    { title: "Connectomics (Brain)", slug: "how-is-ai-mapping-the-brain-connectomics" },
    { title: "Positional Encoding", slug: "positional-encoding" },
    { title: "Gradient Descent", slug: "gradient-descent" },
    { title: "Quantization", slug: "quantization" },
    { title: "Nuclear Fusion", slug: "how-does-ai-simulate-nuclear-fusion" }
  ]
};

export default function PublicHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [learnTab, setLearnTab] = useState<'roadmaps' | 'exams' | 'research' | 'articles'>('roadmaps');
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
                    <div className={`bg-header border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden ${width}`}>
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
            ? 'bg-header h-[48px] border-b border-border shadow-[0_4px_12px_rgba(0,0,0,0.03)]' 
            : 'bg-header h-[56px] border-b border-transparent'
      }`}
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-100 transition-opacity active:scale-95 duration-200 group">
            <img src="/apple-touch-icon.png" alt="" className="w-7 h-7" />
            <span className="text-[16px] font-bold text-text-heading tracking-tight hidden md:block group-hover:text-teal-700 transition-colors">Euler<span className="text-teal-700">Fold</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 h-full">
            <Link href="/about" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">About</Link>
            <Link href="/leaderboard" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Leaderboard</Link>
            <Link href="/explore" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Explore</Link>

            <DesktopDropdown id="products" label="Products" width="min-w-[280px]">
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link href="/planner" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-sidebar/40 transition-all group">
                  <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight">Study Planner</span>
                      <span className="text-[7px] font-black uppercase tracking-widest bg-accent text-white px-1 py-0.5 rounded leading-none">New</span>
                    </div>
                    <span className="text-[10.5px] text-text-muted leading-relaxed">Organize your learning journey.</span>
                  </div>
                </Link>

                <Link href="/buildpilot" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-sidebar/40 transition-all group">
                  <div className="w-8 h-8 rounded-md bg-teal-500/10 flex items-center justify-center text-teal-700 shrink-0 group-hover:bg-teal-500/20 transition-all">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-text-heading group-hover:text-teal-700 transition-colors tracking-tight">BuildPilot</span>
                    </div>
                    <span className="text-[10.5px] text-text-muted leading-relaxed">Proof-of-work workspace.</span>
                  </div>
                </Link>

                <Link href="/generate" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-sidebar/40 transition-all group">
                  <div className="w-8 h-8 rounded-md bg-sidebar border border-border flex items-center justify-center text-text-muted shrink-0 group-hover:text-accent group-hover:border-accent/30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight">Roadmap Generator</span>
                    <span className="text-[10.5px] text-text-muted leading-relaxed">AI-powered curricula.</span>
                  </div>
                </Link>
              </div>
            </DesktopDropdown>

            <Link href="/pricing" className="px-3 py-1.5 text-[13.5px] font-semibold text-text-muted hover:text-text-heading transition-all tracking-tight rounded-lg hover:bg-sidebar/40">Pricing</Link>

            <DesktopDropdown id="learn" label="Learn" width="min-w-[850px]">
              <div className="flex min-h-[540px]">
                {/* Left Side: Sub-nav */}
                <div className="w-60 bg-sidebar/20 border-r border-border/60 p-4 flex flex-col gap-2">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-1 opacity-50">Educational Content</span>
                    <h2 className="text-[14px] font-bold text-text-heading">Learning Hub</h2>
                  </div>
                  
                  <button 
                    onMouseEnter={() => setLearnTab('roadmaps')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all border ${learnTab === 'roadmaps' ? 'bg-header border-border shadow-sm text-accent' : 'border-transparent text-text-muted hover:bg-header/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${learnTab === 'roadmaps' ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-muted'}`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-bold">Roadmaps</span>
                        <span className="text-[10px] opacity-60">Step-by-step paths</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${learnTab === 'roadmaps' ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                  </button>

                  <button 
                    onMouseEnter={() => setLearnTab('exams')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all border ${learnTab === 'exams' ? 'bg-header border-border shadow-sm text-accent' : 'border-transparent text-text-muted hover:bg-header/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${learnTab === 'exams' ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-muted'}`}>
                        <Archive className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-bold">Exams</span>
                        <span className="text-[10px] opacity-60">Previous year papers</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${learnTab === 'exams' ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                  </button>

                  <button 
                    onMouseEnter={() => setLearnTab('research')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all border ${learnTab === 'research' ? 'bg-header border-border shadow-sm text-accent' : 'border-transparent text-text-muted hover:bg-header/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${learnTab === 'research' ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-muted'}`}>
                        <Microscope className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-bold">Research Decoded</span>
                        <span className="text-[10px] opacity-60">Papers made simple</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${learnTab === 'research' ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                  </button>

                  <button 
                    onMouseEnter={() => setLearnTab('articles')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all border ${learnTab === 'articles' ? 'bg-header border-border shadow-sm text-accent' : 'border-transparent text-text-muted hover:bg-header/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${learnTab === 'articles' ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-muted'}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-bold">Glossary</span>
                        <span className="text-[10px] opacity-60">Technical breakdowns</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${learnTab === 'articles' ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                  </button>

                  <div className="mt-auto pt-4 border-t border-border/60">
                    <Link href="/learn" className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-accent transition-colors">
                      View all learning resources <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Right Side: Content Area */}
                <div className="flex-1 bg-header overflow-hidden">
                  {learnTab === 'roadmaps' ? (
                    <div className="flex divide-x divide-border/60 h-full animate-in fade-in slide-in-from-left-2 duration-300">
                      {/* Categories Sidebar */}
                      <div className="p-5 w-56 bg-sidebar/10 overflow-y-auto">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-2.5 opacity-50">Categories</span>
                        <div className="grid grid-cols-1 gap-y-0">
                          {ROADMAP_DATA.categories.map(cat => (
                            <Link key={cat.name} href={cat.href} className="flex items-center gap-2 text-[12.5px] font-medium text-text-muted hover:text-accent transition-colors py-0.5 group/cat">
                              <cat.icon className="w-3 h-3 opacity-30 group-hover/cat:opacity-100 transition-opacity" />
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      {/* Featured Items */}
                      <div className="p-6 flex-1 bg-header">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">Featured Roadmaps</span>
                        <div className="space-y-3.5">
                          {ROADMAP_DATA.featured.map(r => (
                            <Link key={r.slug} href={`/roadmap/${r.slug}`} className="flex items-start justify-between group/item">
                              <span className="text-[12.5px] font-semibold text-text-heading group-hover/item:text-accent transition-colors pr-4">{r.title}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all shrink-0 mt-0.5" />
                            </Link>
                          ))}
                        </div>
                        <Link href="/explore" className="mt-8 pt-4 border-t border-border/60 flex items-center gap-2 text-[11px] font-bold text-accent hover:gap-2.5 transition-all">
                          Browse Full Directory <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ) : learnTab === 'exams' ? (
                    <div className="p-6 flex flex-col h-full animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="grid grid-cols-3 gap-8 mb-8">
                        {EXAM_CATEGORIES.map(reg => (
                          <div key={reg.title}>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">{reg.title}</span>
                            <div className="space-y-2.5">
                              {reg.exams.map(ex => (
                                <Link key={ex.slug} href={`/archive/exams/previous-year-papers/${ex.slug}`} className="block text-[12.5px] font-semibold text-text-heading hover:text-accent transition-colors">{ex.name}</Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto">
                        <Link href="/archive/exams/previous-year-papers" className="p-4 bg-sidebar/30 rounded-xl flex items-center justify-between group/full border border-border/40 hover:border-accent/30 transition-all">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm">
                                  <Archive className="w-5 h-5 text-accent" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                  <span className="text-[13px] font-bold text-text-heading">Full Exam Archive</span>
                                  <span className="text-[11px] text-text-muted">Access thousands of papers across all domains</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 text-accent font-bold text-[12px]">
                            Explore Archive <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  ) : learnTab === 'research' ? (
                    <div className="flex divide-x divide-border/60 h-full animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="p-5 w-56 bg-sidebar/10 overflow-y-auto">
                           <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-2.5 opacity-50">Domains</span>
                           <div className="grid grid-cols-1 gap-y-0">
                             {RESEARCH_DATA.categories.map(cat => (
                                <Link key={cat.name} href={cat.href} className="flex items-center gap-2 text-[12.5px] font-medium text-text-muted hover:text-accent transition-colors py-0.5 group/cat">
                                  <Microscope className="w-3 h-3 opacity-30 group-hover/cat:opacity-100 transition-opacity" />
                                  {cat.name}
                                </Link>
                             ))}
                           </div>
                        </div>
                        <div className="p-6 flex-1 bg-header">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">Latest Decoded Papers</span>
                          <div className="space-y-2.5">
                            {RESEARCH_DATA.featured.map(paper => (
                              <Link key={paper.slug} href={`/research-decoded/${paper.slug}`} className="block group/p">
                                <span className="text-[12px] font-semibold text-text-heading group-hover/p:text-accent transition-colors block">{paper.title}</span>
                              </Link>
                            ))}
                            <Link href="/research-decoded" className="pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] font-bold text-accent hover:gap-2.5 transition-all">
                              Access Research Portal <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                    </div>
                  ) : (
                    <div className="flex divide-x divide-border/60 h-full animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="p-5 w-56 bg-sidebar/10 overflow-y-auto">
                           <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-2.5 opacity-50">Topics</span>
                           <div className="grid grid-cols-1 gap-y-0">
                             {ARTICLES_DATA.categories.map(cat => (
                                <Link key={cat.name} href={cat.href} className="flex items-center gap-2 text-[12.5px] font-medium text-text-muted hover:text-accent transition-colors py-0.5 group/cat">
                                  <BookOpen className="w-3 h-3 opacity-30 group-hover/cat:opacity-100 transition-opacity" />
                                  {cat.name}
                                </Link>
                             ))}
                           </div>
                        </div>
                        <div className="p-6 flex-1 bg-header">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block mb-4 opacity-50">Technical Glossary</span>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                            {ARTICLES_DATA.featured.map(article => (
                              <Link key={article.slug} href={`/articles/${article.slug}`} className="block group/p">
                                <span className="text-[12px] font-semibold text-text-heading group-hover/p:text-accent transition-colors block">{article.title}</span>
                              </Link>
                            ))}
                          </div>
                          <Link href="/articles" className="mt-6 pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] font-bold text-accent hover:gap-2.5 transition-all">
                            Browse All Breakdowns <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </DesktopDropdown>
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
        className={`lg:hidden fixed inset-0 top-[var(--announcement-height,0px)] bg-header/98 z-[45] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
        style={{ marginTop: isScrolled ? '48px' : '56px' }}
      >
        <div className="px-6 py-10 flex flex-col gap-10 h-full overflow-y-auto">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] block mb-4 opacity-50">Menu Navigation</span>
            <div className="grid grid-cols-1 gap-3">
              {[
                { l: "Study Planner", h: "/planner", i: Calendar, n: true },
                { l: "BuildPilot", h: "/buildpilot", i: Terminal },
                { l: "Learning Hub", h: "/learn", i: GraduationCap },
                { l: "Roadmap Explorer", h: "/explore", i: Globe },
                { l: "Global Leaderboard", h: "/leaderboard", i: Trophy },
                { l: "Exams & Papers", h: "/archive/exams/previous-year-papers", i: Archive },
                { l: "Research Decoded", h: "/research-decoded", i: Microscope },
                { l: "Glossary & Articles", h: "/articles", i: BookOpen },
                { l: "Premium Plans", h: "/pricing", i: CreditCard },
                { l: "About Us", h: "/about", i: Globe },
                { l: "Careers", h: "/careers", i: Briefcase }
              ].map(item => (
                <Link key={item.h} href={item.h} className="flex items-center justify-between p-4.5 bg-sidebar/40 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                        <item.i className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-text-heading">{item.l}</span>
                      {item.n && <span className="text-[8px] font-black uppercase tracking-widest bg-accent text-white px-1.5 py-0.5 rounded leading-none">New</span>}
                    </div>
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
