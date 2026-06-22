"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  useAuthStore,
  useIntegrationsStore,
} from "@/lib/store";
import type { IntegrationAuthType, IntegrationConfig } from "@/types";
import {
  Plug,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Pencil,
  Power,
  Shield,
} from "lucide-react";

const authOptions: { value: IntegrationAuthType; label: string }[] = [
  { value: "api_key", label: "API Key" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Username & Password" },
  { value: "oauth", label: "OAuth" },
  { value: "custom", label: "Custom" },
];

interface FormState {
  id?: string;
  name: string;
  baseUrl: string;
  authType: IntegrationAuthType;
  apiKey: string;
  username: string;
  password: string;
  notes: string;
  status: "active" | "inactive";
}

const emptyForm: FormState = {
  name: "",
  baseUrl: "",
  authType: "api_key",
  apiKey: "",
  username: "",
  password: "",
  notes: "",
  status: "active",
};

function maskSecret(value?: string) {
  if (!value) return "—";
  if (value.length <= 6) return "••••••";
  return `${value.slice(0, 3)}••••${value.slice(-3)}`;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    integrations,
    addIntegration,
    updateIntegration,
    removeIntegration,
    testIntegration,
  } = useIntegrationsStore();

  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setTestMessage(null);
    setShowForm(true);
  };

  const openEdit = (it: IntegrationConfig) => {
    setForm({
      id: it.id,
      name: it.name,
      baseUrl: it.baseUrl,
      authType: it.authType,
      apiKey: it.apiKey || "",
      username: it.username || "",
      password: it.password || "",
      notes: it.notes || "",
      status: it.status,
    });
    setErrors({});
    setTestMessage(null);
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Integration name is required.";
    if (!form.baseUrl.trim()) next.baseUrl = "API base URL is required.";
    else if (!/^https?:\/\//.test(form.baseUrl))
      next.baseUrl = "Base URL must start with http:// or https://";

    if (
      (form.authType === "api_key" || form.authType === "bearer") &&
      !form.apiKey.trim()
    ) {
      next.apiKey = "API key is required for this auth type.";
    }
    if (form.authType === "basic") {
      if (!form.username.trim()) next.username = "Username is required.";
      if (!form.password.trim()) next.password = "Password is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (form.id) {
      updateIntegration(form.id, {
        name: form.name.trim(),
        baseUrl: form.baseUrl.trim(),
        authType: form.authType,
        apiKey: form.apiKey || undefined,
        username: form.username || undefined,
        password: form.password || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
    } else {
      addIntegration({
        name: form.name.trim(),
        baseUrl: form.baseUrl.trim(),
        authType: form.authType,
        apiKey: form.apiKey || undefined,
        username: form.username || undefined,
        password: form.password || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
    }
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestMessage(null);
    const ok = await testIntegration(id);
    setTestingId(null);
    setTestMessage({
      id,
      text: ok
        ? "Connection successful."
        : "Connection failed. Please verify the base URL and credentials.",
      ok,
    });
  };

  const handleToggle = (it: IntegrationConfig) => {
    updateIntegration(it.id, {
      status: it.status === "active" ? "inactive" : "active",
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this integration?")) {
      removeIntegration(id);
      if (testMessage?.id === id) setTestMessage(null);
    }
  };

  return (
    <DashboardLayout
      activeKey="integrations"
      onNavigate={handleNavigate}
      headerTitle="Integration"
      headerSubtitle="Connect third-party APIs and tools"
    >
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Integration</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add and manage third-party API integrations to use them across
              Safal-AI.
            </p>
          </div>
          {!showForm && (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add API Integration
            </Button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Integration</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Products connect only after user authentication. You can disconnect models and products anytime. All credentials are encrypted.
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {form.id ? "Edit Integration" : "Add API Integration"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Integration Name"
                placeholder="My CRM API"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                error={errors.name}
                required
              />
              <Input
                label="API Base URL"
                placeholder="https://api.example.com"
                value={form.baseUrl}
                onChange={(e) =>
                  setForm({ ...form, baseUrl: e.target.value })
                }
                error={errors.baseUrl}
                required
              />
              <Select
                label="Authentication Type"
                options={authOptions}
                value={form.authType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    authType: e.target.value as IntegrationAuthType,
                  })
                }
                required
              />

              {(form.authType === "api_key" || form.authType === "bearer") && (
                <Input
                  type="password"
                  label={
                    form.authType === "bearer" ? "Bearer Token" : "API Key"
                  }
                  placeholder="Paste your secret"
                  value={form.apiKey}
                  onChange={(e) =>
                    setForm({ ...form, apiKey: e.target.value })
                  }
                  error={errors.apiKey}
                />
              )}

              {form.authType === "basic" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    error={errors.username}
                    required
                  />
                  <Input
                    type="password"
                    label="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    error={errors.password}
                    required
                  />
                </div>
              )}

              {form.authType === "oauth" && (
                <p className="text-xs text-gray-500">
                  OAuth flows will redirect to the provider after saving.
                </p>
              )}

              <Input
                label="Notes (optional)"
                placeholder="Anything you want to remember about this integration"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />

              <Select
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "active" | "inactive",
                  })
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {form.id ? "Save Changes" : "Add Integration"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* List */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Plug className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Connected APIs
            </h3>
            <span className="text-xs text-gray-400">
              ({integrations.length})
            </span>
          </div>

          {integrations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Plug className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No integrations yet
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Add your first third-party API integration so Safal-AI can work
                with external tools.
              </p>
              {!showForm && (
                <Button className="mt-4" onClick={openAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Integration
                </Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {integrations.map((it) => (
                <li key={it.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Plug className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {it.name}
                        </p>
                        <span
                          className={
                            it.status === "active"
                              ? "text-[10px] uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700"
                              : "text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                          }
                        >
                          {it.status}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                          {it.authType.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {it.baseUrl}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {it.authType === "basic"
                          ? `User: ${it.username || "—"} • Password: ${maskSecret(it.password)}`
                          : `Secret: ${maskSecret(it.apiKey)}`}
                      </p>
                      {testMessage?.id === it.id && (
                        <p
                          className={
                            testMessage.ok
                              ? "text-xs text-green-600 mt-2 flex items-center gap-1"
                              : "text-xs text-red-600 mt-2 flex items-center gap-1"
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
                        onClick={() => handleTest(it.id)}
                        isLoading={testingId === it.id}
                        title="Test connection"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(it)}
                        title={
                          it.status === "active"
                            ? "Disable"
                            : "Enable"
                        }
                      >
                        <Power className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(it)}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(it.id)}
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
    </DashboardLayout>
  );
}
