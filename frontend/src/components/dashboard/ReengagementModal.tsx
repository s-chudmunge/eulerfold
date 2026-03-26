'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, RotateCcw, Zap, Play, ArrowRight, X } from 'lucide-react';
import { RoadmapMe, roadmapsAPI, authAPI } from '@/lib/api';

interface ReengagementModalProps {
  roadmap: RoadmapMe;
  daysAway: number;
  onClose: () => void;
  onUpdated: (newRoadmap: RoadmapMe) => void;
}

export default function ReengagementModal({ roadmap, daysAway, onClose, onUpdated }: ReengagementModalProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsUpdating] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDismiss = async () => {
    try {
      const eightDaysFromNow = new Date();
      eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);

      await authAPI.updateMetadata({ 
        last_reengagement_seen_at: new Date().toISOString(),
        reengagement_paused_until: eightDaysFromNow.toISOString()
      });
    } catch (err) {
      console.error('Failed to save dismissal:', err);
    }
    onClose();
  };

  const handleGoalChanged = async () => {
    setIsUpdating(true);
    try {
      await roadmapsAPI.updateProgress(roadmap.id, {
        module_number: roadmap.current_module,
        topic_index: 0,
        completed: false
      });
      router.push('/#generate');
    } catch (err) {
      router.push('/#generate');
    }
  };

  const handleContinue = () => {
    onClose();
    router.push(`/roadmap/${roadmap.slug || roadmap.id}/learn`);
  };

  const handleRebuild = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await roadmapsAPI.rebuildRoadmap({
        roadmap_id: roadmap.id,
        current_module: roadmap.current_module
      });
      onUpdated(updated);
      onClose();
      router.push(`/roadmap/${updated.slug || roadmap.id}/learn`);
    } catch (err) {
      console.error('Failed to rebuild roadmap:', err);
      setError('Rebuild failed.');
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    
    setIsUpdating(true);
    try {
      await roadmapsAPI.resetProgress(roadmap.id);
      onClose();
      router.push(`/roadmap/${roadmap.slug || roadmap.id}/learn`);
    } catch (err) {
      console.error('Failed to reset roadmap:', err);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 manrope-body">
      <div className="bg-background w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-border relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text-heading transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-1.5 w-full bg-callout-bg">
          <div 
            className="h-full bg-accent transition-all duration-500" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-accent" />
                <h3 className="inconsolata-ui text-[12px] font-bold uppercase tracking-widest text-text-heading">Welcome back</h3>
              </div>
              
              <div className="bg-callout-bg p-5 rounded-lg mb-8 border border-callout-border">
                <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Current goal</p>
                <p className="text-[14px] font-bold text-text-heading line-clamp-2 leading-tight">{roadmap.subject}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-lg font-bold text-[12px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Keep goal <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleGoalChanged}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-transparent text-text-muted border border-border rounded-lg font-bold text-[12px] uppercase tracking-widest hover:text-text-heading hover:border-[var(--text-heading)] transition-all"
                >
                  Change goal
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-accent" />
                <h3 className="inconsolata-ui text-[12px] font-bold uppercase tracking-widest text-text-heading">Resume learning?</h3>
              </div>
              
              <p className="text-text-muted text-[13px] font-medium mb-8">
                You've been away for <span className="font-bold text-text-heading">{daysAway} days</span>.
              </p>

              {error && (
                <p className="mb-4 inconsolata-ui text-[10px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5" /> {error}
                </p>
              )}

              <div className="space-y-2.5">
                <button
                  onClick={handleContinue}
                  className="w-full p-3.5 bg-callout-bg rounded-lg text-left hover:bg-[var(--active-bg)] hover:text-[var(--active-text)] border border-callout-border transition-all group flex items-center gap-4"
                >
                  <div className="p-2 bg-background rounded-md border border-border group-hover:text-accent">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="inconsolata-ui text-[11px] font-bold uppercase tracking-widest leading-none">Continue</p>
                    <p className="text-[10px] font-medium opacity-70 leading-none mt-2">Pick up where you left off</p>
                  </div>
                </button>

                <button
                  onClick={handleRebuild}
                  disabled={isProcessing}
                  className="w-full p-3.5 bg-callout-bg rounded-lg text-left hover:bg-[var(--active-bg)] hover:text-[var(--active-text)] border border-callout-border transition-all group flex items-center gap-4 disabled:opacity-50"
                >
                  <div className="p-2 bg-background rounded-md border border-border group-hover:text-accent">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="inconsolata-ui text-[11px] font-bold uppercase tracking-widest leading-none">{isProcessing ? 'Rebuilding...' : 'Rebuild'}</p>
                    <p className="text-[10px] font-medium opacity-70 leading-none mt-2">Fresh start with simplified path</p>
                  </div>
                </button>

                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className={`w-full p-3.5 rounded-lg text-left transition-all group flex items-center gap-4 disabled:opacity-50 border ${
                    showResetConfirm 
                      ? 'bg-red-600 text-white border-red-700' 
                      : 'bg-callout-bg border-callout-border hover:bg-red-500 hover:text-white hover:border-red-600'
                  }`}
                >
                  <div className={`p-2 rounded-md border ${
                    showResetConfirm 
                      ? 'bg-red-700 border-red-800' 
                      : 'bg-background border-border group-hover:text-red-500'
                  }`}>
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`inconsolata-ui text-[11px] font-bold uppercase tracking-widest leading-none`}>
                      {showResetConfirm ? 'Confirm Reset?' : 'Reset'}
                    </p>
                    <p className={`text-[10px] font-medium leading-none mt-2 ${showResetConfirm ? 'text-red-100' : 'opacity-70'}`}>
                      Restart from module 1
                    </p>
                  </div>
                </button>
                {showResetConfirm && (
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="w-full mt-2 inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-text-heading"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
