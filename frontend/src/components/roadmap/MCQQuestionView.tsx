import React from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import TTSListenButton from '@/components/TTSListenButton';

interface MCQQuestionViewProps {
    mcqSession: any;
    currentMcqIdx: number;
    mcqAnswers: number[];
    setMcqAnswers: (answers: number[]) => void;
    setCurrentMcqIdx: (updater: (prev: number) => number) => void;
    setMcqSession: (session: any) => void;
    subject: string;
    moduleTitle: string;
    topicName: string;
    handleSubmit: () => void;
    isSubmitting: boolean;
}

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
    if (!mcqSession) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-[550px] mx-auto w-full flex flex-col p-4 md:p-8 border-x border-border min-h-screen">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 border border-border flex items-center justify-center text-sm">🧠</div>
                        <div>
                            <h3 className="appropriate-sans text-xs font-bold text-text-heading tracking-tight uppercase">Module MCQ Practice</h3>
                            <p className="appropriate-sans text-[7px] font-bold text-text-muted uppercase tracking-widest">{subject.replace('DEVELOPEMENT', 'DEVELOPMENT')} / {moduleTitle || topicName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (confirm('Abandon this session? Credits will not be refunded.')) {
                                setMcqSession(null);
                            }
                        }}
                        className="p-1 border border-border hover:bg-callout-bg rounded-lg text-text-muted transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>

                {/* Progress line */}
                <div className="w-full h-[1px] bg-border mb-5 flex">
                    {mcqSession.questions.map((_: any, i: number) => (
                        <div 
                            key={i} 
                            className={`flex-1 h-full transition-all duration-500 ${i <= currentMcqIdx ? 'bg-accent' : 'bg-transparent'}`} 
                        />
                    ))}
                </div>

                <div className="flex-1">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="appropriate-sans text-[7px] font-bold text-accent uppercase tracking-[0.2em] block">Question {currentMcqIdx + 1} {'//'} {mcqSession.questions.length}</span>
                            <TTSListenButton 
                                text={`Question: ${mcqSession.questions[currentMcqIdx].question}. Options are: ${mcqSession.questions[currentMcqIdx].options.map((o: string, idx: number) => `${String.fromCharCode(65 + idx)}: ${o}`).join(', ')}.`}
                                label="Question"
                            />
                        </div>
                        <h2 className="appropriate-sans text-[13px] md:text-[14px] font-bold text-text-heading leading-snug">
                            {mcqSession.questions[currentMcqIdx].question}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        {mcqSession.questions[currentMcqIdx].options.map((option: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    const newAnswers = [...mcqAnswers];
                                    newAnswers[currentMcqIdx] = idx;
                                    setMcqAnswers(newAnswers);
                                }}
                                className={`w-full p-2.5 rounded-lg text-left transition-all border group relative ${
                                    mcqAnswers[currentMcqIdx] === idx 
                                        ? 'bg-accent/5 border-accent text-text-heading' 
                                        : 'bg-background border-border hover:border-accent/50 text-text-primary'
                                }`}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={`w-4 h-4 rounded-lg flex items-center justify-center appropriate-sans text-[8px] font-bold transition-colors ${
                                        mcqAnswers[currentMcqIdx] === idx ? 'bg-accent text-white' : 'bg-background border border-border text-text-muted group-hover:border-accent group-hover:text-accent'
                                    }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <div className="h-4 w-[1px] bg-border/40" />
                                    <span className="appropriate-sans text-[12px] font-medium leading-normal">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 mt-8 flex items-center justify-between border-t border-border pb-8">
                    <div className="flex items-center gap-2 appropriate-sans text-[13px] font-bold text-text-heading tracking-tight">
                        <span>Euler<span className="text-accent">Fold</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                        {currentMcqIdx > 0 && (
                            <button
                                onClick={() => setCurrentMcqIdx(prev => prev - 1)}
                                className="px-4 py-2 border border-border text-text-muted hover:text-text-heading hover:bg-sidebar rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-3 h-3" /> Previous
                            </button>
                        )}

                        {currentMcqIdx === mcqSession.questions.length - 1 ? (
                            <button
                                onClick={async () => {
                                    try {
                                        await handleSubmit();
                                    } catch (error: any) {
                                        alert(`Error submitting session: ${error.message || 'Unknown error'}`);
                                    }
                                }}
                                disabled={mcqAnswers.filter(a => a !== undefined && a !== null).length !== mcqSession.questions.length || isSubmitting}
                                className="px-6 py-2 bg-text-heading text-background rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-md transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Finalizing...' : 'Submit Session 🏁'}
                            </button>
                        ) : mcqAnswers[currentMcqIdx] !== undefined ? (
                            <button
                                onClick={() => setCurrentMcqIdx(prev => prev + 1)}
                                className="px-6 py-2 bg-text-heading text-background rounded-md appropriate-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-md transition-all flex items-center gap-1.5"
                            >
                                Next Question <ArrowRight className="w-3 h-3" />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
