import React from 'react';
import { Loader, Zap, Cpu } from 'lucide-react';
import Link from 'next/link';

interface MCQSetupProps {
    incompleteSession: any;
    handleResume: () => void;
    handleAbandonAndFresh: () => void;
    isGenerating: boolean;
    questionCount: number;
    setQuestionCount: (c: number) => void;
    useOpenRouter: boolean;
    setUseOpenRouter: (v: boolean) => void;
    useLocalAI: boolean;
    setUseLocalAI: (v: boolean) => void;
    isPro: boolean;
    userCredits: number;
    openRouterKey: string | null;
    localAIModelId: string | null;
    setIsOpenRouterModalOpen: (v: boolean) => void;
    setIsLocalAIModalOpen: (v: boolean) => void;
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
    questionCount,
    setQuestionCount,
    useOpenRouter,
    setUseOpenRouter,
    useLocalAI,
    setUseLocalAI,
    isPro,
    userCredits,
    openRouterKey,
    localAIModelId,
    setIsOpenRouterModalOpen,
    setIsLocalAIModalOpen,
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
                <div className="mb-4 bg-accent/5 p-3 border border-accent/20">
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
                        className="w-full py-2 bg-accent !text-white rounded-lg text-center appropriate-sans text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        Resume Session ⚡
                    </button>
                    <button
                        onClick={handleAbandonAndFresh}
                        disabled={isGenerating}
                        className="w-full py-2 bg-background hover:bg-callout-bg text-text-muted border border-border rounded-lg text-center appropriate-sans text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                        {isGenerating ? 'Marking Abandoned...' : 'Abandon & Start Fresh'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 bg-background/30 p-3 border border-border/40">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/50">
                    <span className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Question Count</span>
                    <span className="appropriate-sans text-[8px] font-bold text-emerald-500 uppercase">+{questionCount} Coins</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    {[10, 15, 20].map((count) => (
                        <button
                            key={count}
                            onClick={() => setQuestionCount(count)}
                            className={`py-1 rounded-lg text-[9px] font-bold transition-all appropriate-sans tracking-wider ${questionCount === count ? 'bg-accent text-white shadow-md' : 'bg-background hover:bg-callout-bg text-text-muted border border-border'}`}
                        >
                            {count} Qs
                        </button>
                    ))}
                </div>
                <div className="mt-2 text-right">
                    <span className="appropriate-sans text-[8px] font-bold text-text-muted uppercase opacity-40">
                        Cost: {useOpenRouter || useLocalAI ? '0.00' : (questionCount * 0.01).toFixed(2)} Credits
                    </span>
                </div>
            </div>

            {/* Engine Selector */}
            <div className="mb-4">
                <label className="appropriate-sans text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2 mb-2">
                    <Cpu className="w-3 h-3 text-accent" /> Engine
                </label>
                <div className="flex bg-sidebar p-1 rounded-lg border border-border">
                    <button
                        onClick={() => { setUseOpenRouter(false); setUseLocalAI(false); }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${!useOpenRouter && !useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                    >
                        EulerFold AI
                    </button>
                    <button
                        onClick={() => { setUseOpenRouter(true); setUseLocalAI(false); }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${useOpenRouter ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                    >
                        OpenRouter
                    </button>
                    <button
                        onClick={() => { setUseOpenRouter(false); setUseLocalAI(true); }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                    >
                        Local AI
                    </button>
                </div>
                {!useOpenRouter && !useLocalAI && (
                    <p className="text-[9px] text-amber-500/90 font-bold mt-1.5 ml-1">Uses credits ({questionCount * 0.01} per session)</p>
                )}
                {/* Configuration Buttons */}
                {useOpenRouter && (
                    <div className="mt-2 flex justify-end">
                        <button onClick={() => setIsOpenRouterModalOpen(true)} className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1">
                            {openRouterKey ? 'Configure OpenRouter' : 'Set API Key'}
                        </button>
                    </div>
                )}
                {useLocalAI && (
                    <div className="mt-2 flex justify-end">
                        <button onClick={() => setIsLocalAIModalOpen(true)} className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1">
                            {localAIModelId ? 'Change Local Model' : 'Select Local Model'}
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating || (useLocalAI && !localAIModelId) || (useOpenRouter && !openRouterKey) || (!useOpenRouter && !useLocalAI && (!isPro || userCredits < questionCount * 0.01))}
                className={`w-full mt-auto py-2 rounded-lg text-center appropriate-sans text-[9px] font-bold uppercase tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 ${
                    (useLocalAI && !localAIModelId) || (useOpenRouter && !openRouterKey) || (!useOpenRouter && !useLocalAI && (!isPro || userCredits < questionCount * 0.01))
                    ? 'bg-sidebar border border-border text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-[#111] dark:bg-[#14b8a6] !text-white hover:opacity-90'
                }`}
            >
                {isGenerating ? (
                    <><Loader className="w-2.5 h-2.5 animate-spin" /> Generating...</>
                ) : (useLocalAI && !localAIModelId) ? (
                    <>Select Local Model</>
                ) : (useOpenRouter && !openRouterKey) ? (
                    <>Set OpenRouter Key</>
                ) : (!useOpenRouter && !useLocalAI && !isPro) ? (
                    <>Pro Status Required</>
                ) : (!useOpenRouter && !useLocalAI && userCredits < questionCount * 0.01) ? (
                    <>Not Enough Credits</>
                ) : (
                    <>Start Practice ⚡</>
                )}
            </button>
            
            {!useLocalAI && !useOpenRouter && !isPro && (
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
                        {mcqHistory.map((session, idx) => (
                            <div key={session.id} className="flex flex-col gap-2 p-2 rounded-lg bg-sidebar/30 border border-border/50 text-[9px]">
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
