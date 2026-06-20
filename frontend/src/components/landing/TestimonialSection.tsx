"use client";

import React from 'react';
import { motion } from 'framer-motion';
import ActivityPill from '@/components/ActivityPill';

const testimonials = [
  {
    quote: "I was struggling with where to start with LLMs. EulerFold gave me a roadmap in like 5 seconds that actually made sense. The reviews are tough but fair.",
    author: "Reet Tiwari",
    role: "Software Engineer",
    initials: "RT",
    color: "bg-accent/10 text-accent",
    layout: "author-top"
  },
  {
    quote: "The search for research papers is usually a mess. This portal actually organizes them into a path. Saved me so much time on my thesis.",
    author: "Pihu Mishra",
    role: "Grad Student",
    initials: "PM",
    color: "bg-teal-500/10 text-teal-600",
    layout: "quote-bottom"
  },
  {
    quote: "I finally passed my systems design interview because I actually had to prove I knew the stuff. No more passive video watching.",
    author: "Fatehgopal Agnihotri",
    role: "CS Student",
    initials: "FA",
    color: "bg-blue-500/10 text-blue-600",
    layout: "standard"
  },
  {
    quote: "The AI roadmaps aren't just generic lists. They actually link to the right papers and videos. It's my go-to for any new skill.",
    author: "Tavish Kaspate",
    role: "Product Manager",
    initials: "TK",
    color: "bg-purple-500/10 text-purple-600",
    tag: "Product Expert",
    layout: "quote-tag"
  },
  {
    quote: "Simple, clean, and does exactly what it says. Best tool for structured self-study I've found in a long time.",
    author: "Ritvik Shinde",
    role: "Self-taught Developer",
    initials: "RS",
    color: "bg-orange-500/10 text-orange-600",
    layout: "standard"
  },
  {
    quote: "Found a roadmap for quantum computing that didn't assume I was a math genius. Really approachable for beginners.",
    author: "Rahyl Kalate",
    role: "Researcher",
    initials: "RK",
    color: "bg-pink-500/10 text-pink-600",
    tag: "PhD Student",
    layout: "quote-tag"
  },
  {
    quote: "The AI-generated practice questions are surprisingly good. They actually test your understanding instead of just rote memorization.",
    author: "Ranveer Chavan",
    role: "Data Scientist",
    initials: "RC",
    color: "bg-indigo-500/10 text-indigo-600",
    layout: "author-top"
  },
  {
    quote: "EulerFold's integration with ArXiv is a game-changer. I can go from a general topic to a specific foundational paper in minutes.",
    author: "Dhruv Verma",
    role: "AI Researcher",
    initials: "DV",
    color: "bg-emerald-500/10 text-emerald-600",
    layout: "standard"
  },
  {
    quote: "I love the Review System concept. It's much more motivating to have my work evaluated than just checking a box.",
    author: "Kiaan Aggarwal",
    role: "Backend Developer",
    initials: "KA",
    color: "bg-amber-500/10 text-amber-600",
    layout: "quote-bottom"
  },
  {
    quote: "The Learning Directory is so well-curated. It's like having a senior engineer pointing you to the best resources.",
    author: "Manan Kudale",
    role: "UX Designer",
    initials: "MK",
    color: "bg-rose-500/10 text-rose-600",
    layout: "standard"
  },
  {
    quote: "I used the deep learning roadmap to prepare for my internship. The path was logical and the resources were top-notch.",
    author: "Arnav Iyer",
    role: "CS Undergrad",
    initials: "AI",
    color: "bg-cyan-500/10 text-cyan-600",
    layout: "quote-tag",
    tag: "Machine Learning"
  },
  {
    quote: "The UI is beautiful and distraction-free. It makes long study sessions much more pleasant.",
    author: "Lavanya Pawar",
    role: "Self-learner",
    initials: "LP",
    color: "bg-violet-500/10 text-violet-600",
    layout: "standard"
  }
];

const QuoteIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="15" viewBox="0 0 24 18" fill="none" className={`shrink-0 ${className}`}>
    <path d="M0 18V10.5C0 7.3 0.8 4.75 2.4 2.85C4.05 0.95 6.35 0 9.3 0L10.2 3C8.5 3.2 7.15 3.8 6.15 4.8C5.15 5.75 4.6 6.95 4.5 8.4H9.6V18H0ZM13.8 18V10.5C13.8 7.3 14.6 4.75 16.2 2.85C17.85 0.95 20.15 0 23.1 0L24 3C22.3 3.2 20.95 3.8 19.95 4.8C18.95 5.75 18.4 6.95 18.3 8.4H23.4V18H13.8Z" fill="currentColor"></path>
  </svg>
);

export default function TestimonialSection() {
  const col1Items = [testimonials[0], testimonials[3], testimonials[6], testimonials[9]];
  const col2Items = [testimonials[1], testimonials[4], testimonials[7], testimonials[10]];
  const col3Items = [testimonials[2], testimonials[5], testimonials[8], testimonials[11]];

  const column1 = [...col1Items, ...col1Items];
  const column2 = [...col2Items, ...col2Items];
  const column3 = [...col3Items, ...col3Items];

  return (
    <section className="py-24 px-6 bg-background overflow-hidden border-t border-border/30">
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-inter text-2xl md:text-3xl font-medium text-text-heading mb-8 tracking-tight"
        >
          Loved by learners like you
        </motion.h2>
        


        <div className="mt-12 flex justify-center">
          <ActivityPill />
        </div>
      </div>

      <div className="lg:max-w-[80%] mx-auto relative h-[600px] overflow-hidden mask-fade-vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Column 1 */}
          <div className="relative h-full overflow-hidden">
            <motion.div 
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-4 absolute top-0 left-0 w-full"
            >
              {column1.map((t, idx) => (
                <TestimonialCard key={idx} testimonial={t} />
              ))}
            </motion.div>
          </div>

          {/* Column 2 */}
          <div className="relative h-full overflow-hidden hidden md:block">
            <motion.div 
              animate={{ y: ["-50%", "0%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-4 absolute top-0 left-0 w-full"
            >
              {column2.map((t, idx) => (
                <TestimonialCard key={idx} testimonial={t} />
              ))}
            </motion.div>
          </div>

          {/* Column 3 */}
          <div className="relative h-full overflow-hidden hidden lg:block">
            <motion.div 
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-4 absolute top-0 left-0 w-full"
            >
              {column3.map((t, idx) => (
                <TestimonialCard key={idx} testimonial={t} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="px-8 py-3 bg-accent text-white rounded-full font-bold text-sm  shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          See for Yourself
        </motion.button>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t }: { testimonial: any }) {
  return (
    <div className="break-inside-avoid bg-transparent border border-border p-6 lg:p-8 rounded-lg transition-all duration-300 hover:border-accent/40 flex flex-col gap-4 group">
      {t.layout === "author-top" && (
        <div className="flex items-center gap-3 mb-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text-heading">{t.author}</p>
            <p className="truncate text-[11px] text-text-muted font-medium">{t.role}</p>
          </div>
        </div>
      )}

      {(t.layout === "standard" || t.layout === "quote-bottom" || t.layout === "quote-tag") && (
        <QuoteIcon className="text-accent/20 mb-1" />
      )}

      <p className="text-sm leading-relaxed text-text-primary dark:text-text-primary manrope-body font-medium">
        {t.quote}
      </p>

      {(t.layout === "standard" || t.layout === "quote-bottom") && (
        <div className="flex items-center gap-3 pt-4 mt-auto border-t border-border/50">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-text-heading">{t.author}</p>
            <p className="truncate text-[10px] text-text-muted font-medium">{t.role}</p>
          </div>
        </div>
      )}

      {t.layout === "quote-tag" && t.tag && (
        <div className="mt-auto">
          <span className="text-[10px] font-semibold text-text-muted/60 uppercase tracking-wider">{t.tag}</span>
        </div>
      )}
    </div>
  );
}



