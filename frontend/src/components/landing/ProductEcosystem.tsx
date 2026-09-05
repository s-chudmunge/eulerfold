"use client";

import React from 'react';
import { Route, Repeat, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Pillar {
  id: string;
  step: string;
  title: string;
  description: string;
  icon?: React.ElementType;
  imageIcon?: string;
  actionText: string;
  href: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'curriculum',
    step: '01',
    title: 'Autonomous Curriculum',
    description: 'Turns any prompt, syllabus, or link into a structured roadmap with curated lectures and papers.',
    icon: Route,
    actionText: 'Generate roadmap',
    href: '/#hero-prompt-input'
  },
  {
    id: 'feedback-loop',
    step: '02',
    title: 'Agentic Feedback Loop',
    description: 'Continuously tests your grasp through checkpoints, adapts explanations to weak spots, and unlocks lessons as you master them.',
    icon: Repeat,
    actionText: 'Explore library',
    href: '/explore'
  },
  {
    id: 'copilot',
    step: '03',
    title: 'Runtime Co-Pilot & Focus',
    description: 'An on-demand tutor for doubts, automated study schedules, and timed focus sessions that reward consistency.',
    imageIcon: '/goldfish/goldfish_happy.png',
    actionText: 'Study planner',
    href: '/planner'
  },
];

export default function ProductEcosystem() {
  const handlePillarClick = (e: React.MouseEvent, pillar: Pillar) => {
    if (pillar.href === '/#hero-prompt-input') {
      e.preventDefault();
      const el = document.getElementById('hero-prompt-input');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <section className="py-20 md:py-28 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3"
          >
            Agentic Learning Infrastructure
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-[2rem] font-bold text-text-heading tracking-tight leading-[1.2] mb-3"
          >
            Spend time learning, not figuring out what to study next.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[14px] text-text-muted leading-relaxed"
          >
            Get an organized study path, test your understanding as you go, and stay consistent with structured focus blocks.
          </motion.p>
        </div>

        {/* 3 Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={pillar.href}
                  onClick={(e) => handlePillarClick(e, pillar)}
                  className="h-full border border-border rounded-md bg-sidebar/50 p-6 flex flex-col justify-between hover:border-accent/40 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inconsolata-ui text-[11px] font-bold text-accent tracking-wider">
                        {pillar.step}
                      </span>
                      {pillar.imageIcon ? (
                        <img src={pillar.imageIcon} alt="" className="w-5 h-5 object-contain" />
                      ) : Icon ? (
                        <Icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" strokeWidth={1.5} />
                      ) : null}
                    </div>
                    <h3 className="text-[16px] font-bold text-text-heading mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-[13px] text-text-muted leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/40 flex items-center gap-1.5 text-[12px] font-semibold text-text-heading group-hover:text-accent transition-colors">
                    <span>{pillar.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
