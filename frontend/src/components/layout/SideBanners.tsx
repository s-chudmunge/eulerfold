"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const QUOTES = [
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
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
    { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
    { text: "Nature is written in mathematical language.", author: "Galileo Galilei" },
    { text: "Consistency beats intensity in the long run." },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "Don't just read the papers, understand the intuition behind them." },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "If I have seen further it is by standing on the shoulders of Giants.", author: "Isaac Newton" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" }
];

interface BannerProps {
    buttonText: string;
    href: string;
    align?: 'left' | 'right';
    currentQuote: { text: string; author?: string };
    quoteIndex: number;
    isStatic?: boolean;
    topClass?: string;
}

export const SideBanner = ({ buttonText, href, align, currentQuote, quoteIndex, isStatic = false, topClass = "top-16 md:top-24" }: BannerProps) => {
    const containerClasses = isStatic 
        ? "flex flex-col w-full h-[350px] bg-background border border-border/10 rounded-lg shadow-sm overflow-hidden group transition-all duration-500 [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent),linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect]"
        : `flex flex-col w-[170px] h-[400px] bg-background border-none rounded-lg shadow-sm overflow-hidden group transition-all duration-500 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent),linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect]`;

    return (
        <Link href={href} className={isStatic ? "block w-full" : `absolute ${topClass} hidden 2xl:block z-10 ${
            align === 'left' ? 'right-full mr-10' : 'left-full ml-10'
        }`}>
            <motion.div 
                initial={isStatic ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className={containerClasses}
            >
                {/* Full Height Gradient Container */}
                <div className="relative h-full w-full prism-striped-gradient flex flex-col items-center pt-16 pb-12 px-6">
                    {/* Texture Layer */}
                    <div className="prism-striped-gradient-noise" />

                    {/* Quote Area - Uniform serif font */}
                    <div className="flex-1 flex flex-col justify-center text-center relative w-full z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={quoteIndex}
                                initial={isStatic ? { opacity: 0, y: 5 } : { opacity: 0, x: align === 'left' ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={isStatic ? { opacity: 0, y: -5 } : { opacity: 0, x: align === 'left' ? 10 : -10 }}
                                transition={{ duration: isStatic ? 0.8 : 2.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                <p className="serif-content text-[13px] italic font-medium text-text-primary leading-relaxed">
                                    "{currentQuote.text}"
                                </p>
                                {currentQuote.author && (
                                    <p className="mt-6 serif-content text-[11px] font-medium text-text-secondary tracking-wide">
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
        // Randomize on mount to avoid hydration mismatch while ensuring a fresh quote
        setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

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
        </>
    );
}
