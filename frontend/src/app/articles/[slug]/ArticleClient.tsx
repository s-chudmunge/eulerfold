"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram,
  Youtube,
  Rss,
  ArrowRight
} from 'lucide-react';
import { FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'framer-motion';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendedRoadmaps from '@/components/RecommendedRoadmaps';
import FloatingTTS from '@/components/FloatingTTS';
import { Article, articles } from '../generatedArticles';
import { Paper, papers } from '../../research-decoded/generatedData';

const D2Diagram = ({ code, cache }: { code: string, cache?: Record<string, string> }) => {
  const [svg, setSvg] = React.useState<string>(cache?.[code] || '');
  const [loading, setLoading] = React.useState(!cache?.[code]);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (cache?.[code]) {
      setSvg(cache[code]);
      setLoading(false);
      return;
    }

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
  }, [code, cache]);

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
    <div className="d2-container d2-diagram animate-in fade-in duration-700 my-8">
      <div 
        className="w-full flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

const ArticlePreview = ({ slug }: { slug: string }) => {
  const article = articles[slug];
  if (!article) return null;

  return (
    <div className="w-80 p-0 bg-sidebar border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
      {article.heroImage && (
        <div className="h-32 w-full overflow-hidden border-b border-border">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
           <span className="inconsolata-ui text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/10 px-2 py-0.5 rounded">
            {article.category}
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
        className="text-accent hover:text-accent/80 transition-colors underline decoration-accent/30 decoration-2 underline-offset-4 font-semibold"
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

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

const MarkdownWithLinks = ({ content, currentSlug, cache }: { content: string, currentSlug: string, cache?: Record<string, string> }) => {
  // Dynamically build terms to link from the articles data, excluding the current article
  const termsToLink = React.useMemo(() => {
    return Object.values(articles)
      .filter(article => article.slug.toLowerCase() !== currentSlug.toLowerCase())
      .flatMap(article => {
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
  }, [currentSlug]);

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
        
        // For other elements, recursively process their children if they exist
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
        h2: ({node, children, ...props}) => {
          const content = React.Children.toArray(children).join('');
          const id = slugify(content);
          return <h2 id={id} className="text-[28px] md:text-[32px] font-bold leading-[1.2] mt-[60px] mb-[24px] text-text-heading font-inter tracking-tighter scroll-mt-24" {...props}>{children}</h2>;
        },
        p: ({ children }) => {
          return <p className="mb-[24px]">{processChildren(children)}</p>;
        },
        ul: ({ children }) => {
          return <ul className="list-disc ml-[40px] my-[24px] space-y-4">{processChildren(children)}</ul>;
        },
        li: ({ children }) => {
          return <li>{processChildren(children)}</li>;
        },
        strong: ({node, ...props}) => <strong className="font-bold text-text-heading" {...props} />,
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isD2 = match && match[1] === 'd2';
          if (isD2) {
            return <D2Diagram code={String(children).replace(/\n$/, '')} cache={cache} />;
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

interface Props {
  article: Article;
}

export default function ArticleClient({ article }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = React.useState<{
    articles: Article[],
    papers: Paper[]
  }>({ articles: [], papers: [] });
  const [activeId, setActiveId] = React.useState<string>('');

  const headings = React.useMemo(() => {
    const h2s = article.content.split('\n').filter(line => line.startsWith('## '));
    return h2s.map(line => {
      const title = line.replace('## ', '').trim();
      return { title, id: slugify(title) };
    });
  }, [article.content]);

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
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, activeId]);

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this article on EulerFold: ${article.title}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  React.useEffect(() => {
    // Advanced recommendation logic
    const allArticles = Object.values(articles);
    const keywords = [
      article.title.toLowerCase(),
      article.category.toLowerCase(),
      ...(article.synonyms || []).map(s => s.toLowerCase())
    ];

    const scoredArticles = allArticles
      .filter(a => a.slug !== article.slug)
      .map(a => {
        let score = 0;
        if (a.category === article.category) score += 10;
        
        const aTitle = a.title.toLowerCase();
        const aExcerpt = a.excerpt.toLowerCase();
        
        keywords.forEach(k => {
          if (aTitle.includes(k)) score += 5;
          if (aExcerpt.includes(k)) score += 2;
        });

        // Check if any of this article's synonyms appear in the target article's content
        if (a.synonyms) {
          a.synonyms.forEach(syn => {
            if (article.content.toLowerCase().includes(syn.toLowerCase())) score += 3;
          });
        }

        return { article: a, score };
      })
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .slice(0, 3); // Increased to 3 for better density

    // Map entries to ensure we have the slug (the key) available
    const allPapers = Object.entries(papers).map(([slug, paper]) => ({
      ...paper,
      slug
    }));

    const scoredPapers = allPapers
      .map(p => {
        let score = 0;
        const pTitle = p.title.toLowerCase();
        const pIntro = p.intro.toLowerCase();

        keywords.forEach(k => {
          if (pTitle.includes(k)) score += 10;
          if (pIntro.includes(k)) score += 3;
        });

        // Bonus for matching authors (if applicable, though usually not)
        return { paper: p, score };
      })
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .slice(0, 3);

    setRecommendations({
      articles: scoredArticles.map(sa => sa.article),
      papers: scoredPapers.map(sp => sp.paper)
    });
  }, [article.slug, article.title, article.category, article.synonyms, article.content]);

  return (
    <div className="min-h-screen bg-background text-text-primary serif-page-scope selection:bg-accent/20">
      <FloatingTTS content={article.content} />
      <PublicHeader />

      {/* Site Content (BibGuru Layout) */}
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-center xl:justify-start xl:pl-[120px] gap-[40px] lg:gap-[60px] mt-[30px] md:mt-[60px] pb-[80px] px-6">
        
        {/* Table of Contents (Left Sidebar) */}
        <aside className="hidden xl:block w-[200px] shrink-0">
          <div className="sticky top-[100px]">
            <h3 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-6 opacity-60">Contents</h3>
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

        {/* Content Area (Max 700px) */}
        <main className="w-full max-w-[700px]">
          <article>
            <header className="mb-[40px]">
              <Breadcrumbs items={[
                { label: 'Articles', href: '/articles' },
                { label: article.category }
              ]} />
              <h1 className="text-text-heading mb-[20px] tracking-tighter">
                {article.title}
              </h1>
              <div className="text-[17px] text-text-muted opacity-70 font-medium inconsolata-ui uppercase tracking-widest date">
                By <span className="text-text-heading font-semibold">{article.author}</span> / {article.date}
              </div>
            </header>

            <div className="page-content">
              {/* Featured Image */}
              {article.heroImage && (
                <figure className="my-[40px]">
                  <div className="rounded-2xl overflow-hidden border border-border bg-card p-2 shadow-sm">
                    <img 
                      src={article.heroImage} 
                      alt={article.title} 
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                </figure>
              )}

              <div className="prose prose-eulerfold max-w-none text-text-primary">
                <MarkdownWithLinks content={article.content} currentSlug={article.slug} cache={article.d2Cache} />
              </div>

              {/* Box Component (Technical Insight) */}
              {article.technicalInsight && (
                <div className="my-[60px] relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-accent/30 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-callout-bg p-[30px] md:p-[45px] rounded-2xl border border-callout-border leading-relaxed">
                    <p className="italic text-text-heading font-medium">
                      "{article.technicalInsight}"
                    </p>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {article.faq && article.faq.length > 0 && (
                <div className="mt-[80px]">
                  <h2 className="mb-[32px] text-text-heading tracking-tighter">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {article.faq.map((item, idx) => (
                      <details key={idx} className="group border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:border-accent/30">
                        <summary className="p-[24px] font-bold leading-[1.3] cursor-pointer list-none flex justify-between items-center group-open:bg-accent/5 transition-colors tracking-tight text-text-heading">
                          <span className="max-w-[90%]">{item.q}</span>
                          <span className="text-accent text-[24px] font-light transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div className="px-[24px] pb-[24px] pt-2 text-text-primary font-normal opacity-90">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Banner */}
              <div className="mt-[80px] bg-callout-bg rounded-3xl p-6 md:p-8 border border-border relative overflow-hidden group">
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-2 text-accent mb-3">
                    <span className="inconsolata-ui text-[11px] md:text-[12px] font-bold uppercase tracking-wider">EulerFold Intelligence</span>
                  </div>
                  <h2 className="font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">Join the EulerFold community</h2>
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

              {/* Social Buttons */}
              <div className="flex flex-wrap gap-4 mt-[60px] border-t border-border pt-[40px]">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#000000] text-white px-[16px] py-[8px] rounded-xl text-[14px] font-bold hover:bg-[#1a1a1a] shadow-[inset_0_-3px_0_rgba(255,255,255,0.1)] transition-colors"
                >
                  <FaXTwitter className="w-4 h-4 fill-white" /> Post
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#3a579a] text-white px-[16px] py-[8px] rounded-xl text-[14px] font-bold hover:bg-[#344f8b] shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors"
                >
                  <Facebook className="w-4 h-4 fill-white" /> Share
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white px-[16px] py-[8px] rounded-xl text-[14px] font-bold hover:bg-[#20bd5c] shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4 fill-white" /> WhatsApp
                </a>
              </div>

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
                        {recommendations.papers.map((paper) => (
                          <Link key={paper.slug} href={`/research-decoded/${paper.slug}`} className="group flex items-start justify-between py-2 border-b border-border/40 hover:border-accent/40 transition-colors">
                            <div className="flex flex-col gap-1">
                              <span className="text-[17px] md:text-[19px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                                {paper.title}
                              </span>
                              <span className="text-[13px] text-text-muted font-medium italic opacity-70">{paper.authors}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-1" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <RecommendedRoadmaps query={article.title} className="mt-10" />
              </div>

              {/* AI Disclosure */}
              <div className="mt-16 text-center border-t border-border pt-10">
                <p className="text-[13px] text-text-muted manrope-body italic max-w-lg mx-auto leading-relaxed font-medium">
                  The author of this article utilized generative AI (Google Gemini 3.1 Pro) to assist in part of the drafting and editing process.
                </p>
              </div>

              {/* Simplified About Card at Bottom */}
              <div className="mt-16 pt-10 border-t border-border flex flex-col items-center">
                <p className="text-[16px] text-text-primary manrope-body font-medium mb-6 text-center">
                  Technical explainers on AI, research, and modern engineering.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-bold text-text-muted inconsolata-ui uppercase tracking-widest">Follow us</span>
                  <div className="flex gap-2">
                    <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] bg-[#000000] rounded flex items-center justify-center hover:opacity-80 transition-opacity">
                      <FaXTwitter className="w-4 h-4 text-white" />
                    </a>
                    <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] bg-[#E1306C] rounded flex items-center justify-center hover:opacity-80 transition-opacity">
                      <Instagram className="w-4 h-4 text-white" />
                    </a>
                    <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] bg-[#FF0000] rounded flex items-center justify-center hover:opacity-80 transition-opacity">
                      <Youtube className="w-4 h-4 text-white" />
                    </a>
                    <a href="mailto:eulerfold@gmail.com" className="w-[32px] h-[32px] bg-[#0F766E] rounded flex items-center justify-center hover:opacity-80 transition-opacity">
                      <Rss className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>

      <Footer />
    </div>
  );
}
