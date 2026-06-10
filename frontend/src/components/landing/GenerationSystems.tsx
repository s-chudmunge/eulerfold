"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Key, Cpu } from 'lucide-react';

const SYSTEMS = [
  {
    id: 'default',
    title: 'Cloud AI',
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

        {/* Carousel / Grid Container */}
        <div className="flex overflow-x-auto pb-12 pt-4 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:overflow-visible">
          {SYSTEMS.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="min-w-[300px] md:min-w-0 snap-start relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-border/50 to-transparent rounded-3xl -z-10 group-hover:scale-[1.02] transition-transform duration-500"></div>
              
              <div className="bg-sidebar border border-border/50 hover:border-accent/30 transition-colors duration-300 rounded-2xl p-8 h-full flex flex-col relative overflow-hidden backdrop-blur-sm shadow-sm">
                
                {/* Top header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                    {system.icon}
                  </div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-3 py-1 bg-background border border-border rounded-full">
                    {system.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text-heading mb-3 tracking-tight">{system.title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed mb-8 flex-grow">
                  {system.description}
                </p>

                <ul className="space-y-4 border-t border-border/50 pt-6">
                  {system.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors"></div>
                      </div>
                      <span className="text-[12px] font-medium text-text-secondary leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
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
