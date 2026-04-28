"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Step 1: Send reset code ──────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep(2);
    } catch (err: any) {
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "No account found with that email address."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ──────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    setCode("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
    } catch (err: any) {
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "Failed to resend code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Store code, advance (format check only) ─────────────────────
  const handleCodeStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setStep(3);
  };

  // ── Step 3: Submit code + password to Clerk — real verification ──────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const response = await fetch("/api/user-role");
        const { primaryRole, onboardingCompleted } = await response.json();
        let destination: string;
        if (!onboardingCompleted) {
          destination = primaryRole === "employer" ? "/employer-onboarding" : "/onboarding";
        } else {
          destination = primaryRole === "employer" ? "/employer-dashboard" : "/dashboard";
        }
        router.push(destination);
      }
    } catch (err: any) {
      const clerkCode = err.errors?.[0]?.code ?? "";
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Failed to reset password.";
      if (
        clerkCode === "form_code_incorrect" ||
        clerkCode === "verification_failed" ||
        clerkCode === "form_identifier_not_found"
      ) {
        // Wrong code — send back to re-enter it
        setError("That code is incorrect or has expired. Please try again.");
        setCode("");
        setStep(2);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <div className="flex items-center gap-3 mb-6">
      <img src="/images/kazicloud-logo.jpg" alt="Kazicloud" className="h-10 w-10 rounded-lg" />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-neutral-text">
          Kazi<span className="text-brand-orange">cloud</span>
        </span>
        <span className="text-[10px] text-neutral-text-secondary font-medium tracking-wide">
          MASTERING RECRUITMENT
        </span>
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {([1, 2, 3] as Step[]).map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step > s
                ? "bg-brand-orange text-white"
                : step === s
                  ? "bg-brand-orange text-white ring-4 ring-brand-orange/20"
                  : "bg-neutral-bg-secondary text-neutral-text-secondary"
            }`}
          >
            {step > s ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
          </div>
          {s < 3 && (
            <div
              className={`h-0.5 w-10 transition-colors ${
                step > s ? "bg-brand-orange" : "bg-neutral-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
        <Logo />
        <StepIndicator />

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Step 1: Email ─────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-text mb-2">Reset your password</h1>
              <p className="text-sm text-neutral-text-secondary">
                Enter your account email and we'll send you a verification code.
              </p>
            </div>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Verification code ──────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-text mb-2">Check your email</h1>
              <p className="text-sm text-neutral-text-secondary">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-neutral-text">{email}</span>. Enter it below.
              </p>
            </div>
            <form onSubmit={handleCodeStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => {
                    setError("");
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange tracking-[0.5em] text-center text-xl font-mono"
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={code.length < 6}
                className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </form>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => { setStep(1); setError(""); setCode(""); }}
                className="flex items-center gap-1 text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="text-brand-orange hover:underline disabled:opacity-50"
              >
                {loading ? "Sending..." : "Resend code"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: New password — Clerk verifies code + password here ─── */}
        {step === 3 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-text mb-2">Create new password</h1>
              <p className="text-sm text-neutral-text-secondary">
                Choose a strong password for your account.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setError(""); setPassword(e.target.value); }}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange pr-12"
                    required
                    autoFocus
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-text-secondary hover:text-neutral-text"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setError(""); setConfirmPassword(e.target.value); }}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-text-secondary hover:text-neutral-text"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>
            <div className="mt-4">
              <button
                onClick={() => { setStep(2); setError(""); setPassword(""); setConfirmPassword(""); }}
                className="flex items-center gap-1 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center border-t border-neutral-border pt-5">
          <Link href="/sign-in" className="text-sm text-brand-orange hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
