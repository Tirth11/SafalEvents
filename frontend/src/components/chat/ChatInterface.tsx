"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AIGreeting } from "./AIGreeting";
import { PreviewCard } from "./PreviewCard";
import { TopActions } from "./TopActions";
import { FollowUpActions } from "./FollowUpActions";
import { useAuthStore, useChatStore } from "@/lib/store";
import type { ChatMessage as ChatMessageType } from "@/types";
import { generateId } from "@/lib/utils";
import { Shield } from "lucide-react";

const categoryMap: Record<string, { category: string; subcategory: string }> = {
  car: { category: "Vehicle / Automobile", subcategory: "Car Repair" },
  petrol: { category: "Vehicle / Automobile", subcategory: "Fuel" },
  fuel: { category: "Vehicle / Automobile", subcategory: "Fuel" },
  grocery: { category: "Daily Needs", subcategory: "Grocery" },
  groceries: { category: "Daily Needs", subcategory: "Grocery" },
  milk: { category: "Daily Needs", subcategory: "Grocery" },
  food: { category: "Food & Dining", subcategory: "Restaurant" },
  restaurant: { category: "Food & Dining", subcategory: "Restaurant" },
  dinner: { category: "Food & Dining", subcategory: "Restaurant" },
  catering: { category: "Food & Dining", subcategory: "Catering" },
  medicine: { category: "Healthcare", subcategory: "Medicine" },
  rent: { category: "Home / Housing", subcategory: "Rent" },
  electricity: { category: "Utilities", subcategory: "Electricity" },
  laptop: { category: "Electronics", subcategory: "Computer" },
  phone: { category: "Electronics", subcategory: "Mobile" },
  headphones: { category: "Electronics", subcategory: "Audio" },
  fridge: { category: "Home Appliances", subcategory: "Refrigerator" },
  paint: { category: "Home / Office", subcategory: "Repair" },
  hotel: { category: "Travel", subcategory: "Accommodation" },
  flight: { category: "Travel", subcategory: "Flight" },
};

const onlineStores = ["amazon", "flipkart", "myntra", "swiggy", "zomato"];
const inStoreShops = ["kroger", "walmart", "croma", "dmart", "costco"];


interface PendingRecord {
  type: "expense" | "purchase" | "budget" | "outlay" | "event";
  fields: Record<string, string>;
}

// Numbered option context - tracks what the current active options are
interface NumberedOptions {
  options: { num: number; id: string; label: string }[];
  context: string; // what these options are for
}

const guidedResponses: Record<string, string> = {
  add_expense: "Sure. Tell me the expense in one line.\n\nFor example: \"₹10,000 car repair today\" or \"Add $500 grocery expense.\"",
  add_purchase: "Sure. Tell me what you purchased in one line.\n\nFor example: \"Bought milk for ₹20 from Kroger, expiry tomorrow.\"",
  upload_receipt: "Please upload your bill or receipt using the attachment button below.",
  create_budget: "Sure. Tell me the budget details.\n\nFor example: \"Create a 2026 yearly budget of $12,000 split monthly.\"",
  create_outlay: "Sure. Tell me the outlay details.\n\nFor example: \"Create outlay for Office Renovation from 1 June to 30 June with $5,000 budget.\"",
  create_event: "Sure. Tell me the event details.\n\nFor example: \"Create event called Birthday Party on 10 July with budget $2,000.\"",
  add_event_expense: "Sure. Tell me the event expense.\n\nFor example: \"Add $300 catering expense to Birthday Party.\"",
  track_warranty: "Tell me the product name, purchase date, and warranty period.",
  add_expiry: "Tell me the item name and expiry date.",
  generate_report: "What report would you like?\n\n1. Monthly expense report\n2. Category-wise spending\n3. Budget vs actual\n4. Event expense report\n\nType a number or describe what you need.",
  family_expense: "Tell me the family member name and expense details.",
};

const actionLabels: Record<string, string> = {
  add_expense: "Add Expense",
  add_purchase: "Add Purchase Item",
  upload_receipt: "Upload Bill / Receipt",
  create_budget: "Create Budget",
  create_outlay: "Create Outlay",
  create_event: "Create Event",
  add_event_expense: "Add Event Expense",
  track_warranty: "Track Warranty",
  add_expiry: "Add Expiry Reminder",
  generate_report: "Generate Report",
  family_expense: "Family / Shared Expense",
};

const DEFAULT_TOKEN_BALANCE = 120;

const estimateTokens = (prompt: string, attachments?: File[]) => {
  const clean = prompt.trim();
  const base = Math.max(1, Math.ceil(clean.length / 45));
  const fileTokens = attachments && attachments.length > 0 ? attachments.length * 4 : 0;
  const complexity = clean.length > 200 ? 2 : 0;
  const attachmentBoost = attachments && attachments.length > 0 ? 2 : 0;
  const input = Math.min(60, base + fileTokens + complexity + attachmentBoost);
  const output = input * 2 + 1;
  return { input, output, total: input + output };
};

const summarizePrompt = (prompt: string, attachments?: File[]) => {
  const clean = prompt.trim();
  const summary =
    clean.length > 120 ? `${clean.slice(0, 120)}...` : clean || "(No prompt)";
  if (!attachments || attachments.length === 0) return summary;
  return `${summary} • ${attachments.length} file${attachments.length > 1 ? "s" : ""} attached`;
};

const getTaskType = (prompt: string) => {
  const lower = prompt.toLowerCase();
  if (lower.includes("report")) return "Report generation";
  if (lower.includes("summarize") || lower.includes("summary")) return "Summary";
  if (lower.includes("expense") || lower.includes("purchase")) return "Record update";
  if (lower.includes("receipt") || lower.includes("upload")) return "File processing";
  return "Prompt task";
};

const improvePromptText = (prompt: string): string => {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  const base = trimmed.replace(/[.\s]+$/, "");
  return `Please ${base.charAt(0).toLowerCase()}${base.slice(
    1
  )}. Provide a clear result with a short summary, the key points, and any action items. Use simple language and keep it well structured.`;
};


export function ChatInterface() {
  const { user, addTokenHistory, applyTokenUsage } = useAuthStore();
  const { chats, activeChatId, addMessage, renameChat, isTyping, setTyping, createChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const confirmTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<PendingRecord | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpType, setFollowUpType] = useState<"success" | "cancel">("success");
  const [activeOptions, setActiveOptions] = useState<NumberedOptions | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<{
    text: string;
    attachments?: File[];
    modelLabel: string;
  } | null>(null);
  const [confirmMode, setConfirmMode] = useState<"review" | "edit" | null>(null);
  const [confirmDraft, setConfirmDraft] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);

  // Get messages for active chat
  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, pendingRecord, showFollowUp]);

  // Reset state when switching chats
  useEffect(() => {
    setPendingRecord(null);
    setShowFollowUp(false);
    setActiveOptions(null);
    setPendingPrompt(null);
    setConfirmMode(null);
    setConfirmDraft("");
    setSuggestedPrompt(null);
  }, [activeChatId]);

  const userName = user?.name || "User";
  const tokenBalance = user?.subscription?.creditsBalance ?? DEFAULT_TOKEN_BALANCE;

  // Auto-name the chat based on first meaningful action
  const autoNameChat = (text: string) => {
    if (!activeChatId) return;
    const currentChat = chats.find((c) => c.id === activeChatId);
    if (currentChat && currentChat.name === "New Chat") {
      const name = text.length > 25 ? text.slice(0, 25) + "..." : text;
      renameChat(activeChatId, name);
    }
  };


  // Helpers
  const autoCategory = (text: string) => {
    const lower = text.toLowerCase();
    for (const [keyword, cat] of Object.entries(categoryMap)) {
      if (lower.includes(keyword)) return cat;
    }
    return { category: "General", subcategory: "Other" };
  };
  const detectStoreType = (store: string) => {
    const lower = store.toLowerCase();
    if (onlineStores.some((s) => lower.includes(s))) return "Online";
    if (inStoreShops.some((s) => lower.includes(s))) return "In-store";
    return "Unknown";
  };
  const extractStore = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const store of [...onlineStores, ...inStoreShops]) {
      if (lower.includes(store)) return store.charAt(0).toUpperCase() + store.slice(1);
    }
    const m = text.match(/from\s+([A-Za-z\s]+?)(?:\s*[,.]|\s+for|\s+with|$)/i);
    return m ? m[1].trim() : null;
  };
  const extractDate = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("yesterday")) { const d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
    if (lower.includes("tomorrow")) { const d = new Date(); d.setDate(d.getDate() + 1); return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
    return "Today";
  };
  const extractWarranty = (text: string): string | null => {
    const m = text.match(/(\d+)\s*(year|month)s?\s*warranty/i);
    return m ? `${m[1]} ${m[2]}${parseInt(m[1]) > 1 ? "s" : ""}` : null;
  };
  const extractExpiry = (text: string): string | null => {
    if (text.toLowerCase().includes("expiry tomorrow") || text.toLowerCase().includes("expiring tomorrow")) {
      const d = new Date(); d.setDate(d.getDate() + 1); return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    }
    const m = text.match(/expir(?:y|ing|es?)\s+(?:on\s+)?(.+?)(?:\.|,|$)/i);
    return m ? m[1].trim() : null;
  };


  // Budget/Outlay/Event processors
  const processBudget = (text: string): PendingRecord | null => {
    const amountMatch = text.match(/[\$₹]?\s?(\d+[\d,]*)/);
    const yearMatch = text.match(/(20\d{2})/);
    if (!amountMatch) return null;
    const amount = parseInt(amountMatch[1].replace(/,/g, ""));
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    const monthly = text.toLowerCase().includes("monthly") || text.toLowerCase().includes("split");
    return { type: "budget", fields: { "Year": year, "Total Budget": `$${amount.toLocaleString()}`, "From Date": `01/01/${year}`, "To Date": `12/31/${year}`, "Monthly Allocation": monthly ? `$${Math.round(amount / 12).toLocaleString()} per month` : "Not set", "Status": "Active", "Restrict if Exceeded": "Not selected" } };
  };
  const processOutlay = (text: string): PendingRecord | null => {
    const amountMatch = text.match(/[\$₹]\s?(\d+[\d,]*)/);
    const nameMatch = text.match(/(?:outlay\s+(?:for|called|named)\s+)(.+?)(?:\s+from|\s+with|\s+budget|$)/i) || text.match(/(?:create\s+)(.+?)(?:\s+outlay)/i);
    const dateRange = text.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+with|\s+budget|$)/i);
    if (!amountMatch) return null;
    const amount = parseInt(amountMatch[1].replace(/,/g, ""));
    return { type: "outlay", fields: { "Outlay Name": nameMatch ? nameMatch[1].trim() : "Untitled", "Start Date": dateRange ? dateRange[1].trim() : "Not set", "End Date": dateRange ? dateRange[2].trim() : "Not set", "Budget": `$${amount.toLocaleString()}`, "Status": "Active", "Included in Budget": "Not selected" } };
  };
  const processEvent = (text: string): PendingRecord | null => {
    const amountMatch = text.match(/[\$₹]\s?(\d+[\d,]*)/);
    const nameMatch = text.match(/(?:event\s+(?:called|named|for)\s+)(.+?)(?:\s+on|\s+from|\s+with|\s+budget|$)/i) || text.match(/(?:create\s+)(.+?)(?:\s+event)/i);
    const dateMatch = text.match(/(?:on|from)\s+(\d{1,2}\s+\w+(?:\s+\d{4})?)/i);
    const name = nameMatch ? nameMatch[1].trim() : "";
    if (!name) return null;
    const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, "")) : 0;
    return { type: "event", fields: { "Event Name": name, "Event Date": dateMatch ? dateMatch[1].trim() : "Not set", "Budget": amount ? `$${amount.toLocaleString()}` : "Not set", "Status": "Active", "Description": `${name} event`, "Image": "Not added" } };
  };


  // Main processing function
  const processUserInput = (text: string): { response: string; record: PendingRecord | null } => {
    const lower = text.toLowerCase().trim();

    // Handle number-based selection
    if (activeOptions && /^\d+$/.test(lower)) {
      const num = parseInt(lower);
      const selected = activeOptions.options.find((o) => o.num === num);
      if (!selected) {
        return { response: `${num} is not available in this list. Please choose a number from 1 to ${activeOptions.options.length}.`, record: null };
      }
      setActiveOptions(null);
      // Handle follow-up number selections
      if (activeOptions.context === "follow_up") {
        if (selected.id === "main") {
          setShowFollowUp(false);
          return { response: "Sure! Here are the main options. You can also type your request directly.", record: null };
        }
        setShowFollowUp(false);
        return { response: guidedResponses[selected.id] || "How can I help?", record: null };
      }
      // Handle category selection
      if (activeOptions.context === "category" && pendingRecord) {
        const updated = { ...pendingRecord, fields: { ...pendingRecord.fields, "Category": selected.label } };
        setPendingRecord(updated);
        return { response: `Selected: ${selected.label}.\n\nI've updated the preview. You can say "Save it" to confirm or edit more details.`, record: updated };
      }
      // Handle report type
      if (activeOptions.context === "report_type") {
        return { response: `Selected: ${selected.label}.\n\nWhat time period? (e.g., this month, last 3 months, 2026)`, record: null };
      }
      // Generic selection
      return { response: `Selected: ${selected.label}.`, record: null };
    }

    // Handle pending record edits
    if (pendingRecord) {
      if (lower.includes("save") || lower.includes("confirm") || lower === "yes") {
        const saved = pendingRecord;
        setPendingRecord(null);
        setShowFollowUp(true);
        setFollowUpType("success");
        setActiveOptions({ context: "follow_up", options: [
          { num: 1, id: "add_expense", label: "Add Another Expense" },
          { num: 2, id: "add_purchase", label: "Add Purchase Item" },
          { num: 3, id: "upload_receipt", label: "Upload Receipt" },
          { num: 4, id: "generate_report", label: "Generate Report" },
          { num: 5, id: "main", label: "Go to Main Options" },
        ]});
        const label = saved.fields["Expense Name"] || saved.fields["Item Name"] || saved.fields["Event Name"] || saved.fields["Outlay Name"] || saved.fields["Year"] || "record";
        autoNameChat(label);
        return { response: `Done! Your ${saved.type} "${label}" has been saved successfully. ✅\n\nWhat would you like to do next?\n\n1. Add Another Expense\n2. Add Purchase Item\n3. Upload Receipt\n4. Generate Report\n5. Go to Main Options`, record: null };
      }
      if (lower.includes("cancel") || lower === "no") {
        setPendingRecord(null);
        setShowFollowUp(true);
        setFollowUpType("cancel");
        setActiveOptions({ context: "follow_up", options: [
          { num: 1, id: "add_expense", label: "Add Expense" },
          { num: 2, id: "add_purchase", label: "Add Purchase Item" },
          { num: 3, id: "upload_receipt", label: "Upload Receipt" },
          { num: 4, id: "create_event", label: "Create Event" },
          { num: 5, id: "main", label: "Go to Main Options" },
        ]});
        return { response: "No problem. I have cancelled this action. What would you like to do next?\n\n1. Add Expense\n2. Add Purchase Item\n3. Upload Receipt\n4. Create Event\n5. Go to Main Options", record: null };
      }
      // Edit commands
      const updated = { ...pendingRecord, fields: { ...pendingRecord.fields } };
      const amountChange = text.match(/(?:amount|price|budget)\s+(?:to\s+)?[\$₹]?(\d+[\d,]*)/i);
      if (amountChange) { const v = `$${parseInt(amountChange[1].replace(/,/g, "")).toLocaleString()}`; if (updated.fields["Amount"]) updated.fields["Amount"] = v; if (updated.fields["Price"]) updated.fields["Price"] = v; if (updated.fields["Total Budget"]) updated.fields["Total Budget"] = v; if (updated.fields["Budget"]) updated.fields["Budget"] = v; }
      if (lower.includes("date") && lower.includes("yesterday")) { const d = new Date(); d.setDate(d.getDate() - 1); const ds = d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); if (updated.fields["Date"]) updated.fields["Date"] = ds; }
      const catMatch = text.match(/category\s+(?:to\s+)?(.+?)(?:\.|$)/i);
      if (catMatch) updated.fields["Category"] = catMatch[1].trim();
      const storeMatch = text.match(/store\s+(?:name\s+)?(?:to\s+)?(.+?)(?:\.|$)/i);
      if (storeMatch) updated.fields["Store"] = storeMatch[1].trim();
      if (lower.includes("reimbursable")) updated.fields["Reimbursable"] = "Yes";
      if (lower.includes("restrict") && lower.includes("exceeded")) updated.fields["Restrict if Exceeded"] = "Yes";
      if (lower.includes("include") && lower.includes("budget")) updated.fields["Included in Budget"] = "Yes";
      if (lower.includes("split equally") || lower.includes("split monthly")) {
        const b = parseInt((updated.fields["Total Budget"] || updated.fields["Budget"] || "").replace(/[\$₹,\s]/g, "")) || 0;
        if (b) updated.fields["Monthly Allocation"] = `$${Math.round(b / 12).toLocaleString()} per month`;
      }
      setPendingRecord(updated);
      return { response: "Updated! Here's the revised preview:", record: updated };
    }


    // Detect intent for new records
    if (lower.includes("budget") && (lower.includes("create") || lower.includes("set"))) {
      const record = processBudget(text);
      if (record) { setPendingRecord(record); autoNameChat("Budget " + (record.fields["Year"] || "")); return { response: "I created a draft budget. Please review before saving:", record }; }
      return { response: "Sure. What total budget amount and year would you like to set?", record: null };
    }
    if (lower.includes("outlay") && (lower.includes("create") || lower.includes("set"))) {
      const record = processOutlay(text);
      if (record) { setPendingRecord(record); autoNameChat(record.fields["Outlay Name"]); return { response: "I created a draft outlay. Please check before saving:", record }; }
      return { response: "Sure. What budget and date range should I set for this outlay?", record: null };
    }
    if (lower.includes("event") && (lower.includes("create") || lower.includes("add"))) {
      if (lower.includes("expense")) {
        const amountMatch = text.match(/[\$₹]\s?(\d+[\d,]*)/);
        if (!amountMatch) return { response: "What amount should I add for this event expense?", record: null };
        const amount = parseInt(amountMatch[1].replace(/,/g, ""));
        const { category } = autoCategory(text);
        const eventMatch = text.match(/to\s+(.+?)(?:\.|$)/i);
        const desc = text.replace(/[\$₹]?\d+[\d,]*/g, "").replace(/\b(add|expense|to|event)\b/gi, "").replace(/\s+/g, " ").trim();
        const record: PendingRecord = { type: "expense", fields: { "Expense Name": (desc.charAt(0).toUpperCase() + desc.slice(1)) || category, "Amount": `$${amount.toLocaleString()}`, "Event": eventMatch ? eventMatch[1].trim() : "Not specified", "Category": category, "Date": "Today", "Purchased By": userName } };
        setPendingRecord(record);
        return { response: "I found these event expense details. Please check before I save:", record };
      }
      const record = processEvent(text);
      if (record) { setPendingRecord(record); autoNameChat(record.fields["Event Name"]); return { response: "I created a draft event. Please review before saving:", record }; }
      return { response: "Sure. What is the event name, date, and budget?", record: null };
    }

    // Expense / Purchase detection
    const amountMatch = text.match(/[\$₹]?\s?(\d+[\d,]*)/);
    if (!amountMatch) {
      if (lower.includes("expense") || lower.includes("spent") || lower.includes("paid")) return { response: "Sure. What amount should I add for this expense?", record: null };
      if (lower.includes("bought") || lower.includes("purchased") || lower.includes("purchase")) return { response: "Sure. What was the price for this purchase?", record: null };
      return { response: "I can help with that! Please provide more details including the amount.", record: null };
    }
    const amount = parseInt(amountMatch[1].replace(/,/g, ""));
    const isPurchase = lower.includes("bought") || lower.includes("purchased") || lower.includes("purchase") || lower.includes("expiry") || lower.includes("warranty");
    const { category, subcategory } = autoCategory(text);
    const store = extractStore(text);
    const date = extractDate(text);
    const warranty = extractWarranty(text);
    const expiry = extractExpiry(text);
    let description = text.replace(/[\$₹]?\s?\d+[\d,]*/g, "").replace(/\b(add|bought|purchased|expense|purchase|for|from|today|yesterday|tomorrow|with|item)\b/gi, "").replace(/\s+/g, " ").trim();
    if (!description || description.length < 2) description = category;

    if (!isPurchase) {
      const record: PendingRecord = { type: "expense", fields: { "Expense Name": description.charAt(0).toUpperCase() + description.slice(1), "Amount": `$${amount.toLocaleString()}`, "Date": date, "Category": category, "Subcategory": subcategory, "Store": store || "Not provided", "Purchased By": userName, "Reimbursable": "No", "Event / Outlay": "None" } };
      setPendingRecord(record);
      autoNameChat(record.fields["Expense Name"]);
      return { response: "I found these details. Please check before I save:", record };
    } else {
      const record: PendingRecord = { type: "purchase", fields: { "Item Name": description.charAt(0).toUpperCase() + description.slice(1), "Price": `$${amount.toLocaleString()}`, "Quantity": "1 Unit", "Store": store || "Not provided", "Store Type": store ? detectStoreType(store) : "Not provided", "Purchase Date": date, ...(expiry ? { "Expiry Date": expiry } : {}), "Category": category, "Subcategory": subcategory, ...(warranty ? { "Warranty": warranty } : {}), "Purchased By": userName } };
      setPendingRecord(record);
      autoNameChat(record.fields["Item Name"]);
      return { response: "I found these purchase details. Please check before I save:", record };
    }
  };


  const startPromptReview = (message: string, attachments?: File[]) => {
    const text = message.trim();
    if (!text && (!attachments || attachments.length === 0)) return;
    setPendingPrompt({
      text,
      attachments,
      modelLabel: "Safal-AI Auto",
    });
    setConfirmDraft(text);
    setSuggestedPrompt(null);
    setConfirmMode("review");
  };

  const executePrompt = async (
    message: string,
    attachments: File[] | undefined,
    tokensUsed: number,
    modelLabel: string,
    taskType: string
  ) => {
    if (isSending) return;
    setIsSending(true);
    setShowFollowUp(false);

    const userMsg: ChatMessageType = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
      attachments: attachments?.map((file) => ({
        id: generateId(),
        type: file.type.startsWith("image/") ? ("image" as const) : ("document" as const),
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    };
    addMessage(userMsg);
    setTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));

    try {
      const { response, record } = processUserInput(message);
      addMessage({
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      });
      if (record) setPendingRecord(record);

      applyTokenUsage(tokensUsed);
      addTokenHistory({
        id: generateId(),
        userId: user?.id || "user",
        amount: tokensUsed,
        type: "usage",
        action: taskType,
        description: `Prompt executed (${modelLabel})`,
        createdAt: new Date().toISOString(),
      });

      const remaining = Math.max(0, tokenBalance - tokensUsed);
      const estTokens = estimateTokens(message, attachments);
      addMessage({
        id: generateId(),
        role: "system",
        content: `Task completed successfully. (Model: ${modelLabel})`,
        timestamp: new Date().toISOString(),
        tokenUsage: {
          input: estTokens.input,
          output: estTokens.output,
          total: tokensUsed,
          remaining: remaining
        }
      });
    } catch {
      addMessage({
        id: generateId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTyping(false);
      setIsSending(false);
    }
  };

  const handleConfirmRun = async () => {
    if (!pendingPrompt) return;
    const finalText = confirmDraft.trim();
    const est = estimateTokens(finalText, pendingPrompt.attachments);
    const taskType = getTaskType(finalText);
    const modelLabel = pendingPrompt.modelLabel;
    const attachments = pendingPrompt.attachments;

    setConfirmMode(null);
    setPendingPrompt(null);
    setConfirmDraft("");
    setSuggestedPrompt(null);

    await executePrompt(finalText, attachments, est.total, modelLabel, taskType);
  };

  const handleModifyPrompt = () => {
    if (!pendingPrompt) return;
    setConfirmDraft(pendingPrompt.text);
    const suggestion = improvePromptText(pendingPrompt.text);
    setSuggestedPrompt(suggestion && suggestion !== pendingPrompt.text ? suggestion : null);
    setConfirmMode("edit");
  };

  const handleReviewUpdatedPrompt = () => {
    if (!pendingPrompt) return;
    setPendingPrompt({
      ...pendingPrompt,
      text: confirmDraft.trim(),
    });
    setConfirmMode("review");
  };

  const handleCancelPrompt = () => {
    setPendingPrompt(null);
    setConfirmMode(null);
    setConfirmDraft("");
    setSuggestedPrompt(null);
    addMessage({
      id: generateId(),
      role: "system",
      content: "Prompt cancelled. No Safal Tokens were used.",
      timestamp: new Date().toISOString()
    });
  };

  const handleQuickAction = (actionId: string) => {
    setShowFollowUp(false);
    setActiveOptions(null);
    startPromptReview(actionLabels[actionId] || actionId);
  };

  const handlePreviewAction = (action: string) => {
    if (action === "confirm") startPromptReview("Save it.");
    else if (action === "cancel") startPromptReview("Cancel");
    else if (action === "edit") {
      addMessage({ id: generateId(), role: "assistant", content: "What would you like to change?\n\n1. Change amount\n2. Change category\n3. Change date\n4. Add store name\n5. Mark as reimbursable\n6. Other change\n\nType a number or describe what to change.", timestamp: new Date().toISOString() });
      setActiveOptions({ context: "edit_field", options: [
        { num: 1, id: "amount", label: "Change amount" },
        { num: 2, id: "category", label: "Change category" },
        { num: 3, id: "date", label: "Change date" },
        { num: 4, id: "store", label: "Add store name" },
        { num: 5, id: "reimbursable", label: "Mark as reimbursable" },
        { num: 6, id: "other", label: "Other change" },
      ]});
    }
  };

  const handleFieldAction = (field: string) => {
    if (field === "Mark Reimbursable" && pendingRecord) { setPendingRecord({ ...pendingRecord, fields: { ...pendingRecord.fields, "Reimbursable": "Yes" } }); addMessage({ id: generateId(), role: "assistant", content: "Done! Marked as reimbursable.", timestamp: new Date().toISOString() }); return; }
    if (field === "Enable Restrict if Exceeded" && pendingRecord) { setPendingRecord({ ...pendingRecord, fields: { ...pendingRecord.fields, "Restrict if Exceeded": "Yes" } }); addMessage({ id: generateId(), role: "assistant", content: "Done! Restriction enabled.", timestamp: new Date().toISOString() }); return; }
    if (field === "Include in Budget" && pendingRecord) { setPendingRecord({ ...pendingRecord, fields: { ...pendingRecord.fields, "Included in Budget": "Yes" } }); addMessage({ id: generateId(), role: "assistant", content: "Done! Included in budget.", timestamp: new Date().toISOString() }); return; }
    if (field === "Split Equally Monthly" && pendingRecord) { const b = parseInt((pendingRecord.fields["Total Budget"] || pendingRecord.fields["Budget"] || "").replace(/[\$₹,\s]/g, "")) || 0; if (b) { setPendingRecord({ ...pendingRecord, fields: { ...pendingRecord.fields, "Monthly Allocation": `$${Math.round(b / 12).toLocaleString()} per month` } }); addMessage({ id: generateId(), role: "assistant", content: `Done! Split equally: $${Math.round(b / 12).toLocaleString()}/month.`, timestamp: new Date().toISOString() }); return; } }
    const prompts: Record<string, string> = { "Add Store": "Please enter the store name.", "Add Outlay": "Which outlay?", "Add Event": "Which event?", "Upload Receipt": "Please upload using the attachment button.", "Add Comment": "Please enter your comment.", "Add Invoice Number": "Please enter the invoice number.", "Add Expiry Date": "Please enter the expiry date.", "Add Warranty": "Please enter the warranty period.", "Upload Image": "Please upload an image.", "Add Quantity": "How many units?", "Add Description": "Please enter a description.", "Change Year": "Which year?", "Change Total Budget": "What total amount?", "Custom Monthly Allocation": "Please tell me the monthly amounts.", "Change Status": "Active or Inactive?", "Add Start Date": "Please enter the start date.", "Add End Date": "Please enter the end date.", "Add Budget": "What budget amount?", "Add Event Date": "Please enter the event date.", "Add Event Expense": "Please tell me the event expense details." };
    addMessage({ id: generateId(), role: "assistant", content: prompts[field] || `Please provide the value for "${field}".`, timestamp: new Date().toISOString() });
  };

  const handleNewChat = () => {
    createChat();
    setPendingRecord(null);
    setShowFollowUp(false);
    setActiveOptions(null);
    setPendingPrompt(null);
    setConfirmMode(null);
    setConfirmDraft("");
    setSuggestedPrompt(null);
  };


  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {hasMessages && (
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 py-2.5">
          <div className="max-w-2xl mx-auto">
            <TopActions onAction={handleQuickAction} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        {!hasMessages && !pendingRecord && confirmMode === null && !isTyping && !showFollowUp ? (
          <AIGreeting user={user} onQuickAction={handleQuickAction} />
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.map((msg) => (<ChatMessage key={msg.id} message={msg} />))}
            {pendingRecord && (
              <div className="animate-fade-in">
                <PreviewCard type={pendingRecord.type} fields={pendingRecord.fields} onAction={handlePreviewAction} onFieldAction={handleFieldAction} />
              </div>
            )}
            {confirmMode === "review" && pendingPrompt && (
              <div className="animate-fade-in">
                <div className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                    Review Before Running
                  </p>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Prompt:</span>{" "}
                    {summarizePrompt(confirmDraft || pendingPrompt.text, pendingPrompt.attachments)}
                  </div>
                  {(() => {
                    const est = estimateTokens(confirmDraft || pendingPrompt.text, pendingPrompt.attachments);
                    return (
                      <>
                        <div className="mt-3 mb-2 text-sm text-gray-700">
                          <span className="text-gray-500">Model:</span>{" "}
                          <span className="font-medium text-gray-800">{pendingPrompt.modelLabel}</span>
                        </div>
                        <div className="mt-2 w-full rounded-lg border border-gray-200 overflow-hidden text-xs">
                          <table className="w-full text-left bg-white">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-2 font-medium text-gray-600">Token Type</th>
                                <th className="px-3 py-2 font-medium text-gray-600 text-right">Safal Tokens</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                              <tr>
                                <td className="px-3 py-2">Input Prompt Tokens</td>
                                <td className="px-3 py-2 text-right">{est.input}</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">Estimated Output Tokens</td>
                                <td className="px-3 py-2 text-right">{est.output}</td>
                              </tr>
                              <tr className="font-semibold text-gray-900 bg-gray-50">
                                <td className="px-3 py-2">Total Estimated Tokens</td>
                                <td className="px-3 py-2 text-right">{est.total}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="px-3 py-2 bg-gray-50 text-right font-semibold border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-500 font-normal">Balance After Task:</span>
                            <span className="text-green-600 text-sm">{Math.max(0, tokenBalance - est.total)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={handleConfirmRun}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Confirm and Run
                    </button>
                    <button
                      onClick={handleModifyPrompt}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Modify Prompt
                    </button>
                    <button
                      onClick={handleCancelPrompt}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-100 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-500" />
                    <p className="text-[10px] text-purple-600 font-medium">
                      SAFAL-AI asks before running paid tasks. You are always in control.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {confirmMode === "edit" && pendingPrompt && (
              <div className="animate-fade-in">
                <div className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                    Modify Prompt
                  </p>
                  <textarea
                    ref={confirmTextareaRef}
                    value={confirmDraft}
                    onChange={(e) => setConfirmDraft(e.target.value)}
                    rows={3}
                    placeholder="Edit your prompt..."
                    className="mt-2 w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                  {suggestedPrompt && (
                    <div className="mt-3 bg-purple-50 border border-purple-100 rounded-lg p-3">
                      <p className="text-[11px] uppercase tracking-wider text-purple-500 font-semibold">
                        Suggested prompt
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {suggestedPrompt}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setConfirmDraft(suggestedPrompt);
                            handleReviewUpdatedPrompt();
                          }}
                          className="text-xs font-medium px-2.5 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          Use Improved Prompt
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDraft(pendingPrompt.text);
                            handleReviewUpdatedPrompt();
                          }}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Use Original Prompt
                        </button>
                        <button
                          onClick={() => {
                            confirmTextareaRef.current?.focus();
                          }}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          Edit Manually
                        </button>
                        <button
                          onClick={handleCancelPrompt}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {(() => {
                    const est = estimateTokens(confirmDraft, pendingPrompt.attachments);
                    return (
                      <>
                        <div className="mt-3 mb-2 text-sm text-gray-700">
                          <span className="text-gray-500">Model:</span>{" "}
                          <span className="font-medium text-gray-800">{pendingPrompt.modelLabel}</span>
                        </div>
                        <div className="mt-2 w-full rounded-lg border border-gray-200 overflow-hidden text-xs">
                          <table className="w-full text-left bg-white">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-2 font-medium text-gray-600">Token Type</th>
                                <th className="px-3 py-2 font-medium text-gray-600 text-right">Safal Tokens</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                              <tr>
                                <td className="px-3 py-2">Input Prompt Tokens</td>
                                <td className="px-3 py-2 text-right">{est.input}</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2">Estimated Output Tokens</td>
                                <td className="px-3 py-2 text-right">{est.output}</td>
                              </tr>
                              <tr className="font-semibold text-gray-900 bg-gray-50">
                                <td className="px-3 py-2">Total Estimated Tokens</td>
                                <td className="px-3 py-2 text-right">{est.total}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="px-3 py-2 bg-gray-50 text-right font-semibold border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-500 font-normal">Balance After Task:</span>
                            <span className="text-green-600 text-sm">{Math.max(0, tokenBalance - est.total)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={handleReviewUpdatedPrompt}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Review Tokens
                    </button>
                    <button
                      onClick={handleCancelPrompt}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showFollowUp && !pendingRecord && (
              <div className="animate-fade-in">
                <FollowUpActions onAction={handleQuickAction} onNewChat={handleNewChat} type={followUpType} />
              </div>
            )}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 lg:px-6">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={startPromptReview}
            disabled={isSending || isTyping || confirmMode !== null}
            placeholder={
              pendingRecord
                ? "Edit details, type a number, say 'Save it' or 'Cancel'..."
                : activeOptions
                  ? "Type a number to select..."
                  : confirmMode
                    ? "Review the token estimate above before sending..."
                    : "Type your request or describe what you need..."
            }
          />
        </div>
      </div>
    </div>
  );
}
