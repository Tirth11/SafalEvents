"use client";

import { formatRelativeTime } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { FileText } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600 max-w-md w-full">
          {message.content && (
            <div className="whitespace-pre-wrap mb-3 text-center text-sm font-medium">
              {message.content}
            </div>
          )}
          {message.tokenUsage && (
            <div className="w-full rounded-lg border border-gray-200 overflow-hidden text-xs mt-2">
              <table className="w-full text-left bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 font-medium text-gray-600">Token Type</th>
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Safal Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="px-3 py-2">Input Tokens Used</td>
                    <td className="px-3 py-2 text-right">{message.tokenUsage.input}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Output Tokens Used</td>
                    <td className="px-3 py-2 text-right">{message.tokenUsage.output}</td>
                  </tr>
                  <tr className="font-semibold text-gray-900 bg-gray-50">
                    <td className="px-3 py-2">Total Tokens Deducted</td>
                    <td className="px-3 py-2 text-right">{message.tokenUsage.total}</td>
                  </tr>
                </tbody>
              </table>
              <div className="px-3 py-2 bg-gray-50 text-right text-green-600 font-semibold border-t border-gray-200">
                Remaining Balance: {message.tokenUsage.remaining}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
            U
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-green-600 text-white rounded-br-md shadow-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 px-1 mt-1">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
