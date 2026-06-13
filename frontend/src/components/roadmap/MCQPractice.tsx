'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logAIUsage } from '@/lib/usageTracker';
import { Loader, X, Trophy, Check, ArrowRight, Zap, Cloud, Key, Cpu } from 'lucide-react';
import { practiceAPI, MCQSessionRead, MCQQuestion } from '@/lib/api';
import Link from 'next/link';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import TTSListenButton from '@/components/TTSListenButton';
import { OpenRouterModal } from '@/components/landing/OpenRouterModal';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

interface MCQPracticeProps {
    roadmapId?: number;
    subtopicId?: string;
    topicName: string;
    subject: string;
    weekNumber: number;
    isPro: boolean;
    userCredits: number;
    onPointsEarned: (amount: number) => void;
    onRefreshProfile: () => Promise<void>;
    onClose?: () => void;
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
    onRefreshProfile,
    onClose
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

    // Engine Selection State
    const [useOpenRouter, setUseOpenRouter] = useState(true);
    const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
    const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o');
    const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);

    const [useLocalAI, setUseLocalAI] = useState(false);
    const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
    const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
    const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);

    React.useEffect(() => {
        setOpenRouterKey(localStorage.getItem('openRouterKey'));
        setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
        setLocalAIModelId(localStorage.getItem('localAIModelId'));
        setLocalAIModelName(localStorage.getItem('localAIModelName'));
    }, []);

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
        if (!useOpenRouter && !useLocalAI && !isPro) return;
        setIsGenerating(true);
        
        const systemPrompt = `You are a subject matter expert in "${subject}".
Generate ${questionCount} Multiple Choice Questions (MCQs) for a learner currently in Week ${weekNumber} studying the specific topic: "${topicName}".

CRITICAL QUALITY STANDARDS:
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall or rote memorization.
- Focus on application of principles and "what would happen if" scenarios.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.
- Options should be plausible but distinct.
- Do not generate questions that can be answered by simply recalling a definition. Every question must require the learner to think, apply, or reason.
- Provide a detailed explanation for why the correct answer is right.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1", "q2")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice`;

        try {
            let session;
            
            if (openRouterKey && useOpenRouter) {
                const requestBody = {
                    model: openRouterModel || 'openai/gpt-4o',
                    messages: [
                        { role: "system", content: systemPrompt }
                    ],
                    response_format: { type: "json_object" }
                };

                const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openRouterKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "EulerFold AI"
                    },
                    body: JSON.stringify(requestBody)
                });

                const orData = await orResponse.json();
                if (!orResponse.ok) throw new Error(orData.error?.message || "OpenRouter generation failed.");

                let questions;
                try {
                    questions = JSON.parse(orData.choices[0].message.content);
                    if (questions.questions) questions = questions.questions; // Handle nested json
                } catch (e) {
                    throw new Error("Failed to parse JSON from OpenRouter response.");
                }

                session = await practiceAPI.saveExternalMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    subject: subject,
                    week_number: weekNumber,
                    questions: questions
                });
                
                try {
                    logAIUsage({
                        id: session?.id,
                        subject: `Practice: ${topicName}`,
                        model: orData.model || openRouterModel,
                        prompt_tokens: orData.usage?.prompt_tokens || 0,
                        completion_tokens: orData.usage?.completion_tokens || 0,
                        total_tokens: orData.usage?.total_tokens || 0
                    });
                } catch (e) {}
            } else if (localAIModelId && useLocalAI) {
                let engine;
                try {
                    const initProgressCallback = (report: { text: string }) => {
                        console.log("Local AI Init:", report.text);
                    };
                    engine = await CreateMLCEngine(localAIModelId, { initProgressCallback });
                } catch (err) {
                    throw new Error("Hardware Crash: Failed to load the local AI engine. Please try a different model.");
                }

                let generatedText = '';
                let parseSuccess = false;
                let parsedJSON = null;

                let responseUsage = null;

                for (let attempt = 1; attempt <= 2; attempt++) {
                    try {
                        const response = await engine.chat.completions.create({
                            messages: [
                                { role: "system", content: systemPrompt }
                            ],
                        });
                        
                        generatedText = response.choices[0].message.content || '';
                        responseUsage = response.usage || null;
                        const cleanedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
                        parsedJSON = JSON.parse(cleanedText);
                        if (parsedJSON.questions) parsedJSON = parsedJSON.questions; // Handle nested json
                        parseSuccess = true;
                        break;
                    } catch (err: any) {
                        if (attempt === 2) throw new Error("Local AI failed to generate valid JSON after 2 attempts. Try a different model or use EulerFold AI.");
                    }
                }

                if (!parseSuccess || !parsedJSON) {
                    throw new Error("Local AI failed to generate valid JSON.");
                }

                session = await practiceAPI.saveExternalMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    subject: subject,
                    week_number: weekNumber,
                    questions: parsedJSON
                });

                try {
                    logAIUsage({
                        id: session?.id,
                        subject: `Practice: ${topicName}`,
                        model: localAIModelId,
                        prompt_tokens: responseUsage?.prompt_tokens || 0,
                        completion_tokens: responseUsage?.completion_tokens || 0,
                        total_tokens: responseUsage?.total_tokens || 0
                    });
                } catch (e) {}
            } else {
                session = await practiceAPI.generateMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    subject: subject,
                    week_number: weekNumber,
                    num_questions: questionCount
                });
            }

            setMcqSession(session);
            setCurrentMcqIdx(0);
            setMcqAnswers([]);
            setShowResults(false);
            await onRefreshProfile(); // Update credits display
        } catch (err: any) {
            console.error('Error generating MCQ:', err);
            alert(err.response?.data?.detail || err.message || 'Failed to generate assessment');
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
        if (onClose) onClose();
    };


    return (
        <div className="flex flex-col p-5 border border-[var(--accent)] rounded-lg bg-accent-muted/5 shadow-sm h-full relative group">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="appropriate-sans text-[8px] font-bold text-accent uppercase tracking-[0.2em]">AI Generation</span>
                    {isPro && (
                        <div className="flex items-center gap-1 opacity-60">
                            <span className="text-[10px]">💎</span>
                            <span className="appropriate-sans text-[8px] font-bold text-text-heading">{userCredits} Credits</span>
                        </div>
                    )}
                </div>
                <div className="flex items-baseline justify-between mb-0.5">
                    <span className="appropriate-sans text-[15px] font-bold text-text-heading uppercase tracking-tight">Curated Questions</span>
                </div>
                <p className="appropriate-sans text-[11px] text-text-muted italic opacity-70">Practice some MCQ questions.</p>
            </div>

            <div className="flex-1 flex flex-col">
                {incompleteSession ? (
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
                ) : (
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
                                    disabled={true}
                                    onClick={() => {}}
                                    className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all text-red-500 opacity-60 cursor-not-allowed`}
                                >
                                    EulerFold AI (Temporary Outage)
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
                                <div className="space-y-1 max-h-[100px] overflow-y-auto no-scrollbar">
                                    {mcqHistory.map((session, idx) => (
                                        <div key={session.id} className="flex items-center justify-between p-1.5 bg-sidebar/30 border border-border/50 text-[9px]">
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isGenerating && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                    <div className="animate-in fade-in zoom-in duration-300">
                        <Loader className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                        <p className="appropriate-sans text-[11px] font-bold text-accent mb-4">
                            Wait... generating custom questions for {topicName}.
                        </p>
                    </div>
                </div>
            )}

            <OpenRouterModal 
                isOpen={isOpenRouterModalOpen} 
                onClose={() => {
                    setIsOpenRouterModalOpen(false);
                    setOpenRouterKey(localStorage.getItem('openRouterKey'));
                    setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
                }} 
                formData={{ subject, time_value: weekNumber, goal: topicName }}
                onSuccess={() => {}}
            />
            <LocalAIModal
                isOpen={isLocalAIModalOpen}
                onClose={() => setIsLocalAIModalOpen(false)}
                onSelectModel={(modelId, modelName) => {
                    localStorage.setItem('localAIModelId', modelId);
                    localStorage.setItem('localAIModelName', modelName);
                    setLocalAIModelId(modelId);
                    setLocalAIModelName(modelName);
                    setUseLocalAI(true);
                    setUseOpenRouter(false);
                }}
            />

            {/* MCQ Active Session Overlay */}
            {mcqSession && !showResults && (
                <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
                    <div className="max-w-[550px] mx-auto w-full flex flex-col p-4 md:p-8 border-x border-border min-h-screen">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 border border-border flex items-center justify-center text-sm">🧠</div>
                                <div>
                                    <h3 className="appropriate-sans text-xs font-bold text-text-heading tracking-tight uppercase">MCQ practice session</h3>
                                    <p className="appropriate-sans text-[7px] font-bold text-text-muted uppercase tracking-widest">{subject.replace('DEVELOPEMENT', 'DEVELOPMENT')} / {topicName}</p>
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
                            {mcqSession.questions.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 h-full transition-all duration-500 ${i <= currentMcqIdx ? 'bg-accent' : 'bg-transparent'}`} 
                                />
                            ))}
                        </div>

                        <div className="flex-1">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="appropriate-sans text-[7px] font-bold text-accent uppercase tracking-[0.2em] block">Question {currentMcqIdx + 1} // {mcqSession.questions.length}</span>
                                    <TTSListenButton 
                                        text={`Question: ${mcqSession.questions[currentMcqIdx].question}. Options are: ${mcqSession.questions[currentMcqIdx].options.map((o, idx) => `${String.fromCharCode(65 + idx)}: ${o}`).join(', ')}.`}
                                        label="Question"
                                    />
                                </div>
                                <h2 className="appropriate-sans text-[13px] md:text-[14px] font-bold text-text-heading leading-snug">
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
                                <EulerLogoCanvas size={20} rotationSpeed={0.002} />
                                <span>Euler<span className="text-accent">Fold</span></span>
                            </div>
                            
                            {currentMcqIdx === mcqSession.questions.length - 1 && mcqAnswers[currentMcqIdx] !== undefined ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-10 py-3 bg-text-heading text-background rounded-lg appropriate-sans text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
                                >
                                    {isSubmitting ? 'Finalizing...' : 'Submit Session 🏁'}
                                </button>
                            ) : mcqAnswers[currentMcqIdx] !== undefined ? (
                                <button
                                    onClick={() => setCurrentMcqIdx(prev => prev + 1)}
                                    className="px-10 py-3 bg-text-heading text-background rounded-lg appropriate-sans text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all flex items-center gap-2"
                                >
                                    Next Question <ArrowRight className="w-3.5 h-3.5" />
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
                            <h2 className="appropriate-sans text-xl font-bold text-text-heading mb-1 uppercase tracking-tighter">Results</h2>
                            <p className="appropriate-sans text-[9px] text-text-muted uppercase tracking-[0.3em]">&quot;{topicName}&quot;</p>
                            
                            <div className="flex items-center justify-center gap-10 mt-8">
                                <div className="text-center">
                                    <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{Math.round((mcqSession.score || 0) * 100)}%</div>
                                    <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Accuracy</div>
                                </div>
                                <div className="w-[1px] h-10 bg-border"></div>
                                <div className="text-center">
                                    <div className="appropriate-sans text-3xl font-bold text-text-heading mb-0.5">{mcqSession.questions.filter((q, i) => mcqAnswers[i] === q.correct_answer_index).length}</div>
                                    <div className="appropriate-sans text-[8px] font-bold text-text-muted uppercase tracking-widest">Correct</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="appropriate-sans text-[9px] font-bold text-text-muted uppercase tracking-[0.4em] mb-6">Detailed Breakdown</h3>
                            {mcqSession.questions.map((q, i) => {
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
            )}
        </div>
    );
}
