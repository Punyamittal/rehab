"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileHover={hover ? { y: -2, boxShadow: "0 8px 32px rgba(74,55,40,0.12)" } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "rounded-3xl bg-card p-5 text-left shadow-[var(--safe-shadow)] backdrop-blur-sm",
        onClick && "cursor-pointer w-full",
        className
      )}
    >
      {children}
    </Component>
  );
}
