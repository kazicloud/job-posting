"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Briefcase, GraduationCap, Laptop, Upload, Loader2, FileText, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface StatusStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function StatusStep({ onDataChange, initialData }: StatusStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  
  const [formData, setFormData] = useState({
    currentStatus: initialData?.currentStatus || "",
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    _cvStorageId: initialData?._cvStorageId || null,
    _cvFileName: initialData?._cvFileName || null,
  });
  const [initialized, setInitialized] = useState(false);

  // Update form when initialData changes (only once)
  useEffect(() => {
    if (initialData && !initialized) {
      // Map years of experience to dropdown values
      let mappedYears = initialData.yearsOfExperience || 0;
      if (mappedYears === 1) mappedYears = 1;
      else if (mappedYears === 2) mappedYears = 2;
      else if (mappedYears >= 3 && mappedYears < 5) mappedYears = 3;
      else if (mappedYears >= 5 && mappedYears < 10) mappedYears = 5;
      else if (mappedYears >= 10) mappedYears = 10;
      
      setFormData({
        currentStatus: initialData.currentStatus || "",
        yearsOfExperience: mappedYears,
        _cvStorageId: initialData._cvStorageId || null,
        _cvFileName: initialData._cvFileName || null,
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

      const updated = {
        ...formData,
        _cvStorageId: storageId,
        _cvFileName: file.name,
      };
      setFormData(updated);
      onDataChange(updated);
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

  const handleRemoveCV = () => {
    const updated = {
      ...formData,
      _cvStorageId: null,
      _cvFileName: null,
    };
    setFormData(updated);
    onDataChange(updated);
  };

  const statuses = [
    { value: "unemployed", label: "Looking for work", icon: Search },
    { value: "employed", label: "Currently employed", icon: Briefcase },
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "freelancer", label: "Freelancer", icon: Laptop },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-3">
          What's your current status? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => handleChange("currentStatus", status.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.currentStatus === status.value
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-neutral-border hover:border-neutral-text-muted"
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  formData.currentStatus === status.value
                    ? "text-brand-orange"
                    : "text-neutral-text-secondary"
                }`} />
                <div className="text-sm font-medium text-neutral-text">
                  {status.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Years of Experience *
        </label>
        <select
          value={formData.yearsOfExperience}
          onChange={(e) => handleChange("yearsOfExperience", parseInt(e.target.value))}
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        >
          <option value={0}>Fresh Graduate / No Experience</option>
          <option value={1}>Less than 1 year</option>
          <option value={2}>1-2 years</option>
          <option value={3}>3-5 years</option>
          <option value={5}>5-10 years</option>
          <option value={10}>10+ years</option>
        </select>
      </div>

      {/* CV Upload Section */}
      <div className="pt-4 border-t border-neutral-border">
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Upload Your CV/Resume *
        </label>
        <p className="text-xs text-neutral-text-secondary mb-3">
          Employers can view your CV when you apply for jobs. PDF format, max 5MB.
        </p>
        
        {!formData._cvStorageId ? (
          <>
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
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          </>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {formData._cvFileName || "CV uploaded"}
                </p>
                <p className="text-xs text-green-600">Ready to use</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCV}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Remove and upload different CV"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
