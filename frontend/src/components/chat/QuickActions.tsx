"use client";

import {
  PlusCircle,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  Clock,
  BarChart3,
  Calendar,
  Users,
  Wallet,
  FolderOpen,
  PartyPopper,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "add_expense",
    label: "Add Expense",
    icon: <PlusCircle className="w-5 h-5" />,
    color: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
  },
  {
    id: "add_purchase",
    label: "Add Purchase Item",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
  },
  {
    id: "upload_receipt",
    label: "Upload Bill / Receipt",
    icon: <Receipt className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "create_budget",
    label: "Create Budget",
    icon: <Wallet className="w-5 h-5" />,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
  },
  {
    id: "create_outlay",
    label: "Create Outlay",
    icon: <FolderOpen className="w-5 h-5" />,
    color: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
  },
  {
    id: "create_event",
    label: "Create Event",
    icon: <PartyPopper className="w-5 h-5" />,
    color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100",
  },
  {
    id: "add_event_expense",
    label: "Add Event Expense",
    icon: <Calendar className="w-5 h-5" />,
    color: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100",
  },
  {
    id: "track_warranty",
    label: "Track Warranty",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
  },
  {
    id: "add_expiry",
    label: "Add Expiry Reminder",
    icon: <Clock className="w-5 h-5" />,
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
  },
  {
    id: "generate_report",
    label: "Generate Report",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
  },
  {
    id: "family_expense",
    label: "Family / Shared Expense",
    icon: <Users className="w-5 h-5" />,
    color: "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100",
  },
];

interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${action.color}`}
        >
          {action.icon}
          <span className="text-xs font-medium text-center leading-tight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
