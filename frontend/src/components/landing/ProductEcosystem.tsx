"use client";

import React from 'react';
import { Sparkles, Briefcase, Link2, BookOpen, Target, FileSearch, Calendar, Zap, ArrowRight, Microscope } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  icon?: React.ElementType;
  imageIcon?: string;
  href: string;
}

const products: Product[] = [
  {
    id: 'architect', 
    title: "AI Architect",
    category: "Curriculum",
    description: "Build custom step-by-step roadmaps from goals, job posts, syllabi, or URLs with verified lectures and reading.",
    icon: Sparkles, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'goldfish', 
    title: "Goldfish Agentic Co-Pilot",
    category: "Assistance",
    description: "A helpful agentic companion by your side at all times while learning.",
    imageIcon: "/goldfish/goldfish_happy.png", 
    href: "/#hero-prompt-input"
  },
  {
    id: 'decode', 
    title: "Research Decoded",
    category: "Analysis",
    description: "Read first-principles breakdowns of foundation research papers with math derivations and code.",
    icon: FileSearch, 
    href: "/research-decoded"
  },
  {
    id: 'gaps', 
    title: "Skill Gap Analyzer",
    category: "Diagnostic",
    description: "Take targeted diagnostic quizzes to uncover exact knowledge gaps and skip concepts you already know.",
    icon: Target, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'planner', 
    title: "Study Planner & Focus",
    category: "Workflow",
    description: "Schedule daily study sessions from your active courses and stay locked in with integrated Pomodoro sessions.",
    icon: Calendar, 
    href: "/planner"
  },
  {
    id: 'lab', 
    title: "Research Lab",
    category: "Exploration",
    description: "Explore technical documents and break down complex research architectures interactively.",
    icon: Microscope, 
    href: "/"
  },
];

export default function ProductEcosystem() {
  return (
    <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-12 justify-between">

          {/* Section Header */}
          <div className="max-w-sm mb-8 md:mb-0">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4"
            >
              The EulerFold Ecosystem
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-2xl md:text-[2.25rem] font-bold text-text-heading tracking-tight leading-[1.2] mb-4"
            >
              Everything you need to learn on your own terms.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="text-[14px] text-text-muted leading-relaxed"
            >
              From structured curriculum generation to autonomous lecture searching and first-principles paper breakdowns.
            </motion.p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl flex-grow">
            {products.map((product, index) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={product.href}
                    onClick={(e) => {
                      if (product.href === "/#hero-prompt-input") {
                        e.preventDefault();
                        const el = document.getElementById('hero-prompt-input');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        // Dispatch event to HeroPromptInput
                        const modeMap: Record<string, string> = {
                          'architect': 'ai',
                          'gaps': 'gaps'
                        };
                        const targetMode = modeMap[product.id];
                        if (targetMode) {
                          window.dispatchEvent(new CustomEvent('hero-mode-select', { detail: { mode: targetMode } }));
                        }
                      }
                    }}
                    className="border border-border rounded-md bg-sidebar/50 p-4 flex flex-col gap-2 hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {product.imageIcon ? (
                        <img src={product.imageIcon} alt="" className="w-4 h-4 object-contain shrink-0" />
                      ) : Icon ? (
                        <Icon className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} />
                      ) : null}
                      <span className="text-[14px] font-bold text-text-heading">
                        {product.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
