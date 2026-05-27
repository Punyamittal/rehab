"use client";

import { motion } from "framer-motion";

/**
 * Calm, non-addictive ambient motion — soft floating shapes
 * inspired by passive background engagement without chaos.
 */
export function AmbientBackground({ intensity = "low" }: { intensity?: "low" | "medium" }) {
  const opacity = intensity === "low" ? 0.15 : 0.25;

  return (
    <div
      data-no-hover-read
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
      aria-hidden
    >
      <motion.div
        className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
        style={{ opacity }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-1/2 h-72 w-72 rounded-full bg-secondary/25 blur-3xl"
        style={{ opacity }}
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
        style={{ opacity }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Gentle ground motion strip — reel-style pacing without gameplay chaos */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/10 to-transparent"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </div>
  );
}
