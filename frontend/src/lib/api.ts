// Use relative URL for same-origin deployment (Vercel monorepo)
// or absolute URL for separate backend deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: import("@/types").User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }

  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ user: import("@/types").User; token: string }>("/auth/register", {
      method: "POST",
      body: data,
    });
  }

  async getCurrentUser(token: string) {
    return this.request<import("@/types").User>("/auth/me", { token });
  }

  // Expenses
  async getExpenses(params?: { category?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    const query = searchParams.toString();
    return this.request<import("@/types").Expense[]>(`/expenses${query ? `?${query}` : ""}`);
  }

  async createExpense(data: Partial<import("@/types").Expense>) {
    return this.request<import("@/types").Expense>("/expenses", {
      method: "POST",
      body: data,
    });
  }

  async updateExpense(id: string, data: Partial<import("@/types").Expense>) {
    return this.request<import("@/types").Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteExpense(id: string) {
    return this.request<{ success: boolean }>(`/expenses/${id}`, {
      method: "DELETE",
    });
  }

  // Purchases
  async getPurchases() {
    return this.request<import("@/types").PurchaseItem[]>("/purchases");
  }

  async createPurchase(data: Partial<import("@/types").PurchaseItem>) {
    return this.request<import("@/types").PurchaseItem>("/purchases", {
      method: "POST",
      body: data,
    });
  }

  // Receipts
  async uploadReceipt(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${this.baseUrl}/receipts/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload receipt");
    }

    return response.json();
  }

  async processReceipt(id: string) {
    return this.request<import("@/types").OcrExtractedData>(`/receipts/${id}/process`, {
      method: "POST",
    });
  }

  // Warranties
  async getWarranties() {
    return this.request<import("@/types").Warranty[]>("/warranties");
  }

  // Events
  async getEvents() {
    return this.request<import("@/types").Event[]>("/events");
  }

  async createEvent(data: Partial<import("@/types").Event>) {
    return this.request<import("@/types").Event>("/events", {
      method: "POST",
      body: data,
    });
  }

  // Reports
  async generateReport(params: { type: string; startDate: string; endDate: string }) {
    return this.request<import("@/types").Report>("/reports/generate", {
      method: "POST",
      body: params,
    });
  }

  // AI Chat
  async sendMessage(message: string, attachments?: File[]) {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append("message", message);
      attachments.forEach((file) => formData.append("attachments", file));

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    }

    return this.request<{ message: import("@/types").ChatMessage }>("/chat", {
      method: "POST",
      body: { message },
    });
  }

  // Credits
  async getCreditBalance() {
    return this.request<{ balance: number; transactions: import("@/types").CreditTransaction[] }>("/credits/balance");
  }

  // Family
  async getFamilyMembers() {
    return this.request<import("@/types").FamilyMember[]>("/family/members");
  }

  async addFamilyMember(data: Partial<import("@/types").FamilyMember>) {
    return this.request<import("@/types").FamilyMember>("/family/members", {
      method: "POST",
      body: data,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
