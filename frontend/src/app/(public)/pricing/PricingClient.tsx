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

    const currentPrice = NORMAL_PRICE;

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
                    {/* Background glow */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl -z-10" />
                    
                    <div className="mb-8 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">One-time payment</span>
                            <div className="flex items-center gap-2">
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
                                <span>50 Roadmap credits</span>
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
                            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] relative z-10"
                        >
                            Activate Pro (₹{currentPrice})
                        </button>
                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl relative z-10"
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
