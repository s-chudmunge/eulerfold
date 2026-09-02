'use client';

import React from 'react';
import { GoldfishAgentState } from './types';

export function GoldfishAvatar({ 
  state = 'idle', 
  size = 44,
  className = "" 
}: { 
  state?: GoldfishAgentState; 
  size?: number;
  className?: string;
}) {
  const src = "/goldfish/goldfish_happy.png";

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={src} 
        alt="Goldfish AI" 
        className="w-full h-full object-contain drop-shadow-xs" 
      />
    </div>
  );
}

export function GoldfishIcon({ 
  className = "w-6 h-6",
  variant
}: { 
  className?: string;
  variant?: string;
}) {
  return (
    <img 
      src="/goldfish/goldfish_happy.png" 
      alt="Goldfish" 
      className={`inline-block object-contain shrink-0 ${className}`}
    />
  );
}
