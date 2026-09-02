import React from 'react';
import Link from 'next/link';
import { 
    Menu, X, ShieldCheck, AlertCircle, Lock, MoreVertical, 
    ArrowRight, Copy, LogIn, Globe, Plus 
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { HeaderFocusPill } from '@/components/grove/HeaderFocusPill';
import { DailyBriefingBell } from '@/components/goldfish/DailyBriefingBell';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';

interface RoadmapHeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
    successMsg: string | null;
    error: string | null;
    isOwner: boolean;
    roadmap: any;
    showActions: boolean;
    setShowActions: (v: boolean) => void;
    isAuthenticated: boolean;
    saving: boolean;
    handleContinueLearning: () => void;
    handleClone: () => void;
    handleSignIn: () => void;
    handleUpdateVisibility: (updates: { is_public?: boolean }) => void;
    isPro: boolean;
    setShowExtendModal: (v: boolean) => void;
    setIsGoldfishOpen: (v: boolean) => void;
}

export default function RoadmapHeader({
    isSidebarOpen,
    setIsSidebarOpen,
    successMsg,
    error,
    isOwner,
    roadmap,
    showActions,
    setShowActions,
    isAuthenticated,
    saving,
    handleContinueLearning,
    handleClone,
    handleSignIn,
    handleUpdateVisibility,
    isPro,
    setShowExtendModal,
    setIsGoldfishOpen
}: RoadmapHeaderProps) {
    return (
        <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
            <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 text-text-muted hover:text-text-heading transition-colors"
                        aria-label="Toggle sidebar"
                        title="Toggle Sidebar"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link className="flex items-center group shrink-0" href="/">
                        <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                    </Link>
                    
                    {(successMsg || error) && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 ml-2">
                            {successMsg && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span className="inconsolata-ui text-[10px] font-bold uppercase tracking-wider">{successMsg}</span>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-500">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="inconsolata-ui text-[10px] font-bold uppercase tracking-wider">{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {isOwner && roadmap && !roadmap.is_public && !roadmap.cloned_from && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold tracking-wide ml-2">
                            <Lock className="w-3 h-3" />
                            <span className="hidden sm:inline">Private</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <HeaderFocusPill />
                    <DailyBriefingBell />
                    <ThemeToggle />

                    <div className="relative">
                        <button 
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 hover:bg-callout-bg rounded-md transition-colors text-text-muted hover:text-text-heading border border-transparent hover:border-border"
                            title="More actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showActions && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)}></div>
                                <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-md shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 origin-top-right">
                                    <div className="py-1">
                                        {isAuthenticated ? (
                                            (isOwner || roadmap.is_cloned) ? (
                                                <button 
                                                    onClick={() => {
                                                        handleContinueLearning();
                                                        setShowActions(false);
                                                    }}
                                                    disabled={saving}
                                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-callout-bg text-text-heading font-medium text-[12px] disabled:opacity-50"
                                                >
                                                    <ArrowRight className="w-4 h-4 text-accent" />
                                                    <span>Continue Learning</span>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        handleClone();
                                                        setShowActions(false);
                                                    }}
                                                    disabled={saving}
                                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-callout-bg text-text-heading font-medium text-[12px] disabled:opacity-50"
                                                >
                                                    <Copy className="w-4 h-4 text-accent" />
                                                    <span>{saving ? 'Cloning...' : 'Clone to Dashboard'}</span>
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    handleSignIn();
                                                    setShowActions(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-callout-bg text-text-heading font-medium text-[12px]"
                                            >
                                                <LogIn className="w-4 h-4 text-accent" />
                                                <span>Sign In</span>
                                            </button>
                                        )}

                                        {isOwner && !roadmap.is_public && !roadmap.cloned_from && (
                                            <button 
                                                onClick={() => {
                                                    handleUpdateVisibility({ is_public: true });
                                                    setShowActions(false);
                                                }}
                                                disabled={saving}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-callout-bg text-teal-700 font-medium text-[12px] disabled:opacity-50 border-t border-border"
                                            >
                                                <Globe className="w-4 h-4" />
                                                <span>Make Public</span>
                                            </button>
                                        )}

                                        {isOwner && isPro && (roadmap.progress?.completed_topics || 0) >= (roadmap.progress?.total_topics || 1) && (roadmap.extension_count || 0) < 5 && (
                                            <button 
                                                onClick={() => {
                                                    setShowExtendModal(true);
                                                    setShowActions(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-emerald-500/5 text-emerald-600 font-medium text-[12px] border-t border-border"
                                            >
                                                <Plus className="w-4 h-4 text-emerald-500" />
                                                <div className="flex flex-col">
                                                    <span>Extend Roadmap</span>
                                                    <span className="text-[9px] text-emerald-600/60 font-bold uppercase">Pro Feature</span>
                                                </div>
                                            </button>
                                        )}

                                        {isOwner && (
                                            <button 
                                                onClick={() => {
                                                    setIsGoldfishOpen(true);
                                                    setShowActions(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-orange-500/10 text-orange-600 font-medium text-[12px] border-t border-border"
                                            >
                                                <GoldfishIcon variant="happy" className="w-5 h-5" />
                                                <div className="flex flex-col">
                                                    <span>Goldfish Co-Pilot</span>
                                                    <span className="text-[9px] text-orange-600/70 font-bold uppercase">Study Schedule & Resources</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
