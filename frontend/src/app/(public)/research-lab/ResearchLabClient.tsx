"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, BookOpen, History, AlertCircle, ChevronRight, FlaskConical, Beaker, ArrowRight, ArrowLeft, Sparkles, BrainCircuit, LogIn, Cpu, Cloud, Key, RotateCcw, Trash2, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import { OpenRouterModal } from '@/components/landing/OpenRouterModal';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { logAIUsage } from '@/lib/usageTracker';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';

export default function ResearchLabClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<'idle' | 'url' | 'engine'>('idle');
    const [paperUrl, setPaperUrl] = useState('');
    const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const urlInputRef = useRef<HTMLInputElement>(null);
    
    // Simple validation for ArXiv or PDF URLs
    const validateUrl = (url: string) => {
        if (!url) return null;
        const arxivRegex = /arxiv\.org\/(abs|pdf)\/\d+\.\d+/i;
        const pdfRegex = /\.pdf$/i;
        const generalUrlRegex = /^https?:\/\/.+/i;
        return (arxivRegex.test(url) || pdfRegex.test(url)) && generalUrlRegex.test(url);
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPaperUrl(val);
        setIsUrlValid(validateUrl(val));
    };
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [statusIndex, setStatusIndex] = useState(0);

    const [engineType, setEngineType] = useState<'cloud' | 'local' | 'openrouter'>('cloud');
    
    // OpenRouter State
    const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);
    const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
    const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
    const [useOpenRouter, setUseOpenRouter] = useState(false);

    // Local AI State
    const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);
    const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
    const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
    const [useLocalAI, setUseLocalAI] = useState(false);

    const statusMessages = [
        "Reading the paper... 📄",
        "Extracting the math... 🧮",
        "Checking the logic... 🔬",
        "Reasoning through it... 🧠",
        "Simplifying for humans... 🫠"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statusMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    useEffect(() => {
        if (step === 'url' && urlInputRef.current) {
            urlInputRef.current.focus();
        }
    }, [step]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/research-lab/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch lab history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} analyses?`)) return;
        
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/research-lab/decodes/${id}`)));
            setHistory(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            setIsEditMode(false);
        } catch (err) {
            console.error("Failed to delete analyses:", err);
            alert("Failed to delete some analyses. Please try again.");
        }
    };

    const handleProceedToEngine = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!paperUrl.trim() || isUrlValid === false) {
            setError("Please provide a valid ArXiv link or PDF URL.");
            return;
        }
        setError(null);
        setStep('engine');
    };

    const handleSampleUrl = (url: string) => {
        setPaperUrl(url);
        setIsUrlValid(true);
        setError(null);
    };

    const handleStartAnalysis = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) {
            router.push('/login?message=auth_required_to_decode&next=/research-lab');
            return;
        }

        if (!paperUrl.trim() || isUrlValid === false) {
            setError("Please provide a valid ArXiv or PDF URL.");
            setStep('url');
            return;
        }

        if (engineType === 'cloud' && (user.roadmap_credits ?? 0) < 1) {
            setError("Insufficient credits. Analyzing a paper with EulerFold AI costs 1.0 credit.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            if (engineType === 'cloud') {
                const res = await api.post('/research-lab/decode', { paper_url: paperUrl });

                router.push(`/research-lab/${res.data.id}`);
            } else {
                if (engineType === 'local' && !localAIModelId) {
                    setIsLocalAIModalOpen(true);
                    setIsProcessing(false);
                    return;
                }
                if (engineType === 'openrouter' && !openRouterKey) {
                    setIsOpenRouterModalOpen(true);
                    setIsProcessing(false);
                    return;
                }

                // 1. Extract
                const extRes = await api.post('/research-lab/extract', { paper_url: paperUrl });
                const rawText = extRes.data.text;

                const prompt = `Deconstruct this paper into a structured Engineering Dossier.

TASK:
1. Identify paper archetype: Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering.
2. Extract metadata: title, authors, year.
3. Create 5-6 technical modules.

REQUIRED MODULES (always include these 3):
- "The Shift": {"before": "old approach", "after": "new approach", "the_win": "core advantage"}
- "Logic": {"details": "step-by-step technical logic in Markdown. Use $...$ for inline math and $$...$$ for block math."}
- "Realities": {"items": ["gotcha 1", "gotcha 2", ...]}

OPTIONAL MODULES (pick 2-3 based on archetype):
- "Concept": {"details": "core architecture/mechanism breakdown in Markdown"}
- "Math": {"math": [{"formula": "$LaTeX$", "action": "what it computes", "intuition": "why it matters"}]}
- "Blueprint": {"details": "system design / implementation details in Markdown"}
- "Benchmarks": {"items": ["result 1", "result 2", ...]}

MATH RULE: Always use $...$ for inline math and $$...$$ for block math. Never use bare LaTeX.
STYLE: Plain English. Technical precision. No fluff. No filler.

Return ONLY this JSON structure:
{
    "paper_title": "Clean Title",
    "authors": ["Author 1", "Author 2"],
    "year": "202X",
    "archetype": "identified type",
    "modules": [
        {"id": "shift", "label": "The Shift", "data": {"before": "...", "after": "...", "the_win": "..."}},
        {"id": "logic", "label": "Logic", "data": {"details": "..."}},
        {"id": "realities", "label": "Realities", "data": {"items": ["..."]}}
    ],
    "summary": "2-3 sentence technical synthesis"
}`;

                let jsonStr = "";
                let aiModel = "";
                let usage = { p: 0, c: 0, t: 0 };

                if (engineType === 'local') {
                    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
                    const engine = await CreateMLCEngine(localAIModelId!, { 
                        initProgressCallback: (p) => console.log(p) 
                    });
                    const msg = await engine.chat.completions.create({
                        messages: [{role: "user", content: prompt + "\n\nTEXT:\n" + rawText}],
                        max_tokens: 8000
                    });
                    jsonStr = msg.choices[0].message.content || "{}";
                    aiModel = localAIModelName || "local";
                    usage = { p: msg.usage?.prompt_tokens || 0, c: msg.usage?.completion_tokens || 0, t: msg.usage?.total_tokens || 0 };
                } else {
                    console.log(`[OpenRouter] Sending request to model: ${openRouterModel}`);
                    console.log(`[OpenRouter] Payload text length: ${rawText.length} characters`);
                    
                    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${openRouterKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: openRouterModel,
                            messages: [{role: "user", content: prompt + "\n\nTEXT:\n" + rawText}],
                            response_format: { type: "json_object" },
                            max_tokens: 8000
                        })
                    });
                    
                    if (!orRes.ok) {
                        const errText = await orRes.text();
                        console.error(`[OpenRouter] HTTP Error ${orRes.status}:`, errText);
                        throw new Error(`OpenRouter returned status ${orRes.status}: ${errText.slice(0, 100)}`);
                    }
                    
                    const data = await orRes.json();
                    if (data.error) {
                        console.error("[OpenRouter] API Error Response:", data.error);
                        throw new Error(data.error.message || "OpenRouter Error");
                    }
                    
                    jsonStr = data.choices[0].message.content;
                    console.log("[OpenRouter] Received response successfully. Length:", jsonStr.length);
                    
                    aiModel = openRouterModel || "openrouter";
                    usage = { p: data.usage?.prompt_tokens || 0, c: data.usage?.completion_tokens || 0, t: data.usage?.total_tokens || 0 };
                }

                // Log usage immediately so even if JSON parsing fails (e.g. max_tokens cutoff), 
                // the tokens consumed are still recorded in the user's dashboard.
                if (usage.t > 0) {
                    await logAIUsage({
                        subject: "Research Lab Analysis",
                        model: aiModel,
                        prompt_tokens: usage.p,
                        completion_tokens: usage.c,
                        total_tokens: usage.t,
                        source: 'client'
                    }).catch(console.error);
                }

                let analysisData;
                try {
                    analysisData = JSON.parse(jsonStr);
                } catch (parseErr) {
                    console.error("[JSON Parse Error] Raw Model Output was:", jsonStr);
                    throw new Error("The AI model failed to output valid JSON. Try a different model or lower the paper complexity.");
                }
                
                // Handle both flat and wrapped formats
                const coreAnalysis = analysisData.modules ? analysisData : (analysisData.analysis || analysisData);

                const saveRes = await api.post('/research-lab/save-external', {
                    paper_url: paperUrl,
                    analysis_data: { analysis: coreAnalysis, extracted_text: rawText.slice(0, 15000) }
                });
                router.push(`/research-lab/${saveRes.data.id}`);
            }
        } catch (err: any) {
            console.error("Analysis failed:", err);
            
            let msg = err.response?.data?.detail || err.message || "Failed to start analysis. Please check the URL and your credits.";
            
            // Format OpenRouter specific errors for the UI while keeping raw logs in console
            if (msg.includes("OpenRouter returned status 429") || msg.includes("rate limit")) {
                msg = "This model is currently overloaded on OpenRouter (Rate Limited). Please wait a moment or select a different model.";
            } else if (msg.includes("OpenRouter returned status 400") || msg.includes("context length")) {
                msg = "OpenRouter rejected the request. The paper might be too long for this specific model's context window. Try a model with a larger context size.";
            } else if (msg.includes("OpenRouter returned status 401")) {
                msg = "Your OpenRouter API key is invalid. Please update it in the settings.";
            } else if (msg.includes("OpenRouter returned status 402")) {
                msg = "Your OpenRouter account has insufficient credits.";
            } else if (msg === "Provider returned error") {
                msg = "The upstream AI provider failed to process the request. This usually happens with free models. Try selecting a different model.";
            }
            
            setError(msg);
            setIsProcessing(false);
        }
    };

    if (authLoading && !user) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <EulerLogoCanvas size={80} color1={0x1e3a8a} color2={0x3b82f6} emissive1={0x1d4ed8} emissive2={0x2563eb} emissiveIntensity={0.6} wireframe={true} className="mx-auto mb-8 block" />

            <div className="text-center space-y-4">
                <div>
                    <h2 className="inconsolata-ui text-[16px] font-black uppercase tracking-[0.4em] text-text-heading mb-1">
                        Loading Lab
                    </h2>
                    <p className="manrope-body text-[11px] font-medium text-text-muted">
                        Authenticating your session...
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            {isProcessing && (
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-10 animate-in fade-in duration-500">
                    <EulerLogoCanvas size={80} color1={0x1e3a8a} color2={0x3b82f6} emissive1={0x1d4ed8} emissive2={0x2563eb} emissiveIntensity={0.6} wireframe={true} className="mx-auto mb-8 block" />
                    <div className="text-center space-y-4">
                        <div>
                            <h2 className="inconsolata-ui text-[18px] md:text-[22px] font-black uppercase tracking-[0.4em] text-text-heading mb-2">
                                Analyzing Paper
                            </h2>
                            <p className="manrope-body text-[12px] md:text-[14px] font-medium text-text-muted px-6">
                                We are analyzing the logic and math in this paper.
                            </p>
                        </div>
                        <div className="h-8 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={statusIndex}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-[0.3em] block"
                                >
                                    {statusMessages[statusIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-center gap-1.5 mt-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Integrated Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sidebar/20 via-transparent to-transparent pointer-events-none" />
                
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    {/* Header */}
                    <div className="flex justify-center mb-5">
                        <EulerLogoCanvas size={56} color1={0x1e3a8a} color2={0x3b82f6} emissive1={0x1d4ed8} emissive2={0x2563eb} emissiveIntensity={0.6} wireframe={true} />
                    </div>

                    <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading leading-[1.15] md:leading-[1.1] tracking-tight mb-3">
                        Turn Research Papers into <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Code</span>
                    </h1>

                    <p className="text-text-muted text-sm sm:text-base manrope-body font-medium leading-relaxed max-w-xl mx-auto mb-8">
                        Extract technical methodology, system architecture, and implementation logic directly from ArXiv or PDF papers.
                    </p>

                    {/* Integrated Interactive Step-by-Step Flow */}
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence mode="wait">
                            {/* STATE 0: Idle CTA Button */}
                            {step === 'idle' ? (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setStep('url');
                                            setError(null);
                                        }}
                                        className="px-8 py-3.5 bg-[#111] dark:bg-accent text-white rounded-lg font-bold text-[12px] uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-2.5 active:scale-[0.99]"
                                    >
                                        Start Decoding <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <p className="text-[11px] text-text-muted font-medium">
                                        Supports arXiv links and direct PDF URLs
                                    </p>
                                </motion.div>
                            ) : (
                                /* Active Step Box (Step 1: URL, Step 2: Engine) */
                                <motion.div
                                    key="active-step-box"
                                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-left bg-header border border-border rounded-lg shadow-xl overflow-hidden backdrop-blur-sm relative"
                                >
                                    {/* Pro Upgrade Overlay */}
                                    {user && !user.is_pro && (
                                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/85 backdrop-blur-[3px] rounded-lg border border-border/50 text-center p-6">
                                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                                                <Sparkles className="w-5 h-5 text-accent" />
                                            </div>
                                            <h3 className="font-inter text-[15px] font-semibold text-text-heading mb-1">Pro Feature</h3>
                                            <p className="manrope-body font-medium text-[12px] text-text-muted max-w-sm mb-4 leading-relaxed">
                                                Research Lab deconstructs complex technical papers using specialized extraction models.
                                            </p>
                                            <Link 
                                                href="/pricing"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-bold text-[11px] uppercase tracking-[0.15em] shadow-md hover:opacity-90 transition-opacity"
                                            >
                                                Upgrade to Pro
                                            </Link>
                                        </div>
                                    )}

                                    {/* Step Flow Indicators */}
                                    <div className="px-5 py-3 bg-sidebar/50 border-b border-border/40 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setStep('url')}
                                                className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                    step === 'url' ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                                                }`}
                                            >
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                                    step === 'url' ? 'bg-accent text-white' : 'bg-border text-text-muted'
                                                }`}>1</span>
                                                Paper Link
                                            </button>
                                            <ChevronRight className="w-3 h-3 text-text-muted opacity-40" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (paperUrl.trim() && isUrlValid !== false) {
                                                        setStep('engine');
                                                    }
                                                }}
                                                className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                    step === 'engine' ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                                                }`}
                                            >
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                                    step === 'engine' ? 'bg-accent text-white' : 'bg-border text-text-muted'
                                                }`}>2</span>
                                                Engine & Run
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('idle');
                                                setError(null);
                                            }}
                                            className="text-[10px] text-text-muted hover:text-text-primary font-medium flex items-center gap-1 uppercase tracking-wider"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>

                                    {/* Card Content Area */}
                                    <div className="p-5 md:p-6">
                                        <AnimatePresence mode="wait">

                                    {/* STATE 1: Paper URL Step */}
                                    {step === 'url' && (
                                        <motion.div
                                            key="url-step"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-5"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <BrainCircuit className="w-3.5 h-3.5 text-accent" /> Paper Link (ArXiv or PDF)
                                                    </label>
                                                </div>
                                                
                                                <div className="relative">
                                                    <input 
                                                        ref={urlInputRef}
                                                        type="text" 
                                                        value={paperUrl}
                                                        onChange={handleUrlChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleProceedToEngine();
                                                            }
                                                        }}
                                                        placeholder="https://arxiv.org/abs/1706.03762"
                                                        className={`w-full bg-background border ${
                                                            isUrlValid === false ? 'border-red-500/60' : isUrlValid === true ? 'border-accent' : 'border-border'
                                                        } px-4 py-3.5 pr-10 text-[14px] font-medium text-text-primary focus:outline-none focus:border-accent transition-all rounded-lg shadow-inner`}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                                                        {isUrlValid === true ? (
                                                            <Sparkles className="w-4 h-4 text-accent" />
                                                        ) : (
                                                            <Search className="w-4 h-4 opacity-40" />
                                                        )}
                                                    </div>
                                                </div>

                                                {isUrlValid === false && (
                                                    <p className="text-[11px] text-red-500 font-medium ml-1">
                                                        Please enter a valid link from arxiv.org (abs/pdf) or a direct .pdf file.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Sample papers quick picks */}
                                            <div className="space-y-2 pt-1">
                                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block">
                                                    Or try an example:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSampleUrl('https://arxiv.org/abs/1706.03762')}
                                                        className="px-2.5 py-1 text-[11px] bg-sidebar hover:bg-background border border-border/60 hover:border-accent rounded-md text-text-muted hover:text-text-primary transition-colors"
                                                    >
                                                        Attention Is All You Need
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSampleUrl('https://arxiv.org/abs/2005.14165')}
                                                        className="px-2.5 py-1 text-[11px] bg-sidebar hover:bg-background border border-border/60 hover:border-accent rounded-md text-text-muted hover:text-text-primary transition-colors"
                                                    >
                                                        GPT-3 Paper
                                                    </button>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-[12px] font-medium flex items-center gap-2 rounded-r-md">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('idle')}
                                                    className="px-4 py-2.5 bg-sidebar hover:bg-background border border-border text-text-primary rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleProceedToEngine()}
                                                    disabled={!paperUrl.trim() || isUrlValid === false}
                                                    className="px-6 py-2.5 bg-[#111] dark:bg-accent text-white rounded-lg font-bold text-[11px] uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-[0.99]"
                                                >
                                                    Next: Select Engine <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STATE 2: Engine Selection & Launch */}
                                    {step === 'engine' && (
                                        <motion.div
                                            key="engine-step"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-5"
                                        >
                                            {/* Selected Paper Summary Pill */}
                                            <div className="p-3 bg-sidebar/50 border border-border/50 rounded-lg flex items-center justify-between">
                                                <div className="min-w-0 pr-3">
                                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider block">Paper Link</span>
                                                    <p className="text-[12px] font-medium text-text-primary truncate">{paperUrl}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('url')}
                                                    className="text-[10px] text-accent font-bold uppercase tracking-wider hover:underline shrink-0"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Engine Selection Options */}
                                            <div className="space-y-2">
                                                <label className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Cpu className="w-3.5 h-3.5 text-accent" /> Choose AI Engine
                                                </label>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEngineType('cloud')}
                                                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                                                            engineType === 'cloud' 
                                                                ? 'border-accent bg-accent/5 shadow-sm' 
                                                                : 'border-border/60 bg-background hover:border-border hover:bg-sidebar'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Cloud className={`w-4 h-4 ${engineType === 'cloud' ? 'text-accent' : 'text-text-muted'}`} />
                                                            <span className={`text-[12px] font-bold ${engineType === 'cloud' ? 'text-accent' : 'text-text-heading'}`}>EulerFold AI</span>
                                                        </div>
                                                        <span className="text-[10px] text-text-muted">1 Credit / Paper</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (engineType === 'openrouter') {
                                                                setIsOpenRouterModalOpen(true);
                                                            } else {
                                                                setEngineType('openrouter');
                                                                if (!useOpenRouter) setIsOpenRouterModalOpen(true);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                                                            engineType === 'openrouter' 
                                                                ? 'border-teal-500 bg-teal-500/5 shadow-sm' 
                                                                : 'border-border/60 bg-background hover:border-border hover:bg-sidebar'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Key className={`w-4 h-4 ${engineType === 'openrouter' ? 'text-teal-500' : 'text-text-muted'}`} />
                                                            <span className="text-[12px] font-bold text-text-heading">OpenRouter</span>
                                                        </div>
                                                        <span className="text-[10px] text-text-muted">Custom API key</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (engineType === 'local') {
                                                                setIsLocalAIModalOpen(true);
                                                            } else {
                                                                setEngineType('local');
                                                                if (!useLocalAI) setIsLocalAIModalOpen(true);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                                                            engineType === 'local' 
                                                                ? 'border-amber-500 bg-amber-500/5 shadow-sm' 
                                                                : 'border-border/60 bg-background hover:border-border hover:bg-sidebar'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Cpu className={`w-4 h-4 ${engineType === 'local' ? 'text-amber-500' : 'text-text-muted'}`} />
                                                            <span className="text-[12px] font-bold text-text-heading">Local AI</span>
                                                        </div>
                                                        <span className="text-[10px] text-text-muted">Browser inference</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Balance / Fee Summary */}
                                            <div className="flex items-center justify-between px-3 py-2 bg-sidebar/30 rounded-md border border-border/30 text-[11px]">
                                                <span className="text-text-muted font-medium">
                                                    {engineType === 'cloud' ? 'Cost: 1 Credit' : 'Cost: Free (Direct API / Local)'}
                                                </span>
                                                <span className="text-text-primary font-bold">
                                                    Balance: {user ? `${user.roadmap_credits ?? 0} Credits` : 'Sign in required'}
                                                </span>
                                            </div>

                                            {error && (
                                                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-[12px] font-medium flex items-center gap-2 rounded-r-md">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('url')}
                                                    className="px-4 py-2.5 bg-sidebar hover:bg-background border border-border text-text-primary rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={handleStartAnalysis}
                                                    disabled={isProcessing}
                                                    className="px-6 py-2.5 bg-[#111] dark:bg-accent text-white rounded-lg font-bold text-[11px] uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-[0.99]"
                                                >
                                                    {!user ? (
                                                        <>
                                                            <LogIn className="w-4 h-4" />
                                                            Sign In to Decode
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BrainCircuit className="w-4 h-4" />
                                                            Start Analysis
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </section>

            {/* Below Hero: Recent Analyses (if history exists) */}
            <main className="max-w-3xl mx-auto px-6 py-10 flex-grow w-full">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="inconsolata-ui text-[12px] font-black text-text-heading uppercase tracking-[0.25em] flex items-center gap-2.5">
                            <History className="w-4 h-4 text-accent" /> Recent Analyses
                        </h2>
                        {history.length > 0 && (
                            <div className="flex items-center gap-3">
                                {isEditMode ? (
                                    <>
                                        <button 
                                            onClick={() => setIsEditMode(false)}
                                            className="text-[11px] font-bold text-text-muted uppercase tracking-wider hover:text-text-heading transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleDeleteSelected}
                                            disabled={selectedIds.length === 0}
                                            className="text-[11px] font-bold text-red-500 uppercase tracking-wider hover:bg-red-500/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                        >
                                            Delete ({selectedIds.length})
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { setIsEditMode(true); setSelectedIds([]); }}
                                        className="text-[11px] font-bold text-text-muted uppercase tracking-wider hover:text-text-heading transition-colors"
                                    >
                                        Select
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {loadingHistory ? (
                        <div className="flex py-8 items-center justify-center">
                            <Loader className="w-5 h-5 animate-spin text-accent opacity-30" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="flex flex-col divide-y divide-border/40 border border-border/50 rounded-lg bg-header overflow-hidden shadow-sm">
                            {(isEditMode ? history : history.slice(0, 5)).map((item) => {
                                const ItemWrapper = isEditMode ? 'div' : Link;
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                <ItemWrapper 
                                    key={item.id} 
                                    {...(isEditMode ? { onClick: () => toggleSelection(item.id) } : { href: `/research-lab/${item.id}` }) as any}
                                    className={`group flex items-center justify-between p-3.5 hover:bg-sidebar/50 transition-all text-left ${isEditMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-sidebar/50' : ''}`}
                                >
                                    <div className="min-w-0 pr-4 flex items-center gap-3">
                                        {isEditMode && (
                                            <div className="text-text-muted shrink-0 transition-colors">
                                                {isSelected ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4" />}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-inter text-[13px] font-semibold text-text-heading truncate group-hover:text-accent transition-colors">
                                                {item.paper_title || item.paper_url}
                                            </h3>
                                            <div className="flex items-center gap-2.5 mt-1">
                                                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                                                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="w-1 h-1 bg-border rounded-full" />
                                                <span className={`text-[10px] uppercase font-black tracking-wider ${item.status === 'completed' ? 'text-accent' : 'text-text-muted'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!isEditMode && (
                                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                                    )}
                                </ItemWrapper>
                            )})}
                            {!isEditMode && history.length > 5 && (
                                <div className="text-center py-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">
                                    + {history.length - 5} more analyses
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center border border-dashed border-border/70 rounded-lg bg-sidebar/20">
                            <Beaker className="w-6 h-6 text-text-muted/30 mx-auto mb-1.5" />
                            <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">
                                {user ? "No past sessions found." : "Sign in to view your history."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <div className="border-t border-border/30">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <Breadcrumbs items={[{ label: 'Research Lab' }]} />
                </div>
            </div>

            <OpenRouterModal 
                isOpen={isOpenRouterModalOpen}
                onClose={() => setIsOpenRouterModalOpen(false)}
                onSave={(key, model) => {
                    setOpenRouterKey(key);
                    setOpenRouterModel(model);
                    setUseOpenRouter(true);
                    setEngineType('openrouter');
                }}
                onRemove={() => {
                    setOpenRouterKey(null);
                    setOpenRouterModel(null);
                    setUseOpenRouter(false);
                    setEngineType('cloud');
                }}
            />

            <LocalAIModal 
                isOpen={isLocalAIModalOpen}
                onClose={() => setIsLocalAIModalOpen(false)}
                onSelectModel={(modelId, modelName) => {
                    setLocalAIModelId(modelId);
                    setLocalAIModelName(modelName);
                    setUseLocalAI(true);
                    setEngineType('local');
                }}
            />
        </div>
    );
}
