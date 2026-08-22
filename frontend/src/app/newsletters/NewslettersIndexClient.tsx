"use client";

import React from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import HeroBackground from '@/components/HeroBackground';
import NewsletterBanner from '@/components/landing/NewsletterBanner';

interface Newsletter {
  title: string;
  subtitle?: string;
  hero_image_url?: string;
  slug: string;
  author: string;
  date: string;
  content: string;
}

export default function NewslettersIndexClient({ newsletters }: { newsletters: Record<string, Newsletter> }) {
  const sortedNewsletters = Object.entries(newsletters).sort((a, b) => 
    new Date(b[1].date).getTime() - new Date(a[1].date).getTime()
  );

  return (
    <div className="flex flex-col min-h-screen">
      <HeroBackground />
      <PublicHeader />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[600px] mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#292b36] mb-4 font-serif">Weekly Newsletters</h1>
            <p className="text-lg text-gray-600">Stay informed on frontier models, open-source AI, AI research, and agentic workflows.</p>
          </div>

          <div className="grid gap-6">
            {sortedNewsletters.map(([slug, nl]) => (
              <Link key={slug} href={`/newsletters/${slug}`} className="group block">
                <div 
                  className="rounded-lg shadow-sm overflow-hidden transition-all duration-200 group-hover:shadow-md relative bg-[#fff4e3] flex flex-col sm:flex-row"
                  style={{ border: '1px solid rgba(217, 44, 44, 0.3)' }}
                >
                  {nl.hero_image_url && (
                    <div className="sm:w-1/3 h-48 sm:h-auto shrink-0 relative overflow-hidden border-b sm:border-b-0 sm:border-r border-[rgba(217,44,44,0.3)]">
                      <img src={nl.hero_image_url} alt={nl.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6 flex-grow">
                    <div className="text-sm font-semibold tracking-wider text-[#d92c2c] mb-2 uppercase">
                    {new Date(nl.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-2xl font-bold text-[#292b36] mb-2 font-serif group-hover:text-[#d92c2c] transition-colors">{nl.title}</h2>
                  {nl.subtitle && (
                    <p className="text-[#1a1a1a] text-[15px] leading-[1.6] opacity-80">{nl.subtitle}</p>
                  )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-16">
            <NewsletterBanner />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
