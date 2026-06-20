"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
    Hammer,
    Target,
    Microscope,
    Briefcase,
    Sparkles,
    Link2,
    BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { authAPI, roadmapsAPI, coinsAPI } from '@/lib/api';
import { useSettings } from './SettingsProvider';
import { useAuth } from '@/components/AuthProvider';
import VerifiedBadge from '@/components/VerifiedBadge';

interface SidebarProps {
    children?: React.ReactNode; // For page-specific slots like Telemetry or Stats
    header?: React.ReactNode;   // For page-specific headers like Profile info
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AppSidebar({ children, header, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const isActive = (path: string) => {
        if (path.includes('?')) {
            const [basePath, query] = path.split('?');
            if (pathname !== basePath) return false;
            const params = new URLSearchParams(query);
            for (const [key, value] of params.entries()) {
                if (searchParams.get(key) !== value) return false;
            }
            return true;
        }
        if (path === '/generate') {
            return pathname === '/generate' && (!searchParams.has('mode') || searchParams.get('mode') === 'ai');
        }
        return pathname === path;
    };
    const { openSettings } = useSettings();

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
                        </nav>

                        {/* Products */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            <span className="px-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] block mb-2 opacity-50">Products</span>
                            <nav className="space-y-0.5" aria-label="Products navigation">
                                <Link href="/research-lab" aria-current={isActive('/research-lab') ? 'page' : undefined} className={navLinkClass('/research-lab')} onClick={onClose}>
                                    <Microscope className="w-3.5 h-3.5 stroke-[1.5px]" /> 
                                    <span className="flex-1">Decode</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-accent text-white px-1 py-0.5 rounded leading-none shrink-0">New</span>
                                </Link>
                                <Link href="/planner" aria-current={isActive('/planner') ? 'page' : undefined} className={navLinkClass('/planner')} onClick={onClose}>
                                    <Calendar className="w-3.5 h-3.5 stroke-[1.5px]" /> Study Planner
                                </Link>

                                <Link href="/practice" aria-current={isActive('/practice') ? 'page' : undefined} className={navLinkClass('/practice')} onClick={onClose}>
                                    <Zap className="w-3.5 h-3.5 stroke-[1.5px]" /> Practice
                                </Link>
                            </nav>
                        </div>

                        {/* Create Your Learning Path */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            <span className="px-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] block mb-2 opacity-50">Create your learning path</span>
                            <nav className="space-y-0.5" aria-label="Generators navigation">
                                <Link href="/generate" aria-current={isActive('/generate') ? 'page' : undefined} className={navLinkClass('/generate')} onClick={onClose}>
                                    <Sparkles className="w-3.5 h-3.5 stroke-[1.5px]" /> AI Architect
                                </Link>
                                <Link href="/generate?mode=job" aria-current={isActive('/generate?mode=job') ? 'page' : undefined} className={navLinkClass('/generate?mode=job')} onClick={onClose}>
                                    <Briefcase className="w-3.5 h-3.5 stroke-[1.5px]" /> Job Decoded
                                </Link>
                                <Link href="/generate?mode=url" aria-current={isActive('/generate?mode=url') ? 'page' : undefined} className={navLinkClass('/generate?mode=url')} onClick={onClose}>
                                    <Link2 className="w-3.5 h-3.5 stroke-[1.5px]" /> From Link
                                </Link>
                                <Link href="/generate?mode=syllabus" aria-current={isActive('/generate?mode=syllabus') ? 'page' : undefined} className={navLinkClass('/generate?mode=syllabus')} onClick={onClose}>
                                    <BookOpen className="w-3.5 h-3.5 stroke-[1.5px]" /> Syllabus Parse
                                </Link>
                                <Link href="/generate?mode=gaps" aria-current={isActive('/generate?mode=gaps') ? 'page' : undefined} className={navLinkClass('/generate?mode=gaps')} onClick={onClose}>
                                    <Target className="w-3.5 h-3.5 stroke-[1.5px]" /> Skill Gap
                                </Link>
                            </nav>
                        </div>


                        {/* Progress Section */}
                        {children && (
                            <div className="pt-3 border-t border-border dark:border-white/[0.05] space-y-3 px-2.5">
                                {children}
                            </div>
                        )}

                        {/* Information & Settings */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            <nav className="space-y-0.5" aria-label="Information navigation">
                                <Link href="/pricing" aria-current={isActive('/pricing') ? 'page' : undefined} className={navLinkClass('/pricing')} onClick={onClose}>
                                    <CreditCard className="w-3.5 h-3.5 stroke-[1.5px]" /> Pricing
                                </Link>
                                <Link href="/help" aria-current={isActive('/help') ? 'page' : undefined} className={navLinkClass('/help')} onClick={onClose}>
                                    <HelpCircle className="w-3.5 h-3.5 stroke-[1.5px]" /> Help Center
                                </Link>
                                <button 
                                    onClick={() => { openSettings(); onClose?.(); }} 
                                    className={navLinkClass('/settings')}
                                >
                                    <Settings className="w-3.5 h-3.5 stroke-[1.5px]" /> Settings
                                </button>
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
                                    <button 
                                        className="flex items-center gap-2 w-full px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-sidebar dark:hover:bg-background/5 rounded transition-colors"
                                        onClick={() => { openSettings(); setIsMenuOpen(false); }}
                                    >
                                        <Settings className="w-3 h-3 stroke-[1.5px]" /> 
                                        <span className="lowercase">settings</span>
                                    </button>
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
                                    <img 
                                        src={(user?.metadata?.avatar_url?.includes('initials') ? null : user?.metadata?.avatar_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.display_name?.split(' ')[0] || user?.metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`} 
                                        alt="" 
                                        className="w-full h-full object-cover grayscale-[0.5]" 
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="text-[11px] font-semibold text-text-heading truncate leading-none">
                                            {user?.display_name?.split(' ')[0] || user?.metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                                        </p>
                                        {user?.is_pro && (
                                            <div className="flex items-center gap-0.5 px-1 py-[1px] rounded bg-accent/10 border border-accent/20">
                                                <VerifiedBadge size={10} className="shrink-0 text-accent" />
                                                <span className="text-[8px] font-bold text-accent tracking-wider leading-none mt-[1px]">PRO</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[9px] lowercase tracking-tight leading-none ${user?.is_pro ? 'text-accent font-bold' : 'text-text-muted'}`}>
                                        eulerfold {user?.is_pro ? 'pro' : 'free'}
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
