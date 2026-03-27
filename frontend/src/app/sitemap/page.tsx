"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, Plus, Map, Globe, Shield, BookOpen, History, CreditCard, HelpCircle, Settings, FileText } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function SitemapPage() {
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

  const siteLinks = [
    {
      category: "Platform",
      links: [
        { name: "Home", href: "/", icon: Globe },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Generate Roadmap", href: "/generate", icon: Plus },
        { name: "Explore Library", href: "/explore", icon: Map },
        { name: "Learning Directory", href: "/learn", icon: BookOpen },
        { name: "Research Decoded", href: "/research-decoded", icon: FileText },
        { name: "Archive & Exams", href: "/archive", icon: History },
        { name: "Pricing & Credits", href: "/pricing", icon: CreditCard },
        { name: "Leaderboard", href: "/leaderboard", icon: Shield },
      ]
    },
    {
      category: "Support & Legal",
      links: [
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Privacy Policy", href: "/privacy", icon: Shield },
        { name: "Terms of Service", href: "/terms", icon: FileText },
      ]
    }
  ];

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
          <div className="max-w-[800px] mx-auto px-8 py-10 md:py-16">
            
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-text-heading manrope-body">Navigation Directory</h1>
              <p className="text-text-muted mt-2 manrope-body text-[13px]">Explore all indexed pages and tools across the EulerFold platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {siteLinks.map((category, index) => (
                <section key={index} className="space-y-6">
                  <h2 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border pb-2">
                    {category.category}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {category.links.map((link, linkIndex) => (
                      <Link 
                        key={linkIndex}
                        href={link.href}
                        className="group flex items-center gap-3 text-[14px] font-medium text-text-primary hover:text-accent transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-sidebar/50 rounded border border-border group-hover:border-accent/20 transition-all">
                          <link.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                        </div>
                        <span className="manrope-body">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <footer className="mt-24 pt-12 border-t border-border">
              <p className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40">
                EulerFold indexed sitemap • Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
