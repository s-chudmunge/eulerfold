"use client";

import { motion } from "framer-motion";

export default function FeaturesBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      {/* Semantic Teal + silver base */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-border/10 to-accent/10" />

      {/* Animated flowing waves */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,400 C240,300 480,500 720,400 C960,300 1200,500 1440,400 L1440,800 L0,800 Z"
          fill="var(--accent)"
          fillOpacity="0.12"
          animate={{
            d: [
              "M0,400 C240,300 480,500 720,400 C960,300 1200,500 1440,400 L1440,800 L0,800 Z",
              "M0,420 C240,520 480,300 720,420 C960,540 1200,300 1440,420 L1440,800 L0,800 Z",
              "M0,400 C240,300 480,500 720,400 C960,300 1200,500 1440,400 L1440,800 L0,800 Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.path
          d="M0,500 C240,420 480,620 720,500 C960,380 1200,620 1440,500 L1440,800 L0,800 Z"
          fill="var(--border)"
          fillOpacity="0.15"
          animate={{
            d: [
              "M0,500 C240,420 480,620 720,500 C960,380 1200,620 1440,500 L1440,800 L0,800 Z",
              "M0,520 C240,640 480,380 720,520 C960,660 1200,380 1440,520 L1440,800 L0,800 Z",
              "M0,500 C240,420 480,620 720,500 C960,380 1200,620 1440,500 L1440,800 L0,800 Z",
            ],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* subtle grain */}
      <div className="absolute inset-0 opacity-10 mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
    </div>
  );
}
