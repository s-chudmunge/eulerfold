"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Clock, Info } from 'lucide-react';
import {
  getDiscountStatus,
  formatTime,
  usePricing,
  isIndependenceWeekSale,
  getIndependenceSaleRemainingSeconds,
  INDEPENDENCE_SALE_PRICE_INR,
  INDEPENDENCE_SALE_PRICE_USD,
  NORMAL_PRICE_INR,
  NORMAL_PRICE_USD,
} from '@/lib/utils/pricing';

// Countdown renderer for the sale timer inside pricing
function SaleTimer({ seconds }: { seconds: number }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="inline-flex items-center gap-[2px] font-mono text-[12px] font-bold tabular-nums text-[#138808]">
      {d > 0 && <><span>{d}d</span><span className="opacity-50 mx-[1px]">:</span></>}
      <span>{pad(h)}</span>
      <span className="opacity-50 mx-[1px]">:</span>
      <span>{pad(m)}</span>
      <span className="opacity-50 mx-[1px]">:</span>
      <span>{pad(s)}</span>
    </span>
  );
}

export default function PricingSection() {
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const [hasMounted, setHasMounted] = useState(false);
  const [saleSeconds, setSaleSeconds] = useState(getIndependenceSaleRemainingSeconds());
  const { symbol, normalPrice, formatPrice, isIndia } = usePricing();

  const onSale = hasMounted && isIndependenceWeekSale();
  const salePrice = isIndia ? INDEPENDENCE_SALE_PRICE_INR : INDEPENDENCE_SALE_PRICE_USD;
  const normalPriceDisplay = isIndia ? NORMAL_PRICE_INR : NORMAL_PRICE_USD;

  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => {
      setDiscountStatus(getDiscountStatus());
      setSaleSeconds(getIndependenceSaleRemainingSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = onSale ? salePrice : normalPrice;

  return (
    <section className="py-12 md:py-24 px-6 bg-background border-t border-border/30">
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

        {/* Independence Week Sale badge */}
        {hasMounted && onSale && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5 inline-flex flex-col sm:flex-row items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-700/40 rounded-md px-4 py-2.5"
          >
            <span className="flex items-center gap-2 text-[13px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <span>🇮🇳</span>
              <span>Independence Week Sale — ends in</span>
            </span>
            <SaleTimer seconds={saleSeconds} />
          </motion.div>
        )}
      </div>

      <div className="lg:max-w-[60%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* Starter Tier */}
            <div className="flex flex-col p-5 border border-border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5">
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2 inline-block">Free for everyone</span>
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="inconsolata-ui text-xl font-bold text-text-heading">Basic</span>
                        <span className="inconsolata-ui text-lg font-bold text-text-muted">Free</span>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted">Essential tools for learning.</p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>Learn with AI</span>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>Access all public courses</span>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>Track your skills and progress</span>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>5 EulerFold AI course generations</span>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>Unlimited Local AI & OpenRouter generations</span>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>4-week goal projections</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 space-y-3 opacity-40">
                        <div className="flex items-start gap-3 text-[11px] text-text-muted">
                            <span className="text-text-muted/50 mt-0.5">×</span>
                            <span>No Priority AI models</span>
                        </div>
                        <div className="flex items-start gap-3 text-[11px] text-text-muted">
                            <span className="text-text-muted/50 mt-0.5">×</span>
                            <span>No Research Lab access</span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/learn"
                    className="w-full py-2 border border-border text-text-heading rounded-lg text-center inconsolata-ui text-[9px] font-bold uppercase tracking-widest hover:bg-callout-bg transition-all"
                >
                    Start Learning
                </Link>
            </div>

            {/* Pro Tier */}
            <div className={`flex flex-col p-5 border rounded-lg relative shadow-md hover:shadow-lg transition-shadow overflow-hidden ${onSale ? 'border-amber-400/60 dark:border-amber-600/50 bg-amber-50/30 dark:bg-amber-950/10' : 'border-[var(--accent)] bg-accent-muted/5'}`}>
                {/* Sale flag strip */}
                {onSale && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] flex">
                    <div className="flex-1 bg-[#FF9933]" />
                    <div className="flex-1 bg-white border-y border-border/30" />
                    <div className="flex-1 bg-[#138808]" />
                  </div>
                )}

                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inconsolata-ui text-[9px] font-bold uppercase tracking-widest ${onSale ? 'text-amber-600 dark:text-amber-400' : 'text-accent'}`}>
                        {onSale ? '🇮🇳 Independence Week Sale' : 'Monthly subscription'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="inconsolata-ui text-xl font-bold text-text-heading">Pro</span>
                        <div className="flex items-center gap-2">
                            {onSale && (
                              <span className="inconsolata-ui text-sm font-bold text-text-muted line-through opacity-60">
                                {formatPrice(normalPriceDisplay)}/mo
                              </span>
                            )}
                            <span className={`inconsolata-ui text-lg font-bold ${onSale ? 'text-[#138808] dark:text-emerald-400' : 'text-accent'}`}>
                              {hasMounted ? formatPrice(currentPrice) : formatPrice(normalPriceDisplay)}/mo
                            </span>
                        </div>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted">
                      {onSale ? 'Independence Week offer — 7 days only.' : 'For deep technical mastery.'}
                    </p>
                </div>

                <div className="space-y-4 mb-10 flex-1 relative z-10">
                    <div className="mb-4 font-bold text-text-heading text-[11px] uppercase tracking-widest">Everything in Basic, plus:</div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">50 Premium Credits / month</span>
                                <p className="text-[11px] text-text-muted mt-0.5">For deep generation and unlimited extensions.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">AI Practice Portal & Evaluation</span>
                                <p className="text-[11px] text-text-muted mt-0.5">Take quizzes, submit homework, and get feedback.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">Custom Courses</span>
                                <p className="text-[11px] text-text-muted mt-0.5">Build courses from URLs, PDFs, or job descriptions.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">Research Lab Access</span>
                                <p className="text-[11px] text-text-muted mt-0.5">Decode complex ArXiv papers into study plans.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">Verifiable Certificates</span>
                                <p className="text-[11px] text-text-muted mt-0.5">Prove mastery with 1-click LinkedIn integration.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-[12px] text-text-primary">
                            <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                            <div>
                                <span className="font-bold text-text-heading">Priority AI Models</span>
                                <p className="text-[11px] text-text-muted mt-0.5">Faster generation and smarter structuring.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Link
                    href="/pricing"
                    className={`w-full inline-flex items-center justify-center py-3 rounded-lg text-[14px] font-bold transition-all shadow-sm ${onSale ? 'bg-[#138808] hover:bg-[#0f6b07] text-white' : 'bg-accent text-white hover:bg-teal-700'}`}
                >
                    {onSale
                      ? `Subscribe at ${hasMounted ? formatPrice(salePrice) : formatPrice(normalPriceDisplay)}/mo`
                      : `Subscribe Pro (${formatPrice(normalPriceDisplay)}/mo)`}
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
}
