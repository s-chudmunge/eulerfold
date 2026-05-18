"use client";

import React, { useState } from 'react';
import { ExternalLink, ArrowLeft, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { DiscussionSection } from '@/components/discussions/DiscussionSection';
import SocialShare from '@/components/SocialShare';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendedRoadmaps from '@/components/RecommendedRoadmaps';
import FloatingTTS from '@/components/FloatingTTS';
import NextStepsSidebar from '@/components/NextStepsSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { SideBanner, QUOTES } from '@/components/layout/SideBanners';

interface Article {
  title: string;
  slug: string;
  author: string;
  date: string;
  subject: string;
  heroImage: string;
  excerpt: string;
  technicalInsight?: string;
  faq?: Array<{ q: string; a: string }>;
  synonyms?: string[];
  content: string;
  d2Cache?: Record<string, string>;
}

interface Paper {
  title: string;
  authors: string;
  citation: string;
  link: string;
  heroImage: string | null;
  intro: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    diagram?: {
      url: string;
      caption: string;
    };
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: string;
    provider: string;
  }>;
  next: string | null;
  prev: string | null;
  slug?: string; // Optional slug for recommendations
}

interface Props {
  paper: Paper;
  slug: string;
  papers: Record<string, Paper>;
}

import { articles } from '../../articles/generatedArticles';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

const D2Diagram = ({ code }: { code: string }) => {
  const [svg, setSvg] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    
    fetch('https://kroki.io/d2/svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: code,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch SVG');
        return res.text();
      })
      .then(data => {
        if (isMounted) {
          setSvg(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('D2 rendering error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-8 p-4 bg-callout-bg border border-error/20 rounded-xl">
        <div className="flex items-center gap-2 text-error mb-2 text-xs font-bold uppercase tracking-widest inconsolata-ui">
          <span>⚠️ Diagram Render Error</span>
        </div>
        <pre className="text-[12px] text-text-muted overflow-auto p-4 bg-background/50 rounded-lg">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-8 flex justify-center items-center h-[300px] bg-callout-bg rounded-2xl animate-pulse border border-border">
        <div className="text-text-muted text-sm font-medium inconsolata-ui tracking-widest uppercase text-center px-6">
          Generating Breakdown Diagram...
        </div>
      </div>
    );
  }

  return (
    <div className="d2-container d2-diagram animate-in fade-in duration-700">
      <div 
        className="w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

const ArticlePreview = ({ slug }: { slug: string }) => {
  const article = articles[slug as keyof typeof articles];
  if (!article) return null;

  return (
    <div className="w-80 p-0 bg-sidebar border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
      {article.heroImage && (
        <div className="h-32 w-full overflow-hidden border-b border-border">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 text-left">
        <div className="flex items-center gap-2 mb-2">
           <span className="inconsolata-ui text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/10 px-2 py-0.5 rounded">
            {article.subject}
          </span>
        </div>
        <h4 className="text-[16px] font-bold text-text-heading mb-2 leading-tight font-inter tracking-tight">
          {article.title}
        </h4>
        <p className="text-[13px] text-text-muted line-clamp-3 leading-relaxed manrope-body font-medium">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-accent inconsolata-ui uppercase tracking-wider">
          Read Article <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

const TermLink = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  return (
    <span 
      className="relative inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        href={`/articles/${slug}`}
        className="text-link hover:opacity-80 transition-opacity underline decoration-link/30 decoration-2 underline-offset-4 font-semibold"
      >
        {children}
      </Link>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-4 hidden md:block"
          >
            <ArticlePreview slug={slug} />
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 bg-sidebar border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

const MarkdownWithLinks = ({ content }: { content: string }) => {
  // Dynamically build terms to link from the articles data
  const termsToLink = React.useMemo(() => {
    return Object.values(articles).flatMap(article => {
      const terms = [
        { term: article.title, slug: article.slug },
      ];
      
      if (article.shortSlug) {
        terms.push({ term: article.shortSlug, slug: article.slug });
        const spaceTerm = article.shortSlug.replace(/-/g, ' ');
        if (spaceTerm !== article.shortSlug) {
          terms.push({ term: spaceTerm, slug: article.slug });
        }
      }

      // Add synonyms from the article data if they exist
      if (article.synonyms && Array.isArray(article.synonyms)) {
        article.synonyms.forEach(syn => {
          if (!terms.some(t => t.term.toLowerCase() === syn.toLowerCase())) {
            terms.push({ term: syn, slug: article.slug });
          }
        });
      }
      
      return terms;
    }).sort((a, b) => b.term.length - a.term.length);
  }, []);

  const renderTextWithLinks = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    termsToLink.forEach(({ term, slug }) => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          // Case-insensitive match for the term as a whole word
          const regex = new RegExp(`(\\b${term}\\b)`, 'gi');
          const split = part.split(regex);
          split.forEach((s, i) => {
            if (s.toLowerCase() === term.toLowerCase()) {
              newParts.push(<TermLink key={`${slug}-${i}-${s}`} slug={slug}>{s}</TermLink>);
            } else if (s !== '') {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, child => {
      if (typeof child === 'string') {
        return renderTextWithLinks(child);
      }
      
      if (React.isValidElement(child)) {
        const type = child.type as any;
        const typeName = typeof type === 'string' ? type : type.name || type.displayName || '';
        const props = child.props as any;
        const className = props?.className || '';

        // Strictly skip any math-related nodes or code blocks
        if (
          typeName === 'a' || 
          typeName === 'Link' || 
          typeName.includes('Link') ||
          className.includes('katex') ||
          className.includes('math') ||
          typeName === 'code' ||
          typeName === 'pre' ||
          props?.['data-math']
        ) {
          return child;
        }

        if (props?.children) {
          return React.cloneElement(child as React.ReactElement, {
            children: processChildren(props.children)
          } as any);
        }
      }
      return child;
    });
  };

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkMath]} 
      rehypePlugins={[rehypeKatex]}
      components={{
        // Custom h2 for IDs (we disable automatic IDs here to avoid conflict with main section IDs)
        h2: ({node, children, ...props}) => {
          return <h2 className="text-[20px] md:text-[24px] font-bold text-accent mb-6 flex items-center gap-3" {...props}>{children}</h2>;
        },
        // We target the paragraph and list items to process their text children
        p: ({ children }) => {
          return <p>{processChildren(children)}</p>;
        },
        li: ({ children }) => {
          return <li>{processChildren(children)}</li>;
        },
        hr: () => null,
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isD2 = match && match[1] === 'd2';
          if (isD2) {
            return <D2Diagram code={String(children).replace(/\n$/, '')} />;
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function ResearchDecodedClient({ paper, slug, papers }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [activeId, setActiveId] = useState<string>('');
  const [quoteIndex, setQuoteIndex] = React.useState(0);
  const [recommendations, setRecommendations] = React.useState<{
    articles: Article[],
    papers: Paper[]
  }>({ articles: [], papers: [] });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const headings = React.useMemo(() => {
    return paper.sections.map(section => ({
      title: section.title,
      id: section.id
    }));
  }, [paper.sections]);

  React.useEffect(() => {
    // Advanced recommendation logic for Research Decoded
    const allArticles = Object.values(articles) as Article[];
    
    // Extract potential keywords from title and intro
    const keywords = [
      ...paper.title.toLowerCase().split(' ').filter(w => w.length > 4),
      ...paper.intro.toLowerCase().split(' ').filter(w => w.length > 4)
    ].slice(0, 10);

    const scoredArticles = allArticles
      .map(a => {
        let score = 0;
        const aTitle = a.title.toLowerCase();
        const aExcerpt = a.excerpt.toLowerCase();
        
        keywords.forEach(k => {
          if (aTitle.includes(k)) score += 5;
          if (aExcerpt.includes(k)) score += 2;
        });

        if (a.synonyms) {
          a.synonyms.forEach(syn => {
            if (paper.title.toLowerCase().includes(syn.toLowerCase())) score += 5;
            if (paper.intro.toLowerCase().includes(syn.toLowerCase())) score += 3;
          });
        }

        return { article: a, score };
      })
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .slice(0, 3);

    const allPapers = Object.entries(papers).map(([pSlug, p]) => ({
      ...p,
      slug: pSlug
    })) as (Paper & { slug: string })[];

    const scoredPapers = allPapers
      .filter(p => p.slug !== slug)
      .map(p => {
        let score = 0;
        const pTitle = p.title.toLowerCase();
        const pIntro = p.intro.toLowerCase();

        keywords.forEach(k => {
          if (pTitle.includes(k)) score += 10;
          if (pIntro.includes(k)) score += 3;
        });

        return { paper: p, score };
      })
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .slice(0, 3);

    setRecommendations({
      articles: scoredArticles.map(sa => sa.article),
      papers: scoredPapers.map(sp => sp.paper)
    });
  }, [paper, slug, papers]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      let currentActiveId = '';
      
      // If we're at the very top, highlight the first section
      if (window.scrollY < 100 && headings.length > 0) {
        currentActiveId = headings[0].id;
      } else {
        for (let i = 0; i < headings.length; i++) {
          const element = document.getElementById(headings[i].id);
          if (!element) continue;
          
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          
          if (scrollPosition >= top) {
            currentActiveId = headings[i].id;
          } else {
            break;
          }
        }
      }
      
      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, activeId]);

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
  };

  const fullContent = React.useMemo(() => {
    return [
      paper.intro,
      ...paper.sections.map(s => `${s.title}\n${s.content}`)
    ].join('\n\n');
  }, [paper]);

  return (
    <div className="bg-background min-h-screen pb-24 text-text-primary serif-page-scope">
      <FloatingTTS content={fullContent} />
      {/* Design matches strictly the refined example/topic-page */}
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-center xl:justify-start xl:pl-[120px] gap-12 lg:gap-20 px-6 py-8 md:px-12 md:py-16">
        
        {/* Table of Contents (Left Sidebar) */}
        <aside className="hidden xl:block w-[220px] shrink-0">
          <div className="sticky top-[40px]">
            <h3 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-6 opacity-60">Structure</h3>
            <nav className="flex flex-col gap-4">
              {headings.map((heading) => (
                <a 
                  key={heading.id} 
                  href={`#${heading.id}`}
                  onClick={() => setActiveId(heading.id)}
                  className={`text-[13px] font-medium leading-tight transition-all hover:text-accent ${
                    activeId === heading.id 
                      ? "text-accent border-l-2 border-accent pl-3 -ml-[2px]" 
                      : "text-text-muted pl-3 border-l-2 border-transparent hover:border-accent/20"
                  }`}
                >
                  {heading.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="max-w-[900px] w-full">
          {/* Community Banner */}
        <div className="mb-10 bg-transparent rounded-2xl p-6 md:p-8 border border-border/60 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="font-bold mb-2 text-text-heading tracking-tight text-lg">Join the EulerFold community</h2>
            <p className="text-text-primary mb-6 max-w-md font-medium text-[14px] leading-relaxed">Track progress and collaborate on roadmaps with students worldwide.</p>
            <button 
              onClick={user ? () => window.location.href = '/dashboard' : handleSignIn}
              className="inline-block bg-[var(--text-heading)] rounded-lg px-6 py-2 font-bold text-[13px] text-[var(--bg-main)] hover:opacity-90 shadow-md transition-all"
            >
              {user ? 'Go to Dashboard' : 'Sign In Free'}
            </button>
          </div>
          <span className="absolute -bottom-6 -right-6 text-[80px] md:text-[110px] opacity-[0.03] grayscale -rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-700">🐢</span>
        </div>

        {/* Paper Header */}
        <header className="mb-12">
          <Breadcrumbs items={[
            { label: 'Research Decoded', href: '/research-decoded' },
            { label: paper.authors }
          ]} />
          <div className="flex items-center gap-2 text-accent mb-6 font-bold flex-wrap">
            <Link href="/research-decoded" className="bg-accent-muted px-2 py-0.5 rounded hover:bg-accent/10 transition-colors text-[11px] uppercase tracking-widest">
              Research Decoded
            </Link>
            <span className="text-[var(--border)]">/</span>
            <span className="font-medium text-[13px] text-text-muted">{paper.authors}</span>
          </div>

          <SocialShare 
            title={paper.title} 
            text={`Decoding ${paper.title} on EulerFold:`} 
            className="mb-8" 
          />
          
          <h1 className="font-bold text-text-heading mb-10 leading-[1.15] tracking-tight group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-3xl transition-opacity hidden md:inline">#</span>
            {paper.title}
          </h1>

          <div className="p-5 md:p-6 bg-callout-bg border-l-2 border-[var(--accent)] rounded-r-xl mb-12">
            <p className="text-text-primary italic m-0 leading-relaxed font-medium">
              {paper.citation}
            </p>
            <Link 
              href={paper.link} 
              target="_blank" 
              className="text-accent font-bold hover:underline mt-3 inline-flex items-center gap-1"
            >
              Read Original Paper <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Image */}
        {paper.heroImage && (
          <div className="mb-12 p-4 md:p-6 bg-image-bg border border-border rounded-2xl shadow-xl max-w-[900px] mx-auto overflow-hidden">
            <motion.img 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              src={paper.heroImage} 
              alt={`${paper.title} - Research Breakthrough Illustration`} 
              className="w-full rounded-xl transition-all cursor-zoom-in block" 
              onClick={() => setSelectedImage(paper.heroImage)}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Paper Intro */}
        <div className="serif-page-scope mb-8 text-text-primary prose-eulerfold max-w-none">
          <MarkdownWithLinks content={paper.intro} />
        </div>

        {/* Sections */}
        {paper.sections.map((section) => (
          <section key={section.id} className="mt-16 md:mt-24">
            <h2 id={section.id} className="text-text-heading mb-6 group flex items-center md:-ml-12 scroll-mt-24">
              <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
              {section.title}
            </h2>

            {section.diagram && (
              <div className="my-12 p-4 md:p-6 bg-image-bg border border-border rounded-2xl max-w-[900px] mx-auto shadow-sm overflow-hidden">
                <motion.img 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  src={section.diagram.url} 
                  alt={`${section.title} Diagram - ${section.diagram.caption}`} 
                  className="mx-auto rounded-xl max-h-[300px] md:max-h-[400px] cursor-zoom-in block" 
                  onClick={() => setSelectedImage(section.diagram.url)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-text-muted mt-5 text-center italic font-medium">
                  {section.diagram.caption}
                </p>
              </div>
            )}

            <div className="text-text-primary prose-eulerfold max-w-none">
              <MarkdownWithLinks content={section.content} />
            </div>
          </section>
        ))}

        {/* Resources Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <h2 className="text-text-heading mb-10 group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
            Dive Deeper
          </h2>
          <ul className="space-y-8 list-none p-0 mb-12">
            {paper.resources.map((res, idx) => (
              <li key={idx} className="border-b border-border pb-10 last:border-0 group">
                <p className="font-bold text-text-heading m-0 mb-2 group-hover:text-accent transition-colors">{res.title}</p>
                <p className="text-text-muted m-0 font-medium">{res.provider} • {res.type}</p>
                <Link href={res.url} target="_blank" className="text-accent hover:underline mt-5 inline-flex items-center gap-2 font-bold">
                  Explore Resource <ExternalLink className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Discussion Section */}
        <DiscussionSection contextId={slug} contextType="research-decoded" />

        {/* Recommended Readings */}
        <div className="mt-20 pt-12 border-t border-border">
          <h2 className="text-[22px] font-bold text-text-heading mb-8 tracking-tight font-inter">
            Recommended Readings
          </h2>
          
          <div className="space-y-10">
            {/* Glossary Articles */}
            {recommendations.articles.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] inconsolata-ui mb-4 block opacity-60">From the Glossary</span>
                <div className="flex flex-col gap-4">
                  {recommendations.articles.map((item) => (
                    <Link key={item.slug} href={`/articles/${item.slug}`} className="group flex items-start justify-between py-2 border-b border-border/40 hover:border-accent/40 transition-colors">
                      <span className="text-[17px] md:text-[19px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                        {item.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Research Papers */}
            {recommendations.papers.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] inconsolata-ui mb-4 block opacity-60">Research Decoded</span>
                <div className="flex flex-col gap-4">
                  {recommendations.papers.map((p) => (
                    <Link key={p.slug} href={`/research-decoded/${p.slug}`} className="group flex items-start justify-between py-2 border-b border-border/40 hover:border-accent/40 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[17px] md:text-[19px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                          {p.title}
                        </span>
                        <span className="text-[13px] text-text-muted font-medium italic opacity-70">{p.authors}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <RecommendedRoadmaps query={paper.title} className="mt-10" />
        </div>

        {/* Navigation */}
        <footer className="mt-16 flex flex-col md:flex-row items-stretch md:items-center pb-16 font-medium border-t border-border pt-12 gap-8 md:gap-0">
          {paper.prev ? (
            <Link href={`/research-decoded/${paper.prev}`} className="flex items-center text-text-muted hover:text-text-heading transition-all group">
              <span className="mr-3 text-xl md:text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase tracking-widest opacity-60">Previous Paper</span>
                <span className="font-bold truncate max-w-[200px] md:max-w-[250px]">{papers[paper.prev as keyof typeof papers].title}</span>
              </div>
            </Link>
          ) : <div />}

          {paper.next ? (
            <Link href={`/research-decoded/${paper.next}`} className="md:ml-auto flex items-center text-right text-text-muted hover:text-text-heading transition-all group justify-end">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted uppercase tracking-widest opacity-60">Next Paper</span>
                <span className="font-bold truncate max-w-[200px] md:max-w-[250px]">{papers[paper.next as keyof typeof papers].title}</span>
              </div>
              <span className="ml-3 text-xl md:text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : <div />}
        </footer>

        {/* AI Disclosure */}
        <div className="mt-12 text-center border-t border-border/20 pt-8">
          <p className="text-text-muted opacity-50 italic max-w-lg mx-auto leading-relaxed">
            The author of this article utilized generative AI (Google Gemini 3.1 Pro) to assist in part of the drafting and editing process.
          </p>
        </div>
      </div>

      {/* Action Sidebar (Right) */}
      <div className="hidden lg:flex flex-col gap-12 w-[240px] shrink-0">
        <NextStepsSidebar 
          subject="Research" 
          topic={paper.title} 
          className="w-full"
        />

        <SideBanner 
          isStatic
          buttonText="Articles"
          href="/articles"
          currentQuote={QUOTES[quoteIndex]}
          quoteIndex={quoteIndex}
        />
      </div>
    </div>

    {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 cursor-zoom-out"
              onClick={() => {
                setSelectedImage(null);
                setScale(1);
              }}
            />
            
            {/* Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-[220]">
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1">
                <button 
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="px-2 text-[12px] font-bold text-white/90 min-w-[45px] text-center inconsolata-ui">
                  {Math.round(scale * 100)}%
                </span>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button 
                  onClick={handleResetZoom}
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                  title="Reset Zoom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>

              <button 
                className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20 text-white/70 hover:text-white transition-colors"
                onClick={() => {
                  setSelectedImage(null);
                  setScale(1);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1,
                  scale: scale,
                  transition: { type: 'spring', damping: 25, stiffness: 200 }
                }}
                src={selectedImage}
                alt="Expanded view"
                className={`max-w-full max-h-full shadow-2xl z-[205] relative bg-white ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                drag={scale > 1}
                dragConstraints={{ left: -500 * scale, right: 500 * scale, top: -500 * scale, bottom: 500 * scale }}
                onClick={(e) => {
                  if (scale === 1) {
                    handleZoomIn(e);
                  } else {
                    // Prevent closing when clicking the image while zoomed
                    e.stopPropagation();
                  }
                }}
                onWheel={(e) => {
                  if (e.deltaY < 0) handleZoomIn();
                  else handleZoomOut();
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
