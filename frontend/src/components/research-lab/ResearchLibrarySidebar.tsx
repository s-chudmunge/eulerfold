"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';
import { articles } from '@/app/articles/generatedArticles';
import { navigation } from '@/app/research-decoded/generatedData';

// Simple seedable random generator
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return function() {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
    };
}

function shuffle<T>(array: T[], random: () => number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function ResearchLibrarySidebar() {
    const dailyItems = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const random = seededRandom(today);

        // Flatten all papers from navigation
        const allPapers = navigation.flatMap(cat => cat.sections.map(sec => ({
            title: sec.title,
            slug: sec.slug
        })));

        // Flatten all articles
        const allArticles = Object.values(articles).map(art => ({
            title: art.title,
            slug: art.slug
        }));

        const shuffledPapers = shuffle(allPapers, random);
        const shuffledArticles = shuffle(allArticles, random);

        return {
            papers: shuffledPapers.slice(0, 10),
            articles: shuffledArticles.slice(0, 10)
        };
    }, []);

    return (
        <div 
            className="space-y-14 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 pb-10"
            style={{ 
                msOverflowStyle: 'none',  /* IE and Edge */
                scrollbarWidth: 'none',    /* Firefox */
            }}
        >
            {/* Add a style tag for Webkit browsers */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {/* Research Decoded */}
            <div className="space-y-6 text-left">
                <h2 className="inconsolata-ui text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Curated library
                </h2>
                <div className="flex flex-col gap-5">
                    {dailyItems.papers.map((paper) => (
                        <Link 
                            key={paper.slug}
                            href={`/research-decoded/${paper.slug}`}
                            className="text-[13px] font-medium text-text-primary hover:text-accent transition-colors leading-tight line-clamp-2"
                        >
                            {paper.title}
                        </Link>
                    ))}
                    <Link 
                        href="/research-decoded"
                        className="text-[10px] font-black text-accent uppercase tracking-[0.2em] hover:underline flex items-center gap-1.5 pt-2"
                    >
                        Browse all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Technical Articles */}
            <div className="space-y-6 text-left">
                <h2 className="inconsolata-ui text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Deep dives
                </h2>
                <div className="flex flex-col gap-5">
                    {dailyItems.articles.map((article) => (
                        <Link 
                            key={article.slug}
                            href={`/articles/${article.slug}`}
                            className="text-[13px] font-medium text-text-primary hover:text-accent transition-colors leading-tight line-clamp-2"
                        >
                            {article.title}
                        </Link>
                    ))}
                    <Link 
                        href="/articles"
                        className="text-[10px] font-black text-accent uppercase tracking-[0.2em] hover:underline flex items-center gap-1.5 pt-2"
                    >
                        Read more <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
