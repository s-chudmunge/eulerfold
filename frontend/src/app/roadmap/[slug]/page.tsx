import React from 'react';
import { Metadata } from 'next';
import RoadmapClient from './RoadmapClient';
import PublicRoadmapView from './PublicRoadmapView';

async function getPublicRoadmapMetadata(slug: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const endpoint = `${API_URL}/roadmaps/by-slug/${slug}`;

    try {
        // Strictly slug-based fetch for SEO and link consistency
        const res = await fetch(endpoint, { next: { revalidate: 60 } });
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

    const title = roadmap.title || roadmap.subject || 'Learning Roadmap';
    const rawDescription = (roadmap.goal || roadmap.description || '').trim();
    const subject = roadmap.subject || 'Technical Skills';
    const author = roadmap.author || 'EulerFold User';
    
    // Base part of the description
    const baseDescription = `Learn ${subject} with this structured roadmap by ${author}: ${title}.`;
    const fullDescription = `${baseDescription} ${rawDescription}`.trim();

    // Strategy: Use full description if it fits; otherwise, use base or a truncated base.
    // This prevents mid-sentence truncation of the goal.
    let description = '';
    if (fullDescription.length <= 160) {
        description = fullDescription;
    } else if (baseDescription.length <= 160) {
        description = baseDescription;
    } else {
        // Fallback: truncate base description at word boundary
        description = baseDescription.substring(0, 157).split(' ').slice(0, -1).join(' ') + '...';
    }
    
    // Add a call to action if the result is very short
    if (description.length < 100 && !description.includes('EulerFold')) {
        const cta = " Follow curated resources and track your progress on EulerFold.";
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

    if (initialRoadmap?.is_public) {
        return (
            <PublicRoadmapView 
                slug={params.slug} 
                roadmap={initialRoadmap} 
            />
        );
    }

    return (
        <RoadmapClient 
            slug={params.slug} 
            initialRoadmap={initialRoadmap} 
        />
    );
}
