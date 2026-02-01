"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* soft top glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />

      {/* diagonal gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,0,0.18),transparent_55%),radial-gradient(800px_circle_at_80%_20%,rgba(255,170,0,0.10),transparent_55%),radial-gradient(800px_circle_at_50%_85%,rgba(255,80,0,0.10),transparent_55%)]" />

      {/* moving orbs */}
      <motion.div
        className="pointer-events-none absolute left-[10%] top-[25%] h-48 w-48 rounded-full bg-orange-500/18 blur-[60px]"
        animate={{
          x: [0, 40, -10, 0],
          y: [0, -30, 25, 0],
          scale: [1, 1.12, 0.98, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none absolute right-[12%] top-[35%] h-56 w-56 rounded-full bg-orange-400/14 blur-[70px]"
        animate={{
          x: [0, -50, 20, 0],
          y: [0, 30, -15, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black" />
    </div>
  );
}
