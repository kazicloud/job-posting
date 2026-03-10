"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Mail } from "lucide-react";

export default function AdminSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [verificationFactor, setVerificationFactor] = useState<"first" | "second">("first");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        ) || result.supportedSecondFactors?.find(
          (f: any) => f.strategy === "email_code"
        );

        if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
          if (result.status === "needs_first_factor") {
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setVerificationFactor("first");
          } else {
            await signIn.prepareSecondFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setVerificationFactor("second");
          }
          setVerifying(true);
        } else {
          setError("Verification required but email code not available");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      let result;
      if (verificationFactor === "first") {
        result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
      } else {
        result = await signIn.attemptSecondFactor({
          strategy: "email_code",
          code,
        });
      }

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signIn) return;

    try {
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (f: any) => f.strategy === "email_code"
      ) || signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "email_code"
      );

      if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
        if (verificationFactor === "first") {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        } else {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        }
        setError("");
        alert("Code resent! Check your email.");
      }
    } catch (err: any) {
      setError("Failed to resend code");
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-border p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-brand-orange" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-text mb-2">Check your email</h1>
              <p className="text-neutral-text-secondary">
                We sent a verification code to<br />
                <span className="font-medium text-neutral-text">{formData.email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <button
              onClick={() => setVerifying(false)}
              className="mt-4 w-full text-sm text-neutral-text-secondary hover:text-neutral-text"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-border p-8">
          <div className="text-center mb-8">
            <img 
              src="/images/kazicloud-logo.jpg" 
              alt="Kazicloud" 
              className="h-10 w-10 rounded-lg mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-neutral-text mb-2">Admin Sign In</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="admin@kazicloud.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text-muted hover:text-neutral-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-text-muted mt-6">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
