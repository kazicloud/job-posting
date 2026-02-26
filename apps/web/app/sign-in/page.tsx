"use client";

import { useState } from "react";
import { useSignIn, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const testimonials = [
  {
    quote: "Kazicloud made my job search so much easier. I found my dream role in just 2 weeks!",
    author: "Sarah Mwangi",
    role: "Software Engineer",
  },
  {
    quote: "The transparency in job postings is refreshing. No more guessing about salary ranges.",
    author: "James Ochieng",
    role: "Marketing Manager",
  },
  {
    quote: "As an employer, I found qualified candidates faster than any other platform.",
    author: "Linda Kamau",
    role: "HR Director",
  },
];

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Show already signed in message
  if (isLoaded && isSignedIn && user && !signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-text mb-2">
              Already Signed In
            </h1>
            <p className="text-neutral-text-secondary mb-1">
              You're currently signed in as
            </p>
            <p className="font-medium text-neutral-text">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                const response = await fetch("/api/user-role");
                const { primaryRole } = await response.json();
                const dashboard = primaryRole === "employer" ? "/employer-dashboard" : "/dashboard";
                router.push(dashboard);
              }}
              className="w-full py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
            >
              Continue to Dashboard
            </button>
            
            <button
              onClick={async () => {
                setSigningOut(true);
                await signOut({ redirectUrl: "/sign-in" });
              }}
              className="w-full py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary transition-colors"
            >
              Sign Out & Use Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_linkedin" | "oauth_facebook") => {
    if (!isLoaded || !signIn) return;

    try {
      setLoading(true);
      setError("");
      
      // Start OAuth flow
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/onboarding`,
      });
      
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      // Check what step we're at
      if (result.status === "complete") {
        // Sign in successful, set session
        await setActive({ session: result.createdSessionId });
        
        // Get user data to determine role
        const response = await fetch("/api/user-role");
        const { primaryRole } = await response.json();
        
        // Redirect based on role
        const dashboard = primaryRole === "employer" ? "/employer-dashboard" : "/dashboard";
        router.push(dashboard);
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        // Need to verify - check if email code is available
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        ) || result.supportedSecondFactors?.find(
          (f: any) => f.strategy === "email_code"
        );

        if (emailCodeFactor) {
          // Prepare email code verification
          const prepareMethod = result.status === "needs_first_factor" 
            ? signIn.prepareFirstFactor 
            : signIn.prepareSecondFactor;
            
          await prepareMethod.call(signIn, {
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          
          // Redirect to verification page
          router.push(`/verify-sign-in?email=${encodeURIComponent(formData.email)}&factor=${result.status === "needs_first_factor" ? "first" : "second"}`);
        } else {
          setError(`Verification required but email code not available. Please contact support.`);
        }
      } else {
        setError(`Unexpected status: ${result.status}. Please try again or contact support.`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/images/kazicloud-logo.jpg" 
                alt="Kazicloud" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-neutral-bg-secondary border-2 border-white" />
                ))}
              </div>
              <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                50,000+ members
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-neutral-text mb-2">
              Welcome back!
            </h1>
            <p className="text-neutral-text-secondary mb-8">
              Sign in to continue to your account
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-text">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-orange hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-neutral-text text-white font-medium rounded-lg hover:bg-neutral-text/90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-text-secondary">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("oauth_google")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("oauth_linkedin")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("oauth_facebook")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              <p className="text-center text-sm text-neutral-text-secondary">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-brand-orange hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="hidden lg:flex flex-1 bg-neutral-bg-secondary items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-xl text-neutral-text leading-relaxed mb-6">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-bg-secondary rounded-full" />
              <div>
                <p className="font-semibold text-neutral-text">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-sm text-neutral-text-secondary">
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentTestimonial ? "bg-brand-orange" : "bg-neutral-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
