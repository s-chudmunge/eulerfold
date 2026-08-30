"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { exploreAPI, authAPI, roadmapsAPI } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import StarRating from '@/components/roadmap/StarRating';
import { DiscussionSection } from '@/components/discussions/DiscussionSection';
import MCQPractice from '@/components/roadmap/MCQPractice';
import SocialShare from '@/components/SocialShare';
import RoadmapBanner from '@/components/FluidGradient/RoadmapBanner';
import HomeworkSubmissionModal from '@/components/roadmap/HomeworkSubmissionModal';
import { 
    Library, 
    Play, 
    Copy,
    Users,
    Clock,
    Target,
    X,
    Plus,
    ArrowRight,
    User,
    Calendar,
    Check,
    CheckCircle2,
    BookOpen,
    GraduationCap,
    AlertCircle,
    Star,
    ExternalLink
} from 'lucide-react';

const getDomain = (url: string) => {
    if (!url) return 'Reference Material';
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return 'Reference Material';
    }
};

interface Props {
    roadmap: any;
    slug: string;
}

const ModuleReferenceCarousel = ({ module, index }: { module: any, index: number }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!module.resources || module.resources.length === 0) return null;

    const uniqueResources = Array.from(new Map(
        module.resources.map((r: any) => [r.link || r.url, r])
    ).values()) as any[];

    if (uniqueResources.length === 0) return null;

    return (
        <div className="mb-12 w-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2 md:px-0">
                <h3 className="manrope-body text-[13px] font-bold text-text-heading/80">
                    Week {index + 1}: {module.title}
                </h3>
                {uniqueResources.length > 2 && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-1.5 rounded-full bg-sidebar border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-1.5 rounded-full bg-sidebar border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth"
            >
                {uniqueResources.map((resource: any, idx: number) => (
                    <a 
                        key={idx}
                        href={resource.link || resource.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="snap-start shrink-0 w-[260px] md:w-[280px] h-[160px] p-5 rounded-md border border-border/60 bg-sidebar/50 hover:bg-background/80 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Feature Image Background (if available) */}
                        {(resource.image_url || resource.image) && (
                            <>
                                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundImage: `url(${resource.image_url || resource.image})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent" />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold text-[12px] font-inconsolata border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                            <h3 className="manrope-body text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors leading-snug line-clamp-3">
                                {resource.title || resource.name || resource.url}
                            </h3>
                        </div>
                        <div className="relative z-10 mt-2 pt-3 border-t border-border/50 flex items-center gap-2">
                            <img 
                                src={`https://s2.googleusercontent.com/s2/favicons?domain=${getDomain(resource.link || resource.url)}&sz=64`} 
                                alt="" 
                                className="w-3.5 h-3.5 rounded-sm grayscale group-hover:grayscale-0 transition-all duration-300" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <span className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-bold font-inter truncate">
                                {getDomain(resource.link || resource.url)}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default function PublicRoadmapView({ roadmap: initialRoadmap, slug }: Props) {
    const [roadmap, setRoadmap] = useState(initialRoadmap);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rating, setRating] = useState(initialRoadmap?.average_rating || 0);
    const [ratingCount, setRatingCount] = useState(initialRoadmap?.rating_count || 0);
    const [userRating, setUserRating] = useState<number | null>(null);

    // Extension State
    const [isPro, setIsPro] = useState<boolean>(false);
    const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
    const [extensionWeeks, setExtensionWeeks] = useState<number>(1);
    const [extensionGoal, setExtensionGoal] = useState<string>('');
    const [extending, setExtending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [cloneSuccess, setCloneSuccess] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<{topic: any, moduleIndex: number} | null>(null);
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState<boolean>(false);
    const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
    const [submittingModule, setSubmittingModule] = useState<{number: number, title: string, instructions?: string} | null>(null);
    const [viewOnlyResult, setViewOnlyResult] = useState<any>(null);
    const [similarRoadmaps, setSimilarRoadmaps] = useState<any[]>([]);

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

    const fetchSubmissions = React.useCallback(async () => {
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
    }, [isAuthenticated, roadmap?.id]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const fetchSimilarRoadmaps = React.useCallback(async () => {
        if (roadmap?.id) {
            try {
                // Since this is a public API, we might not need auth, or we can use the fetch API directly.
                // But let's use standard fetch calling our backend endpoint
                const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const sourceId = roadmap.cloned_from || roadmap.id;
                const response = await fetch(`${url}/roadmaps/${sourceId}/similar`);
                if (response.ok) {
                    const data = await response.json();
                    setSimilarRoadmaps(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch similar roadmaps:", err);
            }
        }
    }, [roadmap?.id, roadmap?.cloned_from]);

    useEffect(() => {
        fetchSimilarRoadmaps();
    }, [fetchSimilarRoadmaps]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const authStatus = !!session;
            setIsAuthenticated(authStatus);
            
            // ALWAYS fetch fresh roadmap data to get accurate stats and personal progress
            try {
                const updatedRoadmap = await roadmapsAPI.getRoadmapBySlug(slug);
                if (updatedRoadmap) {
                    setRoadmap(updatedRoadmap);
                    
                    if (session) {
                        const sessionEmail = session.user.email?.toLowerCase();
                        const roadmapEmail = updatedRoadmap.email?.toLowerCase();
                        let ownerStatus = false;
                        if (sessionEmail && roadmapEmail && sessionEmail === roadmapEmail) {
                            ownerStatus = true;
                        }
                        
                        if (!ownerStatus && profile && updatedRoadmap.user_id) {
                            if (profile.id === updatedRoadmap.user_id) {
                                ownerStatus = true;
                            }
                        }
                        
                        setIsOwner(ownerStatus);
                        
                        console.log("Auth Debug:", { 
                            isAuthenticated: authStatus, 
                            isOwner: ownerStatus, 
                            roadmapEmail, 
                            sessionEmail 
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch enriched roadmap data:", err);
            }
        };
        checkAuth();
    }, [isAuthenticated, roadmap?.id, slug]);

    const handleSignIn = () => {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };

    const handleRate = async (value: number) => {
        if (!isAuthenticated) {
            handleSignIn();
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const targetId = roadmap.cloned_from || roadmap.id;
                await exploreAPI.rateRoadmap(targetId, value, session.access_token);
                setUserRating(value);
                const updated = await exploreAPI.getPublicRoadmap(targetId);
                setRating(updated.average_rating || 0);
                setRatingCount(updated.rating_count || 0);
            }
        } catch (err) {
            console.error("Failed to rate:", err);
        }
    };

    const handleContinueLearning = async () => {
        if (!roadmap) return;
        
        if (isOwner) {
            router.push(`/roadmap/${slug}/learn`);
            return;
        }

        if (roadmap.is_cloned) {
            setSaving(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data, error } = await supabase
                        .from('roadmaps')
                        .select('slug')
                        .eq('email', session.user.email?.toLowerCase())
                        .eq('cloned_from', roadmap.id)
                        .maybeSingle();
                    
                    if (data?.slug) {
                        router.push(`/roadmap/${data.slug}/learn`);
                    } else {
                        // Fallback if clone record not found but flag was true
                        router.push(`/roadmap/${slug}/learn`);
                    }
                }
            } catch (err) {
                console.error("Failed to find clone:", err);
                router.push(`/roadmap/${slug}/learn`);
            } finally {
                setSaving(false);
            }
        }
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
                setCloneSuccess(true);
                
                // Short delay to show success message inside modal, then redirect to the learn page
                setTimeout(() => {
                    const nextSlug = res.new_slug || slug;
                    router.push(`/roadmap/${nextSlug}/learn`);
                }, 1500);
            }
        } catch (err) {
            console.error("Failed to clone:", err);
            setError("Failed to clone roadmap.");
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

    return (
        <div className="min-h-screen text-text-primary flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        "name": roadmap.title,
                        "description": roadmap.roadmap_plan?.about || roadmap.goal || roadmap.description,
                        "creator": {
                            "@type": "Person",
                            "name": roadmap.author || "EulerFold User"
                        },
                        "provider": {
                            "@type": "EducationalOrganization",
                            "name": "EulerFold",
                            "url": "https://www.eulerfold.com"
                        },
                        "about": roadmap.subject,
                        "audience": roadmap.roadmap_plan?.who_is_this_for?.tags ? {
                            "@type": "Audience",
                            "audienceType": roadmap.roadmap_plan.who_is_this_for.tags.join(", ")
                        } : undefined,
                        "teaches": roadmap.roadmap_plan?.what_you_will_learn ? roadmap.roadmap_plan.what_you_will_learn.join(" ") : undefined,
                        "timeRequired": roadmap.time_value ? `P${roadmap.time_value}${roadmap.time_unit?.[0].toUpperCase()}` : undefined,
                        "coursePrerequisites": roadmap.roadmap_plan?.prerequisites?.items?.join(", ") || "None",
                        "educationalLevel": roadmap.roadmap_plan?.prerequisites?.level === 'beginner' ? 'Beginner' : roadmap.roadmap_plan?.prerequisites?.level === 'advanced' ? 'Advanced' : 'Intermediate',
                        "syllabusSections": roadmap.roadmap_plan?.modules?.map((m: any) => ({
                            "@type": "Syllabus",
                            "name": m.title,
                            "description": m.outcome
                        }))
                    })
                }}
            />
            <PublicHeader />
            
            <main className="flex-grow">
                <RoadmapBanner 
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
                    isAuthenticated={isAuthenticated}
                    saving={saving}
                    onStartLearning={() => {
                        handleContinueLearning();
                    }}
                    onClone={() => {
                        setCloneSuccess(false);
                        handleClone();
                    }}
                />
                <div className="max-w-[1000px] mx-auto px-6 pb-12 md:px-12 md:pb-16 relative mt-10">
                    
                    {/* Alerts Area */}
                    <div className="space-y-2 mb-8">
                        {successMsg && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-[13px] font-bold animate-in fade-in slide-in-from-top-1 duration-300">
                                {successMsg}
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[13px] font-bold animate-in fade-in slide-in-from-top-1 duration-300">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Course Overview Section */}
                    {(roadmap.roadmap_plan?.what_you_will_learn || roadmap.roadmap_plan?.about) && (
                        <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                            {/* Main Content (Left) */}
                            <div className="lg:col-span-8 space-y-12">
                                {/* About This Course */}
                                {roadmap.roadmap_plan.about && (
                                    <div>
                                        <h2 className="font-inter text-2xl font-bold text-text-heading mb-6 tracking-tight">About this Course</h2>
                                        <div className="manrope-body text-[15px] text-text-primary/90 leading-[1.8] whitespace-pre-line">
                                            {roadmap.roadmap_plan.about}
                                        </div>
                                    </div>
                                )}

                                {/* What You'll Learn */}
                                {roadmap.roadmap_plan.what_you_will_learn && (
                                    <div>
                                        <h2 className="font-inter text-2xl font-bold text-text-heading mb-6 tracking-tight">What you'll learn</h2>
                                        <div className="flex flex-col gap-3">
                                            {roadmap.roadmap_plan.what_you_will_learn.map((item: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-4">
                                                    <Check className="w-[18px] h-[18px] text-accent shrink-0 mt-[2px]" strokeWidth={2.5} />
                                                    <span className="manrope-body text-[15px] text-text-primary/90 leading-relaxed font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar (Right) */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-28 space-y-6 p-5 md:p-6 rounded-lg bg-sidebar/30 border border-border/40 backdrop-blur-sm">
                                    {/* Prerequisites */}
                                    {roadmap.roadmap_plan.prerequisites && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Star className="w-4 h-4 text-accent" />
                                                <h3 className="font-inter text-[15px] font-bold text-text-heading tracking-tight">Prerequisites</h3>
                                            </div>
                                            
                                            <div className="mb-4 flex items-center gap-2.5 bg-background/50 border border-border/60 shadow-sm w-fit px-3 py-1 rounded-lg">
                                                <div className="flex items-end gap-[3px] h-3.5">
                                                    <div className={`w-1.5 rounded-sm transition-colors ${roadmap.roadmap_plan.prerequisites.level ? (roadmap.roadmap_plan.prerequisites.level === 'beginner' ? 'bg-emerald-500 h-1.5' : roadmap.roadmap_plan.prerequisites.level === 'intermediate' ? 'bg-amber-500 h-1.5' : 'bg-rose-500 h-1.5') : 'bg-border h-1.5'}`} />
                                                    <div className={`w-1.5 rounded-sm transition-colors ${['intermediate', 'advanced'].includes(roadmap.roadmap_plan.prerequisites.level) ? (roadmap.roadmap_plan.prerequisites.level === 'intermediate' ? 'bg-amber-500 h-2.5' : 'bg-rose-500 h-2.5') : 'bg-border/40 h-2.5'}`} />
                                                    <div className={`w-1.5 rounded-sm transition-colors ${roadmap.roadmap_plan.prerequisites.level === 'advanced' ? 'bg-rose-500 h-3.5' : 'bg-border/40 h-3.5'}`} />
                                                </div>
                                                <span className="font-inter text-[12px] font-bold text-text-heading capitalize tracking-tight">
                                                    {roadmap.roadmap_plan.prerequisites.level} Level
                                                </span>
                                            </div>
                                            
                                            <p className="manrope-body text-[13px] text-text-muted leading-relaxed font-medium mb-4">
                                                {roadmap.roadmap_plan.prerequisites.description}
                                            </p>
                                            
                                            {roadmap.roadmap_plan.prerequisites.items?.length > 0 && (
                                                <ul className="space-y-2.5">
                                                    {roadmap.roadmap_plan.prerequisites.items.map((item: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-2.5">
                                                            <Star className="w-3.5 h-3.5 text-accent/80 mt-1 shrink-0 fill-accent/80" />
                                                            <span className="manrope-body text-[13px] text-text-muted font-medium leading-[1.6]">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {roadmap.roadmap_plan.prerequisites.recommended_foundations && roadmap.roadmap_plan.prerequisites.recommended_foundations.length > 0 && (
                                                <div className="mt-5 pt-4 border-t border-border/40">
                                                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] inconsolata-ui mb-3 block opacity-70">
                                                        Recommended Prep
                                                    </span>
                                                    <div className="flex flex-col gap-2">
                                                        {roadmap.roadmap_plan.prerequisites.recommended_foundations.map((found: any, idx: number) => (
                                                            <Link 
                                                                key={idx}
                                                                href={`/roadmap/${found.slug}`}
                                                                className="group flex items-center justify-between p-2.5 rounded-md border border-border/60 bg-background/50 hover:bg-background/80 hover:border-accent/40 transition-all"
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <Star className="w-3.5 h-3.5 text-accent/80 shrink-0 fill-accent/80" />
                                                                    <span className="text-[13px] font-semibold text-text-heading group-hover:text-accent transition-colors">
                                                                        {found.title}
                                                                    </span>
                                                                </div>
                                                                <span className="shrink-0 text-text-muted opacity-50 group-hover:opacity-100 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-sm">
                                                                    &rarr;
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {roadmap.roadmap_plan.prerequisites && roadmap.roadmap_plan.who_is_this_for && (
                                        <hr className="border-border/40" />
                                    )}

                                    {/* Who is this for */}
                                    {roadmap.roadmap_plan.who_is_this_for && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Users className="w-4 h-4 text-accent" />
                                                <h3 className="font-inter text-[15px] font-bold text-text-heading tracking-tight">Ideal for</h3>
                                            </div>
                                            
                                            <p className="manrope-body text-[13px] text-text-muted leading-relaxed font-medium mb-4">
                                                {roadmap.roadmap_plan.who_is_this_for.description}
                                            </p>
                                            
                                            {roadmap.roadmap_plan.who_is_this_for.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {roadmap.roadmap_plan.who_is_this_for.tags.map((tag: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-md border border-border/60 bg-background/50 hover:bg-background/80 hover:border-accent/40 transition-colors">
                                                            <User className="w-3 h-3 text-accent/80" />
                                                            <span className="text-[12px] font-semibold text-text-heading tracking-tight">{tag}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-20 relative" id="course-content">
                        {/* DEBUG: {JSON.stringify({ isPro, isOwner, completed: roadmap.progress?.completed_topics, total: roadmap.progress?.total_topics, extCount: roadmap.extension_count })} */}
                        <RoadmapDisplay 
                            roadmapData={roadmap} 
                            isOwner={isOwner || roadmap.is_cloned}
                            justGenerated={false}
                            hideHeader={true}
                            onCloneRequired={() => setShowCloneModal(true)}
                            onSignInRequired={handleSignIn}
                            externalSubmissions={submissions}
                            onExtend={
                                isPro && isOwner && (roadmap.progress?.completed_topics || 0) >= (roadmap.progress?.total_topics || 1) && (roadmap.extension_count || 0) < 5
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

                    {/* References Section */}
                    {roadmap.roadmap_plan?.modules?.some((m: any) => m.resources?.length > 0) && (
                        <div className="mb-24 pb-12 border-b border-border/50 w-full relative">
                            <div className="flex items-center gap-3 mb-8">
                                <Library className="w-5 h-5 text-accent" />
                                <h2 className="manrope-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-heading font-inter">References</h2>
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                {roadmap.roadmap_plan.modules.map((module: any, index: number) => (
                                    <ModuleReferenceCarousel key={index} module={module} index={index} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback Stars - Ultra Minimal Layout */}
                    <div className="mt-16 mb-12 flex items-center justify-between border-t border-border/30 pt-8">
                        <span className="text-[13px] font-bold text-text-muted uppercase tracking-wider">Rate this course</span>
                        <StarRating 
                            rating={rating} 
                            count={ratingCount} 
                            size={20}
                            interactive={isAuthenticated && !isOwner}
                            onRate={handleRate}
                        />
                    </div>

                    {/* Similar Roadmaps */}
                    {similarRoadmaps && similarRoadmaps.length > 0 && (
                        <div className="mt-16 mb-24 max-w-4xl mx-auto px-4">
                            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                                <h2 className="text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] font-inter">
                                    Keep Exploring
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {similarRoadmaps.map((simRoadmap: any, idx: number) => (
                                    <Link 
                                        key={idx} 
                                        href={`/roadmap/${simRoadmap.slug}`}
                                        className="group relative flex flex-col p-6 rounded-lg border border-border/60 bg-sidebar/50 hover:bg-background/80 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Subtle gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                                        
                                        <h3 className="relative text-[16px] font-bold text-text-heading group-hover:text-accent transition-colors leading-snug mb-3 mt-2">
                                            {simRoadmap.title}
                                        </h3>
                                        <p className="relative text-[13px] text-text-muted font-medium line-clamp-3 leading-relaxed mb-6">
                                            {simRoadmap.description}
                                        </p>
                                        
                                        {/* Footer area with Arrow */}
                                        <div className="relative mt-auto flex items-center text-accent/80 group-hover:text-accent font-bold text-[12px] uppercase tracking-wider transition-colors">
                                            View Course 
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discussion Section */}
                    <DiscussionSection 
                        contextId={roadmap.id.toString()} 
                        contextType="roadmap" 
                        title="Community Insights"
                    />
                </div>
            </main>

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
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setExtensionWeeks(w)}
                                                className={`py-3 rounded-lg border inconsolata-ui text-[13px] font-bold transition-all ${
                                                    extensionWeeks === w 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                    : 'bg-callout-bg border-border text-text-muted hover:border-emerald-500/30'
                                                }`}
                                            >
                                                +{w} Week{w > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleExtend}
                                        disabled={extending}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-lg text-[14px] font-bold inconsolata-ui tracking-wide hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/10"
                                    >
                                        {extending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Generating Extension...
                                            </>
                                        ) : (
                                            <>
                                                Extend Now
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center mt-4 manrope-body text-[10px] text-text-muted font-medium italic">
                                        You can extend this course up to 5 times. (Current: {roadmap.extension_count || 0}/5)
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-200">
                    <div className="w-full max-w-[420px] bg-background border border-border shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 flex gap-4 md:gap-5 items-start">
                            {cloneSuccess ? (
                                <div className="flex flex-col items-center justify-center w-full py-4 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-7 h-7 stroke-[3px]" />
                                    </div>
                                    <h3 className="manrope-body text-[16px] font-bold text-text-heading mb-1.5 tracking-tight">Course Cloned Successfully!</h3>
                                    <p className="manrope-body text-[13px] text-text-muted font-medium">
                                        Redirecting to your dashboard...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="shrink-0 w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                                        <Copy className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h3 className="manrope-body text-[16px] font-bold text-text-heading mb-1.5 tracking-tight">Clone to Dashboard</h3>
                                        <p className="manrope-body text-[13px] text-text-muted mb-5 leading-relaxed font-medium">
                                            Clone this course to start learning, track your progress, and submit homework.
                                        </p>
                                        <div className="flex w-full gap-2 justify-end">
                                            <button
                                                onClick={() => setShowCloneModal(false)}
                                                disabled={saving}
                                                className="px-4 h-9 bg-sidebar text-text-primary border border-border font-bold text-[12px] hover:bg-callout-bg rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleClone}
                                                disabled={saving}
                                                className="px-5 h-9 bg-accent text-white rounded-lg text-[12px] font-bold transition-all hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                {saving ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Clone
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
