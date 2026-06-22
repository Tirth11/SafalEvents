"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
import type { ExpenseCategory } from "@/types";
import {
  Sparkles,
  Receipt,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Film,
  Heart,
  GraduationCap,
  Plane,
  User,
  Gift,
  Briefcase,
  Circle,
  Utensils,
  Bus,
} from "lucide-react";

const categoryOptions = [
  { value: "food_groceries", label: "Food & Groceries", icon: ShoppingCart },
  { value: "food_dining", label: "Food & Dining", icon: Utensils },
  { value: "transportation", label: "Transportation", icon: Bus },
  { value: "vehicle", label: "Vehicle", icon: Car },
  { value: "utilities", label: "Utilities", icon: Zap },
  { value: "entertainment", label: "Entertainment", icon: Film },
  { value: "shopping", label: "Shopping", icon: ShoppingCart },
  { value: "healthcare", label: "Healthcare", icon: Heart },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "personal", label: "Personal", icon: User },
  { value: "home", label: "Home", icon: Home },
  { value: "gifts", label: "Gifts", icon: Gift },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "other", label: "Other", icon: Circle },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

interface ExpenseFormProps {
  initialData?: Partial<{
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    paymentMethod: string;
    tags: string[];
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ initialData, onSuccess, onCancel }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(!initialData);
  const [aiPrompt, setAiPrompt] = useState("");
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    subcategory: "",
    description: initialData?.description || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    paymentMethod: initialData?.paymentMethod || "",
    tags: initialData?.tags?.join(", ") || "",
  });

  const handleAISubmit = () => {
    // Simulate AI extraction
    const amountMatch = aiPrompt.match(/₹?\$?(\d+[\d,]*)/);
    if (amountMatch) {
      setFormData((prev) => ({
        ...prev,
        amount: amountMatch[1].replace(/,/g, ""),
        description: aiPrompt,
      }));
    }
    setShowAIPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      {/* AI Quick Add */}
      {showAIPrompt ? (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Quick Add with AI</h3>
              <p className="text-sm text-gray-500">
                Describe your expense and let AI fill the details
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., ₹500 for groceries from Whole Foods"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAISubmit}>Process</Button>
          </div>
          <button
            onClick={() => setShowAIPrompt(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mt-3"
          >
            Or enter details manually ↓
          </button>
        </Card>
      ) : (
        <button
          onClick={() => setShowAIPrompt(true)}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
        >
          <Sparkles className="w-4 h-4" />
          Use AI Quick Add
        </button>
      )}

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <Input
          type="number"
          label="Amount"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          suffix={<span className="text-gray-500">USD</span>}
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {categoryOptions.slice(0, 10).map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: cat.value as ExpenseCategory })
                  }
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center">
                    {cat.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
          <Select
            options={categoryOptions}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as ExpenseCategory })
            }
            placeholder="Select category"
            className="mt-2"
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="What was this expense for?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          required
        />

        {/* Date and Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            options={paymentMethods}
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            placeholder="Select method"
          />
        </div>

        {/* Tags */}
        <Input
          label="Tags (optional)"
          placeholder="e.g., monthly, essential, work"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />

        {/* Summary */}
        {formData.amount && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Expense Summary</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(parseFloat(formData.amount) || 0)} for{" "}
              {formData.description || "expense"}
            </p>
            <p className="text-xs text-gray-400 mt-1">~2 AI credits will be used</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={isLoading}>
            Add Expense
          </Button>
        </div>
      </form>
    </div>
  );
}
