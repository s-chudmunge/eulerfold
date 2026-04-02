import React from 'react';
import { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Global Rankings',
  description: 'See the top learners on EulerFold. Track global rankings based on technical skills, learning consistency, and verified audits.',
  keywords: 'leaderboard, global rankings, technical skills, learning streaks, EulerFold community',
  openGraph: {
    title: 'Global Rankings',
    description: 'See how learners rank globally on EulerFold based on skills and consistency.',
    type: 'website',
    url: 'https://www.eulerfold.com/leaderboard',
    siteName: 'EulerFold',
  },
  twitter: {
    card: 'summary',
    title: 'Global Rankings',
    description: 'See how learners rank globally on EulerFold based on skills and consistency.',
    creator: '@eulerfold',
  },
  alternates: {
    canonical: 'https://www.eulerfold.com/leaderboard',
  },
};

async function getInitialLeaderboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  try {
    // We use a 5-minute revalidation period to match the Materialized View refresh
    const res = await fetch(`${API_URL}/coins/leaderboard`, { 
      next: { revalidate: 300 } 
    });

    if (!res.ok) {
        console.error("Failed to fetch leaderboard in SSR:", res.statusText);
        return { top_users: [], user_rank: null };
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching leaderboard in SSR:", error);
    return { top_users: [], user_rank: null };
  }
}

export default async function LeaderboardPage() {
  const initialData = await getInitialLeaderboard();

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
        "name": "Leaderboard",
        "item": "https://www.eulerfold.com/leaderboard"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LeaderboardClient 
        initialTopUsers={initialData.top_users} 
        initialUserRank={initialData.user_rank} 
      />
    </>
  );
}
