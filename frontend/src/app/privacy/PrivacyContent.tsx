"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default function PrivacyContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
      <PublicHeader />

      <main className="flex-1 bg-background scroll-smooth pt-[68px]">
        <div className="max-w-[800px] mx-auto px-8 py-8 md:py-12">
          <header className="mb-12">
            <h1 className="text-3xl font-bold mt-4 text-text-heading manrope-body">Privacy Policy</h1>
            <p className="text-text-muted mt-2 inconsolata-ui text-sm uppercase tracking-tight">Last Updated: June 2026</p>
          </header>


          <div className="manrope-body space-y-12">
            <div className="bg-callout-bg border border-border rounded-xl p-8 relative overflow-hidden group">
              <p className="relative z-10 text-text-primary italic">
                At EulerFold, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-accent opacity-[0.03] grayscale pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            </div>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">01.</span> Information We Collect
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p className="mb-6">We collect information that you provide directly to us when you use our services. This includes:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Account Information:</strong> Name, email address, and profile data from Google Auth.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Learning Data:</strong> Roadmaps you generate, progress through modules, and practice history.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Technical Data:</strong> IP address, browser type, and cookies for session management.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Payment Information:</strong> When you purchase credits, we collect transaction details. Financial data (like card numbers) is handled exclusively by Razorpay and is not stored on our servers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>YouTube Data:</strong> We collect and store minimal YouTube data — specifically video IDs and titles — to embed educational content within your roadmaps. This data is retrieved via the YouTube Data API and stored on our servers solely to display relevant video resources in your learning roadmaps.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>API Keys (OpenRouter):</strong> If you choose to use your own OpenRouter API key for generation, this key is strictly stored locally in your browser's <code>localStorage</code>. It is never transmitted to, stored on, or processed by EulerFold's backend servers.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">02.</span> How We Use Your Information
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p className="mb-6">We use the information we collect to:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>Provide and maintain our personalized learning services.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>Process your payments and manage roadmap credits.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>Enable community sharing and discovery of learning roadmaps.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>Manage the EulerCoins reward system and leaderboard.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>Embed and display educational YouTube videos within roadmaps using YouTube Data API Services.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">03.</span> Third-Party Services
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p>
                We use third-party services to facilitate our operations:
              </p>
              <ul className="mt-4 space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Razorpay:</strong> For processing payments. Their use of your personal information is governed by their Privacy Policy.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Google / YouTube:</strong> For authentication, analytics, and educational video content. EulerFold uses YouTube API Services to fetch and display video resources. By using EulerFold, you are also subject to Google&apos;s Privacy Policy, available at <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline">http://www.google.com/policies/privacy</a>, and the YouTube Terms of Service, available at <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline">https://www.youtube.com/t/terms</a>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>OpenRouter & Local AI:</strong> If you use OpenRouter, your generations are securely routed directly from your browser to OpenRouter's API using your personal key. If you use Local AI, generations occur entirely on your own device and no conversational data leaves your browser.</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-sidebar/30 border border-border rounded-lg text-sm italic">
                YouTube Data specifically: Video IDs and titles fetched via the YouTube API are stored on our servers to populate learning roadmaps. This data is not sold or shared with any external parties. It is used solely to deliver educational content within the EulerFold platform.
              </div>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">04.</span> How We Share Your Information
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p className="mb-6">We do not sell your personal information. We share data only in the following circumstances:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>With Razorpay to process payments.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>With Google/YouTube as part of API usage governed by their respective policies.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span>When required by law or to protect the rights and safety of EulerFold and its users.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">05.</span> Public Sharing
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p>
                By default, all roadmaps are private. If you explicitly choose to &quot;Go Public&quot;, your roadmap structure will be visible in the Explore directory. You have full control over whether your display name is associated with public roadmaps.
              </p>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">06.</span> AI & Data Privacy (OpenRouter & Local AI)
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p className="mb-6">At EulerFold, we believe in open-ness and giving you control over your data. Our AI integrations are designed with security and transparency in mind:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Bring Your Own Key (BYOK):</strong> When using OpenRouter via BYOK, your API keys are stored exclusively in your device's <code>localStorage</code>. They are never transmitted to, logged, or processed by EulerFold's backend servers. All API requests to OpenRouter are made directly from your browser, ensuring we have no access to your key or the contents of your prompts. For more details on how OpenRouter handles your data, please see the <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline">OpenRouter Privacy Policy</a>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Local AI (WebGPU):</strong> Our Local AI mode represents our commitment to absolute privacy. When enabled, AI models are downloaded and run entirely within your device's browser using WebGPU. No conversational data, prompts, or generated responses ever leave your machine, guaranteeing 100% data sovereignty.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Open Data Policy:</strong> We do not use your personal learning data, BYOK generations, or Local AI interactions to train our own foundation models. Your data belongs to you.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">07.</span> Data Security
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable.
              </p>
            </section>

            <section>
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading mb-4 uppercase tracking-tight flex items-center gap-3">
                <span className="text-accent">08.</span> Contact Us
              </h2>
              <div className="h-[1px] w-full bg-[var(--border)] mb-6"></div>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:eulerfold@gmail.com" className="text-accent font-bold hover:underline">eulerfold@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
