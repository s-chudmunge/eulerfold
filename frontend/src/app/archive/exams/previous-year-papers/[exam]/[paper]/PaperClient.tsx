"use client";

import React, { useState, useEffect } from 'react';
import { PaperEntry, ExamCategory } from '../../../../generatedArchiveData';
import { Download, Key, ArrowRight, X, Menu, Rocket, LayoutDashboard, Plus, ChevronLeft, FileText, Share2, Printer, Bookmark } from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getDriveDownloadUrl } from '@/lib/drive';

const EXAM_LOGOS: Record<string, string> = {
  "IMO": "/assets/logos/IMO.png",
  "IPhO": "/assets/logos/IPhO.png",
  "MAT": "/assets/logos/MAT.png",
  "PAT": "/assets/logos/PAT.png"
};

interface Props {
  exam: ExamCategory;
  paper: PaperEntry;
}

export default function PaperClient({ exam, paper }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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

  const paperName = `${exam.title} ${paper.subject === 'Main Paper' ? 'Paper' : paper.subject} ${paper.year}`;
  const logoUrl = EXAM_LOGOS[exam.title];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* App Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link className="flex items-center group shrink-0" href="/" aria-label="EulerFold Home">
              <img src="/apple-touch-icon.png" alt="" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>
            <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Link href="/archive/exams/previous-year-papers" className="text-[11px] md:text-[13px] font-bold text-text-muted hover:text-text-heading transition-colors tracking-wide">Archive</Link>
              <span className="text-text-muted text-[10px]">/</span>
              <Link href={`/archive/exams/previous-year-papers/${exam.id.toLowerCase()}`} className="text-[11px] md:text-[13px] font-bold text-text-muted hover:text-text-heading transition-colors tracking-wide">{exam.title}</Link>
              <span className="text-text-muted text-[10px]">/</span>
              <span className="text-[11px] md:text-[13px] font-bold text-accent tracking-wide truncate">{paper.year}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {profile?.username ? (
              <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <button onClick={handleSignIn} className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                <span>Sign In</span>
              </button>
            )}
            <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
          <div className="max-w-[800px] mx-auto px-6 py-12">
            
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-10">
                {logoUrl && (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                    <img src={logoUrl} alt={exam.title} className="w-full h-full object-contain grayscale-[0.2]" />
                  </div>
                )}
                <div>
                  <h1 className="text-[24px] md:text-[28px] font-black text-text-heading tracking-tight inconsolata-ui leading-tight">
                    {paperName}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="manrope-body text-[12px] font-bold text-text-muted">{exam.title} archive</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                    <span className="manrope-body text-[12px] font-bold text-accent">{paper.year} edition</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="inconsolata-ui text-[14px] font-bold text-text-heading">Question Paper</span>
                  {paper.questionPaper ? (
                    <a 
                      href={paper.questionPaperDriveId ? getDriveDownloadUrl(paper.questionPaperDriveId) : `/archive/${paper.questionPaper}`} 
                      download={!paper.questionPaperDriveId ? paper.questionPaper : undefined}
                      target={paper.questionPaperDriveId ? "_blank" : undefined}
                      rel={paper.questionPaperDriveId ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-4 text-[13px] font-black inconsolata-ui"
                    >
                      <Download className="w-3.5 h-3.5" /> download paper
                      {paper.questionPaperDriveId && <span className="text-[8px] opacity-60 ml-1">DRIVE</span>}
                    </a>
                  ) : (
                    <span className="text-[12px] font-bold text-text-muted italic">not available</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="inconsolata-ui text-[14px] font-bold text-text-heading">Answer Key / Solutions</span>
                  {paper.answerKey ? (
                    <a 
                      href={paper.answerKeyDriveId ? getDriveDownloadUrl(paper.answerKeyDriveId) : `/archive/${paper.answerKey}`} 
                      download={!paper.answerKeyDriveId ? paper.answerKey : undefined}
                      target={paper.answerKeyDriveId ? "_blank" : undefined}
                      rel={paper.answerKeyDriveId ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-4 text-[13px] font-black inconsolata-ui"
                    >
                      <Download className="w-3.5 h-3.5" /> download solutions
                      {paper.answerKeyDriveId && <span className="text-[8px] opacity-60 ml-1">DRIVE</span>}
                    </a>
                  ) : (
                    <span className="text-[12px] font-bold text-text-muted italic">not available</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex flex-wrap gap-6 mb-12">
                <button className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors inconsolata-ui">
                  <Share2 className="w-3.5 h-3.5" /> share
                </button>
                <button className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors inconsolata-ui">
                  <Bookmark className="w-3.5 h-3.5" /> save
                </button>
                <button className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors inconsolata-ui">
                  <Printer className="w-3.5 h-3.5" /> print
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-border">
                <h5 className="inconsolata-ui text-[12px] font-black text-text-muted mb-3 tracking-widest">academic note</h5>
                <p className="manrope-body text-[13px] text-text-muted leading-relaxed max-w-xl">
                  these materials are for educational use. solve under timed conditions to simulate the exam environment. eulerfold provides links to publicly available official resources.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
