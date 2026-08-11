"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Key, Cpu, ArrowRight, Layers } from 'lucide-react';
import { LocalAIModal } from './LocalAIModal';

const SYSTEMS = [
  {
    id: 'default',
    title: 'EulerFold AI',
    subtitle: 'Zero Setup',
    icon: Cloud,
    description: 'Generates your course using our managed models, with verified references. No API key needed.',
    points: [
      'No API key or configuration needed',
      'Courses include papers, videos, and assessments',
      'Uses your monthly EulerFold credit balance'
    ]
  },
  {
    id: 'openrouter',
    title: 'Bring Your Key',
    subtitle: 'OpenRouter',
    icon: Key,
    description: 'Connect your OpenRouter key to pick from 50+ models: Claude Opus 5, GPT-5.6, Gemini 3.6, and more.',
    points: [
      'Zero credit cost on EulerFold',
      'Access Claude Opus 5, GPT-5.6, Gemini 3.6 Flash, DeepSeek, and more',
      'Key stays in your browser, never sent to our servers'
    ]
  },
  {
    id: 'local',
    title: 'Local Inference',
    subtitle: '100% Privacy',
    icon: Cpu,
    description: 'Run open-weight models in your browser via WebGPU. 160+ models available. Nothing leaves your device.',
    points: [
      'Llama 3.1 8B, DeepSeek R1, Phi-4 Mini, Qwen 2.5, and more',
      'Completely free with no credit cost',
      'Total privacy. No server calls at all.'
    ],
    hasGallery: true
  }
];

export default function GenerationSystems() {
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);

  return (
    <section className="py-20 md:py-32 px-6 bg-background relative border-t border-border/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Neysa-style grid: header card left + 3 option cards right */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Left header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1 flex flex-col justify-between border border-border rounded-lg p-7 bg-sidebar min-h-[260px]"
          >
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-5">
                Three Ways to Generate
              </span>
              <h2 className="text-[1.55rem] leading-[1.2] font-bold text-text-heading tracking-tight">
                Choose how your course gets built.
              </h2>
            </div>
            <p className="manrope-body text-[13px] text-text-muted leading-relaxed mt-6">
              Pick what fits your workflow. You can switch between modes at any time.
            </p>
          </motion.div>

          {/* Three option cards */}
          {SYSTEMS.map((system, index) => {
            const Icon = system.icon;
            return (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="group relative flex flex-col justify-between border border-border rounded-lg p-7 bg-background hover:bg-sidebar transition-colors duration-300 cursor-pointer min-h-[260px]"
              >
                {/* Top: Icon */}
                <div className="flex flex-col items-start gap-5">
                  <div className="w-10 h-10 rounded-md border border-border/70 bg-background flex items-center justify-center group-hover:border-accent/30 transition-colors">
                    <Icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" strokeWidth={1.5} />
                  </div>

                  {/* Title block */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/70 mb-1.5">
                      {system.subtitle}
                    </span>
                    <h3 className="inconsolata-ui text-[1.05rem] font-bold text-text-heading leading-tight mb-3">
                      {system.title}
                    </h3>
                    <p className="manrope-body text-[12.5px] text-text-muted leading-relaxed">
                      {system.description}
                    </p>
                  </div>
                </div>

                {/* Bottom: bullet points + gallery button/link */}
                <div className="mt-6 pt-5 border-t border-border/50 flex flex-col gap-4">
                  <div className="flex items-end justify-between gap-4">
                    <ul className="space-y-1.5">
                      {system.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-muted">
                          <span className="text-accent/60 shrink-0 mt-px text-[8px]">●</span>
                          <span className="leading-snug">{point}</span>
                        </li>
                      ))}
                    </ul>
                    {!system.hasGallery && system.id !== 'openrouter' && (
                      <ArrowRight
                        className="w-4 h-4 text-text-muted/40 shrink-0 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  {system.hasGallery && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLocalAIModalOpen(true);
                      }}
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors w-fit"
                    >
                      <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Browse Model Gallery
                    </button>
                  )}
                  {system.id === 'openrouter' && (
                    <a
                      href="https://openrouter.ai/models"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors mt-auto w-fit"
                    >
                      <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Browse OpenRouter Models
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      <LocalAIModal 
        isOpen={isLocalAIModalOpen}
        onClose={() => setIsLocalAIModalOpen(false)}
        onSelectModel={(modelId, modelName) => {
          // Store both sets of keys to satisfy all parts of the application
          localStorage.setItem('localAIModelId', modelId);
          localStorage.setItem('localAIModelName', modelName);
          localStorage.setItem('local_ai_model', modelId);
          localStorage.setItem('local_ai_model_name', modelName);
          localStorage.setItem('use_local_ai', 'true');
          localStorage.setItem('use_openrouter', 'false');
          setIsLocalAIModalOpen(false);
          // Dispatch settings changed event
          window.dispatchEvent(new Event('ai_settings_changed'));
        }}
      />
    </section>
  );
}
