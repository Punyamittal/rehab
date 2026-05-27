"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-white shadow-md hover:bg-primary-dark active:scale-[0.97] disabled:opacity-50",
    secondary:
      "bg-secondary/80 text-white shadow-md hover:bg-secondary active:scale-[0.97] disabled:opacity-50",
    ghost: "bg-transparent text-foreground hover:bg-white/50 active:scale-[0.97]",
    outline:
      "border-2 border-primary/40 bg-white/60 text-foreground hover:bg-white active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      className={cn(
        "touch-target inline-flex items-center justify-center font-medium transition-all duration-150",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
