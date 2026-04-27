"use client";

import { useState, useEffect } from "react";
import { Building2, User, Shield, CheckCircle, Globe } from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// ─── Country config ────────────────────────────────────────────────────────────
const SUPPORTED_COUNTRIES = [
  {
    code: "KE" as const,
    name: "Kenya",
    hqLabel: "County",
    hqPlaceholder: "e.g., Nairobi",
    phonePlaceholder: "+254712345678 or 0712345678",
    isKenya: true,
  },
  {
    code: "RW" as const,
    name: "Rwanda",
    hqLabel: "Province or City",
    hqPlaceholder: "e.g., Kigali",
    phonePlaceholder: "+250 78 000 0000",
    isKenya: false,
  },
  {
    code: "TZ" as const,
    name: "Tanzania",
    hqLabel: "Region or City",
    hqPlaceholder: "e.g., Dar es Salaam",
    phonePlaceholder: "+255 71 000 0000",
    isKenya: false,
  },
  {
    code: "UG" as const,
    name: "Uganda",
    hqLabel: "District or City",
    hqPlaceholder: "e.g., Kampala",
    phonePlaceholder: "+256 70 000 0000",
    isKenya: false,
  },
];

type CountryCode = "KE" | "RW" | "TZ" | "UG";
type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

function getCountry(code: CountryCode): SupportedCountry {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code)!;
}

// ─── Verification document requirements per country ────────────────────────────
const VERIFICATION_CONFIG: Record<
  CountryCode,
  {
    regLabel: string;
    regPlaceholder: string;
    regHint: string;
    regRegex?: RegExp;
    regErrorMsg?: string;
    taxLabel: string;
    taxPlaceholder: string;
    taxHint: string;
    taxRegex?: RegExp;
    taxErrorMsg?: string;
    certLabel: string;
    certHint: string;
  }
> = {
  KE: {
    regLabel: "Business Registration Number (BRS) *",
    regPlaceholder: "e.g., PVT-12345678 or C.123456",
    regHint: "We'll verify this with Kenya Business Registration Service",
    regRegex: /^(PVT-\d{8}|C\.\d{6})$/,
    regErrorMsg: "Invalid format. Use PVT-XXXXXXXX or C.XXXXXX",
    taxLabel: "KRA PIN *",
    taxPlaceholder: "e.g., P051234567M",
    taxHint: "Kenya Revenue Authority Personal Identification Number",
    taxRegex: /^P\d{9}[A-Z]$/,
    taxErrorMsg: "Invalid KRA PIN. Format: P + 9 digits + letter (e.g., P051234567M)",
    certLabel: "Certificate of Incorporation *",
    certHint: "Upload Certificate of Incorporation or Business Registration Certificate",
  },
  RW: {
    regLabel: "RDB Registration Number *",
    regPlaceholder: "e.g., 102512345679875",
    regHint: "Rwanda Development Board business registration number",
    taxLabel: "RRA Tax Identification Number (TIN) *",
    taxPlaceholder: "e.g., 123456789",
    taxHint: "9-digit TIN issued by Rwanda Revenue Authority",
    taxRegex: /^\d{9}$/,
    taxErrorMsg: "RRA TIN must be exactly 9 digits",
    certLabel: "Certificate of Incorporation *",
    certHint: "Upload your RDB Certificate of Incorporation",
  },
  TZ: {
    regLabel: "BRELA Registration Number *",
    regPlaceholder: "e.g., 00000001234",
    regHint: "Business Registrations and Licensing Agency registration number",
    taxLabel: "TRA Tax Identification Number (TIN) *",
    taxPlaceholder: "e.g., 100123456",
    taxHint: "9-digit TIN issued by Tanzania Revenue Authority",
    taxRegex: /^\d{9}$/,
    taxErrorMsg: "TRA TIN must be exactly 9 digits",
    certLabel: "Certificate of Incorporation *",
    certHint: "Upload your BRELA Certificate of Incorporation",
  },
  UG: {
    regLabel: "URSB Registration Number *",
    regPlaceholder: "e.g., 80000012345",
    regHint: "Uganda Registration Services Bureau business registration number",
    taxLabel: "URA Tax Identification Number (TIN) *",
    taxPlaceholder: "e.g., 1000012345",
    taxHint: "10-digit TIN issued by Uganda Revenue Authority",
    taxRegex: /^\d{10}$/,
    taxErrorMsg: "URA TIN must be exactly 10 digits",
    certLabel: "Certificate of Incorporation *",
    certHint: "Upload your URSB Certificate of Incorporation",
  },
};

// ─── Wizard Shell ──────────────────────────────────────────────────────────────
interface EmployerOnboardingWizardProps {
  userId: string;
  signupData: any;
  onComplete: () => void;
}

export function EmployerOnboardingWizard({ userId, signupData, onComplete }: EmployerOnboardingWizardProps) {
  const STORAGE_KEY = `employer-onboarding-${userId}`;

  // Load from localStorage on mount
  const [country, setCountry] = useState<CountryCode | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).country ?? null : null;
    }
    return null;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).currentStep : 1;
    }
    return 1;
  });

  const [formData, setFormData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).formData : {};
    }
    return {};
  });

  // Persist to localStorage whenever anything changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ country, currentStep, formData }));
    }
  }, [country, currentStep, formData, STORAGE_KEY]);

  const steps = [
    { number: 0, title: "Country", icon: Globe },
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Contact Person", icon: User },
    { number: 3, title: "Verification", icon: Shield },
    { number: 4, title: "Review", icon: CheckCircle },
  ];

  const updateFormData = (stepData: any) => setFormData({ ...formData, ...stepData });
  const nextStep = () => setCurrentStep((prev: number) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1));

  const handleComplete = () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    onComplete();
  };

  // Step 0 = country not yet chosen; steps 1-4 = wizard steps
  const visualStep = country === null ? 0 : currentStep;
  const selectedCountry = country ? getCountry(country) : null;

  return (
    <div className="min-h-screen bg-neutral-bg-secondary py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = visualStep === step.number;
              const isCompleted = visualStep > step.number;

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
                      {/* Country step: show flag SVG when completed, globe when active/pending */}
                      {step.number === 0 && isCompleted && selectedCountry ? (
                        <span className={`fi fi-${selectedCountry.code.toLowerCase()} w-7 h-5 rounded-sm inline-block`} />
                      ) : isCompleted ? (
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
                      {step.number === 0 && selectedCountry
                        ? selectedCountry.name
                        : step.title}
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
          {/* Step 0: Country picker */}
          {visualStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-text mb-2">
                  Where is your company based?
                </h2>
                <p className="text-neutral-text-secondary">
                  Select your country to see the correct registration requirements.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                      setCurrentStep(1);
                    }}
                    className="group bg-white border-2 border-neutral-border hover:border-brand-orange rounded-xl p-6 text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  >
                    <span className={`fi fi-${c.code.toLowerCase()} w-24 h-16 rounded-md mb-4 inline-block`} />
                    <span className="text-lg font-semibold text-neutral-text group-hover:text-brand-orange transition-colors">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCountry && currentStep === 1 && (
            <CompanyInfoStep
              data={formData.company}
              country={selectedCountry}
              onNext={(data: any) => {
                updateFormData({ company: data });
                nextStep();
              }}
              onBack={() => {
                setCountry(null);
                setCurrentStep(1);
                setFormData({});
              }}
            />
          )}
          {selectedCountry && currentStep === 2 && (
            <ContactPersonStep
              data={formData.contact}
              country={selectedCountry}
              onNext={(data: any) => {
                updateFormData({ contact: data });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {selectedCountry && currentStep === 3 && (
            <VerificationStep
              country={selectedCountry}
              data={formData.verification}
              onNext={(data: any) => {
                updateFormData({ verification: data });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {selectedCountry && currentStep === 4 && (
            <ReviewStep
              formData={formData}
              country={selectedCountry}
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

// ─── Step 1: Company Info ──────────────────────────────────────────────────────
function CompanyInfoStep({ data, country, onNext, onBack }: any) {
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedWebsite(formData.website || ""), 500);
    return () => clearTimeout(t);
  }, [formData.website]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedDescription(formData.description || ""), 500);
    return () => clearTimeout(t);
  }, [formData.description]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedYear(formData.foundedYear || ""), 500);
    return () => clearTimeout(t);
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
    onNext({ ...formData, isKenyaBased: country.isKenya, country: country.name });
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
            if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
              setFormData({ ...formData, website: "https://" + value });
            }
          }}
          placeholder="https://example.com"
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            websiteCheck?.valid === true
              ? "border-green-500"
              : websiteCheck?.valid === false
              ? "border-red-500"
              : "border-neutral-border"
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
          {country.hqLabel} (Headquarters) *
        </label>
        <input
          type="text"
          required
          value={formData.headquarters || ""}
          onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
          placeholder={country.hqPlaceholder}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

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
            descriptionCheck?.valid === true
              ? "border-green-500"
              : descriptionCheck?.valid === false
              ? "border-red-500"
              : "border-neutral-border"
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
            yearCheck?.valid === true
              ? "border-green-500"
              : yearCheck?.valid === false
              ? "border-red-500"
              : "border-neutral-border"
          }`}
        />
        {yearCheck?.message && (
          <p
            className={`text-xs mt-1 ${
              yearCheck.warning ? "text-yellow-600" : yearCheck.valid ? "text-green-600" : "text-red-600"
            }`}
          >
            {yearCheck.message}
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

// ─── Step 2: Contact Person ────────────────────────────────────────────────────
function ContactPersonStep({ data, country, onNext, onBack }: any) {
  const [formData, setFormData] = useState(data || {});
  const [debouncedPhone, setDebouncedPhone] = useState(formData.phone || "");
  const [debouncedLinkedIn, setDebouncedLinkedIn] = useState(formData.linkedIn || "");

  const phoneCheck = useQuery(
    api.signupValidation.validatePhoneNumber,
    debouncedPhone?.trim() ? { phone: debouncedPhone, isKenyaBased: country.isKenya } : "skip"
  );

  const linkedInCheck = useQuery(
    api.signupValidation.validateLinkedInUrl,
    debouncedLinkedIn?.trim() ? { url: debouncedLinkedIn } : "skip"
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPhone(formData.phone || ""), 500);
    return () => clearTimeout(t);
  }, [formData.phone]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLinkedIn(formData.linkedIn || ""), 500);
    return () => clearTimeout(t);
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
        <label className="block text-sm font-medium text-neutral-text mb-2">Full Name *</label>
        <input
          type="text"
          required
          value={formData.fullName || ""}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">Work Email *</label>
        <input
          type="email"
          required
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@yourcompany.com"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">Job Title *</label>
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
        <label className="block text-sm font-medium text-neutral-text mb-2">Phone Number *</label>
        <input
          type="tel"
          required
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder={country.phonePlaceholder}
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            phoneCheck?.valid === true
              ? "border-green-500"
              : phoneCheck?.valid === false
              ? "border-red-500"
              : "border-neutral-border"
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
            linkedInCheck?.valid === true
              ? "border-green-500"
              : linkedInCheck?.valid === false
              ? "border-red-500"
              : "border-neutral-border"
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
          disabled={phoneCheck?.valid === false || (linkedInCheck?.valid === false && !!formData.linkedIn)}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: Verification ─────────────────────────────────────────────────────
function VerificationStep({ country, data, onNext, onBack }: any) {
  const [formData, setFormData] = useState(data || {});
  const [uploading, setUploading] = useState(false);
  const [regError, setRegError] = useState("");
  const [taxError, setTaxError] = useState("");
  const generateUploadUrl = useMutation(api.employerDocuments.generateUploadUrl);

  const config = VERIFICATION_CONFIG[country.code as CountryCode];

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
      setFormData((prev: any) => ({ ...prev, [`_${fieldName}`]: storageId }));
    } catch {
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRegNumberChange = (value: string) => {
    const upper = value.toUpperCase();
    setFormData((prev: any) => ({ ...prev, registrationNumber: upper }));
    if (config.regRegex && upper && !config.regRegex.test(upper)) {
      setRegError(config.regErrorMsg ?? "Invalid registration number format");
    } else {
      setRegError("");
    }
  };

  const handleTaxIdChange = (value: string) => {
    const normalized = country.isKenya ? value.toUpperCase() : value;
    setFormData((prev: any) => ({ ...prev, taxId: normalized }));
    if (config.taxRegex && normalized && !config.taxRegex.test(normalized)) {
      setTaxError(config.taxErrorMsg ?? "Invalid tax identification number");
    } else {
      setTaxError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber) {
      alert(`${config.regLabel.replace(" *", "")} is required`);
      return;
    }
    if (regError) { alert(regError); return; }
    if (!formData.taxId) {
      alert(`${config.taxLabel.replace(" *", "")} is required`);
      return;
    }
    if (taxError) { alert(taxError); return; }
    if (!formData._incorporationCertStorageId) {
      alert("Please upload your Certificate of Incorporation");
      return;
    }
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-text mb-2">Verification</h2>
        <p className="text-neutral-text-secondary">
          Provide your{" "}
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className={`fi fi-${country.code.toLowerCase()} w-6 h-4 rounded-sm inline-block`} />
            {country.name}
          </span>{" "}
          business registration details.
        </p>
      </div>

      {/* Registration number */}
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          {config.regLabel}
        </label>
        <input
          type="text"
          required
          value={formData.registrationNumber || ""}
          onChange={(e) => handleRegNumberChange(e.target.value)}
          placeholder={config.regPlaceholder}
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            regError ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {regError ? (
          <p className="text-xs text-red-600 mt-1">{regError}</p>
        ) : (
          <p className="text-xs text-neutral-text-muted mt-1">{config.regHint}</p>
        )}
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          {config.taxLabel}
        </label>
        <input
          type="text"
          required
          value={formData.taxId || ""}
          onChange={(e) => handleTaxIdChange(e.target.value)}
          placeholder={config.taxPlaceholder}
          className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
            taxError ? "border-red-500" : "border-neutral-border"
          }`}
        />
        {taxError ? (
          <p className="text-xs text-red-600 mt-1">{taxError}</p>
        ) : (
          <p className="text-xs text-neutral-text-muted mt-1">{config.taxHint}</p>
        )}
      </div>

      {/* Certificate of Incorporation */}
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          {config.certLabel}
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
        <p className="text-xs text-neutral-text-muted mt-1">{config.certHint}</p>
        {uploading && <p className="text-xs text-brand-orange mt-1">Uploading…</p>}
        {formData._incorporationCertStorageId && !uploading && (
          <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Your account will be reviewed by our team. You'll be able to post
          jobs once verified (typically within 24–48 hours).
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
          disabled={uploading || !!regError || !!taxError}
          className="flex-1 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────
function ReviewStep({ formData, country, signupData, userId, onBack, onComplete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeOnboarding = useAction(api.employerOnboarding.completeEmployerOnboardingWithNotification);

  const config = VERIFICATION_CONFIG[country.code as CountryCode];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Map taxId → kraPin field so the backend mutation stays compatible
      const verificationData = {
        ...formData.verification,
        kraPin: formData.verification?.taxId,
      };
      await completeOnboarding({
        userId,
        data: { ...formData, verification: verificationData },
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
        {/* Company */}
        <div className="border-b border-neutral-border pb-4">
          <h3 className="font-semibold text-neutral-text mb-2">Company Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Country:</dt>
              <dd className="text-neutral-text font-medium flex items-center gap-2">
                <span className={`fi fi-${country.code.toLowerCase()} w-6 h-4 rounded-sm inline-block`} />
                {country.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">{country.hqLabel}:</dt>
              <dd className="text-neutral-text font-medium">{formData.company?.headquarters}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">Website:</dt>
              <dd className="text-neutral-text font-medium">{formData.company?.website}</dd>
            </div>
            {formData.company?.description && (
              <div className="flex flex-col gap-1">
                <dt className="text-neutral-text-secondary">Description:</dt>
                <dd className="text-neutral-text">{formData.company.description}</dd>
              </div>
            )}
            {formData.company?.foundedYear && (
              <div className="flex justify-between">
                <dt className="text-neutral-text-secondary">Founded:</dt>
                <dd className="text-neutral-text font-medium">{formData.company.foundedYear}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Contact */}
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
                <dd className="text-neutral-text font-medium truncate max-w-xs">
                  {formData.contact.linkedIn}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Verification */}
        <div>
          <h3 className="font-semibold text-neutral-text mb-2">Verification Documents</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">
                {config.regLabel.replace(" *", "")}:
              </dt>
              <dd className="text-neutral-text font-medium">
                {formData.verification?.registrationNumber}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">
                {config.taxLabel.replace(" *", "")}:
              </dt>
              <dd className="text-neutral-text font-medium">{formData.verification?.taxId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-text-secondary">
                {config.certLabel.replace(" *", "")}:
              </dt>
              <dd className="text-green-600 font-medium">✓ Uploaded</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-sm text-green-900">
          By submitting, you agree to our Terms of Service and confirm that all information
          provided is accurate.
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
          {isSubmitting ? "Submitting…" : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}

