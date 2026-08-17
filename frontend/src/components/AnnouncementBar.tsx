'use client';

import { useEffect } from 'react';

export default function AnnouncementBar() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--announcement-height', '0px');
    }
  }, []);

  return null;
}

