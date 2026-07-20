"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Key, Cpu } from 'lucide-react';

const SYSTEMS = [
  {
    id: 'default',
    title: 'EulerFold AI',
    subtitle: 'Zero Setup',
    icon: <Cloud className="w-5 h-5 text-accent" />,
    description: 'Uses Gemini models to generate your course with verified references. No setup needed. Just enter a topic and go.',
    points: [
      'No API key or configuration needed',
      'Courses include papers, videos, and assessments',
      'Uses your monthly EulerFold credit balance'
    ]
  },
  {
    id: 'openrouter',
    title: 'Bring Your Key',
    subtitle: 'OpenRouter Integration',
    icon: <Key className="w-5 h-5 text-emerald-500" />,
    description: 'Connect your OpenRouter API key to pick from 50+ models including Claude, GPT-4o, and Gemini Pro.',
    points: [
      'Zero credit cost on EulerFold',
      'Access Claude 3.5, GPT-4o, Gemini, Llama, and more',
      'Key stays in your browser, never sent to our servers'
    ]
  },
  {
    id: 'local',
    title: 'Local Inference',
    subtitle: '100% Privacy',
    icon: <Cpu className="w-5 h-5 text-amber-500" />,
    description: 'Run a lightweight model directly in your browser via WebGPU. Nothing leaves your device.',
    points: [
      'Completely free and unlimited',
      'Total privacy. No server calls at all',
      'Requires a modern GPU and WebGPU-capable browser'
    ]
  }
];

export default function GenerationSystems() {
  return (
    <section className="py-20 md:py-32 px-6 bg-background relative border-t border-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block text-[12px] md:text-[13px] text-accent font-bold uppercase tracking-[0.2em] mb-4"
          >
            Three Ways to Generate
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-bold text-text-heading tracking-tight leading-[1.25] max-w-2xl mx-auto"
          >
            Use our managed models, bring your own API key, or run inference locally.{' '}
            <br className="hidden md:block" />
            <span className="font-serif italic text-accent opacity-90 text-[36px] md:text-[48px] tracking-normal font-medium">Your choice.</span>
          </motion.h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {SYSTEMS.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group h-full"
            >
              <div className="flex flex-col p-6 lg:p-8 border border-border rounded-lg bg-transparent relative h-full transition-all duration-300 hover:border-accent/40 group">
                <div className="mb-6">
                  <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 inline-block">
                    {system.subtitle}
                  </span>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inconsolata-ui text-xl lg:text-2xl font-bold text-text-heading">{system.title}</span>
                    <div className="flex items-center">
                        {system.icon}
                    </div>
                  </div>
                  <p className="manrope-body text-[12px] lg:text-[13px] text-text-muted mt-3 leading-relaxed">
                    {system.description}
                  </p>
                </div>

                <div className="space-y-3 flex-1 text-[11px] lg:text-[12px] text-text-primary font-medium mt-4">
                  {system.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-accent shrink-0">✓</span>
                      <span className="leading-snug text-text-secondary group-hover:text-text-primary transition-colors">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
