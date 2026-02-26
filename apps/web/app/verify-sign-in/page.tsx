"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifySignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const factor = searchParams.get("factor") || "first"; // "first" or "second"

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const attemptMethod = factor === "first" 
        ? signIn.attemptFirstFactor 
        : signIn.attemptSecondFactor;
        
      const result = await attemptMethod.call(signIn, {
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signIn) return;

    try {
      const prepareMethod = factor === "first" 
        ? signIn.prepareFirstFactor 
        : signIn.prepareSecondFactor;
        
      await prepareMethod.call(signIn, {
        strategy: "email_code",
      });
      alert("Code resent! Check your email.");
    } catch (err: any) {
      setError("Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">
            Check your email
          </h1>
          <p className="text-neutral-text-secondary">
            We sent a verification code to<br />
            <span className="font-medium text-neutral-text">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-center text-2xl tracking-widest"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-brand-orange hover:underline"
          >
            Didn't receive the code? Resend
          </button>
        </div>
      </div>
    </div>
  );
}
