"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NextStepsSidebarProps {
  subject: string;
  topic: string;
  className?: string;
}

const NextStepsSidebar: React.FC<NextStepsSidebarProps> = ({ subject, topic, className = "" }) => {
  return (
    <aside className={`hidden lg:block w-[240px] shrink-0 ${className}`}>
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <h3 className="inconsolata-ui text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-60 ml-1">
            Next Steps
          </h3>
          
          {/* Practice Card */}
          <div className="p-4 bg-sidebar/30 border border-border rounded-md hover:border-accent/40 transition-colors">
            <h4 className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-tight mb-2">Practice Lab</h4>
            <p className="text-[12px] text-text-muted leading-relaxed mb-3 manrope-body font-medium">
              Do you want to practice some questions on <span className="text-text-heading">{subject}</span>?
            </p>
            <Link 
              href={`/practice?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
            >
              <span>Launch Lab</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mastery Card */}
          <div className="p-4 bg-sidebar/30 border border-border rounded-md hover:border-teal-600/40 transition-colors">
            <h4 className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-tight mb-2">Mastery Path</h4>
            <p className="text-[12px] text-text-muted leading-relaxed mb-3 manrope-body font-medium">
              Do you want to get a step-by-step path to learn <span className="text-text-heading">{subject}</span> from basics?
            </p>
            <Link 
              href={`/generate?subject=${encodeURIComponent(subject)}&goal=${encodeURIComponent(topic)}`}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:underline"
            >
              <span>Build Path</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NextStepsSidebar;
