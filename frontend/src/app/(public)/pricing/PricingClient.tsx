"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/components/AuthProvider';
import { getDiscountStatus, formatTime, NORMAL_PRICE, DISCOUNTED_PRICE } from '@/lib/utils/pricing';

export default function PricingClient() {
    const { user, loading } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());

    useEffect(() => {
        const timer = setInterval(() => {
            setDiscountStatus(getDiscountStatus());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const userCredits = user?.roadmap_credits ?? null;
    const isLoggedIn = !!user;

    const currentPrice = discountStatus.hasDiscount ? DISCOUNTED_PRICE : NORMAL_PRICE;

    return (
        <>
            {/* Discount Alert */}
            {discountStatus.hasDiscount && (
                <div className="mb-8 p-6 bg-orange-600 dark:bg-orange-700 border-b-4 border-orange-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex items-center gap-4 relative z-10">
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
                            <span className="font-mono">{formatTime(discountStatus.remainingSeconds)}</span>
                            <span className="text-[10px] text-orange-200 ml-1 uppercase tracking-tighter">Left</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Discount Hint */}
            {discountStatus.isToday && !discountStatus.hasDiscount && discountStatus.remainingSeconds > 0 && (
                <div className="mb-8 p-6 bg-[var(--callout-bg)] border border-[var(--callout-border)] border-l-4 border-l-teal-600 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-4">
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
                            <span className="font-mono">{formatTime(discountStatus.remainingSeconds)}</span>
                        </div>
                        <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-bold">Starts in</span>
                    </div>
                </div>
            )}

            {/* Balance Row */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-tight">
                        Roadmap Credits
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center text-lg">
                        💎
                    </div>
                    <div className="pr-4 border-r border-border">
                        <p className="inconsolata-ui text-[13px] font-bold text-text-heading leading-none">
                            {loading ? '...' : userCredits !== null ? `${userCredits} Credit${userCredits !== 1 ? 's' : ''}` : '0 Credits'}
                        </p>
                    </div>
                    {isLoggedIn ? (
                        <button 
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-3 py-1 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-none text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Top Up
                        </button>
                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className="px-3 py-1 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-none text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Login to Purchase
                        </Link>
                    )}
                </div>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Starter Tier */}
                <div className="flex flex-col p-6 border border-border rounded-none bg-background">
                    <div className="mb-6">
                        <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest mb-3 inline-block">Always Free</span>
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="inconsolata-ui text-2xl font-bold text-text-heading">Starter</span>
                            <span className="inconsolata-ui text-xl font-bold text-text-muted">Free</span>
                        </div>
                        <p className="manrope-body text-[12px] text-text-muted">Standard features for everyone.</p>
                    </div>

                    <div className="space-y-2 mb-8 flex-1 text-[11px] text-text-primary">
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Learn from all lessons
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Copy any roadmap
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Your own skill profile
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> 5 Initial roadmaps
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Job Decoded (Up to 4w)
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> 2 Full Audit Senate evals
                        </div>
                        <div className="pt-2 mt-2 border-t border-border/40 opacity-50">
                            <div className="flex items-center gap-2.5 text-text-muted">
                                <span className="text-red-500/60">✗</span> Uses Basic AI Model
                            </div>
                            <div className="flex items-center gap-2.5 text-text-muted">
                                <span className="text-red-500/60">✗</span> No EulerFold Intelligence
                            </div>
                            <div className="flex items-center gap-2.5 text-text-muted">
                                <span className="text-red-500/60">✗</span> No Custom Extensions
                            </div>
                            <div className="flex items-center gap-2.5 text-text-muted">
                                <span className="text-red-500/60">✗</span> No Practice Mode
                            </div>
                        </div>
                    </div>

                    <Link 
                        href="/learn" 
                        className="w-full py-2 border border-border text-text-heading rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:bg-callout-bg transition-all"
                    >
                        Start Learning
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="flex flex-col p-6 border border-[var(--accent)] rounded-none bg-accent-muted/5 relative overflow-hidden">
                    {discountStatus.hasDiscount && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white px-8 py-1 rotate-45 translate-x-[25px] translate-y-[10px] text-[10px] font-black uppercase tracking-tighter">
                            -50% OFF
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest mb-3 inline-block">One-time payment</span>
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="inconsolata-ui text-2xl font-bold text-text-heading">Pro</span>
                            <div className="flex items-center gap-2">
                                {discountStatus.hasDiscount && (
                                    <span className="inconsolata-ui text-sm text-text-muted line-through opacity-50">₹{NORMAL_PRICE}</span>
                                )}
                                <span className="inconsolata-ui text-xl font-bold text-accent">₹{currentPrice}</span>
                            </div>
                        </div>
                        <p className="manrope-body text-[12px] text-text-muted">Advanced study paths.</p>
                    </div>

                    <div className="space-y-2 mb-8 flex-1 text-[11px] text-text-primary font-medium">
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> 5 Premium Credits
                        </div>
                        <p className="text-[10px] text-text-muted ml-6 font-bold tracking-tight mb-3 italic">
                            (1 Credit = 1 Premium AI Roadmap)
                        </p>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Full EulerFold Intelligence
                        </div>
                        <div className="flex items-center gap-2.5 font-bold text-accent">
                            <span className="text-accent">✓</span> Job Decoded (Full Engine)
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Customized Roadmap Extensions
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Premium Practice Mode
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Audit Senate (0.1 Credits/eval)
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Up to 12 Week Durations
                        </div>
                    </div>

                    {isLoggedIn ? (
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className={`w-full py-2 ${discountStatus.hasDiscount ? 'bg-orange-600' : 'bg-[#111] dark:bg-[#14b8a6]'} !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md`}
                        >
                            Buy Credits (₹{currentPrice})
                        </button>

                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className={`w-full py-2 ${discountStatus.hasDiscount ? 'bg-orange-600' : 'bg-[#111] dark:bg-[#14b8a6]'} !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md`}
                        >
                            Login to Buy Credits
                        </Link>
                    )}
                </div>
            </div>

            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    window.location.reload();
                }} 
            />
        </>
    );
}
