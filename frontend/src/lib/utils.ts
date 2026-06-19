import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getDaysUntil(date: string | Date): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

export function isExpiringSoon(date: string | Date, days: number = 30): boolean {
  return getDaysUntil(date) <= days;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food_groceries: "bg-green-100 text-green-700",
    food_dining: "bg-orange-100 text-orange-700",
    transportation: "bg-blue-100 text-blue-700",
    vehicle: "bg-purple-100 text-purple-700",
    utilities: "bg-yellow-100 text-yellow-700",
    entertainment: "bg-pink-100 text-pink-700",
    shopping: "bg-indigo-100 text-indigo-700",
    healthcare: "bg-red-100 text-red-700",
    education: "bg-cyan-100 text-cyan-700",
    travel: "bg-teal-100 text-teal-700",
    personal: "bg-violet-100 text-violet-700",
    home: "bg-amber-100 text-amber-700",
    gifts: "bg-rose-100 text-rose-700",
    business: "bg-slate-100 text-slate-700",
    other: "bg-gray-100 text-gray-700",
  };
  return colors[category] || colors.other;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food_groceries: "ShoppingCart",
    food_dining: "Utensils",
    transportation: "Bus",
    vehicle: "Car",
    utilities: "Zap",
    entertainment: "Film",
    shopping: "ShoppingBag",
    healthcare: "Heart",
    education: "GraduationCap",
    travel: "Plane",
    personal: "User",
    home: "Home",
    gifts: "Gift",
    business: "Briefcase",
    other: "Circle",
  };
  return icons[category] || icons.other;
}
