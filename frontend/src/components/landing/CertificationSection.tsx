"use client";

import React from 'react';
import { Linkedin, ShieldCheck, ArrowRight, Clock, Star, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CertificationSection() {
  return (
    <section className="py-20 md:py-32 px-6 bg-sidebar border-y border-border/40 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">

        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              Certifications
            </span>
            <h2 className="text-2xl md:text-[2.25rem] font-bold text-text-heading tracking-tight leading-[1.2]">
              Don't just learn a skill.<br />
              Prove it.
            </h2>
            <p className="text-[14px] text-text-muted leading-relaxed max-w-sm">
              Finish any course to earn a verifiable certificate that records your time invested, modules completed, and technical assessment grade.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Detailed Skill Breakdown',
                desc: 'Every certificate lists the exact technical concepts you mastered and your assessment scores.'
              },
              {
                icon: Linkedin,
                title: '1-Click LinkedIn Export',
                desc: 'Add your verified credentials directly to LinkedIn Licenses & Certifications in one click.'
              },
              {
                icon: Clock,
                title: 'Tracks Study Hours',
                desc: 'Study time is recorded per session and embedded in the certificate — not self-reported.'
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-text-heading mb-0.5">{title}</h4>
                  <p className="text-[12.5px] text-text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-teal-700 text-white rounded-md text-[13px] font-bold tracking-tight transition-colors shadow-sm"
          >
            Start Earning <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Right: Certificate mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-sm bg-background border border-border rounded-lg overflow-hidden shadow-lg">
            {/* Certificate header */}
            <div className="bg-accent/8 border-b border-border/60 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/apple-touch-icon.png" alt="EulerFold" className="w-6 h-6" />
                <span className="text-[13px] font-bold text-text-heading tracking-tight">EulerFold AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </div>
            </div>

            {/* Certificate body */}
            <div className="px-6 py-6 space-y-5">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted/60 mb-1.5">
                  Certificate of Completion
                </span>
                <h3 className="text-[17px] font-bold text-text-heading leading-snug">
                  Systems Design & Architecture
                </h3>

              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Study Time', value: '36h 14m' },
                  { label: 'Tech Grade', value: 'A' },
                  { label: 'Modules', value: '12 / 12' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-sidebar border border-border/60 rounded-md px-3 py-2.5 text-center">
                    <p className="text-[15px] font-bold text-text-heading">{value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted/60 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted/60 mb-2">Verified Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Load Balancing', 'CAP Theorem', 'Distributed Systems', 'Caching', 'Database Sharding', 'API Design'].map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-sidebar border border-border/70 text-[10px] text-text-muted font-medium rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / LinkedIn export */}
            <div className="px-6 pb-5">
              <button className="w-full flex items-center justify-center gap-2 py-2 border border-[#0A66C2]/40 bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 text-[#0A66C2] rounded-md text-[11.5px] font-bold tracking-tight transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
                Add to LinkedIn Profile
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
