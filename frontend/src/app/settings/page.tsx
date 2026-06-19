"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { useAuthStore, useLLMStore, useProductsStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { LLMApiConfig, LLMProvider, SafalProductId } from "@/types";
import {
  User,
  Bell,
  Save,
  Bot,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  CheckCircle,
  XCircle,
  Power,
} from "lucide-react";

const tabIds = [
  "profile",
  "notifications",
  "llm",
  "security",
  "logout",
] as const;
type TabId = (typeof tabIds)[number];

const providerOptions: { value: LLMProvider; label: string }[] = [
  { value: "openai", label: "ChatGPT (OpenAI)" },
  { value: "anthropic", label: "Claude (Anthropic)" },
  { value: "google", label: "Gemini (Google)" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "custom", label: "Custom LLM" },
];

const productNames: Record<SafalProductId, string> = {
  safalmybuy: "SafalMyBuy",
  safalirdrainmate: "SafalIRDrainMate",
  safalvendors: "SafalVendors",
  safalcalendar: "SafalCalendar",
  safalsubscriptions: "SafalSubscriptions",
  safalreviews: "SafalReviews",
  safaldrive: "SafalDrive",
  safalutilities: "SafalUtilities",
};

interface LLMFormState {
  id?: string;
  provider: LLMProvider;
  providerLabel: string;
  modelName: string;
  apiKey: string;
  endpoint: string;
  username: string;
  password: string;
  status: "active" | "inactive";
}

const emptyLLMForm: LLMFormState = {
  provider: "openai",
  providerLabel: "ChatGPT",
  modelName: "",
  apiKey: "",
  endpoint: "",
  username: "",
  password: "",
  status: "active",
};

const providerLabelMap: Record<LLMProvider, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  google: "Gemini",
  azure_openai: "Azure OpenAI",
  custom: "Custom LLM",
};

function maskSecret(value?: string) {
  if (!value) return "—";
  if (value.length <= 6) return "••••••";
  return `${value.slice(0, 3)}••••${value.slice(-3)}`;
}

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") || "profile") as TabId;
  const initialTab: TabId = tabIds.includes(tabParam) ? tabParam : "profile";

  const { isAuthenticated, user, logout } = useAuthStore();
  const { apis, addApi, updateApi, removeApi, testApi } = useLLMStore();
  const { connections } = useProductsStore();

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // LLM form state
  const [showLLMForm, setShowLLMForm] = useState(false);
  const [llmForm, setLLMForm] = useState<LLMFormState>(emptyLLMForm);
  const [llmErrors, setLLMErrors] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<{
    id: string;
    text: string;
    ok: boolean;
  } | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  const handleNavigate = (_key: string, path: string) => {
    router.push(path);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "llm",
      label: "LLM Model APIs",
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
    },
  ];

  const connectedProducts = (
    Object.keys(productNames) as SafalProductId[]
  ).filter((id) => connections[id]?.connected);

  // ---------- LLM helpers ----------

  const openAddLLM = () => {
    setLLMForm(emptyLLMForm);
    setLLMErrors({});
    setTestMessage(null);
    setShowLLMForm(true);
  };

  const openEditLLM = (api: LLMApiConfig) => {
    setLLMForm({
      id: api.id,
      provider: api.provider,
      providerLabel: api.providerLabel,
      modelName: api.modelName,
      apiKey: api.apiKey,
      endpoint: api.endpoint || "",
      username: api.username || "",
      password: api.password || "",
      status: api.status,
    });
    setLLMErrors({});
    setTestMessage(null);
    setShowLLMForm(true);
  };

  const validateLLMForm = (): boolean => {
    const next: Record<string, string> = {};
    if (!llmForm.providerLabel.trim())
      next.providerLabel = "Provider name is required.";
    if (!llmForm.modelName.trim())
      next.modelName = "Model name is required.";
    if (!llmForm.apiKey.trim() && llmForm.provider !== "custom")
      next.apiKey = "API key is required.";
    if (llmForm.provider === "custom" && !llmForm.endpoint.trim())
      next.endpoint = "Endpoint is required for a custom LLM.";
    setLLMErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveLLM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLLMForm()) return;
    const payload = {
      provider: llmForm.provider,
      providerLabel: llmForm.providerLabel.trim(),
      modelName: llmForm.modelName.trim(),
      apiKey: llmForm.apiKey,
      endpoint: llmForm.endpoint || undefined,
      username: llmForm.username || undefined,
      password: llmForm.password || undefined,
      status: llmForm.status,
    };
    if (llmForm.id) {
      updateApi(llmForm.id, payload);
    } else {
      addApi(payload);
    }
    setShowLLMForm(false);
    setLLMForm(emptyLLMForm);
  };

  const handleTestLLM = async (id: string) => {
    setTestingId(id);
    setTestMessage(null);
    const ok = await testApi(id);
    setTestingId(null);
    setTestMessage({
      id,
      text: ok ? "Connection successful." : "Connection failed.",
      ok,
    });
  };

  const handleToggleLLM = (api: LLMApiConfig) => {
    updateApi(api.id, {
      status: api.status === "active" ? "inactive" : "active",
    });
  };

  const handleDeleteLLM = (id: string) => {
    if (window.confirm("Remove this LLM API?")) {
      removeApi(id);
      if (testMessage?.id === id) setTestMessage(null);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      window.location.href = "/";
    }
  };

  return (
    <DashboardLayout
      activeKey="settings"
      onNavigate={handleNavigate}
      headerTitle="Settings"
      headerSubtitle="Manage your account, models, and preferences"
    >
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-6">
          Profile, notifications, LLM Model APIs, security, and logout.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 text-green-700 border-green-600 whitespace-nowrap"
                  : "flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 text-gray-500 border-transparent hover:text-gray-700 whitespace-nowrap"
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === "profile" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  defaultValue={user?.name?.split(" ")[0]}
                />
                <Input
                  label="Last Name"
                  defaultValue={user?.name?.split(" ").slice(1).join(" ")}
                />
              </div>
              <Input
                label="Email"
                type="email"
                defaultValue={user?.email}
                suffix={
                  <button className="text-xs text-green-600 hover:text-green-700">
                    Verify
                  </button>
                }
              />
              <Input
                label="Phone"
                type="tel"
                defaultValue={user?.phone || ""}
                placeholder="+91 98765 43210"
                suffix={
                  <button className="text-xs text-green-600 hover:text-green-700">
                    Verify
                  </button>
                }
              />
              <p className="text-[11px] text-gray-400 -mt-2">
                Email and phone updates require OTP verification.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Login method
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  Email / Phone OTP
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Connected Products
                </label>
                {connectedProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No products connected yet. Connect one from the sidebar.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {connectedProducts.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {productNames[id]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Status
                </label>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active &amp; Verified
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: "product",
                  label: "Product connection alerts",
                  desc: "When a product is connected or disconnected",
                },
                {
                  id: "tokens",
                  label: "Safal Token low balance",
                  desc: "When your Safal Tokens are running low",
                },
                {
                  id: "renewal",
                  label: "Subscription renewal",
                  desc: "Reminders for upcoming renewals",
                },
                {
                  id: "report",
                  label: "Report alerts",
                  desc: "When a report is ready",
                },
                {
                  id: "product_specific",
                  label: "Product-specific alerts",
                  desc: "Updates from connected SafalVir products",
                },
                {
                  id: "integration",
                  label: "Integration failures",
                  desc: "When a third-party integration fails",
                },
                {
                  id: "security",
                  label: "Security alerts",
                  desc: "New device login or unusual activity",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* LLM Model APIs */}
        {activeTab === "llm" && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    LLM Model APIs
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Add your own API keys for ChatGPT, Claude, Gemini, or any
                    custom LLM. Added models become available in AI Workspace.
                  </p>
                </div>
                {!showLLMForm && (
                  <Button onClick={openAddLLM} size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add LLM API
                  </Button>
                )}
              </div>

              {showLLMForm && (
                <form
                  onSubmit={handleSaveLLM}
                  className="space-y-4 border border-gray-100 rounded-xl p-4 mb-4 bg-gray-50/50"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      label="Provider"
                      options={providerOptions}
                      value={llmForm.provider}
                      onChange={(e) => {
                        const provider = e.target.value as LLMProvider;
                        setLLMForm({
                          ...llmForm,
                          provider,
                          providerLabel: providerLabelMap[provider],
                        });
                      }}
                      required
                    />
                    <Input
                      label="Display Name"
                      placeholder="ChatGPT"
                      value={llmForm.providerLabel}
                      onChange={(e) =>
                        setLLMForm({
                          ...llmForm,
                          providerLabel: e.target.value,
                        })
                      }
                      error={llmErrors.providerLabel}
                      required
                    />
                  </div>

                  <Input
                    label="Model Name"
                    placeholder="gpt-4o, claude-3-opus, gemini-1.5-pro..."
                    value={llmForm.modelName}
                    onChange={(e) =>
                      setLLMForm({
                        ...llmForm,
                        modelName: e.target.value,
                      })
                    }
                    error={llmErrors.modelName}
                    required
                  />

                  <Input
                    type="password"
                    label="API Key"
                    placeholder="Paste your API key"
                    value={llmForm.apiKey}
                    onChange={(e) =>
                      setLLMForm({ ...llmForm, apiKey: e.target.value })
                    }
                    error={llmErrors.apiKey}
                  />

                  <Input
                    label={
                      llmForm.provider === "custom"
                        ? "API Endpoint (required)"
                        : "API Endpoint (optional)"
                    }
                    placeholder="https://api.openai.com/v1"
                    value={llmForm.endpoint}
                    onChange={(e) =>
                      setLLMForm({ ...llmForm, endpoint: e.target.value })
                    }
                    error={llmErrors.endpoint}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Username (optional)"
                      value={llmForm.username}
                      onChange={(e) =>
                        setLLMForm({ ...llmForm, username: e.target.value })
                      }
                    />
                    <Input
                      type="password"
                      label="Password (optional)"
                      value={llmForm.password}
                      onChange={(e) =>
                        setLLMForm({ ...llmForm, password: e.target.value })
                      }
                    />
                  </div>

                  <Select
                    label="Status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    value={llmForm.status}
                    onChange={(e) =>
                      setLLMForm({
                        ...llmForm,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                  />

                  <p className="text-[11px] text-gray-400">
                    API keys and passwords are masked in the UI and stored
                    securely. They are never shared with other users.
                  </p>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowLLMForm(false);
                        setLLMForm(emptyLLMForm);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {llmForm.id ? "Save Changes" : "Add LLM API"}
                    </Button>
                  </div>
                </form>
              )}

              {apis.length === 0 && !showLLMForm ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <Bot className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    No LLM model APIs yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Add your first model API to use it inside AI Workspace. Auto
                    Mode will pick the best available model for each task.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {apis.map((api) => (
                    <li key={api.id} className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {api.providerLabel}
                            </p>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                              {api.modelName}
                            </span>
                            <span
                              className={
                                api.status === "active"
                                  ? "text-[10px] uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700"
                                  : "text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                              }
                            >
                              {api.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Key: {maskSecret(api.apiKey)}
                            {api.endpoint
                              ? ` • Endpoint: ${api.endpoint}`
                              : ""}
                          </p>
                          {testMessage?.id === api.id && (
                            <p
                              className={
                                testMessage.ok
                                  ? "text-xs text-green-600 mt-1.5 flex items-center gap-1"
                                  : "text-xs text-red-600 mt-1.5 flex items-center gap-1"
                              }
                            >
                              {testMessage.ok ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {testMessage.text}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestLLM(api.id)}
                            isLoading={testingId === api.id}
                            title="Test connection"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLLM(api)}
                            title={
                              api.status === "active"
                                ? "Disable"
                                : "Enable"
                            }
                          >
                            <Power className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditLLM(api)}
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLLM(api.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Secure login</p>
                  <p className="text-xs text-gray-500">
                    Email/Phone OTP plus Google, Apple, or Microsoft.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Encrypted credentials</p>
                  <p className="text-xs text-gray-500">
                    LLM API keys, passwords, and integration secrets are
                    encrypted at rest and masked in the UI.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Confirmation before actions</p>
                  <p className="text-xs text-gray-500">
                    Important actions show a preview and need your approval
                    before they run.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Disconnect anytime</p>
                  <p className="text-xs text-gray-500">
                    Remove products, integrations, or LLM APIs whenever you
                    want.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <Button variant="outline" size="sm">
                  View Active Sessions
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Logout */}
        {activeTab === "logout" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Logout</h3>
            <p className="text-sm text-gray-500 mb-4">
              Sign out of Safal-AI on this device. Your data and connected
              products stay safe and ready when you sign back in.
            </p>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  );
}
