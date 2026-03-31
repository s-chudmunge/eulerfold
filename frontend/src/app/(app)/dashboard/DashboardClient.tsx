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
import ReengagementModal from '@/components/dashboard/ReengagementModal';
import IntensityHeatmap from '@/components/dashboard/IntensityHeatmap';
import { format } from 'date-fns';
import AppSidebar from '@/components/AppSidebar';

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
    
    // Username Claim
    const [showUsernameClaim, setShowUsernameClaim] = useState(false);
    const [claimedUsername, setClaimedUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [agreedToMarketing, setAgreedToMarketing] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);

    // Re-engagement
    const [reengagementRoadmap, setReengagementRoadmap] = useState<RoadmapMe | null>(null);
    const [daysAway, setDaysAway] = useState(0);

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
                const { data: userProfile, error: profileError } = await supabase.from('profiles').select('*').eq('supabase_uid', authUser.id).maybeSingle();
                
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
                            if (!me.username || me.username.startsWith('user_')) {
                                setShowUsernameClaim(true);
                                setDisplayName(me.display_name || '');
                            }
                        }
                    } catch (authMeErr) {
                        console.error("Backend auth/me failed:", authMeErr);
                        if (isMounted) setError("Profile not found. Please try logging out and in again.");
                    }
                } else {
                    if (isMounted) {
                        setProfile(userProfile);
                        if (!userProfile.username) {
                            setShowUsernameClaim(true);
                            setDisplayName(userProfile.display_name || '');
                        }
                    }
                }

                if (!isMounted) return;

                // 2. Full Technical Identity (Skills, Submissions, etc.)
                if (activeProfile?.username) {
                    try {
                        const fullProfile = await profileAPI.getPublicProfile(activeProfile.username);
                        if (isMounted && fullProfile) {
                            setProfile(fullProfile); // Update with skills array
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

                if (activeProfile?.last_active_date && myRoadmaps.length > 0) {
                    const lastActive = new Date(activeProfile.last_active_date);
                    const today = new Date();
                    const diffDays = Math.ceil(Math.abs(today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
                    const metadata = activeProfile.metadata || {};
                    const isPaused = metadata.reengagement_paused_until ? new Date(metadata.reengagement_paused_until) > new Date() : false;
                    
                    if (diffDays >= 21 && !isPaused) {
                        const mostRecent = [...myRoadmaps].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
                        if (mostRecent) {
                            setReengagementRoadmap(mostRecent);
                            setDaysAway(diffDays);
                        }
                    }
                }
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadData();
        return () => { isMounted = false; };
    }, [authUser]);

    const handleClaimUsername = async () => {
        if (displayName.trim().length < 2) {
            setClaimError("Please enter your name");
            return;
        }
        if (claimedUsername.length < 3) {
            setClaimError("Username must be at least 3 characters");
            return;
        }
        if (!agreedToTerms || !agreedToPrivacy) {
            setClaimError("Please agree to the terms and privacy policy");
            return;
        }

        setClaimLoading(true);
        try {
            const updatedUser = await authAPI.completeOnboarding({ 
                username: claimedUsername,
                display_name: displayName 
            });
            setShowUsernameClaim(false);
            setProfile({ ...profile, ...updatedUser });
        } catch (err: any) {
            setClaimError(err.response?.data?.detail || "Username taken or invalid.");
        } finally {
            setClaimLoading(false);
        }
    };

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
                                <h2 className="inconsolata-ui text-[0.7rem] font-[var(--font-weight-bold)] text-text-muted  tracking-wide">Active Goals</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>
                            
                            <div className="border-t border-border divide-y divide-[var(--border)]">
                                {roadmaps.length > 0 ? (
                                    roadmaps.map((r) => (
                                        <div key={r.id} className="group flex flex-col md:flex-row md:items-center gap-4 py-2 hover:bg-sidebar/50 dark:hover:bg-background/[0.01] transition-colors">
                                            {/* Title & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading truncate tracking-normal">
                                                        {r.title}
                                                    </h3>
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
                                                    className="bg-[var(--text-heading)] text-[var(--bg-main)] px-3 py-1 rounded-md text-[10px] font-bold tracking-wide hover:opacity-90 transition-all"
                                                >
                                                    Resume
                                                </Link>
                                                <Link
                                                    href={`/roadmap/${r.slug || r.id}`}
                                                    className="px-2.5 py-1 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all"
                                                >
                                                    Details
                                                </Link>
                                                <button 
                                                    onClick={() => setDeleteConfirm(r.id)}
                                                    className="text-text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-callout-bg border border-dashed border-callout-border rounded-xl">
                                        <h3 className="inconsolata-ui text-[1rem] font-bold text-text-muted mb-2 ">No active goals.</h3>
                                        <p className="manrope-body text-[0.875rem] text-text-muted mb-8 italic">Create your first learning path to get started.</p>
                                        <Link href="/generate" className="inline-flex items-center gap-2 px-6 py-2.5 bg-background text-text-heading border border-border rounded-lg text-[12px] font-bold  tracking-wide hover:bg-callout-bg transition-all">
                                            <Plus className="w-4 h-4" /> New Goal
                                        </Link>
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
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

            {reengagementRoadmap && (
                <ReengagementModal 
                    roadmap={reengagementRoadmap}
                    daysAway={daysAway}
                    onClose={() => setReengagementRoadmap(null)}
                    onUpdated={(updated) => setRoadmaps(prev => prev.map(r => r.id === updated.id ? updated : r))}
                />
            )}

            {showUsernameClaim && (
                <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-[540px] animate-in fade-in zoom-in-95 duration-500 py-12">
                        
                        {/* Branding */}
                        <div className="flex justify-center mb-16">
                            <div className="flex items-center gap-2 opacity-90">
                                <img src="/apple-touch-icon.png" alt="" className="w-8 h-8" />
                                <span className="text-2xl font-bold tracking-tight text-text-heading manrope-body">EulerFold</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-10 text-center tracking-tight manrope-body">
                            Let&apos;s create your account
                        </h1>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[15px] font-bold text-text-muted manrope-body">
                                    What is your name?
                                </label>
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full px-5 py-4 bg-sidebar/50 border border-border rounded-2xl text-[17px] text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted/40 manrope-body font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[15px] font-bold text-text-muted manrope-body">
                                    Choose a unique username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/60 font-bold text-[17px] manrope-body">@</span>
                                    <input 
                                        type="text" 
                                        value={claimedUsername}
                                        onChange={(e) => setClaimedUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="username"
                                        className="w-full pl-11 pr-5 py-4 bg-sidebar/50 border border-border rounded-2xl text-[17px] text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted/40 manrope-body font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                                    <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
                                        {agreedToTerms && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                    </div>
                                    <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
                                        I agree to EulerFold&apos;s <Link href="/terms" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Consumer Terms</Link> and <Link href="/terms" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Acceptable Use Policy</Link> and confirm that I am at least 18 years of age.
                                    </p>
                                </div>

                                <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}>
                                    <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToPrivacy ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
                                        {agreedToPrivacy && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                    </div>
                                    <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
                                        I consent to collection and use of my personal information in accordance with the <Link href="/privacy" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                                    </p>
                                </div>

                                <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToMarketing(!agreedToMarketing)}>
                                    <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToMarketing ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
                                        {agreedToMarketing && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                    </div>
                                    <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
                                        Subscribe to occasional product update and promotional emails. You can opt out at any time.
                                    </p>
                                </div>
                            </div>

                            {claimError && (
                                <p className="text-[13px] font-bold text-red-500 text-center manrope-body animate-in fade-in slide-in-from-top-1">
                                    {claimError}
                                </p>
                            )}

                            <button 
                                onClick={handleClaimUsername}
                                disabled={claimLoading || !agreedToTerms || !agreedToPrivacy || claimedUsername.length < 3 || displayName.trim().length < 2}
                                className="w-full py-4 bg-text-heading text-background rounded-2xl font-bold text-[16px] hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl active:scale-[0.98] manrope-body"
                            >
                                {claimLoading ? 'Processing...' : 'Create account'}
                            </button>

                            <div className="pt-8 text-center space-y-3">
                                <p className="text-[13px] text-text-muted manrope-body font-medium">
                                    Email verified as <span className="text-text-primary font-bold">{authUser?.email}</span>
                                </p>
                                <button 
                                    onClick={() => supabase.auth.signOut()}
                                    className="text-[12px] text-text-muted hover:text-accent underline underline-offset-4 transition-colors font-bold manrope-body"
                                >
                                    Use a different email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
