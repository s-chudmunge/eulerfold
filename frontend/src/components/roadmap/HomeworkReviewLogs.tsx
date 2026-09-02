import React from 'react';
import { Scale, ChevronLeft } from 'lucide-react';
import TTSListenButton from '@/components/TTSListenButton';

interface HomeworkReviewLogsProps {
    submissions: any[];
    setShowLogs: (v: boolean) => void;
}

export default function HomeworkReviewLogs({ submissions, setShowLogs }: HomeworkReviewLogsProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-accent" />
                    <h2 className="inconsolata-ui text-lg font-bold text-text-heading tracking-tight">Review History</h2>
                </div>
                <button 
                    onClick={() => setShowLogs(false)}
                    className="inconsolata-ui text-[11px] font-bold text-text-muted hover:text-text-heading tracking-wide flex items-center gap-2"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Roadmap
                </button>
            </div>

            <div className="space-y-6 pb-20">
                {submissions.map((sub, idx) => (
                    <div key={sub.id} className="p-8 bg-background border border-border rounded-none relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="inconsolata-ui text-[10px] font-bold text-accent tracking-wide bg-accent-muted px-2.5 py-1 rounded">
                                    Log #{submissions.length - idx}
                                </div>
                                <div className="inconsolata-ui text-[10px] font-bold text-text-muted tracking-wide bg-callout-bg px-2.5 py-1 rounded border border-border">
                                    Module {sub.module_number}
                                </div>
                                <div className={`inconsolata-ui text-[10px] font-bold tracking-wide px-2.5 py-1 rounded border ${
                                    sub.evaluation_level === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                    sub.evaluation_level === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                    'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                    {sub.evaluation_level}
                                </div>
                            </div>
                            <span className="inconsolata-ui text-[10px] font-bold text-text-muted tracking-wide">
                                {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="manrope-body mb-8">
                            {sub.is_senate_eval && sub.senate_summary ? (
                                <div className="flex items-start justify-between gap-4 border-l-4 border-[var(--accent)] pl-4 py-1 italic">
                                    <p className="text-[15px] font-bold text-text-heading leading-relaxed">
                                        &ldquo;{sub.senate_summary}&rdquo;
                                    </p>
                                    <TTSListenButton text={`Review Summary: ${sub.senate_summary}`} label="Summary" />
                                </div>
                            ) : (
                                <p className="text-[14px] text-text-primary leading-relaxed italic">
                                    &ldquo;{sub.evaluation}&rdquo;
                                </p>
                            )}
                        </div>

                        {sub.is_senate_eval && sub.senate_reasoning && (
                            <div className="mt-4 space-y-3 pt-6 border-t border-border">
                                {[
                                    { id: 'technical', label: 'Technical Depth', data: sub.senate_reasoning.technical, vote: sub.senate_votes?.[0] },
                                    { id: 'understanding', label: 'Learning Proof', data: sub.senate_reasoning.understanding, vote: sub.senate_votes?.[1] },
                                    { id: 'relevance', label: 'Alignment', data: sub.senate_reasoning.relevance, vote: sub.senate_votes?.[2] }
                                ].map((item) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-2 md:gap-6 p-4 rounded-none bg-callout-bg border border-border group/item hover:border-[var(--accent)] transition-all">
                                        <div className="w-full md:w-32 shrink-0">
                                            <div className="flex items-center justify-between md:flex-col md:items-start mb-1">
                                                <p className="inconsolata-ui text-[9px] font-bold text-text-muted tracking-wider">{item.label}</p>
                                                <TTSListenButton text={`${item.label}: ${item.data}`} label={item.label} />
                                            </div>
                                            {item.vote && (
                                                <span className={`inconsolata-ui text-[9px] font-bold px-2 py-0.5 rounded border ${
                                                    item.vote === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                    item.vote === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                }`}>{item.vote}</span>
                                            )}
                                        </div>
                                        <p className="text-[12px] text-text-primary leading-relaxed italic opacity-90">&ldquo;{item.data}&rdquo;</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sub.dissent_note && (
                            <div className="p-3 bg-callout-bg border border-border rounded-none mt-6 flex items-start gap-3">
                                <Scale className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5 opacity-60" />
                                <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                                    <span className="inconsolata-ui text-[10px] font-bold tracking-wider mr-2 opacity-70">Committee Detail:</span> {sub.dissent_note}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
