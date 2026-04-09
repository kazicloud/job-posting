"use client";

import { useState, useEffect } from "react";
import { Building2, User, Shield, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface EmployerOnboardingWizardProps {
  userId: string;
  signupData: any;
  onComplete: () => void;
}

export function EmployerOnboardingWizard({ userId, signupData, onComplete }: EmployerOnboardingWizardProps) {
  const STORAGE_KEY = `employer-onboarding-${userId}`;
  
  // Load from localStorage on mount
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).currentStep : 1;
    }
    return 1;
  });
  
  const [formData, setFormData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).formData : {};
    }
    return {};
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, formData }));
    }
  }, [currentStep, formData, STORAGE_KEY]);

  const steps = [
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Contact Person", icon: User },
    { number: 3, title: "Verification", icon: Shield },
    { number: 4, title: "Review", icon: CheckCircle },
  ];

  const updateFormData = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
  };

  const nextStep = () => setCurrentStep((prev: number) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1));

  // Clear localStorage on completion
  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-neutral-bg-secondary py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
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
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-neutral-border p-8">
          {currentStep === 1 && (
            <CompanyInfoStep
              data={formData.company}
              onNext={(data: any) => {
                updateFormData({ company: data });
                nextStep();
              }}
            />
          )}
          {currentStep === 2 && (
            <ContactPersonStep
              data={formData.contact}
              companyWebsite={formData.company?.website}
              onNext={(data: any) => {
                updateFormData({ contact: data });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <VerificationStep
              isKenyaBased={formData.company?.isKenyaBased}
              data={formData.verification}
              onNext={(data: any) => {
                updateFormData({ verification: data });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <ReviewStep
              formData={formData}
              signupData={signupData}
              userId={userId}
              onBack={prevStep}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyInfoStep({ data, onNext }: any) {
  const [formData, setFormData] = useState(data || {});
  const [debouncedWebsite, setDebouncedWebsite] = useState(formData.website || "");
  const [debouncedDescription, setDebouncedDescription] = useState(formData.description || "");
  const [debouncedYear, setDebouncedYear] = useState(formData.foundedYear || "");
  
  const websiteCheck = useQuery(
    api.signupValidation.validateWebsiteUrl,
    debouncedWebsite?.trim() ? { url: debouncedWebsite } : "skip"
  );
  
  const descriptionCheck = useQuery(
    api.signupValidation.validateDescription,
    debouncedDescription?.trim() ? { description: debouncedDescription } : "skip"
  );
  
  const yearCheck = useQuery(
    api.signupValidation.validateYearFounded,
    debouncedYear ? { year: parseInt(debouncedYear) } : "skip"
  );
  
  // Debounce inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWebsite(formData.website || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.website]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDescription(formData.description || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.description]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedYear(formData.foundedYear || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.foundedYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website && websiteCheck?.valid === false) {
      alert("Please enter a valid website URL");
      return;
    }
    if (descriptionCheck?.valid === false) {
      alert("Please improve your company description");
      return;
    }
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-text mb-2">Company Details</h2>
        <p className="text-neutral-text-secondary">Complete your company information</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Company Website *
        </label>
        <input
          type="url"
          required
          value={formData.website || ""}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          onBlur={(e) => {
            let value = e.target.value.trim();
            // Auto-add https:// if not present when user leaves the field
            if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
              setFormData({ ...formData, website: 'https://' + value });
            }
          }}
          placeholder="example.com"
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            websiteCheck?.valid === true ? "border-green-500" : websiteCheck?.valid === false ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {websiteCheck?.message && (
          <p className={`text-xs mt-1 ${websiteCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {websiteCheck.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Is your company based in Kenya? *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              required
              checked={formData.isKenyaBased === true}
              onChange={() => setFormData({ ...formData, isKenyaBased: true })}
              className="text-brand-orange"
            />
            <span>Yes, Kenya-based</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              required
              checked={formData.isKenyaBased === false}
              onChange={() => setFormData({ ...formData, isKenyaBased: false })}
              className="text-brand-orange"
            />
            <span>No, International (Remote roles only)</span>
          </label>
        </div>
      </div>

      {formData.isKenyaBased === true && (
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Headquarters (County) *
          </label>
          <input
            type="text"
            required
            value={formData.headquarters || ""}
            onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
            placeholder="e.g., Nairobi"
            className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>
      )}

      {formData.isKenyaBased === false && (
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Country *
          </label>
          <input
            type="text"
            required
            value={formData.country || ""}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g., United States"
            className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Company Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tell us about your company..."
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            descriptionCheck?.valid === true ? "border-green-500" : descriptionCheck?.valid === false ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {descriptionCheck?.message && (
          <p className={`text-xs mt-1 ${descriptionCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {descriptionCheck.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Year Founded
        </label>
        <input
          type="number"
          min="1800"
          max={new Date().getFullYear()}
          value={formData.foundedYear || ""}
          onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
          placeholder="e.g., 2010"
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            yearCheck?.valid === true ? "border-green-500" : yearCheck?.valid === false ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {yearCheck?.message && (
          <p className={`text-xs mt-1 ${yearCheck.warning ? "text-yellow-600" : yearCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {yearCheck.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  );
}

function ContactPersonStep({ data, onNext, onBack, companyWebsite }: any) {
  const [formData, setFormData] = useState(data || {});
  const [debouncedEmail, setDebouncedEmail] = useState(formData.email || "");
  const [debouncedPhone, setDebouncedPhone] = useState(formData.phone || "");
  const [debouncedLinkedIn, setDebouncedLinkedIn] = useState(formData.linkedIn || "");
  
  const emailDomainCheck = useQuery(
    api.signupValidation.validateEmailDomain,
    debouncedEmail?.trim() && companyWebsite ? { email: debouncedEmail, website: companyWebsite } : "skip"
  );
  
  const phoneCheck = useQuery(
    api.signupValidation.validatePhoneNumber,
    debouncedPhone?.trim() ? { phone: debouncedPhone, isKenyaBased: true } : "skip"
  );
  
  const linkedInCheck = useQuery(
    api.signupValidation.validateLinkedInUrl,
    debouncedLinkedIn?.trim() ? { url: debouncedLinkedIn } : "skip"
  );

  // Debounce inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmail(formData.email || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPhone(formData.phone || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.phone]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLinkedIn(formData.linkedIn || ""), 500);
    return () => clearTimeout(timer);
  }, [formData.linkedIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneCheck?.valid === false) {
      alert("Please enter a valid phone number");
      return;
    }
    if (linkedInCheck?.valid === false && formData.linkedIn) {
      alert("Please enter a valid LinkedIn URL");
      return;
    }
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-text mb-2">Contact Person</h2>
        <p className="text-neutral-text-secondary">Who will be managing job postings?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Full Name *
        </label>
        <input
          type="text"
          required
          value={formData.fullName || ""}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Work Email *
        </label>
        <input
          type="email"
          required
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            emailDomainCheck?.valid === false && emailDomainCheck?.warning ? "border-yellow-500" : "border-neutral-border"
          }`}
        />
        {emailDomainCheck?.message && (
          <p className={`text-xs mt-1 ${emailDomainCheck.warning ? "text-yellow-600" : emailDomainCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {emailDomainCheck.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Job Title *
        </label>
        <input
          type="text"
          required
          value={formData.jobTitle || ""}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          placeholder="e.g., HR Manager, Recruiter"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          required
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+254712345678 or 0712345678"
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            phoneCheck?.valid === true ? "border-green-500" : phoneCheck?.valid === false ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {phoneCheck?.message && (
          <p className={`text-xs mt-1 ${phoneCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {phoneCheck.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          LinkedIn Profile (Optional)
        </label>
        <input
          type="url"
          value={formData.linkedIn || ""}
          onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            linkedInCheck?.valid === true ? "border-green-500" : linkedInCheck?.valid === false ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {linkedInCheck?.message && (
          <p className={`text-xs mt-1 ${linkedInCheck.valid ? "text-green-600" : "text-red-600"}`}>
            {linkedInCheck.message}
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
          disabled={phoneCheck?.valid === false || (linkedInCheck?.valid === false && formData.linkedIn)}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function VerificationStep({ isKenyaBased, data, onNext, onBack }: any) {
  const [formData, setFormData] = useState(data || {});
  const [uploading, setUploading] = useState(false);
  const [regNumberError, setRegNumberError] = useState("");
  const [kraPinError, setKraPinError] = useState("");
  const generateUploadUrl = useMutation(api.employerDocuments.generateUploadUrl);

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setFormData({ ...formData, [`_${fieldName}`]: storageId });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRegNumberChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setFormData({ ...formData, registrationNumber: upperValue });
    
    // Validate Kenyan business registration format
    const regNumberRegex = /^(CPR|PVT|BN)\/\d{4}\/\d{6}$|^C\.\d{6}$/;
    
    if (upperValue && !regNumberRegex.test(upperValue)) {
      setRegNumberError("Invalid format. Use CPR/YYYY/NNNNNN, PVT/YYYY/NNNNNN, BN/YYYY/NNNNNN, or C.NNNNNN");
    } else {
      setRegNumberError("");
    }
  };

  const handleKraPinChange = (value: string) => {
    setFormData({ ...formData, kraPin: value });
    
    // Validate KRA PIN format if provided
    const kraPinRegex = /^[A-Z]\d{9}[A-Z]$/;
    
    if (value && !kraPinRegex.test(value)) {
      setKraPinError("Invalid format. KRA PIN should be like A000000000X (letter + 9 digits + letter)");
    } else {
      setKraPinError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mandatory fields for Kenya-based companies
    if (isKenyaBased) {
      if (!formData.kraPin) {
        alert("KRA PIN is required");
        return;
      }
      if (!formData._incorporationCertStorageId && !formData._businessPermitStorageId) {
        alert("Please upload either Certificate of Incorporation, Business Registration Certificate, or Business Permit");
        return;
      }
    }
    
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-text mb-2">Verification</h2>
        <p className="text-neutral-text-secondary">
          {isKenyaBased
            ? "Provide your business registration details"
            : "Provide verification documents"}
        </p>
      </div>

      {isKenyaBased ? (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Business Registration Number *
            </label>
            <input
              type="text"
              required
              value={formData.registrationNumber || ""}
              onChange={(e) => handleRegNumberChange(e.target.value)}
              placeholder="e.g., CPR/2010/000000 or PVT/2010/000000"
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                regNumberError ? "border-red-500" : "border-neutral-border"
              }`}
            />
            {regNumberError && (
              <p className="text-xs text-red-600 mt-1">{regNumberError}</p>
            )}
            {!regNumberError && (
              <p className="text-xs text-neutral-text-muted mt-1">
                We'll verify this with Kenya Business Registration Service
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              KRA PIN *
            </label>
            <input
              type="text"
              required
              value={formData.kraPin || ""}
              onChange={(e) => handleKraPinChange(e.target.value.toUpperCase())}
              placeholder="e.g., A000000000X"
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                kraPinError ? "border-red-500" : "border-neutral-border"
              }`}
            />
            {kraPinError && (
              <p className="text-xs text-red-600 mt-1">{kraPinError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Certificate of Incorporation *
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "incorporationCertStorageId");
              }}
              disabled={uploading}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md"
            />
            <p className="text-xs text-neutral-text-muted mt-1">
              Upload Certificate of Incorporation or Business Registration Certificate
            </p>
            {uploading && <p className="text-xs text-brand-orange mt-1">Uploading...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Business Permit (Optional - if no incorporation cert)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "businessPermitStorageId");
              }}
              disabled={uploading}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md"
            />
            <p className="text-xs text-neutral-text-muted mt-1">
              Alternative to incorporation certificate
            </p>
            {uploading && <p className="text-xs text-brand-orange mt-1">Uploading...</p>}
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              LinkedIn Company Page URL *
            </label>
            <input
              type="url"
              required
              value={formData.linkedInCompany || ""}
              onChange={(e) => setFormData({ ...formData, linkedInCompany: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Company Registration Document
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "registrationDocStorageId");
              }}
              disabled={uploading}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md"
            />
            <p className="text-xs text-neutral-text-muted mt-1">
              Upload your business registration certificate or equivalent
            </p>
            {uploading && <p className="text-xs text-brand-orange mt-1">Uploading...</p>}
          </div>
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Your account will be reviewed by our team. You'll be able to post
          jobs once verified (typically within 24-48 hours).
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={uploading}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={uploading || !!regNumberError || !!kraPinError}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function ReviewStep({ formData, signupData, userId, onBack, onComplete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeOnboarding = useAction(api.employerOnboarding.completeEmployerOnboardingWithNotification);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        userId,
        data: formData,
      });
      onComplete();
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      alert("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-text mb-2">Review & Submit</h2>
        <p className="text-neutral-text-secondary">Please review your information</p>
      </div>

      <div className="space-y-4">
        <div className="border-b border-neutral-border pb-4">
          <h3 className="font-semibold text-neutral-text mb-2">Company Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Location:</dt>
              <dd className="text-neutral-text font-medium">
                {formData.company?.isKenyaBased
                  ? formData.company?.headquarters
                  : formData.company?.country}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Website:</dt>
              <dd className="text-neutral-text font-medium">{formData.company?.website}</dd>
            </div>
            {formData.company?.description && (
              <div className="flex flex-col gap-1">
                <dt className="text-neutral-text-secondary">Description:</dt>
                <dd className="text-neutral-text">{formData.company?.description}</dd>
              </div>
            )}
            {formData.company?.foundedYear && (
              <div className="flex justify-between">
                <dt className="text-neutral-text-secondary">Founded:</dt>
                <dd className="text-neutral-text font-medium">{formData.company?.foundedYear}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="border-b border-neutral-border pb-4">
          <h3 className="font-semibold text-neutral-text mb-2">Contact Person</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Name:</dt>
              <dd className="text-neutral-text font-medium">{formData.contact?.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Title:</dt>
              <dd className="text-neutral-text font-medium">{formData.contact?.jobTitle}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Email:</dt>
              <dd className="text-neutral-text font-medium">{formData.contact?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Phone:</dt>
              <dd className="text-neutral-text font-medium">{formData.contact?.phone}</dd>
            </div>
            {formData.contact?.linkedIn && (
              <div className="flex justify-between">
                <dt className="text-neutral-text-secondary">LinkedIn:</dt>
                <dd className="text-neutral-text font-medium truncate max-w-xs">{formData.contact?.linkedIn}</dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-text mb-2">Verification</h3>
          {formData.company?.isKenyaBased ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-text-secondary">Registration Number:</dt>
                <dd className="text-neutral-text font-medium">{formData.verification?.registrationNumber}</dd>
              </div>
              {formData.verification?.kraPin && (
                <div className="flex justify-between">
                  <dt className="text-neutral-text-secondary">KRA PIN:</dt>
                  <dd className="text-neutral-text font-medium">{formData.verification?.kraPin}</dd>
                </div>
              )}
            </dl>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-text-secondary">LinkedIn Company:</dt>
                <dd className="text-neutral-text font-medium truncate max-w-xs">{formData.verification?.linkedInCompany}</dd>
              </div>
              <p className="text-sm text-neutral-text-secondary mt-2">
                International company - Manual verification required
              </p>
            </dl>
          )}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-sm text-green-900">
          By submitting, you agree to our Terms of Service and confirm that all information provided
          is accurate.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}
