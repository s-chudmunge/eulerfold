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
              className="flex flex-col border border-border rounded-lg p-6 bg-transparent"
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
                  className="inline-block bg-text-heading text-background text-[13px] font-semibold px-4 py-2 rounded-md hover:opacity-80 transition-opacity"
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
