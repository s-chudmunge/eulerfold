"use client";

import React from "react";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background pointer-events-none">
      {/* Subtle grid pattern matching other sections */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_70%,transparent_100%)]"></div>
      
      {/* Decorative gradient blur matching the cards below */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-[20%] -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
}
