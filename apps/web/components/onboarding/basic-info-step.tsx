"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Upload, Loader2, X, ChevronDown, Search } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import countiesData from "@/data/counties.json";
import { jobTitlesWithSkills, jobTitlesByField, popularJobs } from "@/data/job-titles";
import { useSignUpStore } from "@/store/signup-store";

const WORK_COUNTRIES = [
  { code: "KE", name: "Kenya", flag: "🇰🇪", isKenya: true },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", isKenya: false },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", isKenya: false },
  { code: "UG", name: "Uganda", flag: "🇺🇬", isKenya: false },
];

const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  RW: ["Kigali City", "Northern Province", "Southern Province", "Eastern Province", "Western Province"],
  TZ: [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
    "Kigoma", "Kilimanjaro", "Lindi", "Mara", "Mbeya", "Morogoro", "Mtwara",
    "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani", "Rukwa",
    "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga",
    "Zanzibar North", "Zanzibar South", "Zanzibar West",
  ],
  UG: [
    "Adjumani", "Arua", "Busia", "Fort Portal", "Gulu", "Hoima", "Iganga",
    "Jinja", "Kabale", "Kampala", "Kasese", "Lira", "Masaka", "Mbarara",
    "Mbale", "Moroto", "Mubende", "Mukono", "Soroti", "Tororo", "Wakiso",
  ],
};

interface BasicInfoStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

interface County {
  county_name: string;
  constituencies: Array<{
    constituency_name: string;
    wards: string[];
  }>;
}

export function BasicInfoStep({ onDataChange, initialData }: BasicInfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cvParsed, setCvParsed] = useState(false);
  const [uploadAttempts, setUploadAttempts] = useState(0);
  const [regionSearch, setRegionSearch] = useState("");
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const parseCV = useAction(api.cvParser.parseCV);
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  const saveCVFile = useMutation(api.cvUpload.saveCVFile);
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    preferredCountry: initialData?.preferredCountry || "KE",
    preferredRegions: (initialData?.preferredRegions as string[]) || [],
    county: initialData?.county || "",
    desiredJobTitle: initialData?.desiredJobTitle || "",
    headline: initialData?.headline || "",
  });

  const [showCustomJobInput, setShowCustomJobInput] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Get user's selected fields from signup
  const signupStore = useSignUpStore();
  
  // Build job titles list based on signup interests
  const jobTitles = useMemo(() => {
    const priorityJobs: string[] = [];
    const otherJobs = new Set<string>();
    
    // Get fields from sessionStorage (saved during signup)
    const signupData = typeof window !== 'undefined' 
      ? sessionStorage.getItem("signupData") 
      : null;
    
    let userFields: string[] = [];
    if (signupData) {
      const data = JSON.parse(signupData);
      userFields = data.fields || [];
    }
    
    // 1. Add jobs from user's FIRST selected field (priority)
    if (userFields.length > 0) {
      const firstField = userFields[0];
      const fieldJobs = jobTitlesWithSkills
        .filter(j => j.field === firstField)
        .map(j => j.title);
      priorityJobs.push(...fieldJobs);
    }
    
    // 2. Add popular jobs
    popularJobs.forEach(job => {
      if (!priorityJobs.includes(job)) {
        otherJobs.add(job);
      }
    });
    
    // 3. Add all other jobs
    jobTitlesWithSkills.forEach(job => {
      if (!priorityJobs.includes(job.title) && job.field !== userFields[0]) {
        otherJobs.add(job.title);
      }
    });
    
    // Combine: priority jobs first, then sorted others
    return [...priorityJobs, ...Array.from(otherJobs).sort()];
  }, []);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && !initialized) {
      setFormData(prev => ({
        ...prev,
        fullName: initialData.fullName || prev.fullName,
        phone: initialData.phone || prev.phone,
        preferredCountry: initialData.preferredCountry || prev.preferredCountry,
        preferredRegions: initialData.preferredRegions || prev.preferredRegions,
        county: initialData.county || prev.county,
        desiredJobTitle: initialData.desiredJobTitle || prev.desiredJobTitle,
        headline: initialData.headline || prev.headline,
      }));
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    // Keep county in sync with first preferredRegion for backward compat
    if (field === "preferredRegions" && Array.isArray(value)) {
      updated.county = value[0] || "";
    }
    if (field === "preferredCountry") {
      updated.preferredRegions = [];
      updated.county = "";
    }
    setFormData(updated);
    onDataChange(updated);
  };

  const toggleRegion = (region: string) => {
    const current = formData.preferredRegions;
    if (current.includes(region)) {
      handleChange("preferredRegions", current.filter(r => r !== region));
    } else if (current.length < 5) {
      handleChange("preferredRegions", [...current, region]);
    }
  };

  // Get available regions for selected country
  const availableRegions = useMemo(() => {
    if (formData.preferredCountry === "KE") {
      return (countiesData as County[])
        .map(c => c.county_name)
        .sort();
    }
    return REGIONS_BY_COUNTRY[formData.preferredCountry] || [];
  }, [formData.preferredCountry]);

  const filteredRegions = useMemo(() => {
    if (!regionSearch) return availableRegions;
    return availableRegions.filter(r =>
      r.toLowerCase().includes(regionSearch.toLowerCase())
    );
  }, [availableRegions, regionSearch]);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if max attempts reached
    if (uploadAttempts >= 2) {
      setUploadError("Maximum upload attempts reached. Please fill the form manually.");
      return;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadAttempts(prev => prev + 1);

    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();

      // 1. Upload CV file to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      const { storageId } = await uploadResult.json();

      // 2. Parse CV with Gemini (pass ArrayBuffer directly)
      const parsed = await parseCV({ fileBuffer: arrayBuffer });

      // Pre-fill form with parsed data
      setFormData(prev => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        phone: parsed.phone || prev.phone,
        county: parsed.county || prev.county,
        desiredJobTitle: parsed.desiredJobTitle || prev.desiredJobTitle,
        headline: parsed.headline || prev.headline,
      }));

      // Notify parent with all parsed data (including CV storage ID)
      onDataChange({
        ...formData,
        fullName: parsed.fullName || formData.fullName,
        phone: parsed.phone || formData.phone,
        county: parsed.county || formData.county,
        desiredJobTitle: parsed.desiredJobTitle || formData.desiredJobTitle,
        headline: parsed.headline || formData.headline,
        _parsedCV: parsed, // Store full parsed data for other steps
        _cvStorageId: storageId, // Store CV file ID
        _cvFileName: file.name, // Store CV file name
      });

      // Mark CV as parsed
      setCvParsed(true);
      setUploadError("");

    } catch (error: any) {
      console.error("CV upload error:", error);
      setUploadError(error.message || "Failed to parse CV. Please try again.");
      setCvParsed(false);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearCV = () => {
    if (uploadAttempts >= 2) {
      setUploadError("Maximum upload attempts reached. Please fill the form manually.");
      return;
    }
    setCvParsed(false);
    setUploadError("");
  };

  return (
    <div className="space-y-4">
      {/* CV Upload Section */}
      <div className="p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-text mb-1">
              Speed up with your CV
            </h3>
            <p className="text-xs text-neutral-text-secondary mb-3">
              Upload your resume and we'll auto-fill your information
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleCVUpload}
              disabled={uploading || cvParsed}
              className="hidden"
            />
            
            {!cvParsed ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || uploadAttempts >= 2}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing CV...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload CV (PDF) {uploadAttempts > 0 && `(${uploadAttempts}/2)`}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">CV parsed successfully!</span>
                </div>
                <p className="text-xs text-neutral-text-secondary">
                  Please review and edit the auto-filled information below, then proceed to the next steps.
                </p>
                {uploadAttempts < 2 && (
                  <button
                    type="button"
                    onClick={handleClearCV}
                    className="text-xs text-brand-orange hover:underline"
                  >
                    Clear and upload a different CV ({2 - uploadAttempts} attempt{2 - uploadAttempts !== 1 ? 's' : ''} left)
                  </button>
                )}
              </div>
            )}
            
            {uploadError && (
              <p className="mt-2 text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Phone Number (WhatsApp) *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+254 712 345 678"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Preferred Work Country *
        </label>
        <select
          value={formData.preferredCountry}
          onChange={(e) => handleChange("preferredCountry", e.target.value)}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          required
        >
          <option value="">Select country</option>
          {WORK_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {formData.preferredCountry && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-text">
              Preferred {formData.preferredCountry === "KE" ? "Counties" : "Regions"} * (up to 5)
            </label>
            {formData.preferredRegions.length > 0 && (
              <span className="text-xs text-neutral-text-muted">
                {formData.preferredRegions.length}/5 selected
              </span>
            )}
          </div>

          {/* Selected tags */}
          {formData.preferredRegions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.preferredRegions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-orange/10 text-brand-orange text-xs font-medium rounded-full"
                >
                  {region}
                  <button
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className="hover:text-brand-orange/60"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              disabled={formData.preferredRegions.length >= 5}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-neutral-border rounded-md text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-neutral-text-muted">
                {formData.preferredRegions.length >= 5
                  ? "Maximum 5 selected"
                  : `Select ${formData.preferredCountry === "KE" ? "counties" : "regions"}...`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${regionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {regionDropdownOpen && formData.preferredRegions.length < 5 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-border rounded-md shadow-lg">
                <div className="p-2 border-b border-neutral-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-text-muted" />
                    <input
                      type="text"
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-neutral-border rounded focus:outline-none focus:ring-1 focus:ring-brand-orange/20"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredRegions.map((region) => {
                    const isSelected = formData.preferredRegions.includes(region);
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => {
                          toggleRegion(region);
                          if (!isSelected && formData.preferredRegions.length >= 4) {
                            setRegionDropdownOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? "bg-brand-orange/10 text-brand-orange font-medium"
                            : "text-neutral-text hover:bg-neutral-bg-secondary"
                        }`}
                      >
                        {region}
                      </button>
                    );
                  })}
                  {filteredRegions.length === 0 && (
                    <p className="px-3 py-2 text-sm text-neutral-text-muted">No results</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Close dropdown when clicking outside */}
          {regionDropdownOpen && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setRegionDropdownOpen(false)}
            />
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          What job are you looking for? *
        </label>
        {!showCustomJobInput ? (
          <div className="space-y-2">
            <select
              value={formData.desiredJobTitle}
              onChange={(e) => {
                if (e.target.value === "other") {
                  setShowCustomJobInput(true);
                  handleChange("desiredJobTitle", "");
                } else {
                  handleChange("desiredJobTitle", e.target.value);
                }
              }}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              required
            >
              <option value="">Select job title</option>
              {jobTitles.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
              <option value="other">Other (specify)</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={formData.desiredJobTitle}
              onChange={(e) => handleChange("desiredJobTitle", e.target.value)}
              placeholder="Enter your desired job title"
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              required
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomJobInput(false);
                handleChange("desiredJobTitle", "");
              }}
              className="text-sm text-brand-orange hover:underline"
            >
              Choose from list instead
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Professional Headline
        </label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          placeholder="e.g. Marketing Graduate | Digital Marketing Enthusiast"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        />
        <p className="text-xs text-neutral-text-muted mt-1">
          This appears at the top of your profile
        </p>
      </div>
    </div>
  );
}
