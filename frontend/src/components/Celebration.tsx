"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface CelebrationProps {
    show: boolean;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export default function Celebration({ show, title = "Success!", subtitle, icon }: CelebrationProps) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[500] pointer-events-none overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    {/* Confetti Fountain Explosion */}
                    {[...Array(60)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute z-0"
                            style={{
                                width: Math.random() > 0.5 ? '8px' : '14px',
                                height: Math.random() > 0.5 ? '8px' : '14px',
                                backgroundColor: ['#0F766E', '#14B8A6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'][i % 7],
                                borderRadius: i % 3 === 0 ? '50%' : '2px', // mix of circles and squares
                            }}
                            initial={{ 
                                x: 0, 
                                y: 0, 
                                scale: 0,
                                opacity: 1
                            }}
                            animate={{
                                x: (Math.random() - 0.5) * 1000, // Wide spread
                                y: [0, -300 - Math.random() * 400, 800], // Shoot up then fall down
                                scale: [0, 1, 1, 0],
                                rotate: [0, Math.random() * 1080 - 540], // Crazy spinning
                            }}
                            transition={{
                                duration: 3.5 + Math.random() * 2,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                    
                    {/* Success Message Card */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 20, 
                            mass: 0.8 
                        }}
                        className="relative z-10 bg-background/95 backdrop-blur-xl border border-accent/20 p-8 rounded-lg shadow-[0_0_60px_-15px_rgba(15,118,110,0.4)] text-center pointer-events-auto max-w-[340px] w-full mx-4"
                    >
                        {/* Glow effect behind icon */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
                        
                        <motion.div 
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 10 }}
                            className="relative z-10 w-16 h-16 bg-gradient-to-tr from-teal-700 to-teal-400 text-white rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-900/20"
                        >
                            {icon || <ShieldCheck className="w-8 h-8 drop-shadow-sm" />}
                        </motion.div>
                        
                        <h3 className="inconsolata-ui text-2xl font-bold text-text-heading mb-3 tracking-tight">
                            {title}
                        </h3>
                        
                        {subtitle && (
                            <p className="manrope-body text-[14px] text-text-muted font-medium leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
