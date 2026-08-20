import React from 'react';
import { FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VerifiedWork({ submissions, onSelectReview }: { submissions: any[], onSelectReview: (sub: any) => void }) {
    if (!submissions || submissions.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[22px] font-bold text-text-heading flex items-center gap-3">Verified Work</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {submissions.slice(0, 5).map((sub: any) => (
                    <div key={sub.id} className="p-5 bg-sidebar/30 border border-border/50 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 hover:border-emerald-500/30 hover:bg-sidebar/60 transition-all group">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-text-heading mb-1 truncate">{sub.roadmaps?.title || 'Technical Task'}</h4>
                            <p className="text-[13px] text-text-muted line-clamp-1 italic font-medium">&ldquo;{sub.description}&rdquo;</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 mt-3 sm:mt-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                {sub.evaluation_level}
                            </span>
                            {sub.link && (
                                <Link href={sub.link} target="_blank" className="p-2 text-text-muted hover:text-accent bg-background rounded-lg transition-colors border border-border">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            )}
                            <button 
                                onClick={() => onSelectReview(sub)}
                                className="p-2 text-text-muted hover:text-accent bg-background rounded-lg transition-colors border border-border"
                            >
                                <FileText className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
