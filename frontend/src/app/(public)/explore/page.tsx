import React from 'react';
import { Metadata } from 'next';
import ExploreClient from './ExploreClient';
import UserNav from '@/components/UserNav';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Explore Courses',
  description: 'Discover learning journeys crafted and shared by the community. Find your next skill to master.',
  keywords: 'explore courses, technical skills, community learning, courses, EulerFold courses',
  openGraph: {
    title: 'Explore Courses',
    description: 'Discover learning journeys crafted and shared by the community. Find your next skill to master.',
    type: 'website',
    url: 'https://www.eulerfold.com/explore',
    siteName: 'EulerFold',
  },
  twitter: {
    card: 'summary',
    title: 'Explore Courses',
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
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 sticky top-0 inset-x-0">
          <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                  <Link className="flex items-center group shrink-0" href="/dashboard" aria-label="Dashboard">
                      <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                  </Link>
              </div>
              <div className="flex items-center gap-4">
                  <UserNav />
              </div>
          </div>
      </header>
      <main className="flex-grow min-w-0 bg-background scroll-smooth">
        <ExploreClient 
          initialRoadmaps={initialRoadmaps} 
          initialLeaderboard={initialLeaderboard} 
        />
      </main>
    </div>
  );
}
