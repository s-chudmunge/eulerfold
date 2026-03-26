"use client";

import React, { useState, useEffect } from 'react';
import { 
    GraduationCap, 
    ArrowRight,
    Globe,
    FileText,
    Menu,
    X,
    Plus,
    LayoutDashboard,
    Archive
} from 'lucide-react';
import Link from 'next/link';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { navigation, papers } from '../research-decoded/generatedData';
import { archiveData } from '../archive/generatedArchiveData';
import { exploreAPI } from '@/lib/api';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export default function LearnClient() {
    const [profile, setProfile] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [roadmapCount, setRoadmapCount] = useState<number | null>(null);

    const paperCount = Object.keys(papers).length;
    const archiveCount = archiveData.reduce((acc, cat) => acc + cat.entries.length, 0);
    const categoryCount = navigation.length;
    const previewCategories = navigation.slice(0, 3).map(c => c.title.split(' & ')[0].split(' ')[0].toUpperCase());

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                try {
                    const { data, error } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
                    if (!error && data) setProfile(data);
                } catch (e) {
                    console.log("Silent profile fetch failed", e);
                }
            }
        };
        checkUser();

        async function fetchRoadmapCount() {
            try {
                // Fetch explore roadmaps with a larger limit to get a better count for display
                const roadmaps = await exploreAPI.getExploreRoadmaps('', 0, 100);
                setRoadmapCount(roadmaps.length);
            } catch (e) {
                console.error("Failed to fetch roadmap count", e);
            }
        }
        fetchRoadmapCount();
    }, []);

    return (
        <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden`}>
            {/* Header */}
            <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link className="flex items-center group shrink-0" href="/">
                            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {profile?.username ? (
                            <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Dash</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <span className="hidden sm:inline">Sign In</span>
                                <span className="sm:hidden">Login</span>
                            </Link>
                        )}
                        <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
                    <div className="max-w-[800px] mx-auto px-6 py-10 md:py-16">
                        
                        <div className="mb-12">
                            <h1 className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-tight mb-2">Learning Directory</h1>
                            <p className="manrope-body text-[13px] text-text-muted">Explore foundational research, exam archives, and community roadmaps.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Research Link */}
                            <Link href="/research-decoded" className="group p-5 border border-border bg-background hover:bg-sidebar transition-all flex items-start gap-5">
                                <div className="w-10 h-10 flex items-center justify-center bg-callout-bg border border-border rounded group-hover:border-accent/40 transition-colors shrink-0">
                                    <FileText className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="inconsolata-ui text-[15px] font-bold text-text-heading group-hover:text-accent transition-colors">Research Decoded</h3>
                                        <span className="inconsolata-ui text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{paperCount} Papers</span>
                                    </div>
                                    <p className="manrope-body text-[12px] text-text-muted leading-relaxed mb-3">Foundational paper breakthroughs simplified for students.</p>
                                    <div className="flex items-center gap-2">
                                        {previewCategories.map((cat, i) => (
                                            <span key={i} className="inconsolata-ui text-[9px] font-bold text-text-muted/50 uppercase tracking-tight">
                                                {cat}
                                            </span>
                                        ))}
                                        <span className="inconsolata-ui text-[9px] font-bold text-text-muted/30 uppercase tracking-tight">+{categoryCount - 3} categories</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
                            </Link>

                            {/* Archive Link */}
                            <Link href="/archive/exams/previous-year-papers" className="group p-5 border border-border bg-background hover:bg-sidebar transition-all flex items-start gap-5">
                                <div className="w-10 h-10 flex items-center justify-center bg-callout-bg border border-border rounded group-hover:border-accent/40 transition-colors shrink-0">
                                    <Archive className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="inconsolata-ui text-[15px] font-bold text-text-heading group-hover:text-accent transition-colors">Previous Year Papers</h3>
                                        <span className="inconsolata-ui text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{archiveCount} Papers</span>
                                    </div>
                                    <p className="manrope-body text-[12px] text-text-muted leading-relaxed">Official question papers and answer keys for global competitive exams.</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
                            </Link>

                            {/* Explore Link */}
                            <Link href="/explore" className="group p-5 border border-border bg-background hover:bg-sidebar transition-all flex items-start gap-5">
                                <div className="w-10 h-10 flex items-center justify-center bg-callout-bg border border-border rounded group-hover:border-accent/40 transition-colors shrink-0">
                                    <Globe className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="inconsolata-ui text-[15px] font-bold text-text-heading group-hover:text-accent transition-colors">Global Roadmaps</h3>
                                        <span className="inconsolata-ui text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{roadmapCount || '...'} Community</span>
                                    </div>
                                    <p className="manrope-body text-[12px] text-text-muted leading-relaxed">Community learning paths built and verified by EulerFold peers.</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
