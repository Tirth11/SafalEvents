"use client";

import { QuickActions } from "./QuickActions";
import type { User } from "@/types";

interface AIGreetingProps {
  user: User | null;
  onQuickAction: (action: string) => void;
}

export function AIGreeting({ user, onQuickAction }: AIGreetingProps) {
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 animate-fade-in">
      {/* AI Avatar */}
      <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-md mb-5">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Greeting */}
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Hi {firstName}, what would you like to do today?
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
        Choose an action below or type your request. I&apos;ll guide you step by step.
      </p>

      {/* Quick Actions */}
      <div className="w-full max-w-xl">
        <QuickActions onAction={onQuickAction} />
      </div>
    </div>
  );
}
