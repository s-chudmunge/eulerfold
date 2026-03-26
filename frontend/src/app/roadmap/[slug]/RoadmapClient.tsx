"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { roadmapsAPI, exploreAPI, submissionsAPI } from '@/lib/api';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import StarRating from '@/components/roadmap/StarRating';
import { 
    ChevronLeft, 
    Globe, 
    Share2,
    Copy, 
    Eye, 
    Trophy,
    Target,
    Compass,
    Library,
    ShieldCheck,
    X,
    FileText,
    Play,
    AlertCircle,
    Menu,
    LogIn,
    MoreVertical,
    Lock,
    Scale
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import ShareMenu from '@/components/ShareMenu';

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

interface Props {
  slug: string;
  initialRoadmap: any;
}

export default function RoadmapClient({ slug, initialRoadmap }: Props) {
    const [roadmap, setRoadmap] = useState<any>(initialRoadmap);
    const [loading, setLoading] = useState(!initialRoadmap);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [rating, setRating] = useState<number>(initialRoadmap?.average_rating || 0);
    const [ratingCount, setRatingCount] = useState<number>(initialRoadmap?.rating_count || 0);
    const [userRating, setUserRating] = useState<number | null>(initialRoadmap?.user_rating || null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showNudge, setShowNudge] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [showActions, setShowActions] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (isAuthenticated && roadmap?.id) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const res = await submissionsAPI.listSubmissions(roadmap.id, session.access_token);
                        setSubmissions(res.submissions || []);
                    }
                } catch (err) {
                    console.error("Failed to fetch submissions:", err);
                }
            }
        };
        fetchSubmissions();
    }, [isAuthenticated, roadmap?.id]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            if (session && roadmap) {
                const sessionEmail = session.user.email?.toLowerCase();
                const roadmapEmail = roadmap.email?.toLowerCase();
                setIsOwner(sessionEmail === roadmapEmail);
            }
        };
        checkAuth();
    }, [roadmap]);

    useEffect(() => {
        if (roadmap) {
            setShareLink(`${window.location.origin}/roadmap/${roadmap.slug}`);
        }
    }, [roadmap]);

    useEffect(() => {
        async function fetchRoadmap() {
            // Re-fetch if roadmap is missing OR if we just logged in (to get personal progress/cloned status)
            if (!roadmap || (isAuthenticated && !isOwner && !roadmap.is_cloned)) {
                setLoading(true);
                try {
                    const data = await roadmapsAPI.getRoadmapBySlug(slug);
                    if (data) {
                        setRoadmap(data);
                        setRating(data.average_rating || 0);
                        setRatingCount(data.rating_count || 0);
                        setUserRating(data.user_rating || null);
                    } else {
                        setError('Roadmap not found');
                    }
                } catch (err: any) {
                    console.error("Fetch roadmap error:", err);
                    setError(err.response?.data?.detail || err.message || 'Roadmap not found');
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchRoadmap();

        if (roadmap && !roadmap.is_public && roadmap.current_module > 1 && isAuthenticated && isOwner && !roadmap.cloned_from) {
            const hasSeenNudge = localStorage.getItem(`nudge_seen_${roadmap.slug}`);
            if (!hasSeenNudge) setShowNudge(true);
        }
    }, [slug, isAuthenticated]); // Simplified dependencies to trigger on auth change

    const handleRate = async (value: number) => {
        if (!isAuthenticated) {
            handleSignIn();
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await exploreAPI.rateRoadmap(roadmap.id, value, session.access_token);
                setUserRating(value);
                // Fetch updated rating data
                const updated = await exploreAPI.getPublicRoadmap(roadmap.id);
                setRating(updated.average_rating || 0);
                setRatingCount(updated.rating_count || 0);
                setSuccessMsg('Rating submitted.');
                setTimeout(() => setSuccessMsg(null), 3000);
            }
        } catch (err) {
            console.error("Failed to rate:", err);
            setError("Failed to submit rating.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleUpdateVisibility = async (updates: { is_public?: boolean, show_author?: boolean }) => {
        if (!roadmap || !roadmap.id) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            if (roadmap.is_public && updates.is_public === false) {
                throw new Error("Public roadmaps cannot be made private.");
            }

            const payload = {
                is_public: updates.is_public ?? roadmap.is_public,
                show_author: updates.show_author ?? roadmap.show_author
            };

            await exploreAPI.updateVisibility(roadmap.id, payload, session.access_token);
            setRoadmap({ ...roadmap, ...payload });
            setSuccessMsg('Visibility updated.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const copyShareLink = async () => {
        const link = `${window.location.origin}/roadmap/${roadmap.slug}`;
        try {
            await navigator.clipboard.writeText(link);
            setSuccessMsg('Link copied.');
        } catch {
            const input = document.createElement('input');
            input.value = link;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setSuccessMsg('Link copied.');
        }
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSignIn = () => {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };

    const handleContinueLearning = async () => {
        if (!roadmap) return;
        
        if (isOwner) {
            window.location.href = `/roadmap/${roadmap.slug}/learn`;
            return;
        }

        if (roadmap.is_cloned) {
            if (roadmap.cloned_id) {
                window.location.href = `/roadmap/${roadmap.slug}/learn`;
                return;
            }
            
            setSaving(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const res = await supabase.from('roadmaps')
                        .select('slug')
                        .eq('email', session.user.email)
                        .eq('cloned_from', roadmap.id)
                        .maybeSingle();
                    
                    if (res.data) {
                        window.location.href = `/roadmap/${res.data.slug}/learn`;
                    }
                }
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background flex flex-col">
                <header className="h-[48px] border-b border-border bg-header animate-pulse" />
                <div className="flex flex-1">
                    <aside className="w-[260px] border-r border-border bg-sidebar hidden lg:block animate-pulse" />
                    <main className="flex-1 p-8 space-y-8 max-w-[900px] mx-auto w-full">
                        <div className="h-4 w-32 bg-callout-bg border border-border rounded animate-pulse" />
                        <div className="h-64 w-full bg-callout-bg border border-border rounded-xl animate-pulse" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-callout-bg border border-border rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !roadmap) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background dark:bg-[#0f0f0f] p-4">
                <div className="max-w-md w-full bg-background rounded-xl p-8 text-center border border-border">
                    <div className="bg-red-500/10 text-red-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="inconsolata-ui text-xl font-bold text-text-heading mb-2">Error</h1>
                    <p className="manrope-body text-[14px] text-text-muted mb-8 italic">{error || 'Roadmap not found'}</p>
                    <Link 
                        href="/dashboard"
                        className="inconsolata-ui inline-flex items-center px-6 py-3 bg-[var(--text-heading)] text-[var(--bg-main)] font-bold rounded-lg text-[12px]  tracking-wide hover:opacity-90 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

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
                        {isOwner && roadmap && !roadmap.is_public && !roadmap.cloned_from && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold tracking-wide ml-3">
                                <Lock className="w-3 h-3" />
                                <span className="hidden sm:inline">Private</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {isAuthenticated ? (
                            (isOwner || roadmap.is_cloned) ? (
                                <button 
                                    onClick={handleContinueLearning}
                                    disabled={saving}
                                    className="whitespace-nowrap rounded-lg bg-background border border-border px-4 md:px-5 py-1.5 text-text-heading text-[10px] md:text-[12px] font-bold hover:bg-callout-bg transition-opacity flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" /> <span className="hidden sm:inline">Continue Learning</span>
                                    <span className="sm:hidden">Learn</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={async () => {
                                        setSaving(true);
                                        try {
                                            const { data: { session } } = await supabase.auth.getSession();
                                            if (session) {
                                                const res = await exploreAPI.cloneRoadmap(roadmap.id, session.access_token);
                                                window.location.href = `/roadmap/${res.new_slug}`;
                                            }
                                        } catch (err: any) {
                                            setError(err.message);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                    className="whitespace-nowrap rounded-lg bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{saving ? 'Cloning...' : 'Clone to Dashboard'}</span>
                                    <span className="sm:hidden">{saving ? '...' : 'Clone'}</span>
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="text-[11px] font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-1.5 tracking-wide"
                            >
                                <LogIn className="w-3.5 h-3.5" /> Sign In
                            </button>
                        )}

                        {isOwner && !roadmap.is_public && !roadmap.cloned_from && (
                            <button 
                                onClick={() => handleUpdateVisibility({ is_public: true })}
                                disabled={saving}
                                className="whitespace-nowrap rounded-lg bg-teal-700/5 border border-teal-700/20 px-3 md:px-5 py-1.5 text-teal-700 text-[10px] md:text-[12px] font-bold hover:bg-teal-700/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Make Public</span>
                                <span className="sm:hidden">Public</span>
                            </button>
                        )}

                        {(roadmap.is_public || isOwner) && (
                            <ShareMenu 
                                title={`Check out this roadmap: ${roadmap.title}`}
                                text={`I'm learning ${roadmap.title} on EulerFold. Join me!`}
                                url={`https://eulerfold.com/roadmap/${roadmap.slug || roadmap.id}`}
                                triggerClassName="whitespace-nowrap rounded-lg bg-callout-bg border border-border px-4 md:px-5 py-1.5 text-text-heading text-[10px] md:text-[12px] font-bold hover:bg-[var(--border)] transition-opacity flex items-center gap-2"
                            />
                        )}

                        <div className="relative">
                            <button 
                                onClick={() => setShowActions(!showActions)}
                                className="p-2 hover:bg-callout-bg rounded-full transition-colors text-text-muted"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {showActions && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 origin-top-right">
                                        {isOwner ? (
                                            <>
                                                {/* Only allow Make Public if it's NOT already public AND NOT a clone */}
                                                {!roadmap.is_public && !roadmap.cloned_from && (
                                                    <button 
                                                        onClick={() => {
                                                            handleUpdateVisibility({ is_public: true });
                                                            setShowActions(false);
                                                        }}
                                                        disabled={saving}
                                                        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-b border-border hover:bg-callout-bg"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        <span className="inconsolata-ui text-[12px] font-bold text-text-heading  tracking-wide">
                                                            Make Public
                                                        </span>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col">
                                                {!roadmap.is_cloned && (
                                                    <button 
                                                        onClick={async () => {
                                                            setSaving(true);
                                                            try {
                                                                const { data: { session } } = await supabase.auth.getSession();
                                                                if (session) {
                                                                    const res = await exploreAPI.cloneRoadmap(roadmap.id, session.access_token);
                                                                    window.location.href = `/roadmap/${res.new_slug}`;
                                                                } else {
                                                                    handleSignIn();
                                                                }
                                                            } catch (err: any) {
                                                                setError(err.message);
                                                            } finally {
                                                                setSaving(false);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-callout-bg flex items-center gap-3 transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        <span className="inconsolata-ui text-[12px] font-bold text-text-heading  tracking-wide">
                                                            Clone Roadmap
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                >
                    <div className="space-y-4 px-3">
                        <div className="space-y-1">
                            <p className="inconsolata-ui text-[0.7rem] font-bold text-text-muted  tracking-wide">Duration</p>
                            <p className="inconsolata-ui text-[0.875rem] font-bold text-text-heading">{roadmap.time_value} {roadmap.time_unit}</p>
                        </div>

                        {isAuthenticated && (isOwner || roadmap.is_cloned) && submissions.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-border">
                                <button 
                                    onClick={() => setShowLogs(!showLogs)}
                                    className={`w-full py-2.5 px-3 rounded-lg border transition-all flex items-center justify-between group ${
                                        showLogs 
                                        ? 'bg-accent text-white border-[var(--accent)]' 
                                        : 'bg-callout-bg text-text-muted border-border hover:bg-[var(--border)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Scale className="w-3.5 h-3.5" />
                                        <span className="inconsolata-ui text-[10px] font-bold  tracking-wide">Audit Logs</span>
                                    </div>
                                    <span className={`inconsolata-ui text-[10px] font-bold px-1.5 py-0.5 rounded ${showLogs ? 'bg-background/20' : 'bg-[var(--border)]'}`}>
                                        {submissions.length}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </AppSidebar>

                <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar bg-background">
                    <div className="max-w-[900px] mx-auto px-8 py-6">
                        {showLogs ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Scale className="w-5 h-5 text-accent" />
                                        <h2 className="inconsolata-ui text-lg font-bold text-text-heading  tracking-tight">Private Audit History</h2>
                                    </div>
                                    <button 
                                        onClick={() => setShowLogs(false)}
                                        className="inconsolata-ui text-[11px] font-bold text-text-muted hover:text-text-heading  tracking-wide flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Roadmap
                                    </button>
                                </div>

                                <div className="space-y-6 pb-20">
                                    {submissions.map((sub, idx) => (
                                        <div key={sub.id} className="p-8 bg-background border border-border rounded-none relative">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="inconsolata-ui text-[10px] font-bold text-accent  tracking-wide bg-accent-muted px-2.5 py-1 rounded">
                                                        Log #{submissions.length - idx}
                                                    </div>
                                                    <div className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide bg-callout-bg px-2.5 py-1 rounded border border-border">
                                                        Module {sub.module_number}
                                                    </div>
                                                    <div className={`inconsolata-ui text-[10px] font-bold  tracking-wide px-2.5 py-1 rounded border ${
                                                        sub.evaluation_level === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                        sub.evaluation_level === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                        'bg-red-500/10 text-red-600 border-red-500/20'
                                                    }`}>
                                                        {sub.evaluation_level}
                                                    </div>
                                                </div>
                                                <span className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide">
                                                    {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="manrope-body mb-8">
                                                {sub.is_senate_eval && sub.senate_summary ? (
                                                    <p className="text-[15px] font-bold text-text-heading leading-relaxed border-l-4 border-[var(--accent)] pl-4 py-1 italic">
                                                        &ldquo;{sub.senate_summary}&rdquo;
                                                    </p>
                                                ) : (
                                                    <p className="text-[14px] text-text-primary leading-relaxed italic">
                                                        &ldquo;{sub.evaluation}&rdquo;
                                                    </p>
                                                )}
                                            </div>

                                            {sub.is_senate_eval && sub.senate_reasoning && (
                                                <div className="mt-4 space-y-3 pt-6 border-t border-border">
                                                    {[
                                                        { id: 'technician', label: 'Technical Depth', data: sub.senate_reasoning.technician, vote: sub.senate_votes?.[0] },
                                                        { id: 'educator', label: 'Learning Proof', data: sub.senate_reasoning.educator, vote: sub.senate_votes?.[1] },
                                                        { id: 'relevance_judge', label: 'Alignment', data: sub.senate_reasoning.relevance_judge, vote: sub.senate_votes?.[2] }
                                                    ].map((auditor) => (
                                                        <div key={auditor.id} className="flex flex-col md:flex-row gap-2 md:gap-6 p-4 rounded-none bg-callout-bg border border-border group/item hover:border-[var(--accent)] transition-all">
                                                            <div className="w-full md:w-32 shrink-0">
                                                                <p className="inconsolata-ui text-[9px] font-bold text-text-muted  tracking-wider mb-1">{auditor.label}</p>
                                                                <span className={`inconsolata-ui text-[9px] font-bold  px-2 py-0.5 rounded border ${
                                                                    auditor.vote === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                    auditor.vote === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                                }`}>{auditor.vote}</span>
                                                            </div>
                                                            <p className="text-[12px] text-text-primary leading-relaxed italic opacity-90">&ldquo;{auditor.data}&rdquo;</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {sub.dissent_note && (
                                                <div className="p-3 bg-callout-bg border border-border rounded-none mt-6 flex items-start gap-3">
                                                    <Scale className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5 opacity-60" />
                                                    <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                                                        <span className="inconsolata-ui text-[10px] font-bold  tracking-wider mr-2 opacity-70">Committee Detail:</span> {sub.dissent_note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <header className="mb-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="inconsolata-ui flex items-center gap-2 text-accent text-[13px] font-bold  tracking-wide">
                                            <span className="bg-teal-500/10 px-2 py-0.5 rounded text-accent font-bold">Roadmap</span>
                                            <span className="text-[var(--border)]">/</span>
                                            <span className="text-text-muted italic">{roadmap.subject}</span>
                                        </div>
                                        
                                        {roadmap.is_public && (
                                            <StarRating 
                                                rating={rating} 
                                                count={ratingCount} 
                                                size={18}
                                                interactive={isAuthenticated && !isOwner}
                                                onRate={handleRate}
                                                className="md:text-right"
                                            />
                                        )}
                                    </div>
                                </header>

                                <div className="mb-12">
                                    <RoadmapDisplay 
                                        roadmapData={roadmap} 
                                initialFormData={{
                                    subject: roadmap.subject || '',
                                    goal: roadmap.goal || '',
                                    time_value: roadmap.time_value || 0,
                                    time_unit: roadmap.time_unit || 'weeks',
                                    model: roadmap.model
                                }}
                                justGenerated={false}
                                isOwner={isOwner || roadmap.is_cloned}
                                onClone={async () => {
                                    if (roadmap.is_cloned) {
                                        handleContinueLearning();
                                        return;
                                    }
                                    setSaving(true);
                                    try {
                                        const { data: { session } } = await supabase.auth.getSession();
                                        if (session) {
                                            const res = await exploreAPI.cloneRoadmap(roadmap.id, session.access_token);
                                            window.location.href = `/roadmap/${res.new_slug}`;
                                        } else {
                                            handleSignIn();
                                        }
                                    } catch (err: any) {                                        setError(err.message);
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                            />
                        </div>

                        {/* How It Works Flow */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-10">
                                <Compass className="w-4 h-4 text-text-muted" />
                                <h2 className="inconsolata-ui text-[12px] font-bold  tracking-wide text-text-muted">How It Works</h2>
                            </div>
                            <div className="relative px-4 max-w-[700px] mx-auto">
                                {/* Track Line */}
                                <div className="absolute top-[10px] left-4 right-4 h-[2px] bg-[var(--border)] z-0">
                                    <div 
                                        className="h-full bg-[var(--text-heading)] transition-all duration-1000 ease-out"
                                        style={{ width: `${roadmap.progress?.percent || 0}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex justify-between relative z-10">
                                    {[
                                        { title: "Learn", sub: "Study curated videos and articles", threshold: 0 },
                                        { title: "Practice", sub: "Solve problems, build things", threshold: 30 },
                                        { title: "Verify", sub: "Submit your work as proof", threshold: 60 },
                                        { title: "Identity", sub: "Get a verified skill on your profile", threshold: 100 }
                                    ].map((step, idx) => {
                                        const isActive = (roadmap.progress?.percent || 0) >= step.threshold;
                                        return (
                                            <div key={idx} className="flex flex-col items-center group">
                                                <div className={`w-[22px] h-[22px] rounded-full border-2 transition-all duration-500 bg-background flex items-center justify-center ${
                                                    isActive ? "border-[var(--text-heading)]" : "border-border"
                                                }`}>
                                                    {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-heading)] animate-in zoom-in duration-300"></div>}
                                                </div>
                                                <div className="mt-4 flex flex-col items-center">
                                                    <p className={`inconsolata-ui text-[0.75rem] font-bold  tracking-wide whitespace-nowrap ${isActive ? "text-text-heading" : "text-text-muted"}`}>
                                                        {step.title}
                                                    </p>
                                                    <p className="manrope-body text-[11px] text-text-muted mt-1 opacity-60 text-center max-w-[120px] leading-tight italic">
                                                        {step.sub}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Consolidated References Section */}
                        {roadmap.roadmap_plan?.modules?.some((m: any) => m.resources?.length > 0) && (
                            <div className="mb-24 pt-12 border-t border-border">
                                <div className="flex items-center gap-3 mb-8">
                                    <Library className="w-4 h-4 text-text-muted" />
                                    <h2 className="inconsolata-ui text-[12px] font-bold  tracking-wide text-text-muted">References</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {Array.from(new Map(
                                        roadmap.roadmap_plan.modules
                                            .flatMap((m: any) => m.resources || [])
                                            .map((r: any) => [r.link || r.url, r])
                                    ).values()).map((resource: any, idx) => (
                                        <div key={idx} className="flex items-start gap-4 group">
                                            <span className="inconsolata-ui text-[10px] font-bold text-text-muted mt-1 w-4 shrink-0">
                                                {idx + 1}.
                                            </span>
                                            <a 
                                                href={resource.link || resource.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="manrope-body text-[13px] text-text-primary hover:text-accent transition-colors leading-relaxed line-clamp-2"
                                            >
                                                {resource.title || resource.name || resource.url}
                                                <span className="ml-2 text-[10px] text-text-muted font-normal italic opacity-0 group-hover:opacity-100 transition-opacity">
                                                    ↗
                                                </span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>

                {/* Shared Landing Footer */}
                <footer className="w-full px-6 py-12 border-t border-border bg-background mt-20">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
                    <div className="col-span-2 md:col-span-1 flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity grayscale">
                            <img src="/apple-touch-icon.png" alt="" className="w-3.5 h-3.5" />
                            <span className="font-semibold text-[11px] tracking-tight inconsolata-ui text-black dark:text-white">Eulerfold</span>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Website</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/dashboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
                            <Link href="/explore" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Explore</Link>
                            <Link href="/generate" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Generate</Link>
                            <Link href="/learn" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Learn</Link>
                            <Link href="/leaderboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Leaderboard</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Resources</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/research-decoded" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Research</Link>
                            <Link href="/help" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Help center</Link>
                            <Link href="/settings" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Settings</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Company</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/terms" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Terms of service</Link>
                            <Link href="/privacy" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Social</h4>
                        <div className="flex flex-col gap-1">
                            <a href="mailto:hello@eulerfold.com" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Contact support</a>                            <span className="text-[10px] text-gray-300 dark:text-gray-800 cursor-default">GitHub</span>
                            <span className="text-[10px] text-gray-300 dark:text-gray-800 cursor-default">Twitter</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[9px] font-medium text-gray-400 inconsolata-ui opacity-50">
                        © {new Date().getFullYear()} EulerFold
                    </p>                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-sidebar dark:bg-white/5"></div>
                        <div className="w-1 h-1 rounded-full bg-sidebar dark:bg-white/5"></div>
                        <div className="w-1 h-1 rounded-full bg-sidebar dark:bg-white/5"></div>
                    </div>
                </div>
                </footer>
                </main>
                </div>            {/* Sharing Nudge - Bottom Right Corner */}
            {showNudge && (
                <div className="fixed bottom-8 right-8 z-[110] p-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[280px] p-8 border border-border text-center relative group">
                        <button 
                            onClick={() => {
                                setShowNudge(false);
                                localStorage.setItem(`nudge_seen_${roadmap.slug}`, 'true');
                            }}
                            className="absolute top-3 right-3 text-text-muted hover:text-text-heading transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="w-12 h-12 bg-teal-500/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Share2 className="h-6 w-6" />
                        </div>
                        
                        <h3 className="inconsolata-ui text-[16px] font-bold text-text-heading  tracking-tight mb-2">Share Roadmap</h3>
                        <p className="manrope-body text-[12px] text-text-muted mb-8 leading-relaxed font-medium">
                            Contribute to Explore and earn <span className="text-accent font-bold">10 EulerCoins</span>.
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    handleUpdateVisibility({ is_public: true });
                                    setShowNudge(false);
                                    localStorage.setItem(`nudge_seen_${roadmap.slug}`, 'true');
                                }}
                                className="w-full py-3 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-lg text-[11px] font-bold  tracking-wide hover:opacity-90 transition-all"
                            >
                                Make Public
                            </button>
                            <button 
                                onClick={() => {
                                    setShowNudge(false);
                                    localStorage.setItem(`nudge_seen_${roadmap.slug}`, 'true');
                                }}
                                className="inconsolata-ui text-[9px] font-bold text-text-muted hover:text-text-heading transition-colors  tracking-wide"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
