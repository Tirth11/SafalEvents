"use client";

import { CheckCircle, Circle, PlayCircle, X } from "lucide-react";
import { useOnboardingStore, useProductsStore, useLLMStore, useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function OnboardingChecklist() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { connections } = useProductsStore();
  const { apis } = useLLMStore();
  
  const {
    hasStartedCustomChat,
    hasUploadedFile,
    hasViewedTokens,
    isOnboardingDismissed,
    setDemoMode,
    dismissOnboarding
  } = useOnboardingStore();

  if (isOnboardingDismissed) return null;

  const hasConnectedProduct = Object.values(connections).some((c) => c.connected);
  const hasAddedApi = apis.length > 0;

  const steps = [
    { label: "Connect a SafalVir product", completed: hasConnectedProduct, href: "/integrations" },
    { label: "Add an AI model/API key", completed: hasAddedApi, href: "/integrations" },
    { label: "Start AI Workspace", completed: hasStartedCustomChat, href: "/chat?product=custom" },
    { label: "Upload your first file", completed: hasUploadedFile, href: null },
    { label: "Buy or view Safal Tokens", completed: hasViewedTokens, href: "/subscriptions" },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  
  // If all steps completed, optionally auto-dismiss after some time, but we'll let user dismiss.

  const handleDemoClick = () => {
    setDemoMode(true);
    router.push("/chat?product=custom");
  };

  return (
    <div className="max-w-2xl mx-auto w-full mb-8 animate-fade-in relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <button 
          onClick={dismissOnboarding}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
          aria-label="Dismiss checklist"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to SAFAL-AI{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h2>
        <p className="text-sm text-gray-500 mb-6">Complete these steps to set up your intelligent workspace.</p>

        <div className="mb-4 flex items-center justify-between text-sm font-medium text-gray-700">
          <span>Setup Progress</span>
          <span>{completedCount} of {steps.length} steps completed</span>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3 mb-8">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-3 rounded-lg border ${step.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}
            >
              {step.completed ? (
                <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
              ) : (
                <Circle className="text-gray-300 w-5 h-5 flex-shrink-0" />
              )}
              <span className={`flex-1 text-sm font-medium ${step.completed ? 'text-gray-700' : 'text-gray-600'}`}>
                {step.label}
              </span>
              {!step.completed && step.href && (
                <button 
                  onClick={() => router.push(step.href!)}
                  className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Do it now
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Not ready to set up?</h3>
              <p className="text-xs text-gray-500 mt-1">Try Safal-AI in demo mode without any API keys or connections.</p>
            </div>
            <button 
              onClick={handleDemoClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <PlayCircle size={16} /> Try Demo Without Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
