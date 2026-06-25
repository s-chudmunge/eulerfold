import React from 'react';
import { Award, Linkedin, Share2, ShieldCheck, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CertificationSection() {
    return (
        <section className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-background">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                    
                    {/* Text Content */}
                    <div className="w-full flex flex-col items-center text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-text-heading mb-6 tracking-tight leading-tight">
                            Earn official digital certificates.
                        </h2>
                        
                        <p className="text-[16px] md:text-[18px] text-text-primary mb-12 leading-relaxed font-medium max-w-2xl">
                            Don't just learn a skill. Prove it. Finish any roadmap to get a secure, verifiable certificate that tracks your exact time invested and technical grade.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                            <div className="flex flex-col items-start gap-4 p-8 bg-sidebar/30 border border-border rounded-2xl">
                                <div className="p-3 bg-background border border-border rounded-xl text-accent shadow-sm">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-bold text-text-heading mb-2">Cryptographically Verified</h4>
                                    <p className="text-[14px] text-text-muted leading-relaxed">Each certificate has a unique ID tied to your technical proofs and practice data.</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-start gap-4 p-8 bg-sidebar/30 border border-border rounded-2xl">
                                <div className="p-3 bg-background border border-border rounded-xl text-[#0a66c2] shadow-sm">
                                    <Linkedin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-bold text-text-heading mb-2">1-Click LinkedIn Integration</h4>
                                    <p className="text-[14px] text-text-muted leading-relaxed">Instantly add your verified credentials to the Licenses & Certifications section of your LinkedIn profile.</p>
                                </div>
                            </div>
                        </div>

                        <Link 
                            href="/generate"
                            className="mt-12 inline-flex items-center text-[15px] font-bold text-accent hover:opacity-80 transition-opacity gap-2 uppercase tracking-widest"
                        >
                            Start a Roadmap <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
