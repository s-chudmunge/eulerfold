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
  icon: React.ElementType;
  href: string;
}

const products: Product[] = [
  {
    id: 'architect', 
    title: "AI Architect",
    category: "Generation",
    description: "Enter any subject to generate a curriculum with credible resources, videos, theory, and assessments.",
    icon: Sparkles, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'job', 
    title: "Job Decoded",
    category: "Career",
    description: "Paste a job description from LinkedIn or Indeed to extract required skills and turn them into a course.",
    icon: Briefcase, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'url', 
    title: "Deconstruct URL",
    category: "Sources",
    description: "Convert documentation pages, technical blogs, or GitHub repositories directly into an interactive curriculum.",
    icon: Link2, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'syllabus', 
    title: "Syllabus Parser",
    category: "Import",
    description: "Transform course syllabi, textbook outlines, or lecture topics into structured learning modules.",
    icon: BookOpen, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'gaps', 
    title: "Skill Gap Analyzer",
    category: "Diagnostic",
    description: "Take a quick diagnostic quiz for your target role and generate a course tailored to your knowledge gaps.",
    icon: Target, 
    href: "/#hero-prompt-input"
  },
  {
    id: 'decode', 
    title: "Research Decoded",
    category: "Analysis",
    description: "Read technical breakdowns of complex academic papers with first-principles explanations and math.",
    icon: FileSearch, 
    href: "/research-decoded"
  },
  {
    id: 'lab', 
    title: "Research Lab",
    category: "Exploration",
    description: "Explore technical documents and dissect complex research architectures in an interactive environment.",
    icon: Microscope, 
    href: "/"
  },
  {
    id: 'planner', 
    title: "Study Planner",
    category: "Workflow",
    description: "Build daily study schedules from your active courses based on your available hours and target pace.",
    icon: Calendar, 
    href: "/planner"
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
              Tools to deconstruct topics, build courses, and prove mastery.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="text-[14px] text-text-muted leading-relaxed"
            >
              Explore our specialized tools designed for deep technical learning and skill verification.
            </motion.p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-xl flex-grow">
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
                          'job': 'job',
                          'url': 'url',
                          'syllabus': 'syllabus',
                          'gaps': 'gaps'
                        };
                        const targetMode = modeMap[product.id];
                        if (targetMode) {
                          window.dispatchEvent(new CustomEvent('hero-mode-select', { detail: { mode: targetMode } }));
                        }
                      }
                    }}
                    className="border border-border rounded-lg p-4 flex flex-col gap-2 hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} />
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
