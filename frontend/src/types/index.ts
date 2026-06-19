// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  currency: string;
  language: string;
  createdAt: string;
  subscription?: Subscription;
  familyMembers?: FamilyMember[];
}

// Subscription & Credits
export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'advanced' | 'premium' | 'sme';
  status: 'active' | 'cancelled' | 'expired';
  creditsBalance: number;
  creditsUsed: number;
  renewalDate: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'usage' | 'purchase' | 'bonus' | 'refund';
  action: string;
  description: string;
  createdAt: string;
}

// Expense types
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  subcategory?: string;
  description: string;
  date: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  receipt?: Receipt;
  tags?: string[];
  familyMemberId?: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'food_groceries'
  | 'food_dining'
  | 'transportation'
  | 'vehicle'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'personal'
  | 'home'
  | 'gifts'
  | 'business'
  | 'other';

// Purchase Item types
export interface PurchaseItem {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  currency: string;
  purchaseDate: string;
  store?: string;
  quantity: number;
  warranty?: Warranty;
  receipt?: Receipt;
  notes?: string;
  familyMemberId?: string;
  createdAt: string;
  updatedAt: string;
}

// Receipt types
export interface Receipt {
  id: string;
  userId: string;
  imageUrl: string;
  ocrData?: OcrExtractedData;
  status: 'pending' | 'processed' | 'failed';
  linkedExpenseId?: string;
  linkedPurchaseId?: string;
  createdAt: string;
}

export interface OcrExtractedData {
  storeName?: string;
  billNumber?: string;
  date?: string;
  totalAmount?: number;
  tax?: number;
  items?: OcrItem[];
  category?: string;
  paymentMethod?: string;
  confidence: number;
}

export interface OcrItem {
  name: string;
  quantity?: number;
  price?: number;
}

// Warranty types
export interface Warranty {
  id: string;
  purchaseItemId: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  provider?: string;
  warrantyNumber?: string;
  documentUrl?: string;
  notes?: string;
  remindersEnabled: boolean;
  reminderDays: number[];
  createdAt: string;
}

// Expiry tracking
export interface ExpiryItem {
  id: string;
  userId: string;
  name: string;
  category: 'food' | 'medicine' | 'cosmetics' | 'household' | 'subscription' | 'document' | 'other';
  expiryDate: string;
  purchaseDate?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderDays: number[];
  createdAt: string;
}

// Family & Organization
export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  relationship: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members: OrganizationMember[];
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

// Event types
export interface Event {
  id: string;
  userId: string;
  name: string;
  description?: string;
  budget: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  participants: EventParticipant[];
  expenses: EventExpense[];
  shareLink?: string;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  amountPaid: number;
  amountOwed: number;
  status: 'pending' | 'partial' | 'settled';
}

export interface EventExpense {
  id: string;
  eventId: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splitType: 'equal' | 'custom' | 'percentage';
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  participantId: string;
  amount: number;
  percentage?: number;
}

// Report types
export interface Report {
  id: string;
  userId: string;
  type: 'monthly' | 'yearly' | 'category' | 'family' | 'event' | 'custom';
  title: string;
  startDate: string;
  endDate: string;
  data: ReportData;
  generatedAt: string;
}

export interface ReportData {
  totalExpenses: number;
  totalPurchases: number;
  categoryBreakdown: CategoryBreakdown[];
  trends: TrendData[];
  insights: string[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface TrendData {
  period: string;
  amount: number;
  change?: number;
}

// Chat/AI types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: AIAction;
  attachments?: ChatAttachment[];
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
    remaining: number;
  };
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'receipt';
  url: string;
  name: string;
}

export interface AIAction {
  type: AIActionType;
  status: 'pending' | 'completed' | 'failed' | 'requires_confirmation';
  data?: Record<string, unknown>;
  creditsUsed: number;
  confirmationRequired: boolean;
}

export type AIActionType = 
  | 'add_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'add_purchase'
  | 'upload_receipt'
  | 'scan_receipt'
  | 'track_warranty'
  | 'add_expiry'
  | 'create_event'
  | 'add_event_expense'
  | 'generate_report'
  | 'search'
  | 'query'
  | 'other';

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'warranty_expiry' | 'product_expiry' | 'budget_alert' | 'low_credits' | 'event_reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCreditsUsed: number;
  totalReceiptsProcessed: number;
  subscriptionBreakdown: Record<string, number>;
}


// =====================================================================
// Safal-AI workspace types (post-login)
// =====================================================================

// SafalVir product catalogue
export type SafalProductId =
  | "safalmybuy"
  | "safalirdrainmate"
  | "safalvendors"
  | "safalcalendar"
  | "safalsubscriptions"
  | "safalreviews"
  | "safaldrive"
  | "safalutilities";

export interface SafalProduct {
  id: SafalProductId;
  name: string;
}

// LLM Model APIs (added in Settings -> LLM Model APIs)
export type LLMProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "azure_openai"
  | "custom";

export interface LLMApiConfig {
  id: string;
  provider: LLMProvider;
  providerLabel: string; // e.g. "ChatGPT", "Claude", "Gemini", "Custom LLM"
  modelName: string; // e.g. "gpt-4o", "claude-3-opus"
  apiKey: string; // stored masked in UI; persisted as-is in localStorage demo
  endpoint?: string;
  username?: string;
  password?: string;
  status: "active" | "inactive";
  lastTestedAt?: string;
  testResult?: "success" | "failed";
  createdAt: string;
}

// Third-party integrations (Integration section)
export type IntegrationAuthType =
  | "api_key"
  | "bearer"
  | "basic"
  | "oauth"
  | "custom";

export interface IntegrationConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: IntegrationAuthType;
  apiKey?: string;
  username?: string;
  password?: string;
  status: "active" | "inactive";
  notes?: string;
  lastTestedAt?: string;
  testResult?: "success" | "failed";
  createdAt: string;
}

// Per-user product connection state
export interface ProductConnection {
  productId: SafalProductId;
  connected: boolean;
  connectedAt?: string;
  connectedAs?: { name?: string; email?: string };
}

// Used by AI Workspace model dropdown
export interface AIWorkspaceModelOption {
  id: string; // "auto" or "compare_all" or LLMApiConfig.id
  label: string;
  isAuto?: boolean;
  isCompareAll?: boolean;
}
