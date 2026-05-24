"use client";

import React, { useState, useEffect } from 'react';
import { 
    X, 
    ShieldCheck, 
    FileText, 
    AlertCircle, 
    ExternalLink,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface TOSModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function TOSModal({ isOpen, onAccept, onDecline }: TOSModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                setHasScrolledToBottom(true);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="w-full max-w-[500px] bg-sidebar border border-border shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 rounded-xl overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-sidebar/50">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <h2 className="text-[14px] font-bold text-text-heading tracking-tight">
                            Terms of Service
                        </h2>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted opacity-40 uppercase tracking-widest">
                        v1.0.2026
                    </span>
                </div>

                {/* Content */}
                <div 
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-8 manrope-body text-[13px] text-text-primary leading-relaxed space-y-8 scroll-smooth no-scrollbar"
                >
                    <section>
                        <h3 className="text-[13px] font-bold text-text-heading mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent" />
                            1. Platform Usage
                        </h3>
                        <p>
                            EulerFold is a tool designed to help you build and verify skill roadmaps. By using our services, you agree that your progress, roadmap titles, and "homework" submissions may be visible to other users if set to public. You are responsible for maintaining the confidentiality of your account.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-[13px] font-bold text-text-heading mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            2. Community Integrity
                        </h3>
                        <p>
                            To maintain the value of verified learning, you agree not to submit plagiarized work, AI-generated responses where original work is required, or irrelevant content. Repeated violations may result in the suspension of your "Verified" status.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-[13px] font-bold text-text-heading mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-accent" />
                            3. Data & Privacy
                        </h3>
                        <p>
                            We collect minimal data required to track your learning journey. This includes your email (for auth), username, and roadmap progress. We do not sell your data. For a full breakdown, please read our 
                            <Link href="/privacy" target="_blank" className="text-accent hover:underline inline-flex items-center gap-1 mx-1 font-semibold">
                                Privacy Policy <ExternalLink className="w-3 h-3" />
                            </Link>.
                        </p>
                    </section>

                    <div className="p-4 bg-background/50 border border-border rounded-lg">
                        <p className="text-[11px] text-text-muted italic">
                            Note: You must scroll to the end of the terms to enable the acceptance button.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 border-t border-border bg-sidebar/50 flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={onDecline}
                        className="flex-1 px-4 py-3 border border-border text-text-muted hover:text-text-heading hover:bg-background transition-all text-[12px] font-bold uppercase tracking-widest rounded-lg active:scale-[0.98]"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={onAccept}
                        disabled={!hasScrolledToBottom}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all text-[12px] font-bold uppercase tracking-widest rounded-lg active:scale-[0.98] ${
                            hasScrolledToBottom 
                            ? 'bg-text-heading text-background hover:opacity-90 shadow-lg' 
                            : 'bg-border/50 text-text-muted cursor-not-allowed opacity-50'
                        }`}
                    >
                        {hasScrolledToBottom && <Check className="w-3.5 h-3.5" />}
                        Accept Terms
                    </button>
                </div>
            </div>
        </div>
    );
}
