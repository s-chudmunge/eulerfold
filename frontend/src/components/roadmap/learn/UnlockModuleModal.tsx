'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';
import { roadmapsAPI } from '@/lib/api';

interface UnlockModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: number;
  targetModuleNumber: number;
  targetModuleTitle: string;
  onModuleUnlocked: (updatedPlan: any) => void;
}

export default function UnlockModuleModal({
  isOpen,
  onClose,
  roadmapId,
  targetModuleNumber,
  targetModuleTitle,
  onModuleUnlocked
}: UnlockModuleModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsDone(false);
      setStatusMessage('');
      startUnlock();
    }
  }, [isOpen, targetModuleNumber, roadmapId]);

  const startUnlock = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setIsDone(false);
      setStatusMessage('Analyzing your progress and recent performance... 📊');

      const updatedPlan = await roadmapsAPI.unlockModuleStream(
        roadmapId,
        targetModuleNumber,
        (status: string) => {
          setStatusMessage(status);
        }
      );

      if (updatedPlan) {
        setIsDone(true);
        setStatusMessage(`Module ${targetModuleNumber} is unlocked and ready!`);
        setTimeout(() => {
          onModuleUnlocked(updatedPlan);
          onClose();
        }, 1200);
      } else {
        throw new Error("Unable to load the new module lessons.");
      }
    } catch (err: any) {
      console.error("Unlock module error:", err);
      setError(err?.message || "Failed to unlock module. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-sidebar border border-border rounded-md shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-accent/10 border border-accent/20 text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-text-heading">
                Unlocking Module {targetModuleNumber}
              </h3>
              <p className="text-[11px] text-text-muted truncate max-w-[260px]">
                {targetModuleTitle}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-muted hover:text-text-heading hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-6 space-y-5">
          {error ? (
            <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[13px] font-bold">Unlocking failed</span>
              </div>
              <p className="text-[12px] leading-relaxed opacity-90">{error}</p>
              <button
                onClick={startUnlock}
                className="mt-2 px-3 py-1.5 rounded-md bg-accent text-background text-[12px] font-bold hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Animated Progress Box */}
              <div className="p-4 rounded-md bg-background border border-border/70 flex items-start gap-3.5 shadow-xs">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Loader2 className="w-5 h-5 text-accent shrink-0 mt-0.5 animate-spin" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                    {isDone ? "Ready" : "Building Lessons"}
                  </span>
                  <p className="text-[13px] font-medium text-text-heading leading-relaxed transition-all duration-150">
                    {statusMessage || "Getting your next lessons ready..."}
                  </p>
                </div>
              </div>

              {/* Explanatory detail */}
              <p className="text-[11px] text-text-muted leading-relaxed px-1">
                Finding the best videos and readings for your next topics.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {isDone && (
          <div className="pt-3 border-t border-border flex justify-end">
            <button
              onClick={() => {
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-background text-[12px] font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Continue into Module {targetModuleNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
