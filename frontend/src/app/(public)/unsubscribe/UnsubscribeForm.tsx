'use client';

import React, { useState, useEffect } from 'react';

interface UnsubscribeFormProps {
  initialEmail: string;
}

const REASONS = [
  "Emails are sent too frequently.",
  "The content is no longer relevant to me.",
  "I prefer to check the dashboard directly instead of receiving emails.",
  "I never signed up for this mailing list.",
  "The emails are inappropriate or spam.",
  "Other (fill in reason below)."
];

export default function UnsubscribeForm({ initialEmail }: UnsubscribeFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-unsubscribe if email is provided in URL
  useEffect(() => {
    if (initialEmail && !isUnsubscribed) {
      performUnsubscribe(initialEmail);
    }
  }, [initialEmail]);

  const performUnsubscribe = async (emailToUnsub: string) => {
    if (!emailToUnsub) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/auth/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUnsub }),
      });

      if (response.ok) {
        setIsUnsubscribed(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to unsubscribe.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUnsubscribed(false);
    setSurveySubmitted(false);
    setSelectedReason('');
    setOtherReason('');
    setError('');
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnsubscribed) {
      performUnsubscribe(email);
    } else {
      setSurveySubmitted(true);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      {isUnsubscribed ? (
        <div className="mb-10 py-6 border-y border-border/50 animate-in slide-in-from-top-2">
          <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-500 mb-1 tracking-tight">
            Success.
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            You've been unsubscribed and won't receive any more emails.
          </p>
        </div>
      ) : (
        <div className="mb-10">
          <div className="flex flex-col gap-2 mb-8">
            <label htmlFor="email" className="text-[11px] font-bold text-text-secondary uppercase tracking-widest px-1">
              Confirm your email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-14 px-5 rounded-lg border border-border bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-base manrope-body"
            />
            {error && <p className="text-xs text-red-500 font-semibold px-1 mt-1">{error}</p>}
          </div>
        </div>
      )}

      {!surveySubmitted ? (
        <form onSubmit={handleAction} className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h3 className="text-[15px] font-bold text-black dark:text-white uppercase tracking-widest opacity-40">
              Please tell us why you're leaving:
            </h3>
            
            <div className="flex flex-col gap-4">
              {REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="peer appearance-none w-6 h-6 border-2 border-gray-300 dark:border-zinc-700 rounded-full checked:border-teal-700 transition-all"
                    />
                    <div className="absolute w-3 h-3 bg-teal-700 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-[15px] text-gray-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {selectedReason === REASONS[5] && (
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please tell us more..."
                className="w-full p-5 rounded-lg border border-border bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:border-teal-700 text-base manrope-body min-h-[120px] animate-in slide-in-from-top-2"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!isUnsubscribed && !email) || (isUnsubscribed && !selectedReason)}
            className="w-fit px-12 h-14 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg transition-all disabled:opacity-30 text-[14px] uppercase tracking-widest hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center min-w-[200px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              isUnsubscribed ? 'Submit Feedback' : 'Unsubscribe'
            )}
          </button>
        </form>
      ) : (
        <div className="py-8 animate-in zoom-in-95 duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">Thank you for helping us improve!</p>
          </div>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-border flex flex-col gap-2">
        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
          If this was a mistake, you can <button onClick={handleResubscribe} className="text-black dark:text-white underline font-bold hover:text-teal-700 transition-colors">resubscribe</button>. If you received an email you weren't expecting, please let us know by <a href="mailto:eulerfold@gmail.com" className="text-black dark:text-white underline font-bold hover:text-teal-700 transition-colors">reporting abuse</a>.
        </p>
      </div>
    </div>
  );
}
