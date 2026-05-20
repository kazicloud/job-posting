"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState } from "react";
import { ArrowLeft, Save, Eye, Briefcase, MapPin, DollarSign, Clock, Users, FileText, CheckCircle, CheckCircle2, Building2, GraduationCap, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { formatLocation } from "@/lib/east-africa-locations";
import { buildLocationArgs, type LocationEntry } from "@/lib/location-utils";
import { LocationSection } from "@/components/location-picker";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useMutation(api.jobMutations.create);
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    department: "",
    customDepartment: "",
    employmentType: "",
    workplaceType: "",
    
    // Location
    country: "Kenya",
    region: "",
    city: "",
    multipleLocations: false,
    locations: [] as Array<{ country: string; region: string; city?: string }>,
    isRemote: false,
    
    // Description
    description: "",
    responsibilities: "",
    requirements: "",
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    niceToHave: "",
    
    // Compensation
    salaryDisclosure: "range", // range, undisclosed
    salaryMin: "",
    salaryMax: "",
    currency: "KES", // auto-updated when country changes
    salaryPeriod: "year", // year, month, hour
    benefits: "",
    
    // Application
    applicationDeadline: "",
    positions: "1",
    experienceLevel: "",
    
    // Application Settings (NEW)
    applicationSettings: {
      requireResume: true,
      requireCoverLetter: false,
      requirePortfolio: false,
      requireLinkedIn: false,
      requireAvailability: false,
      requireSalaryExpectations: false,
      requireWorkAuthorization: false,
      requireWillingToRelocate: false,
      customQuestions: [] as Array<{
        question: string;
        type: "text" | "textarea" | "select" | "radio" | "checkbox" | "file";
        required: boolean;
        options?: string[];
        maxFileSize: number;
        acceptedFileTypes: string[];
      }>,
    },
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: Briefcase },
    { number: 2, title: "Description", icon: FileText },
    { number: 3, title: "Requirements", icon: CheckCircle },
    { number: 4, title: "Compensation", icon: DollarSign },
    { number: 5, title: "Application Settings", icon: Users },
    { number: 6, title: "Preview", icon: Eye },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateMultipleFields = (updates: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSaveDraft = async () => {
    if (!profile) return;
    const resolvedCompanyName = profile.employerProfile?.companyName;
    if (!resolvedCompanyName) {
      alert("Your company profile is incomplete. Please set your company name in Settings before posting a job.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { location, county } = buildLocationArgs(formData);
      await createJob({
        employerId: profile._id,
        title: formData.title,
        companyName: resolvedCompanyName,
        department: formData.department === "other" ? formData.customDepartment : formData.department,
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location,
        county,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        niceToHave: formData.niceToHave,
        salaryDisclosure: formData.salaryDisclosure,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        currency: formData.currency,
        salaryPeriod: formData.salaryPeriod,
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        positions: parseInt(formData.positions),
        experienceLevel: formData.experienceLevel,
        status: "draft",
        applicationSettings: {
          requireResume: formData.applicationSettings.requireResume,
          requireCoverLetter: formData.applicationSettings.requireCoverLetter,
          requirePortfolio: formData.applicationSettings.requirePortfolio,
          requireLinkedIn: formData.applicationSettings.requireLinkedIn,
          requireAvailability: formData.applicationSettings.requireAvailability,
          requireSalaryExpectations: formData.applicationSettings.requireSalaryExpectations,
          requireWorkAuthorization: formData.applicationSettings.requireWorkAuthorization,
          requireWillingToRelocate: formData.applicationSettings.requireWillingToRelocate,
          customQuestions: (formData.applicationSettings.customQuestions || []).map((q: any) => ({
            ...q,
            acceptedFileTypes: q.acceptedFileTypes || [],
            maxFileSize: q.maxFileSize || 5,
          })),
        },
      });
      router.push("/employer-dashboard/jobs");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    const resolvedCompanyName = profile.employerProfile?.companyName;
    if (!resolvedCompanyName) {
      alert("Your company profile is incomplete. Please set your company name in Settings before posting a job.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { location, county } = buildLocationArgs(formData);
      await createJob({
        employerId: profile._id,
        title: formData.title,
        companyName: resolvedCompanyName,
        department: formData.department === "other" ? formData.customDepartment : formData.department,
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location,
        county,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        niceToHave: formData.niceToHave,
        salaryDisclosure: formData.salaryDisclosure,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        currency: formData.currency,
        salaryPeriod: formData.salaryPeriod,
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        positions: parseInt(formData.positions),
        experienceLevel: formData.experienceLevel,
        status: "published",
        applicationSettings: {
          requireResume: formData.applicationSettings.requireResume,
          requireCoverLetter: formData.applicationSettings.requireCoverLetter,
          requirePortfolio: formData.applicationSettings.requirePortfolio,
          requireLinkedIn: formData.applicationSettings.requireLinkedIn,
          requireAvailability: formData.applicationSettings.requireAvailability,
          requireSalaryExpectations: formData.applicationSettings.requireSalaryExpectations,
          requireWorkAuthorization: formData.applicationSettings.requireWorkAuthorization,
          requireWillingToRelocate: formData.applicationSettings.requireWillingToRelocate,
          customQuestions: (formData.applicationSettings.customQuestions || []).map((q: any) => ({
            ...q,
            acceptedFileTypes: q.acceptedFileTypes || [],
            maxFileSize: q.maxFileSize || 5,
          })),
        },
      });
      router.push("/employer-dashboard/jobs");
    } catch (error) {
      console.error("Error publishing job:", error);
      alert("Failed to publish job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link
            href="/employer-dashboard/jobs"
            className="p-1.5 sm:p-2 hover:bg-neutral-bg-secondary rounded-md transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-text-secondary" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text">Post a New Job</h1>
            <p className="text-sm sm:text-base text-neutral-text-secondary hidden sm:block">Fill in the details to attract the right candidates</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          {/* Desktop Progress */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-brand-orange text-white"
                          : "bg-neutral-border text-neutral-text-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-neutral-text" : "text-neutral-text-muted"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-neutral-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Mobile Progress */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep < 6 ? "bg-brand-orange text-white" : "bg-green-500 text-white"
              }`}>
                {currentStep < 6 ? (
                  (() => {
                    const Icon = steps[currentStep - 1]?.icon;
                    return Icon ? <Icon className="w-5 h-5" /> : null;
                  })()
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-text">{steps[currentStep - 1]?.title}</p>
                <p className="text-xs text-neutral-text-muted">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-orange h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 lg:p-8">
            {currentStep === 1 && (
              <BasicInfoStep formData={formData} updateFormData={updateFormData} updateMultipleFields={updateMultipleFields} onNext={nextStep} />
            )}
            {currentStep === 2 && (
              <DescriptionStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
            )}
            {currentStep === 3 && (
              <RequirementsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
            )}
            {currentStep === 4 && (
              <CompensationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
            )}
            {currentStep === 5 && (
              <ApplicationSettingsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
            )}
            {currentStep === 6 && (
              <PreviewStep 
                formData={formData} 
                onBack={prevStep}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                isSubmitting={isSubmitting}
                onJumpToStep={setCurrentStep}
              />
            )}
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function BasicInfoStep({ formData, updateFormData, updateMultipleFields, onNext }: any) {
  const departments = [
    { value: "technology", label: "Technology & IT" },
    { value: "marketing", label: "Marketing & Sales" },
    { value: "finance", label: "Finance & Accounting" },
    { value: "engineering", label: "Engineering" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education & Training" },
    { value: "hospitality", label: "Hospitality & Tourism" },
    { value: "agriculture", label: "Agriculture" },
    { value: "construction", label: "Construction" },
    { value: "logistics", label: "Logistics & Transport" },
    { value: "creative", label: "Creative & Design" },
    { value: "customer_service", label: "Customer Service" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-text mb-2">Basic Information</h2>
        <p className="text-neutral-text-secondary">Start with the essentials about this role</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Job Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Department *
          </label>
          <select
            required
            value={formData.department}
            onChange={(e) => updateFormData("department", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
        {formData.department === "other" && (
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Specify Department *
            </label>
            <input
              type="text"
              required
              value={formData.customDepartment}
              onChange={(e) => updateFormData("customDepartment", e.target.value)}
              placeholder="Enter department name"
              className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Number of Positions *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.positions}
            onChange={(e) => updateFormData("positions", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Employment Type *
          </label>
          <select
            required
            value={formData.employmentType}
            onChange={(e) => updateFormData("employmentType", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <option value="">Select type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Workplace Type *
          </label>
          <select
            required
            value={formData.workplaceType}
            onChange={(e) => updateFormData("workplaceType", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <option value="">Select type</option>
            <option value="on-site">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <LocationSection
        country={formData.country}
        region={formData.region}
        city={formData.city}
        multipleLocations={formData.multipleLocations}
        locations={formData.locations}
        onSingleChange={(updates) => updateMultipleFields(updates)}
        onMultipleLocationsToggle={(checked) => updateFormData("multipleLocations", checked)}
        onLocationsChange={(locs) => updateFormData("locations", locs)}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Experience Level *
        </label>
        <select
          required
          value={formData.experienceLevel}
          onChange={(e) => updateFormData("experienceLevel", e.target.value)}
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        >
          <option value="">Select level</option>
          <option value="intern">Intern</option>
          <option value="attachee">Attachee</option>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="mid">Mid Level (3-5 years)</option>
          <option value="senior">Senior Level (6-10 years)</option>
          <option value="lead">Lead/Principal (10+ years)</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
      >
        Continue
      </button>
    </form>
  );
}

function DescriptionStep({ formData, updateFormData, onNext, onBack }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: string) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      
      // Check if current line starts with bullet
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine?.trim().startsWith('•') || currentLine?.trim().startsWith('-')) {
        e.preventDefault();
        const newValue = textBefore + '\n• ' + textAfter;
        updateFormData(field, newValue);
        
        // Set cursor position after the bullet
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
        }, 0);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-text mb-2">Job Description</h2>
        <p className="text-neutral-text-secondary">Describe the role and what makes it exciting</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Job Description *
        </label>
        <textarea
          required
          rows={6}
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Provide a clear overview of the role, team, and what the candidate will be working on..."
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          {formData.description.length} characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Key Responsibilities *
        </label>
        <textarea
          required
          rows={6}
          value={formData.responsibilities}
          onChange={(e) => updateFormData("responsibilities", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "responsibilities")}
          placeholder="• Design and develop scalable backend systems&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers&#10;• Write clean, maintainable code"
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          Press Enter to auto-add bullet points • Use bullet format for clarity
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function RequirementsStep({ formData, updateFormData, onNext, onBack }: any) {
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [deadlineError, setDeadlineError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.requiredSkills.length < 3) {
      alert("Please add at least 3 required skills");
      return;
    }
    
    // Validate application deadline
    if (!formData.applicationDeadline) {
      setDeadlineError("Application deadline is required");
      return;
    }
    
    const selectedDate = new Date(formData.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (selectedDate < today) {
      setDeadlineError("Deadline cannot be in the past");
      return;
    }
    
    if (selectedDate > maxDate) {
      setDeadlineError("Deadline cannot be more than 30 days from today");
      return;
    }
    
    setDeadlineError("");
    onNext();
  };

  const handleDeadlineChange = (value: string) => {
    updateFormData("applicationDeadline", value);
    setDeadlineError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: string) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine?.trim().startsWith('•') || currentLine?.trim().startsWith('-')) {
        e.preventDefault();
        const newValue = textBefore + '\n• ' + textAfter;
        updateFormData(field, newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
        }, 0);
      }
    }
  };

  const addRequiredSkill = () => {
    if (requiredSkillInput.trim() && formData.requiredSkills.length < 5) {
      updateFormData("requiredSkills", [...formData.requiredSkills, requiredSkillInput.trim()]);
      setRequiredSkillInput("");
    }
  };

  const removeRequiredSkill = (index: number) => {
    updateFormData("requiredSkills", formData.requiredSkills.filter((_: any, i: number) => i !== index));
  };

  const addPreferredSkill = () => {
    if (preferredSkillInput.trim()) {
      updateFormData("preferredSkills", [...formData.preferredSkills, preferredSkillInput.trim()]);
      setPreferredSkillInput("");
    }
  };

  const removePreferredSkill = (index: number) => {
    updateFormData("preferredSkills", formData.preferredSkills.filter((_: any, i: number) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-text mb-2">Requirements & Skills</h2>
        <p className="text-neutral-text-secondary">Define qualifications and key skills needed</p>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Required Skills * (Minimum 3, Maximum 5)
        </label>
        <p className="text-xs text-neutral-text-muted mb-3">
          Add the most critical skills needed for this role. These will be used for candidate matching.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={requiredSkillInput}
            onChange={(e) => setRequiredSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
            placeholder="e.g., React, Python, AWS"
            className="flex-1 px-4 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            disabled={formData.requiredSkills.length >= 5}
          />
          <button
            type="button"
            onClick={addRequiredSkill}
            disabled={!requiredSkillInput.trim() || formData.requiredSkills.length >= 5}
            className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.requiredSkills.map((skill: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeRequiredSkill(index)}
                className="hover:text-orange-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {formData.requiredSkills.length < 3 && (
          <p className="text-xs text-red-500 mt-2">
            Add at least {3 - formData.requiredSkills.length} more skill(s)
          </p>
        )}
      </div>

      {/* Preferred Skills */}
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Preferred Skills (Optional)
        </label>
        <p className="text-xs text-neutral-text-muted mb-3">
          Nice-to-have skills that would be a bonus
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={preferredSkillInput}
            onChange={(e) => setPreferredSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
            placeholder="e.g., Docker, GraphQL"
            className="flex-1 px-4 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
          <button
            type="button"
            onClick={addPreferredSkill}
            disabled={!preferredSkillInput.trim()}
            className="px-4 py-2 bg-neutral-border text-neutral-text rounded-md hover:bg-neutral-bg-secondary disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.preferredSkills.map((skill: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => removePreferredSkill(index)}
                className="hover:text-gray-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Required Qualifications *
        </label>
        <textarea
          required
          rows={6}
          value={formData.requirements}
          onChange={(e) => updateFormData("requirements", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "requirements")}
          placeholder="• Bachelor's degree in Computer Science or related field&#10;• 5+ years of experience in software development&#10;• Strong knowledge of Python and Django&#10;• Experience with AWS cloud services"
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          Press Enter to auto-add bullet points
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Nice to Have (Optional)
        </label>
        <textarea
          rows={4}
          value={formData.niceToHave}
          onChange={(e) => updateFormData("niceToHave", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "niceToHave")}
          placeholder="• Experience with Kubernetes&#10;• Contributions to open source projects&#10;• Previous startup experience"
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          Press Enter to auto-add bullet points
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Application Deadline *
        </label>
        <input
          type="date"
          required
          value={formData.applicationDeadline}
          onChange={(e) => handleDeadlineChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            deadlineError ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {deadlineError ? (
          <p className="text-xs text-red-600 mt-1">{deadlineError}</p>
        ) : (
          <p className="text-xs text-neutral-text-muted mt-1">
            Maximum 30 days from today
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function CompensationStep({ formData, updateFormData, onNext, onBack }: any) {
  const [salaryErrors, setSalaryErrors] = useState<{ min?: string; max?: string }>({});

  const validateSalary = (): boolean => {
    if (formData.salaryDisclosure !== "range") return true;
    const min = Number(formData.salaryMin);
    const max = Number(formData.salaryMax);
    const errors: { min?: string; max?: string } = {};
    if (!formData.salaryMin || isNaN(min) || min <= 0) {
      errors.min = "Enter a valid minimum salary greater than 0";
    }
    if (!formData.salaryMax || isNaN(max) || max <= 0) {
      errors.max = "Enter a valid maximum salary greater than 0";
    }
    if (!errors.min && !errors.max) {
      if (min >= max) {
        errors.max = "Maximum must be greater than minimum";
      } else if (max > min * 15) {
        errors.max = "Range seems very wide — maximum shouldn't exceed 15× the minimum";
      }
    }
    setSalaryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSalary()) return;
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: string) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine?.trim().startsWith('•') || currentLine?.trim().startsWith('-')) {
        e.preventDefault();
        const newValue = textBefore + '\n• ' + textAfter;
        updateFormData(field, newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
        }, 0);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-text mb-2">Compensation & Benefits</h2>
        <p className="text-neutral-text-secondary">Salary transparency increases quality applications by 30%</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-3">
          Salary Disclosure *
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border-2 border-neutral-border rounded-lg cursor-pointer hover:border-brand-orange/50 transition-colors">
            <input
              type="radio"
              name="salaryDisclosure"
              value="range"
              checked={formData.salaryDisclosure === "range"}
              onChange={(e) => updateFormData("salaryDisclosure", e.target.value)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-neutral-text">Show salary range</p>
              <p className="text-sm text-neutral-text-secondary">Recommended - Attracts 40% more qualified candidates</p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border-2 border-neutral-border rounded-lg cursor-pointer hover:border-brand-orange/50 transition-colors">
            <input
              type="radio"
              name="salaryDisclosure"
              value="undisclosed"
              checked={formData.salaryDisclosure === "undisclosed"}
              onChange={(e) => updateFormData("salaryDisclosure", e.target.value)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-neutral-text">To be discussed during interview</p>
              <p className="text-sm text-neutral-text-secondary">Salary details shared with shortlisted candidates</p>
            </div>
          </label>
        </div>
      </div>

      {formData.salaryDisclosure === "range" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => updateFormData("currency", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Minimum *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.salaryMin}
                onChange={(e) => { updateFormData("salaryMin", e.target.value); setSalaryErrors((p) => ({ ...p, min: undefined })); }}
                placeholder="250000"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${salaryErrors.min ? "border-red-400" : "border-neutral-border"}`}
              />
              {salaryErrors.min && <p className="mt-1 text-xs text-red-500">{salaryErrors.min}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Maximum *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.salaryMax}
                onChange={(e) => { updateFormData("salaryMax", e.target.value); setSalaryErrors((p) => ({ ...p, max: undefined })); }}
                placeholder="400000"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${salaryErrors.max ? "border-red-400" : "border-neutral-border"}`}
              />
              {salaryErrors.max && <p className="mt-1 text-xs text-red-500">{salaryErrors.max}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Period *
              </label>
              <select
                value={formData.salaryPeriod}
                onChange={(e) => updateFormData("salaryPeriod", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="year">Per Year</option>
                <option value="month">Per Month</option>
                <option value="hour">Per Hour</option>
              </select>
            </div>
          </div>
          {/* Live salary preview */}
          {formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > 0 && Number(formData.salaryMax) > Number(formData.salaryMin) && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-xs text-green-700 font-medium">Preview:</span>
              <span className="text-sm font-bold text-green-800">
                {formData.currency} {Number(formData.salaryMin).toLocaleString()} – {Number(formData.salaryMax).toLocaleString()}
                {" "}{formData.salaryPeriod === "year" ? "/ yr" : formData.salaryPeriod === "month" ? "/ mo" : "/ hr"}
              </span>
            </div>
          )}
          <p className="text-xs text-neutral-text-muted">
            💡 Tip: Use /yr for full-time roles, /mo for regional markets, /hr for freelance/contract work
          </p>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Benefits & Perks
        </label>
        <textarea
          rows={4}
          value={formData.benefits}
          onChange={(e) => updateFormData("benefits", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "benefits")}
          placeholder="• Health insurance&#10;• Flexible working hours&#10;• Professional development budget&#10;• Remote work options"
          className="w-full px-4 py-3 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          Press Enter to auto-add bullet points
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
        >
          Application Settings
        </button>
      </div>
    </form>
  );
}

function ApplicationSettingsStep({ formData, updateFormData, onNext, onBack }: any) {
  const settings = formData.applicationSettings;

  const updateSettings = (field: string, value: any) => {
    updateFormData("applicationSettings", {
      ...settings,
      [field]: value,
    });
  };

  const addCustomQuestion = () => {
    const newQuestion = {
      question: "",
      type: "text" as const,
      required: false,
      options: [],
      acceptedFileTypes: [],
      maxFileSize: 5,
    };
    updateSettings("customQuestions", [...settings.customQuestions, newQuestion]);
  };

  const updateCustomQuestion = (index: number, field: string, value: any) => {
    const updated = [...settings.customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings("customQuestions", updated);
  };

  const removeCustomQuestion = (index: number) => {
    const updated = settings.customQuestions.filter((_: any, i: number) => i !== index);
    updateSettings("customQuestions", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-text mb-2">Application Settings</h2>
        <p className="text-neutral-text-secondary">
          Customize what information you want to collect from applicants
        </p>
      </div>

      {/* Required Information */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-4">Required Information</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireResume}
              onChange={(e) => updateSettings("requireResume", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Resume/CV</p>
              <p className="text-sm text-neutral-text-secondary">Always required for applications</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireCoverLetter}
              onChange={(e) => updateSettings("requireCoverLetter", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Cover Letter</p>
              <p className="text-sm text-neutral-text-secondary">Ask candidates to write a cover letter</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requirePortfolio}
              onChange={(e) => updateSettings("requirePortfolio", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Portfolio/Work Samples</p>
              <p className="text-sm text-neutral-text-secondary">Request portfolio URL or work samples</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireLinkedIn}
              onChange={(e) => updateSettings("requireLinkedIn", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">LinkedIn Profile</p>
              <p className="text-sm text-neutral-text-secondary">Request LinkedIn profile URL</p>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Questions */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-4">Additional Questions</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireAvailability}
              onChange={(e) => updateSettings("requireAvailability", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Availability to Start</p>
              <p className="text-sm text-neutral-text-secondary">When can they start working?</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireSalaryExpectations}
              onChange={(e) => updateSettings("requireSalaryExpectations", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Salary Expectations</p>
              <p className="text-sm text-neutral-text-secondary">Ask for their expected salary range</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireWorkAuthorization}
              onChange={(e) => updateSettings("requireWorkAuthorization", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Work Authorization</p>
              <p className="text-sm text-neutral-text-secondary">Are they authorized to work?</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
            <input
              type="checkbox"
              checked={settings.requireWillingToRelocate}
              onChange={(e) => updateSettings("requireWillingToRelocate", e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-text">Willing to Relocate</p>
              <p className="text-sm text-neutral-text-secondary">Are they open to relocation?</p>
            </div>
          </label>
        </div>
      </div>

      {/* Custom Questions */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-text">Custom Questions</h3>
            <p className="text-sm text-neutral-text-secondary">Add up to 5 custom questions</p>
          </div>
          <button
            type="button"
            onClick={addCustomQuestion}
            disabled={settings.customQuestions.length >= 5}
            className="px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Question
          </button>
        </div>

        {settings.customQuestions.length === 0 ? (
          <p className="text-sm text-neutral-text-muted text-center py-8">
            No custom questions yet. Click "Add Question" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {settings.customQuestions.map((q: any, index: number) => (
              <div key={index} className="p-4 border border-neutral-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-text">Question {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateCustomQuestion(index, "question", e.target.value)}
                      placeholder="e.g., Why do you want to work at our company?"
                      className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-1">
                        Answer Type
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => updateCustomQuestion(index, "type", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateCustomQuestion(index, "required", e.target.checked)}
                          className="w-4 h-4 text-brand-orange rounded"
                        />
                        <span className="text-sm font-medium text-neutral-text">Required</span>
                      </label>
                    </div>
                  </div>

                  {(q.type === "select" || q.type === "radio" || q.type === "checkbox") && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={q.options?.join(", ") || ""}
                        onChange={(e) => updateCustomQuestion(index, "options", e.target.value.split(",").map((s: string) => s.trim()))}
                        placeholder="e.g., Option 1, Option 2, Option 3"
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}

function PreviewStep({ formData, onBack, onSaveDraft, onPublish, isSubmitting, onJumpToStep }: any) {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  
  const verificationStatus = profile?.employerProfile?.verificationStatus;
  const isVerified = verificationStatus === "verified";
  
  const getSalaryDisplay = () => {
    if (formData.salaryDisclosure === "range") {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
        const periodLabel: Record<string, string> = { year: "/ yr", month: "/ mo", hour: "/ hr" };
        const period = periodLabel[formData.salaryPeriod] ?? "";
        return `${formData.currency} ${min.toLocaleString()} – ${max.toLocaleString()} ${period}`.trim();
      }
    }
    return "Salary undisclosed";
  };

  const getDepartmentLabel = () => {
    if (formData.department === "other") return formData.customDepartment;
    const departments: Record<string, string> = {
      technology: "Technology & IT",
      marketing: "Marketing & Sales",
      finance: "Finance & Accounting",
      engineering: "Engineering",
      healthcare: "Healthcare",
      education: "Education & Training",
      hospitality: "Hospitality & Tourism",
      agriculture: "Agriculture",
      construction: "Construction",
      logistics: "Logistics & Transport",
      creative: "Creative & Design",
      customer_service: "Customer Service",
    };
    return departments[formData.department] || formData.department;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-text mb-2">Preview Your Job Post</h2>
        <p className="text-neutral-text-secondary">Review how your job will appear to candidates — click <strong>Edit</strong> on any section to jump back and make changes.</p>
      </div>

      {/* Job Preview - Matching actual job detail page */}
      <div className="border-2 border-neutral-border rounded-lg overflow-hidden">
        <div className="bg-white p-8">
          {/* ── Job Header ── */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md hover:bg-orange-100"
            >
              ✏️ Edit basics
            </button>
            <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
              <span className="text-2xl font-bold text-white">
                {profile?.employerProfile?.companyName?.charAt(0) || "C"}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  {profile?.employerProfile?.companyName || "Your Company"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {formData.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {formData.multipleLocations
                      ? formData.locations.slice(0, 5).map(formatLocation).join(" | ") +
                        (formData.locations.length > 5 ? ` +${formData.locations.length - 5} more` : "")
                      : formatLocation({ country: formData.country, region: formData.region, city: formData.city })}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{formData.employmentType.replace('-', ' ')}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{formData.workplaceType}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Just now</span>
                </div>
              </div>

              {/* Deadline Badge */}
              {formData.applicationDeadline && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Deadline: {new Date(formData.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>{/* end flex-1 */}
          </div>{/* end flex items-start row */}
          </div>{/* end relative group - Job Header */}

          {/* Job Details Grid */}
          <div className="relative group bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              <button
                type="button"
                onClick={() => onJumpToStep(1)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md hover:bg-orange-100"
              >
                ✏️ Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.multipleLocations
                      ? formData.locations.slice(0, 5).map(formatLocation).join(" | ") +
                        (formData.locations.length > 5 ? ` +${formData.locations.length - 5} more` : "")
                      : formatLocation({ country: formData.country, region: formData.region, city: formData.city })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contract Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{formData.employmentType.replace('-', ' ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Workplace</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{formData.workplaceType.replace('-', ' ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{formData.experienceLevel}</p>
                </div>
              </div>

              {formData.department && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</p>
                    <p className="text-sm font-medium text-gray-900">{getDepartmentLabel()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Salary</p>
                  <p className="text-sm font-medium text-gray-900">{getSalaryDisplay()}</p>
                </div>
              </div>

              {formData.positions && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Positions</p>
                    <p className="text-sm font-medium text-gray-900">{formData.positions} opening{formData.positions > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Required Skills */}
            {formData.requiredSkills && formData.requiredSkills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 text-sm rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {formData.preferredSkills && formData.preferredSkills.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Preferred Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.preferredSkills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Content */}
          <div className="space-y-6">
            {/* Description & Responsibilities — step 2 */}
            {(formData.description || formData.responsibilities) && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => onJumpToStep(2)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md hover:bg-orange-100"
                >
                  ✏️ Edit description
                </button>
                {formData.description && (
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">About the Role</h4>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.description}</p>
                  </div>
                )}
                {formData.responsibilities && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Key Responsibilities</h4>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.responsibilities}</div>
                  </div>
                )}
              </div>
            )}

            {/* Requirements — step 3 */}
            {(formData.requirements || formData.niceToHave || formData.benefits) && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => onJumpToStep(3)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md hover:bg-orange-100"
                >
                  ✏️ Edit requirements
                </button>
                {formData.requirements && (
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Requirements</h4>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.requirements}</div>
                  </div>
                )}
                {formData.niceToHave && (
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Nice to Have</h4>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.niceToHave}</div>
                  </div>
                )}
                {formData.benefits && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Benefits & Perks</h4>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.benefits}</div>
                  </div>
                )}
              </div>
            )}

            {/* Application Requirements — step 5 */}
            <div className="relative group border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Application Requirements</h4>
                <button
                  type="button"
                  onClick={() => onJumpToStep(5)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md hover:bg-orange-100"
                >
                  ✏️ Edit settings
                </button>
              </div>

              {/* Required documents */}
              {(() => {
                const docs = [
                  formData.applicationSettings?.requireResume && "Resume / CV",
                  formData.applicationSettings?.requireCoverLetter && "Cover Letter",
                  formData.applicationSettings?.requirePortfolio && "Portfolio",
                  formData.applicationSettings?.requireLinkedIn && "LinkedIn Profile",
                ].filter(Boolean) as string[];
                return docs.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {docs.map((label) => (
                        <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-full font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Screening Questions */}
              {(() => {
                const predefined: Array<{ question: string; type: string; required: boolean; options?: string[] }> = [];
                if (formData.applicationSettings?.requireAvailability) {
                  predefined.push({ question: "When are you available to start?", type: "text", required: true });
                }
                if (formData.applicationSettings?.requireSalaryExpectations) {
                  predefined.push({ question: "What are your salary expectations for this role?", type: "text", required: true });
                }
                if (formData.applicationSettings?.requireWorkAuthorization) {
                  predefined.push({ question: "Are you currently authorized to work in Kenya?", type: "radio", required: true, options: ["Yes", "No"] });
                }
                if (formData.applicationSettings?.requireWillingToRelocate) {
                  predefined.push({ question: "Are you willing to relocate for this position?", type: "radio", required: true, options: ["Yes", "No", "Open to discussion"] });
                }
                const custom: any[] = formData.applicationSettings?.customQuestions ?? [];
                const allQ = [...predefined, ...custom];
                if (allQ.length === 0) return null;
                const renderInput = (q: any) => {
                  if (q.type === "text") return <input readOnly disabled placeholder="Applicant's answer…" className="w-full mt-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-400 cursor-not-allowed" />;
                  if (q.type === "textarea") return <textarea readOnly disabled rows={2} placeholder="Applicant's answer…" className="w-full mt-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-400 cursor-not-allowed resize-none" />;
                  if (q.type === "select") return (
                    <select disabled className="w-full mt-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-400 cursor-not-allowed">
                      <option>Select an option…</option>
                      {(q.options ?? []).map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  );
                  if (q.type === "radio") return (
                    <div className="mt-2 space-y-2">
                      {(q.options ?? []).length > 0
                        ? (q.options ?? []).map((o: string) => (
                          <label key={o} className="flex items-center gap-2.5 cursor-not-allowed">
                            <input type="radio" disabled className="w-4 h-4 accent-orange-500" /><span className="text-sm text-gray-600">{o}</span>
                          </label>
                        ))
                        : <p className="text-xs text-gray-400 italic">No options defined</p>
                      }
                    </div>
                  );
                  if (q.type === "checkbox") return (
                    <div className="mt-2 space-y-2">
                      {(q.options ?? []).length > 0
                        ? (q.options ?? []).map((o: string) => (
                          <label key={o} className="flex items-center gap-2.5 cursor-not-allowed">
                            <input type="checkbox" disabled className="w-4 h-4 accent-orange-500 rounded" /><span className="text-sm text-gray-600">{o}</span>
                          </label>
                        ))
                        : <p className="text-xs text-gray-400 italic">No options defined</p>
                      }
                    </div>
                  );
                  return null;
                };
                return (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Screening Questions ({allQ.length})</p>
                    {allQ.map((q, i) => (
                      <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                              {q.question}
                              {q.required && <span className="ml-1 text-red-500 text-xs font-normal">*required</span>}
                            </p>
                            {i < predefined.length
                              ? <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded border border-blue-100 uppercase tracking-wide">Standard</span>
                              : <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100 uppercase tracking-wide">Custom</span>
                            }
                          </div>
                        </div>
                        <div className="ml-9">{renderInput(q)}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Warning */}
      {!isVerified && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Company verification required:</strong> Your company must be verified before you can publish jobs. 
            You can save this job as a draft and publish it once your company is verified.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary disabled:opacity-50"
        >
          Back to Edit
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting || !isVerified}
          title={!isVerified ? "Company must be verified to publish jobs" : ""}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publishing..." : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
