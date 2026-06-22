"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/utils";
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Star,
  Receipt,
  AlertTriangle,
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tokens: "Limited",
    productCount: "1 product",
    aiModels: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$5.99",
    period: "/month",
    tokens: "More",
    productCount: "2 products",
    aiModels: false,
  },
  {
    id: "advanced",
    name: "Advanced",
    price: "$7.99",
    period: "/month",
    tokens: "Higher",
    productCount: "4 products",
    aiModels: false,
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "/month",
    tokens: "Premium",
    productCount: "6 products",
    aiModels: true,
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    price: "$15.99",
    period: "/month",
    tokens: "Highest",
    productCount: "All products",
    aiModels: true,
  },
];

const topUpPacks = [
  { tokens: "100", price: "$1.99", name: "Starter Top-Up" },
  { tokens: "300", price: "$4.99", name: "Growth Top-Up" },
  { tokens: "750", price: "$9.99", name: "Power Top-Up" },
  { tokens: "2,000", price: "$19.99", name: "Business Top-Up" },
];

const fallbackUsageHistory = [
  {
    id: "1",
    action: "AI Workspace (Auto Mode)",
    tokens: -2,
    time: "2026-05-30T10:30:00Z",
  },
  {
    id: "2",
    action: "Receipt extraction",
    tokens: -5,
    time: "2026-05-29T15:00:00Z",
  },
  {
    id: "3",
    action: "Report generation",
    tokens: -10,
    time: "2026-05-28T09:00:00Z",
  },
  {
    id: "4",
    action: "Top-Up purchased: Growth",
    tokens: 300,
    time: "2026-05-27T12:00:00Z",
  },
  {
    id: "5",
    action: "Voice command",
    tokens: -3,
    time: "2026-05-26T14:20:00Z",
  },
];

const billingHistory = [
  {
    id: "b_001",
    description: "Basic plan — May 2026",
    amount: "$5.99",
    status: "Paid",
    date: "2026-05-01T00:00:00Z",
  },
  {
    id: "b_002",
    description: "Growth Top-Up — 300 Safal Tokens",
    amount: "$4.99",
    status: "Paid",
    date: "2026-05-27T12:00:00Z",
  },
];

const tokenCosts = [
  { action: "Basic chat prompt", cost: "1 token" },
  { action: "Prompt-based task", cost: "2 tokens" },
  { action: "File upload and extraction", cost: "5 tokens" },
  { action: "Report generation", cost: "10 tokens" },
  { action: "Voice command", cost: "3 tokens" },
  { action: "External AI model usage", cost: "Based on model usage" },
  { action: "Advanced workflow", cost: "Based on complexity" },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, user, tokenHistory } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  const handleNavigate = (_key: string, path: string) => {
    router.push(path);
  };

  const balance = user?.subscription?.creditsBalance ?? 0;
  const used = user?.subscription?.creditsUsed ?? 0;
  const currentPlan = user?.subscription?.plan ?? "free";
  const renewalDate = user?.subscription?.renewalDate;

  const totalAllotted = balance + used || 50;
  const usagePercent = Math.min(
    100,
    Math.round((used / totalAllotted) * 100) || 0
  );
  const lowTokens = balance <= totalAllotted * 0.2;

  const usageHistory = tokenHistory.length
    ? tokenHistory.map((tx) => ({
        id: tx.id,
        action: tx.action || tx.description,
        tokens:
          tx.type === "purchase" || tx.type === "bonus" || tx.type === "refund"
            ? tx.amount
            : -Math.abs(tx.amount),
        time: tx.createdAt,
      }))
    : fallbackUsageHistory;

  return (
    <DashboardLayout
      activeKey="subscriptions"
      onNavigate={handleNavigate}
      headerTitle="Subscriptions"
      headerSubtitle="Plans, Safal Tokens, top-ups, and billing"
    >
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        {/* Low token alert */}
        {lowTokens && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                You are running low on Safal Tokens
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Top up or upgrade to continue using advanced AI features.
              </p>
            </div>
            <Button size="sm" className="flex-shrink-0">
              Buy Top-Up
            </Button>
          </div>
        )}

        {/* Balance + plan summary */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-green-600 to-green-500 text-white !border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-xs">Available Safal Tokens</p>
                <p className="text-4xl font-bold mt-1">{balance}</p>
                <p className="text-green-100 text-xs mt-1">
                  {used} used this period
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-green-100 mt-1.5">
                {used} / {totalAllotted} Safal Tokens used
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 capitalize mt-1">
                  {currentPlan.replace("_", " ")}
                </p>
                {renewalDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Renews on{" "}
                    {new Date(renewalDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Plan tokens</p>
                <p className="text-sm font-semibold text-gray-900">
                  {totalAllotted}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Top-up tokens</p>
                <p className="text-sm font-semibold text-gray-900">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Plans */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Available Plans</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  className={
                    isCurrent
                      ? "relative border border-green-500 rounded-xl p-4 bg-green-50/40"
                      : "relative border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors"
                  }
                >
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 inline -mt-0.5" /> POPULAR
                    </div>
                  )}
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <div className="mt-1 mb-3">
                    <span className="text-xl font-bold">{plan.price}</span>
                    <span className="text-[11px] text-gray-500">
                      {" "}
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-600 mb-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {plan.tokens} Safal Tokens
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {plan.productCount}
                    </li>
                    <li
                      className={
                        plan.aiModels
                          ? "flex items-center gap-1.5"
                          : "flex items-center gap-1.5 text-gray-400"
                      }
                    >
                      {plan.aiModels ? (
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <span className="w-3 h-3 inline-block rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                      External AI models
                    </li>
                  </ul>
                  {isCurrent ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top-up packs */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            Buy Safal Token Top-Ups
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topUpPacks.map((pack) => (
              <div
                key={pack.name}
                className="border border-gray-200 rounded-xl p-4 text-center hover:border-green-300 transition-colors"
              >
                <Coins className="w-5 h-5 text-green-600 mx-auto" />
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {pack.tokens}
                </p>
                <p className="text-[11px] text-gray-500">Safal Tokens</p>
                <p className="text-sm font-semibold text-green-600 mt-2">
                  {pack.price}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full text-xs"
                >
                  Buy {pack.name.replace(" Top-Up", "")}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Token usage examples */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            Safal Token Usage Examples
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Examples only — actual token usage may vary by task.
          </p>
          <div className="divide-y divide-gray-100">
            {tokenCosts.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-gray-600">{row.action}</span>
                <span className="font-medium text-gray-900">{row.cost}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Usage history */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            Safal Token Usage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 font-medium">Date</th>
                  <th className="py-2.5 font-medium">Action</th>
                  <th className="py-2.5 font-medium">Model</th>
                  <th className="py-2.5 font-medium text-right">Tokens Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usageHistory.map((tx) => {
                  const modelMatch = tx.action?.match(/\(([^)]+)\)$/);
                  const model = modelMatch ? modelMatch[1] : "Auto Mode";
                  const action = tx.action?.replace(/\s*\([^)]+\)$/, "") || tx.action;
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50">
                      <td className="py-3 text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(tx.time)}
                      </td>
                      <td className="py-3 text-gray-900 font-medium">
                        {action}
                      </td>
                      <td className="py-3 text-gray-600">
                        {tx.tokens > 0 ? "—" : model}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            tx.tokens > 0
                              ? "font-medium text-green-600"
                              : "font-medium text-red-600"
                          }
                        >
                          {tx.tokens > 0 ? "+" : ""}
                          {tx.tokens}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Billing history */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Billing History</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {billingHistory.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <p className="text-gray-900">{b.description}</p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(b.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{b.amount}</p>
                  <span className="text-[11px] text-green-600">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
