"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoadmapGenerator from '@/components/landing/RoadmapGenerator';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import { RoadmapData } from '@/lib/api';
import { 
  Menu,
  X,
  LayoutDashboard,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';

export default function GeneratePage() {
  const router = useRouter();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [generatedFormData, setGeneratedFormData] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

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
            <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
          <div className="max-w-[800px] mx-auto px-6 py-10 md:py-16">
            
            {/* Compact Header */}
            <div className="mb-10">
              <h1 className="inconsolata-ui text-[22px] font-bold text-text-heading tracking-tight">
                {roadmapData ? 'Review Generation' : 'Define your Goal'}
              </h1>
            </div>
            
            {!roadmapData ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
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
