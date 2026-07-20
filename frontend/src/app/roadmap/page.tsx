import React from 'react';
import { Metadata } from 'next';
import RoadmapIndexClient from './RoadmapIndexClient';

export const metadata: Metadata = {
  title: 'Course Directory — Discover public courses',
  description: 'Explore community-created technical courses. Filter by popularity, ratings, or tech stack to find the perfect learning journey.',
  keywords: 'course directory, public courses, courses, technical curriculum, skill directory, EulerFold courses',
  alternates: {
    canonical: 'https://www.eulerfold.com/roadmap',
  },
  openGraph: {
    title: 'Roadmap Directory — Discover public learning paths',
    description: 'Browse the complete directory of public learning roadmaps on EulerFold.',
    type: 'website',
    url: 'https://www.eulerfold.com/roadmap',
    siteName: 'EulerFold',
  },
  twitter: {
    card: 'summary',
    title: 'Roadmap Directory — Discover public learning paths',
    description: 'Browse the complete directory of public learning roadmaps on EulerFold.',
    creator: '@eulerfold',
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.eulerfold.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Roadmaps",
        "item": "https://www.eulerfold.com/roadmap"
      }
    ]
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RoadmapIndexClient initialRoadmaps={roadmaps} />
    </>
  );
}
