import React from 'react';
import TTSListenButton from '@/components/TTSListenButton';

interface MCQResultsProps {
    mcqSession: any;
    mcqAnswers: number[];
    topicName: string;
    reset: () => void;
}

export default function MCQResults({
    mcqSession,
    mcqAnswers,
    topicName,
    reset
}: MCQResultsProps) {
    if (!mcqSession) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-[650px] mx-auto w-full p-4 md:p-8 pb-16 border-x border-border">
                <div className="text-center mb-10 border-b border-border pb-8">
                    <div className="w-10 h-10 border border-border flex items-center justify-center mx-auto mb-3 text-lg">🏆</div>
                    <h2 className="appropriate-sans text-xl font-bold text-text-heading mb-1 uppercase tracking-tighter">Results</h2>
                    <p className="appropriate-sans text-[9px] text-text-muted uppercase tracking-[0.3em]">&quot;{topicName}&quot;</p>
                    
                    <div className="flex items-center justify-center gap-10 mt-8">
                        <div className="text-center">
                            <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{Math.round((mcqSession.score || 0) * 100)}%</div>
                            <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Accuracy</div>
                        </div>
                        <div className="w-[1px] h-10 bg-border"></div>
                        <div className="text-center">
                            <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{mcqSession.questions.filter((q: any, i: number) => mcqAnswers[i] === q.correct_answer_index).length}</div>
                            <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Correct</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-[0.4em] mb-6">Detailed Breakdown</h3>
                    {mcqSession.questions.map((q: any, i: number) => {
                        const isCorrect = mcqAnswers[i] === q.correct_answer_index;
                        return (
                            <div key={i} className={`p-5 border rounded-lg transition-all ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-start gap-4">
                                        <div className={`shrink-0 w-6 h-6 border flex items-center justify-center appropriate-sans text-[10px] font-bold ${isCorrect ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                                            {i + 1}
                                        </div>
                                        <h4 className="appropriate-sans text-[14px] font-bold text-text-heading leading-tight">{q.question}</h4>
                                    </div>
                                    <TTSListenButton 
                                        text={`Question ${i+1}: ${q.question}. Correct answer: ${q.options[q.correct_answer_index]}. Explanation: ${q.explanation}`}
                                        label="Explanation"
                                    />
                                </div>
                                
                                <div className="ml-10 space-y-3">
                                    {!isCorrect && (
                                        <div className="text-[11px] appropriate-sans border-l-2 border-red-500 pl-3 py-0.5">
                                            <p className="text-[9px] font-bold text-red-500 mb-1">Your answer</p>
                                            <span className="text-text-muted font-medium">{q.options[mcqAnswers[i]]}</span>
                                        </div>
                                    )}
                                    <div className="text-[11px] appropriate-sans border-l-2 border-emerald-500 pl-3 py-0.5">
                                        <p className="text-[9px] font-bold text-emerald-500 mb-1">Correct</p>
                                        <span className="text-text-heading font-bold">{q.options[q.correct_answer_index]}</span>
                                    </div>
                                    <div className="bg-background border border-border/50 p-3 rounded-lg text-[10px] appropriate-sans text-text-muted leading-relaxed italic">
                                        <span className="font-bold text-text-heading not-italic uppercase tracking-widest text-[7px] mr-2 block mb-1 underline decoration-accent">Note:</span> 
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
                        className="px-16 py-3 bg-text-heading text-background rounded-lg appropriate-sans text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
                    >
                        Sync Progress & Exit 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}
