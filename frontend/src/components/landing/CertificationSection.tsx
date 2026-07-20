"use client";

import React from 'react';
import { Linkedin, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CertificationSection() {
    return (
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden bg-background border-y border-border/30">
            <div className="max-w-2xl mx-auto text-center">

                <h2 className="text-4xl md:text-5xl font-bold text-text-heading mb-6 tracking-tight leading-[1.15]">
                    Don't just learn a skill.{' '}
                    <br className="hidden md:block" />
                    <span className="font-serif italic text-accent opacity-90 text-[44px] md:text-[56px] tracking-normal font-medium">Prove it.</span>
                </h2>
                
                <p className="text-[16px] md:text-[18px] text-text-muted mb-12 leading-relaxed font-medium max-w-xl mx-auto">
                    Finish any course to get a secure, verifiable certificate that tracks your exact time invested and technical grade.
                </p>

                <div className="space-y-6 text-left max-w-lg mx-auto">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h4 className="text-[16px] font-bold text-text-heading mb-1">Detailed Skill Breakdown</h4>
                            <p className="text-[14px] text-text-muted leading-relaxed">Your certificate highlights the exact technical concepts you've mastered and your assessment scores.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <Linkedin className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h4 className="text-[16px] font-bold text-text-heading mb-1">1-Click LinkedIn Integration</h4>
                            <p className="text-[14px] text-text-muted leading-relaxed">Instantly add your verified credentials to the Licenses & Certifications section of your LinkedIn profile.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <Link 
                        href="/generate"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[14px] font-bold text-white bg-accent hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Start Earning <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
