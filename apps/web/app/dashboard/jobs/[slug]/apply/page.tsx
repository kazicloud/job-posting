"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Upload, X, FileText, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = use(params);
  const router = useRouter();

  // The "id" param may be a URL slug (contains hyphens) or a raw Convex ID.
  // Slugs always contain hyphens; Convex IDs are alphanumeric only.
  const isSlug = id.includes("-");

  // When a slug is given, resolve it to the actual job document first.
  const jobBySlug = useQuery(
    api.jobs.getPublicBySlug,
    isSlug ? { slug: id } : "skip"
  );

  // Derive the real Convex ID — use the resolved ID for all downstream queries.
  const resolvedId = isSlug ? jobBySlug?._id : id;
  const jobId = resolvedId as Id<"jobs"> | undefined;

  const job = useQuery(api.jobs.get, jobId ? { id: jobId } : "skip");
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const hasApplied = useQuery(api.applications.hasApplied, jobId ? { jobId } : "skip");
  const apply = useAction(api.applications.applyWithDetails);
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: "",
    email: "",
    phone: "",
    location: "",
    
    // Step 2: Resume & Documents
    resumeOption: "profile" as "profile" | "upload",
    resumeFile: null as File | null,
    portfolioUrl: "",
    
    // Step 3: Additional Information
    coverLetter: "",
    linkedInUrl: "",
    availability: "",
    salaryCurrency: "KES",
    salaryExpectations: "",
    workAuthorization: "",
    willingToRelocate: false,
    
    // Custom answers
    customAnswers: {} as Record<number, string | string[]>,
  });

  // Pre-fill from profile
  useEffect(() => {
    if (profile && !formData.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
      }));
    }
  }, [profile]);

  if (!job || !profile) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Check profile completeness (minimum 75% required)
  // This ensures: Basic Info (30%) + Education (20%) + Skills (15%) + Preferences (10%) = 75%
  // Experience is optional for entry-level, interns, and attachees
  const profileCompleteness = profile.jobSeekerProfile?.profileCompleteness || 0;
  if (profileCompleteness < 75) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-text mb-2">Complete Your Profile</h2>
            <p className="text-neutral-text-secondary mb-4">
              Your profile is {profileCompleteness}% complete. You need at least 75% completion to apply for jobs.
            </p>
            <p className="text-sm text-neutral-text-muted mb-6">
              Complete your basic information, education, skills, and preferences to apply.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-block px-6 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (hasApplied) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-text mb-2">Already Applied</h2>
            <p className="text-neutral-text-secondary mb-6">
              You've already submitted an application for this position.
            </p>
            <Link
              href="/dashboard/applications"
              className="inline-block px-6 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90"
            >
              View My Applications
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const settings = job.applicationSettings || {
    requireResume: true,
    requireCoverLetter: false,
    requirePortfolio: false,
    requireLinkedIn: false,
    requireAvailability: false,
    requireSalaryExpectations: false,
    requireWorkAuthorization: false,
    requireWillingToRelocate: false,
    customQuestions: [],
  };

  // Build dynamic steps
  const steps = [
    { title: "Personal Details", icon: <Briefcase className="w-5 h-5" /> },
    { title: "Resume & Documents", icon: <FileText className="w-5 h-5" /> },
  ];

  // Add unified additional questions step if any extra info or custom questions are required
  const hasAdditionalQuestions =
    settings.requireCoverLetter ||
    settings.requireLinkedIn ||
    settings.requireAvailability ||
    settings.requireSalaryExpectations ||
    settings.requireWorkAuthorization ||
    settings.requireWillingToRelocate ||
    (settings.customQuestions && settings.customQuestions.length > 0);

  if (hasAdditionalQuestions) {
    steps.push({ title: "Additional Questions", icon: <FileText className="w-5 h-5" /> });
  }

  steps.push({ title: "Review & Submit", icon: <Check className="w-5 h-5" /> });

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Personal Details
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
    }

    if (step === 1) {
      // Resume & Documents
      if (settings.requireResume) {
        if (formData.resumeOption === "upload" && !formData.resumeFile) {
          newErrors.resume = "Please upload a resume or use your profile resume";
        }
      }
      if (settings.requirePortfolio && !formData.portfolioUrl.trim()) {
        newErrors.portfolioUrl = "Portfolio URL is required";
      } else if (formData.portfolioUrl && !/^https?:\/\/.+/.test(formData.portfolioUrl)) {
        newErrors.portfolioUrl = "Invalid URL format";
      }
    }

    if (steps[step]?.title === "Additional Questions") {
      // Standard required fields
      if (settings.requireCoverLetter && !formData.coverLetter.trim()) {
        newErrors.coverLetter = "Cover letter is required";
      }
      if (settings.requireLinkedIn && !formData.linkedInUrl.trim()) {
        newErrors.linkedInUrl = "LinkedIn URL is required";
      } else if (formData.linkedInUrl && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedInUrl)) {
        newErrors.linkedInUrl = "Invalid LinkedIn URL";
      }
      if (settings.requireAvailability && !formData.availability) {
        newErrors.availability = "Availability is required";
      }
      if (settings.requireSalaryExpectations && !formData.salaryExpectations.trim()) {
        newErrors.salaryExpectations = "Salary expectations are required";
      }
      if (settings.requireWorkAuthorization && !formData.workAuthorization) {
        newErrors.workAuthorization = "Work authorization is required";
      }
      // Custom questions — validate required ones
      if (settings.customQuestions) {
        settings.customQuestions.forEach((q: any, idx: number) => {
          if (q.required) {
            const answer = formData.customAnswers[idx];
            const isEmpty = !answer || (Array.isArray(answer) ? answer.length === 0 : !String(answer).trim());
            if (isEmpty) newErrors[`custom_${idx}`] = `${q.question} is required`;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    try {
      let applicationResumeStorageId: string | undefined;

      // Upload custom resume if provided
      if (formData.resumeOption === "upload" && formData.resumeFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": formData.resumeFile.type },
          body: formData.resumeFile,
        });
        if (!result.ok) throw new Error("Failed to upload resume");
        const { storageId } = await result.json();
        applicationResumeStorageId = storageId;
      }

      await apply({
        jobId,
        applicationResumeStorageId,
        coverLetter: formData.coverLetter || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        linkedInUrl: formData.linkedInUrl || undefined,
        availability: formData.availability || undefined,
        salaryExpectations: formData.salaryExpectations
          ? `${formData.salaryCurrency} ${formData.salaryExpectations}`
          : undefined,
        workAuthorization: formData.workAuthorization || undefined,
        willingToRelocate: formData.willingToRelocate || undefined,
        customAnswers: Object.entries(formData.customAnswers).map(([index, answer]) => ({
          questionIndex: parseInt(index),
          answer: answer as any,
        })),
      });
      
      router.push(`/dashboard/jobs/${job?.slug || jobId}?applied=true`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Header */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/jobs/${job?.slug || jobId}`}
                className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Job</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <button
                onClick={() => router.back()}
                className="text-neutral-text-secondary hover:text-neutral-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Desktop Progress */}
            <div className="hidden sm:flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep ? "bg-green-600 text-white" :
                      index === currentStep ? "bg-brand-orange text-white" :
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      index <= currentStep ? "text-neutral-text" : "text-neutral-text-muted"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? "bg-green-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Progress */}
            <div className="sm:hidden mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep < steps.length - 1 ? "bg-brand-orange text-white" : "bg-green-600 text-white"
                }`}>
                  {currentStep < steps.length - 1 ? steps[currentStep]?.icon : <Check className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-text">{steps[currentStep]?.title}</p>
                  <p className="text-xs text-neutral-text-muted">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-brand-orange h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            <p className="text-sm text-neutral-text-secondary hidden sm:block">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Application Requirements Summary */}
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Application Requirements</h3>
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm text-blue-800">
              <span>✓ Personal details</span>
              {settings.requireResume && <span>✓ Resume/CV</span>}
              {settings.requireCoverLetter && <span>✓ Cover letter</span>}
              {settings.requirePortfolio && <span>✓ Portfolio</span>}
              {settings.requireLinkedIn && <span>✓ LinkedIn profile</span>}
              {settings.requireAvailability && <span>✓ Availability</span>}
              {settings.requireSalaryExpectations && <span>✓ Salary expectations</span>}
              {settings.requireWorkAuthorization && <span>✓ Work authorization</span>}
              {settings.customQuestions && settings.customQuestions.length > 0 && (
                <span>✓ {settings.customQuestions.length} additional {settings.customQuestions.length === 1 ? 'question' : 'questions'}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-neutral-border rounded-lg p-8">
                {currentStep === 0 && <PersonalDetailsStep formData={formData} setFormData={setFormData} errors={errors} />}
                {currentStep === 1 && <ResumeStep formData={formData} setFormData={setFormData} settings={settings} errors={errors} />}
                {steps[currentStep]?.title === "Additional Questions" && currentStep !== steps.length - 1 && (
                  <AdditionalQuestionsStep formData={formData} setFormData={setFormData} settings={settings} errors={errors} />
                )}
                {currentStep === steps.length - 1 && (
                  <ReviewStep formData={formData} job={job} settings={settings} />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-border">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-6 py-2.5 border border-neutral-border text-neutral-text font-medium rounded-lg hover:bg-neutral-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Job Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-neutral-border rounded-lg p-6 sticky top-20">
                <h3 className="text-sm font-semibold text-neutral-text mb-4">Applying for</h3>
                <h2 className="text-lg font-bold text-neutral-text mb-2">{job.title}</h2>
                <p className="text-sm text-neutral-text-secondary mb-4">{job.companyName}</p>
                
                <div className="space-y-2 text-sm text-neutral-text-secondary mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.employmentType}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {job.currency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-border pt-4">
                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Application Checklist</h4>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {index < currentStep ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : index === currentStep ? (
                          <div className="w-4 h-4 rounded-full border-2 border-brand-orange" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={index <= currentStep ? "text-neutral-text" : "text-neutral-text-muted"}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Step Components
function PersonalDetailsStep({ formData, setFormData, errors }: any) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-text mb-2">Personal Details</h2>
      <p className="text-neutral-text-secondary mb-6">
        Review and confirm your contact information
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
              errors.fullName ? "border-red-500" : "border-neutral-border"
            }`}
            required
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
              errors.email ? "border-red-500" : "border-neutral-border"
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
              errors.phone ? "border-red-500" : "border-neutral-border"
            }`}
            required
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Nairobi, Kenya"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
              errors?.location ? "border-red-500" : "border-neutral-border"
            }`}
            required
          />
          {errors?.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumeStep({ formData, setFormData, settings, errors }: any) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-text mb-2">Resume & Documents</h2>
      <p className="text-neutral-text-secondary mb-6">
        Upload your resume and any additional documents
      </p>

      <div className="space-y-6">
        {settings.requireResume && (
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-3">
              Resume/CV <span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-neutral-border rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
                <input
                  type="radio"
                  name="resumeOption"
                  value="profile"
                  checked={formData.resumeOption === "profile"}
                  onChange={(e) => setFormData({ ...formData, resumeOption: e.target.value })}
                  className="w-4 h-4 text-brand-orange"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-text">Use resume from profile</p>
                  <p className="text-sm text-neutral-text-secondary">Your current profile resume will be used</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-neutral-border rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
                <input
                  type="radio"
                  name="resumeOption"
                  value="upload"
                  checked={formData.resumeOption === "upload"}
                  onChange={(e) => setFormData({ ...formData, resumeOption: e.target.value })}
                  className="w-4 h-4 text-brand-orange"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-text">Upload new resume</p>
                  <p className="text-sm text-neutral-text-secondary">
                    PDF or DOCX, max 5MB
                  </p>
                </div>
              </label>

              {formData.resumeOption === "upload" && (
                <div className="ml-7 mt-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-neutral-border rounded-lg cursor-pointer hover:border-brand-orange transition-colors bg-neutral-bg-secondary/50">
                    <Upload className="w-5 h-5 text-neutral-text-muted" />
                    <span className="text-sm text-neutral-text-secondary">
                      Click to upload or drag and drop
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => setFormData({ ...formData, resumeFile: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-neutral-text-muted mt-2">
                    Accepted formats: PDF, DOCX • Max size: 5MB
                  </p>
                  {formData.resumeFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 flex-1">{formData.resumeFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, resumeFile: null })}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {settings.requirePortfolio && (
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Portfolio URL {settings.requirePortfolio && <span className="text-red-600">*</span>}
            </label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.com"
              className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AdditionalQuestionsStep({ formData, setFormData, settings, errors }: any) {
  const customQuestions = settings.customQuestions || [];

  const handleAnswerChange = (index: number, answer: string | string[]) => {
    setFormData({
      ...formData,
      customAnswers: {
        ...formData.customAnswers,
        [index]: answer,
      },
    });
  };

  const hasStandardFields =
    settings.requireCoverLetter ||
    settings.requireLinkedIn ||
    settings.requireAvailability ||
    settings.requireSalaryExpectations ||
    settings.requireWorkAuthorization ||
    settings.requireWillingToRelocate;

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-text mb-2">Additional Questions</h2>
      <p className="text-neutral-text-secondary mb-6">
        Please provide the following information requested by the employer
      </p>

      <div className="space-y-6">
        {/* ── Standard required fields ── */}
        {hasStandardFields && (
          <div className="space-y-5">
            {settings.requireCoverLetter && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Cover Letter <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  rows={8}
                  placeholder="Tell us why you're interested in this position..."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none ${
                    errors.coverLetter ? "border-red-400" : "border-neutral-border"
                  }`}
                />
                {errors.coverLetter && <p className="text-xs text-red-600 mt-1">{errors.coverLetter}</p>}
              </div>
            )}

            {settings.requireLinkedIn && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  LinkedIn Profile <span className="text-red-600">*</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedInUrl}
                  onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                    errors.linkedInUrl ? "border-red-400" : "border-neutral-border"
                  }`}
                />
                {errors.linkedInUrl && <p className="text-xs text-red-600 mt-1">{errors.linkedInUrl}</p>}
              </div>
            )}

            {settings.requireAvailability && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Availability to Start <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                    errors.availability ? "border-red-400" : "border-neutral-border"
                  }`}
                >
                  <option value="">Select availability</option>
                  <option value="immediately">Immediately</option>
                  <option value="2-weeks">2 weeks notice</option>
                  <option value="1-month">1 month notice</option>
                  <option value="2-months">2 months notice</option>
                  <option value="negotiable">Negotiable</option>
                </select>
                {errors.availability && <p className="text-xs text-red-600 mt-1">{errors.availability}</p>}
              </div>
            )}

            {settings.requireSalaryExpectations && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Salary Expectations <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.salaryCurrency}
                    onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                    className="px-3 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white text-sm"
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="TZS">TZS</option>
                    <option value="UGX">UGX</option>
                    <option value="ZAR">ZAR</option>
                    <option value="NGN">NGN</option>
                    <option value="GHS">GHS</option>
                    <option value="EGP">EGP</option>
                  </select>
                  <input
                    type="text"
                    value={formData.salaryExpectations}
                    onChange={(e) => setFormData({ ...formData, salaryExpectations: e.target.value })}
                    placeholder="e.g., 200,000 - 250,000"
                    className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                      errors.salaryExpectations ? "border-red-400" : "border-neutral-border"
                    }`}
                  />
                </div>
                {errors.salaryExpectations && <p className="text-xs text-red-600 mt-1">{errors.salaryExpectations}</p>}
              </div>
            )}

            {settings.requireWorkAuthorization && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Work Authorization <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.workAuthorization}
                  onChange={(e) => setFormData({ ...formData, workAuthorization: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                    errors.workAuthorization ? "border-red-400" : "border-neutral-border"
                  }`}
                >
                  <option value="">Select status</option>
                  <option value="citizen">Citizen</option>
                  <option value="permanent-resident">Permanent Resident</option>
                  <option value="work-permit">Work Permit</option>
                  <option value="require-sponsorship">Require Sponsorship</option>
                </select>
                {errors.workAuthorization && <p className="text-xs text-red-600 mt-1">{errors.workAuthorization}</p>}
              </div>
            )}

            {settings.requireWillingToRelocate && (
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.willingToRelocate}
                    onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
                    className="w-4 h-4 text-brand-orange rounded"
                  />
                  <span className="text-sm font-medium text-neutral-text">
                    I am willing to relocate for this position <span className="text-red-600">*</span>
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Custom employer questions ── */}
        {customQuestions.length > 0 && (
          <div className={hasStandardFields ? "pt-4 border-t border-neutral-border space-y-5" : "space-y-5"}>
            {hasStandardFields && (
              <p className="text-sm font-semibold text-neutral-text-secondary uppercase tracking-wide">
                Employer Questions
              </p>
            )}
            {customQuestions.map((question: any, index: number) => (
              <div key={index}>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {question.question} {question.required && <span className="text-red-600">*</span>}
                </label>

                {question.type === "text" && (
                  <input
                    type="text"
                    value={formData.customAnswers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    maxLength={question.maxLength}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                      errors[`custom_${index}`] ? "border-red-400" : "border-neutral-border"
                    }`}
                  />
                )}

                {question.type === "textarea" && (
                  <textarea
                    value={formData.customAnswers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    maxLength={question.maxLength}
                    rows={4}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none ${
                      errors[`custom_${index}`] ? "border-red-400" : "border-neutral-border"
                    }`}
                  />
                )}

                {question.type === "select" && (
                  <select
                    value={formData.customAnswers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                      errors[`custom_${index}`] ? "border-red-400" : "border-neutral-border"
                    }`}
                  >
                    <option value="">Select an option</option>
                    {question.options?.map((option: string, i: number) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {question.type === "radio" && (
                  <div className="space-y-2">
                    {question.options?.map((option: string, i: number) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={formData.customAnswers[index] === option}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="w-4 h-4 text-brand-orange"
                        />
                        <span className="text-sm text-neutral-text">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "checkbox" && (
                  <div className="space-y-2">
                    {question.options?.map((option: string, i: number) => {
                      const currentAnswers = (formData.customAnswers[index] as string[]) || [];
                      return (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={option}
                            checked={currentAnswers.includes(option)}
                            onChange={(e) => {
                              const newAnswers = e.target.checked
                                ? [...currentAnswers, option]
                                : currentAnswers.filter((a: string) => a !== option);
                              handleAnswerChange(index, newAnswers);
                            }}
                            className="w-4 h-4 text-brand-orange rounded"
                          />
                          <span className="text-sm text-neutral-text">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {errors[`custom_${index}`] && (
                  <p className="text-xs text-red-600 mt-1">{errors[`custom_${index}`]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewStep({ formData, job, settings }: any) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-text mb-2">Review Your Application</h2>
      <p className="text-neutral-text-secondary mb-6">
        Please review all information before submitting
      </p>

      <div className="space-y-6">
        <div className="p-4 bg-neutral-bg-secondary rounded-lg">
          <h3 className="font-semibold text-neutral-text mb-3">Personal Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-text-secondary">Name:</span> {formData.fullName}</p>
            <p><span className="text-neutral-text-secondary">Email:</span> {formData.email}</p>
            <p><span className="text-neutral-text-secondary">Phone:</span> {formData.phone}</p>
            <p><span className="text-neutral-text-secondary">Location:</span> {formData.location}</p>
          </div>
        </div>

        <div className="p-4 bg-neutral-bg-secondary rounded-lg">
          <h3 className="font-semibold text-neutral-text mb-3">Documents</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-text-secondary">Resume:</span> {formData.resumeOption === "profile" ? "Using profile resume" : formData.resumeFile?.name || "Not uploaded"}</p>
            {formData.portfolioUrl && <p><span className="text-neutral-text-secondary">Portfolio:</span> {formData.portfolioUrl}</p>}
          </div>
        </div>

        {/* All additional answers — standard fields + custom questions in one block */}
        {(formData.coverLetter || formData.linkedInUrl || formData.availability ||
          formData.salaryExpectations || formData.workAuthorization || formData.willingToRelocate ||
          Object.keys(formData.customAnswers).length > 0) && (
          <div className="p-4 bg-neutral-bg-secondary rounded-lg">
            <h3 className="font-semibold text-neutral-text mb-3">Additional Questions</h3>
            <div className="space-y-2 text-sm">
              {formData.coverLetter && (
                <p><span className="text-neutral-text-secondary">Cover Letter:</span> Provided</p>
              )}
              {formData.linkedInUrl && (
                <p><span className="text-neutral-text-secondary">LinkedIn:</span> {formData.linkedInUrl}</p>
              )}
              {formData.availability && (
                <p><span className="text-neutral-text-secondary">Availability:</span> {formData.availability}</p>
              )}
              {formData.salaryExpectations && (
                <p><span className="text-neutral-text-secondary">Salary Expectations:</span> {formData.salaryCurrency} {formData.salaryExpectations}</p>
              )}
              {formData.workAuthorization && (
                <p><span className="text-neutral-text-secondary">Work Authorization:</span> {formData.workAuthorization}</p>
              )}
              {formData.willingToRelocate !== undefined && formData.willingToRelocate && (
                <p><span className="text-neutral-text-secondary">Willing to Relocate:</span> Yes</p>
              )}
              {settings.customQuestions && settings.customQuestions.map((question: any, index: number) => {
                const answer = formData.customAnswers[index];
                if (!answer && !Array.isArray(answer)) return null;
                if (Array.isArray(answer) && answer.length === 0) return null;
                return (
                  <div key={index}>
                    <p className="text-neutral-text-secondary font-medium">{question.question}</p>
                    <p className="text-neutral-text mt-0.5">
                      {Array.isArray(answer) ? answer.join(", ") : answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 border-2 border-brand-orange/20 bg-orange-50 rounded-lg">
          <p className="text-sm text-neutral-text">
            By submitting this application, you confirm that all information provided is accurate and complete.
          </p>
        </div>
      </div>
    </div>
  );
}
