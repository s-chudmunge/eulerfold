"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { roadmapsAPI, RoadmapRead } from '@/lib/api';
import { 
  Loader, 
  Sparkles, 
  SearchCode, 
  Cpu, 
  AlertCircle, 
  Mountain
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';

interface JobDecodedGeneratorProps {
  onRoadmapGenerated: (data: RoadmapRead, formData: any) => void;
}

const JobDecodedGenerator: React.FC<JobDecodedGeneratorProps> = ({ onRoadmapGenerated }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    job_description: '',
    current_experience: '',
    generation_type: 'full' as 'incremental' | 'full',
    time_value: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const fetchProfileAndCredits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('supabase_uid', session.user.id)
        .single();
      if (data) {
        setProfile(data);
        setCredits(data.roadmap_credits);
      }
    }
  };

  useEffect(() => {
    fetchProfileAndCredits();
  }, []);

  const loadingMessages = [
    "Tinkering with requirements...",
    "Shimmying through roles...",
    "Calibrating career path...",
    "Architecting bridge...",
    "Distilling job skills...",
    "Mapping the mountain...",
    "Refactoring sequence...",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_description || !formData.current_experience) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?next=/generate');
      return;
    }

    if (credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await roadmapsAPI.generateFromJD({
        ...formData,
        time_unit: 'weeks',
      });
      onRoadmapGenerated(response, { ...formData, time_unit: 'weeks' });
    } catch (err: any) {
      if (err.response?.status === 402) {
        setIsPaymentModalOpen(true);
      } else {
        setError(err.response?.data?.detail || err.message || "Generation failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const isPro = profile?.is_pro || false;
  const allowedWeeks = isPro ? [2, 3, 4, 6, 10, 12] : [2, 3, 4];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-callout-bg border-l-2 border-accent/30 p-4 flex gap-3">
          <Mountain className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-[12px] text-text-primary leading-relaxed">
            Generates a complete career bridge to meet every requirement in the job description based on your current background.
          </p>
        </div>

        <div className="space-y-6">
          {/* JD Input */}
          <div className="space-y-2">
            <label className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
              <SearchCode className="w-3 h-3 mr-1.5 text-accent" /> Job Description
            </label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Paste the requirements, role description, or the full JD here..."
              className="w-full px-4 py-3 bg-callout-bg border border-border rounded-none focus:outline-none focus:border-accent transition-all text-[13px] font-medium text-text-heading placeholder:text-text-muted/40 resize-none"
              required
            />
          </div>

          {/* Experience Input */}
          <div className="space-y-2">
            <label className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
              <Cpu className="w-3 h-3 mr-1.5 text-teal-600" /> Your Current Level & Context
            </label>
            <textarea
              name="current_experience"
              value={formData.current_experience}
              onChange={handleInputChange}
              rows={4}
              placeholder="What do you already know? (e.g. 'I'm a junior frontend dev with 1 year of React, but no backend experience')"
              className="w-full px-4 py-3 bg-callout-bg border border-border rounded-none focus:outline-none focus:border-accent transition-all text-[13px] font-medium text-text-heading placeholder:text-text-muted/40 resize-none"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
              Target Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {allowedWeeks.map(w => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setFormData(prev => ({ ...prev, time_value: w }))}
                  className={`inconsolata-ui px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all
                    ${formData.time_value === w 
                      ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                      : 'bg-background text-text-muted border-border hover:border-accent hover:text-accent'
                    }`}
                >
                  {w} Weeks
                </button>
              ))}
              {!isPro && (
                <button 
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inconsolata-ui px-3 py-1.5 text-[9px] font-bold text-accent border border-accent/20 border-dashed hover:bg-accent/5"
                >
                  Unlock 6-12 Weeks (Pro)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={isGenerating || (credits !== null && credits < 1)}
            className={`group relative w-full sm:w-fit inline-flex items-center justify-center overflow-hidden px-12 py-3.5 rounded-none text-[11px] font-bold uppercase tracking-widest transition-all ${
              credits !== null && credits < 1
              ? 'bg-callout-bg border border-border text-text-muted cursor-not-allowed' 
              : 'bg-text-heading text-background hover:opacity-90 active:scale-95'
            }`}
          >
            <div className={`flex items-center justify-center gap-2.5 transition-transform duration-300 ${isGenerating ? 'translate-y-20' : ''}`}>
              <Sparkles className="w-4 h-4 text-accent" />
              {credits !== null && credits < 1 ? 'Insufficient Credits' : `Decode Job Path (${credits ?? '...'})`}
            </div>
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center animate-in slide-in-from-bottom-10 duration-300">
                 <Loader className="w-4 h-4 animate-spin" />
              </div>
            )}
          </button>
          
          {credits !== null && credits < 1 && (
            <div className="mt-2">
              <Link href="/pricing" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                Buy more credits →
              </Link>
            </div>
          )}
        </div>
      </form>

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
          fetchProfileAndCredits();
        }} 
      />
    </div>
  );
};

export default JobDecodedGenerator;
