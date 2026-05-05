"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Inconsolata, Manrope } from 'next/font/google';

// Optimized lucide imports
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Target from 'lucide-react/dist/esm/icons/target';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Check from 'lucide-react/dist/esm/icons/check';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Search from 'lucide-react/dist/esm/icons/search';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Award from 'lucide-react/dist/esm/icons/award';
import Settings from 'lucide-react/dist/esm/icons/settings';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Coins from 'lucide-react/dist/esm/icons/coins';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { coinsAPI, EulerCoinBalance, authAPI, roadmapsAPI, RoadmapMe, sessionsAPI, profileAPI } from '@/lib/api';
import IntensityHeatmap from '@/components/dashboard/IntensityHeatmap';
import { format } from 'date-fns';
import AppSidebar from '@/components/AppSidebar';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

// Dynamic imports for Recharts-heavy components
const ActivityChart = dynamic(() => import('@/components/dashboard/ActivityChart'), { ssr: false });
const TechnicalSignature = dynamic(() => import('@/components/dashboard/TechnicalSignature'), { ssr: false });
const MilestoneLedger = dynamic(() => import('@/components/dashboard/MilestoneLedger'), { ssr: false });

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

export default function DashboardPage() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const [roadmaps, setRoadmaps] = useState<RoadmapMe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [coinData, setCoinData] = useState<EulerCoinBalance | null>(null);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [activeDays, setActiveDays] = useState(0);
    const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Onboarding
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.replace('/?message=login_required');
        }
    }, [authLoading, authUser, router]);

    useEffect(() => {
        let isMounted = true;
        
        async function loadData() {
            if (!authUser) return;

            try {
                // Get token for background API calls
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                // 1. Basic Profile - use maybeSingle() to avoid 406 error if profile is missing
                if (!authUser.supabase_uid) {
                    throw new Error("No Supabase UID found for user");
                }
                
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('supabase_uid', authUser.supabase_uid)
                    .maybeSingle();
                
                if (profileError) {
                    console.error("Profile fetch error:", profileError);
                }

                let activeProfile = userProfile;

                if (!userProfile) {
                    // Fallback: Try backend /auth/me which creates transient profile if missing
                    try {
                        const me = await authAPI.getMe();
                        if (isMounted) {
                            setProfile(me);
                            activeProfile = me as any;
                            if (!me.username || me.username.startsWith('user_') || !me.onboarding_completed) {
                                setShowOnboarding(true);
                            }
                        }
                    } catch (authMeErr) {
                        console.error("Backend auth/me failed:", authMeErr);
                        if (isMounted) setError("Profile not found. Please try logging out and in again.");
                    }
                } else {
                    if (isMounted) {
                        setProfile(userProfile);
                        if (!userProfile.username || userProfile.username.startsWith('user_') || !userProfile.onboarding_completed) {
                            setShowOnboarding(true);
                        }
                    }
                }

                if (!isMounted) return;

                // 2. Full Technical Identity (Skills, Submissions, etc.)
                if (activeProfile?.username) {
                    try {
                        const fullProfile = await profileAPI.getPublicProfile(activeProfile.username);
                        if (isMounted && fullProfile) {
                            // Merge data to preserve is_pro and credits if they exist in state
                            setProfile((prev: any) => ({ ...prev, ...fullProfile }));
                            if (fullProfile.submissions) {
                                setAllSubmissions(fullProfile.submissions);
                            }
                        }
                    } catch (err) {
                        console.error("❌ Failed to load technical identity:", err);
                    }
                }

                if (token && activeProfile) {
                    coinsAPI.getBalance(token).then(data => {
                        if (isMounted) setCoinData(data);
                    }).catch(console.error);
                }
                
                const myRoadmaps = await roadmapsAPI.getMyRoadmaps();
                if (isMounted) setRoadmaps(myRoadmaps);

                sessionsAPI.getTotalTime().then(data => {
                    if (isMounted) {
                        setTotalSeconds(data.total_seconds);
                        setActiveDays(data.active_days);
                    }
                }).catch(console.error);

                sessionsAPI.getWeeklyStats().then(data => {
                    if (isMounted) setWeeklyStats(data);
                }).catch(console.error);
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadData();
        return () => { isMounted = false; };
    }, [authUser]);

    const handleDeleteRoadmap = async (id: number) => {
        setDeleting(true);
        try {
            await roadmapsAPI.deleteRoadmap(id);
            setRoadmaps(prev => prev.filter(r => r.id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: 'active' | 'completed' | 'archived' | 'quit') => {
        try {
            await roadmapsAPI.updateStatus(id, status);
            setRoadmaps(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const totalTimeInvested = totalSeconds / 3600;

    // Filter verified skills for Technical Signature - Reactive
    const verifiedSkills = React.useMemo(() => profile?.skills || [], [profile]);

    if (authLoading || (loading && !profile)) return (
        <div className="fixed inset-0 bg-background flex flex-col">
            <header className="h-[48px] border-b border-border bg-header animate-pulse" />
            <div className="flex flex-1">
                <aside className="w-[260px] border-r border-border bg-sidebar hidden lg:block animate-pulse" />
                <main className="flex-1 p-8 space-y-8 max-w-[1000px] mx-auto w-full">
                    <div className="h-4 w-32 bg-callout-bg border border-border rounded animate-pulse" />
                    <div className="h-64 w-full bg-callout-bg border border-border rounded-xl animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-48 bg-callout-bg border border-border rounded-xl animate-pulse" />
                        <div className="h-48 bg-callout-bg border border-border rounded-xl animate-pulse" />
                    </div>
                </main>
            </div>
        </div>
    );

    return (
        <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden`}>
            {/* Header */}
            <header 
                style={{ top: 'var(--announcement-height, 0px)' }}
                className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 fixed inset-x-0 transition-all duration-500 ease-in-out"
            >
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link className="flex items-center group shrink-0" href="/" aria-label="EulerFold Home">
                            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {profile?.is_pro && (
                            <div className="hidden sm:flex items-center px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                                <span className="inconsolata-ui text-[9px] font-black text-accent uppercase tracking-tighter">Pro Mode</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-text-muted px-2 py-1 rounded bg-callout-bg border border-border">
                            <CreditCard className="w-3 h-3" />
                            <span className="inconsolata-ui text-[10px] font-bold">{profile?.roadmap_credits || 0}</span>
                        </div>
                        {profile?.username && (
                            <Link 
                                href={`/u/${profile.username}`}
                                className="text-[10px] md:text-[11px] font-bold text-text-primary hover:text-text-heading transition-colors flex items-center gap-1.5  tracking-wide"
                            >
                                <ExternalLink className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Public Profile</span>
                                <span className="sm:hidden">Profile</span>
                            </Link>
                        )}
                        <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div 
                style={{ marginTop: 'calc(48px + var(--announcement-height, 0px))' }}
                className="flex flex-1 relative overflow-hidden h-full transition-all duration-500 ease-in-out"
            >
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    header={
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-callout-bg border border-border rounded-full flex items-center justify-center text-lg font-black text-text-heading overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.display_name?.[0] || 'M'
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-text-heading truncate">{profile?.display_name || 'Explorer'}</p>
                                <p className="text-[11px] font-medium text-text-muted truncate">@{profile?.username || 'eulerfold'}</p>
                            </div>
                        </div>
                    }
                >
                </AppSidebar>
                {/* Main Content */}
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
                    <div className="max-w-[1000px] mx-auto px-6 pt-8 pb-12">
                        
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500 text-[12px] font-bold  tracking-normal inconsolata-ui">
                                <AlertCircle className="h-4 w-4 mr-3 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Activity Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="inconsolata-ui text-[0.7rem] font-[var(--font-weight-bold)] text-text-muted  tracking-wide">Activity</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>
                            <div className="bg-callout-bg border border-callout-border rounded-xl p-6">
                                <ActivityChart roadmaps={roadmaps} profile={profile} />
                            </div>
                        </section>

                        {/* Objectives Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="inconsolata-ui text-[0.7rem] font-[var(--font-weight-bold)] text-text-muted  tracking-wide">Active Roadmaps</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>
                            
                            <div className="border-t border-border divide-y divide-[var(--border)]">
                                {roadmaps.filter(r => r.model !== 'manual-build').length > 0 ? (
                                    roadmaps.filter(r => r.model !== 'manual-build').map((r) => (
                                        <div key={r.id} className={`group flex flex-col md:flex-row md:items-center gap-4 py-2 hover:bg-sidebar/50 dark:hover:bg-background/[0.01] transition-colors ${r.status === 'archived' || r.status === 'quit' ? 'opacity-60' : ''}`}>
                                            {/* Title & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/roadmap/${r.slug || r.id}`} className="hover:opacity-70 transition-opacity min-w-0">
                                                        <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading truncate tracking-normal">
                                                            {r.title}
                                                        </h3>
                                                    </Link>
                                                    {r.is_public && (
                                                        <div className="flex items-center px-1.5 py-0.5 rounded bg-blue-500/5 border border-blue-500/20">
                                                            <span className="inconsolata-ui text-[8px] font-black text-blue-500 uppercase tracking-tighter">Public</span>
                                                        </div>
                                                    )}
                                                    {r.cloned_from && (
                                                        <div className="flex items-center px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/20">
                                                            <span className="inconsolata-ui text-[8px] font-black text-amber-500 uppercase tracking-tighter">Cloned</span>
                                                        </div>
                                                    )}
                                                    {r.status && r.status !== 'active' && (
                                                        <div className={`flex items-center px-1.5 py-0.5 rounded border ${
                                                            r.status === 'completed' ? 'bg-teal-500/5 border-teal-500/20 text-teal-600' :
                                                            r.status === 'archived' ? 'bg-zinc-500/5 border-zinc-500/20 text-zinc-500' :
                                                            r.status === 'quit' ? 'bg-red-500/5 border-red-500/20 text-red-500' :
                                                            'bg-amber-500/5 border-amber-500/20 text-amber-600'
                                                        }`}>
                                                            <span className="inconsolata-ui text-[8px] font-black uppercase tracking-tighter">{r.status.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Progress - Minimal Percentage */}
                                            <div className="hidden md:flex items-center gap-2 px-6 shrink-0 border-x border-border h-6">
                                                <span className="text-[11px] font-bold text-text-heading inconsolata-ui">{r.progress?.percent || 0}%</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Link
                                                    href={`/roadmap/${r.slug || r.id}/learn`}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all ${
                                                        r.status === 'archived' || r.status === 'quit' 
                                                        ? 'bg-callout-bg border border-border text-text-muted hover:text-text-heading' 
                                                        : 'bg-[var(--text-heading)] text-[var(--bg-main)] hover:opacity-90'
                                                    }`}
                                                >
                                                    {(r.progress?.percent || 0) > 0 ? 'Resume' : 'Start'}
                                                </Link>
                                                
                                                {r.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(r.id, 'archived')}
                                                        className="px-2.5 py-1 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all hidden sm:block"
                                                        title="Archive Roadmap"
                                                    >
                                                        Archive
                                                    </button>
                                                )}

                                                {r.status === 'archived' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(r.id, 'active')}
                                                        className="px-2.5 py-1 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all"
                                                    >
                                                        Re-activate
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/roadmap/${r.slug || r.id}`}
                                                    className="px-2.5 py-1 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all"
                                                >
                                                    View
                                                </Link>
                                                <button 
                                                    onClick={() => setDeleteConfirm(r.id)}
                                                    className="text-text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/5"
                                                    title="Delete Roadmap"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-callout-bg/30 border border-dashed border-callout-border rounded-xl">
                                        <p className="manrope-body text-[0.8rem] text-text-muted italic">No active roadmaps.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="inconsolata-ui text-[0.7rem] font-[var(--font-weight-bold)] text-text-muted  tracking-wide">Independent Projects</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>
                            
                            <div className="border-t border-border divide-y divide-[var(--border)]">
                                {roadmaps.filter(r => r.model === 'manual-build').length > 0 ? (
                                    roadmaps.filter(r => r.model === 'manual-build').map((r) => (
                                        <div key={r.id} className={`group flex flex-col md:flex-row md:items-center gap-4 py-2 hover:bg-sidebar/50 dark:hover:bg-background/[0.01] transition-colors ${r.status === 'archived' || r.status === 'quit' ? 'opacity-60' : ''}`}>
                                            {/* Title & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/project/${r.slug || r.id}`} className="hover:opacity-70 transition-opacity min-w-0">
                                                        <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading truncate tracking-normal">
                                                            {r.title}
                                                        </h3>
                                                    </Link>
                                                    {r.is_public && (
                                                        <div className="flex items-center px-1.5 py-0.5 rounded bg-blue-500/5 border border-blue-500/20">
                                                            <span className="inconsolata-ui text-[8px] font-black text-blue-500 uppercase tracking-tighter">Public</span>
                                                        </div>
                                                    )}
                                                    {r.status && r.status !== 'active' && (
                                                        <div className={`flex items-center px-1.5 py-0.5 rounded border ${
                                                            r.status === 'completed' ? 'bg-teal-500/5 border-teal-500/20 text-teal-600' :
                                                            r.status === 'archived' ? 'bg-zinc-500/5 border-zinc-500/20 text-zinc-500' :
                                                            r.status === 'quit' ? 'bg-red-500/5 border-red-500/20 text-red-500' :
                                                            'bg-amber-500/5 border-amber-500/20 text-amber-600'
                                                        }`}>
                                                            <span className="inconsolata-ui text-[8px] font-black uppercase tracking-tighter">{r.status.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Link
                                                    href={`/project/${r.slug || r.id}/build/1`}
                                                    className="px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all bg-teal-700 text-white hover:bg-teal-800"
                                                >
                                                    Workspace
                                                </Link>
                                                
                                                <Link
                                                    href={`/project/${r.slug || r.id}`}
                                                    className="px-2.5 py-1 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all"
                                                >
                                                    View Project
                                                </Link>
                                                <button 
                                                    onClick={() => setDeleteConfirm(r.id)}
                                                    className="text-text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/5"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-callout-bg/30 border border-dashed border-callout-border rounded-xl">
                                        <p className="manrope-body text-[0.8rem] text-text-muted italic">No active projects. Start one from BuildPilot.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Analytics Section */}
                        <section className="mb-20">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="inconsolata-ui text-[0.7rem] font-[var(--font-weight-bold)] text-text-muted  tracking-wide">Analytics</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-callout-bg border border-callout-border rounded-xl p-6">
                                    <TechnicalSignature skills={verifiedSkills} />
                                </div>
                                <div className="bg-callout-bg border border-border rounded-xl p-6">
                                    <MilestoneLedger submissions={allSubmissions} />
                                </div>
                                <div className="bg-callout-bg border border-border rounded-xl p-6">
                                    <IntensityHeatmap weeklyData={weeklyStats} />
                                </div>
                            </div>
                        </section>

                    </div>
                </main>
            </div>

            {/* Modals */}
            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
                    <div className="bg-background border border-border rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="inconsolata-ui text-lg font-bold text-text-heading  mb-2">Delete Goal?</h3>
                        <p className="manrope-body text-[13px] text-text-muted mb-6 leading-relaxed">
                            This will permanently remove this goal and all associated evidence. 
                            <span className="block mt-2 text-red-500/80 font-bold  text-[11px] tracking-normal">
                                ⚠️ Impact: This will lower your technical identity scores and may remove proven skills from your record.
                            </span>
                        </p>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => handleDeleteRoadmap(deleteConfirm)} 
                                disabled={deleting}
                                className="w-full py-3 bg-red-600 text-white rounded-lg text-[12px] font-bold  tracking-wide hover:bg-red-700 transition-all"
                            >
                                {deleting ? 'Deleting...' : 'Delete Goal'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="w-full py-3 bg-callout-bg hover:bg-[var(--border)] rounded-lg text-[12px] font-bold  tracking-wide text-text-heading transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showOnboarding && (
                <OnboardingFlow 
                    user={authUser} 
                    onComplete={(updatedUser) => setProfile({ ...profile, ...updatedUser })}
                    onExit={() => setShowOnboarding(false)}
                />
            )}
        </div>
    );
}
