"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import { ChatInterface, AIWorkspaceInterface, OnboardingChecklist } from "@/components/chat";
import { ProductConnect } from "@/components/chat/ProductConnect";
import {
  useAuthStore,
  useChatStore,
  useProductsStore,
  useOnboardingStore
} from "@/lib/store";
import type { SafalProductId } from "@/types";
import { CheckCircle, RotateCcw } from "lucide-react";

const productCatalogue: Record<SafalProductId, { name: string; status: "Live" | "Launching Soon"; logo: string }> = {
  safalmybuy: { name: "SafalMyBuy", status: "Live", logo: "/logos/safalmybuy.png" },
  safalirdrainmate: { name: "SafalIRDrainMate", status: "Live", logo: "/logos/safalirdrainmate.png" },
  safalvendors: { name: "SafalVendors", status: "Launching Soon", logo: "/logos/safalvendors.svg" },
  safalcalendar: { name: "SafalCalendar", status: "Launching Soon", logo: "/logos/safalcalendar.svg" },
  safalsubscriptions: { name: "SafalSubscriptions", status: "Launching Soon", logo: "/logos/safalsubscriptions.png" },
  safalreviews: { name: "SafalReviews", status: "Launching Soon", logo: "/logos/safalreviews.svg" },
  safaldrive: { name: "SafalDrive", status: "Launching Soon", logo: "/logos/safaldrive.png" },
  safalutilities: { name: "SafalUtilities", status: "Launching Soon", logo: "/logos/safalutilities.svg" },
};

function isSafalProductId(value: string | null): value is SafalProductId {
  return !!value && value in productCatalogue;
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") || "custom";

  const { isAuthenticated, user } = useAuthStore();
  const { connections, connect } = useProductsStore();

  const [hydrated, setHydrated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const isCustom = productParam === "custom";
  const productId: SafalProductId | null = useMemo(() => {
    if (isCustom) return null;
    return isSafalProductId(productParam) ? productParam : "safalmybuy";
  }, [isCustom, productParam]);

  const productName = productId ? productCatalogue[productId].name : "Custom";
  const productStatus = productId ? productCatalogue[productId].status : "Live";
  const productLogo = productId ? productCatalogue[productId].logo : undefined;
  const isProductConnected = productId
    ? !!connections[productId]?.connected
    : false;

  const handleConnect = () => {
    if (!productId) return;
    setIsConnecting(true);
    // Simulate redirect to the product's auth screen and successful callback.
    setTimeout(() => {
      connect(productId, {
        name: user?.name || "User",
        email: user?.email || "",
      });
      setIsConnecting(false);
    }, 1500);
  };

  const handleNavigate = (_key: string, path: string) => {
    router.push(path);
  };

  if (!hydrated || !isAuthenticated) return null;

  // Sidebar active key
  const activeKey = isCustom
    ? "product:custom"
    : `product:${productId ?? "safalmybuy"}`;

  // Header
  const headerTitle = isCustom
    ? "AI Workspace"
    : isProductConnected
      ? `${productName} Chat`
      : `${productName}`;

  const headerSubtitle = isCustom
    ? "Use your own integrated AI models"
    : isProductConnected
      ? `Connected as ${user?.name || "User"}`
      : "Not Connected";

  const headerRight =
    !isCustom && isProductConnected ? (
      <button
        onClick={() => useChatStore.getState().clearMessages()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        New Chat
      </button>
    ) : null;

  return (
    <DashboardLayout
      activeKey={activeKey}
      onNavigate={handleNavigate}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      headerRight={headerRight}
      headerLogo={productLogo}
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto pt-4 relative">
        <OnboardingChecklist />
        {isCustom ? (
          <AIWorkspaceInterface />
        ) : isProductConnected ? (
          <>
            {/* Optional: tiny status strip showing connected state */}
            <div className="flex-shrink-0 bg-green-50 border-b border-green-100 px-4 lg:px-6 py-2 flex items-center gap-2 text-xs text-green-700 mt-auto">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{productName} connected</span>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface />
            </div>
          </>
        ) : (
          <ProductConnect
            productName={productName}
            onConnect={handleConnect}
            isConnecting={isConnecting}
            status={productStatus}
            logo={productLogo}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
