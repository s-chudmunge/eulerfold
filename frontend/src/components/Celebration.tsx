"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CelebrationProps {
    show: boolean;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export default function Celebration({ show, title = "Success!", subtitle, icon }: CelebrationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] pointer-events-none overflow-hidden"
                >
                    {/* Confetti Particles */}
                    {[...Array(40)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-sm"
                            style={{
                                backgroundColor: ['#0F766E', '#14B8A6', '#F59E0B', '#10B981', '#3B82F6'][i % 5],
                                left: `${Math.random() * 100}%`,
                                top: `-5%`,
                            }}
                            animate={{
                                top: '105%',
                                left: `${(Math.random() * 100) + (Math.random() - 0.5) * 40}%`,
                                rotate: 360 * 2,
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                ease: "easeOut",
                                delay: Math.random() * 0.5,
                            }}
                        />
                    ))}
                    
                    {/* Success Message Card */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: -10 }}
                            className="bg-background/95 backdrop-blur-md border border-border p-8 rounded-lg shadow-2xl text-center pointer-events-auto max-w-[320px] w-full"
                        >
                            <div className="w-16 h-16 bg-accent/10 text-accent rounded-md flex items-center justify-center mx-auto mb-5 border border-accent/20">
                                {icon || <ShieldCheck className="w-8 h-8" />}
                            </div>
                            <h3 className="inconsolata-ui text-xl font-bold text-text-heading mb-2 tracking-tight">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="manrope-body text-[13px] text-text-muted font-medium italic leading-relaxed">
                                    {subtitle}
                                </p>
                            )}

                            <div className="mt-6 pt-4 border-t border-border/50">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/5 border border-accent/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    <span className="inconsolata-ui text-[9px] font-bold text-accent uppercase tracking-widest">EulerFold Verified</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
