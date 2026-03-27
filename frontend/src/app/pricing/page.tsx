"use client";

import React, { useState, useEffect } from 'react';
import { 
    Check, 
    Zap, 
    Menu,
    X,
    LayoutDashboard,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import PaymentModal from '@/components/PaymentModal';
import { supabase } from '@/lib/supabase/client';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export default function PricingPage() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setIsLoggedIn(true);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('supabase_uid', session.user.id)
                    .single();
                if (data) {
                    setProfile(data);
                    setUserCredits(data.roadmap_credits);
                }
            } else {
                setIsLoggedIn(false);
            }
        };
        fetchCredits();
    }, []);

    return (
        <div 
            style={{ top: 'var(--announcement-height, 0px)' }}
            className="fixed inset-x-0 bottom-0 flex flex-col bg-background manrope-body selection:bg-teal-500/30 overflow-hidden transition-all duration-300"
        >
            {/* Header */}
            <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link className="flex items-center group shrink-0" href="/">
                            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {profile?.username ? (
                            <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Dash</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                <span className="hidden sm:inline">Sign In</span>
                                <span className="sm:hidden">Login</span>
                            </Link>
                        )}
                        <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
                    <div className="max-w-[700px] mx-auto px-6 py-10 md:py-16">
                    
                        {/* Ultra-Compact Header & Balance Row */}
                        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-tight">
                                    Roadmap Credits
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 flex items-center justify-center text-accent">
                                    <Zap className="w-4 h-4 fill-[var(--accent)]/10" />
                                </div>
                                <div className="pr-4 border-r border-border">
                                    <p className="inconsolata-ui text-[13px] font-bold text-text-heading leading-none">
                                        {userCredits !== null ? `${userCredits} Credit${userCredits !== 1 ? 's' : ''}` : '...'}
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

                        {/* Tighter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Starter Tier */}
                            <div className="flex flex-col p-6 border border-border rounded-none">
                                <div className="mb-6">
                                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest mb-3 inline-block">Always Free</span>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="inconsolata-ui text-2xl font-bold text-text-heading">Starter</span>
                                    </div>
                                    <p className="manrope-body text-[12px] text-text-muted">Standard features for everyone.</p>
                                </div>

                                <div className="space-y-2 mb-8 flex-1">
                                    {[
                                        "Learn from all lessons",
                                        "Copy any roadmap",
                                        "Your own skill profile",
                                        "5 Free roadmaps"
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-2.5 text-[11px] text-text-primary">
                                            <Check className="w-3.5 h-3.5 text-accent shrink-0" /> {item}
                                        </div>
                                    ))}
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
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="inconsolata-ui text-2xl font-bold text-text-heading">Pro</span>
                                    </div>
                                    <p className="manrope-body text-[12px] text-text-muted">Advanced study paths.</p>
                                </div>

                                <div className="space-y-2 mb-8 flex-1">
                                    {[
                                        "2 Premium roadmaps",
                                        "Full-length study paths",
                                        "Step-by-step lessons",
                                        "Downloadable PDF reports"
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-2.5 text-[11px] text-text-primary font-medium">
                                            <Check className="w-3.5 h-3.5 text-accent shrink-0" /> {item}
                                        </div>
                                    ))}
                                </div>

                                {isLoggedIn ? (
                                    <button 
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full py-2 bg-[#111] dark:bg-[#14b8a6] !text-white rounded-none text-center inconsolata-ui text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
                                    >
                                        Buy Credits (₹99)
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
                    </div>

                    <PaymentModal 
                        isOpen={isPaymentModalOpen} 
                        onClose={() => setIsPaymentModalOpen(false)} 
                        onSuccess={() => {
                            setIsPaymentModalOpen(false);
                            window.location.reload();
                        }} 
                    />
                </main>
            </div>
        </div>
    );
}
