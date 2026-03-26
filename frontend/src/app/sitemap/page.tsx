"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SitemapPage = () => {
  const siteLinks = [
    {
      category: "Platform",
      links: [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Generate Roadmap", href: "/generate" },
        { name: "Explore Library", href: "/explore" },
        { name: "Learning Hub", href: "/learn" },
        { name: "Research Decoded", href: "/research-decoded" },
        { name: "Global Rankings", href: "/leaderboard" },
      ]
    },
    {
      category: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Settings", href: "/settings" },
        { name: "Status", href: "/status" },
      ]
    },
    {
      category: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-black dark:text-white manrope-body p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="inconsolata-ui text-3xl font-bold tracking-tighter">Sitemap</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {siteLinks.map((category, index) => (
            <section key={index}>
              <h2 className="inconsolata-ui text-[11px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em] mb-6">
                {category.category}
              </h2>
              <div className="flex flex-col gap-3">
                {category.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex}
                    href={link.href}
                    className="text-[14px] font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-32 pt-12 border-t border-border dark:border-white/5">
          <p className="inconsolata-ui text-[9px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SitemapPage;
