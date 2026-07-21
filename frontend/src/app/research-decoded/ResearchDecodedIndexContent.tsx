"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { navigation, papers } from './generatedData';
import { ArrowRight, Search, Microscope, ArrowUp } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cleanSearchQuery, getSearchKeywords } from '@/lib/search';
import Breadcrumbs from '@/components/Breadcrumbs';
import ResearchNavigationSidebar from '@/components/research-lab/ResearchNavigationSidebar';
import { motion, AnimatePresence } from 'framer-motion';

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);
  return null;
}

export default function ResearchDecodedIndexContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user } = useAuth();

  const handleSearchParams = React.useCallback((params: URLSearchParams) => {
    setSearchQuery(params.get('q') || "");
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const updateSearchQuery = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set('q', val);
    else params.delete('q');
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const updateCategory = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('category', id);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    
    // Immediate scroll for better UX
    const element = document.getElementById(id);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + elementRect.top - 40,
        behavior: 'smooth'
      });
    }
  };

  const filteredNavigation = navigation.map(category => {
    if (!searchQuery) return category;
    
    const cleanedQuery = cleanSearchQuery(searchQuery);
    const keywords = getSearchKeywords(searchQuery);
    
    return {
      ...category,
      sections: category.sections.map(section => {
        const title = section.title.toLowerCase();
        const paper = papers[section.slug];
        const authorStr = (paper?.authors || "").toLowerCase();
        let relevance = 0;
        
        if (cleanedQuery) {
          if (title === cleanedQuery) relevance += 1000;
          else if (title.includes(cleanedQuery)) relevance += 500;
          else if (authorStr.includes(cleanedQuery)) relevance += 300;
        }
        
        for (const kw of keywords) {
          const kwLow = kw.toLowerCase();
          if (title.includes(kwLow)) {
            relevance += 100;
          }
          if (authorStr.includes(kwLow)) {
            relevance += 50;
          }
        }
        
        return { ...section, relevance };
      })
      .filter(section => section.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
    };
  }).filter(category => category.sections.length > 0);

  return (
    <div className="bg-background min-h-screen pb-24 text-text-primary">
      <Suspense fallback={null}>
        <SearchParamsHandler onParams={handleSearchParams} />
      </Suspense>
      <div className="max-w-[1000px] mx-auto px-6 py-6 md:px-10 md:py-10">
        
        {/* Library Button */}
        <div className="mb-8 flex justify-end">
          <ResearchNavigationSidebar isInline />
        </div>

        {/* Search & Subject Bar - Reduced Width */}
        <div className="mb-12">
          <div className="max-w-[750px] mx-auto">
            <div className="text-center mb-6">
              <h2 className="inconsolata-ui text-[20px] font-bold text-text-heading tracking-tight">What would you like to research?</h2>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg py-3 pl-12 pr-4 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center">
              {navigation.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateCategory(category.id)}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full bg-surface border border-border text-[11px] font-bold uppercase tracking-wider inconsolata-ui hover:bg-accent hover:text-white hover:border-accent transition-all"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of Categories */}
        <div className="space-y-12 md:space-y-20">
          {filteredNavigation.map((category) => (
            <section key={category.id} id={category.id}>
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <h2 className="inconsolata-ui text-[16px] md:text-[20px] font-bold text-text-heading uppercase tracking-[0.2em]">
                  {category.title}
                </h2>
                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                <span className="inconsolata-ui text-[10px] md:text-[11px] font-bold text-text-muted whitespace-nowrap">
                  {category.sections.length} PAPERS
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                {category.sections.map((section) => {
                  const paper = papers[section.slug];
                  return (
                    <Link 
                      key={section.slug} 
                      href={`/research-decoded/${section.slug}`}
                      className="group block"
                    >
                      <article className="h-full flex flex-col">
                        {paper?.heroImage && (
                          <div className="relative mb-5 h-[200px] w-full overflow-hidden rounded-lg bg-image-bg border border-border shadow-sm transition-all group-hover:border-accent/30">
                            <img 
                              src={paper.heroImage} 
                              alt={section.title}
                              className="w-full h-full object-contain p-4 transition-all duration-500 group-hover:scale-105 dark:opacity-80"
                              onError={(e) => {
                                // If image fails, hide the entire container
                                const parent = e.currentTarget.closest('.relative');
                                if (parent) (parent as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        )}
                        
                        <div className="inconsolata-ui text-text-muted mb-1.5 text-[11px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                          {paper?.authors || 'Research Team'}
                        </div>
                        
                        <h3 className="inconsolata-ui text-[18px] font-bold text-text-heading mb-2 group-hover:text-accent transition-colors leading-tight">
                          {section.title}
                        </h3>
                        
                        <p className="manrope-body text-[13px] text-text-secondary line-clamp-2 leading-relaxed font-medium">
                          {paper?.intro || 'Exploring the foundational shifts that defined this breakthrough...'}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-text-heading opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <span className="inconsolata-ui uppercase tracking-tighter">Read Decoding</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
          {filteredNavigation.length === 0 && (
            <div className="py-20 text-center">
              <p className="manrope-body text-text-muted text-lg">No papers found matching &quot;{searchQuery}&quot;</p>
              <button 
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('q');
                  window.history.replaceState({}, '', url.toString());
                  window.location.reload();
                }}
                className="mt-4 inconsolata-ui text-teal-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Footer Breadcrumbs */}
        <div className="mt-20 pt-8 border-t border-border flex justify-start">
          <Breadcrumbs items={[{ label: 'Research Decoded' }]} />
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-10 right-10 z-[200] bg-accent text-white p-3.5 rounded-full hover:bg-accent/90 transition-all hover:scale-110 shadow-2xl flex items-center justify-center border border-white/20"
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
