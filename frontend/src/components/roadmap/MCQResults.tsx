import React from 'react';
import TTSListenButton from '@/components/TTSListenButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MCQResultsProps {
    mcqSession: any;
    mcqAnswers: (number | string)[];
    topicName: string;
    reset: () => void;
}

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

const isAnswerCorrect = (q: any, ans: any): boolean => {
    if (ans === null || ans === undefined) return false;
    const isOpen = !q.options || q.options.length === 0 || q.format === 'open_ended' || q.format === 'open_ended_coding';
    if (isOpen) {
        if (typeof ans !== 'string' || !q.ground_truth_answer) return false;
        const normAns = ans.trim().replace(/^['"]|['"]$/g, '').trim().toLowerCase();
        const normGroundTruth = String(q.ground_truth_answer).trim().replace(/^['"]|['"]$/g, '').trim().toLowerCase();
        return normAns === normGroundTruth;
    }
    return ans === q.correct_answer_index;
};

export default function MCQResults({
    mcqSession,
    mcqAnswers,
    topicName,
    reset
}: MCQResultsProps) {
    // Calculate Momentum Stage Breakdown
    const stages = ['Warm-up', 'Core Mechanics', 'Edge Cases', 'Capstone Mastery'];
    const stageStats = stages.map(stage => {
        const stageQs = mcqSession.questions.map((q: any, i: number) => ({ q, i })).filter(({ q }: any) => q.momentum_stage === stage);
        if (stageQs.length === 0) return null;
        const correctCount = stageQs.filter(({ q, i }: any) => isAnswerCorrect(q, mcqAnswers[i])).length;
        const totalCount = stageQs.length;
        const pct = Math.round((correctCount / totalCount) * 100);
        return { stage, correctCount, totalCount, pct };
    }).filter(Boolean);

    return (
        <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-[650px] mx-auto w-full p-4 md:p-8 pb-16 border-x border-border">
                <div className="text-center mb-8 border-b border-border pb-6">
                    <div className="w-10 h-10 border border-border flex items-center justify-center mx-auto mb-3 text-lg">🏆</div>
                    <h2 className="appropriate-sans text-xl font-bold text-text-heading mb-1 uppercase tracking-tighter">Results</h2>
                    <p className="appropriate-sans text-[9px] text-text-muted uppercase tracking-[0.3em]">&quot;{topicName}&quot;</p>
                    
                    <div className="flex items-center justify-center gap-10 mt-6">
                        <div className="text-center">
                            <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{Math.round((mcqSession.score || 0) * 100)}%</div>
                            <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Accuracy</div>
                        </div>
                        <div className="w-[1px] h-10 bg-border"></div>
                        <div className="text-center">
                            <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{mcqSession.questions.filter((q: any, i: number) => isAnswerCorrect(q, mcqAnswers[i])).length} / {mcqSession.questions.length}</div>
                            <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Correct</div>
                        </div>
                    </div>

                    {/* Momentum Progression Breakdown */}
                    {stageStats.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-border/60">
                            <span className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3">
                                Momentum Progression Breakdown
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {stageStats.map((st: any) => (
                                    <div key={st.stage} className="p-2.5 bg-sidebar/40 border border-border rounded-md text-center">
                                        <div className="appropriate-sans text-[7px] font-bold text-text-muted uppercase tracking-wider mb-1">
                                            {st.stage}
                                        </div>
                                        <div className="appropriate-sans text-sm font-bold text-text-heading">
                                            {st.correctCount}/{st.totalCount}
                                        </div>
                                        <div className="text-[8px] font-bold text-accent appropriate-sans">
                                            {st.pct}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-[0.4em] mb-4">Detailed Breakdown</h3>
                    {mcqSession.questions.map((q: any, i: number) => {
                        const isOpen = !q.options || q.options.length === 0 || q.format === 'open_ended' || q.format === 'open_ended_coding';
                        const isCorrect = isAnswerCorrect(q, mcqAnswers[i]);
                        const misconceptionText = !isOpen ? q.misconception_map?.[String(mcqAnswers[i])] : null;

                        const userAnswerDisplay = isOpen 
                            ? String(mcqAnswers[i] ?? '')
                            : (q.options ? q.options[mcqAnswers[i] as number] : String(mcqAnswers[i] ?? ''));

                        const correctAnswerDisplay = isOpen
                            ? String(q.ground_truth_answer ?? '')
                            : (q.options ? q.options[q.correct_answer_index] : String(q.ground_truth_answer ?? ''));

                        return (
                            <div key={i} className={`p-4 md:p-5 border rounded-md transition-all ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`shrink-0 w-6 h-6 border flex items-center justify-center appropriate-sans text-[10px] font-bold rounded-md ${isCorrect ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            {q.momentum_stage && (
                                                <span className="inline-block appropriate-sans text-[7px] font-bold uppercase tracking-wider text-text-muted mb-1">
                                                    {q.momentum_stage} • {q.difficulty || 'medium'}
                                                </span>
                                            )}
                                            <div className="appropriate-sans text-[13px] md:text-[14px] font-bold text-text-heading leading-tight">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {toRenderableString(q.question)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                    <TTSListenButton 
                                        text={`Question ${i+1}: ${q.question}. Correct answer: ${correctAnswerDisplay}. Explanation: ${q.solution || q.explanation || ''}`}
                                        label="Explanation"
                                    />
                                </div>
                                
                                <div className="ml-9 space-y-2.5">
                                    {!isCorrect && (
                                        <div className="text-[11px] appropriate-sans border-l-2 border-red-500 pl-3 py-0.5">
                                            <p className="text-[8px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Your answer</p>
                                            <span className={`text-text-muted font-medium ${isOpen ? 'font-mono' : ''}`}>{userAnswerDisplay}</span>
                                        </div>
                                    )}

                                    {/* Misconception Diagnostic Callout */}
                                    {!isCorrect && misconceptionText && (
                                        <div className="bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-md text-[10px] appropriate-sans text-text-primary">
                                            <span className="font-bold text-amber-500 uppercase tracking-widest text-[7px] block mb-1">
                                                Diagnostic Misconception Insight
                                            </span>
                                            {misconceptionText}
                                        </div>
                                    )}

                                    <div className="text-[11px] appropriate-sans border-l-2 border-emerald-500 pl-3 py-0.5">
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Correct</p>
                                        <span className={`text-text-heading font-bold ${isOpen ? 'font-mono' : ''}`}>{correctAnswerDisplay}</span>
                                    </div>
                                    
                                    {(q.solution || q.explanation) && (
                                        <div className="bg-background border border-border/50 p-2.5 rounded-md text-[10px] appropriate-sans text-text-muted leading-relaxed">
                                            <span className="font-bold text-text-heading not-italic uppercase tracking-widest text-[7px] mr-2 block mb-1 underline decoration-accent">
                                                {isOpen && q.solution ? 'Execution Trace / Solution:' : 'Note:'}
                                            </span> 
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {toRenderableString(q.solution || q.explanation)}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 text-center border-t border-border pt-6">
                    <button 
                        onClick={reset}
                        className="px-12 py-2.5 bg-text-heading text-background rounded-md appropriate-sans text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-md transition-all"
                    >
                        Sync Progress & Exit 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}
