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
    description: 'Creates your course using our managed models, with verified references. No API key needed.',
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
      {/* Subtle grid pattern in the background of the section */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="group relative overflow-hidden rounded-2xl bg-sidebar/50 border border-border backdrop-blur-xl shadow-sm px-6 py-10 sm:p-10 md:p-16 transition-all hover:shadow-md">
          
          {/* Decorative gradient blur */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-80 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-12">
            {/* Section Header */}
            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4"
              >
                Three Ways to Create
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-2xl md:text-[2.25rem] font-bold text-text-heading tracking-tight leading-[1.2] mb-4"
              >
                Choose how your course gets built.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.14 }}
                className="text-[14px] text-text-muted leading-relaxed"
              >
                Pick what fits your workflow. You can switch between modes at any time.
              </motion.p>
            </div>

            {/* Minimal List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 w-full">
              {SYSTEMS.map((system, index) => {
                const Icon = system.icon;
                return (
                  <motion.div
                    key={system.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="group/item flex flex-col items-start gap-2 py-4 px-5 rounded-lg bg-background/40 hover:bg-background border border-transparent hover:border-border/60 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (system.hasGallery) setIsLocalAIModalOpen(true);
                      if (system.id === 'openrouter') window.open('https://openrouter.ai/models', '_blank');
                    }}
                  >
                    <div className="flex items-center gap-3 w-full mb-2">
                      <Icon className="w-5 h-5 text-text-muted group-hover/item:text-accent transition-colors shrink-0" strokeWidth={1.5} />
                      <span className="inconsolata-ui text-[15px] font-bold text-text-heading group-hover/item:text-accent transition-colors">
                        {system.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-transparent group-hover/item:text-accent/60 group-hover/item:translate-x-0.5 transition-all duration-200 ml-auto" strokeWidth={2} />
                    </div>
                    <p className="manrope-body text-[13px] text-text-muted leading-relaxed">
                      {system.description}
                    </p>
                    {system.hasGallery && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors mt-3">
                        <Layers className="w-3 h-3" strokeWidth={1.5} />
                        Browse Model Gallery
                      </span>
                    )}
                    {system.id === 'openrouter' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors mt-3">
                        <Layers className="w-3 h-3" strokeWidth={1.5} />
                        Browse OpenRouter Models
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
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
