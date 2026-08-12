'use client';
import { useState, useMemo } from 'react';
import { Eye, Code2, RefreshCw, X, LayoutPanelLeft } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';
import { buildIframeSrc } from '../lib/artifacts';
import type { Artifact } from '../lib/types';

export const TYPE_LABELS = { html: 'HTML', react: 'React', svg: 'SVG' } as const;
export const TYPE_STYLES = {
  html:  'text-orange-500 border-orange-500/30 bg-orange-500/8',
  react: 'text-blue-500  border-blue-500/30  bg-blue-500/8',
  svg:   'text-violet-500 border-violet-500/30 bg-violet-500/8',
} as const;

export function ArtifactCard({
  artifact,
  isActive,
  onClick,
}: {
  artifact: Artifact;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`my-3 p-3.5 rounded-lg border transition-all ${
      isActive ? 'border-accent/60 bg-accent/8 shadow-sm' : 'border-border/80 bg-sidebar/50 hover:bg-sidebar hover:border-accent/30'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <LayoutPanelLeft className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-bold text-text-heading truncate">{artifact.title}</h4>
              <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${TYPE_STYLES[artifact.type]}`}>
                {TYPE_LABELS[artifact.type]}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">Interactive Web Artifact</p>
          </div>
        </div>
        <button
          onClick={onClick}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors shrink-0 ${
            isActive
              ? 'bg-accent text-white shadow-sm'
              : 'bg-background border border-border text-text-heading hover:border-accent/40'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {isActive ? 'Viewing' : 'Open Preview'}
        </button>
      </div>
    </div>
  );
}

export function ArtifactPanel({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeSrc = useMemo(() => buildIframeSrc(artifact), [artifact.id]);

  return (
    <div className="flex flex-col h-full border-l border-border/50 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0 gap-2 bg-[#161b22]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${TYPE_STYLES[artifact.type]}`}>
            {TYPE_LABELS[artifact.type]}
          </span>
          <span className="text-[13px] font-bold text-white tracking-tight truncate">{artifact.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center border border-white/15 rounded-md overflow-hidden mr-1 bg-[#0d1117]">
            <button
              onClick={() => setView('preview')}
              className={`px-3 py-1 text-[10.5px] font-bold flex items-center gap-1 transition-colors ${view === 'preview' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
            <button
              onClick={() => setView('code')}
              className={`px-3 py-1 text-[10.5px] font-bold flex items-center gap-1 transition-colors border-l border-white/15 ${view === 'code' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Code2 className="w-3 h-3" /> Code
            </button>
          </div>
          <button onClick={() => setIframeKey(k => k + 1)} title="Refresh preview" className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <CopyButton text={artifact.code} className="text-white/50 hover:text-white" />
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {view === 'preview' ? (
        <div className="flex-1 w-full bg-[#0d1117] p-2 overflow-hidden flex flex-col">
          <iframe
            key={iframeKey}
            sandbox="allow-scripts"
            srcDoc={iframeSrc}
            className="flex-1 w-full rounded-md bg-[#0d1117] shadow-inner"
            style={{ border: 'none' }}
            title={artifact.title}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-[#0d1117]">
          <SyntaxHighlighter
            style={oneDark}
            language={artifact.type === 'react' ? 'jsx' : artifact.type}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '12.5px', minHeight: '100%', background: '#0d1117' }}
          >
            {artifact.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
