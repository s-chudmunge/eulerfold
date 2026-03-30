import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ExploreClient from './ExploreClient';

export const metadata: Metadata = {
  title: 'Explore Roadmaps',
  description: 'Discover learning journeys crafted and shared by the community. Find your next skill to master.',
  openGraph: {
    title: 'Explore Roadmaps',
    description: 'Find your next learning journey from our community of learners.',
    url: 'https://www.eulerfold.com/explore',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Explore Roadmaps',
    description: 'Discover learning journeys crafted and shared by the community.',
  },
  alternates: {
    canonical: '/explore',
  }
};

async function getInitialData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  try {
    const [roadmapsRes, leaderboardRes] = await Promise.all([
      fetch(`${API_URL}/explore?limit=20`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/coins/leaderboard`, { next: { revalidate: 300 } })
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
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
          <div className="animate-pulse text-teal-700 font-mono">Loading Explore...</div>
        </div>
      }>
        <ExploreClient 
          initialRoadmaps={initialRoadmaps} 
          initialLeaderboard={initialLeaderboard} 
        />
      </Suspense>
    </>
  );
}
