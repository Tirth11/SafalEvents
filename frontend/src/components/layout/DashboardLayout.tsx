"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "@/lib/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeKey?: string;
  onNavigate?: (key: string, path: string) => void;
  /** When true, the Safal-AI top header is rendered automatically */
  showHeader?: boolean;
  /** Page title shown next to the Safal-AI brand */
  headerTitle?: string;
  /** Optional helper text shown under the page title */
  headerSubtitle?: string;
  /** Right-side controls injected into the header */
  headerRight?: React.ReactNode;
  /** Optional logo to display next to the title */
  headerLogo?: string;
}

export function DashboardLayout({
  children,
  activeKey,
  onNavigate,
  showHeader = true,
  headerTitle,
  headerSubtitle,
  headerRight,
  headerLogo,
}: DashboardLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeKey={activeKey} onNavigate={onNavigate} />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {showHeader && (
          <Header
            title={headerTitle}
            subtitle={headerSubtitle}
            rightSlot={headerRight}
            logo={headerLogo}
          />
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </main>
    </div>
  );
}
