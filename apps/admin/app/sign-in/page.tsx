"use client";

import { useState } from "react";
import { useSignIn, useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Mail, AlertTriangle } from "lucide-react";

export default function AdminSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const isAdmin = useQuery(api.admin.isAdmin);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [verificationFactor, setVerificationFactor] = useState<"first" | "second">("first");

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirectUrl: "/sign-in" });
  };

  // Wait until both Clerk and the isAdmin query have resolved
  if (!isLoaded || (isSignedIn && isAdmin === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Signed in as a confirmed admin
  if (isSignedIn && isAdmin === true && !signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-brand-orange" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-text mb-2">Already Signed In</h1>
            <p className="text-neutral-text-secondary mb-1">Signed in as admin</p>
            <p className="font-medium text-neutral-text">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-3 border border-neutral-border text-neutral-text font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors"
            >
              Sign Out & Use Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but NOT an admin (job seeker / employer on wrong app)
  if (isSignedIn && isAdmin === false && !signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-text mb-2">Wrong Account</h1>
            <p className="text-neutral-text-secondary mb-1">
              You're signed in as a regular user. This portal is for administrators only.
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-text">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors"
            >
              Sign Out & Sign In as Admin
            </button>
            <a
              href={process.env.NEXT_PUBLIC_WEB_URL || "https://kazicloud.co.ke"}
              className="block w-full py-3 border border-neutral-border text-neutral-text font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors text-center"
            >
              Go to Kazicloud
            </a>
          </div>
        </div>
      </div>
    );
  }

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
