"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Intuition is the precursor of discovery.", author: "Leonhard Euler" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Master any subject with our step-by-step guides." },
    { text: "Excellence is not an act, but a habit.", author: "Aristotle" },
    { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein" },
    { text: "Mathematics is the queen of the sciences.", author: "C.F. Gauss" },
    { text: "Track all your skills on a single dashboard." },
    { text: "Everything is theoretically impossible, until it is done.", author: "Robert Heinlein" },
    { text: "Discovery consists of thinking what nobody has thought.", author: "A. Szent-Györgyi" },
    { text: "Stay on track with a personal study planner." },
    { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "F.D. Roosevelt" },
    { text: "Simple breakdowns of complex research papers." },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
];

interface BannerProps {
    buttonText: string;
    href: string;
    align: 'left' | 'right';
    currentQuote: { text: string; author?: string };
    quoteIndex: number;
}

const SideBanner = ({ buttonText, href, align, currentQuote, quoteIndex }: BannerProps) => {
    return (
        <Link href={href} className={`absolute top-16 md:top-24 hidden 2xl:block z-10 ${
            align === 'left' ? 'right-full mr-16' : 'left-full ml-16'
        }`}>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex flex-col w-[170px] h-[650px] bg-background border-none rounded-lg shadow-sm overflow-hidden group transition-all duration-500 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent),linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect]"
            >
                {/* Full Height Gradient Container */}
                <div className="relative h-full w-full prism-striped-gradient flex flex-col items-center pt-20 pb-16 px-6">
                    {/* Quote Area - Uniform serif font */}
                    <div className="flex-1 flex flex-col justify-center text-center relative w-full z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={quoteIndex}
                                initial={{ opacity: 0, x: align === 'left' ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: align === 'left' ? 10 : -10 }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                <p className="serif-content text-[13px] italic font-medium text-text-primary leading-relaxed">
                                    "{currentQuote.text}"
                                </p>
                                {currentQuote.author && (
                                    <p className="mt-8 serif-content text-[11px] font-medium text-text-secondary tracking-wide">
                                        — {currentQuote.author}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Integrated Button - Positioned at the bottom of gradient */}
                    <div className="flex items-center gap-1 serif-content text-[11px] font-bold text-text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors z-10 mt-auto">
                        {buttonText}
                        <ArrowRight className="w-2 h-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default function BrandedSideBanners() {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 60000); // Very slow rotation: every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const currentQuote = QUOTES[quoteIndex];

    return (
        <>
            {/* Left Banner: Study Planner */}
            <SideBanner 
                align="left"
                buttonText="Planner"
                href="/dashboard"
                currentQuote={currentQuote}
                quoteIndex={quoteIndex}
            />

            {/* Right Banner: Research Decoded */}
            <SideBanner 
                align="right"
                buttonText="Research"
                href="/research-decoded"
                currentQuote={currentQuote}
                quoteIndex={quoteIndex}
            />
        </>
    );
}
