'use client';

import React, { useState } from 'react';
import { Shield, Check, X, ExternalLink } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { TOS_VERSION } from '@/config/constants';
import { supabase } from '@/lib/supabase/client';

interface TOSModalProps {
  onAccept: () => void;
}

export default function TOSModal({ onAccept }: TOSModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.acceptTOS(TOS_VERSION);
      onAccept();
    } catch (err: any) {
      console.error("Failed to accept TOS:", err);
      setError(err.response?.data?.detail || "Failed to save acceptance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login?message=tos_declined';
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-border dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border dark:border-white/5 flex items-center gap-4 bg-sidebar/30 dark:bg-white/[0.01]">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-heading manrope-body">Legal Update Required</h2>
            <p className="text-sm text-text-muted inconsolata-ui uppercase tracking-tight">Version {TOS_VERSION} • March 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 manrope-body text-sm leading-relaxed text-text-primary">
          <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4 italic text-teal-800 dark:text-teal-200">
            To continue using EulerFold, please review and accept our updated Terms of Service and Privacy Policy. These updates clarify how we use YouTube API Services to provide educational content.
          </div>

          <section>
            <h3 className="font-bold text-text-heading mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Terms of Service
            </h3>
            <p className="mb-4">
              Our Terms of Service govern your use of the EulerFold platform, including AI roadmap generation, EulerCoins rewards, and community sharing.
            </p>
            <a 
              href="/terms" 
              target="_blank" 
              className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline"
            >
              Read full Terms of Service <ExternalLink className="w-3 h-3" />
            </a>
          </section>

          <section>
            <h3 className="font-bold text-text-heading mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Privacy Policy
            </h3>
            <p className="mb-4">
              Our Privacy Policy explains how we collect and protect your data, including the minimal YouTube metadata (video IDs and titles) stored to populate your learning paths.
            </p>
            <a 
              href="/privacy" 
              target="_blank" 
              className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline"
            >
              Read full Privacy Policy <ExternalLink className="w-3 h-3" />
            </a>
          </section>

          <section className="p-4 bg-sidebar/50 dark:bg-white/[0.02] border border-border dark:border-white/5 rounded-xl text-xs text-text-muted">
            By clicking &quot;Accept and Continue&quot;, you also agree to be bound by the <strong>YouTube Terms of Service</strong> and <strong>Google&apos;s Privacy Policy</strong> as part of our integration with YouTube API Services.
          </section>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <X className="w-4 h-4" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border dark:border-white/5 flex flex-col sm:flex-row items-center justify-end gap-3 bg-sidebar/30 dark:bg-white/[0.01]">
          <button
            onClick={handleDecline}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Decline and Logout
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
