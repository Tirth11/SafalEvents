import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, ChatMessage, Notification, CreditTransaction } from "@/types";

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenHistory: CreditTransaction[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  addTokenHistory: (tx: CreditTransaction) => void;
  applyTokenUsage: (tokensUsed: number, action?: string, description?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      tokenHistory: [],
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          tokenHistory: [],
        }),
      addTokenHistory: (tx) =>
        set((state) => ({
          tokenHistory: [tx, ...state.tokenHistory],
        })),
      applyTokenUsage: (tokensUsed, action, description) =>
        set((state) => {
          if (!state.user?.subscription) return state;
          const balance = Math.max(
            0,
            state.user.subscription.creditsBalance - tokensUsed
          );
          const used = state.user.subscription.creditsUsed + tokensUsed;
          return {
            user: {
              ...state.user,
              subscription: {
                ...state.user.subscription,
                creditsBalance: balance,
                creditsUsed: used,
              },
            },
          };
        }),
    }),
    {
      name: "safal-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        tokenHistory: state.tokenHistory,
      }),
    }
  )
);

// Multi-Chat Store
export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface ChatState {
  chats: ChatSession[];
  activeChatId: string | null;
  isTyping: boolean;
  createChat: () => string;
  switchChat: (chatId: string) => void;
  renameChat: (chatId: string, name: string) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

const generateChatId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isTyping: false,

      createChat: () => {
        const id = generateChatId();
        set((state) => ({
          chats: [...state.chats, { id, name: "New Chat", messages: [], createdAt: new Date().toISOString() }],
          activeChatId: id,
        }));
        return id;
      },

      switchChat: (chatId) => set({ activeChatId: chatId }),

      renameChat: (chatId, name) => {
        set((state) => ({
          chats: state.chats.map((c) => (c.id === chatId ? { ...c, name } : c)),
        }));
      },

      deleteChat: (chatId) => {
        set((state) => {
          const remaining = state.chats.filter((c) => c.id !== chatId);
          const newActive = state.activeChatId === chatId
            ? remaining[remaining.length - 1]?.id || null
            : state.activeChatId;
          return { chats: remaining, activeChatId: newActive };
        });
      },

      addMessage: (message) => {
        set((state) => {
          let chatId = state.activeChatId;
          let chats = [...state.chats];

          if (!chatId || !chats.find((c) => c.id === chatId)) {
            const id = generateChatId();
            chats.push({ id, name: "New Chat", messages: [], createdAt: new Date().toISOString() });
            chatId = id;
          }

          chats = chats.map((c) =>
            c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
          );

          return { chats, activeChatId: chatId };
        });
      },

      setTyping: (isTyping) => set({ isTyping }),

      clearMessages: () => {
        const id = generateChatId();
        set((state) => ({
          chats: [...state.chats, { id, name: "New Chat", messages: [], createdAt: new Date().toISOString() }],
          activeChatId: id,
        }));
      },
    }),
    {
      name: "safal-chats",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ chats: state.chats, activeChatId: state.activeChatId }),
    }
  )
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "light",
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "safal-ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// Onboarding Store
export interface OnboardingState {
  hasStartedCustomChat: boolean;
  hasUploadedFile: boolean;
  hasViewedTokens: boolean;
  isDemoMode: boolean;
  isOnboardingDismissed: boolean;
  markCustomChatStarted: () => void;
  markFileUploaded: () => void;
  markTokensViewed: () => void;
  setDemoMode: (demo: boolean) => void;
  dismissOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasStartedCustomChat: false,
      hasUploadedFile: false,
      hasViewedTokens: false,
      isDemoMode: false,
      isOnboardingDismissed: false,
      markCustomChatStarted: () => set({ hasStartedCustomChat: true }),
      markFileUploaded: () => set({ hasUploadedFile: true }),
      markTokensViewed: () => set({ hasViewedTokens: true }),
      setDemoMode: (demo) => set({ isDemoMode: demo, isOnboardingDismissed: true }),
      dismissOnboarding: () => set({ isOnboardingDismissed: true }),
    }),
    {
      name: "safal-onboarding",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =====================================================================
// Safal-AI workspace stores (post-login)
// =====================================================================

import type {
  SafalProductId,
  ProductConnection,
  LLMApiConfig,
  IntegrationConfig,
} from "@/types";

const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---------- Products store ----------

interface ProductsState {
  connections: Record<SafalProductId, ProductConnection>;
  isConnected: (id: SafalProductId) => boolean;
  connect: (
    id: SafalProductId,
    connectedAs?: { name?: string; email?: string }
  ) => void;
  disconnect: (id: SafalProductId) => void;
}

const allProductIds: SafalProductId[] = [
  "safalmybuy",
  "safalirdrainmate",
  "safalvendors",
  "safalcalendar",
  "safalsubscriptions",
  "safalreviews",
  "safaldrive",
  "safalutilities",
];

const emptyConnections = (): Record<SafalProductId, ProductConnection> => {
  const out: Partial<Record<SafalProductId, ProductConnection>> = {};
  for (const id of allProductIds) {
    out[id] = { productId: id, connected: false };
  }
  return out as Record<SafalProductId, ProductConnection>;
};

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      connections: emptyConnections(),
      isConnected: (id) => !!get().connections[id]?.connected,
      connect: (id, connectedAs) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [id]: {
              productId: id,
              connected: true,
              connectedAt: new Date().toISOString(),
              connectedAs,
            },
          },
        })),
      disconnect: (id) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [id]: { productId: id, connected: false },
          },
        })),
    }),
    {
      name: "safal-products",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ---------- LLM Model APIs store ----------

interface LLMState {
  apis: LLMApiConfig[];
  addApi: (api: Omit<LLMApiConfig, "id" | "createdAt">) => LLMApiConfig;
  updateApi: (id: string, patch: Partial<LLMApiConfig>) => void;
  removeApi: (id: string) => void;
  // Returns true on success. Uses a small simulated delay so the UI can show
  // "Testing..." state. Real backend wiring can swap this out 1:1.
  testApi: (id: string) => Promise<boolean>;
}

export const useLLMStore = create<LLMState>()(
  persist(
    (set, get) => ({
      apis: [],
      addApi: (api) => {
        const created: LLMApiConfig = {
          ...api,
          id: newId("llm"),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ apis: [...state.apis, created] }));
        return created;
      },
      updateApi: (id, patch) =>
        set((state) => ({
          apis: state.apis.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeApi: (id) =>
        set((state) => ({ apis: state.apis.filter((a) => a.id !== id) })),
      testApi: async (id) => {
        const api = get().apis.find((a) => a.id === id);
        if (!api) return false;
        await new Promise((r) => setTimeout(r, 800));
        // Demo rule: any non-empty API key passes.
        const ok = !!api.apiKey && api.apiKey.trim().length >= 8;
        set((state) => ({
          apis: state.apis.map((a) =>
            a.id === id
              ? {
                  ...a,
                  lastTestedAt: new Date().toISOString(),
                  testResult: ok ? "success" : "failed",
                }
              : a
          ),
        }));
        return ok;
      },
    }),
    {
      name: "safal-llm-apis",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ---------- Third-party Integrations store ----------

interface IntegrationsState {
  integrations: IntegrationConfig[];
  addIntegration: (
    i: Omit<IntegrationConfig, "id" | "createdAt">
  ) => IntegrationConfig;
  updateIntegration: (id: string, patch: Partial<IntegrationConfig>) => void;
  removeIntegration: (id: string) => void;
  testIntegration: (id: string) => Promise<boolean>;
}

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set, get) => ({
      integrations: [],
      addIntegration: (i) => {
        const created: IntegrationConfig = {
          ...i,
          id: newId("int"),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ integrations: [...state.integrations, created] }));
        return created;
      },
      updateIntegration: (id, patch) =>
        set((state) => ({
          integrations: state.integrations.map((it) =>
            it.id === id ? { ...it, ...patch } : it
          ),
        })),
      removeIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.filter((it) => it.id !== id),
        })),
      testIntegration: async (id) => {
        const it = get().integrations.find((x) => x.id === id);
        if (!it) return false;
        await new Promise((r) => setTimeout(r, 800));
        const ok = !!it.baseUrl && /^https?:\/\//.test(it.baseUrl);
        set((state) => ({
          integrations: state.integrations.map((x) =>
            x.id === id
              ? {
                  ...x,
                  lastTestedAt: new Date().toISOString(),
                  testResult: ok ? "success" : "failed",
                }
              : x
          ),
        }));
        return ok;
      },
    }),
    {
      name: "safal-integrations",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
