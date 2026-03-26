"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Compass, BookOpen, History } from 'lucide-react';
import RoadmapCanvas from '@/components/landing/RoadmapCanvas';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const redirectTo = next 
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
                : `${window.location.origin}/auth/callback`;

            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                    redirectTo
                }
            });
            if (error) {
                setError(error.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-black dark:text-white flex flex-col font-sans relative overflow-hidden">
            <RoadmapCanvas />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[340px] -mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-bold tracking-tight mb-2 manrope-body">
                            Welcome back
                        </h1>
                        <p className="text-gray-400 text-[12px] manrope-body font-medium">
                            Continue your learning journey.
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-fit px-8 py-2 bg-black dark:bg-white text-white dark:!text-black rounded-full font-bold text-[12px] manrope-body hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>{loading ? 'connecting...' : 'continue with google'}</span>
                        </button>
                        
                        {error && (
                            <p className="inconsolata-ui text-[10px] text-red-500 font-bold text-center uppercase tracking-tight">{error}</p>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-border dark:border-white/5 text-center flex flex-col items-center gap-6">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                            <Link 
                                href="/explore" 
                                className="inconsolata-ui text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                                <Compass className="w-3.5 h-3.5" />
                                Explore
                            </Link>
                            <Link 
                                href="/pricing" 
                                className="inconsolata-ui text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Pricing
                            </Link>
                            <Link 
                                href="/research-decoded" 
                                className="inconsolata-ui text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Research Decoded
                            </Link>
                            <Link 
                                href="/archive" 
                                className="inconsolata-ui text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                                <History className="w-3.5 h-3.5" />
                                Archive
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full px-6 py-8 flex justify-center relative z-10">
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 manrope-body opacity-50 lowercase tracking-tight flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    secure authentication via supabase
                </p>
            </footer>
        </div>
    );
}
