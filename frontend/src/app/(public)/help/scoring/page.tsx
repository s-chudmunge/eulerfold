'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, CheckCircle2, Shield, Zap, Target, BarChart3, Star } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ScoringPage() {
    return (
        <div className="bg-background text-text-primary selection:bg-teal-500/30 min-h-screen flex flex-col">
            <div className="border-b border-border bg-background/50 backdrop-blur-md sticky top-[68px] z-30">
                <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center">
                    <Link href="/help" className="flex items-center gap-2 text-[12px] font-bold text-text-muted hover:text-text-heading transition-colors uppercase tracking-widest group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Help Center
                    </Link>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-16 md:py-24">
                <section className="mb-24">
                    <h1 className="manrope-body text-4xl md:text-5xl font-black text-text-heading tracking-tight mb-8">
                        Scoring & Analysis
                    </h1>
                    <div className="space-y-6 manrope-body text-[16px] text-text-primary leading-relaxed font-medium max-w-2xl">
                        <p>
                            EulerFold operates on the principle of <strong>Honest Progress</strong>. Unlike traditional platforms that reward simple completion, we measure mastery through a multi-signal analysis engine.
                        </p>
                        <p className="opacity-80">
                            Your technical identity is a dynamic calculation of effort, quality, and retention. The system is intentionally rigorous, ensuring that a high confidence score represents industry-ready proficiency.
                        </p>
                    </div>
                </section>

                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="manrope-body text-[12px] font-bold text-text-muted uppercase tracking-[0.2em]">The Formula</h2>
                        <div className="h-px flex-1 bg-border opacity-50"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accent">
                                <Shield className="w-5 h-5" />
                                <h3 className="manrope-body text-[18px] font-bold text-text-heading uppercase tracking-tight">01. Project Proof (40%)</h3>
                            </div>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                The primary evidence of your skill. Every module ends with a "Proof of Work" challenge analyzed by specialized AI agents to check your technical quality and depth.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accent">
                                <Zap className="w-5 h-5" />
                                <h3 className="manrope-body text-[18px] font-bold text-text-heading uppercase tracking-tight">02. Recall Score (30%)</h3>
                            </div>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                Measures long-term memory transition. Daily retrieval practice sessions build this signal. Consistent performance keeps your score active, reflecting the natural decay of unused knowledge.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accent">
                                <Target className="w-5 h-5" />
                                <h3 className="manrope-body text-[18px] font-bold text-text-heading uppercase tracking-tight">03. Topic Coverage (15%)</h3>
                            </div>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                Tracks the breadth of your learning path. It ensures your technical identity reflects a comprehensive understanding of the subject's entire landscape.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accent">
                                <BarChart3 className="w-5 h-5" />
                                <h3 className="manrope-body text-[18px] font-bold text-text-heading uppercase tracking-tight">04. Cognitive Depth (15%)</h3>
                            </div>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                Assigns depth scores based on technical complexity. Mastering "Expert" level units focused on architecture grants significantly more weight than foundational units.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="manrope-body text-[12px] font-bold text-text-muted uppercase tracking-[0.2em]">Aggregation & Persistence</h2>
                        <div className="h-px flex-1 bg-border opacity-50"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="manrope-body text-[16px] font-bold text-text-heading">Cumulative Profiles</h3>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                Starting a new, more advanced roadmap builds upon your existing foundations rather than replacing them. The system merges evidence using a topic-weighted average.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="manrope-body text-[16px] font-bold text-text-heading">Persistent Analysis</h3>
                            <p className="manrope-body text-[15px] text-text-muted leading-relaxed font-medium">
                                Deleting a roadmap removes its specific data, but core skill records remain on your profile. The system recalculates scores based on remaining reviewed units.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-20">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="manrope-body text-[12px] font-bold text-text-muted uppercase tracking-[0.2em]">Proficiency Tiers</h2>
                        <div className="h-px flex-1 bg-border opacity-50"></div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 pb-8 border-b border-border">
                            <div className="w-24 shrink-0">
                                <span className="manrope-body text-3xl font-black text-emerald-500 tracking-tighter">A+ / A</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="manrope-body text-[16px] font-bold text-text-heading">Expertise (80% - 100%)</h4>
                                <p className="manrope-body text-[14px] text-text-muted font-medium">
                                    Requires perfect project passes on high-depth, production-grade material. Proven across multiple expert-level units.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 pb-8 border-b border-border">
                            <div className="w-24 shrink-0">
                                <span className="manrope-body text-3xl font-black text-blue-500 tracking-tighter">B / C</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="manrope-body text-[16px] font-bold text-text-heading">Advancing (40% - 79%)</h4>
                                <p className="manrope-body text-[14px] text-text-muted font-medium">
                                    Demonstrates professional competence. Learner has successfully built relevant projects and shows consistent retention.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                            <div className="w-24 shrink-0">
                                <span className="manrope-body text-3xl font-black text-text-muted tracking-tighter">F</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="manrope-body text-[16px] font-bold text-text-heading">Foundational (&lt;40%)</h4>
                                <p className="manrope-body text-[14px] text-text-muted font-medium">
                                    Initial exposure. Technical identity is in its early stages with limited reviewed evidence currently available.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="mt-40 pt-16 border-t border-border flex flex-col items-center text-center">
                    <h3 className="manrope-body text-[20px] font-black text-text-heading mb-4">Ready to prove your skills?</h3>
                    <Link href="/generate" className="inline-flex items-center gap-2.5 px-8 py-4 bg-text-heading text-background rounded-full font-bold text-[13px] uppercase tracking-[0.1em] hover:opacity-90 transition-all shadow-xl shadow-black/5">
                        Start your first roadmap <ArrowRight className="w-4 h-4" />
                    </Link>
                </footer>
            </main>
            <Footer />
        </div>
    );
}
