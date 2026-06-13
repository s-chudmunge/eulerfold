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
    description: 'The fastest way to get started. Uses our managed cloud models to generate your roadmaps instantly.',
    points: [
      'No configuration required',
      'Uses your EulerFold credits',
      'Optimized for speed and accuracy'
    ]
  },
  {
    id: 'openrouter',
    title: 'Bring Your Key',
    subtitle: 'OpenRouter Integration',
    icon: <Key className="w-5 h-5 text-emerald-500" />,
    description: 'Connect your OpenRouter API key to unlock premium models and bypass generation limits.',
    points: [
      'Zero credit cost on EulerFold',
      'Access to GPT-4o, Claude 3.5, and more',
      'Key is stored securely in your browser'
    ]
  },
  {
    id: 'local',
    title: 'Local Inference',
    subtitle: '100% Privacy',
    icon: <Cpu className="w-5 h-5 text-amber-500" />,
    description: 'Run lightweight AI models directly inside your browser cache. No server interaction required.',
    points: [
      'Zero credit cost and unlimited usage',
      'Total privacy with no server API calls',
      'Runs locally via WebGPU integration'
    ]
  }
];

export default function GenerationSystems() {
  return (
    <section className="py-20 md:py-32 px-6 bg-background relative border-t border-border/30 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="w-8 h-px bg-accent/30"></div>
            <span className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase">Engine Architecture</span>
            <div className="w-8 h-px bg-accent/30"></div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-bold text-text-heading mb-6 tracking-tight manrope-body"
          >
            Choose how your learning paths are generated
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[13px] md:text-[15px] text-text-muted leading-relaxed font-medium"
          >
            EulerFold offers three distinct computation methods. Whether you want instant results, custom models, or absolute privacy, the choice is entirely yours.
          </motion.p>
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
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
