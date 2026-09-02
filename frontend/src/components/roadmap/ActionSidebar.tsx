import React from 'react';
import { User, Calendar, Scale } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';

interface ActionSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
    roadmap: any;
    isAuthenticated: boolean;
    isOwner: boolean;
    submissionsLength: number;
    showLogs: boolean;
    setShowLogs: (v: boolean) => void;
}

export default function ActionSidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    roadmap,
    isAuthenticated,
    isOwner,
    submissionsLength,
    showLogs,
    setShowLogs
}: ActionSidebarProps) {
    return (
        <AppSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        >
            <div className="space-y-4 px-3">
                <div className="space-y-1">
                    <p className="inconsolata-ui text-[0.7rem] font-bold text-text-muted tracking-wide">Duration</p>
                    <p className="inconsolata-ui text-[0.875rem] font-bold text-text-heading">{roadmap.roadmap_plan?.modules?.length || roadmap.time_value} {roadmap.roadmap_plan?.modules?.length ? (roadmap.roadmap_plan.modules.length === 1 ? 'week' : 'weeks') : roadmap.time_unit}</p>
                </div>

                {(roadmap.author || roadmap.username) && (
                    <div className="space-y-1 pt-2">
                        <p className="inconsolata-ui text-[0.7rem] font-bold text-text-muted tracking-wide">Owner</p>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-accent" />
                            <p className="inconsolata-ui text-[0.875rem] font-bold text-text-heading">{roadmap.author || roadmap.username}</p>
                        </div>
                    </div>
                )}
                {roadmap.created_at && (
                    <div className="space-y-1 pt-2">
                        <p className="inconsolata-ui text-[0.7rem] font-bold text-text-muted tracking-wide">Created</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            <p className="inconsolata-ui text-[0.875rem] font-bold text-text-heading">
                                {new Date(roadmap.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                )}

                {isAuthenticated && (isOwner || roadmap.is_cloned) && submissionsLength > 0 && (
                    <div className="pt-4 mt-4 border-t border-border">
                        <button 
                            onClick={() => setShowLogs(!showLogs)}
                            className={`w-full py-2.5 px-3 rounded-lg border transition-all flex items-center justify-between group ${
                                showLogs 
                                ? 'bg-accent text-white border-[var(--accent)]' 
                                : 'bg-callout-bg text-text-muted border-border hover:bg-[var(--border)]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Scale className="w-3.5 h-3.5" />
                                <span className="inconsolata-ui text-[10px] font-bold tracking-wide">Submit Homework</span>
                            </div>
                            <span className={`inconsolata-ui text-[10px] font-bold px-1.5 py-0.5 rounded ${showLogs ? 'bg-background/20' : 'bg-[var(--border)]'}`}>
                                {submissionsLength}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </AppSidebar>
    );
}
