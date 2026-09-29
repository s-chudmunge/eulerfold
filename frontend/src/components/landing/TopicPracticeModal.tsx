'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader, ArrowRight, LogIn, Zap, BrainCircuit, Github } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { practiceAPI, MCQQuestion } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import TTSListenButton from '@/components/TTSListenButton';

const toRenderableString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
        if (val.question) return toRenderableString(val.question);
        if (val.title) return toRenderableString(val.title);
        if (val.text) return toRenderableString(val.text);
        return JSON.stringify(val);
    }
    return String(val);
};

interface MathRendererProps {
    content: string;
    className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    return (
        <div className={`prose-eulerfold inline-math-container ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <span className="inline leading-relaxed">{children}</span>,
                    h1: ({ children }) => <span className="font-bold text-lg inline">{children}</span>,
                    h2: ({ children }) => <span className="font-bold text-base inline">{children}</span>,
                    h3: ({ children }) => <span className="font-semibold text-base inline">{children}</span>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code: ({ inline, className: codeClass, children, ...props }: any) => {
                        const str = String(children || '');
                        if (inline || (!codeClass && !str.includes('\n'))) {
                            return (
                                <code className="bg-background px-1.5 py-0.5 rounded text-[12px] font-mono border border-border text-accent font-medium inline-block mx-0.5" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <pre className="p-3 bg-sidebar text-text-primary rounded-md overflow-x-auto text-[12px] font-mono my-2 border border-border">
                                <code>{children}</code>
                            </pre>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

interface TopicPracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    topic?: string;
}

export default function TopicPracticeModal({ isOpen, onClose, topic = '' }: TopicPracticeModalProps) {
    const { user } = useAuth();
    const [activeTopic, setActiveTopic] = useState(topic);
    const [topicInput, setTopicInput] = useState('');
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [textAnswer, setTextAnswer] = useState<string>('');
    const [hasChecked, setHasChecked] = useState(false);
    const [userAnswers, setUserAnswers] = useState<(number | string)[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const loadQuestions = (targetTopic: string) => {
        const clean = targetTopic.trim();
        if (!clean) return;

        setActiveTopic(clean);
        setIsLoading(true);
        setError(null);
        setCurrentIdx(0);
        setSelectedOption(null);
        setTextAnswer('');
        setHasChecked(false);
        setUserAnswers([]);
        setIsCompleted(false);

        practiceAPI.getFreemiumMCQPreview(clean, 3)
            .then(res => {
                if (res.questions && res.questions.length > 0) {
                    setQuestions(res.questions);
                } else {
                    setError('No practice questions available for this topic yet.');
                }
            })
            .catch(err => {
                console.error('Failed to load practice questions:', err);
                setError(err?.response?.data?.detail || 'Unable to prepare practice questions. Please try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (!isOpen) return;

        if (topic && topic.trim()) {
            loadQuestions(topic);
        } else {
            setActiveTopic('');
            setTopicInput('');
            setQuestions([]);
            setIsCompleted(false);
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, topic]);

    if (!isOpen) return null;

    const currentQ = questions[currentIdx];
    const isOpenEnded = Boolean(
        currentQ && (!currentQ.options || currentQ.options.length === 0 || currentQ.format === 'open_ended' || currentQ.format === 'open_ended_coding')
    );

    const isAnswerCorrect = (q: MCQQuestion, ans: number | string | null | undefined): boolean => {
        if (!q || ans === null || ans === undefined) return false;
        const isOE = !q.options || q.options.length === 0 || q.format === 'open_ended' || q.format === 'open_ended_coding';
        if (isOE) {
            if (typeof ans !== 'string') return false;
            const userStr = ans.trim();
            const gtStr = String(q.ground_truth_answer || '').trim();
            if (!userStr || !gtStr) return false;

            if (userStr === gtStr || userStr.toLowerCase() === gtStr.toLowerCase()) return true;
            const unquotedUser = userStr.replace(/^['"]|['"]$/g, '').trim();
            const unquotedGt = gtStr.replace(/^['"]|['"]$/g, '').trim();
            if (unquotedUser.toLowerCase() === unquotedGt.toLowerCase()) return true;

            const cleanUser = unquotedUser.replace(/^\$|\$$/g, '').replace(/\\boxed\{([^}]+)\}/, '$1').trim();
            const cleanGt = unquotedGt.replace(/^\$|\$$/g, '').replace(/\\boxed\{([^}]+)\}/, '$1').trim();
            if (cleanUser.toLowerCase() === cleanGt.toLowerCase()) return true;

            return false;
        }
        return typeof ans === 'number' && ans === q.correct_answer_index;
    };

    const isCurrentCorrect = currentQ ? isAnswerCorrect(currentQ, isOpenEnded ? textAnswer : selectedOption) : false;
    const misconceptionNote = (hasChecked && !isOpenEnded && selectedOption !== null && currentQ && selectedOption !== currentQ.correct_answer_index)
        ? currentQ.misconception_map?.[String(selectedOption)]
        : null;

    const handleConfirmAnswer = () => {
        if (hasChecked || !currentQ) return;
        if (isOpenEnded) {
            if (!textAnswer.trim()) return;
            const nextAnswers = [...userAnswers];
            nextAnswers[currentIdx] = textAnswer.trim();
            setUserAnswers(nextAnswers);
            setHasChecked(true);
        } else {
            if (selectedOption === null) return;
            const nextAnswers = [...userAnswers];
            nextAnswers[currentIdx] = selectedOption;
            setUserAnswers(nextAnswers);
            setHasChecked(true);
        }
    };

    const handleNext = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx(prev => prev + 1);
            setSelectedOption(null);
            setTextAnswer('');
            setHasChecked(false);
        } else {
            setIsCompleted(true);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://www.eulerfold.com'
                }
            });
        } catch (authErr) {
            console.error('Google sign-in error:', authErr);
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://www.eulerfold.com'
                }
            });
        } catch (authErr) {
            console.error('GitHub sign-in error:', authErr);
        }
    };

    const handleTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topicInput.trim()) {
            loadQuestions(topicInput);
        }
    };

    // Calculate score
    const correctCount = userAnswers.reduce<number>((acc, ans, idx) => {
        const q = questions[idx];
        return (q && isAnswerCorrect(q, ans)) ? acc + 1 : acc;
    }, 0);

    return (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-background border border-border rounded-md shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-sidebar/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 border border-border flex items-center justify-center text-xs rounded-md bg-background">
                            🧠
                        </div>
                        <div>
                            <h3 className="appropriate-sans text-xs font-bold text-text-heading tracking-tight">
                                {activeTopic ? `Practice: ${activeTopic}` : 'Practice Any Topic'}
                            </h3>
                            <p className="appropriate-sans text-[9px] text-text-muted">
                                {!activeTopic
                                    ? 'Benchmark your understanding'
                                    : isCompleted
                                    ? 'Session Complete'
                                    : `Question ${currentIdx + 1} of ${questions.length || 3}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 border border-border hover:bg-sidebar rounded-md text-text-muted hover:text-text-primary transition-colors"
                        title="Close practice"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 overflow-y-auto flex-1">
                    {!activeTopic ? (
                        /* Topic Input State */
                        <div className="py-6 space-y-6">
                            <div className="text-center space-y-2">
                                <h4 className="text-base font-bold text-text-heading tracking-tight">
                                    What would you like to practice?
                                </h4>
                                <p className="text-[12px] text-text-muted max-w-md mx-auto">
                                    Type any concept to test your understanding with questions from our verified question bank.
                                </p>
                            </div>

                            <form onSubmit={handleTopicSubmit} className="space-y-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-sidebar border border-border rounded-md focus-within:border-accent/50 transition-colors">
                                    <BrainCircuit className="w-4 h-4 text-text-muted shrink-0" />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={topicInput}
                                        onChange={(e) => setTopicInput(e.target.value)}
                                        placeholder="e.g. Transformers, Backpropagation, SQL Indexing..."
                                        className="w-full bg-transparent text-[13px] text-text-heading placeholder:text-text-muted/60 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!topicInput.trim()}
                                    className="w-full py-2.5 bg-text-heading text-background rounded-md text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                                >
                                    Start Practice <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </div>
                    ) : isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader className="w-5 h-5 text-accent animate-spin" />
                            <p className="appropriate-sans text-[11px] font-medium text-text-muted">
                                Finding verified questions for {activeTopic}...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <p className="appropriate-sans text-[12px] font-medium text-text-primary max-w-sm">
                                {error}
                            </p>
                            <button
                                onClick={() => setActiveTopic('')}
                                className="mt-2 px-4 py-2 border border-border rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-heading transition-colors"
                            >
                                Try Another Topic
                            </button>
                        </div>
                    ) : isCompleted ? (
                        /* Gating / Completion Screen */
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Score Overview */}
                            <div className="p-4 bg-sidebar/50 border border-border rounded-md text-center">
                                <span className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                                    Practice Session Complete
                                </span>
                                <div className="appropriate-sans text-2xl font-bold text-text-heading tracking-tight mb-1">
                                    {correctCount} / {questions.length} Correct
                                </div>
                                <p className="appropriate-sans text-[11px] text-text-muted max-w-sm mx-auto">
                                    {correctCount === questions.length
                                        ? 'Solid conceptual clarity across all practice questions.'
                                        : correctCount > 0
                                        ? 'Good start. Some edge-case boundaries require deeper practice.'
                                        : 'Foundational concepts need review to build conceptual grounding.'}
                                </p>
                            </div>

                            {/* Gating Logic */}
                            {!user ? (
                                /* Case 1: User is Logged Out -> Prompt Sign In */
                                <div className="p-5 border border-border bg-accent/5 rounded-md space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                                            <LogIn className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="appropriate-sans text-xs font-bold text-text-heading">
                                                Sign In To Continue Practicing
                                            </h4>
                                            <p className="appropriate-sans text-[10px] text-text-muted">
                                                Save your diagnostic results, calibrate your skill profile, and access full course roadmaps.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                                        <button
                                            onClick={handleGoogleSignIn}
                                            className="flex-1 py-2.5 bg-text-heading text-background rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                            </svg>
                                            Google
                                        </button>
                                        <button
                                            onClick={handleGitHubSignIn}
                                            className="flex-1 py-2.5 bg-sidebar text-text-primary border border-border rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:bg-background hover:text-text-heading transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            GitHub
                                        </button>
                                        <Link
                                            href="/login"
                                            className="px-3.5 py-2.5 bg-sidebar/60 border border-border rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-all flex items-center justify-center"
                                        >
                                            Email
                                        </Link>
                                    </div>
                                </div>
                            ) : !user.is_pro ? (
                                /* Case 2: User is Logged In, but NOT Pro -> Prompt Upgrade to Pro */
                                <div className="p-5 border border-border bg-accent/5 rounded-md space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                                            <Zap className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="appropriate-sans text-xs font-bold text-text-heading">
                                                Upgrade To Pro For Full Practice
                                            </h4>
                                            <p className="appropriate-sans text-[10px] text-text-muted">
                                                Unlock unlimited adaptive momentum sessions, multi-tier diagnostic evaluations, and access to our complete curated question database.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                                        <Link
                                            href="/pricing"
                                            className="flex-1 py-2.5 bg-accent text-white rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            Upgrade to Pro ⚡
                                        </Link>
                                        <Link
                                            href="/explore"
                                            className="px-4 py-2.5 bg-sidebar border border-border rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-all flex items-center justify-center"
                                        >
                                            Browse Library
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Case 3: User is Logged In and is Pro */
                                <div className="p-5 border border-border bg-emerald-500/5 rounded-md space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="appropriate-sans text-xs font-bold text-text-heading">
                                                Pro Access Active
                                            </h4>
                                            <p className="appropriate-sans text-[10px] text-text-muted">
                                                You have full, unlimited access to adaptive momentum practice across all modules.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2.5">
                                        <Link
                                            href="/dashboard"
                                            className="flex-1 py-2.5 bg-text-heading text-background rounded-md text-center appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            Go to Dashboard ➔
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Practice Another Topic Button */}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => {
                                        setActiveTopic('');
                                        setTopicInput('');
                                        setQuestions([]);
                                        setIsCompleted(false);
                                    }}
                                    className="text-[11px] font-bold text-text-muted hover:text-accent transition-colors"
                                >
                                    ← Practice Another Topic
                                </button>
                            </div>
                        </div>
                    ) : currentQ ? (
                        /* Question Presentation Screen */
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                        Question {currentIdx + 1}
                                    </span>
                                    <TTSListenButton
                                        text={isOpenEnded 
                                            ? `Question: ${currentQ.question}`
                                            : `Question: ${currentQ.question}. Options are: ${currentQ.options.map((o: string, idx: number) => `${String.fromCharCode(65 + idx)}: ${o}`).join(', ')}.`
                                        }
                                        label="Question"
                                    />
                                </div>

                                <div className="appropriate-sans text-[13px] md:text-[14px] font-bold text-text-heading leading-snug">
                                    <MathRenderer content={toRenderableString(currentQ.question)} />
                                </div>
                            </div>

                            {/* Open-Ended Text Box or Multiple Choice Options */}
                            {isOpenEnded ? (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-sidebar border border-border focus-within:border-accent rounded-md transition-colors font-mono">
                                        <span className="text-accent text-[12px] font-bold">❯</span>
                                        <input
                                            type="text"
                                            value={textAnswer}
                                            onChange={(e) => setTextAnswer(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && textAnswer.trim() && !hasChecked) {
                                                    e.preventDefault();
                                                    handleConfirmAnswer();
                                                }
                                            }}
                                            disabled={hasChecked}
                                            placeholder="Enter predicted return value (e.g. '__1.00r__j_a6__6')..."
                                            className="w-full bg-transparent text-[13px] text-text-heading placeholder:text-text-muted/50 focus:outline-none font-mono"
                                            autoFocus
                                        />
                                    </div>

                                    {hasChecked && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <div className={`p-3 rounded-md border flex items-start justify-between gap-3 ${
                                                isCurrentCorrect
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                            }`}>
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                                                        {isCurrentCorrect ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                                <span>Correct</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                                <span>Incorrect</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="font-mono text-[12px] break-all">
                                                        Your answer: <span className="font-bold">{textAnswer}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prominent Correct Answer Display */}
                                            {currentQ.ground_truth_answer && (
                                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                                                    <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="appropriate-sans text-[9px] font-bold uppercase tracking-wider">Correct Answer</span>
                                                    </div>
                                                    <div className="font-mono text-[13px] font-bold text-text-heading break-all">
                                                        <MathRenderer content={toRenderableString(currentQ.ground_truth_answer)} />
                                                    </div>
                                                </div>
                                            )}

                                            {(currentQ.solution || currentQ.explanation) && (
                                                <div className="p-3 bg-sidebar border border-border rounded-md">
                                                    <div className="flex items-center gap-1.5 mb-1 text-accent">
                                                        <span className="appropriate-sans text-[8px] font-bold uppercase tracking-widest">
                                                            {currentQ.solution ? 'Execution Trace / Solution' : 'Explanation'}
                                                        </span>
                                                    </div>
                                                    <div className="appropriate-sans text-[11px] text-text-primary leading-relaxed">
                                                        <MathRenderer content={toRenderableString(currentQ.solution || currentQ.explanation)} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Options */}
                                    <div className="grid grid-cols-1 gap-2 pt-1">
                                        {currentQ.options.map((option: string, idx: number) => {
                                            const isSelected = selectedOption === idx;
                                            const isCorrectOption = idx === currentQ.correct_answer_index;

                                            let optionStyle = 'bg-background border-border text-text-primary hover:border-accent/50';
                                            let badgeStyle = 'bg-background border border-border text-text-muted';

                                            if (hasChecked) {
                                                if (isCorrectOption) {
                                                    optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400';
                                                    badgeStyle = 'bg-emerald-500 text-white';
                                                } else if (isSelected) {
                                                    optionStyle = 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400';
                                                    badgeStyle = 'bg-red-500 text-white';
                                                } else {
                                                    optionStyle = 'bg-background border-border/50 text-text-muted opacity-60';
                                                }
                                            } else if (isSelected) {
                                                optionStyle = 'bg-accent/5 border-accent text-text-heading shadow-xs';
                                                badgeStyle = 'bg-accent text-white';
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={hasChecked}
                                                    onClick={() => setSelectedOption(idx)}
                                                    className={`w-full p-2.5 rounded-md text-left transition-all border relative flex items-center gap-3 ${optionStyle}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center appropriate-sans text-[9px] font-bold shrink-0 transition-colors ${badgeStyle}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <div className="appropriate-sans text-[12px] font-medium leading-normal flex-1">
                                                        <MathRenderer content={toRenderableString(option)} />
                                                    </div>
                                                    {hasChecked && isCorrectOption && (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    )}
                                                    {hasChecked && isSelected && !isCorrectOption && (
                                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Instant Insight Box */}
                                    {hasChecked && (
                                        <div className="space-y-2 animate-in fade-in duration-200 pt-2">
                                            <div className="p-3 bg-sidebar border border-border rounded-md">
                                                <div className="flex items-center gap-1.5 mb-1 text-accent">
                                                    <span className="appropriate-sans text-[8px] font-bold uppercase tracking-widest">Core Insight</span>
                                                </div>
                                                <div className="appropriate-sans text-[11px] text-text-primary leading-relaxed">
                                                    <MathRenderer content={toRenderableString(currentQ.explanation)} />
                                                </div>
                                            </div>

                                            {misconceptionNote && (
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
                                                    <div className="flex items-center gap-1.5 mb-1 text-amber-500">
                                                        <span className="appropriate-sans text-[8px] font-bold uppercase tracking-widest">Diagnostic Insight</span>
                                                    </div>
                                                    <div className="appropriate-sans text-[11px] text-text-muted leading-relaxed">
                                                        <MathRenderer content={toRenderableString(misconceptionNote)} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                {!isCompleted && !isLoading && !error && currentQ && (
                    <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-sidebar/30">
                        <div className="appropriate-sans text-[10px] font-bold text-text-muted">
                            Euler<span className="text-accent">Fold</span> Database
                        </div>

                        <div>
                            {!hasChecked ? (
                                <button
                                    onClick={handleConfirmAnswer}
                                    disabled={isOpenEnded ? !textAnswer.trim() : selectedOption === null}
                                    className="px-5 py-2 bg-accent text-white rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40"
                                >
                                    Confirm Choice
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="px-5 py-2 bg-text-heading text-background rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-1.5"
                                >
                                    {currentIdx + 1 < questions.length ? 'Next Question ➔' : 'View Results 🏁'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
