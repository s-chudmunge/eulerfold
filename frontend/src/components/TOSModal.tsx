'use client';

import React, { useState } from 'react';
import { Check, X, ExternalLink, Loader } from 'lucide-react';
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-100">
      <div className="bg-background border border-border rounded-none w-full max-w-[400px] shadow-2xl relative p-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-callout-bg shrink-0">
          <div className="flex flex-col">
            <h2 className="inconsolata-ui text-[12px] font-bold text-text-heading uppercase tracking-widest leading-none mb-1">
              Legal Update Required
            </h2>
            <p className="inconsolata-ui text-[9px] text-text-muted uppercase tracking-wider opacity-60">
              Version {TOS_VERSION} • March 2026
            </p>
          </div>
          <button onClick={handleDecline} className="text-text-muted hover:text-text-heading transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto manrope-body">
          <p className="text-[12px] text-text-primary leading-relaxed mb-6 font-medium">
            To continue using EulerFold, please review and accept our updated Terms of Service and Privacy Policy. These updates clarify how we use YouTube API Services to provide educational content.
          </p>

          <div className="space-y-6">
            <section>
              <h3 className="inconsolata-ui text-[10px] font-bold text-text-heading uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full" /> Terms of Service
              </h3>
              <p className="text-[11px] text-text-muted leading-relaxed mb-2">
                Our Terms of Service govern your use of the EulerFold platform, including AI roadmap generation, EulerCoins rewards, and community sharing.
              </p>
              <a 
                href="/terms" 
                target="_blank" 
                className="inconsolata-ui text-[10px] font-bold text-accent uppercase tracking-wider hover:underline flex items-center gap-1.5 transition-all"
              >
                Read full Terms of Service <ExternalLink className="w-3 h-3" />
              </a>
            </section>

            <section>
              <h3 className="inconsolata-ui text-[10px] font-bold text-text-heading uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full" /> Privacy Policy
              </h3>
              <p className="text-[11px] text-text-muted leading-relaxed mb-2">
                Our Privacy Policy explains how we collect and protect your data, including the minimal YouTube metadata (video IDs and titles) stored to populate your learning paths.
              </p>
              <a 
                href="/privacy" 
                target="_blank" 
                className="inconsolata-ui text-[10px] font-bold text-accent uppercase tracking-wider hover:underline flex items-center gap-1.5 transition-all"
              >
                Read full Privacy Policy <ExternalLink className="w-3 h-3" />
              </a>
            </section>

            <div className="p-4 bg-callout-bg/50 border border-border rounded-none text-[10px] text-text-muted leading-relaxed">
              By clicking &quot;Accept and Continue&quot;, you also agree to be bound by the <strong>YouTube Terms of Service</strong> and <strong>Google&apos;s Privacy Policy</strong> as part of our integration with YouTube API Services.
            </div>
          </div>

          {error && (
            <div className="mt-4 p-2 bg-red-500/5 border-l-2 border-red-500 text-red-500 text-[10px] font-bold inconsolata-ui uppercase tracking-tighter">
              {error}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0 shrink-0">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3 bg-black dark:bg-[#14b8a6] text-white rounded-none font-bold text-[11px] uppercase tracking-widest flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : (
              <>
                <Check className="w-3.5 h-3.5 mr-2" />
                Accept and Continue
              </>
            )}
          </button>
          
          <p className="inconsolata-ui text-[8px] text-text-muted mt-4 text-center uppercase tracking-widest opacity-40">
            Secure Legal Verification
          </p>
        </div>
      </div>
    </div>
  );
}
