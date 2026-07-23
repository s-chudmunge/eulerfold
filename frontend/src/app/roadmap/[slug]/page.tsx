import React from 'react';
import { Metadata } from 'next';
import RoadmapClient from './RoadmapClient';
import PublicRoadmapView from './PublicRoadmapView';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import PagePreloader from '@/components/PagePreloader';

export async function generateStaticParams() {
    try {
        const { data: roadmaps } = await supabase
            .from('roadmaps')
            .select('slug')
            .eq('is_public', true)
            .limit(100);

        if (!roadmaps) return [];
        return roadmaps.map((r) => ({
            slug: r.slug,
        }));
    } catch (e) {
        return [];
    }
}

async function getPublicRoadmapMetadata(slug: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const endpoint = `${API_URL}/roadmaps/by-slug/${slug}`;

    try {
        // Strictly slug-based fetch for SEO and link consistency
        const res = await fetch(endpoint, { next: { revalidate: 3600 } });
        
        if (res.status === 403) {
            return { isPrivate: true };
        }
        
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const roadmap = await getPublicRoadmapMetadata(params.slug);
    
    if (!roadmap) {
        return {
            title: 'Learning Roadmap',
            description: 'This roadmap does not exist or has been removed.',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    if ((roadmap as any).isPrivate) {
        return {
            title: 'Learning Roadmap | EulerFold',
            description: 'This is a private learning roadmap. Login to EulerFold to view your personal progress and resources.',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    const title = roadmap.title || roadmap.subject || 'Learning Roadmap';
    const subject = roadmap.subject || 'Technical Skills';
    const author = roadmap.author || 'EulerFold User';
    
    let description = '';
    
    if (roadmap.roadmap_plan?.about) {
        // Use the rich AI-generated about text for the ultimate preview
        // Grab the first 1-2 sentences to fit within ~160 chars for SEO/OG
        const cleanAbout = roadmap.roadmap_plan.about.replace(/\n/g, ' ').trim();
        if (cleanAbout.length <= 160) {
            description = cleanAbout;
        } else {
            // Find the last space before 157 chars to avoid cutting off mid-word
            const truncated = cleanAbout.substring(0, 157);
            const lastSpace = truncated.lastIndexOf(' ');
            description = truncated.substring(0, lastSpace > 0 ? lastSpace : 157) + '...';
        }
    } else {
        const rawDescription = (roadmap.goal || roadmap.description || '').trim();
        const baseDescription = `Learn ${subject} with this structured roadmap by ${author}: ${title}.`;
        const fullDescription = `${baseDescription} ${rawDescription}`.trim();

        if (fullDescription.length <= 160) {
            description = fullDescription;
        } else if (baseDescription.length <= 160) {
            description = baseDescription;
        } else {
            description = baseDescription.substring(0, 157).split(' ').slice(0, -1).join(' ') + '...';
        }
    }
    
    // Add a call to action if the result is very short
    if (description.length < 100 && !description.includes('EulerFold')) {
        const cta = " Start learning on EulerFold today.";
        if (description.length + cta.length <= 160) {
            description += cta;
        }
    }

    const keywords = [
        subject,
        title,
        'learning roadmap',
        'skill tracking',
        'technical skills',
        'career path',
        'EulerFold',
        author
    ].join(', ');
    
    return {
        title: title,
        description: description,
        keywords: keywords,
        openGraph: {
            title: title,
            description: description,
            type: 'article',
            url: `https://www.eulerfold.com/roadmap/${params.slug}`,
            siteName: 'EulerFold',
            authors: [author],
            publishedTime: roadmap.created_at,
        },
        twitter: {
            card: 'summary',
            title: title,
            description: description,
            creator: '@eulerfold',
        },
        alternates: {
            canonical: `https://www.eulerfold.com/roadmap/${params.slug}`,
        }
    };
}

export default async function RoadmapDetailPage({ params }: { params: { slug: string } }) {
    // Only fetch by slug. If a numeric ID is passed, the backend by-slug endpoint 
    // will naturally fail or 404, which is correct for clean SEO.
    const initialRoadmap = await getPublicRoadmapMetadata(params.slug);

    if (!initialRoadmap) {
        notFound();
    }

    // Handle private roadmap case where server-side fetch failed with 403
    if ((initialRoadmap as any).isPrivate) {
        return (
            <>
                <PagePreloader />
                <RoadmapClient 
                    slug={params.slug} 
                    initialRoadmap={null} 
                />
            </>
        );
    }

    if (initialRoadmap?.is_public) {
        return (
            <>
                <PagePreloader />
                <PublicRoadmapView 
                    slug={params.slug} 
                    roadmap={initialRoadmap} 
                />
            </>
        );
    }

    return (
        <>
            <PagePreloader />
            <RoadmapClient 
                slug={params.slug} 
                initialRoadmap={initialRoadmap} 
            />
        </>
    );
}
