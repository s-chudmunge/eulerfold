"use client";

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'eulerfold_github_star_dismissed';
const COOLDOWN_DAYS = 14;

export default function GitHubStarBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [starCount, setStarCount] = useState<string>('107.1K');

  useEffect(() => {
    try {
      const dismissedTime = localStorage.getItem(STORAGE_KEY);
      if (dismissedTime) {
        const elapsedDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
        if (elapsedDays < COOLDOWN_DAYS) {
          return;
        }
      }

      // Show banner after a polite 4-second delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);

      // Fetch live star count
      fetch('https://api.github.com/repos/s-chudmunge/eulerfold')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.stargazers_count === 'number' && data.stargazers_count > 0) {
            const count = data.stargazers_count;
            setStarCount(count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count.toString());
          }
        })
        .catch(() => {});

      return () => clearTimeout(timer);
    } catch (e) {
      // Ignore localStorage errors during SSR
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  };

  const handleStarClick = () => {
    handleDismiss();
    window.open('https://github.com/s-chudmunge/eulerfold', '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm bg-header border border-border rounded-lg shadow-2xl p-4 backdrop-blur-md"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-text-muted hover:text-text-heading transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-4">
            <div className="w-10 h-10 rounded-lg bg-sidebar border border-border/60 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 fill-current text-text-heading" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-inter text-[14px] font-bold text-text-heading">Star us on GitHub</h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold inconsolata-ui">
                  <Star className="w-2.5 h-2.5 fill-current" /> {starCount}
                </span>
              </div>
              <p className="manrope-body text-[12px] text-text-muted leading-relaxed mb-3">
                If EulerFold helps you learn, starring our repo supports our mission to build personalized education for everyone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStarClick}
                  className="flex-1 px-3 py-1.5 bg-text-heading text-background rounded-md text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Star on GitHub
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 bg-sidebar hover:bg-border/40 border border-border text-text-muted hover:text-text-heading rounded-md text-[12px] font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
