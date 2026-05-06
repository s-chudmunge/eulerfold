"use client";

import React from 'react';
import { Briefcase, Calendar, Microscope, Terminal, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const products = [
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
    title: "Research Decoded",
    description: "Read simple breakdowns of technical papers. Understand new research without the usual complexity.",
    icon: Microscope,
    href: "/research-decoded",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "BuildPilot",
    description: "A workspace to build and track your projects. Verify your skills by doing actual work.",
    icon: Terminal,
    href: "/buildpilot",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10"
  }
];

export default function ProductEcosystem() {
  return (
    <section className="py-20 px-6 bg-sidebar/30 border-y border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="inconsolata-ui text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-3">New Tools</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-text-heading tracking-tight leading-tight">Tools to help you learn and build.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.title} href={p.href} className="group bg-background border border-border p-6 rounded-xl hover:border-accent/30 transition-all flex flex-col h-full">
              <div className={`w-10 h-10 ${p.bgColor} ${p.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <p.icon className="w-5 h-5" />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[15px] font-bold text-text-heading tracking-tight">{p.title}</h4>
                {p.isNew && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-accent text-white px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5">
                    New
                  </span>
                )}
              </div>
              
              <p className="manrope-body text-[13px] text-text-muted font-medium leading-relaxed mb-8 flex-1">
                {p.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest group-hover:gap-2.5 transition-all">
                Try it <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
