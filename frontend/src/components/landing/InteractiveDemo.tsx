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
        "Structuring course into 4 core modules...",
        "Searching ArXiv for foundational papers...",
        "Generating interactive recall exercises...",
        "Finalizing course..."
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
                    <h2 className="retro-title text-[16px] sm:text-[20px] md:text-[28px] mb-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 leading-relaxed">
                        <span>See</span>
                        <div className="scale-75 sm:scale-90 flex items-center justify-center retro-blink"><EulerLogoCanvas size={36} /></div> 
                        <span>Euler<span className="text-text-primary">Fold</span></span> 
                        <span>in Action!</span>
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
                                className="retro-arcade-btn inline-flex items-center justify-center px-5 py-3 text-[11px] md:text-[12px] font-bold gap-2"
                            >
                                <PlayCircle className="w-4 h-4 retro-blink" />
                                <span className="retro-blink">Try Live</span>
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
                                className="w-full max-w-lg p-8 relative z-10 retro-scanlines"
                            >
                                <div className="flex flex-col gap-4 relative z-20">
                                    {steps.map((text, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: i <= genStep ? 1 : 0, x: i <= genStep ? 0 : -10 }}
                                            className="flex items-center gap-4 bg-background/90 backdrop-blur-md border-[2px] border-accent/30 p-5 rounded-none shadow-[4px_4px_0px_rgba(15,118,110,0.2)]"
                                        >
                                            {i < genStep ? (
                                                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                                            ) : i === genStep ? (
                                                <div className="w-5 h-5 border-[2px] border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                                            ) : (
                                                <div className="w-5 h-5 border-[2px] border-border rounded-full shrink-0" />
                                            )}
                                            <span className="retro-arcade-text text-[10px] sm:text-[11px] md:text-[12px] leading-relaxed">{text}</span>
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
                                className="w-full h-full flex flex-col bg-transparent relative z-20"
                            >
                                {/* Header */}
                                <div className="h-16 flex items-center px-4 md:px-8 shrink-0 justify-between relative z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                                            <EulerLogoCanvas size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="retro-arcade-text text-[8px] md:text-[10px] text-accent/80 mb-1">Unit 1 of 4</span>
                                            <span className="retro-arcade-text text-[10px] md:text-[12px]">{demoTopics[activeTopic].title}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setState('idle')} className="text-[12px] font-bold text-text-muted hover:text-accent transition-colors">Reset Demo</button>
                                </div>

                                <div className="flex flex-1 overflow-hidden relative z-20">
                                    {/* Sidebar */}
                                    <div className="w-[300px] hidden md:flex flex-col p-5 relative z-10">
                                        <div className="mb-6">
                                            <h2 className="retro-arcade-text text-[10px] md:text-[11px] text-accent">Module 1: The Core Mechanism</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {demoTopics.map((topic, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => setActiveTopic(idx)}
                                                    className={`w-full flex items-start text-left px-3.5 py-3.5 rounded-lg transition-all group ${activeTopic === idx ? 'bg-accent/10 shadow-sm border border-accent/10' : 'hover:bg-callout-bg border border-transparent'}`}
                                                >
                                                    <PlayCircle className={`h-5 w-5 mr-3 shrink-0 ${activeTopic === idx ? 'text-accent' : 'text-text-muted opacity-60'}`} />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`retro-arcade-text text-[9px] leading-relaxed ${activeTopic === idx ? 'text-accent' : 'text-text-primary/70'}`}>{topic.title}</span>
                                                        <span className="retro-arcade-text text-[8px] mt-2 opacity-60">Video • {topic.duration}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
                                        <div className="h-14 flex items-center px-6 gap-6 shrink-0 overflow-x-auto no-scrollbar border-b border-border/40">
                                            <button onClick={() => setActiveTab('video')} className={`retro-arcade-text text-[10px] h-full border-b-[2px] flex items-center gap-2 transition-colors ${activeTab === 'video' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                                                Video <span className="bg-accent/10 border border-accent/20 text-[8px] px-2 py-1 rounded-md ml-1">{demoTopics[activeTopic].duration.replace(' min', 'm')}</span>
                                            </button>
                                            <button onClick={() => setActiveTab('theory')} className={`retro-arcade-text text-[10px] h-full border-b-[2px] transition-colors ${activeTab === 'theory' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                                                Theory
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 no-scrollbar">
                                            <AnimatePresence mode="wait">
                                                {activeTab === 'video' && (
                                                    <motion.div key="video" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full h-full flex flex-col">
                                                        <div className="w-full max-w-4xl rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/80">
                                                            <div className="aspect-video w-full bg-black">
                                                                <YouTubePlayer videoId={demoTopics[activeTopic].videoId} title={demoTopics[activeTopic].title} />
                                                            </div>
                                                        </div>
                                                        <div className="mt-8 max-w-4xl">
                                                            <h3 className="retro-arcade-text text-[12px] md:text-[14px] text-accent mb-4">{demoTopics[activeTopic].title}</h3>
                                                            <p className="retro-arcade-text text-[9px] md:text-[10px] text-text-muted leading-[2] tracking-wide">{demoTopics[activeTopic].description}</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {activeTab === 'theory' && (
                                                    <motion.div key="theory" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-3xl">
                                                        <h1 className="retro-arcade-text text-[14px] md:text-[18px] text-accent mb-8">{demoTopics[activeTopic].title}</h1>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none manrope-body text-[16px]
                                                            [&_.katex-display]:block [&_.katex-display]:border [&_.katex-display]:border-teal-500/40 [&_.katex-display]:bg-teal-500/10 [&_.katex-display]:rounded-lg [&_.katex-display]:px-5 [&_.katex-display]:py-6 [&_.katex-display]:my-8 [&_.katex-display]:shadow-sm
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
