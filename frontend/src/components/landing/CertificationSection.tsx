"use client";

import React from 'react';
import { Award, Linkedin, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '../EulerLogoCanvas';

export default function CertificationSection() {
    return (
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden bg-background border-y border-border/30">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    
                    {/* Left: Text Content */}
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-text-heading mb-6 tracking-tight leading-tight">
                            Earn official digital certificates.
                        </h2>
                        
                        <p className="text-[16px] md:text-[18px] text-text-primary mb-10 leading-relaxed font-medium">
                            Don't just learn a skill. Prove it. Finish any roadmap to get a secure, verifiable certificate that tracks your exact time invested and technical grade.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-sidebar border border-border flex items-center justify-center shrink-0 shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-bold text-text-heading mb-1">Cryptographically Verified</h4>
                                    <p className="text-[14px] text-text-muted leading-relaxed">Each certificate has a unique ID tied to your technical proofs and practice data.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-sidebar border border-border flex items-center justify-center shrink-0 shadow-sm">
                                    <Linkedin className="w-5 h-5 text-[#0a66c2]" />
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

                    {/* Right: Mockup / Visual */}
                    <div className="relative w-full aspect-[4/3] flex items-center justify-center" style={{ perspective: '1200px' }}>
                        {/* The Certificate Mockup */}
                        <motion.div 
                            initial={{ opacity: 0, rotateY: -15, scale: 0.9 }}
                            whileInView={{ opacity: 1, rotateY: -5, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="relative w-[95%] max-w-[500px] aspect-[1.414/1] bg-white rounded-xl shadow-2xl overflow-hidden border border-border/10 origin-center"
                            style={{ 
                                transform: 'rotateY(-5deg) rotateX(5deg)',
                                backgroundImage: `radial-gradient(circle at top right, rgba(15, 118, 110, 0.05) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(15, 118, 110, 0.03) 0%, transparent 40%)` 
                            }}
                        >
                            {/* Inner border */}
                            <div className="absolute inset-3 border-[2px] border-accent/10 rounded-lg pointer-events-none" />
                            <div className="absolute inset-4 border-[1px] border-accent/5 rounded pointer-events-none" />

                            <div className="p-6 sm:p-8 md:p-10 flex flex-col h-full relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md flex items-center justify-center">
                                           <EulerLogoCanvas size={32} />
                                        </div>
                                        <div>
                                            <div className="text-[18px] font-serif font-bold text-gray-900 leading-tight tracking-tight">EulerFold</div>
                                            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Certificate of Mastery</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-gray-400">ID: EF-8X92-PL4Q</div>
                                        <div className="text-[10px] font-mono text-gray-400">Issued: Aug 2026</div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="text-center my-auto">
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-medium">This certifies that</p>
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4 tracking-tight">Rohan Sharma</h3>
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-medium">has successfully completed</p>
                                    <p className="text-lg md:text-xl font-bold text-[#0F766E] font-inter px-4">Advanced Distributed Systems</p>
                                    
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[14px] font-bold text-gray-900">42</span>
                                            <span className="text-[9px] uppercase text-gray-500 font-bold">Hours</span>
                                        </div>
                                        <div className="w-px h-6 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[14px] font-bold text-gray-900">98%</span>
                                            <span className="text-[9px] uppercase text-gray-500 font-bold">Score</span>
                                        </div>
                                        <div className="w-px h-6 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[14px] font-bold text-gray-900">12</span>
                                            <span className="text-[9px] uppercase text-gray-500 font-bold">Projects</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer / Seal */}
                                <div className="flex justify-end items-end mt-auto">
                                    {/* Gold Seal Mockup */}
                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-lg flex items-center justify-center border-2 border-yellow-200 border-dashed">
                                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-100" />
                                        {/* Ribbons */}
                                        <div className="absolute -bottom-3 left-2 w-3 sm:w-4 h-6 bg-red-600 rounded-b shadow-sm -z-10 transform rotate-[15deg]"></div>
                                        <div className="absolute -bottom-3 right-2 w-3 sm:w-4 h-6 bg-red-600 rounded-b shadow-sm -z-10 transform -rotate-[15deg]"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
