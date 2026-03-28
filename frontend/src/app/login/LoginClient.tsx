"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Github, Mail } from 'lucide-react';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next');

    const getRedirectUrl = () => {
        return next 
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
            : `${window.location.origin}/auth/callback`;
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                    redirectTo: getRedirectUrl()
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

    const handleGitHubLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'github',
                options: {
                    redirectTo: getRedirectUrl()
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

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: getRedirectUrl(),
                    }
                });
                if (error) throw error;
                setError('Verification link sent! You can close this tab and check your email to verify your account and access your dashboard.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push(next || '/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-teal-500/30 overflow-y-auto overflow-x-hidden scroll-smooth relative">

            <main className="min-h-screen flex flex-col items-center justify-center p-6 py-20">
                <div className="w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">

                    {/* Branding */}
                    <div className="mb-10 flex flex-col items-center">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <img src="/logo_with_text.png" alt="EulerFold" className="h-16 w-auto" />
                        </Link>
                    </div>

                    {/* Text */}
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-bold tracking-tight mb-2 manrope-body text-text-heading">
                            {isSignUp ? 'Create your account' : 'Welcome back'}
                        </h1>
                        <p className="text-text-muted text-[13px] manrope-body font-medium">
                            {isSignUp ? 'Start your learning journey today.' : 'Continue your learning journey.'}
                        </p>
                    </div>

                    {/* Login Options */}
                    <div className="flex flex-col items-center space-y-3 w-full">
                        {!showEmailLogin ? (
                            <>
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full h-11 bg-white dark:bg-white/[0.03] text-text-primary border border-border rounded-xl font-bold text-[12px] manrope-body hover:bg-sidebar transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>

                                <button
                                    onClick={handleGitHubLogin}
                                    disabled={loading}
                                    className="w-full h-11 bg-sidebar text-text-primary border border-border rounded-xl font-bold text-[12px] manrope-body hover:bg-callout-bg transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>Continue with GitHub</span>
                                </button>

                                <button
                                    onClick={() => setShowEmailLogin(true)}
                                    className="w-full h-11 bg-transparent text-text-muted hover:text-text-primary rounded-xl font-bold text-[12px] manrope-body transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Continue with email</span>
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleEmailLogin} className="w-full space-y-3">
                                <div className="space-y-2">
                                    {isSignUp && (
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={isSignUp}
                                            className="w-full px-4 h-11 bg-sidebar/50 border border-border rounded-xl text-[13px] manrope-body focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                        />
                                    )}
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 h-11 bg-sidebar/50 border border-border rounded-xl text-[13px] manrope-body focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 h-11 bg-sidebar/50 border border-border rounded-xl text-[13px] manrope-body focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-text-heading text-background rounded-xl font-bold text-[12px] manrope-body hover:opacity-90 transition-all disabled:opacity-50 shadow-sm active:scale-[0.98]"
                                >
                                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                                </button>
                                
                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest transition-colors h-8"
                                    >
                                        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailLogin(false)}
                                        className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors h-8"
                                    >
                                        Back to social login
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        {error && (
                            <p className="inconsolata-ui text-[10px] text-red-500 font-bold text-center uppercase tracking-tight max-w-[280px] pt-2 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}

                        <p className="text-[10px] text-text-muted/40 manrope-body text-center pt-4 px-4 leading-relaxed">
                            By continuing, you agree to our <Link href="/terms" className="underline hover:text-text-muted transition-colors">Terms</Link> and <Link href="/privacy" className="underline hover:text-text-muted transition-colors">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </main>

            {/* Same Footer as Landing Page */}
            <footer className="w-full px-6 py-12 border-t border-border bg-background mt-auto">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
                    <div className="col-span-2 md:col-span-1 flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity grayscale">
                            <img src="/apple-touch-icon.png" alt="" className="w-3.5 h-3.5" />
                            <span className="font-semibold text-[11px] tracking-tight inconsolata-ui text-black dark:text-white">EulerFold</span>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30 uppercase tracking-widest">Website</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/dashboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
                            <Link href="/login" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Sign in</Link>
                            <Link href="/explore" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Explore</Link>
                            <Link href="/generate" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Generate</Link>
                            <Link href="/learn" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Learn</Link>
                            <Link href="/pricing" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
                            <Link href="/leaderboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Leaderboard</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30 uppercase tracking-widest">Resources</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/research-decoded" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Research</Link>
                            <Link href="/help" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Help center</Link>
                            <Link href="/settings" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Settings</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30 uppercase tracking-widest">Company</h4>
                        <div className="flex flex-col gap-1">
                            <Link href="/terms" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Terms of service</Link>
                            <Link href="/privacy" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30 uppercase tracking-widest">Social</h4>
                        <div className="flex flex-col gap-1">
                            <a href="mailto:hello@eulerfold.com" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Contact support</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[9px] font-medium text-gray-400 inconsolata-ui opacity-50">
                        © {new Date().getFullYear()} EulerFold.
                    </p>
                    <p className="text-[10px] font-medium text-text-muted manrope-body opacity-30 lowercase tracking-tight flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" />
                        secure authentication via supabase
                    </p>
                </div>
            </footer>
        </div>
    );
}
