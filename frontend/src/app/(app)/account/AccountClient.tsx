"use client";

import React, { useState, useEffect } from 'react';
import { 
    User as UserIcon,
    Mail,
    CreditCard,
    Zap,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Menu,
    X,
    ExternalLink,
    Plus,
    LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { paymentsAPI, authAPI, User, profileAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Inconsolata, Manrope } from 'next/font/google';

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

export default function AccountClient() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.replace('/?message=login_required');
        }
    }, [authLoading, authUser, router]);

    useEffect(() => {
        let isMounted = true;
        async function loadAccountData() {
            if (!authUser) return;

            try {
                // Get token for background API calls
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // 1. Basic Auth & Transactions
                const [userData, txData] = await Promise.all([
                    authAPI.getMe(),
                    paymentsAPI.getTransactions(),
                ]);

                if (!isMounted) return;
                setTransactions(txData);

                // 2. Profile fetch with fallback
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('supabase_uid', authUser.id)
                    .maybeSingle();
                
                let activeProfile = userProfile;

                if (!userProfile) {
                    try {
                        const me = await authAPI.getMe();
                        if (isMounted) {
                            setProfile(me);
                            activeProfile = me as any;
                        }
                    } catch (err) {
                        console.error("Backend fallback failed:", err);
                    }
                } else {
                    if (isMounted) setProfile(userProfile);
                }

                // 3. Technical identity if username exists
                if (activeProfile?.username) {
                    try {
                        const fullProfile = await profileAPI.getPublicProfile(activeProfile.username);
                        if (isMounted) setProfile(fullProfile);
                    } catch (err) {
                        console.error("Technical identity load failed:", err);
                    }
                }

            } catch (err) {
                console.error("Error loading account data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadAccountData();
        return () => { isMounted = false; };
    }, [authUser]);

    if (authLoading || (loading && !profile)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="h-6 w-6 border-2 border-border border-t-[var(--accent)] rounded-full animate-spin mb-4"></div>
                <p className="inconsolata-ui text-[11px] font-bold text-text-muted tracking-wide">Syncing account data...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen bg-background ${inconsolata.variable} ${manrope.variable} manrope-body selection:bg-teal-500/30 overflow-hidden`}>
            {/* Standard Header */}
            <header 
                style={{ top: 'var(--announcement-height, 0px)' }}
                className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 fixed inset-x-0 transition-all duration-500 ease-in-out"
            >
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
                        {profile?.username && (
                            <Link 
                                href={`/u/${profile.username}`}
                                className="text-[10px] md:text-[11px] font-bold text-text-primary hover:text-text-heading transition-colors flex items-center gap-1.5  tracking-wide"
                            >
                                <ExternalLink className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Public Profile</span>
                                <span className="sm:hidden">Profile</span>
                            </Link>
                        )}
                        <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div 
                style={{ paddingTop: 'calc(48px + var(--announcement-height, 0px))' }}
                className="flex flex-1 relative overflow-hidden transition-all duration-500 ease-in-out"
            >
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
                    <div className="max-w-[800px] mx-auto px-6 py-10 md:py-12">
                        
                        {/* Title Row */}
                        <div className="mb-12">
                            <div className="inconsolata-ui flex items-center gap-2 text-accent mb-1 text-[13px] font-bold tracking-wide">
                                <span className="bg-teal-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">Account</span>
                                <span className="opacity-30">/</span>
                                <span className="text-text-muted italic font-medium">Settings</span>
                            </div>
                            <p className="manrope-body text-[13px] text-text-muted">Manage your profile and roadmap credit history.</p>
                        </div>

                        {/* User Info Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 border border-border bg-callout-bg/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <UserIcon className="w-16 h-16" />
                                </div>
                                <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Profile Information</span>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="inconsolata-ui text-[10px] text-text-muted uppercase tracking-wider leading-none mb-1">Email Address</p>
                                            <p className="manrope-body text-[14px] font-bold text-text-heading">{authUser?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted">
                                            <UserIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="inconsolata-ui text-[10px] text-text-muted uppercase tracking-wider leading-none mb-1">Username</p>
                                            <p className="manrope-body text-[14px] font-bold text-text-heading">@{authUser?.username || 'not_set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border border-border bg-accent-muted/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-16 h-16 fill-accent" />
                                </div>
                                <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest mb-4 block">Credit Balance</span>
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl font-black text-text-heading tracking-tighter">
                                        {authUser?.roadmap_credits || 0}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-wide">Premium Credits</span>
                                        <Link href="/pricing" className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                                            Top up now <CreditCard className="w-2.5 h-2.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h2 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase tracking-widest">Transaction History</h2>
                                <span className="inconsolata-ui text-[10px] text-text-muted uppercase">{transactions.length} total</span>
                            </div>

                            {transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="py-3 px-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                                                <th className="py-3 px-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Payment ID</th>
                                                <th className="py-3 px-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                                                <th className="py-3 px-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Credits</th>
                                                <th className="py-3 px-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-callout-bg/20 transition-colors">
                                                    <td className="py-4 px-2 manrope-body text-[12px] text-text-primary whitespace-nowrap">
                                                        {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="py-4 px-2 inconsolata-ui text-[11px] text-text-muted font-medium">
                                                        {tx.razorpay_payment_id}
                                                    </td>
                                                    <td className="py-4 px-2 manrope-body text-[12px] font-bold text-text-heading">
                                                        ₹{(tx.amount / 100).toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold inconsolata-ui rounded-full">
                                                            +2
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span className="inconsolata-ui text-[10px] font-bold uppercase tracking-wider">{tx.status}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-12 border border-dashed border-border flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-callout-bg flex items-center justify-center mb-4 text-text-muted/30">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <p className="inconsolata-ui text-[12px] font-bold text-text-muted uppercase tracking-widest mb-1">No transactions yet</p>
                                    <p className="manrope-body text-[11px] text-text-muted/60">Your premium purchases will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
