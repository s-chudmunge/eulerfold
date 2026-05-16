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
  Atom,
  Loader2,
  Sparkles,
  MessageSquare,
  Globe,
  Zap
} from 'lucide-react';
import { exploreAPI, ExploreRoadmap, coinsAPI, LeaderboardEntry } from '@/lib/api';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import StarRating from '@/components/roadmap/StarRating';
import VerifiedBadge from '@/components/VerifiedBadge';
import { getCategory } from '@/lib/roadmapUtils';
import ResearchLibrarySidebar from '@/components/research-lab/ResearchLibrarySidebar';
import CommunityRoadmapBanner from '@/components/landing/CommunityRoadmapBanner';
import GoalGeneratorModal from '@/components/landing/GoalGeneratorModal';

const CATEGORY_METADATA: Record<string, { icon: any }> = {
    'all': { icon: LayoutDashboard },
    'Programming': { icon: Code },
    'TypeScript': { icon: Binary },
    'Rust': { icon: Terminal },
    'Go': { icon: Terminal },
    'Python': { icon: Binary },
    'Java': { icon: Binary },
    'C++': { icon: Binary },
    'Frontend': { icon: Monitor },
    'React': { icon: Layers },
    'Vue/Angular': { icon: Layers },
    'Backend': { icon: Server },
    'Node.js': { icon: Server },
    'SQL & Database': { icon: Database },
    'Terminal & CLI': { icon: Terminal },
    'AI/ML': { icon: Cpu },
    'Computer Vision': { icon: Monitor },
    'LLMs & Generative AI': { icon: Sparkles },
    'NLP': { icon: MessageSquare },
    'Deep Learning': { icon: Network },
    'Data Science': { icon: BarChart3 },
    'Data Engineering': { icon: Database },
    'System Design': { icon: Network },
    'Cloud': { icon: Cloud },
    'AWS/Azure/GCP': { icon: Cloud },
    'DevOps': { icon: Infinity },
    'Docker & K8s': { icon: Layers },
    'SRE': { icon: Shield },
    'Security': { icon: Shield },
    'Cybersecurity': { icon: Shield },
    'Mobile': { icon: Smartphone },
    'iOS/Android': { icon: Smartphone },
    'Flutter': { icon: Smartphone },
    'Blockchain': { icon: Coins },
    'Web3': { icon: Globe },
    'Quantum': { icon: Infinity },
    'Science': { icon: Atom },
    'Physics': { icon: Atom },
    'Mathematics': { icon: Binary },
    'Game Dev': { icon: Gamepad2 },
    'Unity/Unreal': { icon: Gamepad2 },
    'ECE & Hardware': { icon: Cpu },
    'Embedded': { icon: Binary },
    'IoT': { icon: Network },
    'Robotics': { icon: Cpu },
    'AR/VR': { icon: Monitor },
    'Design': { icon: Palette },
    'UI/UX': { icon: Palette },
    'Product Management': { icon: Briefcase },
    'Marketing': { icon: TrendingUp },
    'Business': { icon: Briefcase },
    'Finance': { icon: Coins },
    'JEE': { icon: GraduationCap },
    'NEET': { icon: GraduationCap },
    'UPSC': { icon: GraduationCap },
    'GATE': { icon: GraduationCap },
    'CAT': { icon: GraduationCap },
    'CLAT': { icon: GraduationCap },
    'GRE': { icon: GraduationCap },
    'GMAT': { icon: GraduationCap },
    'SAT': { icon: GraduationCap },
    'Exam Prep': { icon: GraduationCap },
    'Career': { icon: Compass },
    'Productivity': { icon: Zap },
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
    const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
    
    // Filtering & Sorting State
    const [sortBy, setSortBy] = useState('newest');
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
    const PAGE_SIZE = 100;

    // 1. Roadmaps Query
    const { 
        data: infiniteData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        isLoading: roadmapsLoading 
    } = useInfiniteQuery({
        queryKey: ['explore-roadmaps', debouncedSearch, sortBy, authUser?.id],
        queryFn: ({ pageParam = 0 }) => exploreAPI.getExploreRoadmaps(debouncedSearch, pageParam as number, PAGE_SIZE, sortBy),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
        },
        initialData: (debouncedSearch === '' && sortBy === 'newest') ? { pages: [initialRoadmaps], pageParams: [0] } : undefined,
        staleTime: 5 * 60 * 1000,
        initialPageParam: 0,
    });

    const roadmaps = React.useMemo(() => {
        return infiniteData?.pages.flat() || [];
    }, [infiniteData]);

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
            <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-12">
                <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                    
                    <main className="flex-1 min-w-0">
                        <header className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="inconsolata-ui text-3xl font-black text-text-heading tracking-tight mb-2">Explore Roadmaps</h1>
                                    <p className="manrope-body text-[14px] text-text-muted font-medium">Discover and clone high-signal learning paths from the community.</p>
                                </div>
                                <button 
                                    onClick={() => setIsRoadmapModalOpen(true)}
                                    className="bg-accent text-white px-6 py-2.5 rounded-xl text-[12px] font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20"
                                >
                                    Create New Roadmap
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Search by subject, goal, or technology..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-sidebar/50 border border-border rounded-2xl py-3 pl-10 pr-4 manrope-body text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all focus:bg-background shadow-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="relative">
                                        <select 
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-sidebar/50 border border-border rounded-2xl pl-10 pr-8 py-3 text-[12px] font-bold focus:outline-none focus:border-[var(--text-heading)] transition-all manrope-body cursor-pointer min-w-[160px]"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="most_cloned">Most Popular</option>
                                            <option value="highest_rated">Highest Rated</option>
                                            <option value="alphabetical">Alphabetical</option>
                                        </select>
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Leaderboard Strip - Compact & Refined */}
                        {leaderboard.length > 0 && (
                            <div className="mb-8 flex items-center gap-4 py-2 px-5 bg-teal-500/[0.03] border border-teal-500/10 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-700 shrink-0 inconsolata-ui">
                                    <Trophy className="h-3 w-3" />
                                    <span>Top Builders</span>
                                </div>
                                <div className="h-4 w-px bg-teal-500/20 shrink-0"></div>
                                <div className="flex items-center gap-8">
                                    {leaderboard.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push(`/u/${entry.username}`)}>
                                            <span className="text-[12px] font-bold text-text-heading group-hover:text-accent transition-colors">@{entry.username}</span>
                                            <span className="inconsolata-ui text-[10px] font-black text-teal-600/60">{entry.eulercoins}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filter Bar - Horizontal Scroll with Fade */}
                        <div className="mb-8 relative group">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                                {Object.keys(CATEGORY_METADATA).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold tracking-tight transition-all border whitespace-nowrap
                                            ${filter === cat 
                                            ? 'bg-text-heading text-background border-text-heading shadow-md shadow-black/5 scale-[1.02]' 
                                            : 'bg-sidebar/30 text-text-muted border-border hover:border-text-muted hover:bg-sidebar/50'
                                        }`}
                                    >
                                        <CategoryIcon category={cat} className={`w-3.5 h-3.5 ${filter === cat ? 'opacity-100' : 'opacity-50'}`} />
                                        {cat === 'all' ? 'All Paths' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Professional Table View - Modernized */}
                        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="border-b border-border bg-sidebar/20">
                                        <th scope="col" className="w-[65%] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-text-muted inconsolata-ui opacity-60">Learning Roadmap</th>
                                        <th scope="col" className="hidden md:table-cell w-[18%] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-text-muted inconsolata-ui opacity-60">Duration</th>
                                        <th scope="col" className="w-[17%] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-text-muted inconsolata-ui opacity-60 text-right">Reach</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-border/50 transition-opacity ${roadmapsLoading ? 'opacity-50' : 'opacity-100'}`}>
                                    {filteredRoadmaps.map((r) => {
                                        const cat = getCategory(r.subject || '');
                                        return (
                                            <tr key={r.id} className="group hover:bg-sidebar/30 transition-all cursor-pointer" onClick={() => router.push(`/roadmap/${r.slug}`)}>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar border border-border text-text-muted shrink-0 group-hover:scale-110 transition-transform group-hover:border-accent/30 group-hover:text-accent">
                                                            <CategoryIcon category={cat} className="w-5 h-5 stroke-[1.5px]" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-[15px] font-bold text-text-heading truncate group-hover:text-accent transition-colors">
                                                                    {r.title}
                                                                </span>
                                                                {r.username === 'eulerfold' && <VerifiedBadge size={16} className="shrink-0" />}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700/60 inconsolata-ui">{cat}</span>
                                                                <span className="text-[10px] font-medium text-text-muted/50">•</span>
                                                                <span className="text-[12px] font-medium text-text-muted">by @{r.username || r.author}</span>
                                                                {r.average_rating > 0 && (
                                                                    <div className="flex items-center gap-2 pl-2 border-l border-border">
                                                                        <StarRating rating={r.average_rating} minimal={true} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-5">
                                                    <span className="inconsolata-ui text-[13px] font-bold text-text-muted">
                                                        {r.time_value} {r.time_unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[13px] font-black text-text-heading inconsolata-ui">{r.clone_count}</span>
                                                            <span className="text-[9px] font-black uppercase tracking-tighter text-text-muted opacity-50">Clones</span>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleReport(e, r.id); }}
                                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

                        {/* Load More Action */}
                        {hasNextPage && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sidebar border border-border text-[11px] font-bold tracking-wide hover:bg-background hover:border-text-muted transition-all disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>Load More</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar - Dynamic Info */}
                    <div className="w-full lg:w-[320px] shrink-0 pt-4 lg:sticky lg:top-32 self-start space-y-8">
                        <CommunityRoadmapBanner onOpenModal={() => setIsRoadmapModalOpen(true)} />
                        <ResearchLibrarySidebar />
                    </div>
                </div>
            </div>

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

            <GoalGeneratorModal 
                isOpen={isRoadmapModalOpen} 
                onClose={() => setIsRoadmapModalOpen(false)} 
            />
        </div>
    );
}
