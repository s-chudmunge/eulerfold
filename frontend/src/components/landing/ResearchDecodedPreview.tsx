import React from 'react';
import Link from 'next/link';

export default function ResearchDecodedPreview() {
  const papers = [
    {
      slug: "concrete-problems-ai-safety",
      title: "Concrete Problems in AI Safety",
      label: "PAPER BREAKDOWN",
      description: "The paper that transitioned AI safety from sci-fi philosophy to empirical engineering."
    },
    {
      slug: "constitutional-ai-rlaif",
      title: "Constitutional AI",
      label: "EXPLAINER",
      description: "Bypassing the human preference bottleneck with Reinforcement Learning from AI Feedback."
    },
    {
      slug: "superalignment-weak-to-strong",
      title: "Superalignment: Weak-to-Strong",
      label: "RESEARCH DEEP DIVE",
      description: "How a weak supervisor can effectively train a strong model beyond its own understanding."
    },
    {
      slug: "attention-is-all-you-need",
      title: "Attention Is All You Need",
      label: "CORE ARCHITECTURE",
      description: "The foundational paper that introduced the Transformer and revolutionized modern AI."
    },
    {
      slug: "resnet-deep-residual-learning",
      title: "ResNet: Deep Residual Learning",
      label: "COMPUTER VISION",
      description: "How residual connections solved the vanishing gradient problem and enabled ultra-deep networks."
    },
    {
      slug: "alphafold-2-structure-prediction",
      title: "AlphaFold 2",
      label: "SCIENCE AI",
      description: "Solving the 50-year-old protein folding grand challenge using deep learning."
    }
  ];

  return (
    <section className="py-16 sm:py-24 overflow-hidden transition-colors duration-300 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg text-[11px] font-bold bg-background border border-border text-text-muted uppercase tracking-[0.2em] mb-4 inconsolata-ui">
            FROM THE LAB
          </div>
          <h2 className="text-3xl md:text-[42px] font-bold text-text-heading tracking-tight transition-colors uppercase inconsolata-ui">
            RESEARCH <span className="text-accent">DECODED.</span>
          </h2>
          <p className="mt-4 text-[15px] md:text-[16px] text-text-muted transition-colors manrope-body">
            Foundational AI breakthroughs, broken down paper by paper.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Link 
              key={paper.slug} 
              href={`/research-decoded/${paper.slug}`}
              className="flex flex-col bg-callout-bg border border-border rounded-lg p-6 hover:bg-background transition-colors group"
            >
              <div className="mb-6">
                <span className="inconsolata-ui uppercase tracking-[0.2em] text-[10px] font-bold border border-border px-2.5 py-1 rounded text-text-muted">
                  {paper.label}
                </span>
              </div>
              <h3 className="inconsolata-ui text-[18px] font-bold text-text-heading leading-snug mb-3">
                {paper.title}
              </h3>
              <p className="manrope-body text-[13px] text-text-muted leading-relaxed mb-8 flex-1">
                {paper.description}
              </p>
              <div className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-[0.2em] flex items-center group-hover:-translate-x-1 transition-transform w-fit">
                → READ MORE
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/research-decoded"
            className="inline-flex items-center justify-center px-6 py-3 bg-background border border-border text-text-heading text-[12px] font-bold rounded-lg hover:bg-callout-bg transition-all uppercase tracking-[0.2em] inconsolata-ui"
          >
            → BROWSE ALL RESEARCH
          </Link>
        </div>
      </div>
    </section>
  );
}