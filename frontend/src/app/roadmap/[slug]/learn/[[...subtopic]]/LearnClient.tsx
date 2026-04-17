"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { RoadmapData, roadmapsAPI, authAPI, practiceAPI, PracticeSession, PracticeProgress } from '@/lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  PlayCircle,
  CheckCircle2, 
  Menu, 
  X,
  Loader,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Check,
  Circle,
  VolumeX,
  RefreshCcw,
  ArrowRight,
  Trophy,
  ChevronDown,
  LayoutDashboard,
  Target,
  Zap,
  FileText,
  Info
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import CourseHeader from '@/components/CourseHeader';
import MCQPractice from './MCQPractice';

export default function LearnClient({ id: propId, slug: subtopicSlug, initialRoadmap }: { id?: string, slug?: string[], initialRoadmap?: RoadmapData | null }) {
    const params = useParams();
    const id = propId || (params?.slug as string);
    const router = useRouter();
    
    const [roadmap, setRoadmap] = useState<RoadmapData | null>(initialRoadmap || null);
    const [loading, setLoading] = useState(!initialRoadmap);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    
    // Navigation & Progress State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    
    // Toast State
    const [coinToast, setCoinToast] = useState<{show: boolean, amount: number} | null>(null);
    
    // Video & Tooltip State
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [showMuteTooltip, setShowMuteTooltip] = useState(false);
    const [activeTab, setActiveTab] = useState<'objectives' | 'resources' | 'outcome'>('objectives');

    // Practice State
    const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
    const [practiceProgress, setPracticeProgress] = useState<Record<string, boolean>>({});
    const [isPracticeLoading, setIsPracticeLoading] = useState(false);
    const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
    const [isPracticeExpanded, setIsPracticeExpanded] = useState(false);
    const [isConfirmingMore, setIsConfirmingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'video' | 'practice'>('video');

    const refreshProfile = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: userData } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
            if (userData) setProfile(userData);
        }
    }, []);

    const allWeekResources = useMemo(() => {
        if (!roadmap || !roadmap.roadmap_plan?.modules?.[currentModuleIndex]) return [];
        const module = roadmap.roadmap_plan.modules[currentModuleIndex];
        const resources: any[] = [];
        
        // 1. Module level resources
        if (module.resources && Array.isArray(module.resources)) {
            module.resources.forEach((r: any) => {
                resources.push({
                    title: r.title || r.name || 'Untitled Resource',
                    url: r.url || r.link,
                    type: 'Study Material',
                    context: 'Week'
                });
            });
        }
        
        // 2. Topic level resources
        module.topics?.forEach((topic: any) => {
            if (topic.resources && Array.isArray(topic.resources)) {
                topic.resources.forEach((r: any) => {
                    resources.push({
                        title: r.title || r.name || 'Untitled Resource',
                        url: r.url || r.link,
                        type: 'Unit Resource',
                        context: topic.title
                    });
                });
            }
        });
        
        return resources;
    }, [roadmap, currentModuleIndex]);

    const fetchPracticeSession = useCallback(async () => {
        if (!roadmap || !roadmap.id) return;
        const currentModule = roadmap.roadmap_plan?.modules?.[currentModuleIndex];
        const currentTopic = currentModule?.topics?.[currentTopicIndex];
        
        if (!currentTopic?.uuid) {
            setIsPracticeLoading(false);
            setPracticeSession(null);
            return;
        }

        setIsPracticeLoading(true);
        setPracticeSession(null);
        setPracticeProgress({});
        setIsPracticeExpanded(false);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsPracticeLoading(false);
                return;
            }

            const { data, error } = await supabase.from('practice_sessions')
                .select('*')
                .eq('subtopic_id', currentTopic.uuid)
                .eq('user_id', session.user.id)
                .maybeSingle();
            
            if (data) {
                setPracticeSession(data);
                const progressData = await practiceAPI.getSessionProgress(data.id);
                const progressMap: Record<string, boolean> = {};
                progressData.forEach(p => {
                    progressMap[p.resource_id] = p.completed;
                });
                setPracticeProgress(progressMap);
                setIsPracticeExpanded(true);
            }
        } catch (err) {
            console.error('Error fetching practice session:', err);
        } finally {
            setIsPracticeLoading(false);
        }
    }, [roadmap, currentModuleIndex, currentTopicIndex]);

    useEffect(() => {
        fetchPracticeSession();
    }, [fetchPracticeSession]);

    const handleStartPractice = async () => {
        if (!roadmap || !roadmap.id) return;
        const currentModule = roadmap.roadmap_plan?.modules?.[currentModuleIndex];
        const currentTopic = currentModule?.topics?.[currentTopicIndex];
        
        if (!currentTopic?.uuid) return;

        setIsGeneratingPractice(true);
        try {
            const session = await practiceAPI.getOrCreateSession({
                roadmap_id: roadmap.id,
                subtopic_id: currentTopic.uuid,
                topic_name: currentTopic.title,
                subject: roadmap.subject || roadmap.title,
                goal: roadmap.goal || roadmap.description
            });
            setPracticeSession(session);
            setIsPracticeExpanded(true);
            setViewMode('practice');
        } catch (err) {
            console.error('Error starting practice:', err);
        } finally {
            setIsGeneratingPractice(false);
        }
    };

    const handleToggleResource = async (resourceId: string, completed: boolean) => {
        if (!practiceSession) return;

        // Optimistic UI update
        setPracticeProgress(prev => ({ ...prev, [resourceId]: completed }));

        try {
            const response = await practiceAPI.updateProgress(practiceSession.id, resourceId, completed);

            if (completed) {
                setCoinToast({ show: true, amount: 1 });
                setTimeout(() => setCoinToast(null), 3000);
            }
        } catch (err) {
            console.error('Error updating practice progress:', err);
            // Rollback optimistic update on error
            setPracticeProgress(prev => ({ ...prev, [resourceId]: !completed }));
        }
    };

    const handleLoadMore = async () => {
        if (!roadmap || !roadmap.id || !practiceSession) return;
        const currentModule = roadmap.roadmap_plan?.modules?.[currentModuleIndex];
        const currentTopic = currentModule?.topics?.[currentTopicIndex];
        if (!currentTopic?.uuid) return;

        setIsGeneratingPractice(true);
        setIsConfirmingMore(false);
        try {
            const session = await practiceAPI.loadMore(practiceSession.id, {
                roadmap_id: roadmap.id,
                subtopic_id: currentTopic.uuid,
                topic_name: currentTopic.title,
                subject: roadmap.subject || roadmap.title,
                goal: roadmap.goal || roadmap.description
            });

            setPracticeSession(session);
        } catch (err) {
            console.error('Error loading more practice:', err);
        } finally {
            setIsGeneratingPractice(false);
        }
    };

    const handleRetryPractice = async () => {
        if (!roadmap || !roadmap.id || !practiceSession) return;
        const currentModule = roadmap.roadmap_plan?.modules?.[currentModuleIndex];
        const currentTopic = currentModule?.topics?.[currentTopicIndex];
        if (!currentTopic?.uuid) return;

        setIsGeneratingPractice(true);
        try {
            const session = await practiceAPI.retrySession(practiceSession.id, {
                roadmap_id: roadmap.id,
                subtopic_id: currentTopic.uuid,
                topic_name: currentTopic.title,
                subject: roadmap.subject || roadmap.title,
                goal: roadmap.goal || roadmap.description
            });
            setPracticeSession(session);
            setViewMode('practice');
        } catch (err) {
            console.error('Error retrying practice:', err);
        } finally {
            setIsGeneratingPractice(false);
        }
    };

    const fetchProgress = useCallback(async (roadmapId: number) => {
        try {
            const data = await roadmapsAPI.getProgress(roadmapId);
            const completedSet = new Set<string>();
            data.completed_topics.forEach((t: any) => {
                completedSet.add(`${t.module_number}-${t.topic_index}`);
            });
            setCompletedTopics(completedSet);
        } catch (err) {
            console.error('Error fetching progress:', err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchEverything = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/');
                    return;
                }

                if (!isMounted) return;

                try {
                    const { data: userData } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
                    if (userData && isMounted) {
                        setProfile(userData);
                        if (!userData.metadata?.muted_autoplay_hint_dismissed) {
                            setShowMuteTooltip(true);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch user profile:", e);
                }

                // If we are logged in, we MUST re-fetch from our backend (not anonymous Supabase)
                // to get the version we own/cloned and to avoid extensions being filtered.
                setLoading(true);
                let currentRoadmap = null;
                const isIdNumeric = /^\d+$/.test(id);

                try {
                    if (isIdNumeric) {
                        currentRoadmap = await roadmapsAPI.getRoadmapById(Number(id));
                    } else {
                        currentRoadmap = await roadmapsAPI.getRoadmapBySlug(id);
                    }
                } catch (err) {
                    console.error("Fetch re-fetch failed:", err);
                    // Fallback to initialRoadmap if re-fetch fails
                    currentRoadmap = initialRoadmap;
                }

                if (currentRoadmap && isMounted) {
                    setRoadmap(currentRoadmap);
                    const isOwner = currentRoadmap.email?.toLowerCase() === session.user.email?.toLowerCase();
                    
                    if (isOwner && currentRoadmap.last_position) {
                        setCurrentModuleIndex(currentRoadmap.last_position.mIdx || 0);
                        setCurrentTopicIndex(currentRoadmap.last_position.tIdx || 0);
                    } else if (isOwner && currentRoadmap.current_module) {
                        setCurrentModuleIndex(Math.max(0, currentRoadmap.current_module - 1));
                        setCurrentTopicIndex(0);
                    } else {
                        // For non-owners, always start at beginning unless query param overrides
                        setCurrentModuleIndex(0);
                        setCurrentTopicIndex(0);
                    }

                    const searchParams = new URLSearchParams(window.location.search);
                    const mParam = searchParams.get('module');
                    if (mParam) {
                        const mIdx = parseInt(mParam) - 1;
                        if (currentRoadmap.roadmap_plan?.modules?.[mIdx]) {
                            setCurrentModuleIndex(mIdx);
                            setCurrentTopicIndex(0);
                        }
                    }

                    if (currentRoadmap.id) {
                        await fetchProgress(currentRoadmap.id);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching roadmap:', err);
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) fetchEverything();
        return () => { isMounted = false; };
    }, [id, router, fetchProgress]);

    useEffect(() => {
        if (!roadmap) return;
        const currentModule = roadmap.roadmap_plan?.modules?.[currentModuleIndex];
        const currentTopic = currentModule?.topics?.[currentTopicIndex];
        
        setActiveVideoId(null);
        
        const timer = setTimeout(() => {
            if (currentTopic?.youtube_video_id) {
                setActiveVideoId(currentTopic.youtube_video_id);
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [currentModuleIndex, currentTopicIndex, roadmap]);

    useEffect(() => {
        if (roadmap && roadmap.id) {
            const subject = roadmap.subject || roadmap.title || 'Roadmap';
            document.title = `Learning: ${subject}`;
            
            // Construct the clean slug
            const roadmapSlug = roadmap.slug || roadmap.id.toString();
            if (roadmapSlug) {
                const targetPath = `/roadmap/${roadmapSlug}/learn`;
                if (window.location.pathname.startsWith(`/roadmap/${id}/learn`)) {
                   // Only replace if we are on the old numeric ID path
                   window.history.replaceState(null, '', targetPath);
                }
            }
        }
    }, [roadmap, id]);

    const updateProgressOnServer = async (mIdx: number, tIdx: number, isCompleted: boolean = false) => {
        if (!roadmap || !roadmap.id) return;

        // Optimistic UI update
        if (isCompleted) {
            const key = `${mIdx + 1}-${tIdx}`;
            setCompletedTopics(prev => {
                const next = new Set(prev);
                next.add(key);
                return next;
            });
        }

        try {
            const response = await roadmapsAPI.updateProgress(roadmap.id, {
                module_number: mIdx + 1,
                topic_index: tIdx,
                completed: isCompleted
            });

            if (isCompleted && response.coins_earned && response.coins_earned > 0) {
                setCoinToast({ show: true, amount: response.coins_earned });
                setTimeout(() => setCoinToast(null), 4000);
            }
        } catch (err) {
            console.error('Error updating progress:', err);
            // Rollback optimistic update on error
            if (isCompleted) {
                const key = `${mIdx + 1}-${tIdx}`;
                setCompletedTopics(prev => {
                    const next = new Set(prev);
                    next.delete(key);
                    return next;
                });
            }
        }
    };

    const handleTopicChange = (mIdx: number, tIdx: number) => {
        setCurrentModuleIndex(mIdx);
        setCurrentTopicIndex(tIdx);
        setViewMode('video');
        updateProgressOnServer(mIdx, tIdx, false);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleMarkAsCompleted = async () => {
        setIsUpdatingProgress(true);
        await updateProgressOnServer(currentModuleIndex, currentTopicIndex, true);
        setIsUpdatingProgress(false);
    };

    const dismissMuteTooltip = async () => {
        setShowMuteTooltip(false);
        try {
            await authAPI.updateMetadata({ muted_autoplay_hint_dismissed: true });
        } catch (err) {
            console.error('Error saving metadata:', err);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background dark:bg-[#0f0f0f]">
                <div className="h-6 w-6 border-2 border-border border-t-[var(--accent)] rounded-full animate-spin mb-4"></div>
                <p className="text-[11px] font-bold text-text-muted tracking-widest">Establishing learning session</p>
            </div>
        );
    }

    if (error || !roadmap) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-text-heading mb-2">Connection error</h1>
                    <p className="manrope-body text-[14px] text-text-muted mb-8 italic">{error || 'Session failed'}</p>
                    <Link href={`/roadmap/${roadmap?.slug || id}`} className="bg-[var(--text-heading)] text-[var(--bg-main)] px-6 py-2.5 rounded-lg font-bold text-[12px] tracking-wide">
                        Back to Overview
                    </Link>
                </div>
            </div>
        );
    }

    const modules = roadmap.roadmap_plan?.modules || [];
    const currentModule = modules[currentModuleIndex];
    const currentTopic = currentModule?.topics?.[currentTopicIndex];
    const isTopicCompleted = completedTopics.has(`${currentModuleIndex + 1}-${currentTopicIndex}`);
    
    const currentWeekTopicsCount = currentModule?.topics?.length || 0;
    const completedInCurrentWeekCount = Array.from(completedTopics).filter(k => k.startsWith(`${currentModuleIndex + 1}-`)).length;
    const isWeekFullyCompleted = completedInCurrentWeekCount === currentWeekTopicsCount;

    let upNextTopic = null;
    let upNextModuleIdx = -1;
    let upNextTopicIdx = -1;

    if (currentTopicIndex < currentModule.topics.length - 1) {
        upNextTopic = currentModule.topics[currentTopicIndex + 1];
        upNextModuleIdx = currentModuleIndex;
        upNextTopicIdx = currentTopicIndex + 1;
    } else if (currentModuleIndex < modules.length - 1) {
        upNextTopic = modules[currentModuleIndex + 1].topics[0];
        upNextModuleIdx = currentModuleIndex + 1;
        upNextTopicIdx = 0;
    }

    const handleNext = () => {
        if (upNextTopic) {
            handleTopicChange(upNextModuleIdx, upNextTopicIdx);
        }
    };

    const handlePrev = () => {
        if (currentTopicIndex > 0) {
            handleTopicChange(currentModuleIndex, currentTopicIndex - 1);
        } else if (currentModuleIndex > 0) {
            const prevModule = modules[currentModuleIndex - 1];
            handleTopicChange(currentModuleIndex - 1, prevModule.topics.length - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
            {/* Header */}
            <CourseHeader 
                roadmapId={id}
                roadmapSlug={roadmap?.slug}
                roadmapTitle={roadmap?.subject}
                unitInfo={`Unit ${currentTopicIndex + 1} of ${currentModule?.topics?.length}`}
                unitTitle={currentTopic?.title}
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={currentModuleIndex > 0 || currentTopicIndex > 0}
                hasNext={!!upNextTopic}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex flex-1 relative overflow-hidden mt-12">
                {/* Sidebar Overlay for Mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-40 w-[240px] bg-sidebar border-r border-border transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
                    <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[0.6rem] font-bold text-text-muted tracking-wider opacity-70">Curriculum</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-callout-bg rounded text-text-muted">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {modules.map((module: any, mIdx: number) => (
                                <div key={mIdx} className="relative">
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <span className="text-[8px] font-bold text-text-muted tracking-tight opacity-60">
                                            {module.is_extension ? 'EXTENSION' : `WEEK ${mIdx + 1}`}
                                        </span>
                                        {Array.from(completedTopics).filter(k => k.startsWith(`${mIdx + 1}-`)).length === (module.topics?.length || 0) && (
                                            <Check className="h-2 w-2 text-emerald-500" />
                                        )}                                    </div>
                                    <h3 className="text-[12px] font-bold text-text-primary mb-2 px-1 leading-tight tracking-tight">{module.title}</h3>
                                    <div className="space-y-0.5">
                                        {module.topics?.map((topic: any, tIdx: number) => {
                                            const isCompleted = completedTopics.has(`${mIdx + 1}-${tIdx}`);
                                            const isActive = mIdx === currentModuleIndex && tIdx === currentTopicIndex;
                                            return (
                                                <button
                                                    key={tIdx}
                                                    onClick={() => handleTopicChange(mIdx, tIdx)}
                                                    className={`w-full flex items-start text-left px-2 py-1.5 rounded-md text-[13.5px] transition-colors group ${
                                                        isActive ? 'bg-[var(--active-bg)] text-[var(--active-text)] font-bold' : 'hover:bg-callout-bg text-text-primary hover:text-text-heading'
                                                    }`}
                                                >
                                                    <div className="mr-2.5 mt-1 shrink-0">
                                                        {isCompleted ? <Check className={`h-3 w-3 ${isActive ? 'text-emerald-400' : 'text-emerald-500'}`} /> : <PlayCircle className={`h-3 w-3 ${isActive ? 'text-accent' : 'opacity-30'}`} />}
                                                    </div>                                                    <span className="line-clamp-2 leading-tight">{topic.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="mt-1 px-1">
                                        <button 
                                            onClick={() => {
                                                setViewMode('practice');
                                            }}
                                            disabled={isPracticeLoading}
                                            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13.5px] transition-colors ${
                                                viewMode === 'practice' 
                                                    ? "bg-[var(--active-bg)] text-[var(--active-text)] font-bold shadow-sm" 
                                                    : "text-text-primary hover:text-text-heading hover:bg-callout-bg"
                                            }`}
                                        >
                                            <div className="shrink-0 flex items-center justify-center">
                                                {isPracticeLoading ? <Loader className="h-3 w-3 animate-spin" /> : <Target className={`h-3 w-3 ${viewMode === 'practice' ? 'text-accent' : 'opacity-40'}`} />}
                                            </div>
                                            <span className="leading-tight">Practice</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full bg-background relative overflow-hidden transition-colors duration-300">
                    <div className="flex-1 overflow-y-auto pt-2 pb-8 px-4 md:pt-4 md:pb-10 md:px-10 no-scrollbar">
                        <div className="max-w-[1400px] mx-auto w-full">
                            
                            {viewMode === 'video' && (
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 text-accent text-[10px] font-bold tracking-tight">
                                                <span className="bg-teal-500/10 px-2 py-0.5 rounded">Unit {currentTopicIndex + 1}</span>
                                                <span className="text-[var(--border)]">/</span>
                                                <span className="text-text-muted italic">Week {currentModuleIndex + 1}</span>
                                            </div>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-text-heading leading-tight tracking-tight">{currentTopic?.title}</h2>
                                    </div>

                                    <button
                                        onClick={handleMarkAsCompleted}
                                        disabled={isUpdatingProgress}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-[11px] tracking-tight transition-all shrink-0 ${
                                            isTopicCompleted
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 animate-in zoom-in-95 duration-300'
                                                : 'bg-[var(--text-heading)] text-[var(--bg-main)] hover:opacity-90 shadow-xl active:scale-95'
                                        }`}
                                    >                                    {isUpdatingProgress ? (
                                            <><Loader className="h-3.5 w-3.5 animate-spin" /> Syncing...</>
                                        ) : isTopicCompleted ? (
                                            <><Check className="h-3.5 w-3.5" /> Mastered</>
                                        ) : (
                                            "Mark Complete"
                                        )}                                </button>
                                </div>
                            )}

                            {viewMode === 'video' ? (
                                <div className="animate-in fade-in duration-500">
                                    <div className="mb-8 flex justify-center">
                                        <div className="w-full max-w-[1000px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-border relative group">
                                            {activeVideoId ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1`}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full border-0"
                                                    title={currentTopic.youtube_video_title || currentTopic.title}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-8 text-center bg-callout-bg">
                                                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                                    <h3 className="text-lg font-bold text-text-heading mb-2 tracking-tight">No video available</h3>                                                    <p className="manrope-body text-sm max-w-xs italic opacity-60">Please refer to the materials section for this topic to learn more and continue your progress.</p>
                                                </div>
                                            )}

                                            {showMuteTooltip && activeVideoId && (
                                                <div className="absolute top-6 right-6 z-10 animate-in fade-in zoom-in duration-300">
                                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3">
                                                        <VolumeX className="h-4 w-4 text-white/60" />
                                                        <p className="text-[10px] font-bold tracking-wide">Muted autoplay</p>
                                                        <button onClick={dismissMuteTooltip} className="ml-1 text-white/40 hover:text-white transition-colors">
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8 pb-20 mt-12">
                                        {/* Objectives */}
                                        <div>
                                            <h4 className="text-[12px] font-bold text-text-muted mb-3">
                                                Learning objectives
                                            </h4>
                                            {currentTopic?.subtopics && currentTopic.subtopics.length > 0 ? (
                                                <ul className="space-y-2 max-w-3xl">
                                                    {currentTopic.subtopics.map((sub: any, idx: number) => (
                                                        <li key={idx} className="manrope-body text-[14px] text-text-primary font-medium list-none flex gap-2">
                                                            <span className="text-accent opacity-50">•</span>
                                                            {sub.title}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="manrope-body text-[13px] text-text-muted italic">No specific objectives defined.</p>
                                            )}
                                        </div>

                                        {/* Materials */}
                                        <div>
                                            <h4 className="text-[12px] font-bold text-text-muted mb-3">
                                                Study materials
                                            </h4>
                                            {currentModule?.resources && currentModule.resources.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {currentModule.resources.map((res: any, idx: number) => (
                                                        <a 
                                                            key={idx}
                                                            href={res.url || res.link} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="manrope-body text-[13px] text-accent hover:underline flex items-center gap-2"
                                                        >
                                                            <span>→</span> {res.title || res.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="manrope-body text-[13px] text-text-muted italic">No materials available.</p>
                                            )}
                                        </div>

                                        {/* Weekly Target */}
                                        <div>
                                            <h4 className="text-[12px] font-bold text-text-muted mb-3">
                                                Weekly target
                                            </h4>
                                            <div className="max-w-2xl">
                                                <p className="manrope-body text-[14px] font-bold text-text-heading">
                                                    {currentModule?.outcome}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-10 mt-10 border-t border-border flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Link 
                                                    href={`/roadmap/${roadmap?.slug || id}`} 
                                                    className={`px-6 py-2 rounded-lg border border-border bg-background text-[11px] font-bold tracking-wide text-text-heading hover:bg-callout-bg transition-all shadow-sm`}
                                                >
                                                    Exit Learning
                                                </Link>
                                                {isWeekFullyCompleted && (
                                                    <Link 
                                                        href={`/roadmap/${roadmap?.slug || id}`} 
                                                        className="px-8 py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold tracking-wide hover:bg-emerald-700 shadow-xl transition-all"
                                                    >
                                                        Submit Weekly Work
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                                    <div className="max-w-[1000px] mx-auto">
                                        {/* Header */}
                                        <div className="mb-6 border-b border-border pb-6">
                                            <div className="flex items-center gap-2 text-accent mb-3 text-[9px] font-bold tracking-[0.15em] inconsolata-ui uppercase">
                                                <span className="bg-accent text-white px-2 py-0.5 rounded-none">Practice</span>
                                                <span className="text-[var(--border)]">/</span>
                                                <span className="text-text-muted">{currentModule?.is_extension ? 'Extension' : `Week ${currentModuleIndex + 1}`}</span>
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold text-text-heading mb-2 tracking-tight inconsolata-ui uppercase">
                                                {currentModule?.title || 'Practice Session'}
                                            </h2>
                                            <p className="manrope-body text-[12px] text-text-muted max-w-2xl italic leading-relaxed opacity-80">
                                                Practice what you&apos;ve learned with study materials and interactive questions.
                                            </p>
                                        </div>

                                        {/* Content Groups */}
                                        <div className="space-y-10">
                                            {/* Group 1: Study Materials */}
                                            <section>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <h3 className="text-[11px] font-bold text-text-heading tracking-[0.2em] uppercase inconsolata-ui opacity-60">01 / Study Materials</h3>
                                                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-10"></div>
                                                </div>
                                                
                                                <div className="bg-sidebar border border-border rounded-none overflow-hidden shadow-sm">
                                                    <table className="w-full text-left border-collapse">
                                                        <tbody className="divide-y divide-border/50">
                                                            {allWeekResources.length > 0 ? allWeekResources.map((res, idx) => (
                                                                <tr key={idx} className="hover:bg-callout-bg transition-colors group">
                                                                    <td className="px-5 py-3">
                                                                        <a href={res.url} target="_blank" rel="noreferrer" className="manrope-body text-[13px] font-bold text-text-heading hover:text-accent transition-colors flex items-center gap-3">
                                                                            <span className="text-[9px] text-text-muted inconsolata-ui opacity-30 group-hover:opacity-100 transition-all">{idx + 1}.</span>
                                                                            {res.title}
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            )) : (
                                                                <tr>
                                                                    <td className="px-5 py-8 text-center manrope-body text-[12px] text-text-muted italic opacity-60">
                                                                        No materials listed for this topic.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>

                                            {/* Group 2: Interactive assessments */}
                                            <section>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <h3 className="text-[11px] font-bold text-text-heading tracking-[0.2em] uppercase inconsolata-ui opacity-60">02 / Interactive Practice</h3>
                                                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-10"></div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Find Questions Card */}
                                                    <div className="bg-background border border-border rounded-none p-5 flex flex-col shadow-sm">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">🔍</span>
                                                                <h4 className="inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-widest">Find Questions</h4>
                                                            </div>
                                                            <span className="inconsolata-ui text-[8px] font-bold tracking-widest px-1.5 py-0.5 bg-background border border-border text-text-muted uppercase">Free</span>
                                                        </div>
                                                        <p className="manrope-body text-[11px] text-text-muted mb-6 italic leading-relaxed opacity-70">
                                                            Find high-quality practice questions from external platforms online.
                                                        </p>
                                                        
                                                        {practiceSession ? (
                                                            <div className="flex-1 space-y-2">
                                                                {practiceSession.resources.slice(0, 3).map((res) => (
                                                                    <div key={res.id} className="flex items-center gap-2.5 p-2.5 bg-sidebar border border-border/60 rounded-none">
                                                                        {practiceProgress[res.id] ? <span className="text-emerald-500 text-[10px]">✅</span> : <span className="opacity-20 inconsolata-ui text-[9px] font-bold">TODO</span>}
                                                                        <span className="text-[10px] font-bold text-text-heading truncate flex-1 inconsolata-ui uppercase tracking-tighter">{res.title}</span>
                                                                    </div>
                                                                ))}
                                                                {practiceSession.resources.length > 3 && (
                                                                    <p className="inconsolata-ui text-[8px] text-center text-text-muted font-bold tracking-[0.15em] pt-1.5 opacity-50">+{practiceSession.resources.length - 3} MORE</p>
                                                                )}
                                                                <div className="pt-5 mt-auto">
                                                                    <p className="inconsolata-ui text-[8px] font-bold text-emerald-500 mb-1 flex items-center gap-1.5 justify-center uppercase tracking-widest">
                                                                        <span>🤑</span> 01 COIN / TASK
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center py-8 border-t border-border/40 border-dashed">
                                                                <button 
                                                                    onClick={handleStartPractice}
                                                                    disabled={isGeneratingPractice}
                                                                    className="px-6 py-2 bg-[#111] dark:bg-text-heading text-background rounded-none text-[9px] font-bold inconsolata-ui uppercase tracking-[0.15em] hover:opacity-90 transition-all shadow-md active:scale-95"
                                                                >
                                                                    {isGeneratingPractice ? 'FINDING...' : 'FIND QUESTIONS'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Pro MCQ Assessment */}
                                                    <MCQPractice 
                                                        roadmapId={roadmap?.id || 0}
                                                        subtopicId={currentTopic?.uuid || ''}
                                                        topicName={currentTopic?.title || ''}
                                                        subject={roadmap?.subject || roadmap?.title || ''}
                                                        weekNumber={currentModuleIndex + 1}
                                                        isPro={profile?.is_pro || false}
                                                        userCredits={profile?.roadmap_credits || 0}
                                                        onPointsEarned={(amount) => {
                                                            setCoinToast({ show: true, amount });
                                                            setTimeout(() => setCoinToast(null), 3000);
                                                        }}
                                                        onRefreshProfile={refreshProfile}
                                                    />
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>

            {coinToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-black/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 min-w-[260px]">
                        <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-400 tracking-wide leading-none mb-1.5">Node mastered</p>
                            <p className="text-[15px] font-bold tracking-tight">+{coinToast.amount}🤑 System Points</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
