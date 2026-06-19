"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
import { Sparkles, Upload, Receipt, Calendar, FileText } from "lucide-react";

interface PurchaseFormProps {
  initialData?: Partial<{
    name: string;
    brand: string;
    category: string;
    price: number;
    purchaseDate: string;
    store: string;
    notes: string;
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home_appliances", label: "Home Appliances" },
  { value: "furniture", label: "Furniture" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "books", label: "Books" },
  { value: "vehicles", label: "Vehicles" },
  { value: "other", label: "Other" },
];

export function PurchaseForm({ initialData, onSuccess, onCancel }: PurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showWarrantyFields, setShowWarrantyFields] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    price: initialData?.price?.toString() || "",
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split("T")[0],
    store: initialData?.store || "",
    quantity: "1",
    notes: initialData?.notes || "",
    warrantyStartDate: "",
    warrantyDuration: "12",
  });

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
      {/* Upload Receipt Option */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Upload Receipt</h3>
            <p className="text-sm text-gray-500">
              Let AI extract purchase details from your receipt
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors">
            <Receipt className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-500">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, or PDF (5 credits)</p>
            <input type="file" className="hidden" accept="image/*,.pdf" />
          </label>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">or enter manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="e.g., iPhone 15 Pro"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="col-span-2"
          />
          <Input
            label="Brand (optional)"
            placeholder="e.g., Apple"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Select category"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Price"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Input
            type="date"
            label="Purchase Date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Store (optional)"
            placeholder="e.g., Amazon, Best Buy"
            value={formData.store}
            onChange={(e) => setFormData({ ...formData, store: e.target.value })}
          />
          <Input
            type="number"
            label="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            min="1"
          />
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />

        {/* Warranty Section */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowWarrantyFields(!showWarrantyFields)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <Calendar className="w-4 h-4" />
            {showWarrantyFields ? "Hide warranty details" : "Add warranty details"}
          </button>

          {showWarrantyFields && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <p className="text-sm text-gray-500">
                Track warranty period and get reminders before expiry
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Warranty Start Date"
                  value={formData.warrantyStartDate}
                  onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                />
                <Select
                  label="Warranty Duration"
                  options={[
                    { value: "6", label: "6 months" },
                    { value: "12", label: "1 year" },
                    { value: "24", label: "2 years" },
                    { value: "36", label: "3 years" },
                    { value: "60", label: "5 years" },
                  ]}
                  value={formData.warrantyDuration}
                  onChange={(e) => setFormData({ ...formData, warrantyDuration: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {formData.name && formData.price && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Purchase Summary</p>
            <p className="text-lg font-semibold text-gray-900">
              {formData.name} - {formatCurrency(parseFloat(formData.price) || 0)}
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
            Add Purchase
          </Button>
        </div>
      </form>
    </div>
  );
}
