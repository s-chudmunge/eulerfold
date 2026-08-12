'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

export function MarkdownMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <div className="text-[14px] leading-[1.7] text-text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!match) {
              return (
                <code className="bg-border/50 text-text-heading px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-lg overflow-hidden border border-border/60 text-[13px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a2e] border-b border-white/10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">{match[1]}</span>
                  <CopyButton text={String(children).replace(/\n$/, '')} />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1] || 'text'}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', padding: '14px' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-[1.75]">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-text-primary leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold text-text-heading mb-2 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-text-heading mb-2 mt-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[14px] font-bold text-text-heading mb-1.5 mt-3">{children}</h3>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-accent/40 pl-4 my-3 text-text-muted italic">{children}</blockquote>,
          table: ({ children }) => <div className="overflow-x-auto my-3"><table className="border-collapse text-[13px] w-full">{children}</table></div>,
          th: ({ children }) => <th className="border border-border px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide text-text-muted bg-sidebar">{children}</th>,
          td: ({ children }) => <td className="border border-border px-3 py-1.5 text-text-primary">{children}</td>,
          hr: () => <hr className="border-border/50 my-4" />,
          strong: ({ children }) => <strong className="font-semibold text-text-heading">{children}</strong>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-middle animate-pulse rounded" />
      )}
    </div>
  );
}
