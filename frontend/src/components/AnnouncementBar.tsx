'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePricing, getDiscountStatus, formatTime, isIndependenceWeekSale, getIndependenceSaleRemainingSeconds } from '@/lib/utils/pricing';
import { useAuth } from '@/components/AuthProvider';

// Tricolor flag stripe — saffron | white | green
function TricolorStripe() {
  return (
    <span className="inline-flex flex-col gap-[2px] w-[14px] mr-1 opacity-90" aria-hidden>
      <span className="block h-[3px] rounded-sm bg-[#FF9933]" />
      <span className="block h-[3px] rounded-sm bg-white/90" />
      <span className="block h-[3px] rounded-sm bg-[#138808]" />
    </span>
  );
}

function SaleCountdown({ seconds }: { seconds: number }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="inline-flex items-center gap-[3px] font-mono text-[11px] font-bold tabular-nums">
      {d > 0 && <><span>{d}d</span><span className="opacity-50">:</span></>}
      <span>{pad(h)}</span>
      <span className="opacity-50">:</span>
      <span>{pad(m)}</span>
      <span className="opacity-50">:</span>
      <span>{pad(s)}</span>
    </span>
  );
}

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const [saleSeconds, setSaleSeconds] = useState(getIndependenceSaleRemainingSeconds());
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { isIndia } = usePricing();
  const isLoggedIn = !!user;
  const isPro = user?.is_pro;
  const onSale = hasMounted && isIndependenceWeekSale();

  const salePriceText = isIndia ? '₹99/mo' : '$2/mo';

  useEffect(() => {
    setHasMounted(true);
    // Only show on public landing pages
    const internalPaths = ['/dashboard', '/planner', '/practice', '/research-lab', '/roadmap', '/explore', '/u/', '/generate', '/local-chat'];
    const isInternal = internalPaths.some(p => pathname.startsWith(p));

    let timeoutId: NodeJS.Timeout;

    if (!isInternal) {
      if (isPro && localStorage.getItem('eulerfold_pro_banner_dismissed') === 'true') {
        setIsVisible(false);
        document.documentElement.style.setProperty('--announcement-height', '0px');
      } else {
        setIsVisible(true);
        document.documentElement.style.setProperty('--announcement-height', '38px');

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

    const timerInterval = setInterval(() => {
      setDiscountStatus(getDiscountStatus());
      setSaleSeconds(getIndependenceSaleRemainingSeconds());
    }, 1000);

    return () => {
      document.documentElement.style.setProperty('--announcement-height', '0px');
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
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--announcement-height', '0px');
    }
    return null;
  }

  if (onSale && !isPro) {
    // Independence Week Sale Banner
    return (
      <div
        className="fixed top-0 inset-x-0 z-[70] text-white h-[38px] flex items-center px-4 md:px-6 transition-all duration-500 ease-in-out border-b border-white/10 shadow-sm overflow-hidden rounded-b-3xl md:rounded-none"
        style={{
          background: 'linear-gradient(90deg, #b45309 0%, #1a4731 40%, #0f766e 70%, #1a4731 100%)',
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-center h-full relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2.5 w-full"
          >
            <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-bold uppercase tracking-wide">
              <span className="text-[#FF9933]">🇮🇳</span>
              <span>Independence Week Sale</span>
              <span className="hidden sm:inline text-white/60 font-normal lowercase tracking-normal mx-0.5">:</span>
              <span className="hidden sm:inline">
                {isLoggedIn ? `Pro at ${salePriceText}` : `Pro at ${salePriceText} · Free signup`}
              </span>
            </div>

            {/* Countdown */}
            <span className="flex items-center gap-1 bg-black/20 rounded px-2 py-0.5 ml-1">
              <span className="text-[10px] text-white/60 uppercase tracking-widest mr-1 hidden sm:inline">Ends in</span>
              {hasMounted ? <SaleCountdown seconds={saleSeconds} /> : <span className="font-mono text-[11px]">--:--:--</span>}
            </span>

            <Link
              href={isPro ? '/research-decoded' : isLoggedIn ? '/pricing' : '/login'}
              className="bg-[#FF9933] text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-tight hover:bg-amber-500 transition-colors hidden sm:block shadow-sm ml-1"
            >
              {isLoggedIn ? 'Upgrade' : 'Claim'}
            </Link>
          </motion.div>

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

  // Default banner (outside sale window)
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
                  ease: 'easeInOut',
                }}
              >
                {isPro ? <Sparkles className="w-4 h-4 text-teal-300" /> : <Gift className="w-4 h-4 text-teal-300" />}
              </motion.div>
              <span>
                {isPro
                  ? 'DID YOU KNOW: You can decode any research paper with this tool'
                  : isLoggedIn
                  ? 'UPGRADE TO PRO: Get 50 course credits, homework evaluation, and research lab access'
                  : 'LAUNCH OFFER: Get 5 free courses on signup'}
              </span>
            </div>
            <Link
              href={isPro ? '/research-decoded' : isLoggedIn ? '/pricing' : '/login'}
              className="bg-white text-teal-800 px-4 py-1 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-tighter hover:bg-teal-50 transition-colors hidden sm:block shadow-sm"
            >
              {isPro ? 'Open Lab' : isLoggedIn ? 'Upgrade Now' : 'Claim Now'}
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
