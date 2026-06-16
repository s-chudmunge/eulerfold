'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getDiscountStatus, formatTime } from '@/lib/utils/pricing';
import { useAuth } from '@/components/AuthProvider';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeOffer, setActiveOffer] = useState(0); // 0 for Launch, 1 for Flash Sale
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const isPro = user?.is_pro;

  useEffect(() => {
    // Only show on public landing pages
    const internalPaths = ['/dashboard', '/planner', '/practice', '/research-lab', '/roadmap', '/explore', '/u/', '/generate'];
    const isInternal = internalPaths.some(p => pathname.startsWith(p));

    let timeoutId: NodeJS.Timeout;

    if (!isInternal) {
        if (isPro && localStorage.getItem('eulerfold_pro_banner_dismissed') === 'true') {
            setIsVisible(false);
            document.documentElement.style.setProperty('--announcement-height', '0px');
        } else {
            setIsVisible(true);
            document.documentElement.style.setProperty('--announcement-height', '38px');
            
            // Auto hide for pro users after 15s
            if (isPro) {
                timeoutId = setTimeout(() => {
                    setIsVisible(false);
                    document.documentElement.style.setProperty('--announcement-height', '0px');
                    localStorage.setItem('eulerfold_pro_banner_dismissed', 'true');
                }, 15000);
            }
        }
    } else {
        setIsVisible(false);
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }

    // Interval for flipping banner
    const flipInterval = setInterval(() => {
        setActiveOffer(prev => (prev === 0 ? 1 : 0));
    }, 5000);

    // Interval for timer
    const timerInterval = setInterval(() => {
        setDiscountStatus(getDiscountStatus());
    }, 1000);
    
    return () => {
      document.documentElement.style.setProperty('--announcement-height', '0px');
      clearInterval(flipInterval);
      clearInterval(timerInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, isPro]);

  const handleClose = () => {
    setIsVisible(false);
    document.documentElement.style.setProperty('--announcement-height', '0px');
    if (isPro) {
      localStorage.setItem('eulerfold_pro_banner_dismissed', 'true');
    }
  };

  if (!isVisible || pathname === '/dashboard') {
    // Ensure height is 0 if not visible or on dashboard
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }
    return null;
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[70] bg-gradient-to-r from-teal-900 via-teal-700 to-teal-900 text-white h-[38px] flex items-center px-4 md:px-6 transition-all duration-500 ease-in-out border-b border-white/10 shadow-sm overflow-hidden rounded-b-3xl md:rounded-none">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center h-full relative">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key="launch-offer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 w-full"
          >
            <div className="flex items-center gap-2.5 text-[13px] md:text-[15px] font-bold uppercase tracking-wider">
              <motion.div
                animate={{ 
                  rotate: [0, -15, 15, -15, 15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  repeatDelay: 2.5,
                  ease: "easeInOut"
                }}
              >
                {isPro ? <Sparkles className="w-4 h-4 text-teal-300" /> : <Gift className="w-4 h-4 text-teal-300" />}
              </motion.div>
              <span>
                {isPro 
                  ? "DID YOU KNOW: You can decode any research paper with this tool"
                  : isLoggedIn 
                    ? "UPGRADE TO PRO: Get 50 roadmap credits, homework evaluation, and research lab access" 
                    : "LAUNCH OFFER: Get 5 free roadmaps on signup"}
              </span>
            </div>
            <Link 
              href={isPro ? "/research-decoded" : isLoggedIn ? "/pricing" : "/login"} 
              className="bg-white text-teal-800 px-4 py-1 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-tighter hover:bg-teal-50 transition-colors hidden sm:block shadow-sm"
            >
              {isPro ? "Open Lab" : isLoggedIn ? "Upgrade Now" : "Claim Now"}
            </Link>
          </motion.div>
        </AnimatePresence>

        <button 
          onClick={handleClose}
          className="absolute right-0 p-1.5 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
