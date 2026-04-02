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
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

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
            <h2 className="manrope-body text-xl font-black text-text-heading mb-2">Feature Request</h2>
            <p className="manrope-body text-[13px] text-text-muted mb-8 font-medium">Specify the technical enhancement you wish to see.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="manrope-body text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@provider.com"
                  className="w-full px-4 py-3 bg-callout-bg border border-border rounded-xl text-[14px] text-text-heading outline-none focus:border-accent transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="manrope-body text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Feature Specification</label>
                <textarea 
                  required
                  rows={4}
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  placeholder="Describe the enhancement..."
                  className="w-full px-4 py-3 bg-callout-bg border border-border rounded-xl text-[14px] text-text-heading outline-none focus:border-accent transition-all resize-none font-medium"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-text-heading text-background rounded-xl font-bold text-[12px] uppercase tracking-[0.1em] hover:opacity-90 transition-all flex items-center justify-center gap-2"
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
            <h2 className="manrope-body text-xl font-black text-text-heading mb-2">Request Received</h2>
            <p className="manrope-body text-[13px] text-text-muted font-medium">Your request has been queued for evaluation.</p>
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
      answer: 'Our engine analyzes your goal, experience, and duration to identify high-density learning units and verified resources. It maps out a structured path that balances theoretical depth with practical application.',
      icon: <Target className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'How is my technical score calculated?',
      answer: 'We use a multi-signal formula: 40% Project Proof (module audits), 30% Recall Score (practice sessions), 15% Topic Coverage (completed units), and 15% Cognitive Depth (technical difficulty).',
      icon: <BarChart3 className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'What do the letter grades (A+, B, F) mean?',
      answer: "Grades reflect your proven proficiency. F (<40%) is foundational exposure, C/D (40-79%) is advancing competence, and A/B (80%+) represents professional-grade mastery and expertise.",
      icon: <Shield className="w-3.5 h-3.5" />
    },
    {
      category: 'Integrity',
      question: 'How do I reach an A+ (100%) Confidence?',
      answer: 'To reach 100%, you must aggregate proof across multiple roadmaps within the same skill domain. The system rewards you for tackling progressively more advanced and complex material.',
      icon: <Star className="w-3.5 h-3.5" />
    },
    {
      category: 'Auditing',
      question: 'What is the Audit Senate?',
      answer: 'The Audit Senate is a committee of specialized AI agents—The Technician, The Educator, and The Relevance Judge—who independently evaluate your Proof of Work. They verify technical accuracy, depth of understanding, and alignment with industry standards.',
      icon: <Zap className="w-3.5 h-3.5" />
    },
    {
      category: 'Identity',
      question: 'Can I reuse skills across different roadmaps?',
      answer: 'Yes. Our system automatically maps new topics to your existing Technical Inventory. Any progress made in a specific skill contributes to your overall profile, regardless of which roadmap it originated from.',
      icon: <Globe className="w-3.5 h-3.5" />
    },
    {
      category: 'Rewards',
      question: 'What are EulerCoins used for?',
      answer: 'EulerCoins represent your verified learning effort. They can be used to unlock certifications, access premium roadmaps, and earn specialized profile badges that showcase your commitment.',
      icon: <Trophy className="w-3.5 h-3.5" />
    },
    {
      category: 'Credits',
      question: 'How do Roadmap Credits work?',
      answer: 'Roadmap Credits are used to generate comprehensive, AI-driven learning paths. All new users receive 5 complementary credits. Additional credits can be acquired through the pricing page.',
      icon: <Zap className="w-3.5 h-3.5" />
    },
    {
      category: 'Credits',
      question: 'What is the refund policy for credits?',
      answer: 'Credits used for roadmap generation are non-refundable. Unused credits may be refunded within 7 days of purchase. Your credits never expire and remain linked to your account.',
      icon: <Shield className="w-3.5 h-3.5" />
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-text-primary min-h-screen flex flex-col selection:bg-teal-500/30">
      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-16 md:py-24 mt-[68px]">
        
        <div className="mb-20">
          <h1 className="manrope-body text-4xl md:text-5xl font-black text-text-heading tracking-tight mb-6">
            Help Center
          </h1>
          <p className="manrope-body text-lg text-text-muted leading-relaxed font-medium max-w-2xl">
            Expert guidance on navigating your technical growth, understanding our verification systems, and maximizing your learning efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* FAQ Accordion */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="manrope-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-muted">Common Questions</h2>
              <div className="h-px flex-1 bg-border opacity-50"></div>
            </div>

            <div className="divide-y divide-border">
              {filteredFAQ.length > 0 ? (
                filteredFAQ.map((item, index) => (
                  <div key={index} className="py-6 first:pt-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="manrope-body text-16px md:text-18px font-bold text-text-heading group-hover:text-accent transition-colors leading-tight">
                          {item.question}
                        </span>
                      </div>
                      <div className={`shrink-0 ml-4 p-1 rounded-full transition-all duration-200 ${openFaq === index ? 'bg-accent/10 text-accent rotate-180' : 'text-text-muted opacity-40'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    {openFaq === index && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                        <p className="manrope-body text-[15px] text-text-primary leading-relaxed font-medium opacity-80">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12">
                  <p className="manrope-body text-text-muted italic font-medium">No results found for your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Resources */}
          <div className="lg:col-span-4 order-1 lg:order-2 space-y-12">
            <div>
              <h2 className="manrope-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-muted mb-6">Resources</h2>
              <div className="space-y-2">
                <Link href="/help/scoring" className="flex items-center justify-between group py-3 border-b border-border hover:border-accent transition-colors">
                  <span className="manrope-body text-[14px] font-bold text-text-heading">Scoring System</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>

                <a href="mailto:eulerfold@gmail.com" className="flex items-center justify-between group py-3 border-b border-border hover:border-accent transition-colors">
                  <span className="manrope-body text-[14px] font-bold text-text-heading">Direct Support</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </a>
                
                <button 
                  onClick={() => setShowFeatureForm(true)}
                  className="w-full flex items-center justify-between group py-3 border-b border-border hover:border-accent transition-colors text-left"
                >
                  <span className="manrope-body text-[14px] font-bold text-text-heading">Request Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="manrope-body text-[11px] font-bold text-text-heading uppercase tracking-widest">System Status</span>
              </div>
              <p className="manrope-body text-[12px] text-text-muted font-medium">All services operational</p>
              <p className="manrope-body text-[10px] text-text-muted opacity-40 mt-1">v1.2.0-stable</p>
            </div>
          </div>
        </div>
      </main>

      {showFeatureForm && (
        <FeatureRequestForm onClose={() => setShowFeatureForm(false)} />
      )}
      <Footer />
    </div>
  );
}
