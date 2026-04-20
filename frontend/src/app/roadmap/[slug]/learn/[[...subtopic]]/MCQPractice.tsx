'use client';

import React, { useState } from 'react';
import { Loader, X, Trophy, Check, ArrowRight, Zap } from 'lucide-react';
import { practiceAPI, MCQSessionRead, MCQQuestion } from '@/lib/api';
import Link from 'next/link';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';

interface MCQPracticeProps {
    roadmapId: number;
    subtopicId: string;
    topicName: string;
    subject: string;
    weekNumber: number;
    isPro: boolean;
    userCredits: number;
    onPointsEarned: (amount: number) => void;
    onRefreshProfile: () => Promise<void>;
}

export default function MCQPractice({
    roadmapId,
    subtopicId,
    topicName,
    subject,
    weekNumber,
    isPro,
    userCredits,
    onPointsEarned,
    onRefreshProfile
}: MCQPracticeProps) {
    const [mcqSession, setMcqSession] = useState<MCQSessionRead | null>(null);
    const [incompleteSession, setIncompleteSession] = useState<MCQSessionRead | null>(null);
    const [mcqHistory, setMcqHistory] = useState<MCQSessionRead[]>([]);
    const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState(10);
    const [showResults, setShowResults] = useState(false);

    // Check for incomplete sessions on load or subtopic change
    React.useEffect(() => {
        if (isPro && subtopicId) {
            practiceAPI.getIncompleteMCQSession(subtopicId)
                .then(session => {
                    if (session) setIncompleteSession(session);
                })
                .catch(err => console.error('Error checking for incomplete MCQ:', err));
            
            // Fetch history
            practiceAPI.getMCQHistory(subtopicId)
                .then(history => {
                    setMcqHistory(history);
                })
                .catch(err => console.error('Error fetching MCQ history:', err));
        }
    }, [isPro, subtopicId]);

    const handleResume = () => {
        if (!incompleteSession) return;
        setMcqSession(incompleteSession);
        setIncompleteSession(null);
        setCurrentMcqIdx(0);
        setMcqAnswers([]);
        setShowResults(false);
    };

    const handleAbandonAndFresh = async () => {
        if (incompleteSession) {
            try {
                await practiceAPI.abandonMCQSession(incompleteSession.id);
                setIncompleteSession(null);
            } catch (err) {
                console.error('Error abandoning session:', err);
            }
        }
        handleGenerate();
    };

    const handleGenerate = async () => {
        if (!isPro) return;
        setIsGenerating(true);
        try {
            const session = await practiceAPI.generateMCQSession({
                roadmap_id: roadmapId,
                subtopic_id: subtopicId,
                topic_name: topicName,
                subject: subject,
                week_number: weekNumber,
                num_questions: questionCount
            });
            setMcqSession(session);
            setCurrentMcqIdx(0);
            setMcqAnswers([]);
            setShowResults(false);
            await onRefreshProfile(); // Update credits display
        } catch (err: any) {
            console.error('Error generating MCQ:', err);
            alert(err.response?.data?.detail || 'Failed to generate assessment');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!mcqSession || mcqAnswers.length !== mcqSession.questions.length) return;
        setIsSubmitting(true);
        try {
            const result = await practiceAPI.submitMCQSession(mcqSession.id, mcqAnswers);
            setMcqSession(result);
            setShowResults(true);
            
            // Calculate points earned (1 per correct answer)
            const correctCount = result.questions.filter((q, i) => result.user_answers?.[i] === q.correct_answer_index).length;
            if (correctCount > 0) {
                onPointsEarned(correctCount);
            }
            
            await onRefreshProfile();
        } catch (err) {
            console.error('Error submitting MCQ:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setMcqSession(null);
        setShowResults(false);
    };

    if (!isPro) {
        return (
            <div className="flex flex-col p-5 border border-border rounded-none bg-background shadow-sm h-full">
                <div className="mb-4">
                    <span className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 inline-block">Pro Feature</span>
                    <div className="flex items-baseline justify-between mb-0.5">
                        <span className="inconsolata-ui text-[15px] font-bold text-text-heading uppercase tracking-tight">Curated Questions</span>
                        <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase">Locked</span>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted italic opacity-70">Practice with MCQ questions.</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center border-y border-border/50 border-dashed my-4">
                    <div className="mb-3 text-xl">💎</div>
                    <p className="manrope-body text-[10px] text-text-muted mb-4 max-w-[180px] leading-relaxed">Upgrade to Pro to practice with AI-generated questions.</p>
                    <Link 
                        href="/pricing"
                        className="px-5 py-1.5 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-none text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                    >
                        See Plans 🚀
                    </Link>
                </div>

                <div className="space-y-1.5 text-[9px] text-text-muted font-bold uppercase tracking-wider opacity-50">
                    <div className="flex items-center gap-2">
                        <span className="text-accent text-[8px]">●</span> Specific to this topic
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent text-[8px]">●</span> Earn skill points
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-5 border border-[var(--accent)] rounded-none bg-accent-muted/5 shadow-sm h-full relative group">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="inconsolata-ui text-[8px] font-bold text-accent uppercase tracking-[0.2em]">Pro Feature</span>
                    <div className="flex items-center gap-1 opacity-60">
                        <span className="text-[10px]">💎</span>
                        <span className="inconsolata-ui text-[8px] font-bold text-text-heading">{userCredits} Credits</span>
                    </div>
                </div>
                <div className="flex items-baseline justify-between mb-0.5">
                    <span className="inconsolata-ui text-[15px] font-bold text-text-heading uppercase tracking-tight">Curated Questions</span>
                </div>
                <p className="manrope-body text-[11px] text-text-muted italic opacity-70">Practice some MCQ questions.</p>
            </div>

            <div className="flex-1 flex flex-col">
                {incompleteSession ? (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                        <div className="mb-4 bg-accent/5 p-3 border border-accent/20">
                            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-accent/10">
                                <span className="text-xs">⏳</span>
                                <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest">Unfinished Session</span>
                            </div>
                            <p className="manrope-body text-[10px] text-text-muted leading-relaxed italic">
                                You have an active assessment from a previous session. Resume it to continue or start fresh.
                            </p>
                        </div>

                        <div className="mt-auto space-y-2">
                            <button
                                onClick={handleResume}
                                className="w-full py-2 bg-accent !text-white rounded-none text-center inconsolata-ui text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                Resume Session ⚡
                            </button>
                            <button
                                onClick={handleAbandonAndFresh}
                                disabled={isGenerating}
                                className="w-full py-2 bg-background hover:bg-callout-bg text-text-muted border border-border rounded-none text-center inconsolata-ui text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                {isGenerating ? 'Marking Abandoned...' : 'Abandon & Start Fresh'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 bg-background/30 p-3 border border-border/40">
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/50">
                                <span className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">Question Count</span>
                                <span className="inconsolata-ui text-[8px] font-bold text-emerald-500 uppercase">+{questionCount} Coins</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[10, 15, 20].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setQuestionCount(count)}
                                        className={`py-1 rounded-none text-[9px] font-bold transition-all inconsolata-ui tracking-wider ${questionCount === count ? 'bg-accent text-white shadow-md' : 'bg-background hover:bg-callout-bg text-text-muted border border-border'}`}
                                    >
                                        {count} Qs
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-right">
                                <span className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase opacity-40">Cost: {(questionCount * 0.01).toFixed(2)} Credits</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full mt-auto py-2 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none text-center inconsolata-ui text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <><Loader className="w-2.5 h-2.5 animate-spin" /> Generating...</>
                            ) : (
                                <>Start Practice ⚡</>
                            )}
                        </button>

                        {/* Previous Assessment History */}
                        {mcqHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">History</h4>
                                <div className="space-y-1 max-h-[100px] overflow-y-auto no-scrollbar">
                                    {mcqHistory.map((session, idx) => (
                                        <div key={session.id} className="flex items-center justify-between p-1.5 bg-sidebar/30 border border-border/50 text-[9px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-text-muted">{new Date(session.created_at).toLocaleDateString()}</span>
                                                <span className="inconsolata-ui font-bold text-text-heading">{session.questions.length} Qs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-accent" 
                                                        style={{ width: `${(session.score || 0) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="inconsolata-ui font-bold text-accent">{Math.round((session.score || 0) * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* MCQ Active Session Overlay */}
            {mcqSession && !showResults && (
                <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
                    <div className="max-w-[550px] mx-auto w-full flex flex-col p-4 md:p-8 border-x border-border min-h-screen">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 border border-border flex items-center justify-center text-sm">🧠</div>
                                <div>
                                    <h3 className="inconsolata-ui text-xs font-bold text-text-heading tracking-tight uppercase">Challenge Session</h3>
                                    <p className="inconsolata-ui text-[7px] font-bold text-text-muted uppercase tracking-widest">{subject.replace('DEVELOPEMENT', 'DEVELOPMENT')} / {topicName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (confirm('Abandon this session? Credits will not be refunded.')) {
                                        setMcqSession(null);
                                    }
                                }}
                                className="p-1 border border-border hover:bg-callout-bg rounded-none text-text-muted transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Progress line */}
                        <div className="w-full h-[1px] bg-border mb-5 flex">
                            {mcqSession.questions.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 h-full transition-all duration-500 ${i <= currentMcqIdx ? 'bg-accent' : 'bg-transparent'}`} 
                                />
                            ))}
                        </div>

                        <div className="flex-1">
                            <div className="mb-4">
                                <span className="inconsolata-ui text-[7px] font-bold text-accent uppercase tracking-[0.2em] mb-1 block">Task {currentMcqIdx + 1} // {mcqSession.questions.length}</span>
                                <h2 className="inconsolata-ui text-[13px] md:text-[14px] font-bold text-text-heading leading-snug">
                                    {mcqSession.questions[currentMcqIdx].question}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                                {mcqSession.questions[currentMcqIdx].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const newAnswers = [...mcqAnswers];
                                            newAnswers[currentMcqIdx] = idx;
                                            setMcqAnswers(newAnswers);
                                        }}
                                        className={`w-full p-2.5 rounded-none text-left transition-all border group relative ${
                                            mcqAnswers[currentMcqIdx] === idx 
                                                ? 'bg-accent/5 border-accent text-text-heading' 
                                                : 'bg-background border-border hover:border-accent/50 text-text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-4 h-4 rounded-none flex items-center justify-center inconsolata-ui text-[8px] font-bold transition-colors ${
                                                mcqAnswers[currentMcqIdx] === idx ? 'bg-accent text-white' : 'bg-background border border-border text-text-muted group-hover:border-accent group-hover:text-accent'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="h-4 w-[1px] bg-border/40" />
                                            <span className="manrope-body text-[12px] font-medium leading-normal">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-8 flex items-center justify-between border-t border-border pb-8">
                            <div className="flex items-center gap-2 inconsolata-ui text-[13px] font-bold text-text-heading tracking-tight">
                                <EulerLogoCanvas size={20} rotationSpeed={0.002} />
                                <span>Euler<span className="text-accent">Fold</span></span>
                            </div>
                            
                            {currentMcqIdx === mcqSession.questions.length - 1 && mcqAnswers[currentMcqIdx] !== undefined ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-10 py-3 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none inconsolata-ui text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
                                >
                                    {isSubmitting ? 'Finalizing...' : 'Submit Session 🏁'}
                                </button>
                            ) : mcqAnswers[currentMcqIdx] !== undefined ? (
                                <button
                                    onClick={() => setCurrentMcqIdx(prev => prev + 1)}
                                    className="px-10 py-3 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none inconsolata-ui text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all flex items-center gap-2"
                                >
                                    Next Task <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                null
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MCQ Results Overlay */}
            {showResults && mcqSession && (
                <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
                    <div className="max-w-[650px] mx-auto w-full p-4 md:p-8 pb-16 border-x border-border">
                        <div className="text-center mb-10 border-b border-border pb-8">
                            <div className="w-10 h-10 border border-border flex items-center justify-center mx-auto mb-3 text-lg">🏆</div>
                            <h2 className="inconsolata-ui text-xl font-bold text-text-heading mb-1 uppercase tracking-tighter">Assessment Log</h2>
                            <p className="inconsolata-ui text-[9px] text-text-muted uppercase tracking-[0.3em]">&quot;{topicName}&quot;</p>
                            
                            <div className="flex items-center justify-center gap-10 mt-8">
                                <div className="text-center">
                                    <div className="inconsolata-ui text-3xl font-bold text-text-heading mb-0.5">{Math.round((mcqSession.score || 0) * 100)}%</div>
                                    <div className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">Mastery Rate</div>
                                </div>
                                <div className="w-[1px] h-10 bg-border"></div>
                                <div className="text-center">
                                    <div className="inconsolata-ui text-3xl font-bold text-text-heading mb-0.5">{mcqSession.questions.filter((q, i) => mcqAnswers[i] === q.correct_answer_index).length}</div>
                                    <div className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">System Points</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-[0.4em] mb-6">Performance Analytics</h3>
                            {mcqSession.questions.map((q, i) => {
                                const isCorrect = mcqAnswers[i] === q.correct_answer_index;
                                return (
                                    <div key={i} className={`p-5 border rounded-none transition-all ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className={`shrink-0 w-6 h-6 border flex items-center justify-center inconsolata-ui text-[10px] font-bold ${isCorrect ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                                                {i + 1}
                                            </div>
                                            <h4 className="inconsolata-ui text-[14px] font-bold text-text-heading leading-tight">{q.question}</h4>
                                        </div>
                                        
                                        <div className="ml-10 space-y-3">
                                            {!isCorrect && (
                                                <div className="text-[11px] manrope-body border-l-2 border-red-500 pl-3 py-0.5">
                                                    <p className="text-[7px] font-bold text-red-500 uppercase tracking-widest mb-1">Input Received</p>
                                                    <span className="text-text-muted font-medium">{q.options[mcqAnswers[i]]}</span>
                                                </div>
                                            )}
                                            <div className="text-[11px] manrope-body border-l-2 border-emerald-500 pl-3 py-0.5">
                                                <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Verified Correct</p>
                                                <span className="text-text-heading font-bold">{q.options[q.correct_answer_index]}</span>
                                            </div>
                                            <div className="bg-background border border-border/50 p-3 rounded-none text-[10px] manrope-body text-text-muted leading-relaxed italic">
                                                <span className="font-bold text-text-heading not-italic uppercase tracking-widest text-[7px] mr-2 block mb-1 underline decoration-accent">System Note:</span> 
                                                {q.explanation}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 text-center border-t border-border pt-8">
                            <button 
                                onClick={reset}
                                className="px-16 py-3 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-none inconsolata-ui text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
                            >
                                Sync Progress & Exit 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
