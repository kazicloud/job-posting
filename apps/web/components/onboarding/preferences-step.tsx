"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface PreferencesStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function PreferencesStep({ onDataChange, initialData }: PreferencesStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  
  const [formData, setFormData] = useState({
    jobTypes: initialData?.jobTypes || [],
    availability: initialData?.availability || "immediate",
    salaryMin: initialData?.salaryMin || "",
    salaryCurrency: initialData?.salaryCurrency || "KES",
    willingToRelocate: initialData?.willingToRelocate || false,
    notLookingForWork: initialData?.notLookingForWork || false,
    allowRecruiterContact: initialData?.allowRecruiterContact || false,
    _cvStorageId: initialData?._cvStorageId || null,
  });
  const [initialized, setInitialized] = useState(false);

  // Update form when initialData changes (only once)
  useEffect(() => {
    if (initialData && !initialized) {
      setFormData({
        jobTypes: initialData.jobTypes || [],
        availability: initialData.availability || "immediate",
        salaryMin: initialData.salaryMin || "",
        salaryCurrency: initialData.salaryCurrency || "KES",
        willingToRelocate: initialData.willingToRelocate || false,
        notLookingForWork: initialData.notLookingForWork || false,
        allowRecruiterContact: initialData.allowRecruiterContact || false,
        _cvStorageId: initialData._cvStorageId || null,
      });
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onDataChange(updated);
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      const { storageId } = await uploadResult.json();

      handleChange("_cvStorageId", storageId);
      setUploadError("");
    } catch (error: any) {
      setUploadError("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleJobType = (type: string) => {
    const updated = formData.jobTypes.includes(type)
      ? formData.jobTypes.filter((t: string) => t !== type)
      : [...formData.jobTypes, type];
    handleChange("jobTypes", updated);
    
    // If any job type is selected, uncheck "not looking for work"
    if (updated.length > 0 && formData.notLookingForWork) {
      handleChange("notLookingForWork", false);
    }
  };

  const handleToggleNotLooking = (checked: boolean) => {
    handleChange("notLookingForWork", checked);
    
    // If "not looking" is checked, clear all job types
    if (checked && formData.jobTypes.length > 0) {
      handleChange("jobTypes", []);
    }
  };

  const jobTypes = [
    { value: "permanent", label: "Permanent/Full-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "attachment", label: "Attachment" },
    { value: "freelance", label: "Freelance/Part-time" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-3">
          What type of work are you looking for? *
        </label>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-3 p-3 border border-neutral-border rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.jobTypes.includes(type.value)}
                onChange={() => handleToggleJobType(type.value)}
                className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
              />
              <span className="text-sm text-neutral-text">{type.label}</span>
            </label>
          ))}
          
          {/* Not actively looking option */}
          <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors bg-neutral-bg-secondary/50">
            <input
              type="checkbox"
              checked={formData.notLookingForWork}
              onChange={(e) => handleToggleNotLooking(e.target.checked)}
              className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
            />
            <span className="text-sm text-neutral-text">
              I'm not actively looking for work right now
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          When can you start?
        </label>
        <select
          value={formData.availability}
          onChange={(e) => handleChange("availability", e.target.value)}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        >
          <option value="immediate">Immediately</option>
          <option value="1_month">Within 1 month</option>
          <option value="2_months">Within 2 months</option>
          <option value="3_months">Within 3 months</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Expected Salary (Optional)
        </label>
        <div className="flex gap-2">
          <select
            value={formData.salaryCurrency}
            onChange={(e) => handleChange("salaryCurrency", e.target.value)}
            className="w-24 px-3 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            <option value="KES">KES</option>
            <option value="USD">USD</option>
          </select>
          <input
            type="number"
            value={formData.salaryMin}
            onChange={(e) => handleChange("salaryMin", e.target.value)}
            placeholder="Minimum salary"
            className="flex-1 px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.willingToRelocate}
            onChange={(e) => handleChange("willingToRelocate", e.target.checked)}
            className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
          />
          <span className="text-sm text-neutral-text">
            I'm willing to relocate for the right opportunity
          </span>
        </label>
      </div>

      {/* CV Upload Section - Only show if not already uploaded */}
      {!formData._cvStorageId && (
        <div className="pt-4 border-t border-neutral-border">
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Upload Your CV/Resume (Optional)
          </label>
          <p className="text-xs text-neutral-text-secondary mb-3">
            Employers can view your CV when you apply for jobs
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleCVUpload}
            disabled={uploading}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload CV (PDF)
              </>
            )}
          </button>
          
          {uploadError && (
            <p className="mt-2 text-xs text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {/* CV Uploaded Confirmation */}
      {formData._cvStorageId && (
        <div className="pt-4 border-t border-neutral-border">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <FileText className="w-5 h-5" />
            <span className="font-medium">CV uploaded successfully</span>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-neutral-border">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowRecruiterContact}
            onChange={(e) => handleChange("allowRecruiterContact", e.target.checked)}
            className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
          />
          <span className="text-sm text-neutral-text">
            Allow recruiters to contact me about relevant opportunities
          </span>
        </label>
      </div>
    </div>
  );
}
