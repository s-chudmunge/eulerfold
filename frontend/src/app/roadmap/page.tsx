import React from 'react';
import { Metadata } from 'next';
import RoadmapIndexClient from './RoadmapIndexClient';

export const metadata: Metadata = {
  title: 'Roadmap Index',
  description: 'Direct directory of all public learning roadmaps on EulerFold. Structured paths for programming, science, and professional skills.',
  alternates: {
    canonical: '/roadmap',
  },
};

async function getPublicRoadmaps() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  try {
    // Fetch a large limit for indexing purposes
    const res = await fetch(`${API_URL}/explore?limit=500`, { 
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching roadmaps for index:", error);
    return [];
  }
}

export default async function RoadmapIndexPage() {
  const roadmaps = await getPublicRoadmaps();
  
  return (
    <RoadmapIndexClient initialRoadmaps={roadmaps} />
  );
}
