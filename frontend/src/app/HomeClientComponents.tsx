"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { authAPI } from '@/lib/api';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { motion } from 'framer-motion';

export function GoogleTrustBadge() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex items-center gap-5 mt-2 cursor-default group"
    >
      {/* Animated Glow Backdrop - subtle by default, stronger on hover */}
      <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-accent/5 via-transparent to-transparent rounded-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
        }}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        className="relative z-10"
      >
        <img 
          src="/google.svg" 
          alt="Google" 
          className="h-4 w-auto transition-all duration-500" 
        />
      </motion.div>

      <motion.div 
        variants={{
          hidden: { scaleY: 0, opacity: 0 },
          visible: { scaleY: 1, opacity: 1, transition: { duration: 0.4 } }
        }}
        className="h-4 w-px bg-border relative z-10" 
      />

      <motion.div variants={itemVariants} className="flex flex-col relative z-10">
        <p className="text-[12px] font-bold text-text-heading leading-tight tracking-tight">
          Supported by Google’s YouTube API team with special allowances
        </p>
        <p className="text-[10px] text-accent font-semibold flex items-center gap-1.5">
          Thank you for the support! 🙌
        </p>
      </motion.div>
    </motion.div>
  );
}

export function TrustedSourcesTicker() {
  const sources = [
    { name: "Nature", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Nature_journal_logo.svg" },
    { name: "IEEE", logo: "https://cdn.simpleicons.org/ieee" },
    { name: "arXiv", logo: "https://cdn.simpleicons.org/arxiv" },
    { name: "Wikipedia", logo: "https://cdn.simpleicons.org/wikipedia" },
    { name: "MIT", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/MIT_logo.svg" },
    { name: "Stanford", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Stanford_plain_block_%22S%22_logo.svg" },
    { name: "Harvard", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Harvard_University_logo.svg" },
    { name: "Khan Academy", logo: "https://cdn.simpleicons.org/khanacademy" },
    { name: "3Blue1Brown", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/3B1B_Logo.svg" },
    { name: "Python", logo: "https://cdn.simpleicons.org/python" },
    { name: "C++", logo: "https://cdn.simpleicons.org/cplusplus" },
    { name: "OpenAI", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/OpenAI_Logo.svg" },
    { name: "GitHub", logo: "https://cdn.simpleicons.org/github" },
    { name: "NASA", logo: "https://cdn.simpleicons.org/nasa" },
    { name: "CERN", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/CERN_logo_badge.svg" },
    { name: "Stack Overflow", logo: "https://cdn.simpleicons.org/stackoverflow" },
    { name: "DeepMind", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Google_DeepMind_logo.svg" },
    { name: "Coursera", logo: "https://cdn.simpleicons.org/coursera" },
    { name: "Kaggle", logo: "https://cdn.simpleicons.org/kaggle" }
  ];

  // Double the array for seamless looping
  const duplicatedSources = [...sources, ...sources];

  return (
    <div className="mt-12 w-full max-w-3xl overflow-hidden relative">
      <div className="mb-8">
        <span className="manrope-body text-[13px] text-text-muted font-medium">We use Trusted sources to build your roadmap</span>
      </div>

      <div className="relative">
        {/* Fades for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div 
          className="flex gap-16 items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          {duplicatedSources.map((source, idx) => (
            <div key={idx} className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
              <div className="h-5 flex items-center justify-center">
                <img 
                  src={source.logo} 
                  alt={source.name} 
                  className="h-full w-auto object-contain dark:brightness-200 dark:contrast-0 dark:invert group-hover:dark:invert-0 group-hover:dark:brightness-100 group-hover:dark:contrast-100 transition-all duration-500" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[12px] font-bold text-text-muted group-hover:text-text-primary tracking-tight transition-colors duration-300">{source.name}</span>
            </div>
          ))}
        </motion.div>
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

export function FAQAccordion({ items }: { items: { question: string, answer: React.ReactNode }[] }) {
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
