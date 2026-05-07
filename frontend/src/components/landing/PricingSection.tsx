"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PricingSection() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div className="flex flex-col p-5 border border-[var(--accent)] rounded-none bg-accent-muted/5 relative shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-5">
                    <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest mb-2 inline-block">One-time payment</span>
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="inconsolata-ui text-xl font-bold text-text-heading">Pro</span>
                        <span className="inconsolata-ui text-lg font-bold text-accent">₹299</span>
                    </div>
                    <p className="manrope-body text-[11px] text-text-muted">Advanced study paths.</p>
                </div>

                <div className="space-y-1.5 mb-6 flex-1 text-[10px] text-text-primary font-medium">
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✓</span> 5 Premium Credits
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
                    className="w-full py-2 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
                >
                    Buy Credits (₹299)
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
}
