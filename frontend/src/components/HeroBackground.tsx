"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background pointer-events-none">
      {/* Teal + silver gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-border/20 to-accent/20" />

      {/* Animated blobs */}
      <motion.div
        className="absolute w-72 h-72 bg-accent rounded-full blur-3xl opacity-30"
        animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-0 bottom-0 w-96 h-96 bg-border rounded-full blur-3xl opacity-30"
        animate={{ x: [0, -120, 60, 0], y: [0, 100, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
    </div>
  );
}
