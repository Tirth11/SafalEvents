"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { Expense } from "@/types";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  PieChart,
} from "lucide-react";

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgAmount = totalAmount / (expenses.length || 1);
  const highestExpense = Math.max(...expenses.map((e) => e.amount), 0);
  const totalTransactions = expenses.length;

  // Calculate category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

  const stats = [
    {
      id: "total",
      label: "Total Expenses",
      value: formatCurrency(totalAmount),
      change: "+12.5%",
      changeType: "increase",
      icon: Wallet,
      color: "bg-primary-100 text-primary-600",
    },
    {
      id: "transactions",
      label: "Transactions",
      value: totalTransactions.toString(),
      change: "+8",
      changeType: "increase",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "average",
      label: "Average Expense",
      value: formatCurrency(avgAmount),
      change: "-5.2%",
      changeType: "decrease",
      icon: TrendingDown,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "highest",
      label: "Highest Expense",
      value: formatCurrency(highestExpense),
      change: topCategory?.[0].replace(/_/g, " ") || "N/A",
      changeType: "neutral",
      icon: PieChart,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} className="relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.changeType !== "neutral" && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {stat.changeType === "increase" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                {stat.changeType === "neutral" && (
                  <p className="text-xs text-gray-400 mt-1 capitalize">{stat.change}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
