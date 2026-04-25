"use client";

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/components/AuthProvider';

export default function PricingClient() {
    const { user, loading } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const userCredits = user?.roadmap_credits ?? null;
    const isLoggedIn = !!user;

    return (
        <>
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
                            <span className="text-accent">✓</span> 5 Free roadmaps
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
                <div className="flex flex-col p-6 border border-[var(--accent)] rounded-none bg-accent-muted/5">
                    <div className="mb-6">
                        <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest mb-3 inline-block">One-time payment</span>
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="inconsolata-ui text-2xl font-bold text-text-heading">Pro</span>
                            <span className="inconsolata-ui text-xl font-bold text-accent">₹299</span>
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
                            <span className="text-accent">✓</span> Full-length study paths
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
                            className="w-full py-2 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
                        >
                            Buy Credits (₹299)
                        </button>

                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className="w-full py-2 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
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
