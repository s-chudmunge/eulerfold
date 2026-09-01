"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram,
  Youtube,
  Rss,
  ArrowRight,
  Heart,
  MessageCircle,
  Clock,
  List,
  Linkedin
} from 'lucide-react';
import { FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'framer-motion';
import PublicHeader from '@/components/PublicHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendedRoadmaps from '@/components/RecommendedRoadmaps';
import FloatingTTS from '@/components/FloatingTTS';
import { DiscussionSection } from '@/components/discussions/DiscussionSection';
import { Article, articles } from '../generatedArticles';
import { Paper, papers } from '../../research-decoded/generatedData';
import { api } from '@/lib/api';
import CommunityRoadmapBanner from '@/components/landing/CommunityRoadmapBanner';
import NewsletterBanner from '@/components/landing/NewsletterBanner';
import SocialShare from '@/components/SocialShare';
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
    })      .then(res => {
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
      <div className="my-8 p-4 bg-callout-bg border border-error/20 rounded-lg">
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
      <div className="my-8 flex justify-center items-center h-[300px] bg-callout-bg rounded-lg animate-pulse border border-border">
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

const TermLink = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  return (
    <Link 
      href={`/articles/${slug}`}
      className="text-link hover:opacity-80 transition-opacity underline decoration-link/30 decoration-2 underline-offset-4 font-semibold inline"
    >
      {children}
    </Link>
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
          return <h2 id={id} className="text-[28px] md:text-[32px] leading-[1.2] mt-[60px] mb-[24px] text-accent font-inter tracking-tighter scroll-mt-24" {...props}>{children}</h2>;
        },
        h3: ({node, children, ...props}) => {
          const content = React.Children.toArray(children).join('');
          const id = slugify(content);
          return <h3 id={id} className="text-[22px] md:text-[24px] leading-[1.2] mt-[40px] mb-[16px] text-accent font-inter tracking-tighter scroll-mt-24" {...props}>{children}</h3>;
        },
        p: ({ node, children }) => {
          if (node?.children?.length === 1 && (node.children[0] as any).tagName === 'img') {
            return <div className="mb-[24px]">{processChildren(children)}</div>;
          }
          return <p className="mb-[24px]">{processChildren(children)}</p>;
        },
        ul: ({ children }) => {
          return <ul className="list-disc ml-[40px] my-[24px] space-y-4">{processChildren(children)}</ul>;
        },
        li: ({ children }) => {
          return <li>{processChildren(children)}</li>;
        },
        strong: ({node, ...props}) => <strong className="font-bold text-text-heading" {...props} />,
        a: ({node, ...props}) => (
          <a className="text-teal-700 hover:text-teal-800 underline decoration-teal-700/30 hover:decoration-teal-700/100 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        hr: () => null,
        blockquote: ({ children }) => {
          return (
            <aside className="my-8 p-5 bg-sidebar border-l-4 border-l-accent border-y border-r border-border rounded-r-lg shadow-sm">
              <div className="text-[15px] text-text-primary font-medium leading-relaxed italic opacity-90">
                {processChildren(children)}
              </div>
            </aside>
          );
        },
        img: ({node, alt, ...props}) => (
          <figure className="my-10 w-full overflow-hidden rounded-lg border border-border shadow-md bg-card">
            <img className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700" loading="lazy" alt={alt} {...props} />
            {alt && (
              <figcaption className="p-3 text-center text-[13px] font-medium text-text-muted border-t border-border/50 bg-sidebar/50 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        pre: ({ node, children, ...props }: any) => {
          return (
            <pre
              className="my-6 rounded-md bg-[#1a1a1a] border border-white/10 overflow-x-auto p-5 text-[13.5px] leading-relaxed font-mono text-[#e2e2e2]"
              {...props}
            >
              {children}
            </pre>
          );
        },
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isD2 = match && match[1] === 'd2';
          if (isD2) {
            return <D2Diagram code={String(children).replace(/\n$/, '')} cache={cache} />;
          }
          // inline code (not inside a pre block)
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="px-[5px] py-[2px] rounded bg-sidebar border border-border font-mono text-[13px] text-accent"
                {...props}
              >
                {children}
              </code>
            );
          }
          return <code className={`font-mono text-[#e2e2e2] ${className || ''}`} {...props}>{children}</code>;
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

const AUTHOR_IMAGES: Record<string, string> = {
  "Sankalp Chudmunge": "/author-photo.png",
  "Meera Venkatesh": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
  "Dr. Riya Srinivasan": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
  "Ananya Rao": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  "Dr. Kavya Nair": "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=100&h=100",
  "Dr. Nitin Bansal": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
  "Dr. Siddharth Iyer": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100"
};

export default function ArticleClient({ article }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);
  const [isLoadingLikes, setIsLoadingLikes] = React.useState(true);
  const [recommendations, setRecommendations] = React.useState<{
    articles: Article[],
    papers: Paper[],
    roadmaps?: any[]
  }>({ articles: [], papers: [], roadmaps: [] });
  const [readProgress, setReadProgress] = React.useState(0);
  const [tocOpen, setTocOpen] = React.useState(false);
  const [activeHeading, setActiveHeading] = React.useState('');

  // Compute read time
  const readTime = React.useMemo(() => {
    const words = article.content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article.content]);

  // Extract ToC headings from content
  const tocHeadings = React.useMemo(() => {
    const lines = article.content.split('\n');
    return lines
      .filter(l => l.startsWith('## ') || l.startsWith('### '))
      .map(l => {
        const level = l.startsWith('### ') ? 3 : 2;
        const text = l.replace(/^#{2,3}\s+/, '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return { text, id, level };
      });
  }, [article.content]);

  // Reading progress + active heading tracker
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);

      // Active heading
      const headingEls = document.querySelectorAll('h2[id], h3[id]');
      let current = '';
      headingEls.forEach(el => {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      });
      setActiveHeading(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contextType = 'article';
  const contextId = article.slug;

  const scrollToComments = () => {
    const element = document.getElementById('comments');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await api.get(`/interactions/likes/${contextType}/${contextId}`);
        setLikeCount(response.data.count);
        setIsLiked(response.data.user_liked);
      } catch (err) {
        console.error('Failed to fetch likes:', err);
      } finally {
        setIsLoadingLikes(false);
      }
    };

    fetchLikes();
  }, [contextId, user]);

  const toggleLike = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const response = await api.post('/interactions/likes/toggle', {
        context_type: contextType,
        context_id: contextId
      });

      setLikeCount(response.data.count);
      setIsLiked(response.data.user_liked);
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
    }
  };

  const [authorName, authorRole] = article.author.split(' — ');
  const authorImage = AUTHOR_IMAGES[authorName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0F766E&color=fff&bold=true`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this article on EulerFold: ${article.title}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get(`/content/article-${article.slug}/similar`);
        const simData = response.data || [];
        
        // Map backend generic data to what UI expects, pulling images from local dictionaries
        const articlesSim = simData
          .filter((item: any) => item.content_type === 'article')
          .map((item: any) => {
            const localArt = articles[item.slug as keyof typeof articles];
            return {
              title: item.title,
              slug: item.slug,
              subject: item.subject,
              heroImage: localArt?.heroImage
            };
          });
          
        const papersSim = simData
          .filter((item: any) => item.content_type === 'research_decoded')
          .map((item: any) => {
            const localPaper = papers[item.slug as keyof typeof papers];
            return {
              title: item.title,
              slug: item.slug,
              authors: item.description, // backend maps excerpt/description here
              heroImage: localPaper?.heroImage
            };
          });

        const roadmapsSim = simData
          .filter((item: any) => item.content_type === 'roadmap')
          .map((item: any) => ({
            id: item.id.replace('roadmap-', ''),
            title: item.title,
            slug: item.slug,
            subject: item.subject
          }));

        setRecommendations({ 
          articles: articlesSim.slice(0, 3), 
          papers: papersSim.slice(0, 3),
          roadmaps: roadmapsSim.slice(0, 3)
        });
      } catch (err) {
        console.error("Failed to fetch similar content:", err);
      }
    };
    
    fetchRecommendations();
  }, [article.slug]);

  return (
    <div className="relative min-h-screen text-text-primary serif-page-scope selection:bg-accent/20">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 z-[100] h-[2.5px] bg-accent transition-all duration-100 ease-out"
        style={{ width: `${readProgress}%` }}
      />

      <div className="relative z-10">
        <PublicHeader />

      {/* Site Content */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 relative">
        
        {/* Full-width Header */}
        <header className="mb-12 mt-[100px] md:mt-[80px] text-center flex flex-col items-center px-4 md:px-0">
          {article.status === 'archived' && (
            <div className="mb-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest inconsolata-ui">
              <span>⚠️ Legacy / Archived Article</span>
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-[14px] md:text-[15px] font-medium text-text-muted manrope-body">
            <span>{article.date}</span>
            <span className="text-text-muted/40">•</span>
            <span>{article.subject}</span>
          </div>
          
          <h1 className="text-[36px] md:text-[48px] lg:text-[56px] text-text-heading mb-6 leading-[1.1] tracking-tight font-sans font-bold max-w-4xl">
            {article.title}
          </h1>
          
          <p className="text-[18px] md:text-[22px] text-text-primary mb-12 leading-relaxed font-sans font-medium max-w-[720px]">
            {article.excerpt}
          </p>

          <div className="max-w-[720px] mx-auto w-full">
            {/* Bar 1: Author identity */}
            <div className="flex items-center justify-between w-full py-3 border-t border-border/60">
              <span className="text-[11px] text-text-muted uppercase tracking-widest inconsolata-ui opacity-60">Written by</span>
              <div className="flex items-center manrope-body">
                <a
                  href="https://www.linkedin.com/in/sankalp-chudmunge-a3ba80423/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-text-heading hover:text-[#0A66C2] transition-colors leading-tight"
                >
                  {authorName}
                </a>
              </div>
            </div>

            {/* Bar 2: Article actions */}
            <div className="flex items-center justify-between w-full py-3 border-t border-b border-border/60">
              <div className="flex items-center gap-5 text-text-primary font-medium manrope-body">
                <FloatingTTS content={article.content} inline={true} />
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-[13px]">{likeCount}</span>
                </button>
                <button
                  onClick={scrollToComments}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-text-muted hidden sm:inline-block">{readTime} min read</span>
                <SocialShare title={article.title} className="scale-90 origin-right" />
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image — full bleed (moved above ToC alignment) */}
        <div className="w-full max-w-[720px] mx-auto min-w-0">
          {article.heroImage && (
            <figure className="mb-[48px] -mx-4 md:mx-0">
              <div className="overflow-hidden rounded-none md:rounded-lg aspect-[16/7]">
                <img 
                  src={article.heroImage} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </figure>
          )}
        </div>

        <div className="flex justify-center pb-[80px]">

          {/* Sticky ToC Sidebar (desktop only) */}
          {tocHeadings.length > 0 && (
            <aside className="hidden xl:flex w-[180px] shrink-0 mr-12 self-start sticky top-[120px] max-h-[calc(100vh-140px)] flex-col">
              <div className="relative flex flex-col">
                {tocHeadings.map(h => {
                  const isActive = activeHeading === h.id;
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      title={h.text}
                      className="group relative flex items-center py-[6px] transition-all duration-150"
                    >
                      <span className="relative flex items-center w-full">
                        {/* Dash indicator */}
                        <span className={`shrink-0 block w-[14px] h-[1.5px] rounded-full transition-all duration-150 ${
                          isActive
                            ? 'bg-accent'
                            : 'bg-text-muted/30 group-hover:bg-text-muted/50'
                        }`} />
                        {/* Text — shown on hover */}
                        <span className="absolute left-6 manrope-body text-[8px] text-text-muted leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                          {h.text}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Article Column */}
          <main className="w-full max-w-[720px] min-w-0">
            <article>
              <div className="page-content">

                <div className="max-w-[720px] mx-auto">
                  {article.status === 'archived' && (
                    <div className="mb-10 p-5 bg-amber-500/5 border-l-4 border-l-amber-500 border-y border-r border-border rounded-r-lg">
                      <p className="text-[14px] text-text-primary font-medium leading-relaxed italic opacity-90">
                        <strong className="text-amber-500 not-italic mr-2">Note:</strong> 
                        This article has been classified as legacy. It was written prior to current technical standards and is preserved purely for historical reference. Some information may be deprecated.
                      </p>
                    </div>
                  )}
                  <div className="prose prose-eulerfold max-w-none text-text-primary">
                    <MarkdownWithLinks content={article.content} currentSlug={article.slug} cache={article.d2Cache} />
                  </div>

                  {/* Technical Insight Block */}
                  {article.technicalInsight && (
                    <div className="my-16 pl-6 border-l-[3px] border-accent">
                      <span className="inline-block text-[9px] font-bold text-accent uppercase tracking-[0.25em] inconsolata-ui px-2 py-0.5 border border-accent/30 rounded mb-3">
                        Key Insight
                      </span>
                      <p className="text-[19px] md:text-[21px] text-text-heading font-medium leading-relaxed tracking-tight italic">
                        {article.technicalInsight}
                      </p>
                    </div>
                  )}

                  {/* FAQ Section */}
                  {article.faq && article.faq.length > 0 && (
                    <div className="mt-[80px]">
                      <div className="space-y-3">
                        {article.faq.map((item, idx) => (
                          <details key={idx} className="group border border-border rounded-lg bg-card overflow-hidden transition-all duration-300 hover:border-accent/30">
                            <summary className="p-[20px] font-bold leading-[1.3] cursor-pointer list-none flex justify-between items-center group-open:bg-accent/5 transition-colors tracking-tight text-text-heading">
                              <span className="max-w-[90%]">{item.q}</span>
                              <span className="text-accent text-[22px] font-light transition-transform duration-300 group-open:rotate-45 ml-4 shrink-0">+</span>
                            </summary>
                            <div className="px-[20px] pb-[20px] pt-2 text-text-primary font-normal opacity-90 leading-relaxed">
                              {item.a}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Community Banner */}
                  <div className="mt-[80px] flex flex-col gap-8 w-full">
                    <CommunityRoadmapBanner />
                    <NewsletterBanner />
                  </div>

                  {/* Author Block at Bottom */}
                  {article.status !== 'archived' && (
                    <div className="flex items-center gap-4 mt-[60px] border-t border-border pt-[36px]">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-sidebar shrink-0 shadow-sm">
                        <img 
                          src={authorImage} 
                          alt={authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <div className="text-[14px] font-bold text-text-heading manrope-body leading-tight">
                          Written by {authorName}
                        </div>
                        {authorRole && (
                          <div className="text-[13px] text-text-muted manrope-body leading-tight mt-1">
                            {authorRole}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 mt-2">
                          <a 
                            href="https://www.linkedin.com/in/sankalp-chudmunge-a3ba80423/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-[#0A66C2] transition-colors"
                            aria-label="LinkedIn Profile"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a 
                            href="https://x.com/csankalp21"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-text-primary transition-colors"
                            aria-label="X Profile"
                          >
                            <FaXTwitter className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Share */}
                  <div className="flex items-center gap-3 mt-[36px]">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] inconsolata-ui opacity-60 mr-1">Share</span>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on X"
                      className="w-8 h-8 bg-[#000000] rounded-md flex items-center justify-center hover:opacity-75 transition-opacity"
                    >
                      <FaXTwitter className="w-3.5 h-3.5 text-white" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Facebook"
                      className="w-8 h-8 bg-[#3a579a] rounded-md flex items-center justify-center hover:opacity-75 transition-opacity"
                    >
                      <Facebook className="w-3.5 h-3.5 text-white" />
                    </a>
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on WhatsApp"
                      className="w-8 h-8 bg-[#25D366] rounded-md flex items-center justify-center hover:opacity-75 transition-opacity"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5 text-white" />
                    </a>
                  </div>

                  {/* Discussion Section */}
                  <div id="comments" className="mt-16">
                    <DiscussionSection contextId={article.slug} contextType="article" />
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
                              <Link key={item.slug} href={`/articles/${item.slug}`} className="group flex items-center justify-between py-3 border-b border-border/40 hover:border-accent/40 transition-colors">
                                <div className="flex items-center gap-4">
                                  {item.heroImage && (
                                    <div className="w-16 h-12 md:w-20 md:h-14 rounded-md overflow-hidden shrink-0 border border-border/50">
                                      <img src={item.heroImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                  )}
                                  <span className="text-[16px] md:text-[18px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                                    {item.title}
                                  </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 ml-4" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Research Papers */}
                      {recommendations.papers.length > 0 && (
                        <div className="mt-8">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] inconsolata-ui mb-4 block opacity-60">Research Decoded</span>
                          <div className="flex flex-col gap-4">
                            {recommendations.papers.map((paper) => (
                              <Link key={paper.slug} href={`/research-decoded/${paper.slug}`} className="group flex items-center justify-between py-3 border-b border-border/40 hover:border-accent/40 transition-colors">
                                <div className="flex items-center gap-4">
                                  {paper.heroImage && (
                                    <div className="w-16 h-12 md:w-20 md:h-14 rounded-md overflow-hidden shrink-0 border border-border/50">
                                      <img src={paper.heroImage} alt={paper.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[16px] md:text-[18px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                                      {paper.title}
                                    </span>
                                    <span className="text-[13px] text-text-muted font-medium italic opacity-70 line-clamp-1">{paper.authors}</span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 ml-4" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <RecommendedRoadmaps roadmaps={recommendations.roadmaps || []} className="mt-10" />
                  </div>

                  {/* Breadcrumbs & AI Disclosure */}
                  <div className="mt-16 text-center border-t border-border pt-10">
                    <div className="flex justify-center mb-6">
                      <Breadcrumbs items={[
                        { label: 'Articles', href: '/articles' },
                        { label: article.subject }
                      ]} />
                    </div>
                    <p className="text-[13px] text-text-muted manrope-body italic max-w-lg mx-auto leading-relaxed font-medium opacity-60">
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
              </div>
            </article>
          </main>

          {/* Spacer to balance the ToC and perfectly center the main content on the screen */}
          {tocHeadings.length > 0 && (
            <div className="hidden xl:block w-[180px] shrink-0 ml-12 pointer-events-none" aria-hidden="true" />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
