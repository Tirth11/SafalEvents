"use client";

import { useState, useCallback } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Card, Badge } from "@/components/ui";
import { Upload, Receipt, FileText, Image as ImageIcon, X, CheckCircle, Loader2 } from "lucide-react";

interface ReceiptUploadProps {
  onUpload?: (file: File) => void;
}

export function ReceiptUpload({ onUpload }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      setProcessedData({
        storeName: "Whole Foods Market",
        billNumber: "WF-2024-0529",
        date: "2026-05-29",
        totalAmount: 156.78,
        tax: 12.54,
        items: [
          { name: "Organic Bananas", quantity: 1, price: 2.99 },
          { name: "Almond Milk", quantity: 2, price: 5.99 },
          { name: "Fresh Bread", quantity: 1, price: 4.50 },
          { name: "Organic Eggs", quantity: 1, price: 6.99 },
        ],
        category: "food_groceries",
        paymentMethod: "card",
        confidence: 95,
      });
      setIsProcessing(false);
    }, 2000);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setProcessedData(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
            isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Receipt or Bill
            </h3>
            <p className="text-gray-500 mb-4 max-w-md">
              Drag and drop your receipt image or PDF here, or click to browse.
              AI will automatically extract all details.
            </p>
            <div className="flex items-center gap-4">
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </label>
              <Button variant="outline">
                <ImageIcon className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Supports: JPG, PNG, PDF • Max 10MB • Uses 5 credits
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Uploaded File Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Uploaded File</h3>
              <button
                onClick={clearUpload}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
              {uploadedFile.type.startsWith("image/") ? (
                <ImageIcon className="w-16 h-16 text-gray-300" />
              ) : (
                <FileText className="w-16 h-16 text-gray-300" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2 truncate">
              {uploadedFile.name}
            </p>
          </Card>

          {/* OCR Results */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Extracted Data</h3>
              {isProcessing ? (
                <Badge variant="gray">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Processing...
                </Badge>
              ) : (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {processedData?.confidence}% Confidence
                </Badge>
              )}
            </div>

            {isProcessing ? (
              <div className="py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">AI is reading your receipt...</p>
              </div>
            ) : processedData ? (
              <div className="space-y-4">
                {/* Store Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Store</p>
                  <p className="font-semibold text-gray-900">{processedData.storeName}</p>
                  <p className="text-xs text-gray-400">Bill #{processedData.billNumber}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                  <div className="space-y-2">
                    {processedData.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-gray-900">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(processedData.totalAmount - processedData.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(processedData.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(processedData.totalAmount)}</span>
                  </div>
                </div>

                {/* Detected Category */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <Badge variant="primary">
                    {processedData.category.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    Edit Details
                  </Button>
                  <Button className="flex-1">
                    Save as Expense
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}
