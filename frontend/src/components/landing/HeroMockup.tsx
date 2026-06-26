"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, BookOpen, PlayCircle, ArrowRight, Sparkles, Loader2, Wifi, Battery, Signal } from 'lucide-react';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';

type Phase = 'input' | 'generating' | 'result';

const GEN_STEPS = [
  "Analyzing topic structure...",
  "Identifying core concepts...",
  "Sourcing research papers...",
  "Building learning modules...",
  "Finalizing roadmap...",
];

const MODULES = [
  { title: "Self-Attention Mechanism", progress: 100, status: 'completed' as const },
  { title: "Multi-Head Attention", progress: 65, status: 'active' as const },
  { title: "Positional Encoding", progress: 0, status: 'locked' as const },
  { title: "Training & Optimization", progress: 0, status: 'locked' as const },
];

function MockupModuleCard({ 
  title, progress, status, delay 
}: { 
  title: string; progress: number; status: 'completed' | 'active' | 'locked'; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors ${
        status === 'completed'
          ? 'bg-accent/5 border-accent/20'
          : status === 'active'
          ? 'bg-sidebar border-accent/30'
          : 'bg-sidebar/50 border-border/30 opacity-60'
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        status === 'completed'
          ? 'bg-accent text-white'
          : status === 'active'
          ? 'border-2 border-accent'
          : 'border-2 border-border'
      }`}>
        {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold truncate ${
          status === 'locked' ? 'text-text-muted/60' : 'text-text-heading'
        }`}>{title}</p>
        {status !== 'locked' && (
          <div className="w-full h-1 bg-border/40 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <span className={`text-[9px] font-bold shrink-0 ${
        status === 'completed' ? 'text-accent' : status === 'active' ? 'text-accent' : 'text-text-muted/40'
      }`}>
        {status === 'completed' ? '100%' : status === 'active' ? `${progress}%` : '—'}
      </span>
    </motion.div>
  );
}

export default function HeroMockup() {
  const [phase, setPhase] = useState<Phase>('input');
  const [typedText, setTypedText] = useState('');
  const [genStep, setGenStep] = useState(0);

  const TARGET_TEXT = "Transformer architectures";

  const resetCycle = useCallback(() => {
    setPhase('input');
    setTypedText('');
    setGenStep(0);
  }, []);

  // Phase 1: Typewriter effect
  useEffect(() => {
    if (phase !== 'input') return;

    // Small initial delay before typing starts
    const startDelay = setTimeout(() => {
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx++;
        setTypedText(TARGET_TEXT.slice(0, charIdx));
        if (charIdx >= TARGET_TEXT.length) {
          clearInterval(typeInterval);
          // Pause then "press" generate
          setTimeout(() => setPhase('generating'), 800);
        }
      }, 60);
      return () => clearInterval(typeInterval);
    }, 1200);

    return () => clearTimeout(startDelay);
  }, [phase]);

  // Phase 2: Generation steps
  useEffect(() => {
    if (phase !== 'generating') return;

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < GEN_STEPS.length) {
        setGenStep(step);
      } else {
        clearInterval(stepInterval);
        setTimeout(() => setPhase('result'), 400);
      }
    }, 600);

    return () => clearInterval(stepInterval);
  }, [phase]);

  // Phase 3: Show result, then loop
  useEffect(() => {
    if (phase !== 'result') return;
    const timeout = setTimeout(() => resetCycle(), 6000);
    return () => clearTimeout(timeout);
  }, [phase, resetCycle]);

  return (
    <div className="relative w-full h-full min-h-[450px] md:min-h-[580px] flex items-center justify-center">
      {/* Ambient glow behind phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[500px] bg-accent/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Phone Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10"
      >
        <div className="w-[290px] md:w-[310px] rounded-[32px] bg-text-heading dark:bg-[#1a1a1a] p-[6px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)]">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-text-heading dark:bg-[#1a1a1a] rounded-b-[14px] z-20" />

          {/* Screen */}
          <div className="rounded-[26px] bg-background overflow-hidden relative">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <span className="text-[10px] font-semibold text-text-heading">9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-text-heading" />
                <Wifi className="w-3 h-3 text-text-heading" />
                <Battery className="w-3.5 h-3.5 text-text-heading" />
              </div>
            </div>

            {/* App Header */}
            <div className="px-4 py-2 flex items-center gap-2 border-b border-border/40">
              <EulerLogoCanvas size={18} />
              <span className="text-[12px] font-bold text-text-heading tracking-tight">EulerFold</span>
            </div>

            {/* Screen Content — Animated Phases */}
            <div className="min-h-[420px] md:min-h-[440px] relative">
              <AnimatePresence mode="wait">

                {/* Phase: Input */}
                {phase === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 flex flex-col"
                  >
                    <p className="text-[11px] font-bold text-text-heading mb-1">What do you want to learn?</p>
                    <p className="text-[9px] text-text-muted mb-4">Describe a topic and we'll build your path.</p>

                    {/* Fake input */}
                    <div className="rounded-md border border-border bg-sidebar/50 p-3 mb-3 min-h-[60px]">
                      <p className="text-[12px] text-text-heading font-medium leading-relaxed">
                        {typedText}
                        <span className="inline-block w-[2px] h-[14px] bg-accent ml-0.5 align-middle animate-pulse" />
                      </p>
                    </div>

                    {/* Generate button — animates to "pressed" state */}
                    <motion.div
                      animate={typedText.length >= TARGET_TEXT.length ? { scale: [1, 0.96, 1] } : {}}
                      transition={{ delay: 0.3, duration: 0.2 }}
                      className="flex justify-end"
                    >
                      <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
                        typedText.length >= TARGET_TEXT.length
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-border/50 text-text-muted/50'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        Generate
                      </div>
                    </motion.div>

                    {/* Decorative placeholder cards */}
                    <div className="mt-6 space-y-2 opacity-40">
                      <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-2">Popular topics</p>
                      {["Machine Learning", "System Design", "Quantum Computing"].map((t) => (
                        <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/40 bg-sidebar/30">
                          <div className="w-3 h-3 rounded-full border border-border" />
                          <span className="text-[10px] text-text-muted font-medium">{t}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Phase: Generating */}
                {phase === 'generating' && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 flex flex-col items-center justify-center min-h-[420px]"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mb-6"
                    >
                      <Loader2 className="w-8 h-8 text-accent" />
                    </motion.div>
                    <p className="text-[12px] font-bold text-text-heading mb-6 text-center">Building Your Path</p>
                    
                    <div className="w-full space-y-2">
                      {GEN_STEPS.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ 
                            opacity: i <= genStep ? 1 : 0.2, 
                            x: i <= genStep ? 0 : -8 
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2.5 px-3 py-2"
                        >
                          {i < genStep ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          ) : i === genStep ? (
                            <div className="w-3.5 h-3.5 border-[2px] border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                          )}
                          <span className={`text-[10px] font-medium ${
                            i <= genStep ? 'text-text-heading' : 'text-text-muted/40'
                          }`}>{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Phase: Result — Roadmap */}
                {phase === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col"
                  >
                    {/* Roadmap header */}
                    <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2.5">
                      <EulerLogoCanvas size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-text-heading truncate">Transformer Architectures</p>
                        <p className="text-[9px] text-text-muted">4 modules · 12 hours</p>
                      </div>
                      <div className="bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                        <span className="text-[9px] font-bold text-accent">42%</span>
                      </div>
                    </div>

                    {/* Module list */}
                    <div className="p-3 space-y-2">
                      {MODULES.map((mod, i) => (
                        <MockupModuleCard
                          key={mod.title}
                          title={mod.title}
                          progress={mod.progress}
                          status={mod.status}
                          delay={0.1 + i * 0.15}
                        />
                      ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <PlayCircle className="w-3 h-3" />
                          <span className="font-semibold">Video</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <BookOpen className="w-3 h-3" />
                          <span className="font-semibold">Theory</span>
                        </span>
                      </div>
                      <span className="text-[9px] text-text-muted/60 font-medium">2 of 4 complete</span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Home indicator bar */}
            <div className="flex justify-center pb-2 pt-1">
              <div className="w-[100px] h-[4px] rounded-full bg-text-heading/20 dark:bg-white/20" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
