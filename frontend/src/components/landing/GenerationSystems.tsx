"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Terminal, Cpu, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocalAIModal = dynamic(() => import('@/components/landing/LocalAIModal'), { ssr: false });

const SYSTEMS = [
  {
    id: 'default',
    title: 'Managed AI',
    subtitle: 'Zero Setup',
    icon: Layers,
    description: 'Generates your curriculum using curated models and primary resources out of the box.',
    actionLabel: 'Get started',
  },
  {
    id: 'openrouter',
    title: 'Bring Your Key',
    subtitle: 'OpenRouter',
    icon: Terminal,
    description: 'Route roadmap generation through 50+ frontier models using your private OpenRouter API key.',
    actionLabel: 'Connect key',
  },
  {
    id: 'local',
    title: 'Local Inference',
    subtitle: 'WebGPU',
    icon: Cpu,
    description: 'Run small models directly in your browser with zero server calls and full privacy.',
    actionLabel: 'Try local inference',
  }
];

export default function GenerationSystems() {
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3"
          >
            Model Routing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-[2rem] font-bold text-text-heading tracking-tight leading-[1.2] mb-3"
          >
            Choose how your course gets built.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[14px] text-text-muted leading-relaxed"
          >
            Run on our cloud defaults, connect your preferred API key, or compute entirely client-side.
          </motion.p>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SYSTEMS.map((system, index) => {
            const Icon = system.icon;
            return (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-md bg-sidebar/50 p-6 flex flex-col justify-between hover:border-accent/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inconsolata-ui text-[10px] font-bold text-accent uppercase tracking-wider">
                      {system.subtitle}
                    </span>
                    <Icon className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-bold text-text-heading mb-2">
                    {system.title}
                  </h3>
                  <p className="text-[13px] text-text-muted leading-relaxed">
                    {system.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-border/40">
                  <button
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-heading hover:text-accent transition-colors cursor-pointer"
                    onClick={() => {
                      if (system.id === 'default') {
                        const el = document.getElementById('hero-prompt-input');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (system.id === 'openrouter') {
                        window.open('https://openrouter.ai/models', '_blank');
                      } else if (system.id === 'local') {
                        setIsLocalModalOpen(true);
                      }
                    }}
                  >
                    <span>{system.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {isLocalModalOpen && (
        <LocalAIModal
          isOpen={isLocalModalOpen}
          onClose={() => setIsLocalModalOpen(false)}
          onSelectModel={(id, name) => {
            localStorage.setItem('local_ai_model', id);
            localStorage.setItem('local_ai_model_name', name);
            localStorage.setItem('use_local_ai', 'true');
            localStorage.setItem('use_openrouter', 'false');
            window.dispatchEvent(new Event('ai_settings_changed'));
          }}
        />
      )}
    </section>
  );
}
