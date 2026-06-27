"use client";

import React from 'react';
import { Linkedin, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CertificationSection() {
    return (
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden bg-background border-y border-border/30">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-text-heading mb-6 tracking-tight leading-tight">
                    Earn Official Digital Certificates
                </h2>
                
                <p className="text-[16px] md:text-[18px] text-text-primary mb-10 leading-relaxed font-medium">
                    Don't just learn a skill. Prove it. Finish any roadmap to get a secure, verifiable certificate that tracks your exact time invested and technical grade.
                </p>

                <div className="space-y-6 text-left max-w-lg mx-auto">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h4 className="text-[16px] font-bold text-text-heading mb-1">Cryptographically Verified</h4>
                            <p className="text-[14px] text-text-muted leading-relaxed">Each certificate has a unique ID tied to your technical proofs and practice data.</p>
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
