import React, { Suspense } from 'react';
import { Metadata } from 'next';
import GenerateClient from './GenerateClient';
import { ExploreRoadmap } from '@/lib/api';

export const revalidate = 3600;

async function getFeaturedRoadmaps(): Promise<ExploreRoadmap[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  try {
    const res = await fetch(`${API_URL}/explore?limit=10&sort_by=most_cloned`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const allRoadmaps: ExploreRoadmap[] = await res.json();
    return allRoadmaps.slice(0, 4);
  } catch (error) {
    console.error("Error fetching featured roadmaps:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'AI Architect | EulerFold AI',
  description: 'Build custom, technical learning roadmaps curated in real-time. Enter any topic, from broad subjects to niche frameworks, and get a personalized, step-by-step curriculum.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/generate',
    title: 'AI Architect | EulerFold AI',
    description: 'Build custom, technical learning roadmaps curated in real-time. Enter any topic, from broad subjects to niche frameworks, and get a personalized, step-by-step curriculum.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - AI Architect',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Architect | EulerFold AI',
    description: 'Generate real-time custom learning roadmaps for any technical subject.',
    creator: '@eulerfold',
  },
};

export default async function GeneratePage() {
  const featuredRoadmaps = await getFeaturedRoadmaps();
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-teal-700 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <GenerateClient featuredRoadmaps={featuredRoadmaps} />
    </Suspense>
  );
}
