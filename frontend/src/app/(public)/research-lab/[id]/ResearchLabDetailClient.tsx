"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Loader, AlertCircle, ArrowLeft, ArrowRight, ExternalLink, Calculator, Cpu, Send, User, Bot, Target, Zap, Layers, AlertTriangle, FileText, X, MessageSquare, ChevronRight, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { visit } from 'unist-util-visit';
import 'katex/dist/katex.min.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchToolbox from '@/components/research-lab/ResearchToolbox';
import ResearchHelpBot from '@/components/research-lab/ResearchHelpBot';

import EulerLogoCanvas from '@/components/EulerLogoCanvas';


const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy}
            className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
};

const rehypeMathBox = () => (tree: any) => {
    visit(tree, 'element', (node: any, index: number, parent: any) => {
        const classes = node.properties?.className || [];
        const isInline = classes.includes('math-inline');
        const isBlock = classes.includes('math-display');
        
        if (isInline || isBlock) {
            const textNode = node.children?.[0];
            if (textNode?.type === 'text' && textNode.value.includes('=')) {
                const wrapper = {
                    type: 'element',
                    tagName: isBlock ? 'div' : 'span',
                    properties: { 
                        className: [
                            'boxed-equation', 
                            isInline 
                                ? 'border border-teal-500/40 bg-teal-500/10 rounded-md px-1.5 py-0.5 mx-0.5 shadow-sm inline-block' 
                                : 'border border-teal-500/40 bg-teal-500/10 rounded-lg px-5 py-4 my-8 shadow-sm block w-full overflow-x-auto'
                        ].join(' ')
                    },
                    children: [node]
                };
                if (parent && typeof index === 'number') {
                    parent.children[index] = wrapper;
                }
                return 'skip'; // Don't infinite loop inside the wrapper we just added
            }
        }
    });
};

const markdownComponents = {
    pre: ({ children }: any) => <>{children}</>,
    code: ({node, inline, className, children, ...props}: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isBlock = !inline && match;
        const language = match ? match[1] : 'text';
        
        // If it's a code block but missing a language identifier, or it is a code block
        if (!inline) {
            return (
                <div className="my-8 rounded-lg overflow-hidden border border-border/40 shadow-xl bg-[#1E1E1E] relative group">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#2D2D2D] border-b border-black/30">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <CopyButton text={String(children).replace(/\n$/, '')} />
                    </div>
                    <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1.25rem', fontSize: '13px', lineHeight: '1.6', background: 'transparent' }}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        }

        return (
            <code className={className || "px-1.5 py-0.5 mx-0.5 rounded bg-blue-600/10 border border-blue-600/20 text-blue-500 font-mono text-[0.85em]"} {...props}>
                {children}
            </code>
        );
    }
};

interface Message { role: 'user' | 'assistant'; content: string; }

export default function ResearchLabDetailClient({ id }: { id: string }) {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeStage, setActiveStage] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);
    const [isPro, setIsPro] = useState(false);
    
    const statusMessages = ["Analyzing...", "Extracting Math...", "Checking Logic...", "Reasoning...", "Simplifying..."];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statusMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile to check pro status
                const profileRes = await api.get('/profile/me');
                setIsPro(profileRes.data.is_pro || false);

                const res = await api.get(`/research-lab/decodes/${id}`);
                setData(res.data);
                if (res.data.status === 'processing' || res.data.status === 'pending') {
                    setTimeout(fetchData, 5000);
                }
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load report.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
            <EulerLogoCanvas size={80} color1={0x1e3a8a} color2={0x3b82f6} emissive1={0x1d4ed8} emissive2={0x2563eb} emissiveIntensity={0.6} wireframe={true} className="mx-auto mb-8 block" />
            <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={statusIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.5 }}
                        className="inconsolata-ui text-[10px] font-black uppercase tracking-[0.4em] text-text-muted"
                    >
                        {statusMessages[statusIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
                {[0, 1, 2].map(i => (
                    <div key={i} className="w-1 h-1 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col items-center justify-center py-24 px-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h2 className="text-lg font-bold text-text-heading mb-6">{error}</h2>
                <Link href="/research-lab" className="text-accent font-bold hover:underline">Back to Lab</Link>
            </main>
        </div>
    );

    if (data?.status === 'processing' || data?.status === 'pending') {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow flex items-center justify-center py-24 px-6 text-center">
                    <div className="max-w-sm w-full">
                        <EulerLogoCanvas size={80} color1={0x1e3a8a} color2={0x3b82f6} emissive1={0x1d4ed8} emissive2={0x2563eb} emissiveIntensity={0.6} wireframe={true} className="mx-auto mb-8 block" />
                        <h2 className="inconsolata-ui text-[18px] font-black text-text-heading uppercase tracking-[0.4em] mb-4">Analyzing Paper</h2>
                        <div className="space-y-4 mb-10">
                            <p className="text-text-muted text-[13px] leading-relaxed manrope-body">We are analyzing the logic and math in this paper.</p>
                            <div className="h-6 flex items-center justify-center mt-6">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={statusIndex}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.5 }}
                                        className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-[0.3em] block"
                                    >
                                        {statusMessages[statusIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <div className="flex justify-center gap-1.5 mt-2">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                        <Link href="/research-lab" className="px-10 py-3 bg-text-heading text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-none shadow-xl hover:opacity-90 transition-all">Dashboard</Link>
                    </div>
                </main>
            </div>
        );
    }

    const analysis = data.core_analysis;
    const modules = analysis?.modules || [];

    const renderModuleContent = (module: any) => {
        const { data: rawData } = module;
        let moduleData = { ...rawData };
        const technicalKeys = ['Logic', 'Concept', 'Realities', 'Math', 'The Shift', 'Industry', 'Benchmarks', 'Blueprint'];
        technicalKeys.forEach(key => {
            if (rawData[key] && typeof rawData[key] === 'object' && !Array.isArray(rawData[key])) {
                moduleData = { ...moduleData, ...rawData[key] };
            }
        });

        const hasMath = Array.isArray(moduleData.math) && moduleData.math.length > 0;
        const hasShift = moduleData.before || moduleData.after;
        const hasRealities = Array.isArray(moduleData.items) && (module.label.toLowerCase().includes('realities') || rawData.Realities);
        const hasList = Array.isArray(moduleData.items) && !hasRealities;

        return (
            <div className="space-y-16 text-left">
                {hasShift && (
                    <div className="bg-teal-600/5 border border-teal-600/20 p-8 rounded-lg relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                            <Layers className="w-20 h-24 text-teal-600" />
                         </div>
                         <div className="flex flex-col md:flex-row gap-12 relative z-10">
                            <div className="flex-1">
                                <h3 className="inconsolata-ui text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 opacity-50">Traditional Approach</h3>
                                <p className="text-[14px] leading-relaxed text-text-primary">{moduleData.before || "Standard methodology."}</p>
                            </div>
                            <div className="flex-1">
                                <h3 className="inconsolata-ui text-[9px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4 opacity-70">The Shift</h3>
                                <p className="text-[15px] leading-relaxed text-text-primary font-bold">{moduleData.after || "New technical direction."}</p>
                            </div>
                        </div>
                        {moduleData.the_win && (
                            <div className="mt-8 pt-8 border-t border-teal-600/10 text-center">
                                <span className="inconsolata-ui text-[8px] font-black text-text-muted uppercase tracking-widest block mb-2 opacity-50">Core Technical Advantage</span>
                                <p className="text-xl font-black text-teal-600 italic leading-tight">"{moduleData.the_win}"</p>
                            </div>
                        )}
                    </div>
                )}

                {(moduleData.details || moduleData.summary) && (
                    <div className="max-w-3xl">
                        {moduleData.summary && <p className="text-xl font-bold text-text-heading leading-relaxed mb-10 border-l-4 border-accent pl-8 italic">{moduleData.summary}</p>}
                        
                        {moduleData.details && (
                            <div className="relative">
                                {/* Convert LaTeX \( \) to $ $ for remark-math */}
                                {(() => {
                                    let cleanDetails = moduleData.details;
                                    // Strip wrapping ```markdown ... ``` blocks if the AI accidentally wrapped the whole response
                                    if (cleanDetails.startsWith('```')) {
                                        cleanDetails = cleanDetails.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '');
                                    }
                                    cleanDetails = cleanDetails.replace(/\\+\(/g, '$').replace(/\\+\)/g, '$').replace(/\\+\[/g, '$$$$').replace(/\\+\]/g, '$$$$');
                                    
                                    const isListFormat = /^\s*(?:\d+\.|-)\s+/m.test(cleanDetails) && (module.label === 'Logic' || cleanDetails.split('\n').filter(line => /^\s*(?:\d+\.|-)\s+/.test(line)).length > 2);
                                    
                                    return isListFormat ? (
                                        <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed
                                                [&>p]:mb-8 last:[&>p]:mb-0
                                                [&_.math-display]:my-10 [&_.math-display]:overflow-x-auto [&_.math-display]:py-2
                                                [&>ol]:list-none [&>ol]:pl-0 [&>ol>li]:relative [&>ol>li]:pl-10 [&>ol>li]:pb-20 last:[&>ol>li]:pb-0
                                                [&>ol>li]:before:absolute [&>ol>li]:before:left-0 [&>ol>li]:before:top-1 [&>ol>li]:before:w-6 [&>ol>li]:before:h-6 [&>ol>li]:before:bg-background [&>ol>li]:before:border [&>ol>li]:before:border-border [&>ol>li]:before:rounded-full [&>ol>li]:before:flex [&>ol>li]:before:items-center [&>ol>li]:before:justify-center [&>ol>li]:before:text-[10px] [&>ol>li]:before:font-black [&>ol>li]:before:text-accent [&>ol>li]:before:content-[counter(list-item)] [&>ol>li]:before:z-10
                                                [&>ol>li_p]:mb-6 last:[&>ol>li_p]:mb-0
                                                [&>ol>li_strong]:block [&>ol>li_strong]:text-[16px] [&>ol>li_strong]:text-text-heading [&>ol>li_strong]:mb-3 [&>ol>li_strong]:mt-1
                                                [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:relative [&>ul>li]:pl-10 [&>ul>li]:pb-12 last:[&>ul>li]:pb-0
                                                [&>ul>li]:before:absolute [&>ul>li]:before:left-[7px] [&>ul>li]:before:top-[9px] [&>ul>li]:before:w-2 [&>ul>li]:before:h-2 [&>ul>li]:before:bg-accent [&>ul>li]:before:rounded-full [&>ul>li]:before:z-10
                                                [&>ul>li_p]:mb-6 last:[&>ul>li_p]:mb-0
                                            ">
                                                <ReactMarkdown components={markdownComponents as any} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeMathBox, rehypeKatex]}>{cleanDetails}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-[16px] leading-[1.8]
                                            [&>p]:mb-8 last:[&>p]:mb-0
                                            [&_.katex-display]:block [&_.katex-display]:my-10 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-2
                                            [&>strong]:text-text-heading
                                        ">
                                            <ReactMarkdown components={markdownComponents as any} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeMathBox, rehypeKatex]}>{cleanDetails}</ReactMarkdown>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {hasMath && (
                    <div className="space-y-12">
                        <div className="flex items-center gap-4">
                            <h3 className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-50">Mathematical Proofs</h3>
                            <div className="h-[1px] flex-grow bg-border/20" />
                        </div>
                        <div className="space-y-16">
                            {moduleData.math.map((item: any, i: number) => (
                                <div key={i} className="group">
                                    <div className="flex flex-col md:flex-row gap-10 items-start">
                                        <div className="md:w-1/2 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="inconsolata-ui text-[10px] font-black text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded">EQUATION 0{i+1}</span>
                                                <div className="h-[1px] w-8 bg-blue-600/30" />
                                            </div>
                                            <h4 className="text-[17px] font-black text-text-heading leading-tight group-hover:text-blue-600 transition-colors">{item.action}</h4>
                                            <div className="text-[14px] text-text-secondary leading-relaxed italic border-l-2 border-border/40 pl-5">
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {item.intuition?.replace(/\\+\(/g, '$').replace(/\\+\)/g, '$').replace(/\\+\[/g, '$$$$').replace(/\\+\]/g, '$$$$')}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="md:w-1/2 w-full">
                                            <div className="p-8 bg-sidebar/20 border border-border group-hover:border-blue-600/30 transition-all rounded-lg shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-text-muted uppercase tracking-widest opacity-20 group-hover:opacity-40">Formal Derivation</div>
                                                <div className="text-blue-600 text-[18px]">
                                                    <ReactMarkdown components={markdownComponents as any} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeMathBox, rehypeKatex]}>
                                                        {`$$ ${item.formula} $$`}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Realities Section */}
                {hasRealities && (
                    <div className="space-y-8 pt-10 border-t-2 border-border/10">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-blue-600/60" />
                            <h3 className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Engineering Realities</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {moduleData.items.map((g: string, i: number) => (
                                <div key={i} className="flex gap-4 items-start p-6 bg-sidebar/10 border border-border/40 hover:border-blue-600/30 transition-all rounded-lg">
                                    <span className="inconsolata-ui text-blue-600/40 font-black text-xs">0{i+1}</span>
                                    <div className="text-[14px] leading-relaxed text-text-primary font-medium prose-p:m-0">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {g.replace(/\\+\(/g, '$').replace(/\\+\)/g, '$').replace(/\\+\[/g, '$$$$').replace(/\\+\]/g, '$$$$')}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Generic List Items (Benchmarks, Industry, etc) */}
                {hasList && (
                    <div className="space-y-6">
                        <h3 className="inconsolata-ui text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-50">Field Observations</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {moduleData.items.map((item: string, i: number) => (
                                <div key={i} className="flex gap-5 items-start p-5 bg-sidebar/10 border border-border/40 rounded-lg">
                                    <Target className="w-4 h-4 text-accent/60 mt-1 shrink-0" />
                                    <div className="text-[14px] leading-relaxed text-text-primary prose-p:m-0">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {item.replace(/\\+\(/g, '$').replace(/\\+\)/g, '$').replace(/\\+\[/g, '$$$$').replace(/\\+\]/g, '$$$$')}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!hasMath && !hasShift && !hasRealities && !hasList && !moduleData.details && !moduleData.summary && (
                    <div className="py-24 text-center border border-dashed border-border/40 rounded-lg bg-sidebar/5">
                         <div className="animate-pulse flex flex-col items-center">
                            <Loader className="w-6 h-6 text-accent mb-4 animate-spin" />
                            <p className="text-[13px] text-text-muted font-bold uppercase tracking-widest">Hydrating Technical Layers...</p>
                         </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen serif-page-scope relative pb-24 lg:pb-0">
            {/* Floating Left Toolbox (Desktop) */}
            <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
                <ResearchToolbox 
                    paperUrl={data?.paper_url} 
                    title={analysis?.paper_title || data?.paper_title || "Technical Report"} 
                    authors={analysis?.authors}
                    year={analysis?.year}
                />
            </div>

            {/* Fixed Bottom Toolbox (Mobile) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
                <ResearchToolbox 
                    paperUrl={data?.paper_url} 
                    title={analysis?.paper_title || data?.paper_title || "Technical Report"} 
                    authors={analysis?.authors}
                    year={analysis?.year}
                    className="justify-center"
                />
            </div>

            <main className="max-w-6xl mx-auto px-6 py-10 text-left flex-grow w-full relative">
                <div className="flex items-center justify-between mb-6">
                    <Breadcrumbs items={[
                        { label: 'Decode', href: '/research-lab' }, 
                        { label: analysis?.paper_title || 'Technical Report' }
                    ]} />
                    <Link href="/research-lab" className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-accent transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back
                    </Link>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded text-[9px] font-black text-accent uppercase tracking-widest max-w-xs md:max-w-md truncate">
                            {analysis?.archetype ? analysis.archetype.split('(')[0].trim() : "Technical Analysis"}
                        </div>
                        {analysis?.year && (
                            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold opacity-60">{analysis.year}</span>
                        )}
                        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold opacity-40">Report #{id.slice(0,8)}</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-text-heading tracking-tight leading-[1.1] mb-4 max-w-4xl">
                        {analysis?.paper_title || data?.paper_title || "Technical Report"}
                    </h1>

                    {analysis?.authors && Array.isArray(analysis.authors) && (
                        <div className="flex flex-wrap gap-2 mb-6 max-w-4xl">
                            {analysis.authors.slice(0, 5).map((author: string, idx: number) => (
                                <span key={idx} className="text-[11px] font-medium text-text-secondary italic">
                                    {author}{idx < Math.min(analysis.authors.length, 5) - 1 ? ',' : ''}
                                </span>
                            ))}
                            {analysis.authors.length > 5 && (
                                <span className="text-[11px] font-medium text-text-muted">+{analysis.authors.length - 5} more</span>
                            )}
                        </div>
                    )}

                    <a href={data?.paper_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar/50 border border-border/60 rounded-md text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all shadow-sm w-fit mt-2">
                        <FileText className="w-3.5 h-3.5" /> Read Original Paper <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
                    {/* Vertical Navigation Sidebar */}
                    <div className="w-full md:w-56 lg:w-64 shrink-0 md:sticky md:top-[80px]">
                        <div className="flex items-center justify-between mb-6">
                            <span className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Dossier Sections</span>
                        </div>
                        
                        <div className="flex md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar gap-2 md:gap-1 border-b md:border-b-0 border-border/20 pb-4 md:pb-0">
                            {modules.map((module: any, idx: number) => {
                                const isActive = activeStage === idx;
                                const label = module.label.toLowerCase();

                                // Semantic Color Logic
                                let activeColors = 'bg-accent/10 border-accent/30 text-accent';
                                if (label.includes('shift')) activeColors = 'bg-teal-600/10 border-teal-600/30 text-teal-600';
                                if (label.includes('math')) activeColors = 'bg-blue-600/10 border-blue-600/30 text-blue-600';
                                if (label.includes('realities')) activeColors = 'bg-slate-600/10 border-slate-600/30 text-slate-300';

                                return (
                                    <button 
                                        key={module.id} 
                                        onClick={() => setActiveStage(idx)}
                                        className={`flex items-center justify-between px-4 py-3 transition-all duration-300 rounded-lg border whitespace-nowrap ${
                                            isActive 
                                                ? `${activeColors} shadow-sm` 
                                                : 'bg-transparent border-transparent text-text-muted hover:bg-sidebar/50 hover:text-text-heading'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`inconsolata-ui text-[9px] font-black ${isActive ? 'opacity-100' : 'opacity-40'}`}>0{idx + 1}</span>
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{module.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-3 h-3 md:block hidden" />}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="hidden md:flex items-center gap-2 mt-8 pt-6 border-t border-border/10">
                            <button 
                                onClick={() => setActiveStage(prev => Math.max(0, prev - 1))}
                                disabled={activeStage === 0}
                                className={`p-2 border border-border rounded-full transition-all ${activeStage === 0 ? 'opacity-20 cursor-not-allowed' : 'text-text-muted hover:border-accent hover:text-accent hover:bg-sidebar'}`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setActiveStage(prev => Math.min(modules.length - 1, prev + 1))}
                                disabled={activeStage === modules.length - 1}
                                className={`flex items-center justify-center flex-1 gap-1 py-2 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeStage === modules.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-accent/90 shadow-sm'}`}
                            >
                                Next <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Content Area */}
                    <div className="flex-1 min-w-0 min-h-[400px] relative mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="serif-content"
                        >
                            {/* Summary Card - Only show on first tab */}
                            {activeStage === 0 && analysis?.summary && (
                                <div className="bg-sidebar/30 border border-border/40 p-8 rounded-lg relative overflow-hidden group mb-12">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                                        <Zap className="w-24 h-24 text-accent" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="inconsolata-ui text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-4">Summary</h2>
                                        <p className="text-lg font-medium text-text-heading leading-relaxed italic pr-12">
                                            "{analysis.summary}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {modules.length > 0 ? renderModuleContent(modules[activeStage]) : (
                                <p className="text-center py-20 text-text-muted italic">Report content structure pending.</p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                </div>
{/* Pagination Status - Minimalist */}
<div className="mt-16 pt-4 border-t border-border/10 flex flex-col items-center gap-6">
    <p className="text-[10px] text-text-muted opacity-40 max-w-lg text-center leading-relaxed">
        This technical report is generated by AI and should be used for rapid conceptual mapping only.
        Always verify critical derivations and engineering decisions by referencing the original paper.
    </p>
</div>
</main>

            {/* FLOATING HELP BOT */}
            <ResearchHelpBot decodeId={id} isPro={isPro} />
        </div>
    );
}
