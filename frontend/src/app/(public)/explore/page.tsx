import React from 'react';
import { Metadata } from 'next';
import ExploreClient from './ExploreClient';

export const metadata: Metadata = {
  title: 'Explore Roadmaps',
  description: 'Discover learning journeys crafted and shared by the community. Find your next skill to master.',
  keywords: 'explore roadmaps, technical skills, community learning, learning paths, EulerFold roadmaps',
  openGraph: {
    title: 'Explore Roadmaps',
    description: 'Discover learning journeys crafted and shared by the community. Find your next skill to master.',
    type: 'website',
    url: 'https://www.eulerfold.com/explore',
    siteName: 'EulerFold',
  },
  twitter: {
    card: 'summary',
    title: 'Explore Roadmaps',
    description: 'Discover learning journeys crafted and shared by the community.',
    creator: '@eulerfold',
  },
  alternates: {
    canonical: 'https://www.eulerfold.com/explore',
  }
};

async function getInitialData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  try {
    const [roadmapsRes, leaderboardRes] = await Promise.all([
      fetch(`${API_URL}/explore?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/coins/leaderboard`, { next: { revalidate: 3600 } })
    ]);

    const roadmaps = roadmapsRes.ok ? await roadmapsRes.json() : [];
    const leaderboardData = leaderboardRes.ok ? await leaderboardRes.json() : { top_users: [] };

    return {
      initialRoadmaps: roadmaps,
      initialLeaderboard: leaderboardData.top_users?.slice(0, 5) || []
    };
  } catch (error) {
    console.error("Error fetching explore data:", error);
    return {
      initialRoadmaps: [],
      initialLeaderboard: []
    };
  }
}

export default async function ExplorePage() {
  const { initialRoadmaps, initialLeaderboard } = await getInitialData();

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
        "name": "Explore",
        "item": "https://www.eulerfold.com/explore"
      }
    ]
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ExploreClient 
        initialRoadmaps={initialRoadmaps} 
        initialLeaderboard={initialLeaderboard} 
      />
    </>
  );
}
