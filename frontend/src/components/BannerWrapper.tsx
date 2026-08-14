'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import GitHubStarBanner from './GitHubStarBanner';

export default function BannerWrapper() {
  const pathname = usePathname();

  // Hide banners on article pages
  if (pathname && pathname.startsWith('/articles')) {
    return null;
  }

  return (
    <>
      <AnnouncementBar />
      <GitHubStarBanner />
    </>
  );
}
