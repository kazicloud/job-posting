"use client";

import { useState, useEffect, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUpStore } from "@/store/signup-store";

function VerifyContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { selectedRoles, reset } = useSignUpStore();

  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Get signup data from sessionStorage
        const signupData = sessionStorage.getItem("signupData");
        let primaryRole = "job_seeker";
        
        if (signupData) {
          const data = JSON.parse(signupData);
          primaryRole = data.roles[0] || "job_seeker";
          
          // Call HTTP endpoint to save additional signup data
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace('/.well-known/openid-configuration', '');
          await fetch(`${convexUrl}/signup-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerkId: completeSignUp.createdUserId!,
              roles: data.roles,
              fields: data.fields,
              otherFieldDescription: data.otherFieldDescription,
              companyInfo: data.companyInfo,
            }),
          });
          
          sessionStorage.removeItem("signupData");
        }
        
        reset();
        if (primaryRole === "job_seeker") {
          router.push("/onboarding");
        } else if (primaryRole === "employer") {
          router.push("/employer-onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendCountdown > 0) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCountdown(30);
      setError("");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-bg-secondary">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-semibold text-neutral-text">Kazicloud</span>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-text mb-2">
            Check your email
          </h1>
          <p className="text-neutral-text-secondary mb-8">
            We sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={verificationCode[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*$/.test(value)) return;
                    
                    const newCode = verificationCode.split('');
                    newCode[index] = value;
                    setVerificationCode(newCode.join(''));
                    
                    if (value && index < 5) {
                      const nextInput = e.target.nextElementSibling as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-2xl font-semibold border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCountdown > 0}
              className="text-sm text-neutral-text-secondary hover:text-brand-orange disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-neutral-text-secondary"
            >
              Didn't receive a code?{" "}
              <span className="font-medium">
                {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : "Resend"}
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-brand-orange text-white py-3 rounded-lg font-medium hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
