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

export default function LoginPage() {
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

  const finishLogin = (override?: { email?: string; phone?: string; name?: string }) => {
    useAuthStore.getState().login(
      {
        id: "1",
        email: override?.email ?? email ?? "user@example.com",
        name: override?.name ?? "Demo User",
        phone: override?.phone ?? phone ?? "",
        currency: "INR",
        language: "en",
        createdAt: new Date().toISOString(),
        subscription: {
          id: "1",
          plan: "basic" as const,
          status: "active" as const,
          creditsBalance: 50,
          creditsUsed: 10,
          renewalDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
      "mock-token"
    );
  };

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

    // Social providers — simulate OAuth flow and log the user in directly.
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const fakeEmail = `${selected}.user@example.com`;
      finishLogin({ email: fakeEmail, name: `${capitalize(selected)} User` });
      await new Promise((r) => setTimeout(r, 100));
      window.location.href = "/chat";
    } catch {
      setErrors({
        method: `${capitalize(
          selected
        )} authorization failed. Please try again.`,
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
      // Demo: assume the email is registered. In a real flow the backend would
      // tell us if it isn't and we'd guide the user to "Create Account".
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
      finishLogin();
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <AuthBrandPanel
        title="Welcome back to Safal-AI."
        subtitle="Continue your work from one smart AI workspace — apps, files, models, and workflows in one place."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {step === "method" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Sign in to Safal-AI
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Choose how you want to sign in.
              </p>
            </div>

            {errors.method && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.method}
              </div>
            )}

            <div className="space-y-3">
              <ProviderButton
                label="Login with Email"
                icon={<Mail className="w-4 h-4" />}
                onClick={() => pickMethod("email")}
                disabled={isLoading}
                variant="primary"
              />
              <ProviderButton
                label="Login with Phone"
                icon={<Phone className="w-4 h-4" />}
                onClick={() => pickMethod("phone")}
                disabled={isLoading}
              />

              <Divider />

              <ProviderButton
                label="Login with Google"
                icon={<GoogleIcon />}
                onClick={() => pickMethod("google")}
                disabled={isLoading}
              />
              <ProviderButton
                label="Login with Apple"
                icon={<AppleIcon />}
                onClick={() => pickMethod("apple")}
                disabled={isLoading}
              />
              <ProviderButton
                label="Login with Microsoft"
                icon={<MicrosoftIcon />}
                onClick={() => pickMethod("microsoft")}
                disabled={isLoading}
              />
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Safal-AI?{" "}
              <Link
                href="/auth/register"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create Account
              </Link>
            </p>
          </>
        )}

        {step === "email" && (
          <>
            <BackButton
              onClick={() => {
                setStep("method");
                setErrors({});
              }}
            />
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Login with Email
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your registered email. We&apos;ll send a one-time code.
              </p>
            </div>
            <form onSubmit={sendEmailOtp} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              No account yet?{" "}
              <Link
                href="/auth/register"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create Account
              </Link>
            </p>
          </>
        )}

        {step === "phone" && (
          <>
            <BackButton
              onClick={() => {
                setStep("method");
                setErrors({});
              }}
            />
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Login with Phone
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your registered phone number. We&apos;ll send a one-time code.
              </p>
            </div>
            <form onSubmit={sendPhoneOtp} className="space-y-4">
              <Input
                type="tel"
                label="Phone Number"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              No account yet?{" "}
              <Link
                href="/auth/register"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create Account
              </Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <BackButton
              onClick={() => {
                setStep(method === "phone" ? "phone" : "email");
                setOtp("");
                setErrors({});
                setInfo("");
              }}
            />
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
              <p className="text-gray-500 mt-1 text-sm">
                We sent a verification code to{" "}
                <span className="font-medium text-gray-700">
                  {method === "phone" ? phone : email}
                </span>
              </p>
            </div>

            {info && !errors.otp && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            <form onSubmit={verifyOtp} className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                label="Enter OTP"
                placeholder="Enter 4-6 digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                error={errors.otp}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Verify & Sign In
              </Button>
            </form>

            <div className="text-center mt-4">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-400">
                  Resend OTP in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
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
