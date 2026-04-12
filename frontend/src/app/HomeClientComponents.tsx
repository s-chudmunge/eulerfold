"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { authAPI } from '@/lib/api';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export function LandingOnboardingTrigger() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkOnboarding() {
      if (!loading && user) {
        try {
          const me = await authAPI.getMe();
          setProfile(me);
          if (!me.username || me.username.startsWith('user_') || !me.onboarding_completed) {
            setShowOnboarding(true);
          }
        } catch (err) {
          console.error("Failed to check onboarding on landing:", err);
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

export function FAQAccordion({ items }: { items: { question: string, answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`border border-border/50 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-sidebar/30 shadow-sm' : 'hover:bg-sidebar/20'}`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-inter text-[16px] md:text-[18px] font-bold text-text-heading tracking-tight">
                {item.question}
              </span>
              <ChevronDown className={`w-5 h-5 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 pb-6 pt-0">
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

export function LoginRequiredMessage() {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('message') === 'login_required') {
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
          Sign in to access your dashboard
        </p>
      </div>
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
