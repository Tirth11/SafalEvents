"use client";

import { Sparkles, Bot, Plug, Upload, Zap } from "lucide-react";

interface AuthBrandPanelProps {
  title: string;
  subtitle: string;
}

const items = [
  { icon: Bot, label: "Connect AI models" },
  { icon: Plug, label: "Integrate apps" },
  { icon: Upload, label: "Upload files" },
  { icon: Zap, label: "Automate tasks" },
];

export default function AuthBrandPanel({ title, subtitle }: AuthBrandPanelProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-50 via-white to-purple-50 border border-gray-100 rounded-2xl p-8 lg:p-10 min-h-[520px]">
      <div>
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 mb-6">
          <Sparkles size={12} className="text-green-600" />
          <span>Single AI Platform for Everything</span>
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-4 text-gray-600 leading-relaxed">{subtitle}</p>
      </div>

      <ul className="mt-10 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
              <item.icon size={18} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-700">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
