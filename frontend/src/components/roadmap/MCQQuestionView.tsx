'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import TTSListenButton from '@/components/TTSListenButton';
import { MCQQuestion, MCQSessionRead } from '@/lib/api';

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

interface MCQQuestionViewProps {
    mcqSession: MCQSessionRead;
    currentMcqIdx: number;
    mcqAnswers: (number | string)[];
    setMcqAnswers: (answers: (number | string)[]) => void;
    setCurrentMcqIdx: (updater: (prev: number) => number) => void;
    setMcqSession: React.Dispatch<React.SetStateAction<MCQSessionRead | null>>;
    subject: string;
    moduleTitle: string;
    topicName: string;
    handleSubmit: (customQuestions?: MCQQuestion[]) => Promise<void>;
    isSubmitting: boolean;
}

const STAGE_ORDER = ['Warm-up', 'Core Mechanics', 'Edge Cases', 'Capstone Mastery'] as const;
type StageType = typeof STAGE_ORDER[number];

const STAGE_CONFIG: Record<StageType, { target: number }> = {
    'Warm-up': { target: 6 },
    'Core Mechanics': { target: 5 },
    'Edge Cases': { target: 4 },
    'Capstone Mastery': { target: 3 }
};

const isAnswerCorrect = (q: MCQQuestion, ans: number | string | null | undefined): boolean => {
    if (ans === null || ans === undefined) return false;
    const isOpen = !q.options || q.options.length === 0 || q.format === 'open_ended' || q.format === 'open_ended_coding';
    if (isOpen) {
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
    return ans === q.correct_answer_index;
};

export default function MCQQuestionView({
    mcqSession,
    currentMcqIdx,
    mcqAnswers,
    setMcqAnswers,
    setCurrentMcqIdx,
    setMcqSession,
    subject,
    moduleTitle,
    topicName,
    handleSubmit,
    isSubmitting
}: MCQQuestionViewProps) {
    const getStagePool = React.useCallback((): Record<StageType, MCQQuestion[]> => {
        const pool: Record<StageType, MCQQuestion[]> = {
            'Warm-up': [],
            'Core Mechanics': [],
            'Edge Cases': [],
            'Capstone Mastery': []
        };
        if (mcqSession.pool) {
            for (const stage of STAGE_ORDER) {
                if (Array.isArray(mcqSession.pool[stage])) {
                    pool[stage] = [...mcqSession.pool[stage]];
                }
            }
        }
        if (pool['Warm-up'].length === 0 && pool['Core Mechanics'].length === 0 && mcqSession.questions) {
            for (const q of mcqSession.questions) {
                const stage = (q.momentum_stage as StageType) || 'Core Mechanics';
                if (pool[stage]) {
                    pool[stage].push(q);
                } else {
                    pool['Core Mechanics'].push(q);
                }
            }
        }
        return pool;
    }, [mcqSession]);

    const initialStats = React.useMemo(() => {
        const counts: Record<StageType, number> = {
            'Warm-up': 0,
            'Core Mechanics': 0,
            'Edge Cases': 0,
            'Capstone Mastery': 0
        };
        let activeStage: StageType = 'Warm-up';

        if (mcqAnswers.length > 0 && mcqSession.questions) {
            for (let i = 0; i < mcqAnswers.length; i++) {
                const q = mcqSession.questions[i];
                if (!q) continue;
                const stage = (q.momentum_stage as StageType) || 'Warm-up';
                if (isAnswerCorrect(q, mcqAnswers[i])) {
                    counts[stage] = (counts[stage] || 0) + 1;
                }
            }
            for (const s of STAGE_ORDER) {
                if (counts[s] < STAGE_CONFIG[s].target) {
                    activeStage = s;
                    break;
                }
                activeStage = s;
            }
        }
        return { counts, activeStage };
    }, [mcqAnswers, mcqSession]);

    const [activeQuestions, setActiveQuestions] = useState<MCQQuestion[]>(() => {
        if (mcqAnswers.length > 0 && mcqSession.questions && mcqSession.questions.length > mcqAnswers.length) {
            return mcqSession.questions.slice(0, mcqAnswers.length + 1);
        }
        const stagePool = getStagePool();
        const firstQ = stagePool['Warm-up'][0] || mcqSession.questions?.[0];
        return firstQ ? [firstQ] : (mcqSession.questions || []);
    });

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [textAnswer, setTextAnswer] = useState<string>('');
    const [hasChecked, setHasChecked] = useState(false);
    const [currentStage, setCurrentStage] = useState<StageType>(initialStats.activeStage);
    const [stageCorrectCount, setStageCorrectCount] = useState<Record<StageType, number>>(initialStats.counts);

    const currentQ = activeQuestions[currentMcqIdx] || activeQuestions[0];
    const isCapstoneMastered = currentStage === 'Capstone Mastery' && (stageCorrectCount['Capstone Mastery'] || 0) >= STAGE_CONFIG['Capstone Mastery'].target;
    const isCompleted = (isCapstoneMastered || activeQuestions.length >= 35) && hasChecked;

    if (!mcqSession || !currentQ) return null;

    const isOpenEnded = !currentQ.options || currentQ.options.length === 0 || currentQ.format === 'open_ended' || currentQ.format === 'open_ended_coding';
    const isCurrentCorrect = isAnswerCorrect(currentQ, isOpenEnded ? textAnswer.trim() : selectedOption);

    const handleConfirmAnswer = () => {
        if (hasChecked) return;

        let isCorrect = false;
        const newAnswers = [...mcqAnswers];

        if (isOpenEnded) {
            if (!textAnswer.trim()) return;
            isCorrect = isAnswerCorrect(currentQ, textAnswer.trim());
            newAnswers[currentMcqIdx] = textAnswer.trim();
        } else {
            if (selectedOption === null) return;
            isCorrect = selectedOption === currentQ.correct_answer_index;
            newAnswers[currentMcqIdx] = selectedOption;
        }

        setMcqAnswers(newAnswers);
        setHasChecked(true);

        const stage = (currentQ.momentum_stage as StageType) || currentStage;

        if (isCorrect) {
            const updatedCount = (stageCorrectCount[stage] || 0) + 1;
            setStageCorrectCount(prev => ({ ...prev, [stage]: updatedCount }));

            const stageTarget = STAGE_CONFIG[stage]?.target || 3;
            if (updatedCount >= stageTarget) {
                const currentIdx = STAGE_ORDER.indexOf(stage);
                if (currentIdx < STAGE_ORDER.length - 1) {
                    const nextStage = STAGE_ORDER[currentIdx + 1];
                    setCurrentStage(nextStage);
                }
            }
        }
    };

    const handleNextQuestion = async () => {
        if (isCompleted) {
            await handleSubmit(activeQuestions);
            return;
        }

        let targetStage: StageType = currentStage;
        const currentStageRequirement = STAGE_CONFIG[currentStage]?.target || 3;
        const solvedAtCurrentStage = stageCorrectCount[currentStage] || 0;

        if (solvedAtCurrentStage >= currentStageRequirement) {
            const currentIdx = STAGE_ORDER.indexOf(currentStage);
            if (currentIdx < STAGE_ORDER.length - 1) {
                targetStage = STAGE_ORDER[currentIdx + 1];
                setCurrentStage(targetStage);
            }
        }

        const usedIds = new Set(activeQuestions.map(q => q.id));
        const stagePool = getStagePool();
        let nextQuestion: MCQQuestion | null = stagePool[targetStage]?.find(q => !usedIds.has(q.id)) || null;

        if (!nextQuestion) {
            for (const fallbackStage of STAGE_ORDER) {
                const candidate = stagePool[fallbackStage]?.find(q => !usedIds.has(q.id));
                if (candidate) {
                    nextQuestion = candidate;
                    break;
                }
            }
        }

        if (!nextQuestion && mcqSession.questions) {
            nextQuestion = mcqSession.questions.find(q => !usedIds.has(q.id)) || null;
        }

        if (!nextQuestion) {
            await handleSubmit(activeQuestions);
            return;
        }

        setActiveQuestions(prev => [...prev, nextQuestion!]);
        setCurrentMcqIdx(prev => prev + 1);
        setSelectedOption(null);
        setTextAnswer('');
        setHasChecked(false);
    };

    const currentAnswer = mcqAnswers[currentMcqIdx];
    const misconceptionNote = (!isOpenEnded && hasChecked && selectedOption !== null && selectedOption !== currentQ.correct_answer_index)
        ? currentQ.misconception_map?.[String(selectedOption)]
        : null;

    return (
        <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-[580px] mx-auto w-full flex flex-col p-4 md:p-8 border-x border-border min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 border border-border flex items-center justify-center text-sm rounded-md">🧠</div>
                        <div>
                            <h3 className="appropriate-sans text-xs font-bold text-text-heading tracking-tight uppercase">Adaptive Momentum Practice</h3>
                            <p className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">{moduleTitle || topicName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (confirm('Abandon this practice session?')) {
                                setMcqSession(null);
                            }
                        }}
                        className="p-1 border border-border hover:bg-sidebar rounded-md text-text-muted transition-colors"
                        title="Close session"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                Question {currentMcqIdx + 1}
                            </span>
                            <TTSListenButton 
                                text={isOpenEnded 
                                    ? `Question: ${currentQ.question}`
                                    : `Question: ${currentQ.question}. Options are: ${(currentQ.options || []).map((o: string, idx: number) => `${String.fromCharCode(65 + idx)}: ${o}`).join(', ')}.`
                                }
                                label="Question"
                            />
                        </div>

                        <div className="appropriate-sans text-[14px] md:text-[15px] font-bold text-text-heading leading-snug">
                            <MathRenderer content={toRenderableString(currentQ.question)} />
                        </div>
                    </div>

                    {/* Open-Ended Text Box or Multiple Choice Options Grid */}
                    {isOpenEnded ? (
                        <div className="space-y-3 mb-4">
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
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 mb-4">
                            {(currentQ.options || []).map((option: string, idx: number) => {
                                const isSelected = selectedOption === idx || currentAnswer === idx;
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
                                        className={`w-full p-3 rounded-md text-left transition-all border relative flex items-center gap-3 ${optionStyle}`}
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
                    )}

                    {/* Instant Explanation & Diagnostic Trap Box */}
                    {hasChecked && (
                        <div className="space-y-2 animate-in fade-in duration-200 mb-6">
                            {(currentQ.solution || currentQ.explanation) && (
                                <div className="p-3 bg-sidebar border border-border rounded-md">
                                    <div className="flex items-center gap-1.5 mb-1 text-accent">
                                        <span className="appropriate-sans text-[8px] font-bold uppercase tracking-widest">
                                            {isOpenEnded && currentQ.solution ? 'Execution Trace' : 'Core Insight'}
                                        </span>
                                    </div>
                                    <div className="appropriate-sans text-[11px] text-text-primary leading-relaxed">
                                        <MathRenderer content={toRenderableString(currentQ.solution || currentQ.explanation)} />
                                    </div>
                                </div>
                            )}

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
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-border flex items-center justify-between pb-4">
                    <div className="appropriate-sans text-[11px] font-bold text-text-heading tracking-tight">
                        Euler<span className="text-accent">Fold</span>
                    </div>

                    <div>
                        {!hasChecked ? (
                            <button
                                onClick={handleConfirmAnswer}
                                disabled={isOpenEnded ? !textAnswer.trim() : selectedOption === null}
                                className="px-6 py-2 bg-accent text-white rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40"
                            >
                                Confirm Choice
                            </button>
                        ) : isCompleted ? (
                            <button
                                onClick={handleNextQuestion}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-text-heading text-background rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Finalizing...' : 'Finish Session 🏁'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="px-6 py-2 bg-text-heading text-background rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-1.5"
                            >
                                Next Question <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
