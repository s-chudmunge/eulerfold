"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '@/components/PaymentModal';
import EnterpriseInterestModal from '@/components/EnterpriseInterestModal';
import { useAuth } from '@/components/AuthProvider';
import { getDiscountStatus, formatTime, usePricing } from '@/lib/utils/pricing';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAvatar';

export default function PricingClient() {
    const [isYearly, setIsYearly] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
    const { user, loading } = useAuth();
    const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
    const [hasMounted, setHasMounted] = useState(false);
    const { symbol, normalPrice, formatPrice } = usePricing();

    useEffect(() => {
        setHasMounted(true);

        const timer = setInterval(() => {
            setDiscountStatus(getDiscountStatus());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const userCredits = user?.roadmap_credits ?? null;
    const isLoggedIn = !!user;

    const currentPrice = normalPrice;

    const renderTimer = (seconds: number) => {
        if (!hasMounted) return "00:00:00";
        return formatTime(seconds);
    };

    return (
        <div className="pricing-container relative">
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
                </div>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Starter Tier */}
                <div className="flex flex-col p-8 border border-border rounded-md bg-background relative group">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Free for everyone</span>
                            <span className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase">Free</span>
                        </div>
                        <h2 className="inconsolata-ui text-[24px] font-bold text-text-heading tracking-tight mb-2">Basic</h2>
                        <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                            Essential tools for self-directed learning.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span className="flex items-center gap-1.5 font-semibold text-text-heading">
                                    <GoldfishIcon className="w-3.5 h-3.5 inline shrink-0" />
                                    <span>Goldfish AI Co-Pilot (5 free requests)</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>Curated lectures & university notes</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>Study planner & Google Calendar sync</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>5 custom roadmap builds (Free AI)</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 space-y-2.5 opacity-40">
                            <div className="flex items-center gap-2.5 text-[11px] text-text-muted">
                                <span className="text-text-muted/50">×</span>
                                <span className="flex items-center gap-1.5">
                                    <GoldfishIcon className="w-3 h-3 grayscale opacity-60 inline shrink-0" />
                                    <span>Unlimited Goldfish AI requests</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px] text-text-muted">
                                <span className="text-text-muted/50">×</span>
                                <span>Frontier AI models & Research Decoded</span>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href="/explore" 
                        className="w-full py-3 border border-border text-text-heading rounded-md text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] hover:bg-sidebar transition-all"
                    >
                        Explore Roadmaps
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="flex flex-col p-8 border border-border rounded-md bg-background relative overflow-hidden group">
                    <div className="mb-8 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">Monthly subscription</span>
                            <div className="flex items-center gap-2">
                                <span className="inconsolata-ui text-2xl font-black text-text-heading">{formatPrice(currentPrice)}/mo</span>
                            </div>
                        </div>
                        <h2 className="inconsolata-ui text-[24px] font-bold text-text-heading tracking-tight mb-2">Pro</h2>
                        <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                            For deep technical mastery.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1 relative z-10">
                        <div className="mb-3 font-bold text-text-heading text-[11px] uppercase tracking-widest">Everything in Basic, plus:</div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span className="flex items-center gap-1.5 font-semibold text-text-heading">
                                    <GoldfishIcon className="w-3.5 h-3.5 inline shrink-0" />
                                    <span>Unlimited Goldfish AI Co-Pilot</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>50 Frontier Roadmap Builds / month</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>Practice Portal & Homework Evaluations</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>Research Decoded (arXiv paper breakdowns)</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] text-text-primary">
                                <span className="text-teal-600 font-bold">✓</span>
                                <span>Verified PDF Certificates of Completion</span>
                            </div>
                        </div>
                    </div>

                    {isLoggedIn ? (
                        user?.is_pro ? (
                            <div className="w-full text-center py-3 px-4 bg-teal-600/10 border border-teal-600/20 rounded-md text-teal-700 dark:text-teal-400 relative z-10">
                                <p className="text-[13px] font-bold inconsolata-ui tracking-tight">Welcome {user.full_name?.split(' ')[0] || user.username || 'back'}, you are already a pro member, Yay! 🎉</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="w-full inline-flex items-center justify-center bg-accent text-white hover:bg-teal-700 py-3 rounded-md text-[14px] font-bold transition-all shadow-sm relative z-10"
                            >
                                Activate Pro ({formatPrice(currentPrice)}/mo)
                            </button>
                        )
                    ) : (
                        <Link 
                            href="/login?next=/pricing"
                            className="w-full inline-flex items-center justify-center bg-accent text-white hover:bg-teal-700 py-3 rounded-md text-[14px] font-bold transition-all shadow-sm relative z-10"
                        >
                            Login to Upgrade
                        </Link>
                    )}
                </div>

                {/* Enterprise Tier */}
                <div className="flex flex-col p-8 border border-border/40 rounded-md bg-background/30 relative overflow-hidden group opacity-80 backdrop-blur-sm">
                    <div className="mb-8 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inconsolata-ui text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Custom Solutions</span>
                        </div>
                        <h2 className="inconsolata-ui text-[24px] font-bold text-text-heading tracking-tight mb-2 flex items-center gap-2">
                            Enterprise 
                            <span className="text-xs bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full font-medium">BETA</span>
                        </h2>
                        <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                            For teams and organizations.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1 relative z-10 flex flex-col items-center justify-center py-10">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4 border border-slate-500/20">
                                <span className="text-xl">🤫</span>
                            </div>
                            <div className="inconsolata-ui text-lg font-black text-text-heading/80">Coming soon...</div>
                            <p className="text-[12px] text-text-muted px-4 leading-relaxed">We are crafting something specialized for engineering teams.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsEnterpriseModalOpen(true)}
                        className="w-full py-3 border border-border/40 text-text-heading rounded-md text-center inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] bg-background/40 hover:bg-sidebar transition-colors relative z-10"
                    >
                        Show interest
                    </button>
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

            <EnterpriseInterestModal 
                isOpen={isEnterpriseModalOpen}
                onClose={() => setIsEnterpriseModalOpen(false)}
            />
        </div>
    );
}
