"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-gradient-to-r from-orange-300 via-orange-500 to-amber-300 bg-[length:200%_200%] bg-clip-text text-transparent",
        className
      )}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}
