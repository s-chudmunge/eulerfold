"use client";

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  return (
    <div className="bg-transparent rounded-3xl p-6 md:p-8 border border-border/60 relative overflow-hidden group flex flex-col justify-between h-full">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-[20px] md:text-[22px] font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">Stay updated</h2>
        <p className="manrope-body text-[13px] md:text-[14px] mb-6 text-text-primary leading-relaxed font-medium">
          Get the latest shifts shaping AI and research, delivered straight to your inbox.
        </p>
        
        {subscribeSuccess ? (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 border-2 border-emerald-500/20 rounded-full px-6 py-2.5 text-[13px] font-bold">
                <Sparkles className="w-4 h-4" /> Subscribed successfully!
            </div>
        ) : (
            <form 
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!email) return;
                    setIsSubscribing(true);
                    try {
                        await api.post('/auth/subscribe', { email });
                        setSubscribeSuccess(true);
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setIsSubscribing(false);
                    }
                }}
                className="flex items-center gap-2 bg-sidebar border border-border/80 focus-within:border-[var(--text-heading)]/40 rounded-full pl-4 pr-1.5 py-1.5 transition-all max-w-md shadow-sm"
            >
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent text-[13px] manrope-body outline-none w-full placeholder:text-text-muted text-text-primary min-w-0"
                />
                <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full px-5 py-2 text-[12px] font-bold hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
                >
                    {isSubscribing ? '...' : 'Subscribe'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}
