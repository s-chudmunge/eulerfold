'use client';
import { useEffect } from 'react';

export function useFaviconBlink(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;
    const normalHref = '/apple-touch-icon.png';
    const TRANSPARENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAjSURBVHgB7cEBDQAAAMKg909tDwcUAAAAAAAAAAAAAAAAAD4M5gABYcoU1QAAAABJRU5ErkJggg==';
    let visible = true;
    const updateFavicon = (href: string) => {
      document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
      const link = document.createElement('link');
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      link.href = href;
      document.head.appendChild(link);
    };
    updateFavicon(normalHref);
    const interval = setInterval(() => {
      visible = !visible;
      updateFavicon(visible ? normalHref : TRANSPARENT);
    }, 500);
    return () => { clearInterval(interval); updateFavicon(normalHref); };
  }, [isActive]);
}
