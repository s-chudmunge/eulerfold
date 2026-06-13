"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Library, CheckCircle2, Target, Cpu, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import YouTubePlayer from '@/components/roadmap/YouTubePlayer';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';

const THEORY_MARKDOWN = `
The core innovation of the Transformer is the self-attention mechanism, which allows the model to weigh the importance of different words in a sequence regardless of their distance.

$$ \\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V $$

Where:
- **Q** (Query): Represents the current token being analyzed.
- **K** (Key): Represents all other tokens to compare against.
- **V** (Value): The actual feature representation.

Unlike traditional Recurrent Neural Networks (RNNs) which process tokens sequentially, self-attention processes the entire sequence simultaneously, making it highly parallelizable and efficient on modern GPU architectures.
`;

const demoTopics = [
    {
        title: "Self-Attention Mechanism",
        duration: "27 min",
        videoId: "eMlx5fFNoYc",
        theory: THEORY_MARKDOWN,
        description: "Deep dive into the core mechanics of how the self-attention algorithm calculates weights across context windows."
    },
    {
        title: "Multi-Head Attention",
        duration: "18 min",
        videoId: "kCc8FmEb1nY",
        theory: "Instead of performing a single attention function, multi-head attention linearly projects the queries, keys, and values multiple times with different, learned linear projections.\n\n$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O$$\n\nThis allows the model to jointly attend to information from different representation subspaces at different positions.",
        description: "Understand why multiple attention heads are used and how they project inputs into different representation subspaces."
    },
    {
        title: "Positional Encoding",
        duration: "14 min",
        videoId: "wjZofJX0v4M",
        theory: "Since transformers process sequences simultaneously rather than sequentially, they lack inherent knowledge of sequence order. Positional encodings are injected into the input embeddings to provide information about the relative or absolute position of tokens.\n\n$$PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d_{\\text{model}}})$$\n$$PE_{(pos, 2i+1)} = \\cos(pos / 10000^{2i/d_{\\text{model}}})$$",
        description: "Learn how the transformer injects sequential order into an architecture that has no inherent sense of sequence or time."
    }
];

const markdownComponents = {
    p: ({ children }: any) => <p className="mb-4 last:mb-0 leading-[1.8]">{children}</p>,
    strong: ({ children }: any) => <strong className="font-bold text-text-heading">{children}</strong>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
    li: ({ children }: any) => <li>{children}</li>,
};

export default function InteractiveDemo() {
    const [state, setState] = useState<'idle' | 'generating' | 'ready'>('idle');
    const [genStep, setGenStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'theory' | 'video' | 'practice'>('video');
    const [activeTopic, setActiveTopic] = useState(0);

    const steps = [
        "Analyzing topic: Transformer Architectures...",
        "Structuring learning path into 4 core modules...",
        "Searching ArXiv for foundational papers...",
        "Generating interactive recall exercises...",
        "Finalizing roadmap..."
    ];

    const handleTry = () => {
        setState('generating');
        
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < steps.length) {
                setGenStep(step);
            } else {
                clearInterval(interval);
                setState('ready');
            }
        }, 500);
    };

    return (
        <section className="py-20 md:py-32 px-4 md:px-6 relative z-20">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-inter text-2xl sm:text-3xl md:text-4xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight flex items-center justify-center gap-2 md:gap-3">
                        See <div className="scale-75 sm:scale-90 md:scale-100 flex items-center justify-center"><EulerLogoCanvas size={40} /></div> <span>Euler<span className="transition-colors duration-300 hover:text-accent cursor-default">Fold</span></span> in Action!
                    </h2>
                </div>

                <AnimatePresence mode="wait">
                    {state === 'idle' ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex justify-center"
                        >
                            <button 
                                onClick={handleTry}
                                className="inline-flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-600 text-white px-7 py-3 rounded-xl text-[14px] font-bold transition-all hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 gap-2 shadow-[0_0_30px_rgba(15,118,110,0.25)]"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Try Live
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full overflow-hidden h-[750px] flex items-center justify-center"
                        >
                            <AnimatePresence mode="wait">
                                {state === 'generating' && (
                            <motion.div 
                                key="generating"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-lg p-8 relative z-10"
                            >
                                <div className="flex flex-col gap-4">
                                    {steps.map((text, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: i <= genStep ? 1 : 0, x: i <= genStep ? 0 : -10 }}
                                            className="flex items-center gap-4 bg-background/80 backdrop-blur-md border border-border/50 p-5 rounded-2xl shadow-sm"
                                        >
                                            {i < genStep ? (
                                                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                                            ) : i === genStep ? (
                                                <div className="w-5 h-5 border-[2px] border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                                            ) : (
                                                <div className="w-5 h-5 border-[2px] border-border rounded-full shrink-0" />
                                            )}
                                            <span className="manrope-body text-[14px] font-medium text-text-primary">{text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {state === 'ready' && (
                            <motion.div 
                                key="ready"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full h-full flex flex-col bg-transparent"
                            >
                                {/* Header */}
                                <div className="h-16 flex items-center px-4 md:px-8 shrink-0 justify-between relative z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                                            <Cpu className="w-4 h-4 text-accent" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="inconsolata-ui text-[10px] font-black tracking-widest text-text-muted uppercase opacity-70">Unit 1 of 4</span>
                                            <span className="font-inter text-[15px] font-semibold text-text-heading leading-tight mt-0.5">{demoTopics[activeTopic].title}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setState('idle')} className="text-[12px] font-bold text-text-muted hover:text-accent transition-colors">Reset Demo</button>
                                </div>

                                <div className="flex flex-1 overflow-hidden">
                                    {/* Sidebar */}
                                    <div className="w-[300px] hidden md:flex flex-col p-5 relative z-10">
                                        <div className="mb-5">
                                            <h2 className="font-inter text-[14px] font-semibold text-text-heading">Module 1: The Core Mechanism</h2>
                                        </div>
                                        <div className="space-y-1.5">
                                            {demoTopics.map((topic, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => setActiveTopic(idx)}
                                                    className={`w-full flex items-start text-left px-3.5 py-3.5 rounded-xl text-[13px] transition-all group ${activeTopic === idx ? 'bg-accent/10 text-accent font-semibold shadow-sm border border-accent/10' : 'hover:bg-callout-bg text-text-primary opacity-70 hover:opacity-100'}`}
                                                >
                                                    <PlayCircle className={`h-5 w-5 mr-3 shrink-0 ${activeTopic === idx ? '' : 'opacity-60'}`} />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="line-clamp-2 leading-snug">{topic.title}</span>
                                                        <span className="text-[11px] mt-1 opacity-80 font-medium">Video • {topic.duration}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 flex flex-col relative overflow-hidden">
                                        <div className="h-14 flex items-center px-6 gap-8 shrink-0 overflow-x-auto no-scrollbar">
                                            <button onClick={() => setActiveTab('video')} className={`text-[13px] font-semibold h-full border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'video' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                                                Video <span className="bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-md ml-1 border border-accent/20">{demoTopics[activeTopic].duration.replace(' min', 'm')}</span>
                                            </button>
                                            <button onClick={() => setActiveTab('theory')} className={`text-[13px] font-semibold h-full border-b-2 transition-colors ${activeTab === 'theory' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                                                Theory
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 no-scrollbar">
                                            <AnimatePresence mode="wait">
                                                {activeTab === 'video' && (
                                                    <motion.div key="video" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full h-full flex flex-col">
                                                        <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/80">
                                                            <div className="aspect-video w-full bg-black">
                                                                <YouTubePlayer videoId={demoTopics[activeTopic].videoId} title={demoTopics[activeTopic].title} />
                                                            </div>
                                                        </div>
                                                        <div className="mt-8 max-w-4xl">
                                                            <h3 className="font-inter text-xl font-semibold text-text-heading mb-2">{demoTopics[activeTopic].title}</h3>
                                                            <p className="manrope-body text-text-muted text-[15px]">{demoTopics[activeTopic].description}</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {activeTab === 'theory' && (
                                                    <motion.div key="theory" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-3xl">
                                                        <h1 className="font-inter text-3xl font-semibold text-text-heading mb-8">{demoTopics[activeTopic].title}</h1>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none manrope-body text-[16px]
                                                            [&_.katex-display]:block [&_.katex-display]:border [&_.katex-display]:border-teal-500/40 [&_.katex-display]:bg-teal-500/10 [&_.katex-display]:rounded-xl [&_.katex-display]:px-5 [&_.katex-display]:py-6 [&_.katex-display]:my-8 [&_.katex-display]:shadow-sm
                                                        ">
                                                            <ReactMarkdown components={markdownComponents as any} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{demoTopics[activeTopic].theory}</ReactMarkdown>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
