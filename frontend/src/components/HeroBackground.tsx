"use client";

import React from "react";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background pointer-events-none">
      {/* Soft radial gradient — primary ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />

      {/* Secondary warm accent — subtle purple/pink wash from top-right like the Jotform reference */}
      <div 
        className="absolute -top-[20%] -right-[10%] w-[60%] h-[70%] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent 70%)' }}
      />

      {/* Grid overlay — refined and subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.5] dark:opacity-[0.2]" />
      
      {/* Faded edges to blend the grid smoothly */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
    </div>
  );
}
