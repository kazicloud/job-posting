"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

// ── Accept Invite Inner (needs Suspense for useSearchParams) ─────────────────

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const { userId } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();

  const invite = useQuery(api.admin.getInviteByToken, token ? { token } : "skip");
  const acceptInvite = useMutation(api.admin.acceptAdminInvite);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId, router]);

  // Token states
  if (!token) {
    return <ErrorState message="No invite token found. Please use the link from your email." />;
  }

  if (invite === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (invite === null || invite.isExpired || invite.status === "expired") {
    return (
      <ErrorState
        message={
          invite?.isExpired
            ? "This invitation has expired. Please ask a super-admin to resend it."
            : "This invitation link is invalid or has already been used."
        }
      />
    );
  }

  if (invite.status === "accepted") {
    return (
      <ErrorState
        icon="success"
        message="This invitation has already been accepted. You can sign in directly."
        actionLabel="Go to Sign In"
        actionHref="/sign-in"
      />
    );
  }

  // ── Step 1: Password form ──────────────────────────────────────────────────

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [firstName, ...rest] = invite.fullName.split(" ");
      const lastName = rest.join(" ") || firstName;

      await signUp.create({
        emailAddress: invite.email,
        password,
        firstName,
        lastName,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(
        clerkErr?.errors?.[0]?.message ?? "Sign-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP verification ───────────────────────────────────────────────

  const handleCodeChange = (idx: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 1);
    setCode((prev) => {
      const next = [...prev];
      next[idx] = d;
      return next;
    });
    if (d && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: fullCode });
      if (result.status === "complete" && result.createdUserId) {
        // Activate the admin record in Convex
        await acceptInvite({ inviteToken: token, clerkId: result.createdUserId });
        await setActive({ session: result.createdSessionId });
        setStep("done");
        setTimeout(() => router.replace("/dashboard"), 2000);
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(
        clerkErr?.errors?.[0]?.message ?? "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 text-center">
          <div className="inline-flex items-center gap-2 mb-5">
            <img
              src="/images/kazicloud-logo.jpg"
              alt="Kazicloud"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-gray-900">
              Kazi<span className="text-[#DC842C]">cloud</span>
            </span>
          </div>
          {step === "done" ? (
            <>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Welcome aboard!</h1>
              <p className="text-sm text-gray-500 mt-1">Redirecting you to the dashboard…</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#DC842C]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8 text-[#DC842C]" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Accept your invitation</h1>
              <p className="text-sm text-gray-500 mt-1">
                You're joining as <strong>{invite.roleName ?? "Admin"}</strong> — {invite.email}
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {step === "form" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <p className="text-sm text-gray-600">
                Hello <strong>{invite.fullName}</strong>! Set a password to create your admin account.
              </p>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={invite.email}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Set Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#DC842C] text-white text-sm font-semibold rounded-lg hover:bg-[#DC842C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-gray-600 text-center">
                We sent a 6-digit code to <strong>{invite.email}</strong>. Enter it below to verify your account.
              </p>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* OTP input */}
              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C]"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.join("").length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#DC842C] text-white text-sm font-semibold rounded-lg hover:bg-[#DC842C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Verify & Activate"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-2">
              <Loader className="w-5 h-5 animate-spin text-[#DC842C] mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────

function ErrorState({
  message,
  icon = "error",
  actionLabel,
  actionHref,
}: {
  message: string;
  icon?: "error" | "success";
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            icon === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {icon === "success" ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500" />
          )}
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          {icon === "success" ? "Already accepted" : "Invalid invitation"}
        </h2>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        {actionLabel && actionHref && (
          <a
            href={actionHref}
            className="inline-block px-5 py-2.5 bg-[#DC842C] text-white text-sm font-semibold rounded-lg hover:bg-[#DC842C]/90 transition-colors"
          >
            {actionLabel}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Export with Suspense (required by useSearchParams) ────────────────────────

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-6 h-6 animate-spin text-[#DC842C]" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
