"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PagePreloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-xs px-6">
        <div className="flex items-center gap-3 mb-2 opacity-80">
          <img src="/apple-touch-icon.png" alt="" className="w-8 h-8 animate-pulse" />
          <span className="text-xl font-bold text-text-heading tracking-tight">Euler<span className="text-teal-700">Fold</span></span>
        </div>
        
        <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-full bg-accent relative rounded-full shadow-[0_0_10px_var(--accent)]"
          >
            <div className="absolute right-0 top-0 h-full w-20 shadow-[0_0_10px_var(--accent),0_0_5px_var(--accent)] rounded-full opacity-80 mix-blend-screen" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
