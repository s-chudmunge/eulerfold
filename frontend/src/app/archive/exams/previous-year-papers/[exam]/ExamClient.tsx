"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PaperEntry, ExamCategory } from '../../../generatedArchiveData';
import { Download, Key, ArrowRight, X, Menu, Rocket, LayoutDashboard, Plus, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

const EXAM_DESCRIPTIONS: Record<string, string> = {
  "AIME": "The American Invitational Mathematics Examination (AIME) is a 15-question, 3-hour examination given to those who rank in the top 5% on the AMC 10 or the top 2.5% on the AMC 12. It is a key step towards the USAMO.",
  "AMC": "The American Mathematics Competitions (AMC) are a series of examinations and curriculum materials that build problem-solving skills and mathematical knowledge in middle and high school students across the United States.",
  "AP": "Advanced Placement (AP) is a program in the United States and Canada created by the College Board which offers college-level curricula and examinations to high school students to earn college credit.",
  "CSIR_NET": "CSIR UGC NET is a national-level exam conducted to determine the eligibility of Indian nationals for Junior Research Fellowship (JRF) and for Lectureship / Assistant Professor in Indian universities and colleges.",
  "ENGAA": "The Engineering Admissions Assessment (ENGAA) is a pre-interview assessment for applicants to the Engineering course at the University of Cambridge, testing mathematical and physical knowledge.",
  "GATE": "The Graduate Aptitude Test in Engineering (GATE) is an examination that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science for admission into Masters Programs and Jobs in PSUs.",
  "IAO": "The International Astronomy Olympiad (IAO) is an internationally recognized astronomy scientific-educating event for high school students (14-18 years old), including an intellectual competition between students.",
  "IChO": "The International Chemistry Olympiad (IChO) is an annual academic competition for high school students. It is one of the International Science Olympiads, testing advanced chemistry knowledge and laboratory skills.",
  "IMO": "The International Mathematical Olympiad (IMO) is a mathematical olympiad for pre-university students, and is the oldest of the International Science Olympiads, held annually since 1959.",
  "IOI": "The International Olympiad in Informatics (IOI) is an annual competitive programming competition for secondary school students. It is one of the most prestigious computer science competitions in the world.",
  "IPhO": "The International Physics Olympiad (IPhO) is an annual physics competition for high school students. It is one of the International Science Olympiads, testing theoretical and experimental physics problem-solving.",
  "JAM": "The Joint Admission Test for Masters (JAM) is an all-India level entrance examination for admission into M.Sc. and other post-graduate science programs at IITs and IISc.",
  "JEST": "The Joint Entrance Screening Test (JEST) is a national-level entrance exam for admission to Ph.D. and Integrated Ph.D. programs in Physics and Theoretical Computer Science at premier research institutes in India.",
  "MAT": "The Mathematics Admissions Test (MAT) is a subject-specific admissions test for applicants to the University of Oxford's undergraduate degree courses in Mathematics, Computer Science and their joint degrees.",
  "NSAA": "The Natural Sciences Admissions Assessment (NSAA) is a pre-interview assessment for applicants to the Natural Sciences course at the University of Cambridge.",
  "PAT": "The Physics Aptitude Test (PAT) is a subject-specific admissions test for applicants to the University of Oxford's undergraduate degree courses in Physics, Engineering Science, and Materials Science.",
  "Putnam": "The William Lowell Putnam Mathematical Competition is an annual mathematics competition for undergraduate college students enrolled in institutions of higher learning in the United States and Canada.",
  "STEP": "The Sixth Term Examination Paper (STEP) is a well-established mathematics examination used by the University of Cambridge and the University of Warwick for undergraduate admissions.",
  "TIFR": "The Tata Institute of Fundamental Research (TIFR) Graduate School Admissions exam is conducted for admission to postgraduate and PhD programs in Physics, Chemistry, Biology, Mathematics and Computer Science.",
  "UGC_NET": "The UGC National Eligibility Test (NET) is a national-level exam conducted to determine the eligibility for 'Assistant Professor' and 'Junior Research Fellowship' in Indian universities and colleges."
};

const EXAM_LOGOS: Record<string, string> = {
  "IMO": "/assets/logos/IMO.png",
  "IPhO": "/assets/logos/IPhO.png",
  "MAT": "/assets/logos/MAT.png",
  "PAT": "/assets/logos/PAT.png"
};

interface Props {
  exam: ExamCategory;
}

export default function ExamClient({ exam }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  const filteredEntries = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [...exam.entries].sort((a, b) => {
        if (a.year !== b.year) return b.year.localeCompare(a.year);
        return a.subject.localeCompare(b.subject);
      });
    }

    const keywords = q.split(/\s+/);
    
    return exam.entries.filter(entry => {
      const subject = entry.subject.toLowerCase();
      const year = entry.year.toLowerCase();
      const qp = (entry.questionPaper || "").toLowerCase();
      const ak = (entry.answerKey || "").toLowerCase();
      
      // All keywords must match at least one field
      return keywords.every(kw => 
        subject.includes(kw) || 
        year.includes(kw) || 
        qp.includes(kw) || 
        ak.includes(kw)
      );
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      return a.subject.localeCompare(b.subject);
    });
  }, [exam.entries, query]);

  const fullName = EXAM_FULL_NAMES[exam.title] || exam.title;
  const description = EXAM_DESCRIPTIONS[exam.title] || `Access previous year papers and answer keys for ${exam.title}.`;
  const logoUrl = EXAM_LOGOS[exam.title];

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
              placeholder={`Search ${exam.title} papers...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                {logoUrl ? (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                    <img src={logoUrl} alt={exam.title} className="w-full h-full object-contain grayscale-[0.2]" />
                  </div>
                ) : (
                  <div className="bg-accent-muted text-accent p-2 rounded-xl">
                    <Rocket className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-[28px] md:text-[32px] font-black text-text-heading tracking-tight inconsolata-ui leading-none">
                    {exam.title}
                  </h1>
                  <p className="manrope-body text-[13px] md:text-[14px] font-bold text-text-muted mt-1">
                    {fullName}
                  </p>
                </div>
              </div>
              <div className="max-w-2xl bg-callout-bg border border-border rounded-2xl p-6">
                <p className="manrope-body text-[14px] text-text-primary leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="divide-y divide-[var(--border)] border-t border-b border-border animate-in fade-in slide-in-from-top-1 duration-200">
                {(isAuthenticated === false ? filteredEntries.slice(0, 5) : filteredEntries).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 hover:bg-callout-bg transition-colors group">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <span className="inconsolata-ui text-[11px] font-black text-text-muted w-10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {entry.year}
                      </span>
                      <Link 
                        href={`/archive/exams/previous-year-papers/${exam.id.toLowerCase()}/${entry.slug}`}
                        className="flex items-center gap-2 min-w-0 hover:text-accent hover:underline underline-offset-4 transition-all"
                      >
                        <span className="manrope-body text-[13px] font-medium text-text-heading truncate">
                          {exam.title} {entry.subject === 'Main Paper' ? 'Paper' : entry.subject} {entry.year}
                        </span>
                        {entry.session && (
                          <span className="text-[8px] bg-accent-muted text-accent px-1 py-0.5 rounded uppercase font-black tracking-tighter">
                            S{entry.session}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {entry.questionPaper && (
                        <a 
                          href={`/archive/${entry.questionPaper}`}
                          download={entry.questionPaper}
                          title="Download Question Paper"
                          className="p-1.5 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600/70 hover:text-teal-700 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {entry.answerKey && (
                        <a 
                          href={`/archive/${entry.answerKey}`}
                          download={entry.answerKey}
                          title="Download Answer Key"
                          className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600/70 hover:text-emerald-700 transition-all"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isAuthenticated === false && filteredEntries.length > 5 && (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/90 to-transparent flex flex-col items-center justify-end pb-4 z-10">
                  <div className="text-center space-y-2 px-6">
                    <p className="manrope-body text-[11px] font-bold text-text-muted">
                      EulerFold is free. <span className="text-text-primary">Sign in to view full archives.</span>
                    </p>
                    <button 
                      onClick={handleSignIn}
                      className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-full px-4 py-1.5 text-[11px] font-bold hover:opacity-90 transition-all shadow-md manrope-body"
                    >
                      <img src="/google.svg" alt="" className="w-3.5 h-3.5 brightness-0 invert dark:brightness-100 dark:invert-0" />
                      Sign in
                    </button>
                  </div>
                </div>
              )}
              
              {filteredEntries.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl">
                  <p className="manrope-body text-text-muted text-sm uppercase tracking-widest font-black">No matching papers found</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
