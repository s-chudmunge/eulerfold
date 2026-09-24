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
    ...Object.entries(newsletters).map(([slug, nl]) => ({
      id: `newsletter-${slug}`,
      type: 'newsletter' as const,
      title: nl.title,
      excerpt: nl.subtitle || '',
      dateObj: new Date(nl.date),
      slug: nl.slug || slug,
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
    <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30">
      <div className="max-w-6xl mx-auto relative z-10">

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
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border border-[rgba(20,29,25,0.08)] dark:border-[#243333] hover:border-accent/40 dark:hover:border-accent/60 rounded-md p-6 bg-sidebar/40 shadow-[0_12px_32px_-8px_rgba(20,60,52,0.12)] dark:shadow-[0_0_0_1px_rgba(20,184,166,0.15),0_10px_28px_-6px_rgba(15,118,110,0.3),0_16px_40px_-8px_rgba(0,0,0,0.7)] hover:shadow-[0_16px_36px_-8px_rgba(20,60,52,0.18)] dark:hover:shadow-[0_0_0_1px_rgba(20,184,166,0.4),0_14px_36px_-4px_rgba(15,118,110,0.48),0_20px_48px_-6px_rgba(0,0,0,0.8)] transition-all"
            >
              <div className="flex-grow mb-8">
                <h3 className="text-[20px] font-bold text-text-heading leading-snug tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-text-muted text-[14px] leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-text-muted mb-3">
                  {item.subject} · {item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <Link
                  href={item.type === 'article' ? `/articles/${item.slug}` : `/newsletters/${item.slug}`}
                  className="inline-block bg-gradient-to-b from-[#11887e] to-accent text-white text-[13px] font-semibold tracking-[-0.01em] px-4 py-2 rounded-md shadow-[0_2px_8px_rgba(15,118,110,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-[#13968b] hover:to-[#0d6962] hover:shadow-[0_4px_12px_rgba(15,118,110,0.4)] active:scale-[0.98] transition-all"
                >
                  Read more
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
