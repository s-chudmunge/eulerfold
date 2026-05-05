"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Save, Sparkles, BookOpen, Quote, List, Type, CheckCircle } from 'lucide-react';

interface ResearchPilotProps {
  initialContent: string;
  onSave: (content: string) => void;
  lastSaved: string | null;
}

const ResearchPilot: React.FC<ResearchPilotProps> = ({ initialContent, onSave, lastSaved }) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background animate-in fade-in duration-500 overflow-hidden">
      {/* Research Toolbar */}
      <div className="h-9 border-b border-border flex items-center justify-between px-6 bg-sidebar/20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-teal-700 opacity-60" />
            <span className="inconsolata-ui text-[11px] font-bold text-text-heading tracking-tight">Editor</span>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-4">
             <button className="p-1 hover:bg-background rounded-none text-text-muted hover:text-text-heading transition-colors" title="Formatting">
                <Type className="w-3.5 h-3.5" />
             </button>
             <button className="p-1 hover:bg-background rounded-none text-text-muted hover:text-text-heading transition-colors" title="List">
                <List className="w-3.5 h-3.5" />
             </button>
             <button className="p-1 hover:bg-background rounded-none text-text-muted hover:text-text-heading transition-colors" title="Blockquote">
                <Quote className="w-3.5 h-3.5" />
             </button>
             <button className="p-1 hover:bg-background rounded-none text-text-muted hover:text-text-heading transition-colors" title="Reference">
                <BookOpen className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {lastSaved && (
             <div className="flex items-center gap-2 text-text-muted animate-in fade-in slide-in-from-right-2">
                <CheckCircle className="w-3 h-3 text-teal-600" />
                <span className="inconsolata-ui text-[9px] font-bold uppercase tracking-widest opacity-60">Synced {lastSaved}</span>
             </div>
           )}
           <button 
             onClick={() => onSave(content)}
             className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-none text-[10px] font-bold text-text-heading hover:border-teal-700/50 transition-all shadow-sm uppercase tracking-widest"
           >
              <Save className="w-3 h-3" />
              Save Draft
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Editor Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative group">
           <textarea 
             value={content}
             onChange={(e) => {
               setContent(e.target.value);
               onSave(e.target.value);
             }}
             placeholder="Begin your technical research or mathematical derivation here..."
             className="w-full h-full p-12 lg:p-20 bg-transparent resize-none focus:outline-none manrope-body text-[16px] md:text-[18px] leading-relaxed text-text-primary placeholder:text-text-muted/30 placeholder:italic"
           />
        </main>

        {/* Real-time Preview Sidebar (Optional toggle later) */}
        <aside className="w-[400px] border-l border-border bg-sidebar/10 hidden xl:block p-8 overflow-y-auto no-scrollbar">
           <div className="flex items-center gap-2 mb-6 text-text-muted">
              <h2 className="inconsolata-ui text-[11px] font-bold tracking-tight">Preview</h2>
           </div>
           
           <div className="prose prose-sm dark:prose-invert manrope-body max-w-none">
              {content ? (
                 <div className="text-[14px] text-text-primary leading-relaxed opacity-80 whitespace-pre-wrap font-medium">
                    {content}
                 </div>
              ) : (
                 <p className="text-[12px] text-text-muted italic opacity-40">Your structured output will appear here as you write...</p>
              )}
           </div>
        </aside>
      </div>
    </div>
  );
};

export default ResearchPilot;
