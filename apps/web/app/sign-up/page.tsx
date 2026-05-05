"use client";

import { useState, useEffect, Suspense } from "react";
import { useSignUp, useUser, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Building2, Users, Eye, EyeOff, ArrowLeft, Code, TrendingUp, DollarSign, Wrench, Heart, GraduationCap, Coffee, Sprout, HardHat, Truck, Palette, Headphones, Rocket, Building, Landmark, Castle, HandHeart, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { useSignUpStore } from "@/store/signup-store";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const testimonials = [
  {
    quote: "Kazicloud made my job search so much easier. I found my dream role in just 2 weeks!",
    author: "Sarah Mwangi",
    role: "Software Engineer",
    image: "/images/auth/kc-auth-testimonial1.webp",
  },
  {
    quote: "The transparency in job postings is refreshing. No more guessing about salary ranges.",
    author: "James Ochieng",
    role: "Marketing Manager",
    image: "/images/auth/kc-auth-testimonial2.jpeg",
  },
  {
    quote: "As an employer, I found qualified candidates faster than any other platform.",
    author: "Linda Kamau",
    role: "HR Director",
    image: "/images/auth/kc-auth-testimonial3.webp",
  },
];

const roles = [
  { value: "job_seeker", label: "Get a job", icon: Briefcase },
  { value: "employer", label: "Hire talent", icon: Building2 },
  // { value: "recruiter", label: "Get career help", icon: Users },
];

const jobSeekerFields = [
  { value: "technology", label: "Technology & IT", icon: Code },
  { value: "marketing", label: "Marketing & Sales", icon: TrendingUp },
  { value: "finance", label: "Finance & Accounting", icon: DollarSign },
  { value: "engineering", label: "Engineering", icon: Wrench },
  { value: "healthcare", label: "Healthcare", icon: Heart },
  { value: "education", label: "Education & Training", icon: GraduationCap },
  { value: "hospitality", label: "Hospitality & Tourism", icon: Coffee },
  { value: "agriculture", label: "Agriculture", icon: Sprout },
  { value: "construction", label: "Construction", icon: HardHat },
  { value: "logistics", label: "Logistics & Transport", icon: Truck },
  { value: "creative", label: "Creative & Design", icon: Palette },
  { value: "customer_service", label: "Customer Service", icon: Headphones },
  { value: "other", label: "Other", icon: Building2 },
];

const employerTypes = [
  { value: "startup", label: "Startup (1-10 employees)", icon: Rocket },
  { value: "small", label: "Small Business (11-50)", icon: Building },
  { value: "medium", label: "Medium Company (51-200)", icon: Landmark },
  { value: "large", label: "Large Enterprise (200+)", icon: Castle },
  { value: "ngo", label: "NGO/Non-Profit", icon: HandHeart },
  { value: "agency", label: "Recruitment Agency", icon: UserCheck },
];

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { username, selectedRoles, setUsername, setSelectedRoles, toggleRole, reset } = useSignUpStore();

  // Derive from the reactive searchParams hook — works correctly with
  // client-side navigation from the SSO callback.
  const isOAuthComplete = searchParams.get("oauth_complete") === "true";

  const [infoMessage, setInfoMessage] = useState("");
  const createFromSignup = useMutation(api.users.createFromSignup);

  // Redirect if already signed in — but NOT when completing the OAuth wizard,
  // because the user is intentionally signed-in-but-profiling.
  useEffect(() => {
    if (isLoaded && isSignedIn && !isOAuthComplete) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, isOAuthComplete, router]);

  // Pre-fill username from Clerk user when coming via oauth_complete flow.
  useEffect(() => {
    if (isOAuthComplete && user && !username) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      if (name) setUsername(name);
    }
  }, [isOAuthComplete, user, username, setUsername]);

  // Pre-select role from URL query param (?role=job_seeker or ?role=employer)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "job_seeker" || roleParam === "employer") {
      setSelectedRoles([roleParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show a contextual banner when the user arrived here from an OAuth
  // sign-in attempt without an existing Kazicloud account.
  useEffect(() => {
    if (isOAuthComplete) {
      setInfoMessage(
        "Your Google account is linked. Just complete your profile below and we'll get you started."
      );
    }
  }, [isOAuthComplete]);
  
  const [step, setStep] = useState(0);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [otherFieldDescription, setOtherFieldDescription] = useState("");
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyType: "",
    companyIndustry: [] as string[],
  });
  const [debouncedCompanyName, setDebouncedCompanyName] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [hasPrefilledName, setHasPrefilledName] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  // Check company name availability
  const companyNameCheck = useQuery(
    api.signupValidation.checkCompanyNameAvailability,
    debouncedCompanyName?.trim().length >= 2 ? { companyName: debouncedCompanyName } : "skip"
  );

  // Debounce company name
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(companyInfo.companyName);
    }, 500);
    return () => clearTimeout(timer);
  }, [companyInfo.companyName]);

  // Pre-fill first name when moving to step 2 (only once)
  useEffect(() => {
    if (step === 2 && username && !hasPrefilledName) {
      const nameParts = username.trim().split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      }));
      setHasPrefilledName(true);
    }
  }, [step, username, hasPrefilledName]);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (step === 3 && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCountdown]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && selectedRoles.length > 0) {
      setStep(1);
    }
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else if (prev.length < 3) {
        return [...prev, field];
      }
      return prev;
    });
  };

  const handleStep1Continue = async () => {
    const isJobSeeker = selectedRoles.includes("job_seeker");
    const isEmployer = selectedRoles.includes("employer");
    
    if (isJobSeeker && selectedFields.length === 0) return;
    if (isEmployer && !companyInfo.companyType) return;
    
    if (isEmployer) {
      setStep(1.5);
      return;
    }

    // OAuth complete path: Clerk account already exists, skip email/password.
    // Create the Convex profile now and go straight to onboarding.
    if (isOAuthComplete && user) {
      try {
        setLoading(true);
        setError("");
        await createFromSignup({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          roles: selectedRoles,
          fields: selectedFields.length > 0 ? selectedFields : undefined,
          otherFieldDescription: otherFieldDescription || undefined,
          companyInfo: undefined,
        });
        router.push("/onboarding");
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal path: go to account details (email/password).
    setStep(2);
  };

  const handleEmployerIndustryContinue = async () => {
    if (companyInfo.companyIndustry.length === 0) return;

    // OAuth complete path: create Convex profile and go to employer onboarding.
    if (isOAuthComplete && user) {
      try {
        setLoading(true);
        setError("");
        await createFromSignup({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          roles: selectedRoles,
          fields: undefined,
          otherFieldDescription: undefined,
          companyInfo: {
            companyName: companyInfo.companyName,
            companyType: companyInfo.companyType,
            companyIndustry: companyInfo.companyIndustry,
          },
        });
        router.push("/employer-onboarding");
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(2);
  };

  const handleIndustryToggle = (industry: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      companyIndustry: prev.companyIndustry.includes(industry)
        ? prev.companyIndustry.filter(i => i !== industry)
        : [...prev.companyIndustry, industry]
    }));
  };

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_linkedin_oidc" | "oauth_facebook") => {
    if (!isLoaded || !signUp) return;

    console.log("Starting OAuth signup for:", provider);
    setSsoLoading(true);

    try {
      // Store ALL signup data before OAuth redirect
      const signupData = {
        roles: selectedRoles,
        fields: selectedFields,
        otherFieldDescription,
        companyInfo: selectedRoles.includes("employer") ? companyInfo : null,
        timestamp: Date.now(),
      };
      
      sessionStorage.setItem('pendingSignupData', JSON.stringify(signupData));
      console.log("Saved signup data:", signupData);

      // Force signup mode - this will fail if account exists
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      });
    } catch (err: any) {
      console.error("OAuth signup error:", err);
      setSsoLoading(false);
      
      const errorMessage = err.errors?.[0]?.message || err.message || "";
      
      if (errorMessage.includes("already signed in")) {
        // Clear session and redirect to sign-in
        sessionStorage.removeItem('pendingSignupData');
        router.push("/sign-in?message=already_signed_in");
      } else if (errorMessage.includes("Identifier already exists") || errorMessage.includes("already exists")) {
        // Account exists, redirect to sign-in with OAuth
        sessionStorage.removeItem('pendingSignupData');
        router.push("/sign-in?message=account_exists_oauth");
      } else {
        setError(errorMessage || "OAuth sign up failed. Please try again.");
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      });

      // Save signup data to sessionStorage for later
      const signupDataToSave = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: selectedRoles,
        fields: selectedFields,
        otherFieldDescription,
        companyInfo: selectedRoles.includes("employer") ? companyInfo : undefined,
      };
      
      console.log("Saving signup data:", signupDataToSave);
      sessionStorage.setItem("signupData", JSON.stringify(signupDataToSave));

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push(`/sign-up/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      console.error("Sign up error:", err);
      const errorMessage = err.errors?.[0]?.message || "";
      
      // If account already exists, redirect to sign-in with email
      if (errorMessage.includes("Identifier already exists") || errorMessage.includes("already exists")) {
        router.push(`/sign-in?email=${encodeURIComponent(formData.email)}&message=account_exists`);
        return;
      }
      
      setError(errorMessage || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SSO Loading Overlay */}
      {ssoLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-neutral-text mb-2">Redirecting to sign in...</h3>
            <p className="text-neutral-text-secondary">Please wait while we connect your account</p>
            <p className="text-xs text-neutral-text-muted mt-4">Do not close or refresh this page</p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex">
        {/* Left Side - Form (2/3 width) */}
        <div className="w-full lg:w-2/3 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
          {/* Header */}
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
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                <img src="/images/auth/kc-auth-member1.webp" alt="Member" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="/images/auth/kc-auth-member2.webp" alt="Member" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="/images/auth/kc-auth-testimonial1.webp" alt="Member" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              </div>
              <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                50,000+ members
              </span>
            </div>
          </div>

          {infoMessage && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              {infoMessage}
            </div>
          )}

          {/* Step 0: Username + Role Selection */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-semibold text-neutral-text mb-2">
                Hi{" "}
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="______"
                  className="border-b-2 border-brand-orange bg-transparent outline-none text-center min-w-[100px] max-w-[200px] font-semibold"
                  style={{ width: `${Math.max(100, username.length * 16)}px` }}
                />
                ! Great to see you!
              </h1>
              <p className="text-neutral-text-secondary mb-8">
                👋 Let's get you started
              </p>

              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-1.5">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-3">
                    Tell us why you're here
                  </label>
                  <div className="space-y-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRoles.includes(role.value);
                      
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => toggleRole(role.value)}
                          className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            isSelected
                              ? "border-brand-orange bg-brand-orange/5"
                              : "border-neutral-border hover:border-brand-orange/50 hover:bg-brand-orange/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected ? "bg-brand-orange/10" : "bg-neutral-bg-secondary"
                            }`}>
                              <Icon className={`w-5 h-5 transition-colors ${
                                isSelected ? "text-brand-orange" : "text-neutral-text"
                              }`} />
                            </div>
                            <span className="font-medium text-neutral-text">{role.label}</span>
                            {isSelected && (
                              <div className="ml-auto w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!username.trim() || selectedRoles.length === 0}
                  className="w-full py-3 bg-neutral-text text-white font-medium rounded-lg hover:bg-neutral-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </form>

              <p className="text-center text-sm text-neutral-text-secondary mt-4">
                Have an account?{" "}
                <Link href="/sign-in" className="text-brand-orange hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* Step 1: Fields/Interests or Company Info */}
          {step === 1 && (
            <div>
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {selectedRoles.includes("job_seeker") && (
                <>
                  <h1 className="text-2xl font-semibold text-neutral-text mb-2">
                    Great to meet you, {username}!
                  </h1>
                  <p className="text-neutral-text-secondary mb-6">
                    What fields are you interested in? (Choose up to 3)
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {jobSeekerFields.map((field) => {
                      const Icon = field.icon;
                      const isSelected = selectedFields.includes(field.value);
                      const isDisabled = !isSelected && selectedFields.length >= 3;
                      
                      return (
                        <button
                          key={field.value}
                          type="button"
                          onClick={() => handleFieldToggle(field.value)}
                          disabled={isDisabled}
                          className={`p-3 border-2 rounded-lg transition-all text-left ${
                            isSelected
                              ? "border-brand-orange bg-brand-orange/5"
                              : isDisabled
                              ? "border-neutral-border opacity-50 cursor-not-allowed"
                              : "border-neutral-border hover:border-brand-orange/50"
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <Icon className={`w-5 h-5 ${isSelected ? "text-brand-orange" : "text-neutral-text-secondary"}`} />
                            <span className="text-sm font-medium text-neutral-text">{field.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedFields.includes("other") && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-text mb-1.5">
                        Tell us about your field
                      </label>
                      <textarea
                        value={otherFieldDescription}
                        onChange={(e) => setOtherFieldDescription(e.target.value.slice(0, 200))}
                        placeholder="Briefly describe your field or area of interest..."
                        maxLength={200}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
                      />
                      <p className="text-xs text-neutral-text-muted mt-1">
                        {otherFieldDescription.length}/200 characters
                      </p>
                    </div>
                  )}
                </>
              )}

              {selectedRoles.includes("employer") && (
                <>
                  <h1 className="text-2xl font-semibold text-neutral-text mb-2">
                    Tell us about your company
                  </h1>
                  <p className="text-neutral-text-secondary mb-6">
                    This helps us tailor your experience
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-1.5">
                        Company Name*
                      </label>
                      <input
                        type="text"
                        value={companyInfo.companyName}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                        placeholder="Enter company name"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-colors ${
                          companyNameCheck?.available === true
                            ? "border-green-500 bg-green-50/30"
                            : companyNameCheck?.available === false
                            ? "border-red-500 bg-red-50/30"
                            : "border-neutral-border"
                        }`}
                        required
                      />
                      {companyNameCheck?.message && (
                        <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${
                          companyNameCheck.available ? "text-green-600" : "text-red-600"
                        }`}>
                          {companyNameCheck.available ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>{companyNameCheck.message}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-3">
                        Company Size
                      </label>
                      <div className="space-y-2">
                        {employerTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = companyInfo.companyType === type.value;
                          
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setCompanyInfo({ ...companyInfo, companyType: type.value })}
                              className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                                isSelected
                                  ? "border-brand-orange bg-brand-orange/5"
                                  : "border-neutral-border hover:border-brand-orange/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${isSelected ? "text-brand-orange" : "text-neutral-text-secondary"}`} />
                                <span className="text-sm font-medium text-neutral-text">{type.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleStep1Continue}
                disabled={
                  (selectedRoles.includes("job_seeker") && selectedFields.length === 0) ||
                  (selectedRoles.includes("employer") && (!companyInfo.companyName.trim() || !companyInfo.companyType || companyNameCheck?.available === false))
                }
                className="w-full py-3 bg-neutral-text text-white font-medium rounded-lg hover:bg-neutral-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>

              <p className="text-center text-sm text-neutral-text-secondary mt-4">
                Have an account?{" "}
                <Link href="/sign-in" className="text-brand-orange hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* Step 1.5: Employer Industry Selection */}
          {step === 1.5 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-2xl font-semibold text-neutral-text mb-2">
                What industry is your company in?
              </h1>
              <p className="text-neutral-text-secondary mb-6">
                Select up to 3 most relevant industries
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {jobSeekerFields.map((field) => {
                  const Icon = field.icon;
                  const isSelected = companyInfo.companyIndustry.includes(field.value);
                  const isMaxReached = companyInfo.companyIndustry.length >= 3 && !isSelected;
                  
                  return (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => handleIndustryToggle(field.value)}
                      disabled={isMaxReached}
                      className={`p-3 border-2 rounded-lg transition-all text-left ${
                        isSelected
                          ? "border-brand-orange bg-brand-orange/5"
                          : isMaxReached
                          ? "border-neutral-border opacity-50 cursor-not-allowed"
                          : "border-neutral-border hover:border-brand-orange/50"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-brand-orange" : "text-neutral-text-secondary"}`} />
                        <span className="text-sm font-medium text-neutral-text">{field.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {companyInfo.companyIndustry.length >= 3 && (
                <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Maximum 3 industries selected. Deselect one to choose another.</span>
                </p>
              )}

              {companyInfo.companyIndustry.includes("other") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-text mb-1.5">
                    Describe your industry
                  </label>
                  <textarea
                    value={otherFieldDescription}
                    onChange={(e) => setOtherFieldDescription(e.target.value.slice(0, 200))}
                    placeholder="Briefly describe your company's industry..."
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
                  />
                  <p className="text-xs text-neutral-text-muted mt-1">
                    {otherFieldDescription.length}/200 characters
                  </p>
                </div>
              )}

              <button
                onClick={handleEmployerIndustryContinue}
                disabled={companyInfo.companyIndustry.length === 0}
                className="w-full py-3 bg-neutral-text text-white font-medium rounded-lg hover:bg-neutral-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>

              <p className="text-center text-sm text-neutral-text-secondary mt-4">
                Have an account?{" "}
                <Link href="/sign-in" className="text-brand-orange hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-2xl font-semibold text-neutral-text mb-2">
                You're almost there!
              </h1>
              <p className="text-neutral-text-secondary mb-8">
                Just one more step to set up your account.
              </p>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-1.5">
                      First name*
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-1.5">
                      Last name*
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-1.5">
                    Email*
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
                  <label className="block text-sm font-medium text-neutral-text mb-1.5">
                    Create password*
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Use at least 8 characters"
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange pr-12"
                      required
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

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-text-secondary">
                    <span className="text-red-500">*</span> I agree to the{" "}
                    <a href={`${process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3002'}/terms`} target="_blank" rel="noopener noreferrer" className="text-neutral-text underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href={`${process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3002'}/privacy`} target="_blank" rel="noopener noreferrer" className="text-neutral-text underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Required for sign-up flows - Clerk's bot protection */}
                <div id="clerk-captcha" />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-neutral-text text-white font-medium rounded-lg hover:bg-neutral-text/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating account..." : "Join Kazicloud"}
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
                    onClick={() => {
                      console.log("Google SSO clicked");
                      handleOAuthSignUp("oauth_google");
                    }}
                    disabled={ssoLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => {
                      console.log("LinkedIn SSO clicked");
                      handleOAuthSignUp("oauth_linkedin_oidc");
                    }}
                    disabled={ssoLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      console.log("Facebook SSO clicked");
                      handleOAuthSignUp("oauth_facebook");
                    }}
                    disabled={ssoLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                </div>

                <p className="text-center text-sm text-neutral-text-secondary">
                  Have an account?{" "}
                  <Link href="/sign-in" className="text-neutral-text hover:underline font-medium">
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-teal-500" : "bg-neutral-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Testimonials (1/3 width) */}
      <div className="hidden lg:flex lg:w-1/3 bg-neutral-bg-secondary items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-xl text-neutral-text leading-relaxed mb-6">
              "{testimonials[currentTestimonial]?.quote}"
            </p>
            <div className="flex items-center gap-3">
              <img 
                src={testimonials[currentTestimonial]?.image} 
                alt={testimonials[currentTestimonial]?.author}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-neutral-text">
                  {testimonials[currentTestimonial]?.author}
                </p>
                <p className="text-sm text-neutral-text-secondary">
                  {testimonials[currentTestimonial]?.role}
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
    </>
  );
}
