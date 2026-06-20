import React from 'react';

export const metadata = {
  title: 'About | EulerFold',
  description: 'How EulerFold works and why we built it.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-16">
        <h1 className="text-3xl font-bold text-text-heading mb-6 manrope-body">About EulerFold</h1>
        
        <div className="space-y-8 text-text-primary manrope-body leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-heading mb-3">The Problem</h2>
            <p>
              Finding good learning resources online is hard. Information is often spread across 
              too many websites, making it difficult to know where to start or what to study next.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-heading mb-3">Our Solution</h2>
            <p>
              EulerFold uses AI to organize technical information into clear, step-by-step paths. 
              We provide tools to generate custom study plans, read simple summaries of complex 
              research papers, and access a large archive of competitive exam papers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-heading mb-3">Who it is for</h2>
            <p>
              We built this for students, researchers, and developers who want to learn technical 
              subjects without wasting time searching for resources.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-text-heading mb-3">Legal & Registration</h2>
            <div className="bg-sidebar/30 border border-border p-5 rounded-lg space-y-2">
              <p className="text-[14px] font-medium">EulerFold is a registered IT business.</p>
              <ul className="text-[13px] text-text-muted space-y-1">
                <li>• ID: 103405362603</li>
                <li>• Date: April 2, 2026</li>
                <li>• Location: Sangli, India</li>
              </ul>
              <div className="pt-3">
                <a 
                  href="https://drive.google.com/file/d/11jDjtAP1mbCHgC0dCXoVz0r6Ju3vq7H6/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-700 font-bold text-[14px] hover:underline flex items-center gap-1.5"
                >
                  View Registration Certificate
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
