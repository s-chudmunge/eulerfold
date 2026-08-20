"use client";

import React from "react";

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-background"></div>
      {/* Subtle grid pattern matching other sections */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_70%,transparent_100%)]"></div>
    </div>
  );
}
