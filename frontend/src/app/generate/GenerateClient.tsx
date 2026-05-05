"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoadmapGenerator from '@/components/landing/RoadmapGenerator';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import ManualRoadmapBuilder from '@/components/manual-build/ManualRoadmapBuilder';
import { RoadmapData } from '@/lib/api';
import { 
  Menu,
  X,
  LayoutDashboard,
  Plus,
  Sparkles,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabase/client';

export default function GeneratePage() {
  const router = useRouter();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [generatedFormData, setGeneratedFormData] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

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
    <div 
      style={{ top: 'var(--announcement-height, 0px)' }}
      className="fixed inset-0 flex flex-col bg-background manrope-body selection:bg-teal-500/30 overflow-hidden"
    >
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link className="flex items-center group shrink-0" href="/">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {profile?.username ? (
              <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            ) : (
              <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
          <div className="max-w-[800px] mx-auto px-6 py-6 md:py-10">
            
            <div className="mb-6">
              <Breadcrumbs items={[{ label: 'Goal Architect' }]} />
            </div>

            {/* Compact Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h1 className="inconsolata-ui text-[22px] font-bold text-text-heading tracking-tight">
                {roadmapData ? 'Review Generation' : mode === 'ai' ? 'AI Architect' : 'Manual Build'}
              </h1>

              {!roadmapData && (
                <div className="flex bg-sidebar border border-border p-1 rounded-md shrink-0 self-start md:self-auto">
                  <button 
                    onClick={() => setMode('ai')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all ${
                      mode === 'ai' 
                        ? 'bg-background text-text-heading shadow-sm' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${mode === 'ai' ? 'text-accent' : ''}`} /> AI Gen
                  </button>
                  <button 
                    onClick={() => setMode('manual')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all ${
                      mode === 'manual' 
                        ? 'bg-background text-text-heading shadow-sm' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Settings2 className={`w-3.5 h-3.5 ${mode === 'manual' ? 'text-blue-500' : ''}`} /> Manual
                  </button>
                </div>
              )}
            </div>
            
            {!roadmapData ? (
              <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {mode === 'ai' ? (
                  <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
                ) : (
                  <ManualRoadmapBuilder />
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
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
