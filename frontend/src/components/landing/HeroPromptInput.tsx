"use client";

import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import InlineGenerator from './InlineGenerator';

const PLACEHOLDER_PROMPTS = [
  "e.g. I want to master Transformer architectures from scratch",
  "e.g. Build a full-stack app with Next.js and Supabase",
  "e.g. Prepare for GATE Computer Science in 3 months",
  "e.g. Learn quantum computing fundamentals with math",
];

export default function HeroPromptInput() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Rotate placeholder text every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    setIsExpanded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isExpanded) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto mt-4"
      >
        <InlineGenerator initialSubject={value.trim()} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Gradient border wrapper */}
      <div
        className={`relative rounded-lg p-[1.5px] transition-all duration-500 ${
          isFocused
            ? 'bg-gradient-to-r from-accent via-teal-400 to-accent shadow-[0_0_30px_-5px_rgba(15,118,110,0.3)]'
            : 'bg-gradient-to-r from-accent/40 via-border to-accent/40'
        }`}
      >
        <div className="bg-background rounded-[5px] p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_PROMPTS[placeholderIdx]}
            rows={2}
            className="w-full bg-transparent text-text-primary text-[14px] manrope-body font-medium placeholder:text-text-muted/50 resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted/60 manrope-body font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent/50" />
                Powered by EulerFold AI
              </span>
            </div>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-md text-[13px] font-bold transition-all hover:bg-teal-700 active:scale-[0.97] shadow-sm"
            >
              Generate
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
