"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12" variant="circular" />
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-4" />
      <Skeleton className="w-full h-10" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-10 h-10" variant="circular" />
          <div className="flex-1">
            <Skeleton className="w-1/3 h-4 mb-2" />
            <Skeleton className="w-1/2 h-3" />
          </div>
          <Skeleton className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}
