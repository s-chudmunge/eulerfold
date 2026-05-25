"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RoadmapGenerator from '@/components/landing/RoadmapGenerator';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import JobDecodedGenerator from '@/components/job-decoded/JobDecodedGenerator';
import { RoadmapData } from '@/lib/api';
import { 
  Sparkles,
  Briefcase
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabase/client';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { SideBanner, QUOTES } from '@/components/layout/SideBanners';

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') as 'ai' | 'job' || 'ai';

  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [generatedFormData, setGeneratedFormData] = useState<any | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mode, setMode] = useState<'ai' | 'job'>(initialMode);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync mode with query param if it changes
  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'job' || m === 'ai') {
      setMode(m as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('supabase_uid', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleRoadmapGenerated = (data: RoadmapData, formData: any) => {
    const timestamp = Date.now();
    localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp }));
    localStorage.setItem('last_generated_form_data', JSON.stringify({ data: formData, timestamp }));
    sessionStorage.setItem('roadmap_just_generated', 'true');
    
    if (data.slug) {
      setIsRedirecting(true);
      router.push(`/roadmap/${data.slug}`);
    } else {
      setRoadmapData(data);
      setGeneratedFormData(formData);
    }
  };

  const handleReset = () => {
    setRoadmapData(null);
    setGeneratedFormData(null);
    localStorage.removeItem('last_generated_roadmap');
    localStorage.removeItem('last_generated_form_data');
    sessionStorage.removeItem('roadmap_just_generated');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background manrope-body selection:bg-teal-500/30">
      <PublicHeader />

      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.2em] uppercase">
                Finalizing Your Roadmap
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.2}s` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 min-w-0 bg-background scroll-smooth">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-start">
              <div className="flex-1 min-w-0 max-w-[800px]">
                <div className="mb-6">
                  <Breadcrumbs items={[{ label: 'Goal Architect' }]} />
                </div>

                {/* Compact Header */}
                {!isLoading && (
                  <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h1 className="inconsolata-ui text-[22px] font-bold text-text-heading tracking-tight">
                      {roadmapData ? 'Review Generation' : mode === 'ai' ? 'AI Architect' : 'Job Decoded'}
                    </h1>

                    {!roadmapData && (
                      <div className="flex bg-sidebar border border-border p-1 rounded-md shrink-0 self-start md:self-auto overflow-x-auto no-scrollbar">
                        <button 
                          onClick={() => setMode('ai')}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all shrink-0 ${
                            mode === 'ai' 
                              ? 'bg-background text-text-heading shadow-sm' 
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${mode === 'ai' ? 'text-accent' : ''}`} /> AI Gen
                        </button>
                        <button 
                          onClick={() => setMode('job')}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all shrink-0 ${
                            mode === 'job' 
                              ? 'bg-background text-text-heading shadow-sm' 
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Briefcase className={`w-3.5 h-3.5 ${mode === 'job' ? 'text-teal-600' : ''}`} /> Job Decoded
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {!roadmapData ? (
                  <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {mode === 'ai' && (
                      <RoadmapGenerator 
                        onRoadmapGenerated={handleRoadmapGenerated} 
                        onLoadingChange={setIsLoading}
                      />
                    )}
                    {mode === 'job' && (
                      <JobDecodedGenerator 
                        onRoadmapGenerated={handleRoadmapGenerated} 
                        onLoadingChange={setIsLoading}
                      />
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-8 flex items-center justify-between">
                      <button 
                        onClick={handleReset}
                        className="inline-flex items-center px-4 py-1.5 bg-callout-bg text-text-primary border border-border text-[10px] font-bold rounded-none hover:bg-sidebar transition-all uppercase tracking-widest"
                      >
                        ← Create Another
                      </button>
                    </div>
                    <RoadmapDisplay 
                      roadmapData={roadmapData} 
                      initialFormData={generatedFormData} 
                      justGenerated={true}
                      onSignInRequired={() => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
                    />
                  </div>
                )}
              </div>

              {!roadmapData && (
                <div className="hidden xl:block w-[240px] shrink-0 sticky top-24 pt-[116px]">
                  <SideBanner 
                    isStatic
                    buttonText="Research"
                    href="/research-decoded"
                    currentQuote={QUOTES[quoteIndex]}
                    quoteIndex={quoteIndex}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
