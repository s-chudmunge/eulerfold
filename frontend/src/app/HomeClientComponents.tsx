"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { authAPI } from '@/lib/api';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export function GoogleTrustBadge() {
  return (
    <div className="flex items-center gap-3 mt-2 cursor-default">
      <img 
        src="/google.svg" 
        alt="Google" 
        className="h-4 w-auto" 
      />
      <div className="h-4 w-px bg-border" />
      <p className="text-[12px] font-medium text-text-muted leading-tight tracking-tight">
        Google YouTube Data API: extended quota granted for educational content curation
      </p>
    </div>
  );
}

export function TrustedSourcesTicker() {
  const sources = [
    'arXiv', 'IEEE', 'Nature', 'MIT OCW', 'Khan Academy',
    'GitHub', 'Stack Overflow', 'Wikipedia', 'Coursera'
  ];

  return (
    <div className="mt-6 w-full max-w-2xl">
      <span className="manrope-body text-[12px] text-text-muted font-medium block mb-2">
        Curriculum sourced from
      </span>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {sources.map((source, idx) => (
          <span key={source} className="text-[12px] text-text-muted font-medium">
            {source}{idx < sources.length - 1 && <span className="ml-1.5">·</span>}
          </span>
        ))}
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
