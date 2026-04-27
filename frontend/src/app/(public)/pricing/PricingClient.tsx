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
                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div>
                            <h3 className="inconsolata-ui text-[14px] font-black text-text-heading uppercase tracking-tighter leading-none">Flash Sale: 50% Off!</h3>
                            <p className="manrope-body text-[11px] text-text-muted mt-1">Special occasion discount applied automatically.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 rounded text-white inconsolata-ui text-[12px] font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Ends in: {formatTime(discountStatus.remainingSeconds)}</span>
                    </div>
                </div>
            )}

            {/* Upcoming Discount Hint */}
            {discountStatus.isToday && !discountStatus.hasDiscount && discountStatus.remainingSeconds > 0 && (
                <div className="mb-8 p-4 bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                            <Info className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-widest leading-none">Upcoming Flash Sale</h3>
                            <p className="manrope-body text-[11px] text-text-muted mt-1">50% off starting soon. Stay tuned!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-800 text-white inconsolata-ui text-[11px] font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Starting in: {formatTime(discountStatus.remainingSeconds)}</span>
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
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Customized Roadmap Extensions
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-accent">✓</span> Premium Practice Mode
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
