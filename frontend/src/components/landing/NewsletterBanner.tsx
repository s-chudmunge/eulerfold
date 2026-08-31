"use client";

import React, { useState } from 'react';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  return (
    <div className="relative rounded-md border border-border bg-sidebar overflow-hidden">
      {/* Teal accent strip on left */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />

      <div className="px-6 py-6 md:px-8 md:py-7 pl-8 md:pl-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        {/* Left: copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Newsletter</span>
          </div>
          <h2 className="text-[17px] md:text-[18px] font-bold text-text-heading tracking-tight mb-1">
            Stay current with AI and research.
          </h2>
          <p className="text-[13px] text-text-muted leading-relaxed">
            Shifts in AI, research summaries, and what's worth reading — delivered to your inbox.
          </p>
        </div>

        {/* Right: form or success */}
        <div className="flex-shrink-0 w-full md:w-auto md:min-w-[340px]">
          {subscribeSuccess ? (
            <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-md px-5 py-3">
              <CheckCircle className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-text-heading">You're on the list.</p>
                <p className="text-[12px] text-text-muted">The next issue goes to your inbox.</p>
              </div>
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
              className="flex items-center gap-2 bg-background border border-border focus-within:border-accent/50 rounded-md pl-3.5 pr-1.5 py-1.5 transition-all shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent text-[13px] outline-none w-full placeholder:text-text-muted text-text-primary min-w-0"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="inline-flex items-center gap-1.5 bg-accent text-white rounded-md px-4 py-2 text-[12px] font-bold hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
              >
                {isSubscribing ? '...' : (
                  <>Subscribe <ArrowRight className="w-3 h-3" /></>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

