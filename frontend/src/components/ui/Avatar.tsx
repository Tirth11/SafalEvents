"use client";

import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeStyles = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const colors = [
    "bg-primary-500",
    "bg-secondary-500",
    "bg-accent-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  const colorIndex = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const backgroundColor = colors[colorIndex];

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex-shrink-0",
          sizeStyles[size],
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-medium flex-shrink-0",
        sizeStyles[size],
        backgroundColor,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ name: string; avatar?: string }>;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeStyles = {
    sm: "w-8 h-8 text-xs -ml-2",
    md: "w-10 h-10 text-sm -ml-2.5",
    lg: "w-12 h-12 text-base -ml-3",
  };

  return (
    <div className="flex items-center">
      {displayUsers.map((user, index) => (
        <div
          key={index}
          className={cn("ring-2 ring-white rounded-full", index !== 0 && sizeStyles[size].split(" ")[2])}
          style={{ zIndex: displayUsers.length - index }}
        >
          <Avatar name={user.name} src={user.avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium ring-2 ring-white",
            sizeStyles[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
