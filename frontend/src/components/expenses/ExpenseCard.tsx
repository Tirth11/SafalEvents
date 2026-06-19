"use client";

import { cn, formatCurrency, formatDate, getCategoryColor, capitalize } from "@/lib/utils";
import { Card, Badge, Avatar } from "@/components/ui";
import type { Expense } from "@/types";
import {
  MoreVertical,
  Edit,
  Trash2,
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

const categoryIcons: Record<string, React.ReactNode> = {
  food_groceries: <ShoppingCart className="w-5 h-5" />,
  food_dining: <Utensils className="w-5 h-5" />,
  transportation: <Bus className="w-5 h-5" />,
  vehicle: <Car className="w-5 h-5" />,
  utilities: <Zap className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  shopping: <ShoppingCart className="w-5 h-5" />,
  healthcare: <Heart className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  personal: <User className="w-5 h-5" />,
  home: <Home className="w-5 h-5" />,
  gifts: <Gift className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  other: <Circle className="w-5 h-5" />,
};

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const icon = categoryIcons[expense.category] || <Circle className="w-5 h-5" />;
  const categoryLabel = expense.category.replace(/_/g, " ");

  return (
    <Card hover className="group">
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            getCategoryColor(expense.category)
          )}
        >
          {icon}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                {expense.description}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gray" size="sm">
                  {categoryLabel}
                </Badge>
                {expense.subcategory && (
                  <span className="text-xs text-gray-500">
                    • {expense.subcategory}
                  </span>
                )}
                {expense.paymentMethod && (
                  <span className="text-xs text-gray-400">
                    • {capitalize(expense.paymentMethod)}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {expense.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
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
