import React from 'react';
import { Metadata } from 'next';
import RoadmapClient from './RoadmapClient';

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
        };
    }

    const title = roadmap.title || roadmap.subject || 'Learning Roadmap';
    const description = roadmap.goal || roadmap.description || 'View this personalized learning roadmap on EulerFold.';
    
    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `https://www.eulerfold.com/roadmap/${params.slug}`,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: title,
            description: description,
        },
        alternates: {
            canonical: `/roadmap/${params.slug}`,
        }
    };
}

export default async function RoadmapDetailPage({ params }: { params: { slug: string } }) {
    // Only fetch by slug. If a numeric ID is passed, the backend by-slug endpoint 
    // will naturally fail or 404, which is correct for clean SEO.
    const initialRoadmap = await getPublicRoadmapMetadata(params.slug);

    return (
        <RoadmapClient 
            slug={params.slug} 
            initialRoadmap={initialRoadmap} 
        />
    );
}
