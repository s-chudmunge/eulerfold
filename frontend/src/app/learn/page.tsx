import React from 'react';
import { Metadata } from 'next';
import LearnClient from './LearnClient';

export const metadata: Metadata = {
  title: 'Learning Hub',
  description: 'Explore foundational research paper breakthroughs, global competitive exam archives, and community-built learning roadmaps.',
  alternates: {
    canonical: '/learn',
  },
};

async function getInitialData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  try {
    const roadmapsRes = await fetch(`${API_URL}/explore?limit=1`, { next: { revalidate: 3600 } });
    // We just want a count or a sample, or we can just fetch it on client if it's too dynamic
    // For now let's just make the page structure SSR ready
    return {
      initialData: true
    };
  } catch (error) {
    console.error("Error fetching learn data:", error);
    return {
      initialData: false
    };
  }
}

export default async function LearnPage() {
  const data = await getInitialData();
  
  return <LearnClient />;
}
