"use client";

import React, { useState } from 'react';
import { X, Link as LinkIcon, Send, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Info } from 'lucide-react';
import { submissionsAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    roadmapId: number;
    moduleNumber: number;
    moduleTitle: string;
    instructions?: string | any;
    onSuccess?: (evaluation: any) => void;
}

export default function HomeworkSubmissionModal({ isOpen, onClose, roadmapId, moduleNumber, moduleTitle, instructions, onSuccess }: Props) {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [showInstructions, setShowInstructions] = useState(true);

    React.useEffect(() => {
        if (isOpen) {
            setLink('');
            setDescription('');
            setSubmitting(false);
            setError(null);
            setResult(null);
        }
    }, [isOpen, moduleNumber]);

    if (!isOpen) return null;

    const renderInstructions = () => {
        if (!instructions) return null;
        
        if (typeof instructions === 'string') {
            return (
                <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
                    <p className="manrope-body text-[13px] text-text-primary leading-relaxed">{instructions}</p>
                </div>
            );
        }

        // Handle structured object from backend with collapsible sections
        return (
            <div className="space-y-2">
                {instructions.what_to_build && (
                    <details open className="group bg-accent/5 rounded-lg border border-accent/10 overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-accent/10 transition-colors list-none">
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">Objective</span>
                            <ChevronRight className="w-2.5 h-2.5 text-accent transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <p className="manrope-body text-[12px] text-text-primary leading-relaxed">{instructions.what_to_build}</p>
                        </div>
                    </details>
                )}
                {instructions.what_counts_as_evidence && (
                    <details className="group bg-callout-bg rounded-lg border border-border overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-callout-bg/80 transition-colors list-none">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Evidence</span>
                            <ChevronRight className="w-2.5 h-2.5 text-text-muted transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <p className="manrope-body text-[12px] text-text-primary leading-relaxed italic">{instructions.what_counts_as_evidence}</p>
                        </div>
                    </details>
                )}
                {instructions.eval_criteria && Array.isArray(instructions.eval_criteria) && (
                    <details className="group bg-callout-bg rounded-lg border border-border overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-callout-bg/80 transition-colors list-none">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Criteria</span>
                            <ChevronRight className="w-2.5 h-2.5 text-text-muted transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <ul className="list-disc list-inside space-y-0.5">
                                {instructions.eval_criteria.map((c: string, i: number) => (
                                    <li key={i} className="manrope-body text-[11px] text-text-muted">{c}</li>
                                ))}
                            </ul>
                        </div>
                    </details>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError("Please provide a description of your work.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Authentication required");

            const payload = {
                roadmap_id: roadmapId,
                module_number: moduleNumber,
                description,
                link: link || null
            };

            const data = await submissionsAPI.createSubmission(payload, session.access_token);
            setResult(data.evaluation);
            if (onSuccess) onSuccess(data.evaluation);
        } catch (err: any) {
            console.error("Submission failed:", err);
            setError(err.response?.data?.detail || err.message || "Failed to submit homework.");
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
                <div className="relative w-full max-w-[400px] bg-sidebar border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-callout-bg rounded-full text-text-muted transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="p-8 text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6 ${
                            result.level === 'Solid' ? 'bg-emerald-500/10 text-emerald-500' : 
                            result.level === 'Developing' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-[18px] font-bold text-text-heading mb-1 tracking-tight">Homework Evaluated</h3>
                        <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-6">Status: {result.level}</p>
                        
                        <div className="bg-background/50 border border-border p-5 rounded-lg mb-8 text-left">
                            <p className="manrope-body text-[13px] text-text-primary leading-relaxed italic">
                                &ldquo;{result.summary}&rdquo;
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-text-heading text-background rounded-lg text-[13px] font-bold tracking-wide hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                Back to Roadmap
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
            <div className={`relative bg-sidebar border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row transition-all duration-300 max-h-[90vh] ${showInstructions && instructions ? 'max-w-4xl' : 'max-w-lg'}`}>
                
                {/* Global Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-callout-bg rounded-full text-text-muted transition-colors z-[210]"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Main Form Area */}
                <div className="flex-1 p-6 border-r border-border/50 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-[16px] font-bold text-text-heading tracking-tight">Submit Homework</h3>
                                {instructions && (
                                    <button 
                                        onClick={() => setShowInstructions(!showInstructions)}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                                            showInstructions 
                                            ? 'bg-accent/10 text-accent' 
                                            : 'bg-accent text-white shadow-lg shadow-accent/20 hover:scale-105 active:scale-95'
                                        }`}
                                        title={showInstructions ? "Hide Instructions" : "Show Instructions"}
                                    >
                                        <HelpCircle className={`w-3 h-3 ${!showInstructions ? 'animate-pulse' : ''}`} />
                                        {!showInstructions && (
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-2 duration-500">
                                                See instructions
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="manrope-body text-[11px] text-text-muted mt-0.5">{moduleTitle}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Proof Link (Optional)
                            </label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
                                <input 
                                    type="url"
                                    placeholder="GitHub repo, PDF link, or Project URL"
                                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-[13px] manrope-body focus:border-accent outline-none transition-all"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Describe your work
                            </label>
                            <textarea 
                                placeholder="Explain what you built or learned. Be specific."
                                className="w-full h-24 bg-background/50 border border-border rounded-lg p-3 text-[13px] manrope-body focus:border-accent outline-none transition-all resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2.5 text-red-600 animate-in fade-in duration-300">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <p className="text-[11px] font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-teal-700 text-white rounded-lg text-[13px] font-bold tracking-wide hover:bg-teal-800 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div 
                                                    key={i} 
                                                    className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" 
                                                    style={{ animationDelay: `${i * 0.2}s` }} 
                                                />
                                            ))}
                                        </div>
                                        <span className="opacity-90">Analyzing...</span>
                                    </div>
                                ) : (
                                    <>
                                        Send for Review
                                        <Send className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Instructions Sidebar */}
                {instructions && showInstructions && (
                    <div className="w-full md:w-[280px] bg-background/20 p-6 flex flex-col animate-in slide-in-from-right-4 duration-300 border-t md:border-t-0 border-border/50">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Info className="w-3 h-3 text-accent" />
                                <h4 className="text-[9px] font-black text-text-heading uppercase tracking-widest">Requested Task</h4>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
                            {renderInstructions()}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-text-muted opacity-60">
                                <Sparkles className="w-3 h-3" />
                                <p className="text-[8px] font-black uppercase tracking-[0.2em]">AI Technical Auditor</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
