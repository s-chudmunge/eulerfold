'use client';

import React, { useState } from 'react';
import { 
  Mail,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  BarChart3,
  Star,
  Shield,
  Trophy,
  Globe,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Feature Request Modal Component
const FeatureRequestForm = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [feature, setFeature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {!submitted ? (
          <>
            <h2 className="inconsolata-ui text-xl font-bold text-text-heading uppercase mb-2">Feature Request</h2>
            <p className="manrope-body text-[13px] text-text-muted mb-8 italic">Specify the technical enhancement you wish to see.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@provider.com"
                  className="w-full px-4 py-3 bg-callout-bg border border-callout-border rounded-xl text-[14px] text-text-heading outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Feature Specification</label>
                <textarea 
                  required
                  rows={4}
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  placeholder="Describe the enhancement..."
                  className="w-full px-4 py-3 bg-callout-bg border border-callout-border rounded-xl text-[14px] text-text-heading outline-none focus:border-[var(--accent)] transition-all resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-xl font-black text-[12px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Transmitting...' : 'Submit Request'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="inconsolata-ui text-xl font-bold text-text-heading uppercase mb-2">Request Received</h2>
            <p className="manrope-body text-[13px] text-text-muted">Your request has been queued for evaluation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFeatureForm, setShowFeatureForm] = useState(false);

  const faqItems = [
    {
      category: 'Platform',
      question: 'How does the AI generate my roadmap?',
      answer: 'Our engine analyzes your goal, experience, and duration to identify high-density learning units and Resources We Trust.',
      icon: <Target className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'How is my technical score calculated?',
      answer: 'We use an "Honest Progress" formula: 40% Project Proof (module audits), 30% Recall Score (practice sessions), 15% Topic Coverage (completed units), and 15% Cognitive Depth (technical difficulty).',
      icon: <BarChart3 className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'What do the letter grades (A+, B, F) mean?',
      answer: "Grades represent your Skills You've Proven. F (<40%) is foundational exposure, C/D (40-79%) is advancing competence, and A/B (80%+) represents high proficiency and expertise.",
      icon: <Shield className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'How do I reach an A+ (100%) Confidence?',
      answer: 'To reach 100%, you typically need to complete multiple roadmaps for the same skill. The system aggregates your proof across units, rewarding you for tackling more "Advanced" (high-depth) material.',
      icon: <Star className="w-3.5 h-3.5" />
    },
    {
      category: 'Auditing',
      question: 'What is the Audit Senate?',
      answer: 'The Audit Senate is a committee of three specialized AI agents—The Technician, The Educator, and The Relevance Judge—who independently vote on your Proof of Work. They verify technical quality, authentic understanding, and objective alignment to ensure your skills are industry-ready.',
      icon: <Zap className="w-3.5 h-3.5" />
    },
    {
      category: 'Identity',
      question: 'Can I reuse skills across different roadmaps?',
      answer: 'Yes! Our system automatically maps new topics to your existing Technical Inventory. Starting a second Python roadmap will build upon your current Python score rather than creating a duplicate.',
      icon: <Globe className="w-3.5 h-3.5" />
    },
    {
      category: 'Rewards',
      question: 'What are EulerCoins used for?',
      answer: 'Proof of effort. Use them to unlock certifications, premium roadmaps, and profile badges.',
      icon: <Trophy className="w-3.5 h-3.5" />
    },
    {
      category: 'Credits',
      question: 'How do Roadmap Credits work?',
      answer: 'Roadmap Credits allow you to generate full-scale, premium AI roadmaps. All users get 5 free credits upon signup. Additional credits can be purchased for ₹99 (includes 2 credits).',
      icon: <Zap className="w-3.5 h-3.5" />
    },
    {
      category: 'Credits',
      question: 'What is the refund policy for credits?',
      answer: 'Credits are non-refundable once they have been used to generate a roadmap. Unused credits can be refunded within 7 days of purchase. Credits never expire.',
      icon: <Shield className="w-3.5 h-3.5" />
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-text-primary">
      <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-20">
        
        <div className="max-w-[800px] mx-auto">
          <header className="mb-16">
            <h1 className="inconsolata-ui text-3xl font-bold text-text-heading uppercase tracking-tight mb-4">
              Help Center
            </h1>
            <p className="manrope-body text-[16px] text-text-muted leading-relaxed">
              Everything you need to know about navigating your technical growth.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact & Support */}
            <div className="lg:col-span-4 space-y-10">
              <div className="space-y-6">
                <h2 className="inconsolata-ui text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Support</h2>
                <div className="space-y-4">
                  <a href="mailto:hello@eulerfold.com" className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-callout-bg transition-all">
                    <div className="w-10 h-10 bg-callout-bg rounded-lg flex items-center justify-center border border-border group-hover:border-[var(--accent)] transition-colors">
                      <Mail className="w-4 h-4 text-text-muted group-hover:text-accent" />
                    </div>
                    <div>
                      <p className="inconsolata-ui text-[13px] font-bold text-text-heading">Direct Email</p>
                      <p className="manrope-body text-[11px] text-text-muted">hello@eulerfold.com</p>
                    </div>
                  </a>
                  
                  <button 
                    onClick={() => setShowFeatureForm(true)}
                    className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-callout-bg transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-callout-bg rounded-lg flex items-center justify-center border border-border group-hover:border-[var(--accent)] transition-colors">
                      <Plus className="w-4 h-4 text-text-muted group-hover:text-accent" />
                    </div>
                    <div>
                      <p className="inconsolata-ui text-[13px] font-bold text-text-heading">Request Feature</p>
                      <p className="manrope-body text-[11px] text-text-muted">Influence the roadmap</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-callout-bg rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-widest">System Live</span>
                </div>
                <span className="manrope-body text-[10px] text-text-muted italic">v1.2.0</span>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="lg:col-span-8">
              <h2 className="inconsolata-ui text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-6">Common Questions</h2>

              <div className="space-y-3">
                {filteredFAQ.length > 0 ? (
                  filteredFAQ.map((item, index) => (
                    <div
                      key={index}
                      className={`border transition-all duration-200 overflow-hidden ${
                        openFaq === index 
                          ? 'border-[var(--accent)] bg-accent-muted rounded-xl' 
                          : 'border-border bg-background hover:border-[var(--text-muted)] rounded-xl'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`p-2 rounded-lg border transition-colors ${openFaq === index ? 'bg-accent text-white border-[var(--accent)]' : 'bg-callout-bg text-text-muted border-border'}`}>
                            {item.icon}
                          </span>
                          <div>
                            <span className="inconsolata-ui text-[15px] font-bold text-text-heading tracking-tight">{item.question}</span>
                          </div>
                        </div>
                        {openFaq === index ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                      </button>
                      {openFaq === index && (
                        <div className="px-5 pb-6 pl-[68px] animate-in slide-in-from-top-2 duration-200">
                          <div className="h-[1px] w-12 bg-accent opacity-30 mb-4"></div>
                          <p className="manrope-body text-[14px] text-text-primary leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-callout-bg border border-dashed border-border rounded-xl">
                    <p className="manrope-body text-[14px] text-text-muted italic">No matching questions found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-center">
            <Link href="/help/scoring" className="manrope-body text-[12px] text-text-muted hover:text-text-heading transition-colors">
              Scoring System
            </Link>
          </div>
        </div>
      </main>

      {showFeatureForm && (
        <FeatureRequestForm onClose={() => setShowFeatureForm(false)} />
      )}
    </div>
  );
}
