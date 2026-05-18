"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/components/AuthProvider';
import { getDiscountStatus, formatTime, NORMAL_PRICE, DISCOUNTED_PRICE } from '@/lib/utils/pricing';
import { SideBanner, QUOTES } from '@/components/layout/SideBanners';

export default function PricingClient() {
    const { user, loading } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
    const [hasMounted, setHasMounted] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        setHasMounted(true);
        // Randomize on mount
        setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

        const timer = setInterval(() => {
            setDiscountStatus(getDiscountStatus());
        }, 1000);

        const quoteTimer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 60000);

        return () => {
            clearInterval(timer);
            clearInterval(quoteTimer);
        };
    }, []);

    const userCredits = user?.roadmap_credits ?? null;
    const isLoggedIn = !!user;

    const currentPrice = discountStatus.hasDiscount ? DISCOUNTED_PRICE : NORMAL_PRICE;

    const renderTimer = (seconds: number) => {
        if (!hasMounted) return "00:00:00";
        return formatTime(seconds);
    };

    return (
        <div className="pricing-container relative">
            {/* Floating Side Banners - Single side for Pricing */}
            <SideBanner 
                align="left"
                buttonText="Research"
                href="/research-decoded"
                currentQuote={QUOTES[quoteIndex]}
                quoteIndex={quoteIndex}
            />

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
                                <h3 className="inconsolata-ui text-[16px] font-black text-white uppercase tracking-tight leading-none">End of Summer Flash Sale</h3>
                            </div>
                            <p className="manrope-body text-[12px] text-orange-50/90 font-medium">25% discount applied. ☀️ Grab your credits before the season ends.</p>
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
                <div className="mb-10 p-6 bg-sidebar border border-border border-l-4 border-l-teal-600 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                    {/* Subtle summer glow background */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-700" />
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-teal-600/10 flex items-center justify-center shrink-0 shadow-inner border border-teal-600/20">
                            <Zap className="w-7 h-7 text-teal-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <span className="px-2 py-0.5 bg-teal-600/10 border border-teal-600/20 rounded text-[9px] font-black text-teal-600 uppercase tracking-widest">Coming Soon</span>
                                <h3 className="inconsolata-ui text-[18px] font-black text-text-heading uppercase tracking-tight leading-none">End of Summer Sale ☀️</h3>
                            </div>
                            <p className="manrope-body text-[13px] text-text-muted font-medium max-w-[320px]">Get <span className="text-teal-600 font-bold">25% off</span> all credits. Prepare for your next technical challenge.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 relative z-10">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded shadow-lg">
                            <Clock className="w-4 h-4 text-teal-500 animate-pulse" />
                            <span className="font-mono text-[18px] font-bold text-text-heading tracking-tighter">
                                {renderTimer(discountStatus.remainingSeconds)}
                            </span>
                        </div>
                        <span className="text-[10px] text-text-muted uppercase tracking-[0.25em] font-bold">Starts In</span>
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
                            className="px-3 py-1 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Top Up
                        </button>
                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className="px-3 py-1 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Login to Purchase
                        </Link>
                    )}
                </div>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Starter Tier */}
                <div className="flex flex-col p-8 border border-border rounded-lg bg-background relative group">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Free for everyone</span>
                            <span className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase">Free</span>
                        </div>
                        <h2 className="inconsolata-ui text-[24px] font-bold text-text-heading tracking-tight mb-2">Basic</h2>
                        <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                            Essential tools for learning.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Learn with AI</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Access all public roadmaps</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Track your skills and progress</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>5 AI roadmap generations</span>
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
                        </div>
                    </div>

                    <Link 
                        href="/learn" 
                        className="w-full py-3 border border-border text-text-heading rounded-lg text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] hover:bg-sidebar transition-all"
                    >
                        Start Learning
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="flex flex-col p-8 border-2 border-teal-600/30 rounded-lg bg-teal-900/[0.02] relative overflow-hidden group">
                    {discountStatus.hasDiscount && (
                        <div className="absolute top-0 right-0 bg-orange-600 text-white px-10 py-1.5 rotate-45 translate-x-[32px] translate-y-[12px] text-[10px] font-black uppercase tracking-widest shadow-lg z-20">
                            {Math.round((1 - DISCOUNTED_PRICE/NORMAL_PRICE) * 100)}% OFF
                        </div>
                    )}
                    
                    {/* Background glow */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl -z-10" />
                    
                    <div className="mb-8 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">One-time payment</span>
                            <div className="flex items-center gap-2">
                                {(discountStatus.hasDiscount || (discountStatus.isToday && discountStatus.remainingSeconds > 0)) && (
                                    <span className="inconsolata-ui text-sm text-text-muted line-through opacity-50">₹{NORMAL_PRICE}</span>
                                )}
                                <span className="inconsolata-ui text-2xl font-black text-text-heading">₹{currentPrice}</span>
                            </div>
                        </div>
                        <h2 className="inconsolata-ui text-[24px] font-bold text-text-heading tracking-tight mb-2">Pro</h2>
                        <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                            For deep technical mastery.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1 relative z-10">
                        <div className="mb-4 font-bold text-text-heading text-[11px] uppercase tracking-widest">Everything in Basic, plus:</div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-[12px] text-text-primary font-bold">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>20 Roadmap credits</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Unlimited depth extensions</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>AI homework reviews</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Job market insights</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>12-week strategic mapping</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-teal-700 font-black italic">
                                <span className="mt-0.5">✓</span>
                                <span>Priority AI reasoning models</span>
                            </div>
                        </div>
                    </div>

                    {isLoggedIn ? (
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className={`w-full py-3 ${discountStatus.hasDiscount ? 'bg-orange-600 hover:bg-orange-700' : 'bg-teal-700 hover:bg-teal-800'} text-white rounded-lg text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] relative z-10`}
                        >
                            Activate Pro (₹{currentPrice})
                        </button>
                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className={`w-full py-3 ${discountStatus.hasDiscount ? 'bg-orange-600 hover:bg-orange-700' : 'bg-teal-700 hover:bg-teal-800'} text-white rounded-lg text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl relative z-10`}
                        >
                            Login to Upgrade
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
        </div>
    );
}
