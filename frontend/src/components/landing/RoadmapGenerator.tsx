"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, RoadmapData } from '../../lib/api';
import { Loader, Sparkles, Target, Zap, AlertCircle, Compass, History, Hourglass } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import PaymentModal from '../PaymentModal';

interface RoadmapGeneratorProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  isLanding?: boolean;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ onRoadmapGenerated, isLanding = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIntent = searchParams.get('subject') || '';
  
  const isLongGoal = rawIntent.split(' ').length > 3 || rawIntent.length > 25 || /i want to|learn how to|build a|create a/i.test(rawIntent);
  
  const [formData, setFormData] = useState({
    subject: isLongGoal ? '' : rawIntent,
    goal: isLongGoal ? rawIntent : '',
    prior_experience: '',
    time_value: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('roadmap_credits')
        .eq('supabase_uid', session.user.id)
        .single();
      if (data) setCredits(data.roadmap_credits);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  useEffect(() => {
    const pendingForm = sessionStorage.getItem('pending_roadmap_form');
    if (pendingForm) {
      try {
        const parsed = JSON.parse(pendingForm);
        setFormData(parsed);
        sessionStorage.removeItem('pending_roadmap_form');
      } catch (e) {}
    }
    
    if (searchParams.get('payment_success') === 'true') {
      const pendingFormAfterPay = sessionStorage.getItem('pending_roadmap_form_after_pay');
      if (pendingFormAfterPay) {
        try {
          const parsed = JSON.parse(pendingFormAfterPay);
          setFormData(parsed);
          sessionStorage.removeItem('pending_roadmap_form_after_pay');
          setTimeout(() => {
            const btn = document.getElementById('trigger-generate');
            if (btn) btn.click();
          }, 500);
        } catch(e) {}
      }
    }
  }, [searchParams]);

  const loadingMessages = [
    "Analyzing scope...",
    "Curating resources...",
    "Structuring goals...",
    "Optimizing sequence...",
    "Finalizing path...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.goal) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      sessionStorage.setItem('pending_roadmap_form', JSON.stringify(formData));
      router.push('/login?message=auth_required_to_generate&next=/generate');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.post('/roadmaps/generate', {
        ...formData,
        time_unit: 'weeks',
        model: 'models/gemini-2.5-flash',
      });
      onRoadmapGenerated(response.data, { ...formData, time_unit: 'weeks' });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login?message=auth_required_to_generate');
      } else if (err.response?.status === 402) {
        sessionStorage.setItem('pending_roadmap_form_after_pay', JSON.stringify(formData));
        setIsPaymentModalOpen(true);
      } else {
        setError(err.message || "Generation error.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formContent = (
    <div className={`w-full ${isLanding ? 'bg-background shadow-2xl rounded-none border border-border p-8 sm:p-12' : 'p-0'} manrope-body`}>
      <form onSubmit={generateRoadmap} className="space-y-8">
        <div className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
              Subject or Skill
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g. Distributed Systems"
              className="w-full px-4 py-2.5 bg-callout-bg border border-border rounded-none focus:outline-none focus:border-[var(--accent)] transition-all text-[14px] font-bold text-text-heading placeholder:text-text-muted/40 placeholder:font-normal"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal */}
            <div className="space-y-2">
              <label htmlFor="goal" className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
                Objective
              </label>
              <textarea
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                rows={3}
                placeholder="What is the end goal?"
                className="w-full px-4 py-2.5 bg-callout-bg border border-border rounded-none focus:outline-none focus:border-[var(--accent)] transition-all text-[13px] font-medium text-text-heading placeholder:text-text-muted/40 resize-none h-24"
                required
              />
            </div>

            {/* Context */}
            <div className="space-y-2">
              <label htmlFor="prior_experience" className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
                Context (Optional)
              </label>
              <textarea
                id="prior_experience"
                name="prior_experience"
                value={formData.prior_experience}
                onChange={handleInputChange}
                rows={3}
                placeholder="Existing knowledge..."
                className="w-full px-4 py-2.5 bg-callout-bg border border-border rounded-none focus:outline-none focus:border-[var(--accent)] transition-all text-[13px] font-medium text-text-heading placeholder:text-text-muted/40 resize-none h-24"
              />
            </div>
          </div>

          {/* Target Duration */}
          <div className="space-y-3">
            <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
              Target Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 6, 8].map(w => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setFormData(prev => ({ ...prev, time_value: w }))}
                  className={`inconsolata-ui px-4 py-1.5 rounded-none border text-[10px] font-bold uppercase tracking-widest transition-all
                    ${formData.time_value === w 
                      ? 'bg-[var(--text-heading)] text-[var(--bg-main)] border-[var(--text-heading)]' 
                      : 'bg-background text-text-muted border-border hover:border-[var(--accent)] hover:text-accent'
                    }`}
                >
                  {w} Weeks
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Actions */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <button
            id="trigger-generate"
            type="submit"
            disabled={isGenerating}
            className={`group relative w-full sm:w-fit inline-flex items-center justify-center overflow-hidden px-10 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 ${
              credits === 0 
              ? 'bg-callout-bg border border-border text-text-muted cursor-not-allowed' 
              : 'bg-[var(--text-heading)] text-[var(--bg-main)] hover:opacity-90 active:scale-95'
            }`}
          >
            <div className={`flex items-center justify-center gap-2.5 transition-transform duration-300 ${isGenerating ? 'translate-y-20' : ''}`}>
              <Zap className={`w-3.5 h-3.5 fill-current ${credits === 0 ? 'text-text-muted' : ''}`} />
              {credits === 0 ? 'Insufficient Credits' : `Generate Roadmap (${credits ?? '...'})`}
            </div>
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center animate-in slide-in-from-bottom-10 duration-300">
                 <Loader className="w-4 h-4 animate-spin" />
              </div>
            )}
          </button>

          {credits === 0 && !isGenerating && (
            <button 
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="inconsolata-ui text-[10px] font-bold text-accent hover:underline flex items-center gap-2 uppercase tracking-widest"
            >
              <Sparkles className="w-3 h-3" /> Purchase Credits to continue
            </button>
          )}
        </div>
      </form>
    </div>
  );

  if (!isLanding) {
    return (
      <div>
        {formContent}
        <div className={`mt-12 text-center transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <p className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-widest">
            {isGenerating ? loadingMessages[currentMessageIndex] : ''}
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
             {[0, 1, 2].map(i => (
               <div key={i} className="w-1 h-1 bg-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
        </div>
        
        {error && (
          <div className="mt-8 p-3 bg-red-500/5 border-l-2 border-red-500 flex items-center gap-3 text-red-500 animate-in slide-in-from-left-1 duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="inconsolata-ui text-[10px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchCredits();
            const btn = document.getElementById('trigger-generate');
            if (btn) btn.click();
          }} 
        />
      </div>
    );
  }

  return (
    <section id="generate" className="py-20 bg-background manrope-body">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inconsolata-ui inline-flex items-center px-3 py-1 rounded-none bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest mb-4">
            Curriculum Engine
          </div>
          <h2 className="inconsolata-ui text-[28px] font-bold text-text-heading tracking-tight uppercase">
            Define your <span className="text-accent">Goal</span>
          </h2>
        </div>

        {formContent}

        <div className={`mt-12 text-center transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <p className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-widest">
            {isGenerating ? loadingMessages[currentMessageIndex] : ''}
          </p>
        </div>

        {error && (
          <div className="mt-8 p-3 bg-red-500/5 border-l-2 border-red-500 flex items-center gap-3 text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="inconsolata-ui text-[10px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}
        
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchCredits();
            const btn = document.getElementById('trigger-generate');
            if (btn) btn.click();
          }} 
        />
      </div>
    </section>
  );
};

export default RoadmapGenerator;
