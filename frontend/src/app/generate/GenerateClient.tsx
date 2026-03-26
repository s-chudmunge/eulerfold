"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoadmapGenerator from '@/components/landing/RoadmapGenerator';
import RoadmapDisplay from '@/components/landing/RoadmapDisplay';
import { RoadmapData } from '@/lib/api';
import { 
  Menu,
  X
} from 'lucide-react';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export default function GeneratePage() {
  const router = useRouter();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [generatedFormData, setGeneratedFormData] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className={`fixed inset-0 flex flex-col bg-background ${inconsolata.variable} ${manrope.variable} manrope-body selection:bg-teal-500/30 overflow-hidden`}>
      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
          <div className="max-w-[800px] mx-auto px-6 py-10 md:py-16">
            
            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mb-8 p-1 -ml-1 text-text-muted hover:text-text-heading transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

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
