"use client";

import { cn, formatCurrency, formatDate, getDaysUntil, isExpiringSoon } from "@/lib/utils";
import { Card, Badge, Avatar } from "@/components/ui";
import type { PurchaseItem } from "@/types";
import {
  MoreVertical,
  Edit,
  Trash2,
  ShoppingCart,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface PurchaseCardProps {
  purchase: PurchaseItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PurchaseCard({ purchase, onEdit, onDelete }: PurchaseCardProps) {
  // Calculate warranty status
  const warrantyActive = purchase.warranty
    ? getDaysUntil(purchase.warranty.endDate) > 0
    : false;
  const warrantyExpiringSoon = purchase.warranty
    ? isExpiringSoon(purchase.warranty.endDate, 30)
    : false;

  return (
    <Card hover className="group">
      <div className="flex items-start gap-4">
        {/* Product Image Placeholder */}
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{purchase.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {purchase.brand && (
                  <span className="text-sm text-gray-500">{purchase.brand}</span>
                )}
                <Badge variant="gray" size="sm">
                  {purchase.category}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(purchase.price)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(purchase.purchaseDate)}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {purchase.store && (
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                {purchase.store}
              </div>
            )}
            {purchase.quantity > 1 && (
              <div className="flex items-center gap-1">
                Qty: {purchase.quantity}
              </div>
            )}
          </div>

          {/* Warranty Status */}
          {purchase.warranty ? (
            <div
              className={cn(
                "flex items-center gap-2 mt-3 px-3 py-2 rounded-lg",
                warrantyExpiringSoon
                  ? "bg-orange-50"
                  : warrantyActive
                  ? "bg-green-50"
                  : "bg-gray-50"
              )}
            >
              {warrantyActive ? (
                warrantyExpiringSoon ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      Warranty expires in {getDaysUntil(purchase.warranty.endDate)} days
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Warranty active until {formatDate(purchase.warranty.endDate)}
                    </span>
                  </>
                )
              ) : (
                <>
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Warranty expired</span>
                </>
              )}
            </div>
          ) : (
            <button className="flex items-center gap-2 mt-3 text-sm text-primary-600 hover:text-primary-700">
              <Calendar className="w-4 h-4" />
              Add warranty details
            </button>
          )}

          {/* Notes */}
          {purchase.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {purchase.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
