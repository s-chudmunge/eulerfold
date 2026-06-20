"use client";

import React from 'react';
import PublicHeader from '@/components/PublicHeader';

export default function TermsContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
      <PublicHeader />

      <main className="flex-1 bg-background scroll-smooth pt-[68px]">
        <div className="max-w-[800px] mx-auto px-8 py-8 md:py-12">
          <header className="mb-12">
            <h1 className="text-3xl font-bold mt-4 text-text-heading manrope-body">Terms of Service</h1>
            <p className="text-text-muted mt-2 inconsolata-ui text-sm uppercase tracking-tight">Last Updated: June 2026</p>
          </header>

          <div className="manrope-body space-y-12">
            <div className="bg-callout-bg border border-border rounded-lg p-8 relative overflow-hidden group">
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
                <span className="text-accent">10.</span> AI Integrations: OpenRouter BYOK & Local Models
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p className="mb-4">We are committed to providing an open, secure, and flexible learning platform. To support this, we offer distinct AI interaction modes:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Bring Your Own Key (OpenRouter):</strong> You may opt to use your personal OpenRouter API key for certain features. You acknowledge that you are solely responsible for the security, management, and financial costs associated with your OpenRouter account. Because EulerFold routes these requests directly from your browser without intercepting them, we cannot limit your usage or protect against API overages caused by third-party billing policies. By using this feature, you also agree to the <a href="https://openrouter.ai/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline">OpenRouter Terms of Service</a>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Local AI (WebGPU):</strong> EulerFold provides the option to execute AI models directly on your device hardware via WebGPU. By using Local AI mode, you acknowledge that this process is highly resource-intensive. EulerFold is provided &quot;as is&quot; and we assume no liability for any hardware degradation, thermal throttling, battery drain, or system instability resulting from running local models.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Honest Communication:</strong> We guarantee that if you are using Local AI or BYOK, your generations are not secretly routed through our servers. We prioritize your sovereignty over your compute and data.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">11.</span> Contact Us
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p>
                If you have any questions about these Terms, please contact us at: <a href="mailto:eulerfold@gmail.com" className="text-accent font-bold hover:underline">eulerfold@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
