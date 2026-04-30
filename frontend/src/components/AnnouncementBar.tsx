'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { getDiscountStatus, formatTime } from '@/lib/utils/pricing';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeOffer, setActiveOffer] = useState(0); // 0 for Launch, 1 for Flash Sale
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // Only show if not on dashboard
    if (pathname !== '/dashboard') {
        setIsVisible(true);
        document.documentElement.style.setProperty('--announcement-height', '38px');
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
      subscription.unsubscribe();
      clearInterval(flipInterval);
      clearInterval(timerInterval);
    };
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
    document.documentElement.style.setProperty('--announcement-height', '0px');
  };

  if (!isVisible || pathname === '/dashboard') {
    // Ensure height is 0 if not visible or on dashboard
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }
    return null;
  }

  const showFlashSale = discountStatus.hasDiscount || (discountStatus.isToday && discountStatus.remainingSeconds > 0 && !discountStatus.hasDiscount);

  return (
    <div className="fixed top-0 inset-x-0 z-[70] bg-gradient-to-r from-teal-900 via-teal-700 to-teal-900 text-white h-[38px] flex items-center px-4 md:px-6 transition-all duration-500 ease-in-out border-b border-white/10 shadow-sm overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center h-full relative">
        
        <AnimatePresence mode="wait">
          {activeOffer === 0 || !showFlashSale ? (
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
                  <Gift className="w-4 h-4 text-teal-300" />
                </motion.div>
                <span>LAUNCH OFFER: Get 5 free roadmaps on signup</span>
              </div>
              <Link 
                href={isLoggedIn ? "/generate" : "/login"} 
                className="bg-white text-teal-800 px-4 py-1 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-tighter hover:bg-teal-50 transition-colors hidden sm:block shadow-sm"
              >
                Claim Now
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key="flash-sale"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 w-full"
            >
              <div className="flex items-center gap-2.5 text-[13px] md:text-[15px] font-bold uppercase tracking-wider text-orange-300">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity, 
                  }}
                >
                  <Zap className="w-4 h-4 fill-current" />
                </motion.div>
                <span className="text-white">
                    {discountStatus.hasDiscount ? (
                        <>MAHARASHTRA DAY SALE: 50% OFF — <span className="font-black text-orange-300 font-mono">{formatTime(discountStatus.remainingSeconds)}</span> LEFT</>
                    ) : (
                        <>MAHARASHTRA DAY SALE STARTING IN — <span className="font-black text-orange-300 font-mono">{formatTime(discountStatus.remainingSeconds)}</span></>
                    )}
                </span>
              </div>
              <Link 
                href="/pricing" 
                className="bg-orange-500 text-white px-4 py-1 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-colors hidden sm:block shadow-sm border border-orange-400/20"
              >
                Buy Now
              </Link>
            </motion.div>
          )}
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
