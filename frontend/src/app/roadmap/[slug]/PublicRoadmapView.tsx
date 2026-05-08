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
import { 
    Library, 
    Play, 
    Copy,
    Users,
    Clock,
    Target,
    X,
    Plus,
    ArrowRight
} from 'lucide-react';

interface Props {
    roadmap: any;
    slug: string;
}

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
    const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<{topic: any, moduleIndex: number} | null>(null);

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

    useEffect(() => {
        const fetchSubmissions = async () => {
            // Placeholder if needed later
        };
    }, [isAuthenticated]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const authStatus = !!session;
            setIsAuthenticated(authStatus);
            
            if (session && roadmap) {
                const sessionEmail = session.user.email?.toLowerCase();
                const roadmapEmail = roadmap?.email?.toLowerCase();
                const ownerStatus = sessionEmail === roadmapEmail;
                setIsOwner(ownerStatus);

                console.log("Auth Debug:", { 
                    isAuthenticated: authStatus, 
                    isOwner: ownerStatus, 
                    roadmapEmail, 
                    sessionEmail 
                });

                // ALWAYS fetch fresh roadmap data when authenticated to get personal progress/extension info
                try {
                    // Use getRoadmapBySlug which handles progress enrichment for authenticated users
                    const updatedRoadmap = await roadmapsAPI.getRoadmapBySlug(slug);
                    if (updatedRoadmap) {
                        setRoadmap(updatedRoadmap);
                    }
                } catch (err) {
                    console.error("Failed to fetch enriched roadmap data:", err);
                }
            }
        };
        checkAuth();
    }, [isAuthenticated, roadmap?.id, slug]);

    const handleRate = async (value: number) => {
        if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await exploreAPI.rateRoadmap(roadmap.id, value, session.access_token);
                setUserRating(value);
                const updated = await exploreAPI.getPublicRoadmap(roadmap.id);
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
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const res = await exploreAPI.cloneRoadmap(roadmap.id, session.access_token);
                setSuccessMsg("Roadmap cloned to dashboard!");
                // Short delay to show success message before redirect
                setTimeout(() => {
                    router.push(`/roadmap/${res.new_slug}/learn`);
                }, 1500);
            }
        } catch (err) {
            console.error("Failed to clone:", err);
            setError("Failed to clone roadmap.");
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

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        "name": roadmap.title,
                        "description": roadmap.goal || roadmap.description,
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
                        "timeRequired": roadmap.time_value ? `P${roadmap.time_value}${roadmap.time_unit?.[0].toUpperCase()}` : undefined,
                        "coursePrerequisites": "None",
                        "educationalLevel": "Intermediate",
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
                <div className="max-w-[1000px] mx-auto px-6 py-12 md:px-12 md:py-16">
                    
                    {/* Public Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-border pb-8">
                        <div className="space-y-3">
                            {successMsg && (
                                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-[12px] font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                                    {successMsg}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[12px] font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                                    {error}
                                </div>
                            )}
                            <h1 className="font-inter text-xl md:text-3xl font-bold text-text-heading tracking-tighter">
                                {roadmap.title}
                            </h1>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 manrope-body text-[13px] text-text-muted font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{roadmap.time_value} {roadmap.time_unit}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{roadmap.clone_count || 0} Learners</span>
                                </div>
                                <div className="text-accent/60">•</div>
                                <span className="text-accent font-bold uppercase tracking-widest text-[11px] font-inter">{roadmap.subject}</span>
                            </div>

                            {/* Social Sharing Component */}
                            <SocialShare 
                                title={roadmap.title} 
                                text={`Check out this ${roadmap.subject} roadmap on EulerFold:`} 
                                className="pt-2" 
                            />
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-1">
                            {(isOwner || roadmap.is_cloned) ? (
                                <button 
                                    onClick={handleContinueLearning}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center bg-accent text-white px-5 py-2.5 rounded-2xl font-bold text-[13px] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3 font-inter disabled:opacity-50"
                                >
                                    <Play className="w-4 h-4 fill-current" /> Continue Learning
                                </button>
                            ) : (
                                <button 
                                    onClick={handleClone}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center bg-text-heading text-background px-5 py-2.5 rounded-2xl font-bold text-[13px] transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] gap-3 shadow-lg font-inter"
                                >
                                    <Copy className="w-4 h-4" /> {saving ? 'Cloning...' : 'Clone to Dashboard'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Roadmap Description */}
                    {(roadmap.goal || roadmap.description) && (
                        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 mb-3">
                                <Target className="w-4 h-4 text-accent" />
                                <h2 className="manrope-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-heading font-inter">Objective</h2>
                            </div>
                            <p className="manrope-body text-[15px] text-text-primary leading-relaxed font-medium bg-accent-muted/30 p-5 rounded-2xl border border-accent/10 italic">
                                &ldquo;{roadmap.goal || roadmap.description}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Main Roadmap Display */}
                    <div className="mb-20">
                        {/* DEBUG: {JSON.stringify({ isPro, isOwner, completed: roadmap.progress?.completed_topics, total: roadmap.progress?.total_topics, extCount: roadmap.extension_count })} */}
                        <RoadmapDisplay 
                            roadmapData={roadmap} 
                            isOwner={isOwner || roadmap.is_cloned}
                            justGenerated={false}
                            hideHeader={true}
                            onExtend={
                                isPro && isOwner && (roadmap.progress?.completed_topics || 0) >= (roadmap.progress?.total_topics || 1) && (roadmap.extension_count || 0) < 5
                                ? () => setShowExtendModal(true)
                                : undefined
                            }
                            onDeleteExtension={handleDeleteExtension}
                            onPractice={(topic, mIdx) => setSelectedPracticeTopic({ topic, moduleIndex: mIdx })}
                        />
                    </div>

                    {/* Steps Flow */}
                    <div className="mb-24 py-16 border-y border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "Learn", sub: "Watch curated videos and read study resources" },
                                { title: "Practice", sub: "Practice what you learned" },
                                { title: "Build Projects", sub: "Build projects using your new gained knowledge" },
                                { title: "Submit & Verify", sub: "Submit your project and get verified by our system" }
                            ].map((step, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-muted text-accent font-bold font-inter border border-accent/20">
                                        0{idx + 1}
                                    </div>
                                    <h3 className="font-inter text-[16px] font-bold text-text-heading mb-2 tracking-tight">{step.title}</h3>
                                    <p className="manrope-body text-[13px] text-text-muted leading-relaxed font-medium italic opacity-80">{step.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* References Section */}
                    {roadmap.roadmap_plan?.modules?.some((m: any) => m.resources?.length > 0) && (
                        <div className="mb-24 pb-12 border-b border-border/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Library className="w-5 h-5 text-accent" />
                                <h2 className="manrope-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-heading font-inter">References</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {Array.from(new Map(
                                    roadmap.roadmap_plan.modules
                                        .flatMap((m: any) => m.resources || [])
                                        .map((r: any) => [r.link || r.url, r])
                                ).values()).map((resource: any, idx) => (
                                    <div key={idx} className="flex items-start gap-4 group">
                                        <span className="manrope-body text-[11px] font-bold text-text-muted mt-1 w-5 shrink-0 opacity-40 font-inter">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <a 
                                            href={resource.link || resource.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="manrope-body text-[14px] text-text-primary hover:text-accent transition-colors leading-relaxed font-medium"
                                        >
                                            {resource.title || resource.name || resource.url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback Stars - Minimal Layout */}
                    <div className="mt-20 mb-16 text-center border-t border-border/50 pt-12">
                        <h2 className="manrope-body text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 font-inter">Rate this roadmap</h2>
                        <div className="flex justify-center mb-4">
                            <StarRating 
                                rating={rating} 
                                count={ratingCount} 
                                size={32}
                                interactive={isAuthenticated && !isOwner}
                                onRate={handleRate}
                            />
                        </div>
                        <p className="manrope-body text-[13px] text-text-muted italic opacity-70">
                            Help the community find high-signal technical paths.
                        </p>
                    </div>

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
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
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
                                        className="w-full h-24 bg-callout-bg border border-border rounded-2xl p-4 text-[14px] manrope-body focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
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
                                                className={`py-3 rounded-xl border inconsolata-ui text-[13px] font-bold transition-all ${
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
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[14px] font-bold inconsolata-ui tracking-wide hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/10"
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
                                        You can extend this roadmap up to 5 times. (Current: {roadmap.extension_count || 0}/5)
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

            <Footer />
        </div>
    );
}
