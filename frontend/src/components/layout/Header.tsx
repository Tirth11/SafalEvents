"use client";

import Link from "next/link";
import { Coins, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface HeaderProps {
  /** Section heading shown to the right of the Safal-AI brand */
  title?: string;
  /** Optional helper text under the title */
  subtitle?: string;
  /** Optional right-side action(s) — placed before the Safal Tokens chip */
  rightSlot?: React.ReactNode;
  /** Optional logo to display next to the title */
  logo?: string;
}

export function Header({ title, subtitle, rightSlot, logo }: HeaderProps) {
  const { user } = useAuthStore();
  const tokens = user?.subscription?.creditsBalance ?? 0;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Always-visible Safal-AI brand */}
        <Link href="/chat" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:inline">
            Safal-AI
          </span>
        </Link>

        {(title || subtitle) && (
          <div className="hidden sm:block h-5 w-px bg-gray-200 mx-1" />
        )}

        {(title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <div className="flex items-center gap-2">
                {logo && (
                  <img src={logo} alt={title} className="w-5 h-5 object-contain" />
                )}
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {rightSlot}

        {/* Safal Tokens balance chip */}
        <Link
          href="/subscriptions"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          title="Safal Tokens balance"
        >
          <Coins className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {tokens} Safal Tokens
          </span>
        </Link>
      </div>
    </header>
  );
}
