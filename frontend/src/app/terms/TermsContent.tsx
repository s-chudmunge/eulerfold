"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, Plus } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function TermsContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('supabase_uid', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link className="flex items-center group shrink-0" href="/">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {profile?.username ? (
              <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            ) : (
              <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
            <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
          <div className="max-w-[800px] mx-auto px-8 py-8 md:py-12">
            <header className="mb-12">
              <div className="inconsolata-ui flex items-center gap-2 text-accent mb-1 text-[13px] font-bold uppercase tracking-widest">
                <span className="bg-teal-500/10 px-2 py-0.5 rounded text-accent">Legal</span>
                <span className="text-[var(--border)]">/</span>
                <span className="text-text-muted italic">Terms</span>
              </div>
              <h1 className="text-3xl font-bold mt-4 text-text-heading manrope-body">Terms of Service</h1>
              <p className="text-text-muted mt-2 inconsolata-ui text-sm uppercase tracking-tight">Last Updated: March 2026</p>
            </header>

            <div className="manrope-body space-y-12">
              <div className="bg-callout-bg border border-border rounded-xl p-8 relative overflow-hidden group">
                <p className="relative z-10 text-text-primary italic">
                  Welcome to EulerFold. By accessing or using our website and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
                </p>
                <span className="absolute -bottom-6 -right-6 text-[100px] opacity-[0.03] grayscale pointer-events-none group-hover:scale-110 transition-transform duration-700">🐢</span>
              </div>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">01.</span> Acceptance of Terms
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <div className="space-y-4">
                  <p>
                    By creating an account or using the service, you agree to these Terms and our Privacy Policy. If you do not agree, you may not use the service.
                  </p>
                  <p className="text-sm bg-sidebar/30 p-4 rounded-lg border border-border">
                    EulerFold uses YouTube API Services as part of its platform. By using EulerFold, you also agree to be bound by the <strong>YouTube Terms of Service</strong>, available at <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline">https://www.youtube.com/t/terms</a>, and <strong>Google&apos;s Privacy Policy</strong>, available at <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline">http://www.google.com/policies/privacy</a>.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">02.</span> Description of Service
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  EulerFold provides AI-generated learning roadmaps, progress tracking, and community sharing features. We use artificial intelligence to curate educational paths and resources, including educational video content sourced via YouTube Data API Services.
                </p>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">03.</span> Payments & Refunds
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <div className="space-y-4">
                  <p>
                    EulerFold offers premium AI roadmap generation for a one-time fee per roadmap (Roadmap Credits). Payments are processed through our third-party payment processor, Razorpay.
                  </p>
                  <ul className="space-y-4 list-none p-0">
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">→</span>
                      <span><strong>Refund Policy:</strong> Roadmap credits are non-refundable once they have been used to generate a roadmap. If you purchase a credit but do not use it, you may request a refund within 7 days of purchase.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">→</span>
                      <span>Credits do not expire and will remain available in your account until used.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">04.</span> EulerCoins & Rewards
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  EulerCoins are virtual loyalty points awarded for community participation, such as sharing roadmaps and maintaining learning streaks. EulerCoins have no monetary value, cannot be exchanged for cash, and are subject to adjustment or removal at our discretion.
                </p>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">05.</span> Community Contributions
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <ul className="space-y-4 list-none p-0">
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">→</span>
                    <span>Users can choose to make their roadmaps &quot;Public&quot;.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">→</span>
                    <span>By making a roadmap public, you grant other users the right to &quot;Clone&quot; and use that roadmap structure for their own learning.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">→</span>
                    <span>You agree not to share public content that is offensive, illegal, or violates intellectual property rights.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">→</span>
                    <span>You agree not to use EulerFold in any way that violates YouTube&apos;s Terms of Service or Google&apos;s Developer Policies.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">06.</span> User Accounts
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and session tokens.
                </p>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">07.</span> Intellectual Property
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <div className="space-y-4">
                  <p>
                    The service, including its original content, features, and functionality, is and will remain the exclusive property of EulerFold and its licensors. The roadmaps generated are for your personal, non-commercial use.
                  </p>
                  <p className="text-sm italic text-text-muted">
                    YouTube content displayed within EulerFold remains the property of the respective content creators and YouTube. EulerFold does not claim ownership over any YouTube content accessed through the YouTube API.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">08.</span> Limitation of Liability
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  EulerFold is provided on an &quot;as is&quot; basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the service. To the fullest extent permitted by law, EulerFold shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">09.</span> Changes to Terms
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  We reserve the right to update these Terms at any time. Continued use of the service after changes are posted constitutes your acceptance of the revised Terms. We will make reasonable efforts to notify users of significant changes.
                </p>
              </section>

              <section>
                <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                  <span className="text-accent">10.</span> Contact Us
                </h2>
                <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
                <p>
                  If you have any questions about these Terms, please contact us at: <a href="mailto:csankalp21@gmail.com" className="text-accent font-bold hover:underline">csankalp21@gmail.com</a>
                </p>
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
