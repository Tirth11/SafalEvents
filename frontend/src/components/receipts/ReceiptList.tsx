"use client";

import { useState } from "react";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { Button, Input, Card, Badge } from "@/components/ui";
import { ReceiptUpload } from "./ReceiptUpload";
import type { Receipt as ReceiptType } from "@/types";
import {
  Plus,
  Search,
  Receipt as ReceiptIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
} from "lucide-react";

// Mock data
const mockReceipts: ReceiptType[] = [
  {
    id: "1",
    userId: "1",
    imageUrl: "/receipts/receipt1.jpg",
    ocrData: {
      storeName: "Whole Foods Market",
      billNumber: "WF-2024-0529",
      date: "2026-05-29",
      totalAmount: 156.78,
      tax: 12.54,
      items: [
        { name: "Organic Bananas", quantity: 1, price: 2.99 },
        { name: "Almond Milk", quantity: 2, price: 5.99 },
      ],
      category: "food_groceries",
      confidence: 95,
    },
    status: "processed",
    createdAt: "2026-05-29T10:30:00Z",
  },
  {
    id: "2",
    userId: "1",
    imageUrl: "/receipts/receipt2.jpg",
    ocrData: {
      storeName: "Shell Gas Station",
      billNumber: "SHELL-88234",
      date: "2026-05-28",
      totalAmount: 45.50,
      category: "vehicle",
      confidence: 92,
    },
    status: "processed",
    linkedExpenseId: "exp-2",
    createdAt: "2026-05-28T15:45:00Z",
  },
  {
    id: "3",
    userId: "1",
    imageUrl: "/receipts/receipt3.jpg",
    status: "pending",
    createdAt: "2026-05-27T09:00:00Z",
  },
];

export function ReceiptList() {
  const [receipts] = useState<ReceiptType[]>(mockReceipts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.ocrData?.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    processed: <CheckCircle className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500">Scan and manage your receipts with AI</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          <Plus className="w-4 h-4 mr-2" />
          {showUpload ? "View Receipts" : "Upload Receipt"}
        </Button>
      </div>

      {/* Upload View */}
      {showUpload ? (
        <ReceiptUpload />
      ) : (
        <>
          {/* Search */}
          <Card>
            <Input
              placeholder="Search receipts by store name..."
              icon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>

          {/* Receipt Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} hover className="overflow-hidden">
                {/* Image Placeholder */}
                <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center relative">
                  <ReceiptIcon className="w-12 h-12 text-gray-300" />
                  <Badge
                    variant={
                      receipt.status === "processed"
                        ? "success"
                        : receipt.status === "failed"
                        ? "danger"
                        : "warning"
                    }
                    className="absolute top-2 right-2"
                  >
                    {statusIcons[receipt.status]}
                    <span className="ml-1 capitalize">{receipt.status}</span>
                  </Badge>
                </div>

                {/* Details */}
                <div className="p-4 pt-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {receipt.ocrData?.storeName || "Processing..."}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {receipt.ocrData?.date
                          ? formatDate(receipt.ocrData.date)
                          : formatRelativeTime(receipt.createdAt)}
                      </p>
                    </div>
                    {receipt.ocrData?.totalAmount && (
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(receipt.ocrData.totalAmount)}
                      </p>
                    )}
                  </div>

                  {receipt.ocrData?.confidence && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {receipt.ocrData.confidence}% confidence
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredReceipts.length === 0 && (
            <Card className="text-center py-12">
              <ReceiptIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
              <p className="text-gray-500 mb-4">Upload your first receipt to get started</p>
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Receipt
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
