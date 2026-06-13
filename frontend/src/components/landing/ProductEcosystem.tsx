"use client";

import React from 'react';
import { Briefcase, Calendar, Microscope, Target, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const products = [
  {
    title: "Decode",
    description: "On-demand technical breakdown of academic papers. Convert complex research into precise technical blueprints.",
    icon: Microscope,
    href: "/research-lab",
    isNew: true,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "Job Decoded",
    description: "Turn any job description into a learning path. See exactly what skills you are missing for a specific role.",
    icon: Briefcase,
    href: "/generate?mode=job",
    isNew: true,
    color: "text-teal-700",
    bgColor: "bg-teal-700/10"
  },
  {
    title: "Study Planner",
    description: "Create a daily schedule from your roadmaps. Pick your intensity and get a list of tasks to complete.",
    icon: Calendar,
    href: "/planner",
    isNew: true,
    color: "text-accent",
    bgColor: "bg-accent/10"
  },

  {
    title: "Practice",
    description: "Test your knowledge with AI-generated assessments and practice problems across 20+ domains.",
    icon: Target,
    href: "/practice",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10"
  },
  {
    title: "Roadmap Generator",
    description: "Generate personalized, step-by-step learning paths for any subject or skill in seconds.",
    icon: Zap,
    href: "/generate",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10"
  }
];

export default function ProductEcosystem() {

  return (
    <section className="py-10 md:py-20 px-6 bg-sidebar/30 border-y border-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="inconsolata-ui text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-3">New Tools</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-text-heading tracking-tight leading-tight">Tools to help you learn and build.</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {products.map((p, index) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Link href={p.href} className="flex flex-col p-6 lg:p-8 border border-border rounded-lg bg-transparent relative h-full transition-all duration-300 hover:border-accent/40 group">
                  {/* Hover glow background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-accent/[0.03] group-hover:to-transparent transition-all duration-500 z-0"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="inconsolata-ui text-xl lg:text-2xl font-bold text-text-heading">{p.title}</h4>
                        {p.isNew && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-accent px-2 py-0.5 rounded-full border border-accent/20 bg-accent/5">
                            New
                          </span>
                        )}
                      </div>
                      <div className={`w-8 h-8 ${p.color} flex items-center justify-center group-hover:scale-[1.1] transition-transform duration-300`}>
                        <p.icon className="w-full h-full" />
                      </div>
                    </div>
                    
                    <p className="manrope-body text-[12px] lg:text-[13px] text-text-muted mt-3 leading-relaxed flex-1">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-widest group-hover:gap-3 transition-all mt-6">
                      Launch <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
