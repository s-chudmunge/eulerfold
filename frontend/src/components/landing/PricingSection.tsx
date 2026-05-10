"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Clock, Info } from 'lucide-react';
import { getDiscountStatus, formatTime, NORMAL_PRICE, DISCOUNTED_PRICE } from '@/lib/utils/pricing';

export default function PricingSection() {
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => {
      setDiscountStatus(getDiscountStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = discountStatus.hasDiscount ? DISCOUNTED_PRICE : NORMAL_PRICE;

  // Use a placeholder or nothing during server-side render to avoid hydration mismatch
  const renderTimer = (seconds: number) => {
    if (!hasMounted) return "00:00:00";
    return formatTime(seconds);
  };

  return (
    <section className="py-24 px-6 bg-background border-t border-border/30">
      <div className="lg:max-w-[60%] mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-widest uppercase mb-4"
        >
          Pricing
        </motion.h2>
        <p className="text-text-muted manrope-body text-base md:text-lg">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="lg:max-w-[60%] mx-auto">
        {/* Discount Alert */}
        {discountStatus.hasDiscount && (
          <div className="mb-10 p-6 bg-orange-600 dark:bg-orange-700 border-b-4 border-orange-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 relative z-10 text-left">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
                <Zap className="w-6 h-6 text-orange-600 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-orange-900/20 rounded text-[10px] font-black text-white uppercase tracking-tighter">Live Now</span>
                  <h3 className="inconsolata-ui text-[16px] font-black text-white uppercase tracking-tight leading-none">Mother&apos;S Day Flash Sale</h3>
                </div>
                <p className="manrope-body text-[12px] text-orange-50/90 font-medium">50% discount applied. Build your roadmaps at half the cost.</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 relative z-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded text-white inconsolata-ui text-[14px] font-black shadow-lg">
                <Clock className="w-4 h-4 text-orange-300" />
                <span className="font-mono">{renderTimer(discountStatus.remainingSeconds)}</span>
                <span className="text-[10px] text-orange-200 ml-1 uppercase tracking-tighter">Left</span>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Discount Hint */}
        {discountStatus.isToday && !discountStatus.hasDiscount && discountStatus.remainingSeconds > 0 && (
          <div className="mb-10 p-6 bg-[var(--callout-bg)] border border-[var(--callout-border)] border-l-4 border-l-teal-600 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-teal-600/10 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-teal-600/10 border border-teal-600/20 rounded text-[10px] font-bold text-teal-700 uppercase tracking-widest">Upcoming Event</span>
                  <h3 className="inconsolata-ui text-[16px] font-black text-text-heading uppercase tracking-tight leading-none">Mother&apos;S Day Sale</h3>
                </div>
                <p className="manrope-body text-[12px] text-text-muted font-medium">Get 50% off all credits starting very soon. Don't miss out!</p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--text-heading)] text-[var(--bg-main)] rounded shadow-md inconsolata-ui text-[14px] font-black">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="font-mono">{renderTimer(discountStatus.remainingSeconds)}</span>
              </div>
              <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-bold">Starts in</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* Starter Tier */}
            <div className="flex flex-col p-5 border border-border rounded-none bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5">
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2 inline-block">Always Free</span>
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="inconsolata-ui text-xl font-bold text-text-heading">Starter</span>
                        <span className="inconsolata-ui text-lg font-bold text-text-muted">Free</span>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted">Standard features for everyone.</p>
                </div>

                <div className="space-y-1.5 mb-6 flex-1 text-[10px] text-text-primary font-medium">
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Learn from all lessons
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Copy any roadmap
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Your own skill profile
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> 5 Free roadmaps
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Job Decoded (Up to 4w)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> 2 Full Audit Senate evals
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-border/40 opacity-50">
                        <div className="flex items-center gap-2 text-text-muted">
                            <span className="text-red-500/60 font-bold text-[8px]">✗</span> Uses Basic AI Model
                        </div>
                        <div className="flex items-center gap-2 text-text-muted">
                            <span className="text-red-500/60 font-bold text-[8px]">✗</span> No EulerFold Intelligence
                        </div>
                    </div>
                </div>

                <Link 
                    href="/learn" 
                    className="w-full py-2 border border-border text-text-heading rounded-none text-center inconsolata-ui text-[9px] font-bold uppercase tracking-widest hover:bg-callout-bg transition-all"
                >
                    Start Learning
                </Link>
            </div>

            {/* Pro Tier */}
            <div className="flex flex-col p-5 border border-[var(--accent)] rounded-none bg-accent-muted/5 relative shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {discountStatus.hasDiscount && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-8 py-1 rotate-45 translate-x-[25px] translate-y-[10px] text-[8px] font-black uppercase tracking-tighter z-10">
                        -50% OFF
                    </div>
                )}
                <div className="mb-5">
                    <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest mb-2 inline-block">One-time payment</span>
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="inconsolata-ui text-xl font-bold text-text-heading">Pro</span>
                        <div className="flex items-center gap-2">
                            {discountStatus.hasDiscount && (
                                <span className="inconsolata-ui text-xs text-text-muted line-through opacity-50">₹{NORMAL_PRICE}</span>
                            )}
                            <span className="inconsolata-ui text-lg font-bold text-accent">₹{currentPrice}</span>
                        </div>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted">Advanced study paths.</p>
                </div>

                <div className="space-y-1.5 mb-6 flex-1 text-[10px] text-text-primary font-medium">
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> 20 Premium Credits
                    </div>
                    <p className="text-[9px] text-text-muted ml-5 font-bold tracking-tight mb-2 italic">
                        (1 Credit = 1 Premium AI Roadmap)
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Full EulerFold Intelligence
                    </div>
                    <div className="flex items-center gap-2 font-bold text-accent">
                        <span className="text-accent">✓</span> Job Decoded (Full Engine)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Customized Extensions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Premium Practice Mode
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Audit Senate (0.1 Credits/eval)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> Up to 12 Week Durations
                    </div>
                </div>

                <Link 
                    href="/pricing"
                    className={`w-full py-2 ${discountStatus.hasDiscount ? 'bg-orange-600' : 'bg-[#111] dark:bg-[#14b8a6]'} !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md`}
                >
                    Buy Credits (₹{currentPrice})
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
}
