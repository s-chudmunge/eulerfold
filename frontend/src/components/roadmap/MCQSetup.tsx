import React from 'react';
import { Loader, Zap } from 'lucide-react';
import Link from 'next/link';

interface MCQSetupProps {
    incompleteSession: any;
    handleResume: () => void;
    handleAbandonAndFresh: () => void;
    isGenerating: boolean;
    isPro: boolean;
    handleGenerate: () => void;
    mcqHistory: any[];
    setMcqSession: (s: any) => void;
    setCurrentMcqIdx: (i: number) => void;
    setMcqAnswers: (a: number[]) => void;
    setShowResults: (v: boolean) => void;
}

export default function MCQSetup({
    incompleteSession,
    handleResume,
    handleAbandonAndFresh,
    isGenerating,
    isPro,
    handleGenerate,
    mcqHistory,
    setMcqSession,
    setCurrentMcqIdx,
    setMcqAnswers,
    setShowResults
}: MCQSetupProps) {
    if (incompleteSession) {
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="mb-4 bg-accent/5 p-3 border border-accent/20 rounded-md">
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-accent/10">
                        <span className="text-xs">⏳</span>
                        <span className="appropriate-sans text-[9px] font-bold text-accent uppercase tracking-widest">Incomplete Session</span>
                    </div>
                    <p className="appropriate-sans text-[10px] text-text-muted leading-relaxed italic">
                        You have an active assessment from a previous session. Resume it to continue or start fresh.
                    </p>
                </div>

                <div className="mt-auto space-y-2">
                    <button
                        onClick={handleResume}
                        className="w-full py-2.5 bg-accent text-white rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-widest shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                        Resume Session ➔
                    </button>
                    <button
                        onClick={handleAbandonAndFresh}
                        className="w-full py-2 bg-sidebar border border-border text-text-muted hover:text-text-primary rounded-md text-center appropriate-sans text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                        Abandon & Start Fresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !isPro}
                className={`w-full mt-auto py-2.5 rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 ${
                    !isPro
                    ? 'bg-sidebar border border-border text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-text-heading text-background hover:opacity-90'
                }`}
            >
                {isGenerating ? (
                    <><Loader className="w-3 h-3 animate-spin" /> Preparing Session...</>
                ) : !isPro ? (
                    <>Pro Status Required</>
                ) : (
                    <>Start Practice ⚡</>
                )}
            </button>
            
            {!isPro && (
                <div className="mt-2 text-center">
                    <Link href="/pricing" className="text-[9px] font-bold text-accent uppercase tracking-widest hover:underline">
                        Upgrade to Pro →
                    </Link>
                </div>
            )}

            {/* Previous Assessment History */}
            {mcqHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">History</h4>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                        {mcqHistory.map((session) => (
                            <div key={session.id} className="flex flex-col gap-2 p-2 rounded-md bg-sidebar/30 border border-border/50 text-[9px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-text-muted">{new Date(session.created_at).toLocaleDateString()}</span>
                                        <span className="appropriate-sans font-bold text-text-heading">{session.questions.length} Qs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-accent" 
                                                style={{ width: `${(session.score || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="appropriate-sans font-bold text-accent">{Math.round((session.score || 0) * 100)}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMcqSession(session);
                                        setCurrentMcqIdx(0);
                                        setMcqAnswers([]);
                                        setShowResults(false);
                                    }}
                                    className="w-full py-1.5 bg-background hover:bg-callout-bg text-accent border border-accent/20 rounded-md appropriate-sans text-[8px] font-bold uppercase tracking-widest transition-all text-center flex justify-center items-center gap-1"
                                >
                                    <Zap className="w-2.5 h-2.5" /> Attempt Again
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
