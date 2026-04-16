"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

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
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to reset password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="/images/kazicloud-logo.jpg" 
              alt="Kazicloud" 
              className="h-10 w-10 rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-neutral-text">
                Kazi<span className="text-brand-orange">cloud</span>
              </span>
              <span className="text-[10px] text-neutral-text-secondary font-medium tracking-wide">
                MASTERING RECRUITMENT
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">
            Create new password
          </h1>
          <p className="text-neutral-text-secondary">
            Enter the code sent to {email} and your new password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1.5">
              Verification code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange pr-12"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-sm text-brand-orange hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
