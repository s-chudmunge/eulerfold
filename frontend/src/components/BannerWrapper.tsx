'use client';

import React from 'react';
import AnnouncementBar from './AnnouncementBar';
import GitHubStarBanner from './GitHubStarBanner';

export default function BannerWrapper() {
  return (
    <>
      <AnnouncementBar />
      <GitHubStarBanner />
    </>
  );
}
