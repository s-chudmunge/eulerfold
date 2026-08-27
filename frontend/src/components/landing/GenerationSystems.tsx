"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Key, ArrowRight, HardDrive } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocalAIModal = dynamic(() => import('@/components/landing/LocalAIModal'), { ssr: false });

const SYSTEMS = [
  {
    id: 'default',
    title: 'EulerFold AI',
    subtitle: 'Zero Setup',
    icon: Cloud,
    description: 'Creates your course using our managed models, with credible resources. No API key needed.',
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
    subtitle: 'WebGPU (Beta)',
    icon: HardDrive,
    description: 'Run small models directly in your browser using WebGPU. No server calls, 100% private.',
    points: [
      'Zero cost, unlimited usage',
      'Runs completely offline once cached',
      'Best for text-heavy summarization and light research'
    ]
  }
];

export default function GenerationSystems() {
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  return (
    <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="mb-12">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4"
          >
            Generation Modes
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SYSTEMS.map((system, index) => {
            const buttonLabel =
              system.id === 'default'
                ? 'Get started'
                : system.id === 'openrouter'
                ? 'Connect key'
                : 'Try local inference';

            return (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="border border-border rounded-lg p-6 flex flex-col"
              >
                {/* Title */}
                <h3 className="text-[18px] font-bold text-text-heading mb-2">
                  {system.title}
                </h3>

                {/* Description */}
                <p className="text-text-muted text-[14px] leading-relaxed mb-4">
                  {system.description}
                </p>

                {/* Bullet Points */}
                <ul className="flex flex-col gap-1.5 mb-4">
                  {system.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-[13px] text-text-muted">
                      <span className="mt-[6px] w-1 h-1 rounded-full bg-text-muted shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div className="flex-grow" />

                {/* Button */}
                <button
                  className="inline-block bg-text-heading text-background text-[13px] font-semibold px-4 py-2 rounded-md hover:opacity-80 transition-opacity text-left w-fit"
                  onClick={() => {
                    if (system.id === 'openrouter') {
                      window.open('https://openrouter.ai/models', '_blank');
                    } else if (system.id === 'local') {
                      setIsLocalModalOpen(true);
                    }
                  }}
                >
                  {buttonLabel}
                </button>
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
