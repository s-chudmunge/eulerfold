'use client';

import React from 'react';
import Link from 'next/link';
import { Inconsolata, Manrope } from 'next/font/google';
import { ChevronLeft } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';

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

export default function ScoringPage() {
    return (
        <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 overflow-hidden`}>
            <header className="inconsolata-ui border-b border-border h-[48px] flex items-center px-6 shrink-0 bg-background z-50">
                <Link href="/help" className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back
                </Link>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <AppSidebar isOpen={false} onClose={() => {}} />
                
                <main className="flex-1 overflow-y-auto h-full scroll-smooth">
                    <div className="max-w-[700px] mx-auto px-6 py-20">
                        
                        <section className="mb-24">
                            <h1 className="inconsolata-ui text-4xl font-bold text-text-heading uppercase tracking-tighter mb-8">
                                Scoring & Verification
                            </h1>
                            <div className="space-y-6 manrope-body text-[15px] text-text-primary leading-relaxed">
                                <p>
                                    EulerFold operates on the principle of <strong>Honest Progress</strong>. Unlike traditional platforms that reward completion, we measure mastery through a multi-signal verification engine. Your technical identity is a dynamic calculation of effort, quality, and retention.
                                </p>
                                <p>
                                    The system is designed to be intentionally rigorous. Achieving a high confidence score requires not just finishing modules, but proving your ability to a Senior Auditor through high-quality project evidence and consistent retrieval performance.
                                </p>
                            </div>
                        </section>

                        <section className="mb-24">
                            <h2 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.25em] mb-10 pb-2 border-b border-border">The Formula</h2>
                            <div className="space-y-12">
                                <div>
                                    <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase mb-4">01. Project Proof (40%)</h3>
                                    <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                                        This is the primary evidence of your skill. Every module ends with a specific "Proof of Work" challenge. Submissions are audited by the <strong>Audit Senate</strong>—a committee of three specialized AI agents (The Technician, The Educator, and The Relevance Judge) who independently vote on your work. This ensures a balanced evaluation of technical depth, authentic understanding, and objective alignment. A consensus pass is required to verify the skill.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase mb-4">02. Recall Score (30%)</h3>
                                    <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                                        Skill without retention is fleeting. We use retrieval practice sessions to measure how much information has transitioned into your long-term memory. Your performance in these sessions determines your Recall Score. Consistent daily wins build this signal, while long periods of inactivity will cause it to stagnate, reflecting the natural decay of unused knowledge.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase mb-4">03. Topic Coverage (15%)</h3>
                                    <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                                        This measures the breadth of your learning path. It tracks the volume of technical topics you have successfully completed. While secondary to project quality, it ensures that your technical identity reflects a comprehensive understanding of the subject's entire landscape rather than just isolated concepts.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase mb-4">04. Cognitive Depth (15%)</h3>
                                    <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                                        Not all learning is equal. Our engine assigns a depth score (1.0 to 5.0) to every roadmap based on its technical complexity. Mastering an "Expert" level unit focused on architecture and optimization grants significantly more weight than a "Foundational" unit. This rewards you for tackling the hardest 10% of a skill domain.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-24">
                            <h2 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.25em] mb-10 pb-2 border-b border-border">Aggregation & Persistence</h2>
                            <div className="space-y-6 manrope-body text-[14px] text-text-primary leading-relaxed">
                                <p>
                                    Your profile is <strong>Cumulative</strong>. If you complete multiple roadmaps for the same skill, the system intelligently merges them using a topic-weighted average. This prevents "profile fragmentation" and ensures that starting a new, more advanced roadmap builds upon your existing foundations rather than replacing them.
                                </p>
                                <p>
                                    Technical identity is also <strong>Persistent</strong>. Deleting a roadmap from your dashboard will remove its specific data, but the core skill record remains on your profile. The system will automatically recalculate your score based on your remaining verified units, ensuring that your verified expertise is never accidentally lost.
                                </p>
                            </div>
                        </section>

                        <section className="mb-20">
                            <h2 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.25em] mb-10 pb-2 border-b border-border">The Letter Grades</h2>
                            <div className="grid grid-cols-1 gap-8">
                                <div className="flex justify-between items-start gap-10">
                                    <span className="inconsolata-ui text-2xl font-black text-emerald-500">A+ / A</span>
                                    <p className="manrope-body text-[13px] text-text-muted max-w-md">
                                        <strong>Expertise (80% - 100%)</strong>. Requires perfect project passes on high-depth, production-grade material. Reserved for those who have proven themselves across multiple expert-level units.
                                    </p>
                                </div>
                                <div className="flex justify-between items-start gap-10">
                                    <span className="inconsolata-ui text-2xl font-black text-blue-500">B / C</span>
                                    <p className="manrope-body text-[13px] text-text-muted max-w-md">
                                        <strong>Advancing (40% - 79%)</strong>. Demonstrates professional competence. The learner has successfully built several relevant projects and shows consistent retention of core concepts.
                                    </p>
                                </div>
                                <div className="flex justify-between items-start gap-10">
                                    <span className="inconsolata-ui text-2xl font-black text-gray-400">F</span>
                                    <p className="manrope-body text-[13px] text-text-muted max-w-md">
                                        <strong>Foundational (&lt;40%)</strong>. Represents initial exposure. The technical identity is in its early stages, with limited verified evidence currently available on the profile.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <footer className="mt-32 pt-12 border-t border-border text-center">
                            <Link href="/generate" className="inconsolata-ui text-[11px] font-bold text-accent hover:text-text-heading transition-colors uppercase tracking-[0.3em]">
                                Build Your technical identity
                            </Link>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
