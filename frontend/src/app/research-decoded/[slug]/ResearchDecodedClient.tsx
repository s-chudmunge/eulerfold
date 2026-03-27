"use client";

import React from 'react';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

export default function ResearchDecodedClient({ paper, slug, papers }: Props) {
  const [user, setUser] = React.useState<any>(null);
  const router = useRouter();

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <div className="bg-background min-h-screen pb-24 text-text-primary">
      {/* Design matches strictly the refined example/topic-page */}
      <div className="max-w-[800px] mr-auto px-6 py-8 md:px-12 md:py-12 md:ml-12 lg:ml-20">
        
        {/* Community Banner */}
        <div className="mb-10 bg-callout-bg rounded-2xl p-6 md:p-8 border border-callout-border relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-[20px] md:text-[22px] font-bold mb-2 text-text-heading tracking-tight inconsolata-ui">Join the EulerFold community</h2>
            <p className="manrope-body text-text-primary mb-6 max-w-lg text-[13px] md:text-[14px] font-medium">Track progress and collaborate on roadmaps with students worldwide.</p>
            <button 
              onClick={user ? () => window.location.href = '/dashboard' : handleSignIn}
              className="inline-block bg-[var(--text-heading)] rounded-xl px-6 py-2 text-[14px] font-bold text-[var(--bg-main)] hover:opacity-90 shadow-lg transition-all inconsolata-ui"
            >
              {user ? 'Go to Dashboard' : 'Sign In Free'}
            </button>
          </div>
          <span className="absolute -bottom-6 -right-6 text-[100px] md:text-[140px] opacity-[0.03] grayscale -rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-700">🐢</span>
        </div>

        {/* Paper Header */}
        <header className="mb-10">
          <div className="inconsolata-ui flex items-center gap-2 text-accent mb-4 text-[12px] md:text-[13px] font-bold uppercase tracking-widest flex-wrap">
            <Link href="/research-decoded" className="bg-accent-muted px-2 py-0.5 rounded hover:bg-accent/10 transition-colors">
              Research Decoded
            </Link>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--text-label)] font-medium">{paper.authors}</span>
          </div>
          
          <h1 className="inconsolata-ui text-[28px] md:text-[36px] font-bold text-text-heading mb-8 leading-[1.1] tracking-tight group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-3xl transition-opacity hidden md:inline">#</span>
            {paper.title}
          </h1>

          <div className="manrope-body p-4 bg-callout-bg border-l-2 border-[var(--accent)] rounded-r-xl mb-8">
            <p className="text-[13px] text-text-primary italic m-0 leading-relaxed font-medium">
              {paper.citation}
            </p>
            <Link 
              href={paper.link} 
              target="_blank" 
              className="inconsolata-ui text-accent text-[12px] font-bold hover:underline mt-2 inline-flex items-center gap-1"
            >
              Read Original Paper <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Hero Image */}
        {paper.heroImage && (
          <div className="mb-8 p-4 md:p-6 bg-image-bg border border-border rounded-2xl shadow-xl">
            <img 
              src={paper.heroImage} 
              alt={`${paper.title} - Research Breakthrough Illustration`} 
              className="w-full rounded-xl transition-all dark:opacity-90" 
            />
          </div>
        )}

        {/* Paper Intro */}
        <div className="manrope-body mb-3 text-[16px] text-text-primary leading-[1.7] prose-eulerfold max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{paper.intro}</ReactMarkdown>
        </div>

        {/* Sections */}
        {paper.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-12">
            <h2 className="inconsolata-ui text-[22px] md:text-[26px] font-semibold text-text-heading mb-4 group flex items-center md:-ml-12">
              <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
              {section.title}
            </h2>

            {section.diagram && (
              <div className="my-10 p-4 md:p-6 bg-image-bg border border-border rounded-2xl">
                <img 
                  src={section.diagram.url} 
                  alt={`${section.title} Diagram - ${section.diagram.caption}`} 
                  className="mx-auto rounded-xl max-h-[300px] md:max-h-[400px] dark:opacity-90" 
                />
                <p className="manrope-body text-[12px] text-text-muted mt-4 text-center italic">
                  {section.diagram.caption}
                </p>
              </div>
            )}

            <div className="manrope-body mb-3 text-[15px] md:text-[16px] text-text-primary leading-[1.7] prose-eulerfold max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{section.content}</ReactMarkdown>
            </div>
          </section>
        ))}

        {/* Resources Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="inconsolata-ui text-[22px] md:text-[26px] font-semibold text-text-heading mb-8 group flex items-center md:-ml-12">
            <span className="text-accent opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity hidden md:inline">#</span>
            Dive Deeper
          </h2>
          <ul className="manrope-body space-y-6 list-none p-0 mb-10">
            {paper.resources.map((res, idx) => (
              <li key={idx} className="border-b border-border pb-8 last:border-0 group">
                <p className="font-bold text-text-heading m-0 text-[16px] md:text-[18px] mb-1 group-hover:text-accent transition-colors">{res.title}</p>
                <p className="text-text-muted m-0 text-[13px] md:text-[14px] font-medium">{res.provider} • {res.type}</p>
                <Link href={res.url} target="_blank" className="inconsolata-ui text-accent text-[14px] hover:underline mt-4 inline-flex items-center gap-1.5 font-bold">
                  Explore Resource <ExternalLink className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

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
      </div>
    </div>
  );
}
