"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Dna, ArrowRight } from 'lucide-react';

interface PathDiscoveryStepProps {
  displayName: string;
  onExit: () => void;
}

export default function PathDiscoveryStep({ displayName, onExit }: PathDiscoveryStepProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-[640px] mx-auto animate-in fade-in duration-500 py-12">
      <div className="text-center mb-16">
        <h2 className="inconsolata-ui text-[24px] md:text-[28px] font-bold text-text-heading tracking-tight uppercase mb-4">
          Welcome, <span className="text-accent">{displayName.split(' ')[0] || 'Explorer'}</span>
        </h2>
        <p className="manrope-body text-[14px] text-text-muted font-medium max-w-[420px] mx-auto leading-relaxed">
          Choose your first objective to begin the learning cycle.
        </p>
      </div>

      <div className="space-y-4">
        {/* Option 1: Create */}
        <button 
          onClick={() => router.push('/generate')}
          className="group w-full flex items-center gap-6 p-6 bg-callout-bg border border-border rounded-none hover:border-accent transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="w-10 h-10 shrink-0 bg-background border border-border flex items-center justify-center group-hover:border-accent transition-colors">
            <BrainCircuit className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">
              Architect Custom Path
            </h3>
            <p className="manrope-body text-[13px] text-text-muted leading-relaxed font-medium">
              Define a specific subject or career goal. Our engine will generate a tailored curriculum.
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
          
          {/* Subtle accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* Option 2: Explore */}
        <button 
          onClick={() => router.push('/explore')}
          className="group w-full flex items-center gap-6 p-6 bg-callout-bg border border-border rounded-none hover:border-blue-500 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="w-10 h-10 shrink-0 bg-background border border-border flex items-center justify-center group-hover:border-blue-500 transition-colors">
            <Dna className="w-4 h-4 text-text-muted group-hover:text-blue-500 transition-colors" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
              Master Existing Knowledge
            </h3>
            <p className="manrope-body text-[13px] text-text-muted leading-relaxed font-medium">
              Browse proven community roadmaps in AI, Engineering, and Science.
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          
          {/* Subtle accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      <div className="mt-16 text-center">
        <button 
          onClick={onExit}
          className="inconsolata-ui text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest transition-all hover:tracking-[0.15em]"
        >
          Skip to Dashboard →
        </button>
      </div>
    </div>
  );
}
