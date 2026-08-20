"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { authAPI } from '@/lib/api';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export function GoogleTrustBadge() {
  return (
    <div className="flex items-center gap-3 cursor-default">
      <img 
        src="/google.svg" 
        alt="Google" 
        className="h-4 w-auto" 
      />
      <div className="h-4 w-px bg-border" />
      <p className="text-[12px] font-medium text-text-muted leading-tight tracking-tight">
        Supported with extended access for educational content curation
      </p>
    </div>
  );
}

export function TrustedSourcesTicker() {
  const sources = [
    { name: 'arXiv', class: 'font-serif text-[20px] md:text-[24px] font-medium tracking-tight' },
    { name: 'NATURE', class: 'font-serif text-[16px] md:text-[18px] uppercase tracking-widest' },
    { name: 'IEEE', class: 'font-sans text-[20px] md:text-[22px] font-black tracking-tighter' },
    { name: 'Stanford Online', class: 'font-serif text-[17px] md:text-[20px] font-medium tracking-tight' },
    { name: 'MIT OpenCourseWare', class: 'font-sans text-[16px] md:text-[18px] font-semibold tracking-tight' },
    { name: 'PubMed', class: 'font-sans text-[18px] md:text-[21px] font-bold tracking-tight' },
    { name: 'ACM Digital Library', class: 'font-sans text-[16px] md:text-[19px] font-black tracking-tighter uppercase' },
    { name: 'GitHub', class: 'font-sans text-[18px] md:text-[21px] font-bold tracking-tight' },
    { name: 'MDN Web Docs', class: 'font-sans text-[17px] md:text-[19px] font-bold tracking-tight' },
    { name: 'Stack Overflow', class: 'font-sans text-[17px] md:text-[19px] font-bold tracking-tight' },
    { name: 'Wikipedia', class: 'font-serif text-[19px] md:text-[22px] font-normal tracking-tight' },
  ];

  const renderLogos = () => (
    <>
      {sources.map((source, idx) => (
        <div key={idx} className={`text-text-primary hover:opacity-100 transition-opacity duration-300 cursor-default whitespace-nowrap ${source.class}`}>
          {source.name}
        </div>
      ))}
    </>
  );

  return (
    <div className="w-full text-center overflow-hidden border-t border-border/30 pt-6">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60 mb-5 block">
        Curriculum sourced from
      </span>
      
      <div className="relative flex overflow-hidden w-full max-w-[100vw] [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex animate-infinite-scroll items-center gap-x-12 md:gap-x-24 w-max shrink-0 pr-12 md:pr-24 opacity-[0.55] grayscale hover:[animation-play-state:paused]">
          {renderLogos()}
        </div>
        <div aria-hidden="true" className="flex animate-infinite-scroll items-center gap-x-12 md:gap-x-24 w-max shrink-0 pr-12 md:pr-24 opacity-[0.55] grayscale hover:[animation-play-state:paused]">
          {renderLogos()}
        </div>
      </div>
    </div>
  );
}

export function LandingOnboardingTrigger() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkOnboarding() {
      if (!loading && user) {
        setProfile(user);
        if (!user.username || user.username.startsWith('user_') || !user.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    }
    checkOnboarding();
  }, [user, loading]);

  if (!showOnboarding || !user) return null;

  return (
    <OnboardingFlow 
      user={user}
      onComplete={(updatedUser) => setProfile(updatedUser)}
      onExit={() => setShowOnboarding(false)}
    />
  );
}

export function FAQAccordion({ items }: { items: { question: string, answer: React.ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`relative overflow-hidden border transition-all duration-500 ease-out rounded-lg group ${
              isOpen 
                ? 'border-accent/40 bg-background shadow-[0_0_40px_-10px_rgba(15,118,110,0.15)]' 
                : 'border-border/50 bg-background hover:border-accent/20 hover:bg-sidebar/30'
            }`}
          >
            {/* Ambient Background Glow for open state */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity duration-700 ${
                isOpen ? 'opacity-100' : 'group-hover:opacity-60'
              }`} 
              style={{ pointerEvents: 'none' }}
            />
            
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="relative w-full flex items-center justify-between p-6 md:p-8 text-left z-10"
            >
              <span className={`font-inter text-[15px] md:text-[17px] font-bold tracking-tight transition-colors duration-300 ${
                isOpen ? 'text-accent' : 'text-text-heading group-hover:text-text-primary'
              }`}>
                {item.question}
              </span>
              <div className={`shrink-0 ml-6 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${
                isOpen 
                  ? 'border-accent/30 bg-accent/10 text-accent rotate-180 shadow-[0_0_15px_-3px_rgba(15,118,110,0.3)]' 
                  : 'border-border/50 text-text-muted group-hover:border-accent/30 group-hover:text-accent'
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <div 
              className={`relative z-10 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                <p className="manrope-body text-[14px] md:text-[15px] text-text-muted leading-relaxed max-w-3xl">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


export function AlreadySignedInMessage() {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('message') === 'already_signed_in') {
      setShow(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div 
      style={{ top: 'calc(5rem + var(--announcement-height, 0px))' }}
      className="fixed left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-700 transition-all"
    >
      <div className="px-4 py-1.5 bg-sidebar/50 dark:bg-white/5 backdrop-blur-md rounded-full border border-border dark:border-white/10">
        <p className="manrope-body text-[11px] font-medium text-gray-400 dark:text-gray-500">
          You are already signed in
        </p>
      </div>
    </div>
  );
}

export function LocalChatCTA() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    window.location.href = `/local-chat?q=${encodeURIComponent(prompt.trim())}`;
  };

  return (
    <section className="py-20 px-6 bg-sidebar/30 border-y border-border/30 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-heading">
          Chat with your favourite local models
        </h2>
        <p className="text-text-muted text-[14px]">
          Run AI models directly on your device via WebGPU. Completely private, fast, and serverless.
        </p>
        <form onSubmit={handleSubmit} className="relative mt-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything or prompt a task..."
            className="w-full bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-full py-4 pl-6 pr-14 text-[15px] outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-accent hover:bg-teal-700 text-white rounded-full flex items-center justify-center transition-colors my-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </section>
  );
}

export function ScrollToHeroCTA() {
  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const heroInput = document.getElementById('hero-prompt-input');
    const heroTextarea = document.getElementById('hero-prompt-textarea') as HTMLTextAreaElement | null;

    if (heroInput) {
      heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      heroTextarea?.focus();
    }, 450);
  };

  return (
    <button 
      onClick={handleScroll}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-text-heading text-background hover:opacity-90 px-8 py-3.5 rounded-lg text-[14px] font-bold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
    >
      Create Course <ArrowRight className="w-4 h-4" />
    </button>
  );
}

