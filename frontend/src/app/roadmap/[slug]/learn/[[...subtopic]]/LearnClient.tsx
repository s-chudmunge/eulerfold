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
  Library,
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
  Info,
  Terminal,
  Box,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import CourseHeader from '@/components/CourseHeader';
import MCQPractice from './MCQPractice';
import SyllabusModal from './SyllabusModal';
import TaskModal from '@/components/planner/TaskModal';
import YouTubePlayer from '@/components/roadmap/YouTubePlayer';

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
    const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
                onOpenSyllabus={() => setIsSyllabusOpen(true)}
                modules={modules}
                currentModuleIndex={currentModuleIndex}
                onModuleChange={(idx) => handleTopicChange(idx, 0)}
            />

            <div className="flex flex-1 relative overflow-hidden mt-14">
                {/* Sidebar Overlay for Mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-40 w-[280px] bg-sidebar border-r border-border transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
                    <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                        <div className="mb-6">
                            <h2 className="text-[13px] font-bold text-text-heading leading-tight">
                                {currentModule?.title?.toLowerCase().startsWith('module') 
                                    ? currentModule.title 
                                    : `Module ${currentModuleIndex + 1}: ${currentModule?.title}`}
                            </h2>
                        </div>
                        
                        <div className="space-y-1">
                            {currentModule?.topics?.map((topic: any, tIdx: number) => {
                                const isCompleted = completedTopics.has(`${currentModuleIndex + 1}-${tIdx}`);
                                const isActive = tIdx === currentTopicIndex;
                                const hasVideo = !!topic.youtube_video_id;
                                
                                return (
                                    <button
                                        key={tIdx}
                                        onClick={() => handleTopicChange(currentModuleIndex, tIdx)}
                                        className={`w-full flex items-start text-left px-3 py-3 rounded-lg text-[13px] transition-all group ${
                                            isActive 
                                                ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold shadow-sm' 
                                                : 'hover:bg-callout-bg text-text-primary hover:text-text-heading'
                                        }`}
                                    >
                                        <div className="mr-3 mt-0.5 shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : hasVideo ? (
                                                <PlayCircle className={`h-5 w-5 ${isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                                            ) : (
                                                <Library className={`h-5 w-5 ${isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="line-clamp-2 leading-snug font-medium">{topic.title}</span>
                                            <span className="text-[10px] mt-1 opacity-80">
                                                {hasVideo ? (
                                                    `Video • ${typeof topic.duration === 'string' ? topic.duration.replace('m', ' min') : (topic.duration ? `${topic.duration} min` : '8 min')}`
                                                ) : (
                                                    'Resources available'
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}

                            <div className="pt-2 space-y-2">
                                <button 
                                    onClick={() => setViewMode('practice')}
                                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-[13px] transition-all group ${
                                        viewMode === 'practice' 
                                            ? "bg-[var(--accent)]/10 text-[var(--accent)] font-semibold shadow-sm" 
                                            : "text-text-primary hover:text-text-heading hover:bg-callout-bg"
                                    }`}
                                >
                                    <Target className={`h-5 w-5 mt-0.5 ${viewMode === 'practice' ? 'text-accent' : 'opacity-60'}`} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Interactive Practice</span>
                                        <span className="text-[10px] mt-1 opacity-80 group-hover:opacity-100 transition-opacity">Test your knowledge</span>
                                    </div>
                                </button>

                                <Link 
                                    href={`${roadmap?.model === 'manual-build' ? '/project' : '/roadmap'}/${roadmap?.slug || id}/build/${currentModuleIndex + 1}`}
                                    className="w-full flex items-start gap-3 px-3 py-3 rounded-lg text-[13px] text-text-primary hover:text-text-heading hover:bg-callout-bg transition-all group"
                                >
                                    <Box className="h-5 w-5 opacity-60 mt-0.5 group-hover:opacity-100" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">BuildPilot</span>
                                        <span className="text-[10px] mt-1 opacity-80 group-hover:opacity-100 transition-opacity">Submit proof of work for audit</span>
                                    </div>
                                </Link>                            </div>
                        </div>

                        {/* Module Navigation */}
                        <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                            {currentModuleIndex > 0 && (
                                <div>
                                    <p className="text-[11px] font-bold text-text-primary uppercase tracking-wider mb-2 px-1">Previous</p>
                                    <button 
                                        onClick={() => handleTopicChange(currentModuleIndex - 1, 0)}
                                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-[13px] font-bold text-text-heading hover:bg-callout-bg transition-all group"
                                    >
                                        <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                                        <span className="truncate ml-2 text-right">
                                            {modules[currentModuleIndex - 1].title?.toLowerCase().startsWith('module')
                                                ? modules[currentModuleIndex - 1].title
                                                : `Module ${currentModuleIndex}: ${modules[currentModuleIndex - 1].title}`}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {currentModuleIndex < modules.length - 1 && (
                                <div>
                                    <p className="text-[11px] font-bold text-text-primary uppercase tracking-wider mb-2 px-1">Next</p>
                                    <button 
                                        onClick={() => handleTopicChange(currentModuleIndex + 1, 0)}
                                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-[13px] font-bold text-text-heading hover:bg-callout-bg transition-all group"
                                    >
                                        <span className="truncate mr-2 text-left">
                                            {modules[currentModuleIndex + 1].title?.toLowerCase().startsWith('module')
                                                ? modules[currentModuleIndex + 1].title
                                                : `Module ${currentModuleIndex + 2}: ${modules[currentModuleIndex + 1].title}`}
                                        </span>
                                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Footer with Progress */}
                    <div className="p-4 border-t border-border bg-sidebar/50">
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 px-1">
                                <span className="text-text-primary uppercase tracking-wider">Progress</span>
                                <span className="text-text-heading">{Math.round((completedInCurrentWeekCount / currentWeekTopicsCount) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${(completedInCurrentWeekCount / currentWeekTopicsCount) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <button className="text-text-primary hover:text-text-heading transition-colors" title="Help">
                                    <Info className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                </button>
                                <button 
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="text-text-primary hover:text-text-heading transition-colors" 
                                    title="Add to Planner"
                                >
                                    <Calendar className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                </button>
                            </div>
                            <Link href={`/roadmap/${roadmap?.slug || id}`} className="text-text-primary hover:text-text-heading transition-colors">
                                <LayoutDashboard className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="max-w-[1200px] mx-auto w-full p-4 md:p-8">
                            
                            {viewMode === 'video' ? (
                                <div className="animate-in fade-in duration-500">
                                    {/* Video Player Container */}
                                    <div className="bg-image-bg border border-border rounded-xl overflow-hidden shadow-sm mb-8">
                                        <div className="aspect-video w-full bg-black relative group">
                                            {activeVideoId ? (
                                                <YouTubePlayer
                                                    videoId={activeVideoId}
                                                    title={currentTopic.youtube_video_title || currentTopic.title}
                                                    onComplete={handleMarkAsCompleted}
                                                    onNext={handleNext}
                                                    isCompleted={isTopicCompleted}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-8 text-center bg-callout-bg">
                                                    <Library className="h-12 w-12 mb-4 opacity-20" />
                                                    <h3 className="text-lg font-bold text-text-heading mb-2">No video available</h3>
                                                    <p className="manrope-body text-sm max-w-xs italic opacity-60">Please refer to the materials section for this topic.</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-4 border-t border-border flex items-center justify-between">
                                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-[12px] font-bold text-text-muted hover:bg-callout-bg transition-all">
                                                <Menu className="h-3.5 w-3.5" />
                                                Show Transcript
                                            </button>

                                            <button
                                                onClick={handleMarkAsCompleted}
                                                disabled={isUpdatingProgress}
                                                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-[12px] transition-all ${
                                                    isTopicCompleted
                                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                        : 'bg-text-heading text-background hover:opacity-90 shadow-lg active:scale-95'
                                                }`}
                                            >
                                                {isUpdatingProgress ? (
                                                    <Loader className="h-3.5 w-3.5 animate-spin" />
                                                ) : isTopicCompleted ? (
                                                    <><Check className="h-3.5 w-3.5" /> Completed</>
                                                ) : (
                                                    "Mark as Mastered"
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="max-w-4xl">
                                        <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-6 tracking-tight">
                                            {currentTopic?.title}
                                        </h1>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                                            <div className="md:col-span-2 space-y-8">
                                                <section>
                                                    <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-[0.1em] mb-4">
                                                        Learning Objectives
                                                    </h4>
                                                    {currentTopic?.subtopics?.length > 0 ? (
                                                        <ul className="space-y-3">
                                                            {currentTopic.subtopics.map((sub: any, idx: number) => (
                                                                <li key={idx} className="manrope-body text-[15px] text-text-primary flex gap-3">
                                                                    <span className="text-accent/40 font-bold">•</span>
                                                                    {sub.title}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[14px] text-text-muted italic">No specific objectives defined for this node.</p>
                                                    )}
                                                </section>

                                                <section>
                                                    <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-[0.1em] mb-4">
                                                        Weekly Outcome
                                                    </h4>
                                                    <div className="p-5 bg-callout-bg border border-callout-border rounded-xl">
                                                        <p className="manrope-body text-[15px] font-medium text-text-heading leading-relaxed">
                                                            {currentModule?.outcome}
                                                        </p>
                                                    </div>
                                                </section>
                                            </div>

                                            <div className="space-y-8">
                                                <section>
                                                    <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-[0.1em] mb-4">
                                                        Resources
                                                    </h4>
                                                    <div className="flex flex-col gap-2">
                                                        {currentModule?.resources?.map((res: any, idx: number) => (
                                                            <a 
                                                                key={idx}
                                                                href={res.url || res.link} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="text-[13px] text-accent hover:underline flex items-start gap-2 group"
                                                            >
                                                                <FileText className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100" />
                                                                <span className="leading-tight">{res.title || res.name}</span>
                                                            </a>
                                                        ))}
                                                        {(!currentModule?.resources || currentModule.resources.length === 0) && (
                                                            <p className="text-[12px] text-text-muted italic">No supplementary materials.</p>
                                                        )}
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <MCQPractice
                                    roadmapId={roadmap.id}
                                    subtopicId={currentTopic?.uuid || ''}
                                    topicTitle={currentTopic?.title || ''}
                                    onComplete={() => {
                                        setCoinToast({ show: true, amount: 5 });
                                        setTimeout(() => setCoinToast(null), 4000);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {coinToast && (
                <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[var(--text-heading)] text-[var(--bg-main)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                         <p className="text-[15px] font-bold tracking-tight">+{coinToast.amount}🤑 System Points</p>
                        </div>
                    </div>
                </div>
            )}

            <SyllabusModal 
                isOpen={isSyllabusOpen}
                onClose={() => setIsSyllabusOpen(false)}
                roadmap={roadmap}
                currentModuleIndex={currentModuleIndex}
                completedTopics={completedTopics}
                onTopicChange={handleTopicChange}
            />

            {isTaskModalOpen && (
                <TaskModal 
                    task={null}
                    initialDate={new Date()}
                    onClose={() => setIsTaskModalOpen(false)}
                    onRefresh={() => {
                        // Optional: show a toast or refresh some state
                    }}
                    initialRoadmapId={roadmap.id}
                    initialModuleNumber={currentModuleIndex + 1}
                />
            )}
        </div>
    );
}
