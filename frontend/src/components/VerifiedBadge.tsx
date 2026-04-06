import React from 'react';

export default function VerifiedBadge({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Background Circle/Ring */}
      <div className="absolute inset-0 rounded-full border border-teal-500/20 bg-teal-500/5 dark:bg-teal-400/10" />

      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="60 60 200 180"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >      <defs>
        <linearGradient id="badgeLeftTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3f4f6"/>
          <stop offset="100%" stopColor="#9ca3af"/>
        </linearGradient>
        <linearGradient id="badgeLeftBottom" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ca3af"/>
          <stop offset="100%" stopColor="#4b5563"/>
        </linearGradient>
        <linearGradient id="badgeRightTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7df"/>
          <stop offset="100%" stopColor="#2aa39c"/>
        </linearGradient>
        <linearGradient id="badgeRightBottom" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2aa39c"/>
          <stop offset="100%" stopColor="#134e4a"/>
        </linearGradient>
        <linearGradient id="badgeCenterLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4"/>
        </linearGradient>
      </defs>

      {/* Top */}
      <polygon points="160,65 85,150 160,150" fill="url(#badgeLeftTop)"/>
      <polygon points="160,65 235,150 160,150" fill="url(#badgeRightTop)"/>

      {/* Bottom */}
      <polygon points="160,235 85,150 160,150" fill="url(#badgeLeftBottom)"/>
      <polygon points="160,235 235,150 160,150" fill="url(#badgeRightBottom)"/>

      {/* Center edge */}
      <rect x="159" y="65" width="2" height="170" fill="url(#badgeCenterLine)"/>
    </svg>
    </div>
  );
}
