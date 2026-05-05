"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Calendar,
    Globe, 
    GraduationCap,
    Trophy, 
    HelpCircle, 
    Plus, 
    FileText, 
    ShieldCheck,
    Settings,
    LogOut,
    User,
    MoreHorizontal,
    MessageSquare,
    Home,
    Zap,
    Coins,
    TrendingUp,
    Archive,
    CreditCard,
    Rocket
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { authAPI, roadmapsAPI, coinsAPI } from '@/lib/api';

interface SidebarProps {
    children?: React.ReactNode; // For page-specific slots like Telemetry or Stats
    header?: React.ReactNode;   // For page-specific headers like Profile info
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AppSidebar({ children, header, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        streak: 0,
        coins: 0,
        roadmaps: 0,
        credits: 0,
        isPro: false
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            
            if (session) {
                try {
                    // Validate UUID before querying to prevent Postgres errors
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);
                    
                    let profile = null;
                    if (isUUID) {
                        // Fetch profile for streak, coins, credits, and pro status
                        const { data, error: profileErr } = await supabase
                            .from('profiles')
                            .select('current_streak,eulercoins,roadmap_credits,is_pro')
                            .eq('supabase_uid', session.user.id)
                            .maybeSingle();
                        
                        if (profileErr) {
                            console.warn("Sidebar profile fetch error:", profileErr);
                        }
                        profile = data;
                    } else {
                        console.warn("Sidebar session user ID is not a valid UUID:", session.user.id);
                    }
                    
                    // Fetch roadmaps for count
                    let activeCount = 0;
                    try {
                        const roadmaps = await roadmapsAPI.getMyRoadmaps();
                        activeCount = roadmaps.filter(r => r.status !== 'completed').length;
                    } catch (err) {
                        console.error("Sidebar roadmaps fetch failed:", err);
                    }

                    setStats({
                        streak: profile?.current_streak || 0,
                        coins: profile?.eulercoins || 0,
                        roadmaps: activeCount,
                        credits: profile?.roadmap_credits || 0,
                        isPro: profile?.is_pro || false
                    });
                } catch (error) {
                    console.error('Error loading sidebar stats:', error);
                    setStats(prev => ({ ...prev, streak: 0, coins: 0 }));
                }
            }
        };
        loadData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const isActive = (path: string) => pathname === path;

    const navLinkClass = (path: string) => `
        flex items-center gap-2 px-2.5 py-1 text-[13px] transition-colors rounded-md
        ${isActive(path) 
            ? 'text-text-heading font-semibold bg-sidebar/80 dark:bg-white/5' 
            : 'text-text-muted hover:text-text-heading hover:bg-sidebar dark:hover:bg-background/[0.02]'
        }
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    style={{ top: 'var(--announcement-height, 0px)' }}
                    className="fixed inset-x-0 bottom-0 bg-black/20 z-[60] lg:hidden transition-all"
                    onClick={onClose}
                />
            )}

            <aside 
                aria-label="Application sidebar"
                style={{ top: 'var(--announcement-height, 0px)' }}
                className={`
                manrope-body bg-sidebar border-r border-border dark:border-white/[0.05]
                fixed bottom-0 left-0 z-[70] w-[240px] transform transition-all duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-[230px] lg:z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col h-full overflow-hidden shrink-0
            `}>
                <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
                    {/* Header / Space */}
                    <div className="p-3 mb-1 h-[48px] shrink-0 lg:hidden">
                        <Link href="/" className="flex items-center px-1">
                            <img src="/apple-touch-icon.png" alt="" className="w-5 h-5 object-contain" />
                        </Link>
                    </div>

                    <div className="px-2 space-y-4 pt-4 lg:pt-2">
                        {/* Primary Operations */}
                        <nav className="space-y-0.5" aria-label="Operations navigation">
                            <Link href="/dashboard" aria-current={isActive('/dashboard') ? 'page' : undefined} className={navLinkClass('/dashboard')} onClick={onClose}>
                                <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.5px]" /> Dashboard
                            </Link>
                            <Link href="/planner" aria-current={isActive('/planner') ? 'page' : undefined} className={navLinkClass('/planner')} onClick={onClose}>
                                <Calendar className="w-3.5 h-3.5 stroke-[1.5px]" /> Study Planner
                            </Link>
                            <Link href="/buildpilot" aria-current={isActive('/buildpilot') ? 'page' : undefined} className={navLinkClass('/buildpilot')} onClick={onClose}>
                                <Rocket className="w-3.5 h-3.5 stroke-[1.5px]" /> BuildPilot
                            </Link>
                            <Link href="/account" aria-current={isActive('/account') ? 'page' : undefined} className={navLinkClass('/account')} onClick={onClose}>
                                <CreditCard className="w-3.5 h-3.5 stroke-[1.5px]" /> Account
                            </Link>
                            <Link href="/generate" aria-current={isActive('/generate') ? 'page' : undefined} className={navLinkClass('/generate')} onClick={onClose}>

                                <Plus className="w-3.5 h-3.5 stroke-[1.5px]" /> New Goal
                            </Link>
                            <Link href="/explore" aria-current={isActive('/explore') ? 'page' : undefined} className={navLinkClass('/explore')} onClick={onClose}>
                                <Globe className="w-3.5 h-3.5 stroke-[1.5px]" /> Explore
                            </Link>
                            <Link href="/learn" aria-current={isActive('/learn') ? 'page' : undefined} className={navLinkClass('/learn')} onClick={onClose}>
                                <GraduationCap className="w-3.5 h-3.5 stroke-[1.5px]" /> Learn
                            </Link>
                            <Link href="/leaderboard" aria-current={isActive('/leaderboard') ? 'page' : undefined} className={navLinkClass('/leaderboard')} onClick={onClose}>
                                <Trophy className="w-3.5 h-3.5 stroke-[1.5px]" /> Global Rankings
                            </Link>
                            <Link href="/archive/exams/previous-year-papers" aria-current={isActive('/archive/exams/previous-year-papers') ? 'page' : undefined} className={navLinkClass('/archive/exams/previous-year-papers')} onClick={onClose}>
                                <Archive className="w-3.5 h-3.5 stroke-[1.5px]" /> Archives
                            </Link>
                            <Link href="/pricing" aria-current={isActive('/pricing') ? 'page' : undefined} className={navLinkClass('/pricing')} onClick={onClose}>
                                <CreditCard className="w-3.5 h-3.5 stroke-[1.5px]" /> Pricing
                            </Link>
                        </nav>

                        {/* Persistent Stats */}
                        {user && (
                            <div className="pt-3 border-t border-border dark:border-white/[0.05] space-y-0.5 px-0.5">
                                {[
                                    { label: 'Streak', val: `${stats.streak}d`, icon: Zap },
                                    { label: 'EulerCoins', val: stats.coins, icon: Coins },
                                    { label: 'Credits', val: stats.credits, icon: CreditCard },
                                    { label: 'Roadmaps', val: stats.roadmaps, icon: TrendingUp }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between px-2.5 py-1 text-[12px] font-medium text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="w-3.5 h-3.5 stroke-[1.5px]" />
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="font-bold text-text-heading inconsolata-ui">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Progress Section */}
                        {children && (
                            <div className="pt-3 border-t border-border dark:border-white/[0.05] space-y-3 px-2.5">
                                {children}
                            </div>
                        )}

                        {/* Information Section */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            <nav className="space-y-0.5" aria-label="Information navigation">
                                <Link href="/help" aria-current={isActive('/help') ? 'page' : undefined} className={navLinkClass('/help')} onClick={onClose}>
                                    <HelpCircle className="w-3.5 h-3.5 stroke-[1.5px]" /> Help Center
                                </Link>
                                <Link href="/settings" aria-current={isActive('/settings') ? 'page' : undefined} className={navLinkClass('/settings')} onClick={onClose}>
                                    <Settings className="w-3.5 h-3.5 stroke-[1.5px]" /> Settings
                                </Link>
                                <Link href="/terms" aria-current={isActive('/terms') ? 'page' : undefined} className={navLinkClass('/terms')} onClick={onClose}>
                                    <FileText className="w-3.5 h-3.5 stroke-[1.5px]" /> Terms
                                </Link>
                                <Link href="/privacy" aria-current={isActive('/privacy') ? 'page' : undefined} className={navLinkClass('/privacy')} onClick={onClose}>
                                    <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5px]" /> Privacy
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Account Section at the bottom */}
                {user && (
                    <div className="p-2.5 mt-auto relative" ref={menuRef}>
                        {isMenuOpen && (
                            <div className="absolute bottom-[calc(100%+6px)] left-2.5 right-2.5 bg-background dark:bg-[#111] border border-border dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-150 z-[80]">
                                <div className="px-3 py-1.5 border-b border-border dark:border-white/5 bg-sidebar/30 dark:bg-white/[0.01]">
                                    <p className="text-[9px] text-gray-400 lowercase tracking-tight">account</p>
                                    <p className="text-[11px] font-semibold text-black dark:text-white truncate">{user.email}</p>
                                </div>
                                <div className="p-1">
                                    {[
                                        { label: 'feedback', icon: MessageSquare, path: '/help' },
                                        { label: 'home page', icon: Home, path: '/' },
                                        { label: 'settings', icon: Settings, path: '/settings' },
                                    ].map((item) => (
                                        <button 
                                            key={item.label}
                                            className="flex items-center gap-2 w-full px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-sidebar dark:hover:bg-background/5 rounded transition-colors"
                                            onClick={() => { router.push(item.path); setIsMenuOpen(false); }}
                                        >
                                            <item.icon className="w-3 h-3 stroke-[1.5px]" /> 
                                            <span className="lowercase">{item.label}</span>
                                        </button>
                                    ))}
                                    <div className="h-px bg-sidebar dark:bg-white/5 my-1 mx-1" />
                                    <button 
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 w-full px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded transition-all"
                                    >
                                        <LogOut className="w-3 h-3 stroke-[1.5px]" /> 
                                        <span className="lowercase">sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div 
                            className="flex items-center justify-between gap-2 px-2 py-1.5 border border-border dark:border-white/10 rounded-lg hover:bg-sidebar dark:hover:bg-background/[0.02] transition-colors cursor-pointer group" 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded bg-sidebar dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/10 shrink-0 overflow-hidden">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover grayscale-[0.5]" />
                                    ) : (
                                        <User className="w-3 h-3 text-text-muted" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-text-heading truncate leading-none">
                                        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                                    </p>
                                    <p className={`text-[9px] lowercase tracking-tight mt-0.5 ${stats.isPro ? 'text-accent font-bold' : 'text-text-muted'}`}>
                                        eulerfold {stats.isPro ? 'pro' : 'free'}
                                    </p>
                                </div>
                            </div>
                            <MoreHorizontal className="w-3 h-3 text-text-muted" />
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
