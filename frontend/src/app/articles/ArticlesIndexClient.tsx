"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaXTwitter } from 'react-icons/fa6';
import { Instagram, Youtube, Rss, ArrowRight, Search, ArrowUpDown, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Article } from './generatedArticles';
import ArticleCard from '@/components/ArticleCard';

interface Props {
  articles: Record<string, Article>;
}

type SortOption = 'newest' | 'oldest' | 'title';

export default function ArticlesIndexClient({ articles }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const articleList = useMemo(() => Object.values(articles), [articles]);
  
  const categories = useMemo(() => {
    const cats = new Set(articleList.map(a => a.category));
    return ['All', ...Array.from(cats)].sort();
  }, [articleList]);

  const filteredArticles = useMemo(() => {
    return articleList
      .filter(article => {
        const matchesSearch = 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [articleList, searchQuery, sortBy, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <PublicHeader />
      
      <main className="max-w-[1200px] mx-auto py-12 px-6 flex flex-col md:flex-row gap-[60px]">
        <div className="flex-grow max-w-[800px]">
          <header className="mb-12">
            <h1 className="text-[40px] font-bold text-text-heading tracking-tighter mb-4 inconsolata-ui">
              Articles and Breakdowns
            </h1>
            <p className="text-[17px] text-text-muted max-w-2xl font-inter leading-relaxed">
              Simple explanations of complex technical terms and research breakthroughs. Master the "how" and "why" behind modern technology.
            </p>
          </header>

          {/* Controls: Search, Sort, Filter */}
          <div className="mb-10 flex flex-col gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:opacity-100 transition-opacity w-4 h-4" />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all font-inter"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg text-[13px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider">
                <Filter className="w-3 h-3" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg text-[13px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider">
                <ArrowUpDown className="w-3 h-3" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Community Banner */}
          <div className="mb-10 bg-callout-bg rounded-3xl p-6 md:p-8 border border-border relative overflow-hidden group">
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 text-accent mb-3">
                <span className="inconsolata-ui text-[11px] md:text-[12px] font-bold uppercase tracking-wider">EulerFold Intelligence</span>
              </div>
              <h2 className="text-[20px] md:text-[22px] font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">Join the EulerFold community</h2>
              <p className="manrope-body text-[13px] md:text-[14px] mb-6 text-text-primary leading-relaxed font-medium">
                Track progress and collaborate on roadmaps with students worldwide.
              </p>
              <button 
                onClick={user ? () => window.location.href = '/dashboard' : handleSignIn}
                className="inline-flex items-center gap-2 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full px-6 py-2.5 text-[14px] font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-teal-500/20"
              >
                {user ? 'Go to Dashboard' : 'Start Your Journey'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <span className="absolute -bottom-10 -right-10 text-[180px] opacity-[0.03] grayscale -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">🐢</span>
          </div>

          {/* Article List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="horizontal" />
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                <p className="text-text-muted manrope-body italic text-lg">No articles found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Area */}
        <aside className="w-full md:w-[325px] shrink-0">
          <div className="sticky top-[100px] border border-border rounded-2xl p-[30px] bg-card shadow-sm">
            <h2 className="text-[22px] font-bold text-center mb-[15px] text-text-heading inconsolata-ui uppercase tracking-widest">About</h2>
            <div className="w-12 h-1 bg-accent mx-auto mb-[20px] rounded-full" />
            <p className="text-[16px] leading-[1.6] text-text-primary mb-[25px] font-inter font-normal text-center">
              Technical explainers on AI, research, and modern engineering.
            </p>

            <h2 className="text-[18px] font-bold text-center mb-[15px] text-text-heading inconsolata-ui uppercase tracking-widest">Follow us</h2>
            <div className="flex justify-center gap-2">
              <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#000000] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(255,255,255,0.1)] transition-colors">
                <FaXTwitter className="w-5 h-5 fill-white text-white" />
              </a>
              <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#E1306C] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#FF0000] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Youtube className="w-5 h-5 fill-white text-white" />
              </a>
              <a href="mailto:eulerfold@gmail.com" className="w-[36px] h-[36px] bg-[#0F766E] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Rss className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
