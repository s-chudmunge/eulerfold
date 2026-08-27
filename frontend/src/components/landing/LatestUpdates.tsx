import React from 'react';
import Link from 'next/link';
import { articles } from '@/app/articles/generatedArticles';
import { newsletters } from '@/app/newsletters/generatedNewsletters';

interface UpdateItem {
  id: string;
  type: 'article' | 'newsletter';
  title: string;
  excerpt: string;
  dateObj: Date;
  slug: string;
  author: string;
  subject: string;
  heroImage: string;
}

export default function LatestUpdates() {
  const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const recentItems: UpdateItem[] = [
    ...Object.values(articles).map(a => ({
      id: `article-${a.slug}`,
      type: 'article' as const,
      title: a.title,
      excerpt: a.excerpt,
      dateObj: new Date(a.date),
      slug: a.slug,
      author: a.author,
      subject: a.subject,
      heroImage: a.heroImage,
    })),
    ...Object.values(newsletters).map(nl => ({
      id: `newsletter-${nl.slug}`,
      type: 'newsletter' as const,
      title: nl.title,
      excerpt: nl.subtitle || '',
      dateObj: new Date(nl.date),
      slug: nl.slug,
      author: nl.author,
      subject: 'Newsletter',
      heroImage: nl.hero_image_url || '',
    })),
  ]
    .filter(item => item.dateObj.getTime() >= cutoffTime)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
    .slice(0, 2);

  if (recentItems.length === 0) return null;

  return (
    <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="rounded-2xl bg-transparent border border-accent/30 hover:border-accent/50 px-6 py-10 sm:p-10 md:p-16 transition-all hover:shadow-md">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-2">
              Latest Updates
            </p>
            <h2 className="text-2xl font-bold text-text-heading tracking-tight">
              Fresh from the desk.
            </h2>
          </div>
          <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-text-muted">
            <Link href="/articles" className="hover:text-accent transition-colors">Articles</Link>
            <span className="opacity-30">/</span>
            <Link href="/newsletters" className="hover:text-accent transition-colors">Newsletters</Link>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentItems.map((item, i) => (
            <Link
              key={item.id}
              href={item.type === 'article' ? `/articles/${item.slug}` : `/newsletters/${item.slug}`}
              className="group flex flex-row bg-background border border-border rounded-lg overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300 h-[160px]"
            >
              {/* Image */}
              <div className="relative w-[140px] shrink-0 overflow-hidden bg-sidebar">
                {item.heroImage && (
                  <img
                    src={item.heroImage}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                )}
                <span className="absolute bottom-2 left-2 text-[8px] font-bold text-white uppercase tracking-[0.15em] bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                  {item.subject}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col justify-between flex-grow overflow-hidden">
                <div>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-[0.15em] mb-1.5">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-[15px] font-bold text-text-heading leading-snug group-hover:text-accent transition-colors tracking-tight line-clamp-2 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-text-muted text-[12px] line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider border-t border-border/50 pt-2 mt-2">
                  <span className="text-text-muted/70 truncate pr-2">{item.author.split('—')[0].trim()}</span>
                  <span className="text-accent shrink-0">{item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>

      </div>
    </section>
  );
}
