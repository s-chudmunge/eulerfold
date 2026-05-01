"use client"

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Search, 
  Copy, 
  Flag, 
  X,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Trophy,
  Filter,
  LayoutDashboard,
  Code,
  Cpu,
  BarChart3,
  Cloud,
  Shield,
  Palette,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Compass,
  Layers,
  GitBranch,
  Terminal,
  Server,
  Monitor,
  Smartphone,
  Gamepad2,
  Infinity,
  Database,
  Binary,
  Coins,
  Network,
  Atom
} from 'lucide-react';
import { exploreAPI, ExploreRoadmap, coinsAPI, LeaderboardEntry } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import StarRating from '@/components/roadmap/StarRating';
import VerifiedBadge from '@/components/VerifiedBadge';
import { getCategory } from '@/lib/roadmapUtils';

const CATEGORY_METADATA: Record<string, { icon: any }> = {
    'all': { icon: LayoutDashboard },
    'Programming': { icon: Code },
    'Rust': { icon: Terminal },
    'Go': { icon: Terminal },
    'Python': { icon: Binary },
    'Java': { icon: Binary },
    'C++': { icon: Binary },
    'Frontend': { icon: Monitor },
    'React': { icon: Layers },
    'Vue/Angular': { icon: Layers },
    'Backend': { icon: Server },
    'SQL & Database': { icon: Database },
    'Terminal & CLI': { icon: Terminal },
    'AI/ML': { icon: Cpu },
    'Data Science': { icon: BarChart3 },
    'Data Engineering': { icon: Database },
    'System Design': { icon: Network },
    'Cloud': { icon: Cloud },
    'DevOps': { icon: Infinity },
    'SRE': { icon: Shield },
    'Security': { icon: Shield },
    'Mobile': { icon: Smartphone },
    'iOS/Android': { icon: Smartphone },
    'Flutter': { icon: Smartphone },
    'Blockchain': { icon: Coins },
    'Quantum': { icon: Infinity },
    'Science': { icon: Atom },
    'Game Dev': { icon: Gamepad2 },
    'ECE & Hardware': { icon: Cpu },
    'Embedded': { icon: Binary },
    'Robotics': { icon: Cpu },
    'AR/VR': { icon: Monitor },
    'Design': { icon: Palette },
    'Product Management': { icon: Briefcase },
    'Marketing': { icon: TrendingUp },
    'Business': { icon: Briefcase },
    'Exam Prep': { icon: GraduationCap },
    'Career': { icon: Compass },
    'Open Source': { icon: GitBranch },
    'Other': { icon: Layers },
};

const CategoryIcon = ({ category, className = "w-3.5 h-3.5" }: { category: string, className?: string }) => {
    const Icon = CATEGORY_METADATA[category]?.icon || CATEGORY_METADATA['Other'].icon;
    return <Icon className={className} />;
};

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        onParams(searchParams);
    }, [searchParams, onParams]);
    return null;
}

export default function ExploreClient({ 
    initialRoadmaps = [], 
    initialLeaderboard = [] 
}: { 
    initialRoadmaps?: ExploreRoadmap[], 
    initialLeaderboard?: LeaderboardEntry[] 
}) {
    const router = useRouter();
    const { user: authUser } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [reporting, setReporting] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Filtering & Sorting State
    const [sortBy, setSortBy] = useState('alphabetical');
    const [filter, setFilter] = useState('all');

    const handleSearchParams = React.useCallback((params: URLSearchParams) => {
        const search = params.get('search') || params.get('q');
        if (search) setSearchQuery(search);
        
        const cat = params.get('category');
        if (cat && CATEGORY_METADATA[cat]) {
            setFilter(cat);
        }

        const sort = params.get('sort');
        if (sort === 'newest' || sort === 'highest_rated' || sort === 'most_cloned' || sort === 'alphabetical') {
            setSortBy(sort);
        }
    }, []);

    const queryClient = useQueryClient();

    // 1. Roadmaps Query
    const { data: roadmaps = [], isLoading: roadmapsLoading } = useQuery({
        queryKey: ['explore-roadmaps', debouncedSearch, sortBy, authUser?.id],
        queryFn: () => exploreAPI.getExploreRoadmaps(debouncedSearch, 0, 100, sortBy),
        initialData: (debouncedSearch === '' && sortBy === 'alphabetical') ? initialRoadmaps : undefined,
        staleTime: 5 * 60 * 1000,
    });

    // 2. Leaderboard Query
    const { data: leaderboardData } = useQuery({
        queryKey: ['explore-leaderboard'],
        queryFn: () => coinsAPI.getLeaderboard(),
        initialData: initialLeaderboard.length > 0 ? { top_users: initialLeaderboard, user_rank: null } : undefined,
        staleTime: 5 * 60 * 1000,
    });

    const leaderboard = (leaderboardData?.top_users || []).slice(0, 5);

    const filteredRoadmaps = React.useMemo(() => {
        let result = roadmaps.filter(r => {
            if (filter === 'all') return true;
            return getCategory(r.subject || '') === filter;
        });

        if (sortBy === 'alphabetical') {
            result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return result;
    }, [roadmaps, filter, sortBy]);

    const handleReport = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const executeReport = async () => {
            if (!authUser) {
                router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
                return;
            }

            if (!reportReason) {
                setReporting(id);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                await exploreAPI.reportRoadmap(id, reportReason, session.access_token);
                setSuccessMessage('Thank you for your report.');
                setReporting(null);
                setReportReason('');
                queryClient.invalidateQueries({ queryKey: ['explore-roadmaps'] });
            } catch (err: any) {
                setError(err.message);
            }
        };
        executeReport();
    };

    return (
        <div className="bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
            <Suspense fallback={null}>
                <SearchParamsHandler onParams={handleSearchParams} />
            </Suspense>
            <main className="max-w-[900px] mx-auto px-6 pt-6 pb-12">
                <header className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="w-3.5 h-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find a goal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-callout-bg border border-border rounded-full py-1.5 pl-9 pr-4 manrope-body text-[12px] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm focus:bg-background dark:focus:bg-[#1a1a1a]"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-transparent border border-border rounded-lg pl-8 pr-7 py-1.5 text-[11px] font-bold focus:outline-none focus:border-[var(--text-heading)] transition-all manrope-body cursor-pointer min-w-[120px]"
                                >
                                    <option value="alphabetical">Alphabetical (A-Z)</option>
                                    <option value="newest">Newest First</option>
                                    <option value="highest_rated">Highest Rated</option>
                                    <option value="most_cloned">Most Popular</option>
                                </select>
                                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Leaderboard Strip - Compact */}
                {leaderboard.length > 0 && (
                    <div className="mb-8 flex items-center gap-4 py-2 px-4 bg-sidebar dark:bg-white/[0.01] border border-border rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-text-muted shrink-0 inconsolata-ui">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span>Top Contributors</span>
                        </div>
                        <div className="h-3 w-px bg-[var(--border)] shrink-0"></div>
                        <div className="flex items-center gap-6">
                            {leaderboard.map((entry, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-text-heading">@{entry.username}</span>
                                    <span className="inconsolata-ui text-[10px] font-black text-teal-700 dark:text-teal-400">{entry.eulercoins}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Bar - Compact */}
                <div className="mb-6 flex flex-wrap gap-1.5">
                    {Object.keys(CATEGORY_METADATA).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold tracking-normal transition-all border
                                ${filter === cat 
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                : 'bg-transparent text-gray-500 border-border hover:border-[var(--text-muted)]'
                            }`}
                        >
                            <CategoryIcon category={cat} className="w-3 h-3 stroke-[2px]" />
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>

                {/* Professional Table View - Tightened heights */}
                <div className="bg-background border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-border bg-sidebar/50 dark:bg-white/[0.01]">
                                <th scope="col" className="w-[60%] px-4 py-2.5 text-[10px] font-bold tracking-wide text-gray-400 inconsolata-ui">Roadmap</th>
                                <th scope="col" className="hidden md:table-cell w-[20%] px-4 py-2.5 text-[10px] font-bold tracking-wide text-gray-400 inconsolata-ui">Duration</th>
                                <th scope="col" className="w-[20%] px-4 py-2.5 text-[10px] font-bold tracking-wide text-gray-400 inconsolata-ui text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-100 dark:divide-white/[0.03] transition-opacity ${roadmapsLoading ? 'opacity-50' : 'opacity-100'}`}>
                            {filteredRoadmaps.map((r) => {
                                const cat = getCategory(r.subject || '');
                                return (
                                    <tr key={r.id} className="group hover:bg-sidebar/50 dark:hover:bg-background/[0.01] transition-all">
                                        <td className="px-4 py-3">
                                            <Link href={`/roadmap/${r.slug}`} className="flex flex-col min-w-0 group/title">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded bg-sidebar dark:bg-white/[0.02] border border-border dark:border-white/[0.05] text-gray-400 shrink-0">
                                                        <CategoryIcon category={cat} className="w-3.5 h-3.5 stroke-[1.5px]" />
                                                    </div>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-[14px] font-bold text-text-heading truncate group-hover/title:underline">
                                                            {r.title}
                                                        </span>
                                                        {r.username === 'eulerfold' && <VerifiedBadge size={18} className="shrink-0" />}
                                                        {r.average_rating > 0 && (
                                                            <StarRating 
                                                                rating={r.average_rating} 
                                                                minimal={true}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pl-9 mt-0.5">
                                                    <span className="text-[9px] font-bold text-gray-400 tracking-normal">{cat}</span>
                                                    <span className="text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">by @{r.username || r.author}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3">
                                            <span className="inconsolata-ui text-[12px] font-bold text-gray-500">
                                                {r.time_value} {r.time_unit}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="group-hover:hidden flex items-center justify-end gap-2 text-[12px] font-bold text-gray-400 inconsolata-ui">
                                                <Copy className="h-3 w-3 opacity-50" />
                                                {r.clone_count}
                                            </div>
                                            <div className="hidden group-hover:flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={(e) => handleReport(e, r.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Flag className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredRoadmaps.length === 0 && !roadmapsLoading && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-20 text-center text-gray-400 italic manrope-body text-sm">
                                        No roadmaps found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Error/Success Alerts */}
            {error && (
                <div className="fixed bottom-6 right-6 z-[120] bg-red-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">{error}</span>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
            )}
            {successMessage && (
                <div className="fixed bottom-6 right-6 z-[120] bg-teal-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Report Prompt */}
            {reporting !== null && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-border">
                        <h3 className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-normal mb-6">Report Roadmap</h3>
                        <div className="space-y-2 mb-8">
                            {['Inappropriate content', 'Spam or misleading', 'Broken resources', 'Other'].map((reason) => (
                                <button 
                                    key={reason} 
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border text-[13px] font-bold transition-all ${reportReason === reason ? 'border-teal-700 bg-teal-700/5 text-teal-700' : 'border-border text-gray-500'}`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={(e) => handleReport(e, reporting)} disabled={!reportReason} className="w-full py-3 bg-red-600 text-white rounded-lg text-[12px] font-bold tracking-wide disabled:opacity-50">Submit Report</button>
                            <button onClick={() => setReporting(null)} className="w-full py-3 text-[10px] font-bold text-gray-400 tracking-wide">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
