"use client";

import React, { useEffect, useState } from 'react';
import PublicProjectView from './PublicProjectView';
import ProjectClient from './ProjectClient';
import { supabase } from '@/lib/supabase/client';
import { roadmapsAPI } from '@/lib/api';

interface ProjectPageClientProps {
    slug: string;
    initialProject: any;
}

export default function ProjectPageClient({ slug, initialProject }: ProjectPageClientProps) {
    const [project, setProject] = useState<any>(initialProject);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(!initialProject);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProject() {
            // Get session first
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            // If we don't have the project (because it was private on the server), fetch it now with auth
            if (!initialProject) {
                try {
                    const data = await roadmapsAPI.getRoadmapBySlug(slug);
                    setProject(data);
                } catch (err: any) {
                    console.error("Failed to fetch project on client:", err);
                    setError(err.response?.status === 403 
                        ? "Access Denied. You do not have permission to view this project." 
                        : "Project not found.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        loadProject();
    }, [slug, initialProject]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
                    <p className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-widest">Verifying Protocol...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
                <div className="max-w-md">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <AlertCircleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-text-heading mb-4 tracking-tight">Project Access Restricted</h2>
                    <p className="text-text-muted mb-8 text-[15px] font-medium leading-relaxed">
                        {error || "This project is private or does not exist."}
                    </p>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-6 py-3 bg-teal-700 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-teal-800 transition-all rounded-lg"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // If not logged in and project is public, show public view
    if (!session && project.is_public) {
        return (
            <PublicProjectView 
                slug={slug} 
                project={project}
            />
        );
    }

    // Otherwise show the logged-in/owner view
    return (
        <ProjectClient 
            slug={slug} 
            initialProject={project} 
        />
    );
}

function AlertCircleIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    )
}
