"use client";

import React, { useState, useEffect } from 'react';
import { 
    Search,
    ChevronDown,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import StarRating from '@/components/roadmap/StarRating';
import { exploreAPI } from '@/lib/api';

export default function RoadmapIndexClient({ initialRoadmaps }: { initialRoadmaps: any[] }) {
    const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(false);

    const [firstMount, setFirstMount] = useState(true);

    useEffect(() => {
        const fetchFiltered = async () => {
            if (firstMount) {
                setFirstMount(false);
                return;
            }
            setLoading(true);
            try {
                const data = await exploreAPI.getExploreRoadmaps(search, 0, 50, sortBy);
                setRoadmaps(data);
            } catch (e) {
                console.error("Filter fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchFiltered();
        }, search ? 300 : 0);

        return () => clearTimeout(timer);
    }, [search, sortBy]);

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
            <PublicHeader />

            <main className="flex-grow">
                <div className="max-w-[1000px] mx-auto px-6 py-12 md:px-12 md:py-16">
                    <header className="mb-12 border-b border-border pb-8">
                        <div className="inconsolata-ui flex items-center gap-2 text-text-muted mb-2 text-[12px] font-bold uppercase tracking-widest">
                            <span className="bg-sidebar dark:bg-white/5 px-2 py-0.5 rounded">Directory</span>
                            <span className="opacity-30">/</span>
                            <span className="italic opacity-60">Public Courses</span>
                        </div>
                        <h1 className="font-inter text-2xl md:text-4xl font-bold text-text-heading tracking-tighter mb-6">
                            Public Courses
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search by topic, subject, or goal..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-sidebar/50 border border-border rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-all manrope-body"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="relative">
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-sidebar/50 border border-border rounded-lg pl-12 pr-10 py-3 text-sm focus:outline-none focus:border-accent transition-all manrope-body cursor-pointer min-w-[160px] font-bold"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="highest_rated">Highest Rated</option>
                                        <option value="most_cloned">Most Cloned</option>
                                    </select>
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className={`grid grid-cols-1 gap-y-1 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        {roadmaps.length > 0 ? (
                            roadmaps.map((roadmap: any) => (
                                <div key={roadmap.id} className="group border-b border-border/50 py-5 transition-all hover:bg-sidebar/30 px-4 rounded-lg">
                                    <Link 
                                        href={`/roadmap/${roadmap.slug}`}
                                        className="block"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-inter text-[17px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight truncate">
                                                        {roadmap.title}
                                                    </span>
                                                    {roadmap.average_rating > 0 && (
                                                        <StarRating 
                                                            rating={roadmap.average_rating} 
                                                            count={roadmap.rating_count} 
                                                            size={12} 
                                                            showValue={false}
                                                            className="scale-[0.85] origin-left"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-accent font-bold uppercase tracking-widest text-[10px] font-inter">{roadmap.subject}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="manrope-body text-[12px] text-text-muted font-medium">
                                                        {roadmap.roadmap_plan?.modules?.length || roadmap.time_value} {roadmap.roadmap_plan?.modules?.length ? (roadmap.roadmap_plan.modules.length === 1 ? 'week' : 'weeks') : roadmap.time_unit}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="manrope-body text-[12px] text-text-muted font-medium">
                                                        {roadmap.clone_count || 0} Learners
                                                    </span>
                                                    {roadmap.author && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <span className="manrope-body text-[12px] text-text-muted font-medium">
                                                                by {roadmap.author}
                                                            </span>
                                                        </>
                                                    )}
                                                    {roadmap.created_at && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <span className="manrope-body text-[12px] text-text-muted font-medium">
                                                                {new Date(roadmap.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[11px] font-bold text-accent uppercase tracking-widest font-inter">View Path →</span>
                                            </div>
                                        </div>
                                        {roadmap.goal && (
                                            <p className="manrope-body text-[14px] text-text-muted mt-2 line-clamp-2 font-medium italic opacity-80 leading-relaxed">
                                                &ldquo;{roadmap.goal}&rdquo;
                                            </p>
                                        )}
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-border rounded-[32px] bg-sidebar/10">
                                <p className="manrope-body text-text-muted text-[15px] font-medium italic">No courses found matching your criteria.</p>
                                <button onClick={() => {setSearch(''); setSortBy('newest');}} className="font-inter text-accent text-[12px] font-bold mt-4 inline-block uppercase tracking-widest hover:underline">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
