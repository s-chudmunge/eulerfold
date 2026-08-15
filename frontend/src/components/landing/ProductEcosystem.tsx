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
    description: "Enter any subject to generate a curriculum with verified references, videos, theory, and assessments.",
    icon: Sparkles, 
    href: "/generate"
  },
  {
    id: 'job', 
    title: "Job Decoded",
    category: "Career",
    description: "Paste a job description from LinkedIn or Indeed to extract required skills and turn them into a course.",
    icon: Briefcase, 
    href: "/generate?mode=job"
  },
  {
    id: 'url', 
    title: "Deconstruct URL",
    category: "Sources",
    description: "Convert documentation pages, technical blogs, or GitHub repositories directly into an interactive curriculum.",
    icon: Link2, 
    href: "/generate?mode=url"
  },
  {
    id: 'syllabus', 
    title: "Syllabus Parser",
    category: "Import",
    description: "Transform course syllabi, textbook outlines, or lecture topics into structured learning modules.",
    icon: BookOpen, 
    href: "/generate?mode=syllabus"
  },
  {
    id: 'gaps', 
    title: "Skill Gap Analyzer",
    category: "Diagnostic",
    description: "Take a quick diagnostic quiz for your target role and generate a course tailored to your knowledge gaps.",
    icon: Target, 
    href: "/generate?mode=gaps"
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
    href: "/research-lab"
  },
  {
    id: 'planner', 
    title: "Study Planner",
    category: "Workflow",
    description: "Build daily study schedules from your active courses based on your available hours and target pace.",
    icon: Calendar, 
    href: "/planner"
  },
  {
    id: 'practice', 
    title: "Practice Portal",
    category: "Evaluation",
    description: "Complete AI-reviewed homework assignments and practice exercises to verify your understanding.",
    icon: Zap, 
    href: "/practice"
  },
];

export default function ProductEcosystem() {
  return (
    <section className="py-20 md:py-32 px-6 bg-background relative border-t border-border/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 md:mb-18">
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

        {/* Simple Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 max-w-3xl">
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
                  className="group flex items-center gap-3 py-2 px-3 rounded-md hover:bg-sidebar/50 transition-colors duration-200 -ml-3"
                >
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors shrink-0" strokeWidth={1.5} />
                  <span className="inconsolata-ui text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors">
                    {product.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover:text-accent/60 group-hover:translate-x-0.5 transition-all duration-200 ml-auto" strokeWidth={2} />
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
