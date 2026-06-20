"use client";

import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2, Upload } from 'lucide-react';

export default function CareerForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-teal-500/10 border border-teal-500/20 p-8 rounded-lg text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-12 h-12 text-teal-700" />
        <div>
          <h3 className="text-xl font-bold text-text-heading manrope-body">Application Sent!</h3>
          <p className="text-text-muted mt-2 manrope-body">We've received your application. We'll get back to you soon.</p>
        </div>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-4 text-[13px] font-bold text-teal-700 hover:underline"
        >
          Send another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-sidebar/30 border border-border p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
          <input 
            required
            name="name"
            type="text" 
            placeholder="John Doe"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] manrope-body focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Email Address</label>
          <input 
            required
            name="email"
            type="email" 
            placeholder="john@example.com"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] manrope-body focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Role</label>
          <select 
            required
            name="role"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] manrope-body focus:outline-none focus:border-accent/50 transition-colors appearance-none"
          >
            <option value="">Select a role</option>
            <option value="Content Creator Intern">Content Creator Intern</option>
            <option value="Founding Software Engineer">Founding Software Engineer</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Portfolio / GitHub</label>
          <input 
            name="portfolio"
            type="url" 
            placeholder="https://github.com/..."
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] manrope-body focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Why EulerFold?</label>
        <textarea 
          name="why"
          rows={3}
          placeholder="Tell us why you're interested..."
          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] manrope-body focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Attach CV / Resume (PDF)</label>
        <div className="relative">
          <input 
            required
            name="cv"
            type="file" 
            accept=".pdf"
            className="hidden" 
            id="cv-upload"
            onChange={(e) => {
              const fileName = e.target.files?.[0]?.name;
              const label = document.getElementById('cv-label');
              if (label && fileName) label.textContent = fileName;
            }}
          />
          <label 
            htmlFor="cv-upload"
            className="flex items-center gap-3 w-full bg-background border border-border border-dashed rounded-lg px-3.5 py-3 text-[13.5px] manrope-body cursor-pointer hover:bg-sidebar/50 transition-colors"
          >
            <Upload className="w-4 h-4 text-text-muted" />
            <span id="cv-label" className="text-text-muted">Click to upload PDF</span>
          </label>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-[11px] text-red-500 font-medium ml-1">{errorMessage || 'Something went wrong.'}</p>
      )}

      <button 
        disabled={status === 'loading'}
        type="submit"
        className="w-full bg-text-heading text-background py-3.5 rounded-lg flex items-center justify-center gap-2 text-[13.5px] font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Submit Application
          </>
        )}
      </button>
      
      <p className="text-center text-[11px] text-text-muted manrope-body">
        By submitting, you agree to allow EulerFold to process your application data.
      </p>
    </form>
  );
}
