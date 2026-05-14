"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { navigation, papers } from './generatedData';
import { ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cleanSearchQuery, getSearchKeywords } from '@/lib/search';
import CommunityRoadmapBanner from '@/components/landing/CommunityRoadmapBanner';

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
  const { user } = useAuth();

  const handleSearchParams = React.useCallback((params: URLSearchParams) => {
    setSearchQuery(params.get('q') || "");
    
    const subjectId = params.get('subject');
    if (subjectId) {
      setTimeout(() => {
        const element = document.getElementById(subjectId);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
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
    <div className="bg-background min-h-screen pb-24 overflow-y-auto text-text-primary">
      <Suspense fallback={null}>
        <SearchParamsHandler onParams={handleSearchParams} />
      </Suspense>
      <div className="max-w-[1000px] mx-auto px-6 py-6 md:px-10 md:py-10">
        
        {/* Header Section simplified as subheader is now in the Shell */}
        {!searchQuery && (
          <header className="mb-10">
            <div className="inconsolata-ui flex items-center gap-2 text-accent mb-3 text-[12px] md:text-[13px] font-bold uppercase tracking-widest flex-wrap">
              <span className="bg-accent-muted px-2 py-0.5 rounded">Decoded</span>
              <span className="text-[var(--border)]">/</span>
              <span className="text-[var(--text-label)] font-medium">Curated Science</span>
            </div>
            
            <h1 className="inconsolata-ui text-[26px] md:text-[38px] font-bold text-text-heading mb-4 leading-[1.1] tracking-tighter">
              Research Decoded
            </h1>
            
            <p className="manrope-body text-[14px] md:text-[15px] text-text-primary max-w-2xl leading-relaxed">
              The foundational breakthroughs of modern AI, decoded for the curious. 
              From Mendel&apos;s laws to Gemini&apos;s native multimodality, explore the specific technical shifts that changed the trajectory of human reasoning.
            </p>
          </header>
        )}

        {/* Goal Architect Banner */}
        <div className="mb-20">
            <CommunityRoadmapBanner />
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
                        <div className="relative mb-5 h-[160px] w-full overflow-hidden rounded-xl bg-image-bg border border-border shadow-sm transition-all group-hover:border-accent/30">
                          {paper?.heroImage ? (
                            <img 
                              src={paper.heroImage} 
                              alt={section.title}
                              className="w-full h-full object-contain p-4 transition-all duration-500 group-hover:scale-105 dark:opacity-80"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full flex items-center justify-center p-6 text-center bg-image-bg inconsolata-ui text-[0.8rem] font-bold text-text-muted uppercase tracking-tight';
                                  placeholder.innerText = section.title;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-6 text-center bg-image-bg inconsolata-ui text-[0.8rem] font-bold text-text-muted uppercase tracking-tight">
                              {section.title}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        
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
      </div>
    </div>
  );
}
