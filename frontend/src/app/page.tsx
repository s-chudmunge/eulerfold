import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, GraduationCap, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { LoginRequiredMessage } from './HomeClientComponents';
import MobiusBackground from '@/components/MobiusBackground';

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
        <section className="relative pt-32 pb-48 px-6 min-h-[95vh] flex items-center overflow-hidden">
          <MobiusBackground />
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-inter text-3xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.1] tracking-tight">
                Infrastructure for <span className="text-accent">efficient</span>,<br className="hidden md:block" /> structured learning
              </h1>
              <p className="text-text-muted text-base md:text-lg manrope-body font-medium mb-10 leading-relaxed max-w-2xl">
                EulerFold builds personalized learning paths to help you bridge the gap between information and mastery. Learn it. Build it. Prove it.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link 
                  href="/generate"
                  className="inline-flex items-center justify-center bg-accent text-white px-7 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3"
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
        <section className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[600px] flex items-center">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/learning_aesthetic_bg.png" 
                alt="" 
                className="w-full h-full object-cover opacity-60 dark:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            </div>

            <div className="relative z-10 px-8 md:px-20 max-w-2xl">
              <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-6 manrope-body">Retention based learning Architecture</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-text-heading mb-6 leading-tight font-inter">
                Craft your path with <br />mathematical precision.
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
        <section className="py-40 px-6 bg-background relative overflow-hidden border-t border-border/30">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-12 manrope-body">Our Mission</h2>
            
            <div className="relative mb-16">
              <p className="text-2xl md:text-4xl font-semibold text-text-heading leading-[1.2] font-inter tracking-tight">
                To bridge the gap between information and mastery by building the most effective learning infrastructure for every individual.
              </p>
            </div>

            <Link 
              href="/research-decoded" 
              className="inline-flex items-center gap-3 text-[13px] font-bold text-accent hover:gap-4 transition-all bg-accent/5 px-8 py-3.5 rounded-full border border-accent/10 group"
            >
              Access Research Portal 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Subtle background branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
            <img src="/apple-touch-icon.png" alt="" className="w-[600px] h-[600px] grayscale" />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-16 manrope-body">FAQ(Frequently Asked Questions)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <div className="space-y-4">
                <h3 className="font-inter text-[17px] font-bold text-text-heading tracking-tight">How accurate are the AI roadmaps?</h3>
                <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                  Our engine doesn't just "guess." It cross-references millions of technical data points and "Resources We Trust" to build high-density paths that mirror industry expectations.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-inter text-[17px] font-bold text-text-heading tracking-tight">Is my progress actually saved?</h3>
                <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                  Yes. Every module you finish, every practice session you complete, and every audit you pass is recorded in your global Technical Inventory and skill profile.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-inter text-[17px] font-bold text-text-heading tracking-tight">What makes EulerFold better than a video course?</h3>
                <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                  Videos are passive. EulerFold is active. We require "Proof of Work" through audits and recall sessions, ensuring you actually master the material rather than just watching it.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-inter text-[17px] font-bold text-text-heading tracking-tight">Can I build roadmaps for free?</h3>
                <p className="manrope-body text-[14px] text-text-muted leading-relaxed">
                  All new users receive 5 free credits to generate premium AI roadmaps. After that, you can earn more through the community or purchase top-ups.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-accent/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-inter text-2xl md:text-3xl font-bold text-text-heading mb-4 tracking-tight">
              Build your first roadmap in seconds.
            </h2>
            <p className="manrope-body text-[15px] text-text-muted mb-10 max-w-lg mx-auto leading-relaxed">
              No credit card required. Join thousands of students building their mastery on the world's most effective learning infrastructure.
            </p>
            <Link 
              href="/generate"
              className="inline-flex items-center justify-center bg-accent text-white px-9 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3 mb-8"
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
