"use client";

import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import HeroBackground from '@/components/HeroBackground';
import NewsletterBanner from '@/components/landing/NewsletterBanner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Newsletter {
  title: string;
  subtitle?: string;
  hero_image_url?: string;
  slug: string;
  author: string;
  date: string;
  content: string;
}

export default function NewsletterClient({ newsletter }: { newsletter: Newsletter }) {
  const formattedDate = new Date(newsletter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroBackground />
      <PublicHeader />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[600px] mx-auto">
          
          <div className="mb-6">
            <Link href="/newsletters" className="inline-flex items-center text-sm font-medium text-[#0F766E] hover:text-[#0c5c56] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Newsletters
            </Link>
          </div>

          <article 
            className="rounded-lg overflow-hidden relative"
            style={{ 
              backgroundColor: '#fff4e3',
              border: '1px solid rgba(217, 44, 44, 0.3)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}
          >
            {/* Header */}
            <div style={{ backgroundColor: '#292b36', padding: '32px 20px', textAlign: 'center', color: '#f0f7f6' }}>
              <div style={{ color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '16px' }}>
                Weekly Newsletter
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'serif', lineHeight: 1.3, margin: '0 0 20px 0', color: '#ffffff' }}>
                {newsletter.title}
              </h1>
              {newsletter.subtitle && (
                <p style={{ fontSize: '16px', color: '#d4d4d8', margin: '0 auto 24px auto', maxWidth: '500px', lineHeight: 1.6 }}>
                  {newsletter.subtitle}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', color: '#a1a1aa' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <a href="https://www.linkedin.com/in/sankalp-chudmunge-a3ba80423/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}>
                    <span className="hover:underline">{newsletter.author}</span>
                  </a>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Feature Image */}
            {newsletter.hero_image_url && (
              <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
                <img 
                  src={newsletter.hero_image_url} 
                  alt={newsletter.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                />
              </div>
            )}

            {/* Body */}
            <div className="newsletter-content" style={{ padding: '32px' }}>
              <style dangerouslySetInnerHTML={{__html: `
                .newsletter-content {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  color: #1a1a1a;
                  font-size: 15px;
                  line-height: 1.8;
                }
                .newsletter-content p {
                  margin: 0 0 20px 0;
                }
                .newsletter-content a {
                  color: #d92c2c !important;
                  text-decoration: none !important;
                  font-weight: 600 !important;
                }
                .newsletter-content a:hover {
                  text-decoration: underline !important;
                }
                .newsletter-content h1, 
                .newsletter-content h2, 
                .newsletter-content h3 {
                  font-family: 'Playfair Display', Georgia, serif;
                  color: #292b36;
                  margin-top: 32px;
                  margin-bottom: 16px;
                  font-weight: 700;
                  font-size: 22px;
                }
                .newsletter-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  margin: 16px 0;
                  border: 1px solid #e5e7eb;
                }
                .newsletter-content ul {
                  margin: 0 0 20px 0;
                  padding-left: 20px;
                }
                .newsletter-content li {
                  margin-bottom: 8px;
                }
                .newsletter-content pre {
                  background: #f1f5f9;
                  padding: 16px;
                  border-radius: 8px;
                  overflow-x: auto;
                  margin: 0 0 20px 0;
                }
                .newsletter-content code {
                  font-family: monospace;
                  font-size: 14px;
                  background: #f1f5f9;
                  padding: 2px 4px;
                  border-radius: 4px;
                }
                .newsletter-content pre code {
                  background: transparent;
                  padding: 0;
                }
              `}} />
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {newsletter.content}
              </ReactMarkdown>
            </div>
            
            {/* Footer */}
            <div style={{ backgroundColor: '#0047ff', padding: '24px', textAlign: 'center', color: '#ffffff' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>© Copyright, {new Date().getFullYear()}, EulerFold • Maharashtra, India</p>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#ffffff' }}>X (Twitter)</span>
                <span style={{ fontSize: '13px', color: '#ffffff' }}>YouTube</span>
                <span style={{ fontSize: '13px', color: '#ffffff' }}>Instagram</span>
              </div>
            </div>
          </article>
          
          <div className="mt-12">
            <NewsletterBanner />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
