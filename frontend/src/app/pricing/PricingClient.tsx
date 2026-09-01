"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '@/components/PaymentModal';
import EnterpriseInterestModal from '@/components/EnterpriseInterestModal';
import { useAuth } from '@/components/AuthProvider';
import { getDiscountStatus, formatTime, usePricing } from '@/lib/utils/pricing';

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
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Learn with AI assistance</span>
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
                                <span>5 custom roadmap builds</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>Unlimited Local AI & OpenRouter roadmaps</span>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                <span>4-week study goal projections</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 space-y-3 opacity-40">
                            <div className="flex items-start gap-3 text-[11px] text-text-muted">
                                <span className="text-text-muted/50 mt-0.5">×</span>
                                <span>No Frontier AI models</span>
                            </div>
                            <div className="flex items-start gap-3 text-[11px] text-text-muted">
                                <span className="text-text-muted/50 mt-0.5">×</span>
                                <span>No Research Decoded access</span>
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
                            For in-depth technical learning.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1 relative z-10">
                        <div className="mb-4 font-bold text-text-heading text-[11px] uppercase tracking-widest">Everything in Basic, plus:</div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">50 Roadmap Credits / month</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">Build up to 50 structured roadmaps each month.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">Practice Portal & Homework Evaluation</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">Take quizzes, submit proof of work, and receive technical feedback.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">Custom Learning Paths</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">Build learning paths from URLs, syllabi, or job descriptions.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">Research Decoded Access</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">First-principles breakdowns of complex arXiv papers.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">Certificates of Completion</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">Downloadable PDF certificates with proof-of-work validation.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-[12px] text-text-primary">
                                <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                                <div>
                                    <span className="font-bold text-text-heading">Frontier AI Models</span>
                                    <p className="text-[11px] text-text-muted mt-0.5">Faster roadmap structuring with models from frontier labs.</p>
                                </div>
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
