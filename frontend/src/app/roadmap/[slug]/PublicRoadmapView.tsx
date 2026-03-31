"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { exploreAPI } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import StarRating from '@/components/roadmap/StarRating';
import { DiscussionSection } from '@/components/discussions/DiscussionSection';
import SocialShare from '@/components/SocialShare';
import { 
    Library, 
    Play, 
    Copy,
    Users,
    Clock
} from 'lucide-react';

interface Props {
    roadmap: any;
    slug: string;
}

export default function PublicRoadmapView({ roadmap: initialRoadmap, slug }: Props) {
    const [roadmap, setRoadmap] = useState(initialRoadmap);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rating, setRating] = useState(initialRoadmap?.average_rating || 0);
    const [ratingCount, setRatingCount] = useState(initialRoadmap?.rating_count || 0);
    const [userRating, setUserRating] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            if (session) {
                const sessionEmail = session.user.email?.toLowerCase();
                const roadmapEmail = roadmap?.email?.toLowerCase();
                setIsOwner(sessionEmail === roadmapEmail);
            }
        };
        checkAuth();
    }, [roadmap]);

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
                router.push(`/roadmap/${res.new_slug}`);
            }
        } catch (err) {
            console.error("Failed to clone:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
            <PublicHeader />
            
            <main className="flex-grow">
                <div className="max-w-[1000px] mx-auto px-6 py-12 md:px-12 md:py-16">
                    
                    {/* Public Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b border-border pb-8">
                        <div className="space-y-3">
                            <h1 className="font-inter text-2xl md:text-4xl font-bold text-text-heading tracking-tighter">
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
                            {isOwner ? (
                                <Link 
                                    href={`/roadmap/${slug}/learn`}
                                    className="inline-flex items-center justify-center bg-accent text-white px-7 py-3 rounded-2xl font-bold text-[14px] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3 font-inter"
                                >
                                    <Play className="w-4 h-4 fill-current" /> Continue Learning
                                </Link>
                            ) : (
                                <button 
                                    onClick={handleClone}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center bg-text-heading text-background px-7 py-3 rounded-2xl font-bold text-[14px] transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] gap-3 shadow-lg font-inter"
                                >
                                    <Copy className="w-4 h-4" /> {saving ? 'Cloning...' : 'Clone to Dashboard'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Roadmap Display */}
                    <div className="mb-20">
                        <RoadmapDisplay 
                            roadmapData={roadmap} 
                            isOwner={isOwner || roadmap.is_cloned}
                            justGenerated={false}
                            hideHeader={true}
                        />
                    </div>

                    {/* Steps Flow */}
                    <div className="mb-24 py-16 border-y border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "Learn", sub: "Study curated videos and high-signal articles" },
                                { title: "Practice", sub: "Apply knowledge through targeted exercises" },
                                { title: "Verify", sub: "Pass the Audit Senate to prove your mastery" },
                                { title: "Proven Skill", sub: "Earn a permanent verifiable technical badge" }
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

            <Footer />
        </div>
    );
}
