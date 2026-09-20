'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Sparkles, X, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SpecialAwardModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    const email = user.email?.toLowerCase();
    const hasTargetEmail = email === 'fauxfaux667@gmail.com' || email === 'arnavsrivastava6367@gmail.com';
    const award = user.metadata?.special_award;

    if (hasTargetEmail || (award && award.active)) {
      // Check if already dismissed in this browser session
      const sessionKey = `special_award_seen_${user.id || user.email}`;
      const alreadySeenThisSession = sessionStorage.getItem(sessionKey);

      if (!alreadySeenThisSession) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const sessionKey = `special_award_seen_${user.id || user.email}`;
      sessionStorage.setItem(sessionKey, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !user) return null;

  const award = user.metadata?.special_award;
  const creditsAwarded = award?.credits || 50;
  const currentCredits = user.roadmap_credits ?? 50;
  const displayName = user.display_name || user.username || 'Learner';

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-sidebar border border-border rounded-md shadow-2xl p-6 relative overflow-hidden flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-md text-text-muted hover:text-text-heading hover:bg-background/80 transition-colors border border-transparent hover:border-border"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gift Centerpiece Icon */}
        <div className="relative mt-2">
          <div className="w-16 h-16 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shadow-xs">
            <Gift className="w-8 h-8" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center shadow-xs text-[12px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Title and Message */}
        <div className="space-y-2 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-semibold uppercase tracking-wider">
            <span>Special Reward</span>
          </div>

          <h3 className="text-xl font-bold text-text-heading tracking-tight">
            50 Free Learning Credits Added
          </h3>

          <p className="text-[13px] text-text-muted leading-relaxed">
            Welcome back, {displayName}. As a thank you for your focus and continued learning on EulerFold, we have added <strong className="text-text-primary font-semibold">+{creditsAwarded} credits</strong> to your balance for free.
          </p>
        </div>

        {/* Balance Card */}
        <div className="w-full bg-background border border-border rounded-md p-3.5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] text-text-muted uppercase tracking-wider block font-mono">
              Available Credits
            </span>
            <span className="text-lg font-bold text-text-heading">
              {currentCredits} Credits
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              +{creditsAwarded} Free Gift
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          <Link
            href="/dashboard"
            onClick={handleDismiss}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent hover:bg-accent/90 text-background font-semibold text-[13px] rounded-md transition-colors shadow-xs"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
