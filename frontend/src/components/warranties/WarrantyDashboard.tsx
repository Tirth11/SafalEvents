"use client";

import { useState } from "react";
import { cn, formatDate, getDaysUntil, isExpiringSoon } from "@/lib/utils";
import { Button, Input, Card, Badge, Modal } from "@/components/ui";
import type { Warranty } from "@/types";
import {
  Plus,
  Search,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bell,
  Edit,
  Trash2,
} from "lucide-react";

// Mock data
const mockWarranties: (Warranty & { productName: string; productCategory: string })[] = [
  {
    id: "1",
    purchaseItemId: "1",
    productName: "iPhone 15 Pro",
    productCategory: "Electronics",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    durationMonths: 12,
    provider: "AppleCare+",
    warrantyNumber: "APP-2024-12345",
    remindersEnabled: true,
    reminderDays: [30, 7],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    purchaseItemId: "2",
    productName: "Samsung 55\" Smart TV",
    productCategory: "Electronics",
    startDate: "2023-12-20",
    endDate: "2024-12-20",
    durationMonths: 12,
    provider: "Samsung Warranty",
    remindersEnabled: true,
    reminderDays: [30, 14, 7],
    createdAt: "2023-12-20T14:30:00Z",
  },
  {
    id: "3",
    purchaseItemId: "3",
    productName: "Sony WH-1000XM5 Headphones",
    productCategory: "Electronics",
    startDate: "2024-02-10",
    endDate: "2026-02-10",
    durationMonths: 24,
    provider: "Sony",
    remindersEnabled: true,
    reminderDays: [30],
    createdAt: "2024-02-10T09:15:00Z",
  },
  {
    id: "4",
    purchaseItemId: "5",
    productName: "MacBook Pro 14\"",
    productCategory: "Electronics",
    startDate: "2023-11-28",
    endDate: "2026-11-28",
    durationMonths: 36,
    provider: "AppleCare+",
    warrantyNumber: "APP-2023-98765",
    notes: "Includes accidental damage coverage",
    remindersEnabled: true,
    reminderDays: [60, 30, 14],
    createdAt: "2023-11-28T11:00:00Z",
  },
];

export function WarrantyDashboard() {
  const [warranties] = useState(mockWarranties);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("all");

  const filteredWarranties = warranties.filter((warranty) => {
    const matchesSearch = warranty.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const daysUntil = getDaysUntil(warranty.endDate);
    
    if (filter === "active" && daysUntil > 30) return matchesSearch;
    if (filter === "expiring" && daysUntil <= 30 && daysUntil > 0) return matchesSearch;
    if (filter === "expired" && daysUntil <= 0) return matchesSearch;
    return matchesSearch;
  });

  const stats = {
    total: warranties.length,
    active: warranties.filter((w) => getDaysUntil(w.endDate) > 30).length,
    expiringSoon: warranties.filter((w) => isExpiringSoon(w.endDate, 30) && getDaysUntil(w.endDate) > 0).length,
    expired: warranties.filter((w) => getDaysUntil(w.endDate) <= 0).length,
  };

  const getWarrantyStatus = (endDate: string) => {
    const daysUntil = getDaysUntil(endDate);
    if (daysUntil <= 0) return { label: "Expired", color: "danger", icon: <XCircle className="w-4 h-4" /> };
    if (daysUntil <= 30) return { label: "Expiring Soon", color: "warning", icon: <AlertTriangle className="w-4 h-4" /> };
    return { label: "Active", color: "success", icon: <CheckCircle className="w-4 h-4" /> };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warranty Tracking</h1>
          <p className="text-gray-500">Track warranties and get reminders before expiry</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warranty
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Warranties</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
              <p className="text-sm text-gray-500">Expiring Soon</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              <p className="text-sm text-gray-500">Expired</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search warranties..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            {(["all", "active", "expiring", "expired"] as const).map((f) => (
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

      {/* Warranty List */}
      <div className="space-y-4">
        {filteredWarranties.map((warranty) => {
          const status = getWarrantyStatus(warranty.endDate);
          const daysLeft = getDaysUntil(warranty.endDate);
          
          return (
            <Card key={warranty.id} hover className="group">
              <div className="flex items-start gap-4">
                {/* Product Icon */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-gray-400" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{warranty.productName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="gray" size="sm">{warranty.productCategory}</Badge>
                        {warranty.provider && (
                          <span className="text-sm text-gray-500">{warranty.provider}</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={status.color as any}
                      size="sm"
                    >
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                  </div>

                  {/* Warranty Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(warranty.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">{formatDate(warranty.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{warranty.durationMonths} months</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time Left</p>
                      <p className={cn(
                        "font-medium",
                        daysLeft <= 0 ? "text-red-600" : daysLeft <= 30 ? "text-orange-600" : "text-green-600"
                      )}>
                        {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
                      </p>
                    </div>
                  </div>

                  {/* Reminders */}
                  {warranty.remindersEnabled && (
                    <div className="flex items-center gap-2 mt-4">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Reminders: {warranty.reminderDays.map((d) => `${d}d before`).join(", ")}
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

        {filteredWarranties.length === 0 && (
          <Card className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warranties found</h3>
            <p className="text-gray-500 mb-4">Add warranties to track product guarantees</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Warranty
            </Button>
          </Card>
        )}
      </div>

      {/* Add Warranty Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Warranty"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Product Name" placeholder="e.g., iPhone 15 Pro" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Start Date" />
            <Input type="date" label="End Date" />
          </div>
          <Input label="Warranty Provider (optional)" placeholder="e.g., AppleCare+" />
          <Input label="Warranty Number (optional)" placeholder="e.g., APP-2024-12345" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="reminders" className="rounded" />
            <label htmlFor="reminders" className="text-sm text-gray-600">Enable expiry reminders</label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button>Save Warranty</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}
