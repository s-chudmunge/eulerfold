import React from 'react';
import { Metadata } from 'next';
import LearnClient from './LearnClient';
import { supabase } from '@/lib/supabase/client';
import { redirect, notFound } from 'next/navigation';

export const revalidate = 3600;

async function getRoadmapBySlugOrId(identifier: string) {
    try {
        const isId = /^\d+$/.test(identifier);
        const { data, error } = await supabase
            .from('roadmaps')
            .select('*')
            .eq(isId ? 'id' : 'slug', identifier)
            .single();
        
        if (error) return null;
        return data;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string, subtopic?: string[] } }): Promise<Metadata> {
    const roadmap = await getRoadmapBySlugOrId(params.slug);
    
    if (!roadmap) {
        return {
            title: 'Roadmap Not Found',
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
    const roadmap = await getRoadmapBySlugOrId(params.slug);

    if (!roadmap) {
        notFound();
    }

    // Canonical URL redirection: If accessed by ID but has a slug, redirect to slug
    const isId = /^\d+$/.test(params.slug);
    if (roadmap && isId && roadmap.slug && roadmap.slug !== params.slug) {
        const subtopicPath = params.subtopic ? `/${params.subtopic.join('/')}` : '';
        redirect(`/roadmap/${roadmap.slug}/learn${subtopicPath}`);
    }

    return <LearnClient id={roadmap?.id?.toString() || params.slug} slug={params.subtopic} initialRoadmap={roadmap} />;
}
