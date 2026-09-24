"use client";

import React from "react";

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-background"></div>
    </div>
  );
}
