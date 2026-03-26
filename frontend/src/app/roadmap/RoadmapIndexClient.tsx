"use client";

import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard,
    Plus,
    Menu,
    X,
    Compass,
    Rocket,
    Search,
    ChevronDown,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import StarRating from '@/components/roadmap/StarRating';
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

export default function RoadmapIndexClient({ initialRoadmaps }: { initialRoadmaps: any[] }) {
    const [profile, setProfile] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(false);
    const mountTime = React.useRef(performance.now());

    useEffect(() => {
        const now = performance.now();
        console.log(`[Explore] Component mounted with ${initialRoadmaps.length} roadmaps. Time since page start: ${(now).toFixed(2)}ms`);
        
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
    }, []);

    const [firstMount, setFirstMount] = useState(true);

    useEffect(() => {
        const fetchFiltered = async () => {
            if (firstMount) {
                setFirstMount(false);
                return;
            }
            const startTime = performance.now();
            console.log(`[Explore] Starting filtered fetch: "${search}", sort: ${sortBy}`);
            setLoading(true);
            try {
                const data = await exploreAPI.getExploreRoadmaps(search, 0, 50, sortBy);
                const duration = performance.now() - startTime;
                console.log(`[Explore] Filtered fetch completed in ${duration.toFixed(2)}ms. Found ${data.length} results.`);
                setRoadmaps(data);
            } catch (e) {
                console.error("Filter fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchFiltered();
        }, search ? 300 : 0);

        return () => clearTimeout(timer);
    }, [search, sortBy]);

    return (
        <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden`}>
            {/* Header */}
            <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                            aria-expanded={isSidebarOpen}
                            className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                        >
                            {isSidebarOpen ? <X aria-hidden="true" focusable="false" className="w-5 h-5" /> : <Menu aria-hidden="true" focusable="false" className="w-5 h-5" />}
                        </button>
                        <Link className="flex items-center group shrink-0" href="/" aria-label="ΣulerFold Home">
                            <img src="/apple-touch-icon.png" alt="ΣulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                        <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block"></div>
                        <div className="flex items-center gap-2">
                            <Rocket aria-hidden="true" focusable="false" className="w-4 h-4 text-accent" />
                            <span className="text-[11px] md:text-[13px] font-bold text-text-muted uppercase tracking-widest truncate max-w-[100px] md:max-w-none">Directory</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {profile?.username ? (
                            <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <LayoutDashboard aria-hidden="true" focusable="false" className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Dash</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <span className="hidden sm:inline">Sign In</span>
                                <span className="sm:hidden">Login</span>
                            </Link>
                        )}
                        <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus aria-hidden="true" focusable="false" className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
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

                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
                    <div className="max-w-[900px] mx-auto px-6 pt-6 pb-20">
                        <header className="mb-8">
                            <div className="inconsolata-ui flex items-center gap-2 text-text-muted mb-1 text-[12px] font-bold uppercase tracking-widest">
                                <span className="bg-sidebar dark:bg-white/5 px-2 py-0.5 rounded">Directory</span>
                                <span className="opacity-30">/</span>
                                <span className="italic opacity-60">Public Learning Paths</span>
                            </div>
                            <h1 className="inconsolata-ui text-xl md:text-2xl font-bold tracking-tight mb-4 text-text-heading">
                                Discover
                            </h1>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-text-heading transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by topic, subject, or goal..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--text-heading)] transition-all manrope-body"
                                    />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="relative">
                                        <select 
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-transparent border border-border rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:border-[var(--text-heading)] transition-all manrope-body cursor-pointer min-w-[140px]"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="highest_rated">Highest Rated</option>
                                            <option value="most_cloned">Most Cloned</option>
                                        </select>
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className={`grid grid-cols-1 gap-y-0.5 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            {roadmaps.length > 0 ? (
                                roadmaps.map((roadmap: any) => (
                                    <div key={roadmap.id} className="group border-b border-border dark:border-white/[0.03] py-3 transition-colors hover:bg-sidebar dark:hover:bg-background/[0.01] px-2 rounded-lg">
                                        <Link 
                                            href={`/roadmap/${roadmap.slug}`}
                                            className="block"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                                                <div className="flex items-baseline gap-3 min-w-0">
                                                    <span className="inconsolata-ui text-[15px] font-bold text-text-heading group-hover:underline tracking-tight truncate">
                                                        {roadmap.title}
                                                    </span>
                                                    {roadmap.average_rating > 0 && (
                                                        <StarRating 
                                                            rating={roadmap.average_rating} 
                                                            count={roadmap.rating_count} 
                                                            size={12} 
                                                            showValue={false}
                                                            className="scale-[0.85] origin-left"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="inconsolata-ui text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        {roadmap.time_value} {roadmap.time_unit}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                                    <span className="inconsolata-ui text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        {roadmap.clone_count || 0} clones
                                                    </span>
                                                </div>
                                            </div>
                                            {roadmap.goal && (
                                                <p className="manrope-body text-[12px] text-gray-500 mt-1 line-clamp-1 font-medium italic opacity-80">
                                                    {roadmap.goal}
                                                </p>
                                            )}
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-sidebar/30 dark:bg-white/[0.01]">
                                    <p className="manrope-body text-gray-400 text-sm font-medium">No learning paths found matching your criteria.</p>
                                    <button onClick={() => {setSearch(''); setSortBy('newest');}} className="inconsolata-ui text-accent text-xs font-bold mt-4 inline-block uppercase tracking-widest hover:underline">
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>

                        <footer className="mt-16 pt-8 border-t border-border dark:border-white/[0.03]">
                            <p className="inconsolata-ui text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-40 text-center">
                                ΣulerFold — Roadmap Directory v1.1                            </p>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
