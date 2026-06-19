"use client";

import { cn, getInitials } from "@/lib/utils";
import {
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Sparkles,
  MessageSquare,
  Plug,
} from "lucide-react";
import {
  useAuthStore,
  useUIStore,
  useProductsStore,
} from "@/lib/store";
import type { SafalProductId } from "@/types";

const allProducts: { id: SafalProductId; name: string; status: "Live" | "Launching Soon"; logo: string }[] = [
  { id: "safalmybuy", name: "SafalMyBuy", status: "Live", logo: "/logos/safalmybuy.png" },
  { id: "safalirdrainmate", name: "SafalIRDrainMate", status: "Live", logo: "/logos/safalirdrainmate.png" },
  { id: "safalvendors", name: "SafalVendors", status: "Launching Soon", logo: "/logos/safalvendors.svg" },
  { id: "safalcalendar", name: "SafalCalendar", status: "Launching Soon", logo: "/logos/safalcalendar.svg" },
  { id: "safalsubscriptions", name: "SafalSubscriptions", status: "Launching Soon", logo: "/logos/safalsubscriptions.png" },
  { id: "safalreviews", name: "SafalReviews", status: "Launching Soon", logo: "/logos/safalreviews.svg" },
  { id: "safaldrive", name: "SafalDrive", status: "Launching Soon", logo: "/logos/safaldrive.png" },
  { id: "safalutilities", name: "SafalUtilities", status: "Launching Soon", logo: "/logos/safalutilities.svg" },
];

interface SidebarProps {
  /**
   * Active key to highlight in the sidebar. Possible shapes:
   * - "product:<id>"   e.g. "product:safalmybuy" or "product:custom"
   * - "integrations"
   * - "subscriptions"
   * - "settings"
   */
  activeKey?: string;
  onNavigate?: (key: string, path: string) => void;
}

export function Sidebar({ activeKey = "", onNavigate }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { connections } = useProductsStore();

  const connectedProducts = allProducts.filter(
    (p) => connections[p.id]?.connected
  );

  const navigate = (key: string, path: string) => {
    if (onNavigate) {
      onNavigate(key, path);
    } else {
      window.location.href = path;
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      window.location.href = "/";
    }
  };

  const itemBase =
    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm";
  const itemActive = "bg-green-50 text-green-700 font-medium";
  const itemIdle = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Safal-AI</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {/* My Products section */}
        {sidebarOpen && (
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-3 mb-2">
            My Products
          </p>
        )}

        {connectedProducts.map((p) => {
          const key = `product:${p.id}`;
          const isActive = activeKey === key;
          return (
            <button
              key={p.id}
              onClick={() => navigate(key, `/chat?product=${p.id}`)}
              className={cn(itemBase, isActive ? itemActive : itemIdle, "mb-1")}
            >
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left truncate">
                  {p.name} Chat
                </span>
              )}
            </button>
          );
        })}

        {/* AI Workspace - always available */}
        <button
          onClick={() => navigate("product:custom", "/chat?product=custom")}
          className={cn(
            itemBase,
            activeKey === "product:custom" ? itemActive : itemIdle,
            "mb-2"
          )}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && (
            <span className="flex-1 text-left truncate">AI Workspace</span>
          )}
        </button>

        <div className="border-t border-gray-100 mx-3 my-2" />

        {/* All SafalVir Products */}
        {sidebarOpen && (
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-3 mb-2">
            All SafalVir Products
          </p>
        )}
        <div className="space-y-0.5 mb-2">
          {allProducts.map((p) => {
            const connected = connections[p.id]?.connected;
            const key = `product:${p.id}`;
            const isActive = activeKey === key;
            return (
              <button
                key={p.id}
                onClick={() => navigate(key, `/chat?product=${p.id}`)}
                className={cn(
                  itemBase,
                  isActive ? itemActive : itemIdle,
                  "py-1.5"
                )}
                title={p.name}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={p.logo} 
                    alt={p.name} 
                    className={`w-4 h-4 object-contain ${!connected && p.status === 'Live' ? 'grayscale opacity-70' : ''}`} 
                  />
                  {connected && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-left truncate text-xs">
                      {p.name}
                    </span>
                    {p.status === "Launching Soon" && (
                      <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap ml-2">
                        Soon
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 mx-3 my-2" />

        {/* Workspace sections */}
        <button
          onClick={() => navigate("integrations", "/integrations")}
          className={cn(
            itemBase,
            activeKey === "integrations" ? itemActive : itemIdle
          )}
        >
          <Plug className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span className="flex-1 text-left">Integration</span>}
        </button>

        <button
          onClick={() => navigate("subscriptions", "/subscriptions")}
          className={cn(
            itemBase,
            activeKey === "subscriptions" ? itemActive : itemIdle,
            "mt-1"
          )}
        >
          <CreditCard className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && (
            <span className="flex-1 text-left">Subscriptions</span>
          )}
        </button>

        <button
          onClick={() => navigate("settings", "/settings")}
          className={cn(
            itemBase,
            activeKey === "settings" ? itemActive : itemIdle,
            "mt-1"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span className="flex-1 text-left">Settings</span>}
        </button>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-2 border-t border-gray-100">
        {sidebarOpen ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(user?.name || "U")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.name || "U")}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
