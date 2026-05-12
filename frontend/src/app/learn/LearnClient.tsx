"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
    GraduationCap, 
    ArrowRight,
    Globe,
    FileText,
    Menu,
    X,
    Plus,
    LayoutDashboard,
    Archive,
    Search,
    Compass,
    Microscope,
    ChevronDown,
    Clock,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { navigation, papers } from '../research-decoded/generatedData';
import { archiveData } from '../(public)/archive/generatedArchiveData';
import { articles } from '../articles/generatedArticles';
import { exploreAPI } from '@/lib/api';
import { cleanSearchQuery, getSearchKeywords } from '@/lib/search';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import PublicHeader from '@/components/PublicHeader';
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
  type: 'Roadmap' | 'Paper' | 'Exam' | 'Archive' | 'Article';
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

function LearnContent() {
    const [query, setQuery] = useState('');
    const [allSuggestions, setAllSuggestions] = useState<UnifiedSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [roadmapCount, setRoadmapCount] = useState<number | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const paperCount = Object.keys(papers).length;
    const articleCount = Object.keys(articles).length;
    const archiveCount = archiveData.reduce((acc, cat) => acc + cat.entries.length, 0);
    const categoryCount = navigation.length;

    useEffect(() => {
        async function fetchRoadmapCount() {
            try {
                const roadmaps = await exploreAPI.getExploreRoadmaps('', 0, 100);
                setRoadmapCount(roadmaps.length);
            } catch (e) {
                console.error("Failed to fetch roadmap count", e);
            }
        }
        fetchRoadmapCount();
    }, []);

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
            const roadmapResults = await exploreAPI.getExploreRoadmaps(query.trim(), 0, 5);
            const combinedResults: UnifiedSuggestion[] = [];
    
            roadmapResults.forEach(r => {
              let relevance = r.title.toLowerCase() === q ? 2000 : (r.title.toLowerCase().includes(q) ? 1000 : 500);
              combinedResults.push({ id: r.id, title: r.title, path: `/roadmap/${r.slug}`, type: 'Roadmap', relevance, icon: Compass });
            });
    
            const flatPapers = navigation.flatMap(cat => cat.sections.map(sec => ({
                ...sec,
                category: cat.title,
                intro: (papers as any)[sec.slug]?.intro || "",
                authors: (papers as any)[sec.slug]?.authors || ""
            })));
    
            const paperFuse = new Fuse(flatPapers, { keys: ['title', 'intro', 'authors'], threshold: 0.4, includeScore: true });
            const paperResults = paperFuse.search(query).slice(0, 3);
            paperResults.forEach(res => {
              combinedResults.push({ title: res.item.title, path: `/research-decoded/${res.item.slug}`, type: 'Paper', relevance: (1 - (res.score || 0)) * 1200, icon: Microscope });
            });

            // Article Search
            const flatArticles = Object.values(articles).map(art => ({
                title: art.title,
                slug: art.slug,
                excerpt: art.excerpt,
                author: art.author,
                synonyms: art.synonyms || []
            }));
            const articleFuse = new Fuse(flatArticles, { keys: ['title', 'excerpt', 'author', 'synonyms'], threshold: 0.4, includeScore: true });
            const articleResults = articleFuse.search(query).slice(0, 3);
            articleResults.forEach(res => {
              combinedResults.push({ title: res.item.title, path: `/articles/${res.item.slug}`, type: 'Article', relevance: (1 - (res.score || 0)) * 1300, icon: FileText });
            });
    
            archiveData.forEach(cat => {
              const catTitle = cat.title.toLowerCase();
              const catId = cat.id.toLowerCase();
              const catFullName = (EXAM_FULL_NAMES[cat.title] || "").toLowerCase();
              let catRelevance = (catTitle === q || catId === q) ? 1500 : (catTitle.includes(q) || catId.includes(q) ? 800 : (catFullName.includes(q) ? 600 : 0));
              
              if (catRelevance > 0) {
                combinedResults.push({ title: `${cat.title} Previous Year Papers`, relevance: catRelevance, path: `/archive/exams/previous-year-papers/${catId}`, type: 'Exam', icon: Archive, logo: EXAM_LOGOS[cat.title] });
              }
    
              cat.entries.forEach(entry => {
                const subject = (entry.subject === 'Main Paper' ? 'Paper' : entry.subject).toLowerCase();
                const fullName = `${cat.title} ${subject} ${entry.year}`.toLowerCase();
                const altName = `${catFullName} ${subject} ${entry.year}`.toLowerCase();
                let relevance = (fullName === q) ? 2500 : (fullName.includes(q) || altName.includes(q) ? 1100 : 0);
                if (relevance === 0) {
                  const queryKeywords = q.split(/\s+/).filter(k => k.length > 0);
                  let matches = queryKeywords.filter(kw => fullName.includes(kw) || altName.includes(kw)).length;
                  if (matches === queryKeywords.length) relevance = 900;
                  else if (matches > 0) relevance = (matches / queryKeywords.length) * 700;
                }
                if (relevance > 0) {
                  combinedResults.push({ title: `${cat.title} ${entry.subject === 'Main Paper' ? 'Paper' : entry.subject} ${entry.year}`, relevance, path: `/archive/exams/previous-year-papers/${catId}/${entry.slug}`, type: 'Archive', icon: Archive, logo: EXAM_LOGOS[cat.title] });
                }
              });
            });
    
            setAllSuggestions(combinedResults.sort((a, b) => b.relevance - a.relevance).slice(0, 8));
            setActiveIndex(-1);
          } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
    
        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || allSuggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev > 0 ? prev - 1 : -1)); }
        else if (e.key === 'Enter') { if (activeIndex >= 0) { e.preventDefault(); router.push(allSuggestions[activeIndex].path); setShowSuggestions(false); } }
        else if (e.key === 'Escape') { setShowSuggestions(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) router.push(`/generate?subject=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
            <PublicHeader />

            <div className="flex flex-1 relative overflow-hidden pt-[68px]">
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
                    <div className="max-w-[800px] mx-auto px-6 py-10 md:py-14 flex flex-col items-center">
                        
                        {/* Search Section */}
                        <div className="w-full mb-12 text-center flex flex-col items-center">
                            <div className="mb-6">
                                <EulerLogoCanvas size={28} />
                            </div>
                            <h1 className="manrope-body text-xl md:text-2xl font-bold text-text-heading tracking-tight mb-2">
                                What do you want to learn?
                            </h1>
                            <p className="manrope-body text-[13px] text-text-muted mb-8 max-w-sm">
                                Search community roadmaps, research, or exam archives.
                            </p>

                            <div className="w-full max-w-md relative group z-50">
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-accent group-focus-within:opacity-100 transition-all" />
                                    <input 
                                        type="text"
                                        placeholder="Search topics, articles or exam papers..."
                                        className="w-full bg-sidebar/50 border border-border rounded-xl pl-10 pr-20 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent transition-all manrope-body font-medium placeholder:text-text-muted/40"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button 
                                        type="submit"
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-text-heading text-background px-4 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-black/5"
                                    >
                                        Search
                                    </button>
                                </form>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (query.trim().length >= 2) && (allSuggestions.length > 0 || isLoading) && (
                                    <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1.5 bg-header border border-border rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                        {isLoading ? (
                                            <div className="px-4 py-3 text-[11px] text-text-muted font-medium flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                                Searching...
                                            </div>
                                        ) : (
                                            <div className="max-h-[350px] overflow-y-auto py-1">
                                                {allSuggestions.map((s, idx) => (
                                                    <Link 
                                                        key={idx} 
                                                        href={s.path}
                                                        className={`flex items-center justify-between px-4 py-2 hover:bg-sidebar transition-colors group/item ${idx === activeIndex ? 'bg-sidebar' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {s.logo ? (
                                                                <div className="w-3.5 h-3.5 bg-background rounded border border-border overflow-hidden flex items-center justify-center p-0.5 shrink-0 grayscale group-hover/item:grayscale-0 transition-all">
                                                                    <img src={s.logo} alt="" className="w-full h-full object-contain" />
                                                                </div>
                                                            ) : (
                                                                <s.icon className="w-3.5 h-3.5 text-text-muted/40 group-hover/item:text-accent transition-colors" />
                                                            )}
                                                            <span className="text-[12px] font-semibold text-text-heading truncate">
                                                                <HighlightMatch text={s.title} query={query} />
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-text-muted/30 group-hover/item:text-accent transition-all whitespace-nowrap ml-2">
                                                            {s.type}
                                                        </span>
                                                    </Link>
                                                ))}
                                                <Link 
                                                    href={`/explore?search=${encodeURIComponent(query.trim())}`}
                                                    className="flex items-center justify-between px-4 py-2 border-t border-border/50 hover:bg-sidebar transition-colors group/all"
                                                >
                                                    <span className="text-[11px] font-bold text-text-muted/60 group-hover/all:text-text-heading transition-colors">
                                                        See all results for &ldquo;{query.trim()}&rdquo;
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover/all:opacity-100 group-hover/all:translate-x-1 transition-all" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Directory Links */}
                        <div className="w-full mb-6 max-w-md">
                            <h2 className="manrope-body text-[11px] font-bold text-text-muted tracking-[0.15em] uppercase mb-4 flex items-center gap-3">
                                Learning directory <span className="h-px flex-1 bg-border opacity-40"></span>
                            </h2>
                        </div>

                        <div className="w-full flex flex-col gap-6 max-w-md">
                            {/* Research Link */}
                            <Link href="/research-decoded" className="group flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="manrope-body text-[15px] font-bold text-text-heading group-hover:text-accent transition-colors underline decoration-border group-hover:decoration-accent underline-offset-4 decoration-1">
                                        Research decoded
                                    </h3>
                                    <span className="manrope-body text-[10px] font-bold text-text-muted/40">({paperCount} papers)</span>
                                </div>
                                <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                                    Foundational paper breakthroughs simplified for students and researchers.
                                </p>
                            </Link>

                            {/* Articles Link */}
                            <Link href="/articles" className="group flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="manrope-body text-[15px] font-bold text-text-heading group-hover:text-teal-600 transition-colors underline decoration-border group-hover:decoration-teal-600 underline-offset-4 decoration-1">
                                        Technical articles
                                    </h3>
                                    <span className="manrope-body text-[10px] font-bold text-text-muted/40">({articleCount} articles)</span>
                                </div>
                                <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                                    Deep dives into engineering philosophies and technical architecture from industry experts.
                                </p>
                            </Link>

                            {/* Archive Link */}
                            <Link href="/archive/exams/previous-year-papers" className="group flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="manrope-body text-[15px] font-bold text-text-heading group-hover:text-amber-600 transition-colors underline decoration-border group-hover:decoration-amber-600 underline-offset-4 decoration-1">
                                        Exam archives
                                    </h3>
                                    <span className="manrope-body text-[10px] font-bold text-text-muted/40">({archiveCount} papers)</span>
                                </div>
                                <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                                    Official question papers and answer keys for global competitive examinations.
                                </p>
                            </Link>

                            {/* Explore Link */}
                            <Link href="/explore" className="group flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="manrope-body text-[15px] font-bold text-text-heading group-hover:text-teal-600 transition-colors underline decoration-border group-hover:decoration-teal-600 underline-offset-4 decoration-1">
                                        Global roadmaps
                                    </h3>
                                    <span className="manrope-body text-[10px] font-bold text-text-muted/40">({roadmapCount || '...'} community)</span>
                                </div>
                                <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                                    Structured learning paths built and verified by the EulerFold community.
                                </p>
                            </Link>
                        </div>

                        {/* AI Creation CTA */}
                        <div className="w-full max-w-md mt-12 pt-8 flex justify-center border-t border-border/40">
                            <Link 
                                href="/generate"
                                className="inline-flex items-center gap-2 bg-text-heading text-background px-8 py-3 rounded-full text-[14px] font-bold tracking-tight hover:opacity-90 active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Create your roadmap
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function LearnClient() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
            <LearnContent />
        </Suspense>
    );
}
