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
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface Props {
  paper: Paper;
  slug: string;
  papers: Record<string, Paper>;
}

import { articles } from '../../articles/generatedArticles';

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

const MarkdownWithLinks = ({ content }: { content: string }) => {
  // Dynamically build terms to link from the articles data
  const termsToLink = Object.values(articles).flatMap(article => {
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
  }).sort((a, b) => b.term.length - a.term.length); // Longest terms first

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
        // We target the paragraph and list items to process their text children
        p: ({ children }) => {
          return <p>{processChildren(children)}</p>;
        },
        li: ({ children }) => {
          return <li>{processChildren(children)}</li>;
        },
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

  return (
    <div className="bg-background min-h-screen pb-24 text-text-primary">
      {/* Design matches strictly the refined example/topic-page */}
      <div className="max-w-[1000px] mx-auto px-6 py-8 md:px-12 md:py-16">
        
        {/* Community Banner */}
        <div className="mb-12 bg-callout-bg rounded-2xl p-6 md:p-10 border border-callout-border relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-[22px] md:text-[24px] font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">Join the EulerFold community</h2>
            <p className="manrope-body text-text-primary mb-8 max-w-lg text-[15px] md:text-[16px] font-medium">Track progress and collaborate on roadmaps with students worldwide.</p>
            <button 
              onClick={user ? () => window.location.href = '/dashboard' : handleSignIn}
              className="inline-block bg-[var(--text-heading)] rounded-xl px-7 py-2.5 text-[15px] font-bold text-[var(--bg-main)] hover:opacity-90 shadow-lg transition-all inconsolata-ui"
            >
              {user ? 'Go to Dashboard' : 'Sign In Free'}
            </button>
          </div>
          <span className="absolute -bottom-6 -right-6 text-[100px] md:text-[140px] opacity-[0.03] grayscale -rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-700">🐢</span>
        </div>

        {/* Paper Header */}
        <header className="mb-12">
          <div className="inconsolata-ui flex items-center gap-2 text-accent mb-6 text-[13px] md:text-[14px] font-bold uppercase tracking-widest flex-wrap">
            <Link href="/research-decoded" className="bg-accent-muted px-2 py-0.5 rounded hover:bg-accent/10 transition-colors">
              Research Decoded
            </Link>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--text-label)] font-medium">{paper.authors}</span>
          </div>

          <SocialShare 
            title={paper.title} 
            text={`Decoding ${paper.title} on EulerFold:`} 
            className="mb-8" 
          />
          
          <h1 className="inconsolata-ui text-[28px] md:text-[38px] font-bold text-text-heading mb-10 leading-[1.15] tracking-tight group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-3xl transition-opacity hidden md:inline">#</span>
            {paper.title}
          </h1>

          <div className="manrope-body p-5 md:p-6 bg-callout-bg border-l-2 border-[var(--accent)] rounded-r-xl mb-12">
            <p className="text-[14px] md:text-[15px] text-text-primary italic m-0 leading-relaxed font-medium">
              {paper.citation}
            </p>
            <Link 
              href={paper.link} 
              target="_blank" 
              className="inconsolata-ui text-accent text-[12px] font-bold hover:underline mt-3 inline-flex items-center gap-1"
            >
              Read Original Paper <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Image */}
        {paper.heroImage && (
          <div className="mb-12 p-4 md:p-6 bg-image-bg border border-border rounded-2xl shadow-xl max-w-[700px] mx-auto">
            <motion.img 
              layoutId={`img-${paper.heroImage}`}
              src={paper.heroImage} 
              alt={`${paper.title} - Research Breakthrough Illustration`} 
              className="w-full rounded-xl transition-all cursor-zoom-in" 
              onClick={() => setSelectedImage(paper.heroImage)}
            />
          </div>
        )}

        {/* Paper Intro */}
        <div className="manrope-body mb-8 !text-[17px] md:!text-[20px] text-text-primary !leading-[1.75] prose-eulerfold max-w-none prose-p:!text-[17px] md:prose-p:!text-[20px] prose-p:!leading-[1.75]">
          <MarkdownWithLinks content={paper.intro} />
        </div>

        {/* Sections */}
        {paper.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-16 md:mt-24">
            <h2 className="inconsolata-ui text-[22px] md:text-[28px] font-bold text-text-heading mb-6 group flex items-center md:-ml-12">
              <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
              {section.title}
            </h2>

            {section.diagram && (
              <div className="my-12 p-4 md:p-6 bg-image-bg border border-border rounded-2xl max-w-[700px] mx-auto shadow-sm">
                <motion.img 
                  layoutId={`img-${section.diagram.url}`}
                  src={section.diagram.url} 
                  alt={`${section.title} Diagram - ${section.diagram.caption}`} 
                  className="mx-auto rounded-xl max-h-[300px] md:max-h-[400px] cursor-zoom-in" 
                  onClick={() => setSelectedImage(section.diagram.url)}
                />
                <p className="manrope-body !text-[14px] md:!text-[15px] text-text-muted mt-5 text-center italic font-medium">
                  {section.diagram.caption}
                </p>
              </div>
            )}

            <div className="manrope-body !text-[17px] md:!text-[20px] text-text-primary !leading-[1.75] prose-eulerfold max-w-none prose-p:!text-[17px] md:prose-p:!text-[20px] prose-p:!leading-[1.75]">
              <MarkdownWithLinks content={section.content} />
            </div>
          </section>
        ))}

        {/* Resources Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <h2 className="inconsolata-ui text-[22px] md:text-[28px] font-bold text-text-heading mb-10 group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
            Dive Deeper
          </h2>
          <ul className="manrope-body space-y-8 list-none p-0 mb-12">
            {paper.resources.map((res, idx) => (
              <li key={idx} className="border-b border-border pb-10 last:border-0 group">
                <p className="font-bold text-text-heading m-0 text-[17px] md:text-[19px] mb-2 group-hover:text-accent transition-colors">{res.title}</p>
                <p className="text-text-muted m-0 text-[13px] md:text-[14px] font-medium">{res.provider} • {res.type}</p>
                <Link href={res.url} target="_blank" className="inconsolata-ui text-accent text-[14px] hover:underline mt-5 inline-flex items-center gap-2 font-bold">
                  Explore Resource <ExternalLink className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Discussion Section */}
        <DiscussionSection contextId={slug} contextType="research-decoded" />

        {/* Navigation */}
        <footer className="inconsolata-ui mt-16 flex flex-col md:flex-row items-stretch md:items-center pb-16 text-[14px] md:text-[15px] font-medium border-t border-border pt-12 gap-8 md:gap-0">
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
          <p className="text-[11px] text-text-muted opacity-50 manrope-body italic max-w-lg mx-auto leading-relaxed">
            The author of this article utilized generative AI (Google Gemini 3.1 Pro) to assist in part of the drafting and editing process.
          </p>
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
                layoutId={`img-${selectedImage}`}
                src={selectedImage}
                alt="Expanded view"
                className={`max-w-full max-h-full shadow-2xl z-[205] relative !opacity-100 bg-white ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                animate={{ 
                  scale: scale,
                  transition: { type: 'spring', damping: 25, stiffness: 200 }
                }}
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
