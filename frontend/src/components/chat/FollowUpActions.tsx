"use client";

interface FollowUpActionsProps {
  onAction: (actionId: string) => void;
  onNewChat: () => void;
  type?: "success" | "cancel";
}

const successOptions = [
  { num: 1, id: "add_expense", label: "Add Another Expense" },
  { num: 2, id: "add_purchase", label: "Add Purchase Item" },
  { num: 3, id: "upload_receipt", label: "Upload Receipt" },
  { num: 4, id: "generate_report", label: "Generate Report" },
  { num: 5, id: "main", label: "Go to Main Options" },
];

const cancelOptions = [
  { num: 1, id: "add_expense", label: "Add Expense" },
  { num: 2, id: "add_purchase", label: "Add Purchase Item" },
  { num: 3, id: "upload_receipt", label: "Upload Receipt" },
  { num: 4, id: "create_event", label: "Create Event" },
  { num: 5, id: "main", label: "Go to Main Options" },
];

export function FollowUpActions({ onAction, onNewChat, type = "success" }: FollowUpActionsProps) {
  const options = type === "success" ? successOptions : cancelOptions;

  return (
    <div className="ml-11 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
      <p className="text-xs text-gray-500 font-medium">What would you like to do next?</p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => opt.id === "main" ? onNewChat() : onAction(opt.id)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors group"
          >
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 group-hover:bg-green-200">
              {opt.num}
            </span>
            <span className="text-gray-700 font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400">Type a number to select, or type your own request.</p>
    </div>
  );
}
