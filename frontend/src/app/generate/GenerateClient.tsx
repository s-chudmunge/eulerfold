"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RoadmapGenerator from '@/components/landing/RoadmapGenerator';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import JobDecodedGenerator from '@/components/job-decoded/JobDecodedGenerator';
import { RoadmapData, ExploreRoadmap } from '@/lib/api';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { 
  Sparkles,
  Briefcase,
  HelpCircle,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Calendar,
  Zap,
  BookOpen,
  Library,
  Microscope,
  Archive,
  GraduationCap,
  Compass
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { SideBanner, QUOTES } from '@/components/layout/SideBanners';

function InstructionsSidePanel() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="bg-sidebar border border-border rounded-lg p-5">
         <h3 className="flex items-center gap-2 text-[13px] font-bold text-text-heading uppercase tracking-widest mb-4">
           <FileText className="w-4 h-4 text-accent" />
           Instructions
         </h3>
         <ul className="space-y-3">
           <li className="flex items-start gap-2 text-[12px] text-text-muted leading-relaxed">
             <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-teal-600 shrink-0" />
             <span>Be specific about your goal. Instead of "Learn Python", try "Build scalable backend APIs in Python".</span>
           </li>
           <li className="flex items-start gap-2 text-[12px] text-text-muted leading-relaxed">
             <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-teal-600 shrink-0" />
             <span>Select a timeline that matches your realistic schedule.</span>
           </li>
           <li className="flex items-start gap-2 text-[12px] text-text-muted leading-relaxed">
             <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-teal-600 shrink-0" />
             <span>Our AI autonomously browses the web to attach verified, cutting-edge resources to every topic.</span>
           </li>
         </ul>
      </div>

      <div className="bg-sidebar border border-border rounded-lg p-5">
         <h3 className="flex items-center gap-2 text-[13px] font-bold text-text-heading uppercase tracking-widest mb-4">
           <HelpCircle className="w-4 h-4 text-accent" />
           FAQ
         </h3>
         <div className="space-y-4">
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">How are references verified?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">The AI executes real-time DuckDuckGo searches for every module to guarantee live, authoritative references.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">What is Job Decoded?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">Paste any job description text to instantly generate a targeted roadmap tailored exactly to those requirements.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">Are credits refundable?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">Credits are non-refundable once used to generate a roadmap.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">How long does generation take?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">Usually 20-40 seconds depending on the complexity of the live web searches.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">Can I edit my roadmap later?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">Yes! Roadmap owners get full editing tools on their dashboard to customize the content.</p>
           </div>
           <div className="pt-2 border-t border-border/50">
             <h4 className="text-[12px] font-bold text-text-heading mb-1">What is Local AI Mode?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">It runs models directly on your device via WebGPU, ensuring total privacy since no data leaves your machine.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">Local AI Limitations</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">It requires a modern GPU and browser. Model downloading takes upfront time and space, and speed depends entirely on your local hardware.</p>
           </div>
           <div className="pt-2 border-t border-border/50">
             <h4 className="text-[12px] font-bold text-text-heading mb-1">What is OpenRouter?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">It's a unified API gateway that lets you access multiple AI models (like Claude, GPT-4, and Gemini) through a single interface.</p>
           </div>
           <div>
             <h4 className="text-[12px] font-bold text-text-heading mb-1">How does using my own key help?</h4>
             <p className="text-[11px] text-text-muted leading-relaxed">Providing your own OpenRouter key gives you absolute control over which models run your generation, avoiding vendor lock-in. Your key is stored securely in your browser and never on our servers.</p>
           </div>
         </div>
      </div>
    </div>
  );
}

function GenerateHero({ setMode }: { setMode: (mode: 'ai' | 'job') => void }) {
  return (
    <div className="relative pt-16 md:pt-24 pb-16 overflow-hidden border-b border-border/40 bg-background/50">
      <div className="absolute inset-0 bg-teal-900/[0.02] -z-10" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center justify-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          <EulerLogoCanvas size={64} color1={0xb45309} color2={0xfbbf24} wireframe={false} />
          <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading tracking-tight leading-[1.15] md:leading-[1.1]">
            Architect your learning with <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">precision and depth</span>
          </h1>
        </div>
        <p className="text-text-muted text-base md:text-lg manrope-body font-medium leading-relaxed max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Bypass generic tutorials. Generate custom, technical roadmaps curated in real-time. Whether you are mastering a new stack or decoding a job description, build a structured plan.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
          <button 
            onClick={() => {
              setMode('ai');
              document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-600 text-white px-8 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 shadow-lg gap-2"
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>
          <button 
            onClick={() => {
              setMode('job');
              document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-sidebar border border-border text-text-heading px-8 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:bg-header active:scale-95 shadow-sm gap-2"
          >
            <Briefcase className="w-4 h-4" /> Job Decoded
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenerateClient({ featuredRoadmaps }: { featuredRoadmaps?: ExploreRoadmap[] }) {
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
    
    if ((data as any).slug || data.id) {
      setIsRedirecting(true);
      router.push(`/roadmap/${(data as any).slug || data.id}`);
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
          
          {/* Hero Section */}
          {!roadmapData && !isLoading && (
            <GenerateHero setMode={setMode} />
          )}

          <div id="generator-workspace" className="max-w-7xl w-full mx-auto px-6 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12 justify-center lg:items-start w-full">
              
              {!roadmapData && (
                <div className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-28 order-2 lg:order-1 mt-8 lg:mt-0">
                  <InstructionsSidePanel />
                </div>
              )}

              <div className="flex-1 min-w-0 max-w-2xl w-full order-1 lg:order-2">
                {/* Compact Header */}
                {!isLoading && (
                  <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h1 className="inconsolata-ui text-[22px] font-bold text-text-heading tracking-tight text-center md:text-left">
                      {roadmapData ? 'Review Generation' : mode === 'ai' ? 'AI Architect' : 'Job Decoded'}
                    </h1>

                    {!roadmapData && (
                      <div className="flex bg-sidebar border border-border p-1 rounded-md shrink-0 self-center md:self-auto overflow-x-auto no-scrollbar">
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

                    {/* Featured Roadmaps List below the form */}
                    {featuredRoadmaps && featuredRoadmaps.length > 0 && !isLoading && (
                      <div className="mt-80 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="flex items-center gap-2 text-[12px] font-bold text-text-heading uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            Popular Roadmaps
                          </h3>
                          <Link href="/explore" className="text-[11px] font-bold text-accent hover:text-teal-400 flex items-center gap-1 transition-colors">
                            Explore All <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {featuredRoadmaps.map((roadmap) => (
                            <Link 
                              key={roadmap.id} 
                              href={`/roadmap/${roadmap.slug}`}
                              className="block p-4 rounded-xl border border-border/50 bg-sidebar/30 hover:bg-sidebar/80 hover:border-accent/30 transition-all group"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="font-bold text-[13px] text-text-heading group-hover:text-accent transition-colors line-clamp-2">
                                  {roadmap.title}
                                </h4>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted">
                                <span>{roadmap.topic_count} Topics</span>
                                <span className="bg-background px-2 py-0.5 rounded-full border border-border/50">
                                  {roadmap.clone_count} Clones
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Tools Section */}
                    {!isLoading && (
                      <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="flex items-center gap-2 text-[12px] font-bold text-text-heading uppercase tracking-widest">
                            <Library className="w-4 h-4 text-accent" />
                            Ecosystem Tools
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <Link href="/learn" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <GraduationCap className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Learning Hub</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Active study modules</p>
                            </div>
                          </Link>
                          <Link href="/explore" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <Compass className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Global Explore</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Discover community roadmaps</p>
                            </div>
                          </Link>
                          <Link href="/planner" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <Calendar className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Study Planner</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Dynamic progress tracking</p>
                            </div>
                          </Link>
                          <Link href="/practice" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <Zap className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Practice Portal</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Validate your skills</p>
                            </div>
                          </Link>
                          <Link href="/research-lab" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <Microscope className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Research Lab</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Advanced AI tooling</p>
                            </div>
                          </Link>
                          <Link href="/research-decoded" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <BookOpen className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Research Decoded</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Deep paper breakdowns</p>
                            </div>
                          </Link>
                          <Link href="/articles" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <FileText className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Technical Articles</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">First-principles deep dives</p>
                            </div>
                          </Link>
                          <Link href="/archive" className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background hover:bg-sidebar/50 hover:border-accent/30 transition-all group">
                            <Archive className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                            <div>
                              <h4 className="font-bold text-[12px] text-text-heading leading-tight">Study Archive</h4>
                              <p className="text-[10px] text-text-muted mt-1 leading-snug">Verified past resources</p>
                            </div>
                          </Link>
                        </div>
                      </div>
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
                <div className="hidden xl:block w-[240px] shrink-0 sticky top-28 order-3">
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
