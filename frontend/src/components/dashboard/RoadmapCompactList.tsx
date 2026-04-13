"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowUpRight, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Roadmap {
    id: number;
    slug: string;
    subject: string;
    is_public?: boolean;
    cloned_from?: number;
    is_cloned?: boolean;
    progress?: {
        percent: number;
        bottleneck_module?: number;
    };
    status?: string;
}

interface RoadmapCompactListProps {
    roadmaps: Roadmap[];
}

export default function RoadmapCompactList({ roadmaps }: RoadmapCompactListProps) {
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
    
    const active = roadmaps.filter(r => r.status !== 'completed');
    const completed = roadmaps.filter(r => r.status === 'completed');

    return (
        <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col manrope-body">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    Progress · Goals
                </h3>
                <Link 
                    href="/#generate" 
                    className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-widest hover:opacity-80 flex items-center gap-1 transition-opacity"
                >
                    <Plus className="h-3 w-3" /> New
                </Link>
            </div>

            <div className="w-full h-px bg-[var(--border)] mb-2"></div>

            {/* Active Goals List */}
            <div className="divide-y divide-[var(--border)]/30 overflow-y-auto max-h-[500px] pr-1 no-scrollbar">
                {active.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest italic">No active goals</p>
                    </div>
                )}
                
                {active.map((r) => {
                    const progress = r.progress?.percent || 0;
                    const isFlagged = !!r.progress?.bottleneck_module;

                    return (
                        <div key={r.id} className="py-4 group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Link
                                            href={`/roadmap/${r.slug || r.id}`}
                                            className="inconsolata-ui text-[13px] font-bold text-text-heading hover:text-accent transition-colors uppercase tracking-tight truncate leading-tight"
                                        >
                                            {r.subject}
                                        </Link>

                                        {r.is_public && (
                                            <div className="flex items-center px-1.5 py-0.5 rounded bg-blue-500/5 border border-blue-500/20 ml-1">
                                                <span className="inconsolata-ui text-[8px] font-black text-blue-500 uppercase tracking-tighter">Public</span>
                                            </div>
                                        )}

                                        {r.cloned_from && (
                                            <div className="flex items-center px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/20 ml-1">
                                                <span className="inconsolata-ui text-[8px] font-black text-amber-500 uppercase tracking-tighter">Cloned</span>
                                            </div>
                                        )}

                                        {isFlagged && (

                                            <div className="w-2 h-2 rounded-full bg-orange-500 border border-orange-600/20" title="Bottleneck detected" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-callout-bg rounded-full overflow-hidden border border-border/30">
                                            <div 
                                                className="h-full bg-accent rounded-full transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted shrink-0 min-w-[30px] text-right">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>

                                <Link 
                                    href={`/roadmap/${r.slug || r.id}/learn`}
                                    className="px-4 py-2 bg-callout-bg text-text-heading border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--active-bg)] hover:text-[var(--active-text)] hover:border-transparent transition-all shrink-0 self-center"
                                >
                                    Resume
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="w-full h-px bg-[var(--border)] mt-2 mb-4"></div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                    disabled={completed.length === 0}
                    className="flex items-center gap-2 inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest hover:text-text-heading transition-colors disabled:opacity-30"
                >
                    {isCompletedExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span>Completed ({completed.length})</span>
                </button>

                <Link 
                    href="/explore"
                    className="flex items-center gap-1.5 inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest hover:text-accent transition-colors"
                >
                    <span>Browse</span> <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* Completed Goals List (Expanded) */}
            {isCompletedExpanded && completed.length > 0 && (
                <div className="mt-4 pt-2 divide-y divide-[var(--border)]/30 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                    {completed.map((r) => (
                        <div key={r.id} className="py-3 flex justify-between items-center group">
                            <Link 
                                href={`/roadmap/${r.slug || r.id}`}
                                className="inconsolata-ui text-[12px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-tight truncate leading-tight"
                            >
                                {r.subject}
                            </Link>
                            <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">Mastered</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
