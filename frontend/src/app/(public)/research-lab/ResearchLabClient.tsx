"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader, BookOpen, History, AlertCircle, ChevronRight, FlaskConical, Beaker, ArrowRight, FileText, Sparkles, BrainCircuit, LogIn, Cpu, Cloud, Key } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { OpenRouterModal } from '@/components/landing/OpenRouterModal';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { logAIUsage } from '@/lib/usageTracker';

const TechnicalCube = () => (
    <div className="relative w-20 h-20 flex items-center justify-center" style={{ perspective: '800px' }}>
        <motion.div
            animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-10 h-10 relative"
        >
            {/* 6 faces of a technical wireframe cube */}
            {[0, 90, 180, 270].map((rot, i) => (
                <div
                    key={i}
                    className="absolute inset-0 border border-accent/40 bg-accent/5 grid grid-cols-2 grid-rows-2"
                    style={{ transform: `rotateY(${rot}deg) translateZ(20px)` }}
                >
                    <div className="border-[0.5px] border-accent/20" />
                    <div className="border-[0.5px] border-accent/20" />
                    <div className="border-[0.5px] border-accent/20" />
                    <div className="border-[0.5px] border-accent/20" />
                </div>
            ))}
            <div
                className="absolute inset-0 border border-accent/40 bg-accent/5 grid grid-cols-2 grid-rows-2"
                style={{ transform: `rotateX(90deg) translateZ(20px)` }}
            >
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
            </div>
            <div
                className="absolute inset-0 border border-accent/40 bg-accent/5 grid grid-cols-2 grid-rows-2"
                style={{ transform: `rotateX(-90deg) translateZ(20px)` }}
            >
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
                <div className="border-[0.5px] border-accent/20" />
            </div>
        </motion.div>
    </div>
);

export default function ResearchLabClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [paperUrl, setPaperUrl] = useState('');
    const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
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

    const [engineType, setEngineType] = useState<'cloud' | 'local' | 'openrouter'>('openrouter');
    
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
        "Analyzing...",
        "Extracting Math...",
        "Checking Logic...",
        "Reasoning...",
        "Simplifying..."
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

    const handleStartAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/login?message=auth_required_to_decode&next=/research-lab');
            return;
        }

        if (!paperUrl.trim() || isUrlValid === false) {
            setError("Please provide a valid ArXiv or PDF URL.");
            return;
        }

        if (user.roadmap_credits < 1) {
            setError("Insufficient credits. Analyzing a paper costs 1.0 credit.");
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

                const prompt = `You are a world-class Technical Consultant. Deconstruct the attached paper into an 'Engineering Dossier'.
        
        TASK:
        1. Identify the paper archetype: (Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering).
        2. Extract Metadata: (Clean Title, List of Authors, Publication Year).
        3. Create 5-6 high-utility technical modules based on that archetype.

        MODULE RULES:
        - ALWAYS include: 'The Shift', 'Logic', and 'Realities'.
        - 'The Shift' data schema: {"before": "...", "after": "...", "the_win": "..."}
        - 'Logic' data schema: {"details": "Step-by-step logic in Markdown"}
        - 'Realities' data schema: {"items": ["list of technical gotchas"]}
        - 'Concept' data schema: {"details": "Technical breakdown of the underlying architecture or core mechanism. Avoid oversimplification. Focus on structural insights."}
        - For others like 'Math', 'Blueprint', 'Benchmarks', 'Industry':
            - Use "details" for text.
            - Use "items" for lists.
            - Use "math" for formula maps: [{"formula": "LaTeX", "action": "...", "intuition": "..."}]

        STRICT STYLE: Plain English. Technical Precision. No fluff.
        CRITICAL MATH RULE: You MUST wrap ALL mathematical expressions, variables, and formulas in standard markdown math delimiters! Use single \`$\` for inline math (e.g. $x = y$) and double \`$$\` for block math. NEVER use bare LaTeX or \\( \\) or \\[ \\].

        OUTPUT JSON STRUCTURE:
        {
            "extracted_text": "...",
            "analysis": {
                "paper_title": "Clean Title",
                "authors": ["Author 1", "Author 2"],
                "year": "202X",
                "archetype": "The identified paper type",
                "modules": [
                    {
                        "id": "unique_id",
                        "label": "The Shift", 
                        "data": {"before": "...", "after": "...", "the_win": "..."}
                    }
                ],
                "summary": "Final technical synthesis"
            }
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
                        response_format: { type: "json_object" },
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
                
                if (!analysisData.extracted_text) {
                    analysisData.extracted_text = rawText.slice(0, 15000);
                }

                const saveRes = await api.post('/research-lab/save-external', {
                    paper_url: paperUrl,
                    analysis_data: analysisData.analysis ? analysisData : { analysis: analysisData, extracted_text: rawText.slice(0, 15000) }
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
            <TechnicalCube />

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
                    <TechnicalCube />
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
            {/* Hero Section */}
            <div className="relative pt-12 pb-16 overflow-hidden border-b border-border/30 bg-sidebar/10">
                <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
                    <div className="mt-4 max-w-3xl">
                        <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
                            Decode complex papers into <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Engineering Blueprints.</span>
                        </h1>
                        <p className="text-text-muted text-base md:text-lg manrope-body font-medium mb-10 leading-relaxed max-w-2xl">
                            Enter an ArXiv or PDF URL to extract the core mechanism, logic map, and architectural decisions. We bypass the dense mathematics to give you exactly what you need to build.
                        </p>
                        <button 
                            onClick={() => { document.getElementById('decode-form')?.scrollIntoView({ behavior: 'smooth' }) }}
                            className="px-6 py-3 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-lg font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.99] flex items-center gap-2"
                        >
                            Start Decoding <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <main id="decode-form" className="max-w-7xl mx-auto px-6 py-16 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 xl:col-span-6 min-w-0">
                        <div className="text-left mb-8 relative z-20">
                            <h2 className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-[0.3em] mb-3">Decode Paper</h2>
                            <p className="manrope-body text-[14px] text-text-muted leading-relaxed opacity-80">
                                Paste an ArXiv or PDF URL to generate a technical blueprint.
                            </p>
                        </div>

                        {/* Centered & Simple Main Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative mb-16 z-20"
                        >
                            {/* Pro Upgrade Overlay */}
                            {user && !user.is_pro && (
                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[3px] rounded-xl border border-border/50 text-center p-6">
                                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="font-inter text-[16px] font-semibold text-text-heading mb-2">Pro Exclusive Feature</h3>
                                    <p className="manrope-body font-medium text-[13px] text-text-muted max-w-sm mb-6 leading-relaxed">
                                        Research Lab completely deconstructs complex technical papers using our highest-capability AI pipeline.
                                    </p>
                                    <Link 
                                        href="/pricing"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] dark:bg-accent text-white rounded-lg font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-opacity"
                                    >
                                        Upgrade to Pro
                                    </Link>
                                </div>
                            )}

                            <div className="bg-header border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
                                <div className="p-5 md:p-6">
                                    <form onSubmit={handleStartAnalysis} className="space-y-5">
                                    <div className="space-y-2 text-left">
                                        <label className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <BrainCircuit className="w-3.5 h-3.5 text-accent" /> Paper URL (ArXiv or PDF)
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={paperUrl}
                                                onChange={handleUrlChange}
                                                placeholder="https://arxiv.org/abs/..."
                                                className={`w-full bg-background border ${isUrlValid === false ? 'border-red-500/50' : isUrlValid === true ? 'border-accent/50' : 'border-border'} px-4 py-4 pr-12 text-[14px] font-medium text-text-primary focus:outline-none focus:border-accent transition-all rounded-lg shadow-inner`}
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40">
                                                {isUrlValid === true ? (
                                                    <Sparkles className="w-4 h-4 text-accent" />
                                                ) : (
                                                    <Search className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                        {isUrlValid === false && (
                                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">
                                                Format: ArXiv link or direct PDF URL
                                            </p>
                                        )}
                                    </div>

                                    {/* Engine Selection */}
                                    <div className="space-y-3 pt-2">
                                        <label className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Cpu className="w-3.5 h-3.5 text-accent" /> Engine Selection
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                disabled={true}
                                                onClick={() => {}}
                                                className={`flex flex-col items-start p-3 rounded-lg border transition-all opacity-60 cursor-not-allowed border-red-500/20 bg-background`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Cloud className={`w-4 h-4 text-red-500`} />
                                                    <span className="text-[12px] font-bold text-red-500">EulerFold AI (Outage)</span>
                                                </div>
                                                <span className="text-[10px] text-red-400/70">Temporary Outage</span>
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
                                                className={`flex flex-col items-start p-3 rounded-lg border transition-all ${
                                                    engineType === 'openrouter' 
                                                        ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' 
                                                        : 'border-border/50 bg-background hover:border-border hover:bg-sidebar'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Key className={`w-4 h-4 ${engineType === 'openrouter' ? 'text-emerald-500' : 'text-text-muted'}`} />
                                                    <span className="text-[12px] font-bold text-text-heading">OpenRouter</span>
                                                </div>
                                                <span className="text-[10px] text-text-muted">Bring your own key</span>
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
                                                className={`flex flex-col items-start p-3 rounded-lg border transition-all ${
                                                    engineType === 'local' 
                                                        ? 'border-amber-500 bg-amber-500/5 shadow-sm' 
                                                        : 'border-border/50 bg-background hover:border-border hover:bg-sidebar'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Cpu className={`w-4 h-4 ${engineType === 'local' ? 'text-amber-500' : 'text-text-muted'}`} />
                                                    <span className="text-[12px] font-bold text-text-heading">Local AI</span>
                                                </div>
                                                <span className="text-[10px] text-text-muted">Private, local inference</span>
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/5 border-l-2 border-red-500 text-red-500 text-[12px] font-medium flex items-center gap-3">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <button 
                                        disabled={isProcessing || !paperUrl.trim() || isUrlValid === false}
                                        className="w-full py-4 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-lg font-bold text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl active:scale-[0.99]"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Analyzing Paper...
                                            </>
                                        ) : !user ? (
                                            <>
                                                <LogIn className="w-4 h-4" />
                                                Sign In to Analyze
                                            </>
                                        ) : (
                                            "Start Analysis"
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/40">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-accent/10 rounded text-accent inconsolata-ui text-[10px] font-black uppercase tracking-widest">
                                            {engineType === 'cloud' ? '1 Credit / Paper' : 'Free / Unlimited'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="text-right">
                                            <span className="block text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">Available Balance</span>
                                            {user ? (
                                                <span className="inconsolata-ui text-[13px] font-black text-text-primary">{user.roadmap_credits ?? 0} Credits</span>
                                            ) : (
                                                <Link href="/login?next=/research-lab" className="inconsolata-ui text-[11px] font-black text-accent uppercase tracking-widest hover:underline">
                                                    Sign in to view
                                                </Link>
                                            )}
                                        </div>
                                        <Link href="/pricing" className="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-all group">
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* History Section (Simplified) */}
                        <div className="space-y-8">
                            <h2 className="inconsolata-ui text-[13px] font-black text-text-heading uppercase tracking-[0.25em] flex items-center gap-3">
                                <History className="w-4 h-4 text-accent" /> Recent Analysis
                            </h2>

                            {loadingHistory ? (
                                <div className="flex py-12"><Loader className="w-6 h-6 animate-spin text-accent opacity-20" /></div>
                            ) : history.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {history.slice(0, 5).map((item) => (
                                        <Link 
                                            key={item.id} 
                                            href={`/research-lab/${item.id}`}
                                            className="group flex items-center justify-between py-4 border-b border-border/40 hover:border-accent transition-all text-left"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="font-inter text-[14px] font-semibold text-text-heading truncate group-hover:text-accent transition-colors pr-10">
                                                    {item.paper_title || item.paper_url}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                                                        {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="w-1 h-1 bg-border rounded-full" />
                                                    <span className={`text-[10px] uppercase font-black tracking-widest ${item.status === 'completed' ? 'text-accent' : 'text-text-muted'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                    {history.length > 5 && (
                                        <Link href="/research-lab/history" className="inline-block text-[11px] font-black text-accent uppercase tracking-[0.2em] pt-8 hover:underline">
                                            Browse Full Archive ({history.length})
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="py-16 text-center border border-dashed border-border rounded-xl bg-sidebar/10">
                                    <Beaker className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
                                    <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">
                                        {user ? "No active sessions found." : "Sign in to view your history."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Instructions & Info */}
                    <div className="lg:col-span-5 xl:col-span-6 relative z-10">
                        <div className="sticky top-24 space-y-10">
                            <div>

                                <h3 className="font-inter text-2xl lg:text-3xl font-semibold text-text-heading mb-4 tracking-tight">
                                    From PDF to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Engineering Dossier</span>
                                </h3>
                                <p className="manrope-body font-medium text-[14px] text-text-muted leading-relaxed max-w-md">
                                    Research Lab bypasses the fluff. We extract the core logic, structural architecture, and mathematical realities directly from academic papers so you can build faster.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    {
                                        icon: <FlaskConical className="w-5 h-5 text-teal-500" />,
                                        title: "The Shift & Logic",
                                        desc: "Instantly see what the paper solves (The Before vs After) and the step-by-step logic required to replicate it."
                                    },
                                    {
                                        icon: <BrainCircuit className="w-5 h-5 text-amber-500" />,
                                        title: "Architectural Concept",
                                        desc: "Deep-dive into the actual mechanism behind the paper without reading 40 pages of dense preamble."
                                    },
                                    {
                                        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
                                        title: "Engineering Realities",
                                        desc: "We extract the 'Gotchas'—the performance bottlenecks, hidden assumptions, and scaling issues mentioned in the paper."
                                    }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-xl border border-border/50 bg-sidebar/50 hover:bg-sidebar transition-colors">
                                        <div className="shrink-0 mt-0.5">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-inter text-[14px] font-semibold text-text-heading mb-1">{feature.title}</h4>
                                            <p className="manrope-body font-medium text-[13px] text-text-muted leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-6 border-t border-border/30">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-text-primary mb-1">Supported Formats</h4>
                                        <p className="manrope-body font-medium text-[12px] text-text-muted">Direct URLs to <code>arxiv.org/abs/...</code> or any publicly accessible <code>.pdf</code> link.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="border-t border-border/30">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumbs items={[{ label: 'Decode' }]} />
                </div>
            </div>

            <Footer />

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
