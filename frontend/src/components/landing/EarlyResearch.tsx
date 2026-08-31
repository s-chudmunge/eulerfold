"use client";

import React from 'react';
import { ArrowRight, Compass, FileText } from 'lucide-react';

export default function EarlyResearch() {
  const scrollToHeroWithPreset = (samplePrompt?: string) => {
    const heroInput = document.getElementById('hero-prompt-input');
    const heroTextarea = document.getElementById('hero-prompt-textarea') as HTMLTextAreaElement | null;

    if (heroInput) {
      heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      if (heroTextarea) {
        if (samplePrompt) {
          heroTextarea.value = samplePrompt;
          // Dispatch input event so React state updates if controlled
          heroTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        heroTextarea.focus();
      }
    }, 450);
  };

  return (
    <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-2">
              Research & Discovery
            </p>
            <h2 className="text-2xl font-bold text-text-heading tracking-tight">
              Use our tools for early research and discovery.
            </h2>
          </div>
          <div>
            <button
              onClick={() => scrollToHeroWithPreset()}
              className="text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Start research <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Domain Mapping */}
          <div className="flex flex-col border border-border rounded-md p-6 bg-transparent justify-between">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-accent">
                <Compass className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Technical Landscape
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-text-heading leading-snug tracking-tight mb-3">
                Understand how a new domain fits together
              </h3>
              <p className="text-text-muted text-[14px] leading-relaxed">
                Generate a fast, structured map of any field. See prerequisite concepts, core building blocks, and technical dependencies before building or committing.
              </p>
            </div>

            <div>
              <p className="text-[12px] text-text-muted mb-3">
                Map prerequisites · See core architecture
              </p>
              <button
                onClick={() => scrollToHeroWithPreset("Survey the landscape and core concepts of ")}
                className="inline-flex items-center gap-2 bg-text-heading text-background text-[13px] font-semibold px-4 py-2 rounded-md hover:opacity-80 transition-opacity cursor-pointer"
              >
                Map a topic <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Foundational Literature */}
          <div className="flex flex-col border border-border rounded-md p-6 bg-transparent justify-between">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-accent">
                <FileText className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Papers & Reference Docs
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-text-heading leading-snug tracking-tight mb-3">
                Find the papers and documentation that matter
              </h3>
              <p className="text-text-muted text-[14px] leading-relaxed">
                Surface key research papers, official documentation, and technical deep dives without spending hours sifting through search noise.
              </p>
            </div>

            <div>
              <p className="text-[12px] text-text-muted mb-3">
                Direct citations · Seminal reading lists
              </p>
              <button
                onClick={() => scrollToHeroWithPreset("Deep dive into foundational papers and research behind ")}
                className="inline-flex items-center gap-2 bg-text-heading text-background text-[13px] font-semibold px-4 py-2 rounded-md hover:opacity-80 transition-opacity cursor-pointer"
              >
                Find papers <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
