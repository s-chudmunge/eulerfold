"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';
import PaymentModal from '../PaymentModal';
import { supabase } from '@/lib/supabase/client';

const PLACEHOLDER_PROMPTS = [
  "e.g. I want to master Transformer architectures from scratch",
  "e.g. Build a full-stack app with Next.js and Supabase",
  "e.g. Prepare for GATE Computer Science in 3 months",
  "e.g. Learn quantum computing fundamentals with math",
];

const LOADING_MESSAGES = [
  "Designing your course... ✨",
  "Letting the AI cook... 🔥",
  "Tinkering with modules... 🔧",
  "Sprinkling some magic... 🪄",
  "Almost there, trust... 🫡",
  "Fetching the sauce... 🥫",
  "Structuring the vibes... 📈",
  "Doing the heavy lifting... 🏋️‍♂️",
  "Channeling big brain energy... 🧠"
];

export default function HeroPromptInput() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Rotate placeholder text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate loading text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Auto-resume generation if returning from OAuth login
  useEffect(() => {
    if (user) {
      const pendingSubject = sessionStorage.getItem('pending_roadmap_subject');
      if (pendingSubject) {
        setValue(pendingSubject);
        sessionStorage.removeItem('pending_roadmap_subject');
        
        // Small delay for smooth UI transition
        setTimeout(() => {
            submitGeneration(pendingSubject);
        }, 300);
      }
    }
  }, [user]);

  const submitGeneration = async (subjectText: string) => {
    if (!subjectText) return;

    if (!user) {
        sessionStorage.setItem('pending_roadmap_subject', subjectText);
        setShowLoginPrompt(true);
        return;
    }

    setIsGenerating(true);
    
    try {
        const response = await api.post('/roadmaps/generate', {
            subject: subjectText,
            goal: subjectText,
            time_value: 4,
            time_unit: 'weeks',
            experience_level: 'novice'
        });
        
        const data = response.data;
        localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp: Date.now() }));
        sessionStorage.setItem('roadmap_just_generated', 'true');
        
        router.push(`/roadmap/${data.slug || data.id}`);
    } catch (err: any) {
        console.error("Generation error:", err);
        if (err.response?.status === 401) {
            setShowLoginPrompt(true);
        } else if (err.response?.status === 402) {
            setIsPaymentModalOpen(true);
        } else {
            alert(err.message || "Failed to generate course. Please try again.");
        }
        setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    submitGeneration(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && !showLoginPrompt) handleSubmit();
    }
  };

  if (isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto mt-4 p-8 rounded-lg bg-sidebar/40 border border-border flex flex-col items-center justify-center space-y-4"
      >
        <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div 
                    key={i} 
                    className="w-2 h-2 bg-accent rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.2}s` }} 
                />
            ))}
        </div>
        <div className="text-center h-12 relative flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.h3 
                key={loadingMsgIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-text-heading font-bold text-[14px]"
              >
                {LOADING_MESSAGES[loadingMsgIdx]}
              </motion.h3>
            </AnimatePresence>
            <p className="text-text-muted text-[12px] mt-1">This takes about 10-15 seconds</p>
        </div>
      </motion.div>
    );
  }

  if (showLoginPrompt) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto mt-4 p-6 rounded-lg bg-sidebar/40 border border-border flex flex-col items-center justify-center space-y-4 shadow-sm"
      >
        <div className="text-center mb-2">
            <h3 className="text-text-heading font-bold text-[15px]">Save your progress</h3>
            <p className="text-text-muted text-[12.5px] mt-1">Sign in to generate and track your custom course.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
                onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin }
                    });
                }}
                className="flex-1 h-11 bg-white dark:bg-white/[0.03] text-text-primary border border-border rounded-lg font-bold text-[12px] hover:bg-sidebar transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
            </button>
            <button
                onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                        provider: 'github',
                        options: { redirectTo: window.location.origin }
                    });
                }}
                className="flex-1 h-11 bg-sidebar text-text-primary border border-border rounded-lg font-bold text-[12px] hover:bg-callout-bg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
            </button>
        </div>
        
        <button 
            onClick={() => setShowLoginPrompt(false)}
            className="text-[11px] text-text-muted hover:text-text-primary transition-colors mt-2 font-bold uppercase tracking-wider"
        >
            Cancel
        </button>
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
              Create
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        requiredCredits={1}
      />
    </motion.div>
  );
}
