"use client"

import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const QUOTES = [
    { text: "EulerFold Research", author: "Academic Breakdowns" }
];

interface BannerProps {
    buttonText: string;
    href: string;
    align?: 'left' | 'right';
    currentQuote?: { text: string; author?: string };
    quoteIndex?: number;
    isStatic?: boolean;
    topClass?: string;
}

export const SideBanner = ({ buttonText, href, align, isStatic = false, topClass = "top-16 md:top-24" }: BannerProps) => {
    return (
        <Link href={href} className={isStatic ? "block w-full" : `absolute ${topClass} hidden 2xl:block z-10 ${
            align === 'left' ? 'right-full mr-10' : 'left-full ml-10'
        }`}>
            <div className={`flex flex-col bg-sidebar border border-border rounded-lg shadow-sm overflow-hidden group transition-all duration-300 hover:border-text-muted ${isStatic ? 'w-full h-[200px]' : 'w-[170px] h-[250px]'}`}>
                <div className="relative h-full w-full bg-sidebar flex flex-col items-center justify-center p-6">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <BookOpen className="w-8 h-8 text-accent mb-4 opacity-80" />
                        <h3 className="text-[14px] font-bold text-text-heading mb-2">Research Decoded</h3>
                        <p className="text-[12px] text-text-muted leading-relaxed">
                            Deep-dive technical breakdowns of complex AI papers.
                        </p>
                    </div>

                    <div className="flex items-center gap-1 text-[12px] font-bold text-accent group-hover:text-teal-700 transition-colors mt-auto pt-4 border-t border-border/40 w-full justify-center">
                        {buttonText}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function BrandedSideBanners({ topClass }: { topClass?: string }) {
    return (
        <>
            <SideBanner 
                align="left"
                buttonText="Planner"
                href="/dashboard"
                topClass={topClass}
            />
        </>
    );
}
