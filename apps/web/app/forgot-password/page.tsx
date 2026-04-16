"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to send reset code");
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
            Reset your password
          </h1>
          <p className="text-neutral-text-secondary">
            Enter your email and we'll send you a code to reset your password
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset code"}
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
