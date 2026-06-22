"use client";

import { Button } from "@/components/ui/Button";
import {
  Package,
  ExternalLink,
  Shield,
  CheckCircle,
} from "lucide-react";

interface ProductConnectProps {
  productName: string;
  /** Optional one-line description shown under the heading */
  description?: string;
  onConnect: () => void;
  isConnecting?: boolean;
  status?: "Live" | "Launching Soon";
  logo?: string;
}

export function ProductConnect({
  productName,
  description,
  onConnect,
  isConnecting = false,
  status = "Live",
  logo,
}: ProductConnectProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6 p-2">
        {logo ? (
          <img src={logo} alt={productName} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-10 h-10 text-gray-400" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Connect your {productName} account
        </h2>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        {description ||
          `Please login with ${productName} to connect this product. After authorization, Safal-AI can securely access your ${productName} data.`}
      </p>

      <Button
        onClick={onConnect}
        size="lg"
        isLoading={isConnecting}
        disabled={status === "Launching Soon"}
        className="my-4"
      >
        {logo ? (
          <img src={logo} alt="" className="w-4 h-4 mr-2 object-contain filter grayscale opacity-70" />
        ) : (
          <Package className="w-4 h-4 mr-2" />
        )}
        {status === "Launching Soon" ? "Coming Soon" : `Login with ${productName}`}
        {status === "Live" && <ExternalLink className="w-4 h-4 ml-2" />}
      </Button>

      <div className="max-w-sm space-y-3 mt-2">
        <div className="flex items-start gap-3 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>
            Your {productName} password is never stored in Safal-AI. We use
            secure token-based authorization.
          </span>
        </div>
        <div className="flex items-start gap-3 text-xs text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>
            You can disconnect this product anytime from Settings or Sidebar.
          </span>
        </div>
      </div>
    </div>
  );
}
