"use client";

import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number | string;
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  strikethrough?: boolean;
  className?: string;
}

export default function Price({ amount, size = "base", strikethrough = false, className }: PriceProps) {
  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  const formatted = numericAmount.toLocaleString("id-ID");

  const sizeClasses = {
    sm: "text-xs",
    base: "text-sm",
    lg: "text-base",
    xl: "text-lg",
    "2xl": "text-xl",
    "3xl": "text-2xl font-bold",
  };

  return (
    <span
      className={cn(
        "font-mono tabular-nums font-medium text-manifest-ink",
        sizeClasses[size],
        strikethrough && "line-through text-muted-foreground font-normal",
        className
      )}
    >
      Rp {formatted}
    </span>
  );
}
