"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assessmentsAPI } from '@/lib/api';
import { 
    Timer, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft,
    ShieldAlert,
    ChevronRight,
    Loader,
    Trophy
} from 'lucide-react';

export default function AssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params?.id as string;

    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function fetchSession() {
            try {
                const data = await assessmentsAPI.getSession(sessionId);
                if (data.status !== 'started') {
                    router.push('/dashboard');
                    return;
                }
                setSession(data);
                
                // Calculate remaining time
                const startedAt = new Date(data.started_at).getTime();
                const now = new Date().getTime();
                const elapsed = Math.floor((now - startedAt) / 1000);
                const remaining = Math.max(0, (90 * 60) - elapsed);
                setTimeLeft(remaining);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load assessment.");
            } finally {
                setLoading(false);
            }
        }
        if (sessionId) fetchSession();
    }, [sessionId]);

    // Timer Logic
    useEffect(() => {
        if (!isFinished && timeLeft > 0 && !loading) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isFinished, loading]);

    // Integrity Tracking (Tab Switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isFinished && session) {
                assessmentsAPI.flag(sessionId).catch(console.error);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [sessionId, isFinished, session]);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([id, answer]) => ({ id, answer }));
            const res = await assessmentsAPI.submit(sessionId, formattedAnswers);
            setScore(res.score);
            setIsFinished(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Submission failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#1c1c1e]">
            <Loader className="h-6 w-6 animate-spin text-teal-600" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-[#1c1c1e] p-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-teal-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs">Back to Dashboard</button>
        </div>
    );

    if (isFinished) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-[#1c1c1e] p-6 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <Trophy className="h-10 w-10 text-teal-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-[#f2f2f7] mb-2 tracking-tight">Assessment Complete</h1>
            <p className="text-slate-500 dark:text-[#aeaeb2] mb-12 max-w-md mx-auto">
                Your results have been verified and added to your technical profile. Standardized benchmarks increase the trust signal of your credential.
            </p>
            
            <div className="mb-12 p-8 bg-slate-50 dark:bg-[#2c2c2e] rounded-[2.5rem] border border-slate-100 dark:border-[#3a3a3c] min-w-[240px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Verified Score</p>
                <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-black text-teal-700 dark:text-teal-400">{score?.toFixed(0)}</span>
                    <span className="text-xl font-bold text-slate-400 ml-1">/100</span>
                </div>
            </div>

            <button 
                onClick={() => router.push('/dashboard')} 
                className="px-12 py-4 bg-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-800 transition-all shadow-xl shadow-teal-700/20"
            >
                View Updated Profile
            </button>
        </div>
    );

    const questions = session.questions;
    const currentQ = questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#1c1c1e] font-sans pb-24">
            {/* STICKY TOP BAR */}
            <div className="sticky top-0 z-50 bg-background/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md border-b border-slate-100 dark:border-[#3a3a3c]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                            <ShieldAlert className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proctored Session</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-slate-50 dark:bg-[#2c2c2e] border-slate-100 dark:border-[#3a3a3c] text-slate-600 dark:text-[#aeaeb2]'}`}>
                        <Timer className="h-4 w-4" />
                        <span className="text-sm font-black tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-[#3a3a3c] h-1">
                    <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-12">
                <div className="mb-12">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-2 block">Question {currentQuestionIdx + 1} of {questions.length}</span>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-[#f2f2f7] leading-snug">{currentQ.question}</h1>
                </div>

                {currentQ.code_snippet && (
                    <div className="mb-8 p-6 bg-slate-900 rounded-2xl overflow-x-auto shadow-inner">
                        <pre className="text-teal-400 text-xs font-mono leading-relaxed">
                            <code>{currentQ.code_snippet}</code>
                        </pre>
                    </div>
                )}

                {/* Question Types */}
                <div className="space-y-3 mb-12">
                    {currentQ.type === 'mcq' && (
                        currentQ.options.map((opt: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(currentQ.id, opt)}
                                className={`w-full p-5 text-left rounded-2xl border transition-all flex items-center justify-between group ${
                                    answers[currentQ.id] === opt 
                                    ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' 
                                    : 'bg-background dark:bg-[#2c2c2e] border-slate-100 dark:border-[#3a3a3c] hover:border-slate-300 dark:hover:border-[#48484a]'
                                }`}
                            >
                                <span className={`text-sm font-bold ${answers[currentQ.id] === opt ? 'text-teal-900 dark:text-teal-400' : 'text-slate-600 dark:text-[#aeaeb2]'}`}>{opt}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${answers[currentQ.id] === opt ? 'border-teal-600 bg-teal-600' : 'border-slate-200 dark:border-[#3a3a3c]'}`}>
                                    {answers[currentQ.id] === opt && <div className="w-1.5 h-1.5 bg-background rounded-full"></div>}
                                </div>
                            </button>
                        ))
                    )}

                    {currentQ.type === 'code_prediction' && (
                        <div className="space-y-4">
                            <input 
                                type="text"
                                value={answers[currentQ.id] || ''}
                                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                                placeholder="Type the exact output here..."
                                className="w-full p-5 bg-background dark:bg-[#2c2c2e] border border-slate-100 dark:border-[#3a3a3c] rounded-2xl text-sm font-mono text-teal-700 dark:text-teal-400 focus:ring-2 focus:ring-teal-700/10 transition-all outline-none"
                            />
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest px-2 italic">Case-sensitive output check</p>
                        </div>
                    )}

                    {currentQ.type === 'written' && (
                        <textarea
                            value={answers[currentQ.id] || ''}
                            onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                            placeholder="Explain your reasoning in 1-2 sentences..."
                            className="w-full p-5 bg-background dark:bg-[#2c2c2e] border border-slate-100 dark:border-[#3a3a3c] rounded-2xl text-sm leading-relaxed min-h-[160px] resize-none focus:ring-2 focus:ring-teal-700/10 transition-all outline-none"
                        />
                    )}
                </div>

                {/* NAVIGATION */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-[#3a3a3c]">
                    <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIdx === 0}
                        className="px-6 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" /> Prev
                    </button>

                    {currentQuestionIdx === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !Object.keys(answers).length}
                            className="px-10 py-3 bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg shadow-teal-100 dark:shadow-none disabled:opacity-50"
                        >
                            {isSubmitting ? 'Verifying...' : 'Submit Assessment'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                            className="px-8 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            Next <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
