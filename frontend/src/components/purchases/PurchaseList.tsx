"use client";

import { useState } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button, Input, Select, Card, Badge, Modal } from "@/components/ui";
import type { PurchaseItem } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Download,
  ShoppingCart,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PurchaseCard } from "./PurchaseCard";
import { PurchaseForm } from "./PurchaseForm";

// Mock data
const mockPurchases: PurchaseItem[] = [
  {
    id: "1",
    userId: "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "Electronics",
    price: 1199,
    currency: "USD",
    purchaseDate: "2024-01-15",
    store: "Apple Store",
    quantity: 1,
    notes: "Bought during January sale",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    name: "Samsung 55\" Smart TV",
    brand: "Samsung",
    category: "Electronics",
    price: 899,
    currency: "USD",
    purchaseDate: "2023-12-20",
    store: "Best Buy",
    quantity: 1,
    notes: "Living room TV",
    createdAt: "2023-12-20T14:30:00Z",
    updatedAt: "2023-12-20T14:30:00Z",
  },
  {
    id: "3",
    userId: "1",
    name: "Sony WH-1000XM5 Headphones",
    brand: "Sony",
    category: "Electronics",
    price: 349,
    currency: "USD",
    purchaseDate: "2024-02-10",
    store: "Amazon",
    quantity: 1,
    createdAt: "2024-02-10T09:15:00Z",
    updatedAt: "2024-02-10T09:15:00Z",
  },
  {
    id: "4",
    userId: "1",
    name: "Nike Air Max Sneakers",
    brand: "Nike",
    category: "Fashion",
    price: 180,
    currency: "USD",
    purchaseDate: "2024-03-05",
    store: "Nike Store",
    quantity: 1,
    createdAt: "2024-03-05T16:45:00Z",
    updatedAt: "2024-03-05T16:45:00Z",
  },
  {
    id: "5",
    userId: "1",
    name: "MacBook Pro 14\"",
    brand: "Apple",
    category: "Electronics",
    price: 2499,
    currency: "USD",
    purchaseDate: "2023-11-28",
    store: "Apple Store",
    quantity: 1,
    notes: "Work laptop",
    createdAt: "2023-11-28T11:00:00Z",
    updatedAt: "2023-11-28T11:00:00Z",
  },
];

export function PurchaseList() {
  const [purchases] = useState<PurchaseItem[]>(mockPurchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = purchases.reduce((sum, p) => sum + p.price, 0);

  const stats = [
    {
      id: "total_items",
      label: "Total Items",
      value: purchases.length,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "total_value",
      label: "Total Value",
      value: formatCurrency(totalValue),
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "warranties_active",
      label: "Active Warranties",
      value: 4,
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "expiring_soon",
      label: "Expiring Soon",
      value: 1,
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-500">Track your purchased items and warranties</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Purchase
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id}>
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search purchases..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Purchase List */}
      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <PurchaseCard key={purchase.id} purchase={purchase} />
        ))}

        {filteredPurchases.length === 0 && (
          <Card className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "Add your first purchase to get started"}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase
            </Button>
          </Card>
        )}
      </div>

      {/* Add Purchase Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Purchase"
        description="Enter purchase details or upload a receipt"
        size="lg"
      >
        <PurchaseForm
          onSuccess={() => setShowAddModal(false)}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
