"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader, BookOpen, History, AlertCircle, ChevronRight, FlaskConical, Beaker, ArrowRight, FileText, Sparkles, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import ResearchLibrarySidebar from '@/components/research-lab/ResearchLibrarySidebar';

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
            router.push('/login?next=/research-lab');
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
            const res = await api.post('/research-lab/decode', { paper_url: paperUrl });
            router.push(`/research-lab/${res.data.id}`);
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Failed to start analysis. Please check the URL and your credits.";
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
                        Analyzing Paper
                    </h2>
                    <p className="manrope-body text-[11px] font-medium text-text-muted">
                        We are analyzing the logic and math in this paper.
                    </p>
                </div>
                <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={statusIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="inconsolata-ui text-[10px] font-bold text-accent uppercase tracking-widest block"
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
            <div className="relative pt-12 pb-24 overflow-hidden border-b border-border/30">
                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center lg:text-left">
                    <Breadcrumbs items={[{ label: 'Research Lab' }]} />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mt-12"
                    >
                        <h1 className="inconsolata-ui text-base md:text-2xl font-black text-text-heading tracking-tight uppercase mb-6 leading-[0.95]">
                            Research <span className="text-accent">Lab</span>
                        </h1>
                        
                        <p className="manrope-body text-[14px] md:text-base text-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Convert academic papers into technical breakdowns. 
                            Understand the math and logic behind new research.
                        </p>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-16 flex-grow w-full">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Main Interaction Area (Left) */}
                    <div className="flex-1 min-w-0">
                        {/* Centered & Simple Main Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-header border border-border rounded-xl shadow-2xl overflow-hidden mb-16 -mt-32 relative z-20 backdrop-blur-sm"
                        >
                            <div className="p-6 md:p-8">
                                <form onSubmit={handleStartAnalysis} className="space-y-6">
                                    <div className="space-y-3 text-left">
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
                                        ) : (
                                            "Start Analysis"
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/40">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-accent/10 rounded text-accent inconsolata-ui text-[10px] font-black uppercase tracking-widest">
                                            1 Credit / Paper
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="text-right">
                                            <span className="block text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">Available Balance</span>
                                            <span className="inconsolata-ui text-[13px] font-black text-text-primary">{user?.roadmap_credits ?? 0} Credits</span>
                                        </div>
                                        <Link href="/pricing" className="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-all group">
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
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
                                                <h3 className="text-[14px] font-bold text-text-heading truncate group-hover:text-accent transition-colors pr-10">
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
                                    <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">No active sessions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
