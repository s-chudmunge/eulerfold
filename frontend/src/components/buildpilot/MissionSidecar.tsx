"use client";

import React, { useState } from 'react';
import { 
  Info, 
  CheckCircle, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  ListChecks, 
  Target, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface MissionSidecarProps {
  module: any;
  onSubmit: () => void;
  submitting: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-border/40 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 hover:bg-sidebar/20 transition-all px-4 group"
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-teal-700' : 'text-text-muted opacity-40'}`} />
        <span className={`inconsolata-ui text-[11px] font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-text-heading' : 'text-text-muted'}`}>
          {title}
        </span>
      </div>
      {isOpen ? (
        <ChevronUp className="w-3.5 h-3.5 text-text-muted opacity-20 group-hover:opacity-100" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-text-muted opacity-20 group-hover:opacity-100" />
      )}
    </button>
    {isOpen && (
      <div className="p-6 pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
        {children}
      </div>
    )}
  </div>
);

const MissionSidecar: React.FC<MissionSidecarProps> = ({ module, onSubmit, submitting }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Section collapse states
  const [sections, setSections] = useState({
    objective: false,
    goal: false,
    checklist: false,
    resources: false
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={`border-r border-border transition-all duration-500 ease-in-out bg-sidebar/30 flex flex-col shrink-0 ${isSidebarOpen ? 'w-[280px]' : 'w-14'}`}>
      <div className="h-10 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/50">
         {isSidebarOpen && (
            <div className="flex items-center gap-2 text-text-muted">
               <Layers className="w-3.5 h-3.5 opacity-40" />
               <span className="inconsolata-ui text-[10px] font-bold tracking-tight">Module Details</span>
            </div>
         )}
         <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="p-1.5 hover:bg-sidebar rounded-none text-text-muted transition-colors mx-auto"
         >
            {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
         </button>
      </div>

      {isSidebarOpen ? (
         <>
           <div className="flex-1 overflow-y-auto no-scrollbar bg-background/5 transition-all">
              <CollapsibleSection 
                title="Objective" 
                icon={Target} 
                isOpen={sections.objective}
                onToggle={() => toggleSection('objective')}
              >
                 <p className="inconsolata-ui text-[12px] text-text-primary leading-relaxed font-medium italic opacity-80">
                    &ldquo;{module.outcome}&rdquo;
                 </p>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Goal" 
                icon={ArrowRight} 
                isOpen={sections.goal}
                onToggle={() => toggleSection('goal')}
              >
                 <div className="p-3 bg-sidebar/40 border border-border rounded-none border-l-2 border-l-teal-700">
                    <p className="inconsolata-ui text-[12px] text-text-heading font-bold leading-tight tracking-tight">
                       {module.proof_of_work_instructions?.what_to_build}
                    </p>
                 </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Checklist" 
                icon={ListChecks} 
                isOpen={sections.checklist}
                onToggle={() => toggleSection('checklist')}
              >
                 <div className="space-y-1.5">
                    {module.proof_of_work_instructions?.eval_criteria?.map((c: string, i: number) => (
                       <div key={i} className="flex items-start gap-2.5 p-2 bg-sidebar/20 border border-border rounded-none group hover:border-teal-700/40 transition-colors">
                          <div className="w-4 h-4 rounded-none bg-teal-700/5 border border-teal-700/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-700 group-hover:text-white transition-all">
                             <CheckCircle className="w-2.5 h-2.5" />
                          </div>
                          <p className="inconsolata-ui text-[12px] text-text-muted leading-tight font-medium">
                             {c}
                          </p>
                       </div>
                    ))}
                 </div>
              </CollapsibleSection>

              {module.resources && module.resources.length > 0 && (
                 <CollapsibleSection 
                   title="Resources" 
                   icon={ExternalLink} 
                   isOpen={sections.resources}
                   onToggle={() => toggleSection('resources')}
                 >
                    <div className="space-y-1.5">
                       {module.resources.map((r: any, i: number) => (
                          <a 
                             key={i} 
                             href={r.url} 
                             target="_blank" 
                             className="flex items-center justify-between p-2.5 bg-sidebar/20 border border-border rounded-none hover:border-teal-700/40 transition-colors group"
                          >
                             <span className="inconsolata-ui text-[12px] text-text-primary font-medium truncate pr-4">{r.title}</span>
                             <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-teal-700" />
                          </a>
                       ))}
                    </div>
                 </CollapsibleSection>
              )}

           </div>

           {/* Sidebar Action Footer */}
           <div className="p-4 border-t border-border bg-background/50 flex flex-col items-center">
              <div className="flex flex-col items-center mb-3">
                 {!user?.is_pro && (
                   <div className="mb-2 px-2 py-0.5 bg-teal-700/5 border border-teal-700/20 rounded-none">
                     <p className="inconsolata-ui text-[8px] font-bold text-teal-700 uppercase tracking-widest">
                       {user?.senate_eval_count || 0}/2 Free Audits
                     </p>
                   </div>
                 )}
                 {user?.is_pro && (
                   <div className="mb-2 px-2 py-0.5 bg-accent/5 border border-accent/20 rounded-none">
                     <p className="inconsolata-ui text-[8px] font-bold text-accent uppercase tracking-widest">
                       Pro Audit (0.1 Credits)
                     </p>
                   </div>
                 )}
              </div>
              <button 
                onClick={onSubmit}
                disabled={submitting}
                className="w-9 h-9 flex items-center justify-center bg-teal-800 text-white rounded-none hover:bg-teal-900 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-teal-900/10 border border-teal-700/20"
                title="Submit for Audit"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </button>
              <p className="text-[9px] text-center text-text-muted uppercase tracking-tighter mt-2 font-bold opacity-40">
                Audit
              </p>
           </div>
         </>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-6 gap-6 text-text-muted">
          <div className="flex flex-col items-center gap-4 opacity-20">
            <Target className="w-5 h-5" />
            <ArrowRight className="w-5 h-5" />
            <ListChecks className="w-5 h-5" />
            <ExternalLink className="w-5 h-5" />
          </div>
          
          <div className="mt-auto mb-6 flex flex-col items-center gap-4">
            <button 
              onClick={onSubmit}
              disabled={submitting}
              className="w-9 h-9 flex items-center justify-center bg-teal-800 text-white hover:bg-teal-900 transition-all disabled:opacity-50 active:scale-95 border border-teal-700/20"
              title="Submit for Audit"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default MissionSidecar;
