import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, GraduationCap, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { LoginRequiredMessage, FAQAccordion } from './HomeClientComponents';
import MobiusBackground from '@/components/MobiusBackground';
import QuantumBackground from '@/components/QuantumBackground';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'EulerFold',
  description: 'EulerFold builds personalized learning paths to help you bridge the gap between information and mastery.',
  alternates: {
    canonical: '/',
  },
};

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans relative overflow-hidden">
      <Suspense fallback={null}>
        <LoginRequiredMessage />
      </Suspense>
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 px-6 min-h-[90vh] md:min-h-[95vh] flex items-center overflow-hidden">
          <QuantumBackground />
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
                Infrastructure for <span className="text-accent">efficient</span>,<br className="hidden md:block" /> structured learning
              </h1>
              <p className="text-text-muted text-base md:text-lg manrope-body font-medium mb-10 leading-relaxed max-w-2xl">
                EulerFold builds personalized learning paths to help you bridge the gap between information and mastery.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link 
                  href="/generate"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-accent text-white px-7 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3"
                >
                  <Plus className="w-4 h-4" /> Start Your Learning
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <span className="manrope-body text-[13px] text-text-muted">Already a member?</span>
                <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                  Sign in to your account
                </Link>
              </div>
            </div>
          </div>
        </section>
{/* Features Section with Illustration Background */}
<section className="relative py-20 md:py-32 px-4 md:px-6">
  <div className="max-w-7xl mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[550px] md:min-h-[600px] flex items-center shadow-2xl">
    {/* Mobius Animation Background */}
    <div className="absolute inset-0 z-0 opacity-100">
      <MobiusBackground />
    </div>

    <div className="relative z-10 px-6 md:px-20 py-12 md:py-0 max-w-2xl">
      <h2 className="text-[10px] md:text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-6 manrope-body">Retention based learning Architecture</h2>
      <h3 className="text-2xl md:text-4xl font-bold text-text-heading mb-6 leading-tight font-inter">
        Craft your path with <br className="hidden md:block" />mathematical precision.
      </h3>

              <p className="text-text-muted text-lg manrope-body font-medium leading-relaxed mb-10">
                Traditional education is linear. EulerFold is multi-dimensional. We map your current knowledge against your goals to find the most efficient route to mastery.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-10">
                <div className="space-y-1">
                  <h4 className="font-bold text-text-heading text-[15px]">Atomic Units</h4>
                  <p className="text-sm text-text-muted manrope-body leading-relaxed">Complex topics broken down into verifiable building blocks.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-text-heading text-[15px]">Audits</h4>
                  <p className="text-sm text-text-muted manrope-body leading-relaxed">Verification of your understanding by the Audit Senate.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border/30">
          {/* Large Background Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.08] dark:opacity-[0.04] pointer-events-none select-none">
            <EulerLogoCanvas size={600} rotationSpeed={0.002} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-8 md:mb-12 manrope-body">Our Mission</h2>
            
            <div className="relative mb-12 md:mb-16">
              <p className="text-xl md:text-4xl font-semibold text-text-heading leading-[1.3] md:leading-[1.2] font-inter tracking-tight">
                To bridge the gap between information and mastery by building the most effective learning infrastructure for every individual.
              </p>
            </div>

            <Link 
              href="/research-decoded" 
              className="inline-flex items-center justify-center bg-accent text-white px-8 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3"
            >
              Access Research Portal 
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Subtle background branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
            <img src="/apple-touch-icon.png" alt="" className="w-[600px] h-[600px] grayscale" />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">FAQ(Frequently Asked Questions)</h2>
            
            <FAQAccordion 
              items={[
                {
                  question: "How accurate are the AI roadmaps?",
                  answer: "Our engine doesn't just \"guess.\" It cross-references millions of technical data points and \"Resources We Trust\" to build high-density paths that mirror industry expectations."
                },
                {
                  question: "How does the Audit Senate evaluate my work?",
                  answer: "Your 'Proof of Work' is evaluated by a three-auditor system: a Technician (for correctness), an Educator (for clarity), and a Relevance Judge (for alignment). This ensures your mastery is verified by multiple perspectives."
                },
                {
                  question: "Can I customize my roadmap after it's generated?",
                  answer: "Absolutely. While the AI provides a high-signal starting point, you can add, remove, or reorder topics to suit your specific learning style and professional goals."
                },
                {
                  question: "What are EulerCoins and how do I earn them?",
                  answer: "EulerCoins are the platform's proof-of-progress currency. You earn them by maintaining learning streaks, passing audits, and contributing high-signal insights to the community."
                },
                {
                  question: "Is my progress actually saved?",
                  answer: "Yes. Every module you finish, every practice session you complete, and every audit you pass is recorded in your global Technical Inventory and skill profile."
                },
                {
                  question: "What makes EulerFold better than a video course?",
                  answer: "Videos are passive. EulerFold is active. We require \"Proof of Work\" through audits and recall sessions, ensuring you actually master the material rather than just watching it."
                },
                {
                  question: "Can I build roadmaps for free?",
                  answer: "All new users receive 5 free credits to generate premium AI roadmaps. After that, you can earn more through the community or purchase top-ups."
                }
              ]}
            />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[450px] md:min-h-[500px] flex items-center justify-center">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/learning_aesthetic_bg_1.png" 
                alt="" 
                className="w-full h-full object-cover opacity-80 dark:opacity-50 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
            </div>

            <div className="max-w-3xl mx-auto text-center relative z-10 px-6 py-12 md:py-0">
              <h2 className="font-inter text-2xl md:text-4xl font-bold text-text-heading mb-4 tracking-tight">
                Build your first roadmap in seconds.
              </h2>
              <p className="manrope-body text-[15px] md:text-[17px] text-text-primary mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                No credit card required. Join thousands of students building their mastery on the world's most effective learning infrastructure.
              </p>
              <Link 
                href="/generate"
                className="inline-flex items-center justify-center bg-accent text-white px-9 py-4 rounded-2xl text-[15px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3 mb-8"
              >
                <Plus className="w-4 h-4" /> Generate My Roadmap
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="manrope-body text-[13px] text-text-muted">Already have an account?</span>
                <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
