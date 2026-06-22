"use client";

import {
  PlusCircle,
  ShoppingCart,
  Receipt,
  Wallet,
  FolderOpen,
  PartyPopper,
  ShieldCheck,
  Clock,
  BarChart3,
} from "lucide-react";

interface TopActionsProps {
  onAction: (actionId: string) => void;
}

const actions = [
  { id: "add_expense", label: "Add Expense", icon: PlusCircle },
  { id: "add_purchase", label: "Add Purchase", icon: ShoppingCart },
  { id: "upload_receipt", label: "Upload Bill", icon: Receipt },
  { id: "create_budget", label: "Budget", icon: Wallet },
  { id: "create_outlay", label: "Outlay", icon: FolderOpen },
  { id: "create_event", label: "Event", icon: PartyPopper },
  { id: "track_warranty", label: "Warranty", icon: ShieldCheck },
  { id: "add_expiry", label: "Expiry", icon: Clock },
  { id: "generate_report", label: "Report", icon: BarChart3 },
];

export function TopActions({ onAction }: TopActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all whitespace-nowrap flex-shrink-0"
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
