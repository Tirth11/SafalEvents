"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  GoogleIcon,
  AppleIcon,
  MicrosoftIcon,
} from "@/components/auth/ProviderIcons";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

type SocialProvider = "google" | "apple" | "microsoft";
type Step = "method" | "email" | "phone" | "otp";

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value: string) => /^\+?[\d\s-]{8,15}$/.test(value);

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"email" | "phone" | SocialProvider | null>(
    null
  );

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string>("");

  // ---------- helpers ----------
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishAuth = (override?: {
    email?: string;
    phone?: string;
    name?: string;
  }) => {
    const finalEmail = override?.email ?? email ?? "";
    const finalPhone = override?.phone ?? phone ?? "";
    const fallbackName =
      finalEmail.split("@")[0] ||
      (finalPhone ? `User ${finalPhone.slice(-4)}` : "Safal-AI User");

    useAuthStore.getState().login(
      {
        id: "1",
        email: finalEmail || "user@example.com",
        name: override?.name ?? fallbackName,
        phone: finalPhone,
        currency: "INR",
        language: "en",
        createdAt: new Date().toISOString(),
        subscription: {
          id: "1",
          plan: "free" as const,
          status: "active" as const,
          creditsBalance: 20,
          creditsUsed: 0,
          renewalDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
      "mock-token"
    );
  };

  // ---------- step handlers ----------
  const pickMethod = async (selected: "email" | "phone" | SocialProvider) => {
    setErrors({});
    setInfo("");
    setMethod(selected);

    if (selected === "email") {
      setStep("email");
      return;
    }
    if (selected === "phone") {
      setStep("phone");
      return;
    }

    // Social providers — simulate OAuth/OpenID redirect & callback,
    // then log the user straight in.
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const fakeEmail = `${selected}.user@example.com`;
      finishAuth({
        email: fakeEmail,
        name: `${capitalize(selected)} User`,
      });
      await new Promise((r) => setTimeout(r, 100));
      window.location.href = "/chat";
    } catch {
      setErrors({
        method: `${capitalize(selected)} authorization failed. Please try again.`,
      });
      setStep("method");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const trimmed = email.trim();
    if (!trimmed || !isEmail(trimmed)) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStep("otp");
      setInfo("OTP sent to your email.");
      startResendTimer();
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const trimmed = phone.trim();
    if (!trimmed || !isPhone(trimmed)) {
      setErrors({ phone: "Please enter a valid phone number." });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStep("otp");
      setInfo("OTP sent to your phone number.");
      startResendTimer();
    } catch {
      setErrors({ phone: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!otp.trim() || otp.length < 4) {
      setErrors({ otp: "Invalid OTP. Please try again." });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      // Demo: any 4-6 digit OTP passes — log the user straight in.
      finishAuth();
      await new Promise((r) => setTimeout(r, 100));
      window.location.href = "/chat";
    } catch {
      setErrors({ otp: "Invalid OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setInfo(
        method === "phone"
          ? "OTP sent to your phone number."
          : "OTP sent to your email."
      );
      startResendTimer();
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- render ----------
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <AuthBrandPanel
        title="Start using one AI platform for apps, files, models, and workflows."
        subtitle="Create your Safal-AI account to connect AI models, upload files, and automate everyday tasks."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {step === "method" && (
          <MethodStep
            onPick={pickMethod}
            isLoading={isLoading}
            error={errors.method}
          />
        )}

        {step === "email" && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            error={errors.email}
            onBack={() => {
              setStep("method");
              setErrors({});
            }}
            onSubmit={sendEmailOtp}
            isLoading={isLoading}
          />
        )}

        {step === "phone" && (
          <PhoneStep
            phone={phone}
            setPhone={setPhone}
            error={errors.phone}
            onBack={() => {
              setStep("method");
              setErrors({});
            }}
            onSubmit={sendPhoneOtp}
            isLoading={isLoading}
          />
        )}

        {step === "otp" && (
          <OtpStep
            destination={method === "phone" ? phone : email}
            otp={otp}
            setOtp={setOtp}
            error={errors.otp}
            info={info}
            onBack={() => {
              setStep(method === "phone" ? "phone" : "email");
              setOtp("");
              setErrors({});
              setInfo("");
            }}
            onSubmit={verifyOtp}
            isLoading={isLoading}
            resendTimer={resendTimer}
            onResend={resendOtp}
          />
        )}
      </div>
    </div>
  );
}

// =================== sub-components ===================

function MethodStep({
  onPick,
  isLoading,
  error,
}: {
  onPick: (m: "email" | "phone" | SocialProvider) => void;
  isLoading: boolean;
  error?: string;
}) {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create your Safal-AI account
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Choose how you want to continue.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <ProviderButton
          label="Continue with Email"
          icon={<Mail className="w-4 h-4" />}
          onClick={() => onPick("email")}
          disabled={isLoading}
          variant="primary"
        />
        <ProviderButton
          label="Continue with Phone"
          icon={<Phone className="w-4 h-4" />}
          onClick={() => onPick("phone")}
          disabled={isLoading}
        />

        <Divider />

        <ProviderButton
          label="Continue with Google"
          icon={<GoogleIcon />}
          onClick={() => onPick("google")}
          disabled={isLoading}
        />
        <ProviderButton
          label="Continue with Apple"
          icon={<AppleIcon />}
          onClick={() => onPick("apple")}
          disabled={isLoading}
        />
        <ProviderButton
          label="Continue with Microsoft"
          icon={<MicrosoftIcon />}
          onClick={() => onPick("microsoft")}
          disabled={isLoading}
        />
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}

function EmailStep({
  email,
  setEmail,
  error,
  onBack,
  onSubmit,
  isLoading,
}: {
  email: string;
  setEmail: (v: string) => void;
  error?: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Continue with Email</h1>
        <p className="text-gray-500 mt-1 text-sm">
          We&apos;ll send a one-time code to your email.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Send OTP
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </>
  );
}

function PhoneStep({
  phone,
  setPhone,
  error,
  onBack,
  onSubmit,
  isLoading,
}: {
  phone: string;
  setPhone: (v: string) => void;
  error?: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Continue with Phone</h1>
        <p className="text-gray-500 mt-1 text-sm">
          We&apos;ll send a one-time code to your phone.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="tel"
          label="Phone Number"
          placeholder="+91 98765 43210"
          icon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Send OTP
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </>
  );
}

function OtpStep({
  destination,
  otp,
  setOtp,
  error,
  info,
  onBack,
  onSubmit,
  isLoading,
  resendTimer,
  onResend,
}: {
  destination: string;
  otp: string;
  setOtp: (v: string) => void;
  error?: string;
  info?: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  resendTimer: number;
  onResend: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
        <p className="text-gray-500 mt-1 text-sm">
          We sent a verification code to{" "}
          <span className="font-medium text-gray-700">{destination}</span>
        </p>
      </div>

      {info && !error && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="text"
          inputMode="numeric"
          label="Enter OTP"
          placeholder="Enter 4-6 digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          error={error}
          className="text-center text-lg tracking-widest"
          maxLength={6}
          required
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Verify & Continue
        </Button>
      </form>

      <div className="text-center mt-4">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-400">Resend OTP in {resendTimer}s</p>
        ) : (
          <button
            onClick={onResend}
            disabled={isLoading}
            className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
            type="button"
          >
            Resend OTP
          </button>
        )}
      </div>
    </>
  );
}

// =================== bits ===================

function ProviderButton({
  label,
  icon,
  onClick,
  disabled,
  variant = "outline",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "primary";
}) {
  const base =
    "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
      : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <span className="flex items-center justify-center w-5">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400">or</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function BackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      type="button"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
