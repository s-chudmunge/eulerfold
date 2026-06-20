'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Send, X } from 'lucide-react';
import { authAPI } from '@/lib/api';

interface FeatureRequestFormProps {
  onClose: () => void;
}

export default function FeatureRequestForm({ onClose }: FeatureRequestFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Feature'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await authAPI.submitFeatureRequest(formData);

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error sending request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200 manrope-body">
      <div className="bg-background w-full max-w-sm rounded-lg shadow-2xl border border-border relative overflow-hidden transition-colors">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text-heading transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-4 w-4 text-accent" />
            <h3 className="inconsolata-ui text-[12px] font-bold uppercase tracking-widest text-text-heading">Suggest Feature</h3>
          </div>

          {success ? (
            <div className="text-center py-8 animate-in zoom-in-95 duration-200">
              <CheckCircle className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-widest">Request Sent!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-1.5">
                {['Feature', 'Bug', 'Idea'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      formData.category === cat 
                        ? 'bg-[var(--text-heading)] text-[var(--bg-main)] border-[var(--text-heading)]' 
                        : 'bg-callout-bg text-text-muted border-border hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Short, descriptive title..."
                  className="w-full px-4 py-2.5 bg-callout-bg border border-callout-border rounded-lg text-[13px] focus:border-[var(--accent)] outline-none placeholder:text-text-muted font-medium text-text-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about your suggestion..."
                  className="w-full px-4 py-2.5 bg-callout-bg border border-callout-border rounded-lg text-[13px] focus:border-[var(--accent)] outline-none placeholder:text-text-muted font-medium resize-none text-text-primary transition-all"
                />
              </div>

              {error && (
                <p className="inconsolata-ui text-[10px] font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-tight">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-lg font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
