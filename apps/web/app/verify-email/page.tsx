"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { CheckCircle2, Mail, Clock } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { signUp } = useSignUp();
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    if (!canResend || resendStatus === "sending") return;

    setResendStatus("sending");
    try {
      if (signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_link" });
        setResendStatus("sent");
        setCountdown(60);
        setCanResend(false);
        setTimeout(() => setResendStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Failed to resend email:", err);
      setResendStatus("idle");
    }
  };

  const handleOpenEmail = () => {
    const emailDomain = email.split("@")[1];
    const emailProviders: Record<string, string> = {
      "gmail.com": "https://mail.google.com",
      "yahoo.com": "https://mail.yahoo.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
    };
    
    const url = emailProviders[emailDomain] || `mailto:${email}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Email Icon */}
        <div className="w-32 h-32 mx-auto mb-8 bg-brand-orange/10 rounded-full flex items-center justify-center">
          <Mail className="w-16 h-16 text-brand-orange" strokeWidth={1.5} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-neutral-text mb-6">
            Click the link in your email!
          </h1>

          <p className="text-neutral-text-secondary text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Click the link in the email we just sent to{" "}
            <span className="font-semibold text-neutral-text">{email}</span>{" "}
            to verify your new Kazicloud account.
          </p>

          {/* Quick Action Button */}
          <button
            onClick={handleOpenEmail}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors mb-8"
          >
            <Mail className="w-5 h-5" />
            Open Email App
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-neutral-bg-secondary rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-neutral-text mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-orange" />
            What to do next:
          </h3>
          <ol className="space-y-3 text-sm text-neutral-text-secondary">
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-text">1.</span>
              <span>Check your inbox for an email from Kazicloud</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-text">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-text">3.</span>
              <span>You'll be automatically redirected to your dashboard</span>
            </li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="text-center">
          <p className="text-sm text-neutral-text-secondary mb-4">
            Didn't receive the email? Check your spam folder or
          </p>
          
          {resendStatus === "sent" ? (
            <div className="inline-flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Email sent! Check your inbox
            </div>
          ) : (
            <button
              onClick={handleResendEmail}
              disabled={!canResend || resendStatus === "sending"}
              className="text-sm font-medium text-brand-orange hover:underline disabled:text-neutral-text-muted disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {resendStatus === "sending" ? (
                "Sending..."
              ) : !canResend ? (
                <>
                  <Clock className="w-4 h-4" />
                  Resend in {countdown}s
                </>
              ) : (
                "Resend verification email"
              )}
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/sign-in"
            className="text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
