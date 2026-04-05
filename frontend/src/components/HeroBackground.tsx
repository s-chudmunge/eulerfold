"use client";

import React from "react";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background pointer-events-none">
      {/* Teal + silver gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-border/10 to-accent/10" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.3]" />
      
      {/* Faded edges to blend the grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
    </div>
  );
}
