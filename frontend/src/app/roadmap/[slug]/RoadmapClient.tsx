"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { roadmapsAPI, exploreAPI, submissionsAPI } from '@/lib/api';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import PublicRoadmapView from './PublicRoadmapView';
import PrivateRoadmapBanner from '@/components/PrivateRoadmapBanner';
import { 
    ChevronLeft, 
    Share2,
    Copy,
    Compass,
    Library,
    X,
    AlertCircle,
    ArrowRight,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import MCQPractice from '@/components/roadmap/MCQPractice';
import HomeworkSubmissionModal from '@/components/roadmap/HomeworkSubmissionModal';
import Celebration from '@/components/Celebration';
import GoldfishAssistant from '@/components/goldfish/GoldfishAssistant';
import FocusGrove from '@/components/roadmap/FocusGrove';
import { Inconsolata, Manrope } from 'next/font/google';

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

import RoadmapHeader from '@/components/roadmap/RoadmapHeader';
import HomeworkReviewLogs from '@/components/roadmap/HomeworkReviewLogs';
import ActionSidebar from '@/components/roadmap/ActionSidebar';
import ModuleReferenceCarousel from '@/components/roadmap/ModuleReferenceCarousel';

interface Props {
  slug: string;
  initialRoadmap: any;
  isProject?: boolean;
}

export default function RoadmapClient({ slug, initialRoadmap, isProject = false }: Props) {
    const [roadmap, setRoadmap] = useState<any>(initialRoadmap);
    const [loading, setLoading] = useState(!initialRoadmap);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showNudge, setShowNudge] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [showActions, setShowActions] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState<boolean>(false);
    const [isPro, setIsPro] = useState<boolean>(false);
    const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
    const [extensionWeeks, setExtensionWeeks] = useState<number>(1);
    const [extensionGoal, setExtensionGoal] = useState<string>('');
    const [extending, setExtending] = useState<boolean>(false);
    const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<{topic: any, moduleIndex: number} | null>(null);
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState<boolean>(false);
    const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
    const [submittingModule, setSubmittingModule] = useState<{number: number, title: string, instructions?: string} | null>(null);
    const [viewOnlyResult, setViewOnlyResult] = useState<any>(null);
    const [isGoldfishOpen, setIsGoldfishOpen] = useState<boolean>(false);
    const router = useRouter();

    const refreshProfile = React.useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: userData } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
            if (userData) {
                setProfile(userData);
                setIsPro(userData.is_pro);
            }
        }
    }, []);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile, isAuthenticated]);

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

    useEffect(() => {
        fetchSubmissions();
    }, [isAuthenticated, roadmap?.id]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            if (session && roadmap) {
                const sessionEmail = session.user.email?.toLowerCase();
                const roadmapEmail = roadmap.email?.toLowerCase();
                
                let ownerStatus = false;
                if (sessionEmail && roadmapEmail && sessionEmail === roadmapEmail) {
                    ownerStatus = true;
                }
                
                setIsOwner(ownerStatus);
            }
        };
        checkAuth();
    }, [roadmap]);

    // Secondary owner check once profile is loaded (for cases where email might be missing)
    useEffect(() => {
        if (profile && roadmap && roadmap.user_id) {
            if (profile.id === roadmap.user_id) {
                setIsOwner(true);
            }
        }
    }, [profile, roadmap]);

    useEffect(() => {
        let isMounted = true;
        async function fetchRoadmap() {
            if (!roadmap) {
                setLoading(true);
            }
            try {
                const data = await roadmapsAPI.getRoadmapBySlug(slug);
                if (data && isMounted) {
                    setRoadmap(data);
                } else if (!data && isMounted && !roadmap) {
                    setError('Roadmap not found');
                }
            } catch (err: any) {
                console.error("Fetch roadmap error:", err);
                if (isMounted && !roadmap) {
                    setError(err.response?.data?.detail || err.message || 'Roadmap not found');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchRoadmap();

        if (roadmap && !roadmap.is_public && roadmap.current_module > 1 && isAuthenticated && isOwner && !roadmap.cloned_from) {
            const hasSeenNudge = localStorage.getItem(`nudge_seen_${roadmap.slug}`);
            if (!hasSeenNudge) setShowNudge(true);
        }

        return () => {
            isMounted = false;
        };
    }, [slug, isAuthenticated]);


    const handleUpdateVisibility = async (updates: { is_public?: boolean, show_author?: boolean }) => {
        if (!roadmap || !roadmap.id) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            if (roadmap.is_public && updates.is_public === false) {
                throw new Error("Public courses cannot be made private.");
            }

            const payload = {
                is_public: updates.is_public ?? roadmap.is_public,
                show_author: updates.show_author ?? roadmap.show_author
            };

            await exploreAPI.updateVisibility(roadmap.id, payload, session.access_token);
            setRoadmap({ ...roadmap, ...payload });
            
            if (updates.is_public) {
                setShowCelebration(true);
                // Proactively purge Next.js server-side route cache
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: `/roadmap/${roadmap.slug}`, secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'eulerfold_revalidate_123' })
                }).catch(() => {});

                setTimeout(() => {
                    setShowCelebration(false);
                    window.location.reload();
                }, 5000);
            } else {
                setSuccessMsg('Visibility updated.');
                setTimeout(() => setSuccessMsg(null), 3000);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };


    const handleSignIn = () => {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };

    const handleClone = async () => {
        if (!isAuthenticated) {
            handleSignIn();
            return;
        }
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const res = await exploreAPI.cloneRoadmap(roadmap.id, session.access_token);
                setSuccessMsg("Roadmap cloned to dashboard!");
                // Short delay to show success message, then refresh local state
                setTimeout(async () => {
                    try {
                        const updatedRoadmap = await roadmapsAPI.getRoadmapBySlug(res.new_slug || slug);
                        if (updatedRoadmap) {
                            setRoadmap(updatedRoadmap);
                            setIsOwner(true);
                        }
                    } catch (e) {
                        router.push(`/roadmap/${res.new_slug || slug}`);
                    }
                    setSuccessMsg(null);
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || "Failed to clone roadmap.");
        } finally {
            setSaving(false);
        }
    };

    const handleExtend = async () => {
        if (!extensionGoal.trim()) {
            setError("Please describe what you want to learn next.");
            return;
        }
        setExtending(true);
        try {
            const updated = await roadmapsAPI.extendRoadmap(roadmap.id, {
                weeks: extensionWeeks,
                extension_goal: extensionGoal
            });
            setRoadmap(updated);
            setShowExtendModal(false);
            setExtensionGoal('');
            setSuccessMsg("Roadmap extended successfully!");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            console.error("Extension failed:", err);
            setError(err.response?.data?.detail || "Failed to extend roadmap.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setExtending(false);
        }
    };

    const handleDeleteExtension = async () => {
        if (!roadmap) return;
        setSaving(true);
        try {
            const updated = await roadmapsAPI.deleteRoadmapExtension(roadmap.id);
            setRoadmap(updated);
            setSuccessMsg("Extension removed successfully.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            console.error("Delete extension failed:", err);
            setError(err.response?.data?.detail || "Failed to delete extension.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleContinueLearning = async () => {
        if (!roadmap) return;
        
        if (isOwner) {
            if (isProject) {
                router.push(`/project/${roadmap.slug}/build/1`);
            } else {
                router.push(`/roadmap/${roadmap.slug}/learn`);
            }
            return;
        }

        if (roadmap.is_cloned) {
            setSaving(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const res = await supabase.from('roadmaps')
                        .select('slug')
                        .eq('email', session.user.email?.toLowerCase())
                        .eq('cloned_from', roadmap.id)
                        .maybeSingle();
                    
                    if (res.data) {
                        router.push(`/roadmap/${res.data.slug}/learn`);
                    } else {
                        // Fallback
                        router.push(`/roadmap/${roadmap.slug}/learn`);
                    }
                }
            } catch (err) {
                console.error("Failed to find clone:", err);
                router.push(`/roadmap/${roadmap.slug}/learn`);
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
                        <div className="h-64 w-full bg-callout-bg border border-border rounded-lg animate-pulse" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-callout-bg border border-border rounded-lg animate-pulse" />
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
                <div className="max-w-md w-full bg-background rounded-lg p-8 text-center border border-border">
                    <div className="bg-red-500/10 text-red-500 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
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

    if (roadmap?.is_public) {
        return <PublicRoadmapView slug={slug} roadmap={roadmap} />;
    }

    return (
        <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden`}>
            {/* Header */}
            <RoadmapHeader 
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                successMsg={successMsg}
                error={error}
                isOwner={isOwner}
                roadmap={roadmap}
                showActions={showActions}
                setShowActions={setShowActions}
                isAuthenticated={isAuthenticated}
                saving={saving}
                handleContinueLearning={handleContinueLearning}
                handleClone={handleClone}
                handleSignIn={handleSignIn}
                handleUpdateVisibility={handleUpdateVisibility}
                isPro={isPro}
                setShowExtendModal={setShowExtendModal}
                setIsGoldfishOpen={setIsGoldfishOpen}
            />

            <div className="flex flex-1 relative overflow-hidden">
                <ActionSidebar 
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    roadmap={roadmap}
                    isAuthenticated={isAuthenticated}
                    isOwner={isOwner}
                    submissionsLength={submissions.length}
                    showLogs={showLogs}
                    setShowLogs={setShowLogs}
                />

                <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar">
                    <div className="max-w-[900px] mx-auto px-8 py-6">
                        {showLogs ? (
                            <HomeworkReviewLogs submissions={submissions} setShowLogs={setShowLogs} />
                        ) : (
                            <>
                                <PrivateRoadmapBanner 
                                    title={roadmap.title} 
                                    slug={slug} 
                                    authorName={roadmap.author}
                                    username={roadmap.username}
                                    avatarUrl={roadmap.avatar_url}
                                    subject={roadmap.subject}
                                    description={roadmap.description}
                                    durationText={`${roadmap.roadmap_plan?.modules?.length || roadmap.time_value} ${roadmap.roadmap_plan?.modules?.length ? (roadmap.roadmap_plan.modules.length === 1 ? 'week' : 'weeks') : roadmap.time_unit}`}
                                    learnersCount={roadmap.clone_count || 0}
                                    createdDate={roadmap.created_at}
                                    isOwner={isOwner}
                                    isCloned={roadmap.is_cloned}
                                    isPublic={roadmap.is_public}
                                    isAuthenticated={isAuthenticated}
                                    saving={saving}
                                    onStartLearning={() => handleContinueLearning()}
                                    onClone={() => {
                                        handleClone();
                                    }}
                                    onMakePublic={() => handleUpdateVisibility({ is_public: true })}
                                />
                                <div className="mt-6">
                                    <FocusGrove 
                                        roadmapId={roadmap.id}
                                        roadmapSlug={roadmap.slug || slug}
                                        totalTopics={roadmap.progress?.total_topics || roadmap.roadmap_plan?.modules?.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0) || 10}
                                        completedTopicsCount={roadmap.progress?.completed_topics || 0}
                                        modules={roadmap.roadmap_plan?.modules || []}
                                    />
                                </div>
                                <div className="mt-4 mb-12" id="course-content">
                                    <RoadmapDisplay 
                                    roadmapData={roadmap} 
                                    hideHeader={true}
                                    initialFormData={{
                                        subject: roadmap.subject || '',
                                        goal: roadmap.goal || '',
                                        time_value: roadmap.time_value || 0,
                                        time_unit: roadmap.time_unit || 'weeks',
                                        model: roadmap.model
                                    }}
                                    justGenerated={false}
                                    isOwner={isOwner || roadmap.is_cloned}
                                    onCloneRequired={() => setShowCloneModal(true)}
                                    onSignInRequired={handleSignIn}
                                    externalSubmissions={submissions}
                                    onExtend={
                                        isPro && isOwner && (roadmap.extension_count || 0) < 5
                                        ? () => setShowExtendModal(true)
                                        : undefined
                                    }
                                    onDeleteExtension={handleDeleteExtension}
                                    onPractice={(topic, mIdx) => setSelectedPracticeTopic({ topic, moduleIndex: mIdx })}
                                    onOpenHomework={(mNum, mTitle, mInst) => {
                                        setSubmittingModule({ 
                                            number: mNum, 
                                            title: mTitle, 
                                            instructions: mInst,
                                            topics: roadmap.roadmap_plan?.modules?.[mNum - 1]?.topics || []
                                        });
                                        setViewOnlyResult(null);
                                        setIsHomeworkModalOpen(true);
                                    }}
                                    onViewSubmissionResult={(sub) => {
                                        setSubmittingModule({ number: sub.module_number, title: `Module ${sub.module_number} Submission`, instructions: null });
                                        setViewOnlyResult({
                                            level: sub.evaluation_level,
                                            summary: sub.evaluation,
                                            link: sub.link,
                                            evidence: sub.user_skill_evidence?.map((e: any) => ({
                                                skill: e.skill_name,
                                                strength: e.evidence_strength,
                                                confidence: e.confidence,
                                                reason: e.reason
                                            })) || []
                                        });
                                        setIsHomeworkModalOpen(true);
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
                                        { title: "Identity", sub: "Earn a proven skill on your record", threshold: 100 }
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
                                
                                <div className="flex flex-col">
                                    {roadmap.roadmap_plan.modules.map((module: any, index: number) => (
                                        <ModuleReferenceCarousel key={index} module={module} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>

                </main>
                </div>            {/* Sharing Nudge - Bottom Right Corner */}
            {showNudge && (
                <div className="fixed bottom-8 right-8 z-[110] p-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-background rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[280px] p-8 border border-border text-center relative group">
                        <button 
                            onClick={() => {
                                setShowNudge(false);
                                localStorage.setItem(`nudge_seen_${roadmap.slug}`, 'true');
                            }}
                            className="absolute top-3 right-3 text-text-muted hover:text-text-heading transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="w-12 h-12 bg-teal-500/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-6">
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

            {/* Extend Modal */}
            {showExtendModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-background border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="inconsolata-ui text-lg font-bold text-text-heading tracking-tight">Extend Roadmap</h3>
                                        <p className="manrope-body text-[11px] text-emerald-600 font-bold uppercase tracking-widest">Pro Exclusive</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExtendModal(false)} className="text-text-muted hover:text-text-heading p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest block ml-1">
                                        Extension Goal
                                    </label>
                                    <textarea 
                                        placeholder="What do you want to learn next? (e.g., 'Advanced concepts', 'Specific framework', 'Real-world project')"
                                        className="w-full h-24 bg-callout-bg border border-border rounded-lg p-4 text-[14px] manrope-body focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        value={extensionGoal}
                                        onChange={(e) => setExtensionGoal(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest block ml-1">
                                        Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setExtensionWeeks(w)}
                                                className={`py-2.5 rounded-md border inconsolata-ui text-[12px] font-bold transition-all ${
                                                    extensionWeeks === w 
                                                    ? 'bg-accent border-accent text-white shadow-sm' 
                                                    : 'bg-sidebar border-border text-text-muted hover:border-accent/40'
                                                }`}
                                            >
                                                +{w} Wk{w > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleExtend}
                                        disabled={extending}
                                        className="w-full py-3.5 bg-accent text-white rounded-md text-[13px] font-bold inconsolata-ui tracking-wide hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {extending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Generating Next Modules...
                                            </>
                                        ) : (
                                            <>
                                                Extend Now
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center mt-3 manrope-body text-[11px] text-text-muted font-medium">
                                        Each extension adds new modules and updates your course duration tag dynamically. ({roadmap.extension_count || 0}/5 extensions used)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Practice Modal */}
            {selectedPracticeTopic && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-background border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <button 
                            onClick={() => setSelectedPracticeTopic(null)}
                            className="absolute top-6 right-6 z-[210] p-2 hover:bg-callout-bg rounded-full transition-colors text-text-muted"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="max-h-[90vh] overflow-y-auto no-scrollbar">
                            <MCQPractice
                                roadmapId={roadmap.id}
                                subtopicId={selectedPracticeTopic.topic.uuid || ''}
                                topicName={selectedPracticeTopic.topic.title || ''}
                                topics={(roadmap.roadmap_plan?.modules?.[selectedPracticeTopic.moduleIndex]?.topics || []).map((t: any) => t.title || '')}
                                moduleTitle={roadmap.roadmap_plan?.modules?.[selectedPracticeTopic.moduleIndex]?.title || ''}
                                subject={roadmap.subject || roadmap.title || ''}
                                weekNumber={selectedPracticeTopic.moduleIndex + 1}
                                isPro={profile?.is_pro || false}
                                userCredits={profile?.roadmap_credits || 0}
                                onPointsEarned={(amount) => {
                                    setSuccessMsg(`+${amount} EulerCoins earned!`);
                                    setTimeout(() => setSuccessMsg(null), 4000);
                                }}
                                onRefreshProfile={refreshProfile}
                                onClose={() => setSelectedPracticeTopic(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Homework Modal */}
            {roadmap && submittingModule && (
                <HomeworkSubmissionModal
                    isOpen={isHomeworkModalOpen}
                    onClose={() => {
                        setIsHomeworkModalOpen(false);
                        setViewOnlyResult(null);
                    }}
                    roadmapId={roadmap.id}
                    moduleNumber={submittingModule.number}
                    moduleTitle={submittingModule.title}
                    instructions={submittingModule.instructions}
                    roadmapSubject={roadmap.subject || roadmap.title}
                    moduleTopicsText={JSON.stringify((submittingModule as any).topics || [])}
                    isPro={isPro}
                    initialResult={viewOnlyResult}
                    onSuccess={(evaluation) => {
                        fetchSubmissions();
                    }}
                />
            )}

            {/* Clone Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-background border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-accent/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Copy className="w-8 h-8" />
                            </div>
                            <h3 className="inconsolata-ui text-xl font-bold text-text-heading mb-3 tracking-tight">Clone to Dashboard</h3>
                            <p className="manrope-body text-[14px] text-text-muted mb-8 leading-relaxed font-medium italic px-4">
                                You need to clone this course to your dashboard to start learning, track your progress, and submit homework.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowCloneModal(false);
                                        handleClone();
                                    }}
                                    disabled={saving}
                                    className="w-full py-4 bg-accent text-white rounded-lg text-[14px] font-bold inconsolata-ui tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Cloning...
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Clone Now
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCloneModal(false)}
                                    className="w-full py-3 text-text-muted hover:text-text-heading text-[12px] font-bold inconsolata-ui tracking-widest uppercase transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Celebration Animation */}
            <Celebration 
                show={showCelebration} 
                title="Your course is live! 🚀" 
                subtitle="The community can see it now."
            />

            {/* Goldfish Co-Pilot Assistant */}
            {roadmap && (
                <GoldfishAssistant 
                    isOpen={isGoldfishOpen}
                    onClose={() => setIsGoldfishOpen(false)}
                    roadmapId={roadmap.id}
                    roadmapSlug={roadmap.slug}
                    roadmapTitle={roadmap.subject || roadmap.title}
                    currentModuleIndex={0}
                    currentTopicIndex={0}
                    initialTab="calendar"
                />
            )}
        </div>
    );
}
