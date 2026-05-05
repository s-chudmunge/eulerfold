import React from 'react';
import { Metadata } from 'next';
import ProjectPageClient from './ProjectPageClient';

async function getProjectMetadata(slug: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const endpoint = `${API_URL}/roadmaps/by-slug/${slug}`;

    try {
        const res = await fetch(endpoint, { next: { revalidate: 0 } }); // No cache for these checks
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const project = await getProjectMetadata(params.slug);
    
    // Default metadata for private or missing projects
    if (!project) {
        return {
            title: 'Project | EulerFold',
            description: 'Technical build and verification record on EulerFold.',
            robots: { index: false, follow: false }
        };
    }

    const title = project.title || 'Technical Project';
    const description = `Technical build and verification record for ${title} on EulerFold.`;
    
    return {
        title: `${title} | Project`,
        description: description,
        openGraph: {
            title: title,
            description: description,
            type: 'article',
            url: `https://www.eulerfold.com/project/${params.slug}`,
            siteName: 'EulerFold',
        },
        alternates: {
            canonical: `https://www.eulerfold.com/project/${params.slug}`,
        }
    };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
    // We try to get it on the server for SEO/Public view
    const initialProject = await getProjectMetadata(params.slug);

    // If it's private (403), the server gets null. 
    // We pass the slug to the client which will try to fetch with Auth.
    return (
        <ProjectPageClient 
            slug={params.slug} 
            initialProject={initialProject} 
        />
    );
}
