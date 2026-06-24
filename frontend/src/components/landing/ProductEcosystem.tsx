"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '../EulerLogoCanvas';

const products = [
  {
    title: "AI Architect",
    description: "Build custom, technical roadmaps curated in real-time from any topic.",
    logoProps: { color1: 0xb45309, color2: 0xfbbf24, wireframe: false },
    href: "/generate",
    isNew: true,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10"
  },
  {
    title: "Job Decoded",
    description: "Reverse engineer your dream job. Paste a JD and get a personalized path to learn the exact skills required.",
    logoProps: { color1: 0x0f766e, color2: 0x2dd4bf, wireframe: false },
    href: "/job-decoded",
    isNew: true,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10"
  },
  {
    title: "Deconstruct URL",
    description: "Learn tech directly from the source. Turn any GitHub repo or docs link into a curriculum.",
    logoProps: { color1: 0x4f46e5, color2: 0x818cf8, wireframe: false },
    href: "/link-to-roadmap",
    isNew: true,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10"
  },
  {
    title: "Syllabus Parser",
    description: "Got a list of topics from a college class? Paste it here to build an interactive learning path.",
    logoProps: { color1: 0xc2410c, color2: 0xf97316, wireframe: false },
    href: "/syllabus-to-roadmap",
    isNew: true,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10"
  },
  {
    title: "Skill Gap Analyzer",
    description: "Take a diagnostic quiz and get a roadmap strictly focused on fixing your weak spots.",
    logoProps: { color1: 0xe11d48, color2: 0xfb7185, wireframe: false },
    href: "/skill-gap-analyzer",
    isNew: true,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10"
  },
  {
    title: "Decode",
    description: "On-demand technical breakdown of academic papers. Convert complex research into blueprints.",
    logoProps: { color1: 0x1e3a8a, color2: 0x3b82f6, emissive1: 0x1d4ed8, emissive2: 0x2563eb, emissiveIntensity: 0.6, wireframe: true },
    href: "/research-lab",
    isNew: true,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10"
  },
  {
    title: "Study Planner",
    description: "Create a daily schedule from your roadmaps. Pick your intensity and get tasks to complete.",
    logoProps: { color1: 0x94a3b8, color2: 0x0f766e, emissive1: 0x475569, emissive2: 0x0d9488, emissiveIntensity: 0.4, wireframe: true },
    href: "/planner",
    isNew: true,
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    title: "Practice",
    description: "Test your knowledge with AI-generated assessments and practice problems across domains.",
    logoProps: { color1: 0x064e3b, color2: 0x10b981, wireframe: false },
    href: "/practice",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
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
                        <h4 className="inconsolata-ui text-lg lg:text-xl font-bold text-text-heading">{p.title}</h4>
                      </div>
                      <div className={`w-8 h-8 flex items-center justify-center group-hover:scale-[1.1] transition-transform duration-300`}>
                        <EulerLogoCanvas size={32} {...p.logoProps} />
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
