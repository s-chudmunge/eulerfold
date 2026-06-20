"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { authAPI, User } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface ClaimUsernameStepProps {
  initialEmail?: string;
  onSuccess: (user: User) => void;
}

export default function ClaimUsernameStep({ initialEmail, onSuccess }: ClaimUsernameStepProps) {
  const [displayName, setDisplayName] = useState('');
  const [claimedUsername, setClaimedUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    if (displayName.trim().length < 2) {
      setError("Please enter your name");
      return;
    }
    if (claimedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!agreedToTerms || !agreedToPrivacy) {
      setError("Please agree to the terms and privacy policy");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authAPI.completeOnboarding({ 
        username: claimedUsername,
        display_name: displayName 
      });
      onSuccess(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Username taken or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[540px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Branding */}
      <div className="flex justify-center mb-16">
        <div className="flex items-center gap-2 opacity-90">
          <img src="/apple-touch-icon.png" alt="" className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight text-text-heading manrope-body">EulerFold</span>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-10 text-center tracking-tight manrope-body">
        Let&apos;s create your account
      </h1>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-text-muted manrope-body">
            What is your name?
          </label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-5 py-4 bg-sidebar/50 border border-border rounded-lg text-[17px] text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted/40 manrope-body font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-text-muted manrope-body">
            Choose a unique username
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/60 font-bold text-[17px] manrope-body">@</span>
            <input 
              type="text" 
              value={claimedUsername}
              onChange={(e) => setClaimedUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              className="w-full pl-11 pr-5 py-4 bg-sidebar/50 border border-border rounded-lg text-[17px] text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted/40 manrope-body font-medium"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
            <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
              {agreedToTerms && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
            </div>
            <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
              I agree to EulerFold&apos;s <Link href="/terms" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Consumer Terms</Link> and <Link href="/terms" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Acceptable Use Policy</Link> and confirm that I am at least 18 years of age.
            </p>
          </div>

          <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}>
            <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToPrivacy ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
              {agreedToPrivacy && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
            </div>
            <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
              I consent to collection and use of my personal information in accordance with the <Link href="/privacy" target="_blank" className="text-text-primary hover:text-accent font-bold underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
            </p>
          </div>

          <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setAgreedToMarketing(!agreedToMarketing)}>
            <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToMarketing ? 'bg-text-heading border-text-heading' : 'border-border group-hover:border-accent'}`}>
              {agreedToMarketing && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
            </div>
            <p className="text-[14px] text-text-muted leading-relaxed manrope-body font-medium">
              Subscribe to occasional product update and promotional emails. You can opt out at any time.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-[13px] font-bold text-red-500 text-center manrope-body animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}

        <button 
          onClick={handleClaim}
          disabled={loading || !agreedToTerms || !agreedToPrivacy || claimedUsername.length < 3 || displayName.trim().length < 2}
          className="w-full py-4 bg-text-heading text-background rounded-lg font-bold text-[16px] hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl active:scale-[0.98] manrope-body"
        >
          {loading ? 'Processing...' : 'Create account'}
        </button>

        <div className="pt-8 text-center space-y-3">
          <p className="text-[13px] text-text-muted manrope-body font-medium">
            Email verified as <span className="text-text-primary font-bold">{initialEmail}</span>
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-[12px] text-text-muted hover:text-accent underline underline-offset-4 transition-colors font-bold manrope-body"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}
