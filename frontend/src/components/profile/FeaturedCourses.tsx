import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedCourses({ roadmaps }: { roadmaps: any[] }) {
    if (!roadmaps || roadmaps.length === 0) return null;
    
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[22px] font-bold text-text-heading flex items-center gap-3">Featured Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roadmaps.map((roadmap: any) => (
                    <Link href={`/roadmap/${roadmap.slug || roadmap.id}`} key={roadmap.id} className="group p-6 bg-transparent border border-border hover:border-border/80 rounded-xl transition-colors flex flex-col justify-between overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">Course</span>
                                {roadmap.is_public && <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Public</span>}
                            </div>
                            <h3 className="text-[17px] font-bold text-text-heading leading-tight mb-2 group-hover:text-accent transition-colors">{roadmap.title}</h3>
                            <p className="text-[13px] text-text-muted line-clamp-2 leading-relaxed font-medium">{roadmap.goal || roadmap.subject}</p>
                        </div>
                        <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between relative z-10">
                            <span className="text-[12px] font-bold text-text-heading inconsolata-ui flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-background border border-border rounded-full overflow-hidden">
                                    <div className="h-full bg-accent transition-all" style={{ width: `${roadmap.depth_score || 0}%` }} />
                                </div>
                                {Math.round(roadmap.depth_score || 0)}%
                            </span>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
