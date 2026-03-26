import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function StaticHeroShell() {
  return (
    <div className="relative bg-background overflow-hidden transition-colors duration-300 min-h-screen flex items-center justify-center pt-14">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#666 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="mt-8 md:mt-12 mb-10 max-w-4xl mx-auto leading-[1.1] tracking-tight text-text-heading inconsolata-ui z-10 relative">
          <span className="block text-[28px] md:text-[36px] font-bold text-text-muted mb-2">
            Turn Study Time Into
          </span>
          <span className="inline-block text-[42px] md:text-[56px] font-bold text-text-heading">
            Real Skills.
          </span>
        </h1>

        <div className="flex flex-col items-center gap-4 mb-10 z-10 relative">
          <div className="w-[200px] h-[44px] bg-[var(--text-heading)] rounded-lg opacity-90"></div>
          
          <div className="flex flex-col items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
              <div className="w-[180px] h-[14px] bg-[var(--border)] rounded animate-pulse"></div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-[var(--bg-main)] bg-[var(--border)]"></div>
                ))}
              </div>
              <div className="w-[120px] h-[14px] bg-[var(--border)] rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <p className="text-[14px] md:text-[16px] text-text-muted mb-12 max-w-xl mx-auto manrope-body z-10 relative font-medium tracking-tight">
          Go from confused to confident, <span className="text-accent">one week at a time.</span>
        </p>
      </div>
    </div>
  );
}
