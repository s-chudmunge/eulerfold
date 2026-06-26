"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Briefcase, Link2, BookOpen, Target, FileSearch, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import EulerLogoCanvas from '../EulerLogoCanvas';

interface Product {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ElementType;
  logoProps: Record<string, any>;
  href: string;
  accentHex: string;
  mockup: { header: string; items: { label: string; done?: boolean }[]; cta: string };
}

const products: Product[] = [
  {
    id: 'architect', title: "AI Architect",
    description: "Build custom, technical roadmaps from any topic.",
    longDescription: "Enter any subject and get a complete curriculum with modules, theory, videos, and assessments. All references are verified with live web searches.",
    icon: Sparkles, logoProps: { color1: 0xb45309, color2: 0xfbbf24, wireframe: false },
    href: "/generate", accentHex: "#f59e0b",
    mockup: { header: "What do you want to learn?", items: [{ label: "Distributed Systems" }, { label: "Build fault-tolerant microservices" }], cta: "Generate Roadmap" }
  },
  {
    id: 'job', title: "Job Decoded",
    description: "Reverse engineer any job posting into a learning path.",
    longDescription: "Paste a job description from LinkedIn or Indeed. Our AI extracts every required skill and builds a targeted curriculum so you learn exactly what employers need.",
    icon: Briefcase, logoProps: { color1: 0x0f766e, color2: 0x2dd4bf, wireframe: false },
    href: "/generate?mode=job", accentHex: "#14b8a6",
    mockup: { header: "Paste job description", items: [{ label: "Senior Backend Engineer — Stripe" }, { label: "Extracting 12 required skills..." }], cta: "Decode Job" }
  },
  {
    id: 'url', title: "Deconstruct URL",
    description: "Turn any GitHub repo or docs link into a curriculum.",
    longDescription: "Paste a link to a GitHub repository, technical blog, or documentation page. The AI deconstructs the content and builds a roadmap leading to mastery of that topic.",
    icon: Link2, logoProps: { color1: 0x4f46e5, color2: 0x818cf8, wireframe: false },
    href: "/generate?mode=url", accentHex: "#6366f1",
    mockup: { header: "Enter a URL to deconstruct", items: [{ label: "github.com/tensorflow/tensorflow" }, { label: "Analyzing repository structure..." }], cta: "Build Path" }
  },
  {
    id: 'syllabus', title: "Syllabus Parser",
    description: "Convert any course syllabus into an interactive roadmap.",
    longDescription: "Got topics from a college class or textbook? Paste the syllabus and we transform it into an interactive EulerFold roadmap with videos, theory, and assessments.",
    icon: BookOpen, logoProps: { color1: 0xc2410c, color2: 0xf97316, wireframe: false },
    href: "/generate?mode=syllabus", accentHex: "#f97316",
    mockup: { header: "Paste your syllabus", items: [{ label: "Ch 1: Linear Algebra Foundations" }, { label: "Ch 2: Matrix Decompositions" }], cta: "Parse Syllabus" }
  },
  {
    id: 'gaps', title: "Skill Gap Analyzer",
    description: "Take a quiz, find your gaps, fix them with a roadmap.",
    longDescription: "Enter your target role and current skills, then take a 5-minute diagnostic quiz. Based on what you get wrong, we build a roadmap focused strictly on filling your knowledge gaps.",
    icon: Target, logoProps: { color1: 0xe11d48, color2: 0xfb7185, wireframe: false },
    href: "/generate?mode=gaps", accentHex: "#f43f5e",
    mockup: { header: "Diagnostic Quiz", items: [{ label: "What is the CAP theorem?", done: true }, { label: "Explain eventual consistency", done: true }, { label: "Describe Raft consensus", done: false }], cta: "Build Gap Roadmap" }
  },
  {
    id: 'decode', title: "Research Decoded",
    description: "Complex papers broken down into first-principles blueprints.",
    longDescription: "Submit any academic paper and get a technical breakdown. We convert dense research into understandable blueprints with math, diagrams, and practical applications.",
    icon: FileSearch, logoProps: { color1: 0x1e3a8a, color2: 0x3b82f6, emissive1: 0x1d4ed8, emissive2: 0x2563eb, emissiveIntensity: 0.6, wireframe: true },
    href: "/research-decoded", accentHex: "#3b82f6",
    mockup: { header: "Attention Is All You Need", items: [{ label: "Self-Attention Mechanism", done: true }, { label: "Multi-Head Attention", done: true }, { label: "Positional Encoding", done: false }], cta: "Read Breakdown" }
  },
  {
    id: 'planner', title: "Study Planner",
    description: "Dynamic daily schedules built from your roadmaps.",
    longDescription: "Create a daily study schedule from your roadmaps. Pick your intensity, set available hours, and get a structured plan with tasks to complete each day.",
    icon: Calendar, logoProps: { color1: 0x94a3b8, color2: 0x0f766e, emissive1: 0x475569, emissive2: 0x0d9488, emissiveIntensity: 0.4, wireframe: true },
    href: "/planner", accentHex: "#0f766e",
    mockup: { header: "Today's Plan", items: [{ label: "Review: Matrix Multiplication (30m)", done: true }, { label: "Watch: Eigenvalue Decomposition (45m)", done: false }, { label: "Practice: SVD Problems (20m)", done: false }], cta: "Open Planner" }
  },
  {
    id: 'practice', title: "Practice Portal",
    description: "Prove your knowledge with AI-powered assessments.",
    longDescription: "Test what you've learned with AI-generated practice problems, code challenges, and recall exercises. Submit your work and get immediate technical reviews.",
    icon: Zap, logoProps: { color1: 0x064e3b, color2: 0x10b981, wireframe: false },
    href: "/practice", accentHex: "#10b981",
    mockup: { header: "Practice: Neural Networks", items: [{ label: "Implement forward pass", done: true }, { label: "Backpropagation drill", done: true }, { label: "Loss function comparison", done: false }], cta: "Start Practice" }
  },
];

function ProductScreenUI({ product }: { product: Product }) {
  switch (product.id) {
    case 'architect':
      return (
        <div className="flex flex-col h-full p-6 justify-center max-w-sm mx-auto w-full">
          <p className="text-[14px] font-bold text-text-heading mb-4">Core Objective</p>
          <div className="w-full bg-sidebar/40 border border-border/60 rounded-md p-3 mb-4 shadow-inner">
             <div className="flex items-center gap-2 text-text-heading text-[13px] font-bold">
               <Zap className="w-3.5 h-3.5" style={{ color: product.accentHex }} />
               Distributed Systems
             </div>
          </div>
          <div className="w-full bg-sidebar/20 border border-border/40 rounded-md p-3 mb-8 h-12 shadow-inner">
             <div className="flex items-center gap-2 text-text-muted text-[12px] opacity-70">
               Specific End Goal (Optional)
             </div>
          </div>
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold text-white shadow-md" style={{ backgroundColor: product.accentHex }}>
              Generate Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      );
    case 'job':
      return (
        <div className="flex flex-col h-full p-6 justify-center max-w-md mx-auto w-full">
           <div className="w-full bg-sidebar/40 border border-border/60 rounded-md p-4 mb-4 relative overflow-hidden shadow-inner">
             <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: product.accentHex }}></div>
             <p className="text-[11px] text-text-muted font-mono leading-relaxed opacity-70 line-clamp-3">
               ...We are looking for a Senior Backend Engineer. You should have deep expertise in <span className="text-text-heading font-bold">Go</span>, <span className="text-text-heading font-bold">Kubernetes</span>, and building high-throughput <span className="text-text-heading font-bold">gRPC</span> microservices...
             </p>
           </div>
           <div className="flex items-center gap-2 mb-4">
             <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${product.accentHex}40`, borderTopColor: product.accentHex }}></div>
             <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Extracting Skills...</span>
           </div>
           <div className="flex gap-2 flex-wrap">
             {['Go', 'Kubernetes', 'gRPC', 'Distributed Systems'].map((skill, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="px-3 py-1.5 rounded-md bg-background border border-border text-[10px] font-bold text-text-heading shadow-sm">
                  {skill}
                </motion.div>
             ))}
           </div>
        </div>
      );
    case 'url':
      return (
        <div className="flex flex-col h-full p-6 justify-center max-w-md mx-auto w-full">
           <p className="text-[14px] font-bold text-text-heading mb-4 text-center">Deconstruct any public URL</p>
           <div className="flex items-center justify-between w-full bg-background border border-border/60 rounded-full p-1.5 pl-4 mb-6 shadow-sm">
             <div className="flex items-center gap-2 overflow-hidden">
               <Link2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
               <span className="text-[11px] font-mono text-text-heading truncate">github.com/tensorflow/tensorflow</span>
             </div>
             <div className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white shrink-0 shadow-sm" style={{ backgroundColor: product.accentHex }}>
               Deconstruct
             </div>
           </div>
           <div className="space-y-2 w-full max-w-xs mx-auto">
             <div className="flex justify-between text-[10px] font-bold text-text-muted">
               <span>Cloning repository...</span>
               <span style={{ color: product.accentHex }}>78%</span>
             </div>
             <div className="h-1.5 w-full bg-sidebar/50 rounded-full overflow-hidden border border-border/30">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: product.accentHex }} initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1, ease: 'easeOut' }} />
             </div>
           </div>
        </div>
      );
    case 'syllabus':
      return (
        <div className="flex h-full w-full">
           <div className="w-1/2 border-r border-border/30 p-5 flex flex-col gap-2.5">
             <div className="w-16 h-1.5 rounded-full bg-sidebar border border-border mb-2 shadow-inner"></div>
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-full h-1 rounded-full bg-sidebar/50 opacity-40" style={{ width: `${80 + Math.random() * 20}%` }}></div>
             ))}
             <div className="w-20 h-1.5 rounded-full bg-sidebar border border-border mt-3 mb-2 shadow-inner"></div>
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-full h-1 rounded-full bg-sidebar/50 opacity-40" style={{ width: `${70 + Math.random() * 20}%` }}></div>
             ))}
           </div>
           <div className="w-1/2 p-5 flex flex-col justify-center items-center relative bg-sidebar/10">
             <ArrowRight className="absolute left-[-12px] w-5 h-5 text-accent bg-background rounded-full p-0.5 border border-border shadow-md" style={{ color: product.accentHex }} />
             <div className="space-y-3 w-full pl-2">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded border border-border bg-background flex items-center justify-center text-[9px] font-bold shadow-sm">1</div>
                 <div className="flex-1 h-2 rounded bg-sidebar border border-border/40"></div>
               </div>
               <div className="w-px h-3 bg-border ml-2.5"></div>
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded border bg-background flex items-center justify-center text-[9px] font-bold shadow-sm" style={{ borderColor: product.accentHex, color: product.accentHex }}>2</div>
                 <div className="flex-1 h-2 rounded bg-sidebar border" style={{ borderColor: `${product.accentHex}40`, backgroundColor: `${product.accentHex}10` }}></div>
               </div>
               <div className="w-px h-3 bg-border ml-2.5"></div>
               <div className="flex items-center gap-2 opacity-50">
                 <div className="w-5 h-5 rounded border border-border bg-background flex items-center justify-center text-[9px] font-bold shadow-sm">3</div>
                 <div className="flex-1 h-2 rounded bg-sidebar border border-border/40"></div>
               </div>
             </div>
           </div>
        </div>
      );
    case 'gaps':
      return (
        <div className="flex flex-col h-full p-6 justify-center max-w-sm mx-auto w-full">
           <div className="flex justify-between items-center mb-4">
             <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: product.accentHex }}>Question 3 of 10</span>
             <span className="text-[10px] font-mono text-text-muted bg-sidebar px-2 py-0.5 rounded border border-border">04:21</span>
           </div>
           <p className="text-[13px] font-bold text-text-heading mb-6 leading-snug">What is the primary benefit of the Raft consensus algorithm over Paxos?</p>
           <div className="space-y-2">
             <div className="px-3 py-2.5 rounded-md border border-border/40 bg-sidebar/30 text-[10px] font-medium text-text-muted flex items-center gap-3">
               <div className="w-3 h-3 rounded-full border border-border/60"></div> Higher theoretical throughput
             </div>
             <div className="px-3 py-2.5 rounded-md border text-[10px] font-bold text-text-heading flex items-center gap-3 shadow-sm" style={{ borderColor: product.accentHex, backgroundColor: `${product.accentHex}10` }}>
               <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: product.accentHex }}>
                 <div className="w-1 h-1 bg-white rounded-full"></div>
               </div> 
               Understandability and leader election
             </div>
             <div className="px-3 py-2.5 rounded-md border border-border/40 bg-sidebar/30 text-[10px] font-medium text-text-muted flex items-center gap-3">
               <div className="w-3 h-3 rounded-full border border-border/60"></div> Decentralized leaderless writes
             </div>
           </div>
        </div>
      );
    case 'decode':
      return (
        <div className="flex h-full w-full">
           <div className="w-5/12 border-r border-border/30 bg-sidebar/20 p-4 flex flex-col justify-center gap-3">
             <div className="w-full aspect-[3/4] bg-background rounded shadow-md border border-border/50 p-3 flex flex-col gap-1.5 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-8 h-8 blur-xl" style={{ backgroundColor: product.accentHex, opacity: 0.2 }}></div>
               <div className="w-3/4 h-1.5 bg-text-heading/20 rounded"></div>
               <div className="w-1/2 h-1.5 bg-text-heading/20 rounded mb-2"></div>
               <div className="w-full h-1 bg-text-muted/20 rounded"></div>
               <div className="w-full h-1 bg-text-muted/20 rounded"></div>
               <div className="w-4/5 h-1 bg-text-muted/20 rounded"></div>
               <div className="w-full aspect-[2/1] bg-sidebar/50 rounded border border-border/40 mt-2"></div>
             </div>
           </div>
           <div className="w-7/12 p-5 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-4">
               <FileSearch className="w-3.5 h-3.5" style={{ color: product.accentHex }} />
               <span className="text-[11px] font-bold text-text-heading">Blueprint Breakdown</span>
             </div>
             <div className="space-y-3">
               <div className="p-2.5 rounded border shadow-sm bg-background" style={{ borderColor: `${product.accentHex}40` }}>
                 <span className="text-[10px] font-bold block mb-1.5" style={{ color: product.accentHex }}>1. The Core Innovation</span>
                 <div className="w-full h-1 bg-sidebar/80 rounded mb-1 border border-border/20"></div>
                 <div className="w-5/6 h-1 bg-sidebar/80 rounded border border-border/20"></div>
               </div>
               <div className="p-2.5 rounded border border-border/30 bg-sidebar/30 opacity-60">
                 <span className="text-[10px] font-bold block mb-1.5 text-text-muted">2. Mathematical Formulation</span>
                 <div className="w-full h-1 bg-sidebar/80 rounded mb-1 border border-border/20"></div>
               </div>
             </div>
           </div>
        </div>
      );
    case 'planner':
      return (
        <div className="flex flex-col h-full p-5 w-full">
           <div className="flex justify-between items-center mb-4">
             <span className="text-[12px] font-bold text-text-heading">Weekly Planner</span>
             <div className="flex gap-1">
               <div className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center text-[10px] text-text-muted shadow-sm">{"<"}</div>
               <div className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center text-[10px] text-text-heading shadow-sm">{">"}</div>
             </div>
           </div>
           <div className="grid grid-cols-3 gap-2 flex-1">
             {['Mon', 'Tue', 'Wed'].map((day, i) => (
               <div key={day} className="flex flex-col h-full">
                 <span className="text-[9px] font-bold text-text-muted uppercase mb-1.5 text-center">{day} 1{i+2}</span>
                 <div className={`flex-1 rounded-md border ${i === 1 ? 'bg-background shadow-sm' : 'bg-sidebar/20 border-dashed opacity-60'} border-border p-1.5 flex flex-col gap-1.5`} style={i === 1 ? { borderColor: `${product.accentHex}60` } : {}}>
                   {i === 1 && (
                     <>
                       <div className="p-1.5 rounded bg-sidebar border border-border/50 text-[8px] font-bold text-text-heading shadow-sm">
                         <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: product.accentHex }}></div>
                         Read: Paxos
                       </div>
                       <div className="p-1.5 rounded bg-background border border-border/30 text-[8px] font-medium text-text-muted">
                         Quiz: Consensus
                       </div>
                     </>
                   )}
                   {i === 0 && (
                     <div className="p-1.5 rounded border border-border/20 text-[8px] font-medium text-text-muted line-through opacity-50 flex items-center gap-1">
                       <CheckCircle2 className="w-2 h-2" /> Done
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>
        </div>
      );
    case 'practice':
      return (
        <div className="flex flex-col h-full w-full rounded-lg overflow-hidden border border-border/20 shadow-2xl">
           <div className="h-7 border-b border-[#2d2d2d] bg-[#1e1e1e] flex items-center px-3 gap-2">
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]"></div>
             </div>
             <span className="text-[9px] font-mono" style={{ color: product.accentHex }}>main.py</span>
           </div>
           <div className="flex-1 bg-[#141414] p-3 font-mono text-[10px] leading-relaxed relative">
             <div className="flex">
               <div className="text-[#555] select-none pr-3 text-right">
                 1<br/>2<br/>3<br/>4<br/>5
               </div>
               <div>
                 <span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">forward_pass</span>(x, w1, w2):<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#6a9955]"># implement hidden layer</span><br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;h = np.dot(x, w1)<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;h_relu = np.maximum(h, <span className="text-[#b5cea8]">0</span>)<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#569cd6]">return</span> np.dot(h_relu, w2)
               </div>
             </div>
             
             {/* Fake Terminal */}
             <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-[#2d2d2d] bg-[#1e1e1e] p-2 flex flex-col justify-center">
               <div className="flex items-center gap-2">
                 <span style={{ color: product.accentHex }}>✓</span>
                 <span className="text-white text-[9px]">Tests passed: 4/4</span>
               </div>
             </div>
           </div>
        </div>
      );
    default:
      return null;
  }
}

function LaptopMockup({ product }: { product: Product }) {
  return (
    <div className="relative w-[500px] xl:w-[600px]" style={{ perspective: '1200px' }}>
      {/* Laptop Screen Bezel */}
      <div className="bg-[#1a1a1a] rounded-t-2xl p-3 shadow-2xl border-x-2 border-t-2 border-[#333] relative z-10">
        {/* Inner Screen */}
        <div className="bg-background rounded-lg overflow-hidden aspect-[16/10] relative flex flex-col border border-border/20">
          
          {/* Browser Bar */}
          <div className="h-8 bg-sidebar/80 border-b border-border/40 flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 ml-4 mr-12 bg-background/50 border border-border/40 rounded h-5 flex items-center px-2">
              <span className="text-[9px] text-text-muted font-mono">eulerfold.com{product.href}</span>
            </div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col"
              >
                 {/* App Header (Inside Screen) */}
                 <div className="px-5 py-3 border-b border-border/40 flex items-center gap-3 bg-background">
                    <EulerLogoCanvas size={20} {...product.logoProps} />
                    <span className="text-[14px] font-bold text-text-heading tracking-tight">{product.title}</span>
                 </div>
                 
                 {/* Main Content Area */}
                 <div className="flex-1 bg-background relative z-0">
                    <ProductScreenUI product={product} />
                 </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
      {/* Laptop Base (Keyboard Deck) */}
      <div 
        className="relative bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-b-[2rem] border-t border-[#4a4a4a] shadow-[0_30px_50px_rgba(0,0,0,0.8)] origin-top flex flex-col items-center z-20"
        style={{ height: '140px', transform: 'rotateX(50deg)', marginTop: '-1px' }}
      >
        {/* Notch */}
        <div className="absolute top-0 w-24 h-1.5 bg-[#111] rounded-b-md shadow-inner"></div>
        
        {/* Keyboard Area */}
        <div className="w-[85%] h-[60%] mt-4 bg-[#141414] rounded-md border border-[#0a0a0a] flex flex-col gap-0.5 p-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.8)_inset]">
          {/* Main Key Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-0.5 flex-1">
              {[...Array(i === 0 ? 14 : i === 4 ? 12 : 13)].map((_, j) => (
                <div key={j} className="flex-1 bg-[#222] rounded-[2px] shadow-[0_1px_1px_rgba(255,255,255,0.05)_inset,0_2px_2px_rgba(0,0,0,0.5)]" />
              ))}
            </div>
          ))}
          {/* Spacebar Row */}
          <div className="flex gap-0.5 flex-1">
             <div className="flex-[2] bg-[#222] rounded-[2px] shadow-[0_1px_1px_rgba(255,255,255,0.05)_inset,0_2px_2px_rgba(0,0,0,0.5)]" />
             <div className="flex-[6] bg-[#222] rounded-[2px] shadow-[0_1px_1px_rgba(255,255,255,0.05)_inset,0_2px_2px_rgba(0,0,0,0.5)]" />
             <div className="flex-[2] bg-[#222] rounded-[2px] shadow-[0_1px_1px_rgba(255,255,255,0.05)_inset,0_2px_2px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Trackpad */}
        <div className="w-[25%] h-[20%] mt-2 bg-[#1f1f1f] rounded border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.5)_inset]"></div>
      </div>
    </div>
  );
}

export default function ProductEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Increase the multiplier slightly so we reach the end reliably
    const segmentCount = products.length;
    // adding a tiny offset to ensure we hit the last index at the very bottom
    let newIndex = Math.floor(latest * segmentCount); 
    if (newIndex >= segmentCount) newIndex = segmentCount - 1;
    if (newIndex < 0) newIndex = 0;
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  const activeProduct = products[activeIndex];

  return (
    // Make the container tall enough to allow for scrolling. 100vh per product.
    <section ref={containerRef} className="relative" style={{ height: `${products.length * 100}vh` }}>
      
      {/* Sticky wrapper that stays on screen while scrolling through the tall container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center border-y border-border/30">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-sidebar/20 -z-20" />
        <div 
          className="absolute inset-0 transition-colors duration-1000 -z-10 opacity-30"
          style={{ background: `radial-gradient(circle at 75% 50%, ${activeProduct.accentHex}40 0%, transparent 50%)` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay -z-10 pointer-events-none" />

        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-20 items-center">
            
            {/* Left Column: Text Content */}
            <div className="max-w-xl w-full">
              <p className="inconsolata-ui text-[12px] font-bold text-accent tracking-[0.2em] uppercase mb-6">
                Product Ecosystem
              </p>
              
              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-border/50 bg-background shadow-sm relative overflow-hidden">
                         <div className="absolute inset-0 opacity-10" style={{ backgroundColor: activeProduct.accentHex }} />
                         <EulerLogoCanvas size={36} {...activeProduct.logoProps} />
                      </div>
                      <h2 className="font-inter text-3xl md:text-5xl font-bold text-text-heading tracking-tight">
                        {activeProduct.title}
                      </h2>
                    </div>
                    
                    <p className="text-lg md:text-xl text-text-muted manrope-body font-medium leading-relaxed mb-8">
                      {activeProduct.longDescription}
                    </p>

                    <div>
                      <Link
                        href={activeProduct.href}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-bold text-white transition-all hover:scale-105 active:scale-[0.98] shadow-lg"
                        style={{ backgroundColor: activeProduct.accentHex, boxShadow: `0 10px 25px -5px ${activeProduct.accentHex}40` }}
                      >
                        Try {activeProduct.title}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Indicators */}
              <div className="flex items-center gap-2 mt-8">
                {products.map((p, idx) => (
                  <div 
                    key={p.id}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: activeIndex === idx ? '32px' : '8px',
                      backgroundColor: activeIndex === idx ? p.accentHex : 'var(--border)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Laptop Mockup */}
            <div className="flex justify-center lg:justify-end items-center w-full lg:w-auto transform scale-[0.65] sm:scale-[0.8] lg:scale-100 origin-top lg:origin-center mt-[-20px] sm:mt-0 lg:mt-0 perspective-1000">
               <LaptopMockup product={activeProduct} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
