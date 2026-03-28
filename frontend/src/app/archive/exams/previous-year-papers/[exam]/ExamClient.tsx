"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PaperEntry, ExamCategory } from '../../../generatedArchiveData';
import { Download, Key, ArrowRight, X, Menu, BookOpen, LayoutDashboard, Plus, Search, ChevronLeft, Calendar, FileText, CheckCircle2, Filter, Info, ChevronRight, FileQuestion, Clock, Target, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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

const EXAM_URLS: Record<string, string> = {
  "AIME": "https://www.maa.org/math-competitions/about-amc",
  "AMC": "https://www.maa.org/math-competitions",
  "AP": "https://apcentral.collegeboard.org/",
  "CSIR_NET": "https://csirnet.nta.nic.in/",
  "ENGAA": "https://www.undergraduate.study.cam.ac.uk/applying/admissions-tests",
  "GATE": "https://gate2024.iisc.ac.in/",
  "IAO": "http://www.isao.it/",
  "IChO": "https://www.icho-official.org/",
  "IMO": "https://www.imo-official.org/",
  "IOI": "https://ioinformatics.org/",
  "IPhO": "https://www.ipho-official.org/",
  "JAM": "https://jam.iitm.ac.in/",
  "JEST": "https://www.jest.org.in/",
  "MAT": "https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/admissions-tests/mat",
  "NSAA": "https://www.undergraduate.study.cam.ac.uk/applying/admissions-tests",
  "PAT": "https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/admissions-tests/pat",
  "Putnam": "https://www.maa.org/math-competitions/putnam-competition",
  "STEP": "https://www.admissionstesting.org/for-test-takers/step/",
  "TIFR": "https://www.tifr.res.in/~gsadmissions/",
  "UGC_NET": "https://ugcnet.nta.nic.in/",
  "JEE_ADVANCE": "https://jeeadv.ac.in/",
  "NEET": "https://neet.nta.nic.in/",
  "UPSC": "https://www.upsc.gov.in/",
  "CAT": "https://iimcat.ac.in/",
  "NBHM": "https://www.nbhm.dae.gov.in/",
  "INMO": "https://olympiads.hbcse.tifr.res.in/",
  "RMO": "https://olympiads.hbcse.tifr.res.in/",
  "IOQM": "https://olympiads.hbcse.tifr.res.in/",
  "PRMO": "https://olympiads.hbcse.tifr.res.in/"
};

const EXAM_METADATA: Record<string, { duration: string; marks: string }> = {
  "AIME": { duration: "3.0 Hours", marks: "15 Marks" },
  "AMC": { duration: "75 Mins", marks: "150 Marks" },
  "AP": { duration: "2-3 Hours", marks: "5.0 Scale" },
  "CSIR_NET": { duration: "3.0 Hours", marks: "200 Marks" },
  "ENGAA": { duration: "2.0 Hours", marks: "Varies" },
  "GATE": { duration: "3.0 Hours", marks: "100 Marks" },
  "IAO": { duration: "3-4 Hours", marks: "Varies" },
  "IChO": { duration: "5.0 Hours", marks: "Varies" },
  "IMO": { duration: "9.0 Hours", marks: "42 Marks" },
  "IOI": { duration: "10.0 Hours", marks: "600 Marks" },
  "IPhO": { duration: "10.0 Hours", marks: "50 Marks" },
  "JAM": { duration: "3.0 Hours", marks: "100 Marks" },
  "JEST": { duration: "3.0 Hours", marks: "100 Marks" },
  "MAT": { duration: "2.5 Hours", marks: "100 Marks" },
  "NSAA": { duration: "2.0 Hours", marks: "Varies" },
  "PAT": { duration: "2.0 Hours", marks: "100 Marks" },
  "Putnam": { duration: "6.0 Hours", marks: "120 Marks" },
  "STEP": { duration: "3.0 Hours", marks: "120 Marks" },
  "TIFR": { duration: "3.0 Hours", marks: "100 Marks" },
  "UGC_NET": { duration: "3.0 Hours", marks: "300 Marks" },
  "JEE_ADVANCE": { duration: "6.0 Hours", marks: "Varies" },
  "NEET": { duration: "3.3 Hours", marks: "720 Marks" },
  "UPSC": { duration: "2.0 Hours", marks: "200 Marks" },
  "CAT": { duration: "2.0 Hours", marks: "198 Marks" },
  "NBHM": { duration: "3.0 Hours", marks: "Varies" },
  "INMO": { duration: "4.0 Hours", marks: "102 Marks" },
  "RMO": { duration: "3.0 Hours", marks: "100 Marks" },
  "IOQM": { duration: "3.0 Hours", marks: "100 Marks" },
  "PRMO": { duration: "3.0 Hours", marks: "100 Marks" }
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

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
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
  const examUrl = EXAM_URLS[exam.title];
  const metadata = EXAM_METADATA[exam.title] || { duration: "3.0 Hours", marks: "100 Marks" };

  const totalPapers = exam.entries.length;
  const yearsRange = useMemo(() => {
    const years = exam.entries.map(e => parseInt(e.year)).filter(y => !isNaN(y));
    if (years.length === 0) return "N/A";
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? `${min}` : `${min} - ${max}`;
  }, [exam.entries]);

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
            <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block"></div>
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Link href="/archive/exams/previous-year-papers" className="text-[11px] md:text-[13px] font-bold text-text-muted hover:text-text-heading transition-colors tracking-wide whitespace-nowrap">Archive</Link>
              <span className="text-text-muted text-[10px]">/</span>
              <span className="text-[11px] md:text-[13px] font-bold text-accent tracking-wide truncate">{exam.title}</span>
            </div>
          </div>

          {/* Search Bar in Header - Responsive */}
          <div className="flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
            </div>
            <input 
              type="text"
              placeholder={`Search ${exam.title} papers...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-callout-bg border border-border rounded-full py-1 md:py-1.5 pl-8 md:pl-9 pr-4 manrope-body text-[11px] md:text-[12px] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm focus:bg-background dark:focus:bg-[#1a1a1a]"
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
          <div className="max-w-[1000px] mx-auto px-6 pt-8 pb-12">
            
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="inconsolata-ui text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Exam Archive</h2>
                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
              </div>

              <div className="flex items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                      <img src={logoUrl} alt={exam.title} className="w-full h-full object-contain grayscale-[0.2]" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-[20px] md:text-[24px] font-black text-text-heading tracking-tight inconsolata-ui leading-none mb-1">
                      {exam.title}
                    </h1>
                    <p className="manrope-body text-[12px] md:text-[13px] font-bold text-text-muted">
                      {fullName}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-6">
                  <div className="text-right">
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Duration</span>
                    <span className="inconsolata-ui text-[14px] font-black text-text-heading leading-none">{metadata.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Marks</span>
                    <span className="inconsolata-ui text-[14px] font-black text-text-heading leading-none">{metadata.marks}</span>
                  </div>
                  <div className="text-right">
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Papers</span>
                    <span className="inconsolata-ui text-[14px] font-black text-text-heading leading-none">{totalPapers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-callout-bg/50 border border-callout-border rounded-xl p-5">
                <p className="manrope-body text-[13px] text-text-primary leading-relaxed font-medium mb-4">
                  {description}
                </p>
                {examUrl && (
                  <a 
                    href={examUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent hover:underline underline-offset-4 inconsolata-ui tracking-wide"
                  >
                    Official Main Site <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Papers List Section */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="inconsolata-ui text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">
                  Available Papers
                </h2>
                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
              </div>

              <div className="border-t border-border divide-y divide-[var(--border)]">
                {filteredEntries.length > 0 ? (
                  (isAuthenticated === false ? filteredEntries.slice(0, 8) : filteredEntries).map((entry, idx) => (
                    <div key={idx} className="group flex flex-col md:flex-row md:items-center gap-4 py-2 hover:bg-sidebar/30 transition-colors px-2 rounded-lg">
                      {/* Paper Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/archive/exams/previous-year-papers/${exam.id.toLowerCase()}/${entry.slug}`}
                            className="inconsolata-ui text-[13px] font-bold text-text-heading truncate tracking-normal hover:text-accent transition-colors"
                          >
                            {exam.title} {entry.subject === 'Main Paper' ? 'Standard Paper' : entry.subject} {entry.year}
                          </Link>
                          {entry.session && (
                            <span className="text-[8px] bg-accent-muted text-accent px-1.5 py-0.5 rounded uppercase font-black tracking-tighter shrink-0">
                              S{entry.session}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="manrope-body text-[10px] font-bold text-text-muted uppercase tracking-wide">Edition {entry.year}</span>
                        </div>
                      </div>

                      {/* Desktop Actions - Quick Download Icons */}
                      <div className="hidden md:flex items-center gap-2 px-6 shrink-0 border-x border-border h-6">
                        {entry.questionPaper && (
                          <a 
                            href={entry.questionPaperDriveId ? getDriveDownloadUrl(entry.questionPaperDriveId) : `/archive/${entry.questionPaper}`} 
                            className="text-text-muted hover:text-accent transition-colors p-1"
                            title="Download Paper"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {entry.answerKey && (
                          <a 
                            href={entry.answerKeyDriveId ? getDriveDownloadUrl(entry.answerKeyDriveId) : `/archive/${entry.answerKey}`} 
                            className="text-text-muted hover:text-emerald-500 transition-colors p-1"
                            title="Download Solutions"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Primary Action Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/archive/exams/previous-year-papers/${exam.id.toLowerCase()}/${entry.slug}`}
                          className="bg-[var(--text-heading)] text-[var(--bg-main)] px-4 py-1 rounded-md text-[10px] font-bold tracking-wide hover:opacity-90 transition-all flex items-center gap-2"
                        >
                          Access <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-callout-bg/20 border border-dashed border-border rounded-xl">
                    <h3 className="inconsolata-ui text-[1rem] font-bold text-text-muted mb-2">No matching papers.</h3>
                    <p className="manrope-body text-[0.875rem] text-text-muted italic">Refine your search to find specific editions.</p>
                  </div>
                )}
              </div>

              {/* Login Gate */}
              {isAuthenticated === false && filteredEntries.length > 8 && (
                <div className="mt-8 p-8 bg-sidebar/40 border border-border border-dashed rounded-xl text-center">
                  <p className="manrope-body text-[13px] font-bold text-text-heading mb-4">
                    Unlock full archive access ({filteredEntries.length - 8} more items)
                  </p>
                  <button 
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-2 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full px-6 py-2 text-[11px] font-bold hover:opacity-90 transition-all"
                  >
                    Sign in to EulerFold
                  </button>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
