"use client";

import React, { useState } from 'react';
import { X, Link as LinkIcon, Send, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Info, Lock } from 'lucide-react';
import { submissionsAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { OpenRouterModal } from '@/components/landing/OpenRouterModal';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { logAIUsage } from '@/lib/usageTracker';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    roadmapId: number;
    moduleNumber: number;
    moduleTitle: string;
    instructions?: string | any;
    onSuccess?: (evaluation: any) => void;
    initialResult?: any;
    roadmapSubject?: string;
    moduleTopicsText?: string;
    isPro?: boolean;
}

export default function HomeworkSubmissionModal({ isOpen, onClose, roadmapId, moduleNumber, moduleTitle, instructions, onSuccess, initialResult, roadmapSubject, moduleTopicsText, isPro }: Props) {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(initialResult || null);
    const [showInstructions, setShowInstructions] = useState(!initialResult);
    
    // Engine Selection State
    const [useOpenRouter, setUseOpenRouter] = useState(true);
    const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
    const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o');
    const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);

    const [useLocalAI, setUseLocalAI] = useState(false);
    const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
    const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
    const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);
    const [evaluatingProgress, setEvaluatingProgress] = useState<string>('');

    React.useEffect(() => {
        if (isOpen) {
            setLink('');
            setDescription('');
            setSubmitting(false);
            setError(null);
            setResult(initialResult || null);
            setShowInstructions(!initialResult);
            
            setOpenRouterKey(localStorage.getItem('openRouterKey'));
            setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
            setLocalAIModelId(localStorage.getItem('localAIModelId'));
            setLocalAIModelName(localStorage.getItem('localAIModelName'));
        }
    }, [isOpen, moduleNumber, initialResult]);

    if (!isOpen) return null;

    const renderInstructions = () => {
        if (!instructions) return null;
        
        if (typeof instructions === 'string') {
            return (
                <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
                    <p className="manrope-body text-[13px] text-text-primary leading-relaxed">{instructions}</p>
                </div>
            );
        }

        // Handle structured object from backend with collapsible sections
        return (
            <div className="space-y-2">
                {instructions.what_to_build && (
                    <details open className="group bg-accent/5 rounded-lg border border-accent/10 overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-accent/10 transition-colors list-none">
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">Objective</span>
                            <ChevronRight className="w-2.5 h-2.5 text-accent transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <p className="manrope-body text-[12px] text-text-primary leading-relaxed">{instructions.what_to_build}</p>
                        </div>
                    </details>
                )}
                {instructions.what_counts_as_evidence && (
                    <details className="group bg-callout-bg rounded-lg border border-border overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-callout-bg/80 transition-colors list-none">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Evidence</span>
                            <ChevronRight className="w-2.5 h-2.5 text-text-muted transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <p className="manrope-body text-[12px] text-text-primary leading-relaxed italic">{instructions.what_counts_as_evidence}</p>
                        </div>
                    </details>
                )}
                {instructions.eval_criteria && Array.isArray(instructions.eval_criteria) && (
                    <details className="group bg-callout-bg rounded-lg border border-border overflow-hidden">
                        <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-callout-bg/80 transition-colors list-none">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Criteria</span>
                            <ChevronRight className="w-2.5 h-2.5 text-text-muted transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="p-2.5 pt-0">
                            <ul className="list-disc list-inside space-y-0.5">
                                {instructions.eval_criteria.map((c: string, i: number) => (
                                    <li key={i} className="manrope-body text-[11px] text-text-muted">{c}</li>
                                ))}
                            </ul>
                        </div>
                    </details>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError("Please provide a description of your work.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Authentication required");

            let evaluation_result = null;

            if (useOpenRouter && openRouterKey) {
                setEvaluatingProgress('Evaluating via OpenRouter...');
                const prompt = `You are a Technical Reviewer analyzing homework for: ${moduleTitle}.
ROADMAP SUBJECT: ${roadmapSubject || 'N/A'}
MODULE OBJECTIVES: ${moduleTopicsText || 'N/A'}
EXPECTED DELIVERABLE: ${typeof instructions === 'string' ? instructions : JSON.stringify(instructions)}

USER SUBMISSION:
Description: ${description}
Link: ${link || 'None'}

CRITERIA:
1. Technical Depth: Accurate and deep enough?
2. Evidence of Learning: Shows genuine understanding?
3. Relevance: Aligns with roadmap?

OUTPUT RULES:
- BE CONCISE. Max 3 lines total for the summary.
- NO fluff, NO encouragement, NO "Great job". Just analysis.
- Decide a level: Solid, Developing, or Beginner.
- If 'Developing' or 'Beginner', provide direct next steps.
- Map the submission to the roadmap module’s objectives and extract only skills that are directly evidenced by the work.
- Return a JSON object with this exact structure:
{
  "level": "Solid | Developing | Beginner",
  "summary": "Direct analysis of the work (max 3 lines).",
  "feedback_details": {
    "technical": "...",
    "understanding": "...",
    "relevance": "..."
  },
  "evidence": [
    {"skill": "string", "strength": 0.0, "confidence": 0.0, "reason": "string"}
  ]
}

Respond ONLY with valid JSON. Do not include markdown code blocks.`;

                const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openRouterKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: openRouterModel || 'openai/gpt-4o',
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                        max_tokens: 8192
                    })
                });

                const orData = await orResponse.json();
                if (!orResponse.ok) throw new Error(orData.error?.message || "OpenRouter generation failed.");
                
                if (orData.error) {
                    throw new Error(orData.error.message || "OpenRouter internal model error.");
                }

                if (!orData.choices || orData.choices.length === 0) {
                    throw new Error("The AI model failed to return a valid response (possibly due to a content filter). Please try again or select a different model.");
                }

                try {
                    let content = orData.choices[0].message?.content?.trim() || "";
                    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

                    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
                    if (jsonBlockMatch && jsonBlockMatch[1]) {
                        content = jsonBlockMatch[1].trim();
                    } else {
                        const firstBrace = content.indexOf('{');
                        const lastBrace = content.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                            content = content.substring(firstBrace, lastBrace + 1);
                        }
                    }

                    evaluation_result = JSON.parse(content);
                    logAIUsage({
                        subject: `Homework Evaluation: ${moduleTitle}`,
                        model: openRouterModel || 'openai/gpt-4o',
                        prompt_tokens: orData.usage?.prompt_tokens || 0,
                        completion_tokens: orData.usage?.completion_tokens || 0,
                        total_tokens: orData.usage?.total_tokens || 0,
                    });
                } catch (e: any) {
                    throw new Error("The AI model returned an incomplete or corrupt response. Please try generating again, or select a different model from the settings.");
                }

            } else if (useLocalAI && localAIModelId) {
                setEvaluatingProgress('Loading Local AI Engine...');
                const initProgressCallback = (report: any) => {
                    setEvaluatingProgress(`Loading Local AI: ${Math.round(report.progress * 100)}%`);
                };

                let engine;
                try {
                    engine = await CreateMLCEngine(localAIModelId, { initProgressCallback });
                } catch (e) {
                    console.error(e);
                    throw new Error("Hardware Crash: Failed to load the local AI engine. Please try a different model.");
                }

                setEvaluatingProgress('Evaluating via Local AI (This may take a while)...');
                const prompt = `You are a Technical Reviewer analyzing homework for: ${moduleTitle}.
ROADMAP SUBJECT: ${roadmapSubject || 'N/A'}
MODULE OBJECTIVES: ${moduleTopicsText || 'N/A'}
EXPECTED DELIVERABLE: ${typeof instructions === 'string' ? instructions : JSON.stringify(instructions)}

USER SUBMISSION:
Description: ${description}
Link: ${link || 'None'}

CRITERIA:
1. Technical Depth: Accurate and deep enough?
2. Evidence of Learning: Shows genuine understanding?
3. Relevance: Aligns with roadmap?

OUTPUT RULES:
- BE CONCISE. Max 3 lines total for the summary.
- NO fluff, NO encouragement, NO "Great job". Just analysis.
- Decide a level: Solid, Developing, or Beginner.
- If 'Developing' or 'Beginner', provide direct next steps.
- Map the submission to the roadmap module’s objectives and extract only skills that are directly evidenced by the work.
- Return a JSON object with this exact structure:
{
  "level": "Solid | Developing | Beginner",
  "summary": "Direct analysis of the work (max 3 lines).",
  "feedback_details": {
    "technical": "...",
    "understanding": "...",
    "relevance": "..."
  },
  "evidence": [
    {"skill": "string", "strength": 0.8, "confidence": 0.9, "reason": "string"}
  ]
}

Respond ONLY with valid JSON. Do not include markdown code blocks.`;

                try {
                    const reply = await engine.chat.completions.create({
                        messages: [{ role: "user", content: prompt }]
                    });
                    let content = reply.choices[0].message.content || "";
                    content = content.trim();
                    if (content.startsWith("```json")) content = content.replace(/^```json/, "").replace(/```$/, "").trim();
                    evaluation_result = JSON.parse(content);
                    
                    logAIUsage({
                        subject: `Homework Evaluation: ${moduleTitle}`,
                        model: localAIModelId,
                        prompt_tokens: reply.usage?.prompt_tokens || 0,
                        completion_tokens: reply.usage?.completion_tokens || 0,
                        total_tokens: reply.usage?.total_tokens || 0,
                    });
                } catch (e: any) {
                    console.error("JSON parse failed. Cleaned text:", content);
                    throw new Error("The AI model returned an incomplete or corrupt response. Please try generating again, or select a different model from the settings.");
                } finally {
                    if (engine) await engine.unload();
                }
            } else {
                setEvaluatingProgress('Evaluating via EulerFold AI...');
            }

            const payload = {
                roadmap_id: roadmapId,
                module_number: moduleNumber,
                description,
                link: link || null,
                evaluation_result: evaluation_result
            };

            const data = await submissionsAPI.createSubmission(payload, session.access_token);
            setResult(data.evaluation);
            

            
            if (onSuccess) onSuccess(data.evaluation);
        } catch (err: any) {
            console.error("Submission failed:", err);
            setError(err.response?.data?.detail || err.message || "Failed to submit homework.");
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
                <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-sidebar border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-callout-bg rounded-full text-text-muted transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${
                                result.level === 'Solid' ? 'bg-emerald-500/10 text-emerald-500' : 
                                result.level === 'Developing' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-bold text-text-heading tracking-tight">Homework Evaluated</h3>
                                <p className="text-[11px] font-bold text-accent uppercase tracking-widest mt-0.5">Status: {result.level}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 flex-1 min-h-0">
                            {/* Left column: Summary and Link */}
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">
                                <div className="bg-background/50 border border-border p-4 rounded-lg">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Evaluation</h4>
                                    <p className="manrope-body text-[13px] text-text-primary leading-relaxed italic">
                                        &ldquo;{result.summary}&rdquo;
                                    </p>
                                </div>
                                
                                {(result.link || link) && (
                                    <div className="bg-background/50 border border-border p-4 rounded-lg">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Source Work</h4>
                                        <a href={result.link || link} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-accent hover:underline break-all flex items-start gap-2">
                                            <LinkIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            {result.link || link}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Right column: Skills */}
                            {result.evidence && result.evidence.length > 0 && (
                                <div className="flex flex-col min-h-0">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 shrink-0">Skills Validated</h4>
                                    <div className="space-y-2 overflow-y-auto no-scrollbar pr-1 flex-1">
                                        {result.evidence.map((ev: any, idx: number) => (
                                            <div key={idx} className="bg-background/40 border border-border/50 rounded-lg p-3 group hover:border-accent/30 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[12px] font-bold text-text-primary inconsolata-ui tracking-wide">{ev.skill}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        ev.strength >= 0.8 ? 'bg-emerald-500/10 text-emerald-500' :
                                                        ev.strength >= 0.5 ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {Math.round(ev.strength * 100)}%
                                                    </span>
                                                </div>
                                                {ev.reason && (
                                                    <p className="text-[11px] text-text-muted leading-relaxed mt-1.5">{ev.reason}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-2 shrink-0">
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-text-heading text-background rounded-lg text-[13px] font-bold tracking-wide hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                Back to Roadmap
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
            <div className={`relative bg-sidebar border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row transition-all duration-300 max-h-[90vh] ${showInstructions && instructions ? 'max-w-4xl' : 'max-w-lg'}`}>
                
                {/* Global Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-callout-bg rounded-full text-text-muted transition-colors z-[210]"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Main Form Area */}
                <div className="flex-1 p-6 border-r border-border/50 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-[16px] font-bold text-text-heading tracking-tight">Submit Homework</h3>
                                {instructions && (
                                    <button 
                                        onClick={() => setShowInstructions(!showInstructions)}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                                            showInstructions 
                                            ? 'bg-accent/10 text-accent' 
                                            : 'bg-accent text-white shadow-lg shadow-accent/20 hover:scale-105 active:scale-95'
                                        }`}
                                        title={showInstructions ? "Hide Instructions" : "Show Instructions"}
                                    >
                                        <HelpCircle className={`w-3 h-3 ${!showInstructions ? 'animate-pulse' : ''}`} />
                                        {!showInstructions && (
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-2 duration-500">
                                                See instructions
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="manrope-body text-[11px] text-text-muted mt-0.5">{moduleTitle}</p>
                        </div>
                    </div>

                    {!isPro && !result ? (
                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-[13px] font-bold text-red-500">Pro Feature</h4>
                                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                                    Unlock AI-powered homework evaluation and technical reviews with a Pro subscription.
                                </p>
                                <div className="mt-3">
                                    <Link href="/pricing" className="text-[11px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
                                        Upgrade to Pro <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Proof Link (Optional)
                            </label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
                                <input 
                                    type="url"
                                    placeholder="GitHub repo, PDF link, or Project URL"
                                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-[13px] manrope-body focus:border-accent outline-none transition-all"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Describe your work
                            </label>
                            <textarea 
                                placeholder="Explain what you built or learned. Be specific."
                                className="w-full h-24 bg-background/50 border border-border rounded-lg p-3 text-[13px] manrope-body focus:border-accent outline-none transition-all resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* AI Engine Selection */}
                        <div className="bg-background/40 border border-border/50 rounded-lg p-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-accent" /> Evaluator Engine
                                </span>
                            </div>
                            
                            <div className="flex gap-1.5 p-1 bg-background rounded-lg border border-border/50">
                                <button
                                    type="button"
                                    onClick={() => { setUseOpenRouter(false); setUseLocalAI(false); }}
                                    className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${!useOpenRouter && !useLocalAI ? 'bg-sidebar text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                                >
                                    EulerFold AI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setUseOpenRouter(true); setUseLocalAI(false); }}
                                    className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${useOpenRouter ? 'bg-sidebar text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                                >
                                    OpenRouter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setUseOpenRouter(false); setUseLocalAI(true); }}
                                    className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${useLocalAI ? 'bg-sidebar text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                                >
                                    Local AI
                                </button>
                            </div>

                            <div className="px-1 py-1 flex items-center justify-between">
                                <span className="text-[10px] text-text-muted/70 font-medium">
                                    {(!useOpenRouter && !useLocalAI) && <span className="text-amber-500/90 font-bold">Uses 0.1 credits per evaluation.</span>}
                                    {useOpenRouter && "Uses your API key."}
                                    {useLocalAI && "Runs locally in browser. Free & Private."}
                                </span>
                                
                                {useOpenRouter && (
                                    <button type="button" onClick={() => setIsOpenRouterModalOpen(true)} className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1">
                                        {openRouterKey ? 'Configure OpenRouter' : 'Set API Key'}
                                    </button>
                                )}
                                {useLocalAI && (
                                    <button type="button" onClick={() => setIsLocalAIModalOpen(true)} className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1">
                                        {localAIModelId ? 'Change Local Model' : 'Select Local Model'}
                                    </button>
                                )}
                            </div>
                        </div>



                        {error && (
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2.5 text-red-600 animate-in fade-in duration-300">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <p className="text-[11px] font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={submitting || (useLocalAI && !localAIModelId) || (useOpenRouter && !openRouterKey)}
                                className="w-full py-2.5 bg-teal-700 text-white rounded-lg text-[13px] font-bold tracking-wide hover:bg-teal-800 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div 
                                                    key={i} 
                                                    className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" 
                                                    style={{ animationDelay: `${i * 0.2}s` }} 
                                                />
                                            ))}
                                        </div>
                                        <span className="opacity-90">{evaluatingProgress || 'Analyzing...'}</span>
                                    </div>
                                ) : (useLocalAI && !localAIModelId) ? (
                                    <>Select Local Model</>
                                ) : (useOpenRouter && !openRouterKey) ? (
                                    <>Set OpenRouter Key</>
                                ) : (
                                    <>
                                        Send for Review
                                        <Send className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    )}
                </div>

                {/* Instructions Sidebar */}
                {instructions && showInstructions && (
                    <div className="w-full md:w-[280px] bg-background/20 p-6 flex flex-col animate-in slide-in-from-right-4 duration-300 border-t md:border-t-0 border-border/50">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Info className="w-3 h-3 text-accent" />
                                <h4 className="text-[9px] font-black text-text-heading uppercase tracking-widest">Requested Task</h4>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
                            {renderInstructions()}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-text-muted opacity-60">
                                <Sparkles className="w-3 h-3" />
                                <p className="text-[8px] font-black uppercase tracking-[0.2em]">AI Technical Auditor</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <OpenRouterModal 
                isOpen={isOpenRouterModalOpen} 
                onClose={() => {
                    setIsOpenRouterModalOpen(false);
                    setOpenRouterKey(localStorage.getItem('openRouterKey'));
                    setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
                }} 
            />

            <LocalAIModal 
                isOpen={isLocalAIModalOpen} 
                onClose={() => setIsLocalAIModalOpen(false)} 
                onSelectModel={(modelId, modelName) => {
                    localStorage.setItem('localAIModelId', modelId);
                    localStorage.setItem('localAIModelName', modelName);
                    setLocalAIModelId(modelId);
                    setLocalAIModelName(modelName);
                    setIsLocalAIModalOpen(false);
                }}
                onClearModel={() => {
                    localStorage.removeItem('localAIModelId');
                    localStorage.removeItem('localAIModelName');
                    setLocalAIModelId(null);
                    setLocalAIModelName(null);
                    setUseLocalAI(false);
                    setIsLocalAIModalOpen(false);
                }}
            />
        </div>
    );
}
