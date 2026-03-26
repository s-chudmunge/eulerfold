"use client";

import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { archiveData, PaperEntry } from '../../generatedArchiveData';
import { Search, Download, Key, ArrowRight, X, ChevronDown, ChevronRight, Menu, Rocket, LayoutDashboard, Plus } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { getDriveDownloadUrl } from '@/lib/drive';

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
  "UGC_NET": "UGC National Eligibility Test",
  "JEE_ADVANCE": "JEE Advanced",
  "NEET": "NEET UG",
  "UPSC": "UPSC Civil Services",
  "CAT": "Common Admission Test",
  "NBHM": "NBHM MSc & PhD",
  "INMO": "Indian National Mathematical Olympiad",
  "RMO": "Regional Mathematical Olympiad",
  "IOQM": "Indian Olympiad Qualifier in Mathematics",
  "PRMO": "Pre-Regional Mathematical Olympiad"
};

const EXAM_LOGOS: Record<string, string> = {
  "IMO": "/assets/logos/IMO.png",
  "IPhO": "/assets/logos/IPhO.png",
  "MAT": "/assets/logos/MAT.png",
  "PAT": "/assets/logos/PAT.png"
};

const EXAM_REGIONS: Record<string, string> = {
  "AIME": "USA",
  "AMC": "USA",
  "AP": "USA",
  "CSIR_NET": "India",
  "ENGAA": "United Kingdom",
  "GATE": "India",
  "IAO": "Worldwide",
  "IChO": "Worldwide",
  "IMO": "Worldwide",
  "IOI": "Worldwide",
  "IPhO": "Worldwide",
  "JAM": "India",
  "JEST": "India",
  "MAT": "United Kingdom",
  "NSAA": "United Kingdom",
  "PAT": "United Kingdom",
  "Putnam": "USA & Canada",
  "STEP": "United Kingdom",
  "TIFR": "India",
  "UGC_NET": "India",
  "JEE_ADVANCE": "India",
  "NEET": "India",
  "UPSC": "India",
  "CAT": "India",
  "NBHM": "India",
  "INMO": "India",
  "RMO": "India",
  "IOQM": "India",
  "PRMO": "India"
};

function ArchiveContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
        setProfile(data);
      }
    };
    checkAuth();
  }, []);

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

  const toggleCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const query = searchParams.get('q')?.toLowerCase() || "";
  const selectedExam = searchParams.get('exam') || "All Exams";
  const selectedSubject = searchParams.get('subject') || "All Subjects";
  const selectedYear = searchParams.get('year') || "All Years";
  const sortOrder = searchParams.get('sort') || "newest";

  const allExams = useMemo(() => ["All Exams", ...archiveData.map(c => c.title)], []);
  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    archiveData.forEach(category => {
      if (selectedExam === "All Exams" || category.title === selectedExam) {
        category.entries.forEach(entry => {
          if (entry.subject && entry.subject !== 'Main Paper') {
            subjects.add(entry.subject);
          }
        });
      }
    });
    return ["All Subjects", "Main Paper", ...Array.from(subjects).sort()];
  }, [selectedExam]);

  const allYears = useMemo(() => {
    const years = new Set<string>();
    archiveData.forEach(c => c.entries.forEach(e => {
      if (e.year && e.year !== "Unknown") {
        years.add(e.year);
      }
    }));
    return ["All Years", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, []);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "All Exams" || value === "All Years" || value === "All Subjects" || (key === 'sort' && value === 'newest')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  const groupedExams = useMemo(() => {
    const data = archiveData.map(category => {
      if (selectedExam !== "All Exams" && category.title !== selectedExam) {
        return { ...category, entries: [] };
      }

      const filteredEntries = category.entries.map(entry => {
        let sanitizedYear = entry.year;
        const yearMatch = entry.subject.match(/\b(19|20)\d{2}\b/);
        if (sanitizedYear === "Unknown" || parseInt(sanitizedYear) > 2030 || parseInt(sanitizedYear) < 1960) {
          if (yearMatch) sanitizedYear = yearMatch[0];
        }
        if (entry.subject.includes("IChO 2025") || entry.subject.includes("ICHO-2025")) {
          sanitizedYear = "2025";
        }
        return { ...entry, year: sanitizedYear };
      }).filter(entry => {
        const matchesQuery = !query || 
          entry.subject.toLowerCase().includes(query) || 
          entry.examType.toLowerCase().includes(query) ||
          entry.year.includes(query);
        const matchesYear = selectedYear === "All Years" || entry.year === selectedYear;
        const matchesSubject = selectedSubject === "All Subjects" || entry.subject === selectedSubject;
        if (entry.year === "Unknown" && !query && selectedYear === "All Years") return false;
        return matchesQuery && matchesYear && matchesSubject;
      });

      const groupedMap = new Map<string, PaperEntry>();
      const answerKeys = new Map<string, string>();
      const normalize = (s: string) => s.toLowerCase()
        .replace(/\b(s|sol|solution|solutions|answer key|answerkey|marking scheme|ms|marking|scheme|exam|official|english|preparatory|theory|practical)\b/g, '')
        .replace(/\s+/g, ' ').trim();

      const seenFiles = new Set<string>();
      filteredEntries.forEach(entry => {
        const fileKey = `${entry.questionPaper || ''}-${entry.answerKey || ''}`;
        if (fileKey !== '-' && seenFiles.has(fileKey)) return;
        if (fileKey !== '-') seenFiles.add(fileKey);
        const normSub = normalize(entry.subject);
        const groupKey = `${entry.year}-${normSub}-${entry.session || 'null'}`;
        if (!entry.questionPaper && entry.answerKey) {
          const akKey = `${entry.year}-${normSub}`;
          if (!answerKeys.has(akKey)) answerKeys.set(akKey, entry.answerKey);
        }
        if (groupedMap.has(groupKey)) {
          const existing = groupedMap.get(groupKey)!;
          groupedMap.set(groupKey, {
            ...existing,
            questionPaper: existing.questionPaper || entry.questionPaper,
            answerKey: existing.answerKey || entry.answerKey
          });
        } else {
          groupedMap.set(groupKey, { ...entry });
        }
      });

      groupedMap.forEach((entry) => {
        if (entry.questionPaper && !entry.answerKey) {
          const normSub = normalize(entry.subject);
          const akKey = `${entry.year}-${normSub}`;
          if (answerKeys.has(akKey)) entry.answerKey = answerKeys.get(akKey)!;
        }
      });

      const finalEntries = Array.from(groupedMap.values())
        .filter(e => e.questionPaper || e.answerKey)
        .sort((a, b) => {
          const yearA = a.year === "Unknown" ? "0000" : a.year;
          const yearB = b.year === "Unknown" ? "0000" : b.year;
          if (yearA !== yearB) return sortOrder === "newest" ? yearB.localeCompare(yearA) : yearA.localeCompare(yearB);
          return a.subject.localeCompare(b.subject);
        });

      return { ...category, entries: finalEntries };
    }).filter(category => category.entries.length > 0);

    const groups: Record<string, typeof data> = {};
    data.forEach(cat => {
      const region = EXAM_REGIONS[cat.title] || "Other";
      if (!groups[region]) groups[region] = [];
      groups[region].push(cat);
    });

    const priority = ["Worldwide", "India", "USA", "United Kingdom", "USA & Canada"];
    return Object.entries(groups).sort(([a], [b]) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [query, selectedExam, selectedYear, selectedSubject, sortOrder]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* App Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link className="flex items-center group" href="/" aria-label="EulerFold Home">
              <img src="/apple-touch-icon.png" alt="" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Search Bar in Header - Responsive */}
          <div className="flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-3 h-3 md:w-3.5 md:h-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search archive..."
              value={query}
              onChange={(e) => updateFilters({ q: e.target.value || null })}
              className="w-full bg-callout-bg border border-border rounded-full py-1 md:py-1.5 pl-8 md:pl-9 pr-4 inconsolata-ui text-[11px] md:text-[12px] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm focus:bg-background dark:focus:bg-[#1a1a1a]"
            />
          </div>

          <div className="flex items-center shrink-0">
            {!isAuthenticated && isAuthenticated !== null && (
              <button onClick={handleSignIn} className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background pb-24">
          <div className="max-w-[1000px] mx-auto px-6 py-8 md:px-12 md:py-12">

            {showBanner && (
              <div className="mb-12 bg-callout-bg rounded-3xl p-6 md:p-8 border border-border relative overflow-hidden group">
                <button 
                  onClick={() => setShowBanner(false)}
                  className="absolute top-4 right-4 z-20 p-2 text-text-muted hover:text-text-primary hover:bg-[var(--border)] rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-2 text-accent mb-3">
                    <span className="inconsolata-ui text-[12px] md:text-[13px] font-bold">EulerFold</span>
                  </div>
                  <h2 className="text-[20px] md:text-[22px] font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">Join the EulerFold community</h2>
                  <p className="manrope-body text-[13px] md:text-[14px] mb-6 text-text-primary leading-relaxed font-medium">
                    Track your preparation progress and collaborate with students worldwide.
                  </p>
                  <button className="inline-flex items-center gap-2 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full px-6 py-2.5 text-[14px] font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-teal-500/20">
                    Start Your Journey <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute -bottom-10 -right-10 text-[180px] opacity-[0.03] grayscale -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">🐢</span>
              </div>
            )}

            <div className="mb-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <select 
                    value={selectedExam}
                    onChange={(e) => updateFilters({ exam: e.target.value, subject: "All Subjects" })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 inconsolata-ui text-[14px] appearance-none focus:outline-none focus:border-[var(--accent)] cursor-pointer shadow-sm truncate pr-8 dark:bg-[#1a1a1a]"
                  >
                    {allExams.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <select 
                    value={selectedSubject}
                    onChange={(e) => updateFilters({ subject: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 inconsolata-ui text-[14px] appearance-none focus:outline-none focus:border-[var(--accent)] cursor-pointer shadow-sm truncate pr-8 dark:bg-[#1a1a1a]"
                  >
                    {allSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <select 
                    value={selectedYear}
                    onChange={(e) => updateFilters({ year: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 inconsolata-ui text-[14px] appearance-none focus:outline-none focus:border-[var(--accent)] cursor-pointer shadow-sm dark:bg-[#1a1a1a]"
                  >
                    {allYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <select 
                    value={sortOrder}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 inconsolata-ui text-[14px] appearance-none focus:outline-none focus:border-[var(--accent)] cursor-pointer shadow-sm dark:bg-[#1a1a1a]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {(query || selectedExam !== "All Exams" || selectedYear !== "All Years" || selectedSubject !== "All Subjects" || sortOrder !== "newest") && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest mr-2">Active:</span>
                  {selectedExam !== "All Exams" && (
                    <button onClick={() => updateFilters({ exam: null, subject: "All Subjects" })} className="flex items-center gap-1.5 bg-accent-muted text-accent px-3 py-1 rounded-full text-[12px] font-bold inconsolata-ui">
                      {selectedExam} <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedSubject !== "All Subjects" && (
                    <button onClick={() => updateFilters({ subject: null })} className="flex items-center gap-1.5 bg-accent-muted text-accent px-3 py-1 rounded-full text-[12px] font-bold inconsolata-ui">
                      {selectedSubject} <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedYear !== "All Years" && (
                    <button onClick={() => updateFilters({ year: null })} className="flex items-center gap-1.5 bg-accent-muted text-accent px-3 py-1 rounded-full text-[12px] font-bold inconsolata-ui">
                      {selectedYear} <X className="w-3 h-3" />
                    </button>
                  )}
                  {sortOrder !== "newest" && (
                    <button onClick={() => updateFilters({ sort: null })} className="flex items-center gap-1.5 bg-accent-muted text-accent px-3 py-1 rounded-full text-[12px] font-bold inconsolata-ui">
                      {sortOrder === "oldest" ? "Oldest First" : sortOrder} <X className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => router.replace(pathname)} className="text-[12px] font-bold text-text-muted hover:text-text-primary inconsolata-ui underline underline-offset-4 ml-2">Reset</button>
                </div>
              )}
            </div>

            <div className="space-y-12">
              {groupedExams.map(([region, categories]) => {
                const regionFlags: Record<string, string> = {
                  "Worldwide": "🌐",
                  "India": "🇮🇳",
                  "USA": "🇺🇸",
                  "United Kingdom": "🇬🇧",
                  "USA & Canada": "🇺🇸🇨🇦"
                };
                const flag = regionFlags[region] || "";
                return (
                  <div key={region} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="inconsolata-ui text-[11px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                        {region} <span className="text-[13px] opacity-100 grayscale-0 leading-none">{flag}</span>
                      </h3>
                      <div className="h-px flex-1 bg-[var(--border)] opacity-50"></div>
                    </div>
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const isExpanded = expandedCategories.has(category.id) || query.length > 0;
                        const fullName = EXAM_FULL_NAMES[category.title];
                        return (
                          <section key={category.id} id={category.id} className="group/section">
                            <div className="flex items-center gap-4 mb-2 group">
                              <button onClick={() => toggleCategory(category.id)} className="flex items-center hover:opacity-80 transition-all text-left">
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-accent shrink-0" /> : <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors shrink-0" />}
                              </button>
                              <Link href={`/archive/exams/previous-year-papers/${category.id.toLowerCase()}`} className="flex-1 flex items-center gap-4 min-w-0 hover:opacity-80 transition-all hover:underline underline-offset-4">
                                <div className="flex items-center gap-2 truncate">
                                  {EXAM_LOGOS[category.title] && (
                                    <div className="w-5 h-5 bg-background rounded border border-border overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                                      <img src={EXAM_LOGOS[category.title]} alt="" className="w-full h-full object-contain grayscale-[0.3]" />
                                    </div>
                                  )}
                                  <h2 className="inconsolata-ui text-[14px] font-black text-text-heading shrink-0">{category.title}</h2>
                                  {fullName && <span className="manrope-body text-[11px] font-bold text-text-muted truncate opacity-70">({fullName})</span>}
                                </div>
                                <div className="h-[1px] flex-1 bg-[var(--border)] opacity-30 group-hover:opacity-60 transition-opacity"></div>
                                <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">{category.entries.length} ITEMS</span>
                              </Link>
                            </div>
                            {isExpanded && (
                              <div className="relative ml-8">
                                <div className="divide-y divide-[var(--border)] border-t border-b border-border animate-in fade-in slide-in-from-top-1 duration-200">
                                  {(isAuthenticated === false ? category.entries.slice(0, 5) : category.entries).map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-1.5 hover:bg-callout-bg transition-colors group">
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="inconsolata-ui text-[11px] font-black text-text-muted w-10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{entry.year}</span>
                                        <Link href={`/archive/exams/previous-year-papers/${category.id.toLowerCase()}/${entry.slug}`} className="flex items-center gap-2 min-w-0 hover:text-accent hover:underline underline-offset-4 transition-colors">
                                          <span className="manrope-body text-[13px] font-medium text-text-heading truncate">{category.title} {entry.subject === 'Main Paper' ? 'Paper' : entry.subject} {entry.year}</span>
                                          {entry.session && <span className="text-[8px] bg-accent-muted text-accent px-1 py-0.5 rounded uppercase font-black tracking-tighter">S{entry.session}</span>}
                                        </Link>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {entry.questionPaper && (
                                          <a 
                                            href={entry.questionPaperDriveId ? getDriveDownloadUrl(entry.questionPaperDriveId) : `/archive/${entry.questionPaper}`} 
                                            download={!entry.questionPaperDriveId ? entry.questionPaper : undefined}
                                            target={entry.questionPaperDriveId ? "_blank" : undefined}
                                            rel={entry.questionPaperDriveId ? "noopener noreferrer" : undefined}
                                            title={entry.questionPaperDriveId ? "Download from Drive" : "Download QP"} 
                                            className="p-1 rounded-md hover:bg-teal-50 text-teal-600/70 hover:text-teal-700 transition-all flex items-center gap-0.5"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            {entry.questionPaperDriveId && <span className="text-[7px] font-black opacity-50">DRIVE</span>}
                                          </a>
                                        )}
                                        {entry.answerKey && (
                                          <a 
                                            href={entry.answerKeyDriveId ? getDriveDownloadUrl(entry.answerKeyDriveId) : `/archive/${entry.answerKey}`} 
                                            download={!entry.answerKeyDriveId ? entry.answerKey : undefined}
                                            target={entry.answerKeyDriveId ? "_blank" : undefined}
                                            rel={entry.answerKeyDriveId ? "noopener noreferrer" : undefined}
                                            title={entry.answerKeyDriveId ? "Download from Drive" : "Download AK"} 
                                            className="p-1 rounded-md hover:bg-emerald-50 text-emerald-600/70 hover:text-emerald-700 transition-all flex items-center gap-0.5"
                                          >
                                            <Key className="w-3.5 h-3.5" />
                                            {entry.answerKeyDriveId && <span className="text-[7px] font-black opacity-50">DRIVE</span>}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {isAuthenticated === false && category.entries.length > 5 && (
                                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/90 to-transparent flex flex-col items-center justify-end pb-4 z-10">
                                    <div className="text-center space-y-2 px-6">
                                      <p className="manrope-body text-[11px] font-bold text-text-muted">EulerFold is free. <span className="text-text-primary">Sign in to view full archives.</span></p>
                                      <button onClick={handleSignIn} className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-full px-4 py-1.5 text-[11px] font-bold hover:opacity-90 transition-all shadow-md manrope-body">
                                        <img src="/google.svg" alt="" className="w-3.5 h-3.5 brightness-0 invert dark:brightness-100 dark:invert-0" /> Sign in
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {groupedExams.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl">
                  <p className="manrope-body text-text-muted text-sm uppercase tracking-widest font-black">No matching items found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ArchiveClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center inconsolata-ui text-text-muted uppercase tracking-widest">Loading Archive...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
