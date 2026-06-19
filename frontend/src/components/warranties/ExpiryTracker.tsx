"use client";

import { useState } from "react";
import { cn, formatDate, getDaysUntil, isExpiringSoon } from "@/lib/utils";
import { Button, Input, Card, Badge } from "@/components/ui";
import type { ExpiryItem } from "@/types";
import {
  Plus,
  Search,
  Clock,
  AlertTriangle,
  Calendar,
  Bell,
  Trash2,
  Edit,
  Package,
  Pill,
  Coffee,
  Tv,
  FileText,
} from "lucide-react";

// Mock data
const mockExpiryItems: ExpiryItem[] = [
  {
    id: "1",
    userId: "1",
    name: "Organic Milk",
    category: "food",
    expiryDate: "2026-06-05",
    purchaseDate: "2026-05-29",
    reminderEnabled: true,
    reminderDays: [3, 1],
    createdAt: "2026-05-29T10:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    name: "Vitamin D Supplements",
    category: "medicine",
    expiryDate: "2026-08-15",
    purchaseDate: "2025-02-15",
    notes: "Take 1 daily",
    reminderEnabled: true,
    reminderDays: [30, 7],
    createdAt: "2025-02-15T09:00:00Z",
  },
  {
    id: "3",
    userId: "1",
    name: "Face Cream",
    category: "cosmetics",
    expiryDate: "2026-04-10",
    purchaseDate: "2025-04-10",
    reminderEnabled: false,
    reminderDays: [],
    createdAt: "2025-04-10T14:30:00Z",
  },
  {
    id: "4",
    userId: "1",
    name: "Netflix Subscription",
    category: "subscription",
    expiryDate: "2026-06-28",
    reminderEnabled: true,
    reminderDays: [7, 3, 1],
    createdAt: "2026-05-28T00:00:00Z",
  },
  {
    id: "5",
    userId: "1",
    name: "Passport",
    category: "document",
    expiryDate: "2030-03-15",
    reminderEnabled: true,
    reminderDays: [180, 90, 30],
    createdAt: "2020-03-15T00:00:00Z",
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  food: <Coffee className="w-5 h-5" />,
  medicine: <Pill className="w-5 h-5" />,
  cosmetics: <Package className="w-5 h-5" />,
  household: <Package className="w-5 h-5" />,
  subscription: <Tv className="w-5 h-5" />,
  document: <FileText className="w-5 h-5" />,
  other: <Package className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  food: "bg-orange-100 text-orange-600",
  medicine: "bg-red-100 text-red-600",
  cosmetics: "bg-pink-100 text-pink-600",
  household: "bg-blue-100 text-blue-600",
  subscription: "bg-purple-100 text-purple-600",
  document: "bg-gray-100 text-gray-600",
  other: "bg-gray-100 text-gray-600",
};

export function ExpiryTracker() {
  const [items] = useState(mockExpiryItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "expiring" | "expired">("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const daysUntil = getDaysUntil(item.expiryDate);
    
    if (filter === "expiring" && isExpiringSoon(item.expiryDate, 30) && daysUntil > 0) return matchesSearch;
    if (filter === "expired" && daysUntil <= 0) return matchesSearch;
    return matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => 
    getDaysUntil(a.expiryDate) - getDaysUntil(b.expiryDate)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((i) => isExpiringSoon(i.expiryDate, 7)).length}
              </p>
              <p className="text-sm text-gray-500">Expiring in 7 days</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((i) => isExpiringSoon(i.expiryDate, 30) && getDaysUntil(i.expiryDate) > 7).length}
              </p>
              <p className="text-sm text-gray-500">Expiring in 30 days</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((i) => getDaysUntil(i.expiryDate) <= 0).length}
              </p>
              <p className="text-sm text-gray-500">Already Expired</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search items..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            {(["all", "expiring", "expired"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      <div className="space-y-4">
        {sortedItems.map((item) => {
          const daysLeft = getDaysUntil(item.expiryDate);
          const isExpired = daysLeft <= 0;
          const isExpiring = daysLeft <= 30 && daysLeft > 0;
          const icon = categoryIcons[item.category] || <Package className="w-5 h-5" />;
          const colorClass = categoryColors[item.category] || categoryColors.other;

          return (
            <Card key={item.id} hover className="group">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                  {icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant="gray" size="sm" className="mt-1 capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        isExpired ? "text-red-600" : isExpiring ? "text-orange-600" : "text-gray-900"
                      )}>
                        {isExpired ? "Expired" : `${daysLeft} days`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(item.expiryDate)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isExpired ? "bg-red-500" : isExpiring ? "bg-orange-500" : "bg-green-500"
                        )}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (1 - daysLeft / 365) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Reminder Status */}
                  {item.reminderEnabled && (
                    <div className="flex items-center gap-2 mt-3">
                      <Bell className="w-4 h-4 text-primary-500" />
                      <span className="text-xs text-gray-500">
                        Reminders at {item.reminderDays.map((d) => `${d}d`).join(", ")} before
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {sortedItems.length === 0 && (
          <Card className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items to track</h3>
            <p className="text-gray-500 mb-4">Add items to track their expiry dates</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
