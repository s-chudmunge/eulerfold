import React from 'react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VerifiedWork({ submissions, onSelectReview }: { submissions: any[], onSelectReview: (sub: any) => void }) {
    if (!submissions || submissions.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-text-heading flex items-center gap-3">Verified Work</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {submissions.slice(0, 5).map((sub: any) => {
                    const isSolid = sub.evaluation_level === 'Solid' || sub.evaluation_level === 'Expert';
                    return (
                        <div 
                            key={sub.id} 
                            onClick={() => onSelectReview(sub)}
                            className="p-4 bg-sidebar/30 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border/80 hover:bg-sidebar/50 transition-all cursor-pointer group"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-bold text-text-heading mb-1 truncate">{sub.roadmaps?.title || 'Technical Task'}</h4>
                                <p className="text-[13px] text-text-muted line-clamp-1">
                                    {sub.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 mt-2 sm:mt-0">
                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${isSolid ? 'text-teal-700 bg-teal-700/10 border-teal-700/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>
                                    {sub.evaluation_level}
                                </span>
                                {sub.link && (
                                    <Link 
                                        href={sub.link} 
                                        target="_blank" 
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 text-text-muted hover:text-text-primary bg-background rounded-md transition-colors border border-border"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
