"use client";

import { useState } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button, Input, Select, Card, Badge, Modal } from "@/components/ui";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseStats } from "./ExpenseStats";
import type { Expense, ExpenseCategory } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Mock data
const mockExpenses: Expense[] = [
  {
    id: "1",
    userId: "1",
    amount: 1500,
    currency: "USD",
    category: "food_groceries",
    subcategory: "Groceries",
    description: "Weekly groceries from Whole Foods",
    date: "2026-05-29",
    paymentMethod: "card",
    tags: ["weekly", "essential"],
    createdAt: "2026-05-29T10:30:00Z",
    updatedAt: "2026-05-29T10:30:00Z",
  },
  {
    id: "2",
    userId: "1",
    amount: 850,
    currency: "USD",
    category: "transportation",
    subcategory: "Fuel",
    description: "Gas station fill-up",
    date: "2026-05-28",
    paymentMethod: "card",
    tags: ["car", "fuel"],
    createdAt: "2026-05-28T15:45:00Z",
    updatedAt: "2026-05-28T15:45:00Z",
  },
  {
    id: "3",
    userId: "1",
    amount: 3200,
    currency: "USD",
    category: "shopping",
    subcategory: "Electronics",
    description: "New headphones",
    date: "2026-05-27",
    paymentMethod: "upi",
    createdAt: "2026-05-27T11:20:00Z",
    updatedAt: "2026-05-27T11:20:00Z",
  },
  {
    id: "4",
    userId: "1",
    amount: 450,
    currency: "USD",
    category: "food_dining",
    subcategory: "Restaurant",
    description: "Dinner at Italian restaurant",
    date: "2026-05-26",
    paymentMethod: "card",
    familyMemberId: "fm1",
    createdAt: "2026-05-26T19:30:00Z",
    updatedAt: "2026-05-26T19:30:00Z",
  },
  {
    id: "5",
    userId: "1",
    amount: 1200,
    currency: "USD",
    category: "utilities",
    subcategory: "Electricity",
    description: "Monthly electricity bill",
    date: "2026-05-25",
    paymentMethod: "bank_transfer",
    createdAt: "2026-05-25T09:00:00Z",
    updatedAt: "2026-05-25T09:00:00Z",
  },
];

const categories = [
  { value: "", label: "All Categories" },
  { value: "food_groceries", label: "Food & Groceries" },
  { value: "food_dining", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "vehicle", label: "Vehicle" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "travel", label: "Travel" },
  { value: "personal", label: "Personal" },
  { value: "home", label: "Home" },
  { value: "gifts", label: "Gifts" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

export function ExpenseList() {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500">Track and manage your spending</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats */}
      <ExpenseStats expenses={expenses} />

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              icon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="Category"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <Input
              type="date"
              placeholder="To"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </p>
        <p className="text-lg font-semibold text-gray-900">
          Total: {formatCurrency(totalAmount)}
        </p>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}

        {filteredExpenses.length === 0 && (
          <Card className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory
                ? "Try adjusting your filters"
                : "Add your first expense to get started"}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Card>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Expense"
        description="Enter expense details manually or let AI help"
        size="lg"
      >
        <ExpenseForm
          onSuccess={() => setShowAddModal(false)}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
