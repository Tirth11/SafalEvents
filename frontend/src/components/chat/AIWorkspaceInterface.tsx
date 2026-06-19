"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateId } from "@/lib/utils";
import {
  Bot,
  Plus,
  Sparkles,
  Send,
  Wand2,
  AlertCircle,
  Paperclip,
  Play,
  X,
  FileText,
  Shield,
  Copy,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore, useLLMStore, useOnboardingStore } from "@/lib/store";
import type { AIWorkspaceModelOption, LLMApiConfig } from "@/types";

interface ChatTurn {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelLabel?: string;
  isCompareResult?: boolean;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
    remaining: number;
  };
}

const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_TOKEN_BALANCE = 120;

const estimateTokens = (prompt: string, attachedFile?: string | null) => {
  const clean = prompt.trim();
  const base = Math.max(1, Math.ceil(clean.length / 45));
  const fileTokens = attachedFile ? 5 : 0;
  const complexity = clean.length > 200 ? 2 : 0;
  
  // Output estimate is roughly 2x input for testing
  const input = Math.min(30, base + fileTokens + complexity);
  const output = input * 2 + 1;
  return {
    input,
    output,
    total: input + output,
  };
};

const summarizePrompt = (prompt: string, attachedFile?: string | null) => {
  const clean = prompt.trim();
  const summary =
    clean.length > 120 ? `${clean.slice(0, 120)}...` : clean || "(No prompt)";
  if (!attachedFile) return summary;
  return `${summary} • 1 file attached`;
};

const getTaskType = (prompt: string) => {
  const lower = prompt.toLowerCase();
  if (lower.includes("report")) return "Report generation";
  if (lower.includes("summarize") || lower.includes("summary")) return "Summary";
  if (lower.includes("compare")) return "Comparison";
  if (lower.includes("extract")) return "Data extraction";
  return "Custom prompt";
};

// Prompt templates shown as quick-start chips.
const promptTemplates = [
  { label: "Summarize document", prompt: "Summarize the uploaded document into a short, clear summary with the key points." },
  { label: "Extract data", prompt: "Extract the important data from the uploaded file and present it as a clean table." },
  { label: "Rewrite content", prompt: "Rewrite the following content to be clearer and more professional:" },
  { label: "Compare files", prompt: "Compare the uploaded files and list the key differences and similarities." },
  { label: "Generate report", prompt: "Analyze the uploaded file and generate a clear report with a summary, key points, and action items." },
  { label: "Create task", prompt: "Turn the following into a clear task with steps and a due date:" },
];

function pickAutoModel(apis: LLMApiConfig[]): LLMApiConfig | null {
  // Auto Mode: prefer an Active API, fall back to the first one.
  return apis.find((a) => a.status === "active") || apis[0] || null;
}

// Lightweight prompt-improvement (no network).
function improvePromptText(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  const base = trimmed.replace(/[.\s]+$/, "");
  return `Please ${base.charAt(0).toLowerCase()}${base.slice(
    1
  )}. Provide a clear result with a short summary, the key points, and any action items. Use simple language and keep it well structured.`;
}

function fakeAssistantReply(prompt: string, modelLabel: string): string {
  const trimmed = prompt.trim();
  return [
    `Here is the response from ${modelLabel}:`,
    "",
    `> ${trimmed.length > 200 ? trimmed.slice(0, 200) + "…" : trimmed}`,
    "",
    "Once your real model API is wired up, this answer will come from that model.",
  ].join("\n");
}

export function AIWorkspaceInterface() {
  const { user, addTokenHistory, applyTokenUsage } = useAuthStore();
  const { apis } = useLLMStore();
  const { isDemoMode } = useOnboardingStore();
  const [selectedId, setSelectedId] = useState<string>("auto");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [improved, setImproved] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<{
    text: string;
    attachedFile: string | null;
    modelLabel: string;
    modelId: string;
    isCompareAll: boolean;
  } | null>(null);
  const [confirmMode, setConfirmMode] = useState<"review" | "edit" | null>(null);
  const [confirmDraft, setConfirmDraft] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmTextareaRef = useRef<HTMLTextAreaElement>(null);

  const options = useMemo<AIWorkspaceModelOption[]>(() => {
    const list: AIWorkspaceModelOption[] = [
      { id: "auto", label: "Auto Mode", isAuto: true },
    ];
    for (const a of apis) {
      list.push({ id: a.id, label: `${a.providerLabel} — ${a.modelName}` });
    }
    list.push({ id: "compare_all", label: "Compare All Models", isCompareAll: true });
    return list;
  }, [apis]);

  const noModels = apis.length === 0;
  const tokenBalance = user?.subscription?.creditsBalance ?? DEFAULT_TOKEN_BALANCE;

  const resolveModelLabel = (): { label: string; api: LLMApiConfig | null; isCompareAll: boolean } => {
    if (selectedId === "auto") {
      const api = pickAutoModel(apis);
      return {
        api,
        label: api
          ? `Auto -> ${api.providerLabel} (${api.modelName})`
          : "Auto Mode (no model added yet)",
        isCompareAll: false,
      };
    }
    if (selectedId === "compare_all") {
      return {
        api: null,
        label: "Compare All Models",
        isCompareAll: true,
      };
    }
    const api = apis.find((a) => a.id === selectedId) || null;
    return {
      api,
      label: api ? `${api.providerLabel} — ${api.modelName}` : "Auto Mode",
      isCompareAll: false,
    };
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text && !attachedFile) return;
    startPromptReview(text, attachedFile);
    setDraft("");
    setImproved(null);
  };

  const startPromptReview = (text: string, file: string | null) => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;
    const { label, isCompareAll } = resolveModelLabel();
    setPendingPrompt({
      text: trimmed,
      attachedFile: file,
      modelLabel: label,
      modelId: selectedId,
      isCompareAll,
    });
    setConfirmDraft(trimmed);
    setSuggestedPrompt(null);
    setConfirmMode("review");
  };

  const handleConfirmRun = async () => {
    if (!pendingPrompt) return;
    const finalText = confirmDraft.trim();
    const taskType = getTaskType(finalText);
    const modelLabel = pendingPrompt.modelLabel;
    const file = pendingPrompt.attachedFile;
    const isCompareAll = pendingPrompt.isCompareAll;

    // Clear confirm state
    setConfirmMode(null);
    setPendingPrompt(null);
    setConfirmDraft("");
    setSuggestedPrompt(null);
    setAttachedFile(null);

    // Add user message
    const userContent = file
      ? `${finalText || "(no prompt)"}\n\n📎 Attached: ${file}`
      : finalText;
    
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", content: userContent },
    ]);
    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 700));

    if (isCompareAll && apis.length > 0) {
      let totalInput = 0;
      let totalOutput = 0;
      let totalTokens = 0;
      
      const newMessages: ChatTurn[] = [];
      
      for (const api of apis) {
        const est = estimateTokens(finalText, file);
        // Vary slightly for different models
        const outToks = est.output + Math.floor(Math.random() * 5); 
        const modelTotal = est.input + outToks;
        
        totalInput += est.input;
        totalOutput += outToks;
        totalTokens += modelTotal;
        
        const mLabel = `${api.providerLabel} (${api.modelName})`;
        newMessages.push({
          id: newId(),
          role: "assistant",
          content: fakeAssistantReply(finalText || "the attached file", mLabel),
          modelLabel: mLabel,
          isCompareResult: true,
        });
      }
      
      setMessages((prev) => [...prev, ...newMessages]);
      
      // Deduct tokens
      applyTokenUsage(totalTokens);
      addTokenHistory({
        id: generateId(),
        userId: user?.id || "user",
        amount: totalTokens,
        type: "usage",
        action: taskType,
        description: `Compare All Models executed`,
        createdAt: new Date().toISOString(),
      });

      const remaining = Math.max(0, tokenBalance - totalTokens);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "system",
          content: `Task Completed\n\nInput Tokens Used: ${totalInput}\nOutput Tokens Used: ${totalOutput}\nTotal Tokens Deducted: ${totalTokens}\nRemaining Balance: ${remaining}`,
        },
      ]);
      
    } else {
      const { api } = resolveModelLabel();
      const est = estimateTokens(finalText, file);
      const tokensUsed = est.total;
      
      // Add assistant reply
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: (api || isDemoMode)
            ? fakeAssistantReply(finalText || "the attached file", modelLabel)
            : "No LLM model API has been added yet. Add one in Settings → LLM Model APIs and try again.",
          modelLabel,
        },
      ]);

      // Deduct tokens and log usage
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

      // Add token usage summary message
      const remaining = Math.max(0, tokenBalance - tokensUsed);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "system",
          content: `Task Completed\n\nInput Tokens Used: ${est.input}\nOutput Tokens Used: ${est.output}\nTotal Tokens Deducted: ${tokensUsed}\nRemaining Balance: ${remaining}`,
        },
      ]);
    }
    
    setIsThinking(false);
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
    
    // Add cancellation system message
    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "system",
        content: "Prompt cancelled. No Safal Tokens were used.",
      }
    ]);
  };

  const handleImprove = () => {
    if (!draft.trim()) return;
    setImproved(improvePromptText(draft));
  };

  const applyImproved = () => {
    if (improved) setDraft(improved);
    setImproved(null);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file.name);
    // Reset so the same file can be re-selected later.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Render helpers
  const renderTokensTable = (text: string, file: string | null, isCompareAll: boolean) => {
    let input = 0;
    let output = 0;
    let total = 0;
    
    const singleEst = estimateTokens(text, file);
    
    if (isCompareAll && apis.length > 0) {
      input = singleEst.input * apis.length;
      output = singleEst.output * apis.length; // rough est
      total = input + output;
    } else {
      input = singleEst.input;
      output = singleEst.output;
      total = singleEst.total;
    }
    
    return (
      <div className="mt-3 w-full rounded-lg border border-gray-200 overflow-hidden text-xs">
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
              <td className="px-3 py-2 text-right">{input}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Estimated Output Tokens</td>
              <td className="px-3 py-2 text-right">{output}</td>
            </tr>
            <tr className="font-semibold text-gray-900 bg-gray-50">
              <td className="px-3 py-2">Total Estimated Tokens</td>
              <td className="px-3 py-2 text-right">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const getEstTotalTokens = (text: string, file: string | null, isCompareAll: boolean) => {
    const singleEst = estimateTokens(text, file);
    if (isCompareAll && apis.length > 0) {
      return (singleEst.input + singleEst.output) * apis.length;
    }
    return singleEst.total;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar: model dropdown */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Wand2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-green-500"
            aria-label="LLM model"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <Link
            href="/settings?tab=llm"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600"
          >
            <Plus className="w-3.5 h-3.5" />
            Add model API
          </Link>
        </div>
      </div>

      {/* Banner if no models */}
      {noModels && (
        <div className="flex-shrink-0 bg-yellow-50 border-b border-yellow-100 px-4 lg:px-6 py-2.5">
          <div className="max-w-3xl mx-auto flex items-start gap-2 text-xs text-yellow-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              No AI model connected yet. Add one in{" "}
              <Link href="/settings?tab=llm" className="underline font-medium">
                Settings → LLM Model APIs
              </Link>{" "}
              to power AI Workspace. Auto Mode will pick the best available model.
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && confirmMode === null && (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI Workspace</h3>
              <p className="text-sm text-gray-500 max-w-md mt-2">
                Use your own integrated AI models from one place. Pick a model
                from the dropdown, let Auto Mode choose for you, or Compare All Models.
              </p>

              {/* Prompt templates */}
              <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl">
                {promptTemplates.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setDraft(t.prompt)}
                    className="text-xs px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-colors shadow-sm"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === "system") {
              return (
                <div key={m.id} className="flex justify-center my-4 animate-fade-in">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600 max-w-md whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={m.role === "user" ? "flex gap-3 justify-end animate-fade-in" : "flex gap-3 animate-fade-in"}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-2xl rounded-br-sm px-5 py-3 max-w-[85%] text-sm whitespace-pre-wrap shadow-sm"
                      : m.isCompareResult
                        ? "bg-white border-2 border-purple-100 rounded-2xl rounded-bl-sm p-4 max-w-[85%] text-sm text-gray-800 whitespace-pre-wrap shadow-md relative"
                        : "bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-5 py-4 max-w-[85%] text-sm text-gray-800 whitespace-pre-wrap shadow-sm"
                  }
                >
                  {m.role === "assistant" && m.modelLabel && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                      <p className="text-[11px] uppercase tracking-wider text-purple-600 font-bold flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        {m.modelLabel}
                      </p>
                      {m.isCompareResult && (
                        <button className="text-gray-400 hover:text-green-600 transition-colors" title="Mark as best">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="leading-relaxed text-gray-700">
                    {m.content}
                  </div>
                  {m.role === "assistant" && (
                    <div className="mt-3 pt-2 flex justify-end">
                      <button className="text-gray-400 hover:text-gray-600" title="Copy response">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Token confirmation – review mode */}
          {confirmMode === "review" && pendingPrompt && (
            <div className="animate-fade-in">
              <div className="border border-purple-200 bg-gradient-to-b from-purple-50/50 to-white rounded-2xl p-5 shadow-lg max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Review Before Running</h4>
                </div>
                
                <div className="text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 mb-4 shadow-sm">
                  <span className="font-semibold text-gray-900 block mb-1">Prompt Summary:</span>
                  {summarizePrompt(confirmDraft || pendingPrompt.text, pendingPrompt.attachedFile)}
                </div>
                
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-gray-900">Selected Model:</span>{" "}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {pendingPrompt.modelLabel}
                  </span>
                </div>

                {renderTokensTable(confirmDraft || pendingPrompt.text, pendingPrompt.attachedFile, pendingPrompt.isCompareAll)}
                
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs">
                    <span className="text-gray-500 block">Current Balance:</span>
                    <span className="font-bold text-gray-900 text-sm">{tokenBalance}</span>
                  </div>
                  <div className="text-xs text-right">
                    <span className="text-gray-500 block">Balance After Task:</span>
                    <span className="font-bold text-gray-900 text-sm text-green-600">
                      {Math.max(
                        0,
                        tokenBalance - getEstTotalTokens(confirmDraft || pendingPrompt.text, pendingPrompt.attachedFile, pendingPrompt.isCompareAll)
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleConfirmRun}
                    className="text-sm font-medium px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
                  >
                    Confirm & Run
                  </button>
                  <button
                    onClick={handleModifyPrompt}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Modify Prompt
                  </button>
                  <button
                    onClick={handleCancelPrompt}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all ml-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Token confirmation – edit mode */}
          {confirmMode === "edit" && pendingPrompt && (
            <div className="animate-fade-in">
              <div className="border border-purple-200 bg-white rounded-2xl p-5 shadow-lg max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Modify Prompt</h4>
                </div>
                
                <textarea
                  ref={confirmTextareaRef}
                  value={confirmDraft}
                  onChange={(e) => setConfirmDraft(e.target.value)}
                  rows={4}
                  placeholder="Edit your prompt..."
                  className="w-full resize-none border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-inner"
                />
                
                {suggestedPrompt && (
                  <div className="mt-4 bg-purple-50/50 border border-purple-200 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <p className="text-[11px] uppercase tracking-wider text-purple-700 font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Suggested Improved Prompt
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {suggestedPrompt}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setConfirmDraft(suggestedPrompt);
                          handleReviewUpdatedPrompt();
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                      >
                        Use Improved Prompt
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDraft(pendingPrompt.text);
                          handleReviewUpdatedPrompt();
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Use Original
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-5 flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={handleReviewUpdatedPrompt}
                      className="text-sm font-medium px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                    >
                      Review Tokens
                    </button>
                    <button
                      onClick={handleCancelPrompt}
                      className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isThinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 lg:px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto">
          {/* Improve Prompt suggestion in composer */}
          {improved && (
            <div className="mb-3 bg-purple-50/80 border border-purple-200 rounded-xl p-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <p className="text-[11px] uppercase tracking-wider text-purple-700 font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Improved prompt
              </p>
              <p className="text-sm text-gray-800 mb-3">{improved}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={applyImproved}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                >
                  Use improved prompt
                </button>
                <button
                  onClick={() => {
                    setDraft(improved);
                    setImproved(null);
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-200 text-purple-800 hover:bg-purple-100 bg-white"
                >
                  Edit Manually
                </button>
                <button
                  onClick={() => setImproved(null)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Attached file chip */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-800 font-medium">
              <FileText className="w-3.5 h-3.5" />
              {attachedFile}
              <button
                onClick={() => setAttachedFile(null)}
                aria-label="Remove file"
                className="text-green-600 hover:text-green-900 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 relative">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              disabled={confirmMode !== null}
              placeholder={
                confirmMode
                  ? "Review the token estimate above before sending..."
                  : "Ask anything, compare models, or upload a file..."
              }
              className="flex-1 resize-none border border-gray-300 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 max-h-32 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all bg-gray-50/50 focus:bg-white"
            />
            <button
              onClick={handleSend}
              disabled={(!draft.trim() && !attachedFile) || isThinking || confirmMode !== null}
              className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shadow-md flex-shrink-0"
              aria-label="Send"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFilePick}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                Upload File
              </button>
              <button
                onClick={handleImprove}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Improve Prompt
              </button>
              <button
                onClick={handleSend}
                disabled={(!draft.trim() && !attachedFile) || isThinking || confirmMode !== null}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:flex"
              >
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                Estimate Tokens
              </button>
            </div>
            
            <div className="text-[10px] text-gray-400 hidden sm:block">
              Tokens are estimated before tasks run.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
