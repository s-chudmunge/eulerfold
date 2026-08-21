"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BrainCircuit, Waypoints, LayoutDashboard, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Calendar, Globe, GraduationCap, Trophy, HelpCircle, Plus, FileText, ShieldCheck, Settings, LogOut, User, MoreHorizontal, MessageSquare, Home, Zap, Coins, TrendingUp, Archive, CreditCard, Hammer, Target, Microscope, Briefcase, Sparkles, Link2, BookOpen, Sun, Moon, Compass, Library, Activity } from 'lucide-react';
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

function SearchParamsHandler({ onParamsChange }: { onParamsChange: (params: URLSearchParams) => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        onParamsChange(searchParams);
    }, [searchParams, onParamsChange]);
    return null;
}

export default function AppSidebar({ children, header, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
    const router = useRouter();
    const { user } = useAuth();
    
    
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('eulerfold-sidebar-collapsed');
            if (saved === 'true') {
                setIsCollapsed(true);
            }
        }
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('eulerfold-sidebar-collapsed', String(next));
    };

    const [theme, setTheme] = useState('light');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('eulerfold-theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            setTheme(storedTheme);
        }
    }, []);

    const toggleTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('eulerfold-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };
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
            if (!searchParams) return false;
            const params = new URLSearchParams(query);
            for (const [key, value] of params.entries()) {
                if (searchParams.get(key) !== value) return false;
            }
            return true;
        }
        if (path === '/generate') {
            if (!searchParams) return pathname === '/generate';
            return pathname === '/generate' && (!searchParams.has('mode') || searchParams.get('mode') === 'ai');
        }
        return pathname === path;
    };
    const { openSettings } = useSettings();
    
            const navLinkClass = (path: string) => {
        const active = isActive(path);
        return `
            flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-2.5 text-[13px] transition-all
            ${active 
                ? 'text-accent font-bold bg-accent/[0.08] border-l-4 border-accent' 
                : 'text-text-muted hover:text-text-heading hover:bg-background/40 border-l-4 border-transparent font-medium'
            }
        `;
    };

    return (
        <>
            <Suspense fallback={null}>
                <SearchParamsHandler onParamsChange={setSearchParams} />
            </Suspense>
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
                lg:translate-x-0 lg:static ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[230px]'} lg:z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col h-full overflow-hidden shrink-0
            `}>
                <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">


                    <div className="px-4 py-4">
                        <Link href="/#hero-prompt-input" onClick={onClose} className="w-full bg-accent text-white flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-[13px] shadow-sm hover:bg-teal-700 transition-colors">
                            <Plus className="w-4 h-4" /> {isCollapsed ? null : <span>New Goal</span>}
                        </Link>
                    </div>

                    <div className="p-3 mb-1 h-[48px] shrink-0 lg:hidden">
                    </div>

                    <div className="space-y-2 pt-2">
                        {/* Primary Operations */}
                        <nav className="space-y-0.5" aria-label="Operations navigation">
                            <Link href="/dashboard" aria-current={isActive('/dashboard') ? 'page' : undefined} className={navLinkClass('/dashboard')} onClick={onClose}>
                                <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Dashboard</span>}
                            </Link>
                            <Link href="/explore" aria-current={isActive('/explore') ? 'page' : undefined} className={navLinkClass('/explore')} onClick={onClose}>
                                <Globe className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Explore</span>}
                            </Link>
                            <Link href="/learn" aria-current={isActive('/learn') ? 'page' : undefined} className={navLinkClass('/learn')} onClick={onClose}>
                                <GraduationCap className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Learn</span>}
                            </Link>
                            <Link href="/leaderboard" aria-current={isActive('/leaderboard') ? 'page' : undefined} className={navLinkClass('/leaderboard')} onClick={onClose}>
                                <Trophy className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">Global Rankings</span>}
                            </Link>
                            <Link href="/archive/exams/previous-year-papers" aria-current={isActive('/archive/exams/previous-year-papers') ? 'page' : undefined} className={navLinkClass('/archive/exams/previous-year-papers')} onClick={onClose}>
                                <Archive className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Archives</span>}
                            </Link>
                        </nav>

                        {/* Products */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            {isCollapsed ? null : <span className="px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 mt-4 opacity-60">Products</span>}
                            <nav className="space-y-0.5" aria-label="Products navigation">
                                <Link href="/planner" aria-current={isActive('/planner') ? 'page' : undefined} className={navLinkClass('/planner')} onClick={onClose}>
                                    <Calendar className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">Study Planner</span>}
                                </Link>

                                
                            </nav>
                        </div>

                        {/* Create Your Course */}
                        <div className="pt-3 border-t border-border dark:border-white/[0.05]">
                            {isCollapsed ? null : <span className="px-5 text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 mt-4 opacity-60">Create your course</span>}
                            <nav className="space-y-0.5" aria-label="Generators navigation">
                                <Link href="/#hero-prompt-input" aria-current={isActive('/generate') ? 'page' : undefined} className={navLinkClass('/generate')} onClick={onClose}>
                                    <Waypoints className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">AI Architect</span>}
                                </Link>
                                <Link href="/#hero-prompt-input" aria-current={isActive('/generate?mode=job') ? 'page' : undefined} className={navLinkClass('/generate?mode=job')} onClick={onClose}>
                                    <Compass className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">Job Decoded</span>}
                                </Link>
                                <Link href="/#hero-prompt-input" aria-current={isActive('/generate?mode=url') ? 'page' : undefined} className={navLinkClass('/generate?mode=url')} onClick={onClose}>
                                    <Globe className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">From Link</span>}
                                </Link>
                                <Link href="/#hero-prompt-input" aria-current={isActive('/generate?mode=syllabus') ? 'page' : undefined} className={navLinkClass('/generate?mode=syllabus')} onClick={onClose}>
                                    <Library className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">Syllabus Parse</span>}
                                </Link>
                                <Link href="/#hero-prompt-input" aria-current={isActive('/generate?mode=gaps') ? 'page' : undefined} className={navLinkClass('/generate?mode=gaps')} onClick={onClose}>
                                    <Target className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Skill Gap</span>}
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
                                    <CreditCard className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Pricing</span>}
                                </Link>
                                <Link href="/help" aria-current={isActive('/help') ? 'page' : undefined} className={navLinkClass('/help')} onClick={onClose}>
                                    <HelpCircle className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span className="truncate">Help Center</span>}
                                </Link>
                                <button 
                                    onClick={() => { openSettings(); onClose?.(); }} 
                                    className={navLinkClass('/settings')}
                                >
                                    <Settings className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Settings</span>}
                                </button>
                                <Link href="/terms" aria-current={isActive('/terms') ? 'page' : undefined} className={navLinkClass('/terms')} onClick={onClose}>
                                    <FileText className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Terms</span>}
                                </Link>
                                <Link href="/privacy" aria-current={isActive('/privacy') ? 'page' : undefined} className={navLinkClass('/privacy')} onClick={onClose}>
                                    <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5px]" /> {isCollapsed ? null : <span>Privacy</span>}
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
                                {isCollapsed ? null : (<div className="min-w-0">
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
                                </div>)}
                            </div>
                            {isCollapsed ? null : <MoreHorizontal className="w-3 h-3 text-text-muted" />}
                        </div>
                    </div>
                )}

                <div className="px-4 py-2 mt-auto border-t border-border dark:border-white/5">
                    <button 
                        onClick={toggleCollapse}
                        className={`flex items-center justify-center p-2 rounded-lg text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden lg:flex ${isCollapsed ? 'w-full' : ''}`}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </button>
                </div>
            </aside>
        </>
    );
}
