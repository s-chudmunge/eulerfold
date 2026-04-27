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
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
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

const TermLink = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  return (
    <Link 
      href={`/articles/${slug}`}
      className="text-accent hover:underline decoration-dotted underline-offset-4 font-semibold"
    >
      {children}
    </Link>
  );
};

const MarkdownWithLinks = ({ content, currentSlug, cache }: { content: string, currentSlug: string, cache?: Record<string, string> }) => {
  // Dynamically build terms to link from the articles data, excluding the current article
  const termsToLink = Object.values(articles)
    .filter(article => article.slug.toLowerCase() !== currentSlug.toLowerCase())
    .flatMap(article => {
      const terms = [
        { term: article.title, slug: article.slug },
        { term: article.slug.replace(/-/g, ' '), slug: article.slug },
      ];
      
      // Add synonyms from the article data if they exist
      if (article.synonyms && Array.isArray(article.synonyms)) {
        article.synonyms.forEach(syn => {
          terms.push({ term: syn, slug: article.slug });
        });
      }
      
      return terms;
    }).sort((a, b) => b.term.length - a.term.length);

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
        h2: ({node, ...props}) => <h2 className="text-[28px] md:text-[32px] font-bold leading-[1.2] mt-[60px] mb-[24px] text-text-heading font-inter tracking-tighter" {...props} />,
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

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this article on EulerFold: ${article.title}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  React.useEffect(() => {
    // Recommendation logic moved to useEffect to avoid hydration mismatch
    const allArticles = Object.values(articles);
    const otherArticles = allArticles
      .filter(a => a.slug !== article.slug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    // Map entries to ensure we have the slug (the key) available
    const allPapers = Object.entries(papers).map(([slug, paper]) => ({
      ...paper,
      slug
    }));

    const relatedPapers = allPapers
      .filter(p => {
        const keywords = [article.title, article.category, ...(article.synonyms || [])];
        return keywords.some(k => 
          p.title.toLowerCase().includes(k.toLowerCase()) || 
          p.intro.toLowerCase().includes(k.toLowerCase())
        );
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const finalPapers = relatedPapers.length > 0 
      ? relatedPapers 
      : allPapers.sort(() => 0.5 - Math.random()).slice(0, 2);

    setRecommendations({
      articles: otherArticles,
      papers: finalPapers
    });
  }, [article.slug, article.title, article.category, article.synonyms]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/20">
      <PublicHeader />
      
      {/* Secondary Navigation (BibGuru Style) */}
      <nav className="hidden md:flex items-center justify-center h-[48px] bg-background border-b border-border text-[15px]">
        <ul className="flex items-center gap-6">
          <li><Link href="/research-decoded" className="text-text-muted hover:text-accent transition-colors font-medium">Research Decoded</Link></li>
          <li><Link href="#" className="text-text-muted hover:text-accent transition-colors font-medium">Neural Networks</Link></li>
          <li><Link href="#" className="text-text-muted hover:text-accent transition-colors font-medium">Optimization</Link></li>
          <li><Link href="#" className="text-text-muted hover:text-accent transition-colors font-medium">Theory</Link></li>
        </ul>
      </nav>

      {/* Site Content (BibGuru Layout) */}
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-center gap-[60px] mt-[30px] md:mt-[60px] pb-[80px] px-6">
        
        {/* Content Area (Max 700px) */}
        <main className="w-full max-w-[700px]">
          <article>
            <header className="mb-[40px]">
              <h1 className="text-[34px] font-bold leading-[1.1] text-text-heading mb-[20px] font-inter tracking-tighter">
                {article.title}
              </h1>
              <div className="text-[17px] text-text-muted opacity-70 font-medium inconsolata-ui uppercase tracking-widest">
                By <span className="text-text-heading font-semibold">{article.author}</span> / <span className="date">{article.date}</span>
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

              <div className="prose prose-eulerfold max-w-none text-[18px] md:text-[20px] leading-[1.8] text-text-primary font-inter font-normal">
                <MarkdownWithLinks content={article.content} currentSlug={article.slug} cache={article.d2Cache} />
              </div>

              {/* Box Component (Technical Insight) */}
              {article.technicalInsight && (
                <div className="my-[60px] relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-accent/30 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-callout-bg p-[30px] md:p-[45px] rounded-2xl border border-callout-border leading-relaxed">
                    <p className="text-[20px] md:text-[22px] leading-[1.6] italic text-text-heading font-inter font-medium">
                      "{article.technicalInsight}"
                    </p>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {article.faq && article.faq.length > 0 && (
                <div className="mt-[80px]">
                  <h2 className="text-[28px] md:text-[32px] font-bold leading-[1.2] mb-[32px] text-text-heading font-inter tracking-tighter">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {article.faq.map((item, idx) => (
                      <details key={idx} className="group border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:border-accent/30">
                        <summary className="p-[24px] text-[19px] font-bold leading-[1.3] cursor-pointer list-none flex justify-between items-center group-open:bg-accent/5 transition-colors font-inter tracking-tight text-text-heading">
                          <span className="max-w-[90%]">{item.q}</span>
                          <span className="text-accent text-[24px] font-light transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div className="px-[24px] pb-[24px] pt-2 text-[17px] md:text-[18px] leading-[1.7] text-text-primary font-inter font-normal opacity-90">
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

                  {/* Research Papers */}
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
                </div>
              </div>

              {/* AI Disclosure */}
              <div className="mt-16 text-center border-t border-border pt-10">
                <p className="text-[13px] text-text-muted manrope-body italic max-w-lg mx-auto leading-relaxed font-medium">
                  The author of this article utilized generative AI (Google Gemini 3.1 Pro) to assist in part of the drafting and editing process.
                </p>
              </div>
            </div>
          </article>
        </main>

        {/* Sidebar Area */}
        <aside className="w-full md:w-[325px] lg:w-[400px]">
          <div className="sticky top-[100px] border border-border rounded-2xl p-[30px] bg-card shadow-sm">
            <h2 className="text-[22px] font-bold text-center mb-[15px] text-text-heading inconsolata-ui uppercase tracking-widest">About</h2>
            <div className="w-12 h-1 bg-accent mx-auto mb-[20px] rounded-full" />
            <p className="text-[17px] leading-[1.5] text-text-primary mb-[25px] font-inter font-normal text-center">
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
      </div>

      <Footer />
    </div>
  );
}
