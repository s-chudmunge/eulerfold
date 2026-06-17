import React from 'react';
import { Metadata } from 'next';
import LearnClient from './LearnClient';
import { supabase } from '@/lib/supabase/client';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getPublicRoadmapMetadata(slug: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const endpoint = `${API_URL}/roadmaps/by-slug/${slug}`;

    try {
        const res = await fetch(endpoint, { next: { revalidate: 3600 } });
        
        if (res.status === 403) {
            return { isPrivate: true, slug: slug };
        }
        
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string, subtopic?: string[] } }): Promise<Metadata> {
    const roadmap = await getPublicRoadmapMetadata(params.slug);
    
    if (!roadmap) {
        return {
            title: 'Roadmap Not Found',
        };
    }

    if ((roadmap as any).isPrivate) {
        return {
            title: 'Learning Roadmap | EulerFold',
            description: 'This is a private learning roadmap.',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    return {
        title: `Learning: ${roadmap.subject}`,
        description: `Master ${roadmap.subject} with this interactive, AI-curated learning journey. Track your progress, study core concepts, and verify your technical skills on EulerFold.`,
        openGraph: {
            title: `${roadmap.subject} - Interactive Learning Journey`,
            description: `Master ${roadmap.subject} with this interactive, AI-curated learning journey.`,
            url: `https://www.eulerfold.com/roadmap/${roadmap.slug}/learn`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Learning ${roadmap.subject} on EulerFold`,
            description: `Follow this Path We Trust to master ${roadmap.subject}.`,
        },
        alternates: {
            canonical: `https://www.eulerfold.com/roadmap/${roadmap.slug}/learn`
        }
    };
}

export default async function LearnPage({ params }: { params: { slug: string, subtopic?: string[] } }) {
    const roadmap = await getPublicRoadmapMetadata(params.slug);

    if (!roadmap) {
        notFound();
    }

    // Canonical URL redirection: If accessed by ID but has a slug, redirect to slug
    const isId = /^\d+$/.test(params.slug);
    if (roadmap && isId && roadmap.slug && roadmap.slug !== params.slug) {
        const subtopicPath = params.subtopic ? `/${params.subtopic.join('/')}` : '';
        redirect(`/roadmap/${roadmap.slug}/learn${subtopicPath}`);
    }

    // Handle private roadmap case where server-side fetch failed with 403
    if ((roadmap as any).isPrivate) {
        return <LearnClient id={params.slug} slug={params.subtopic} initialRoadmap={null} />;
    }

    return <LearnClient id={params.slug} slug={params.subtopic} initialRoadmap={roadmap} />;
}
