"use client";

import { useState, useEffect } from "react";

interface PreferencesStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function PreferencesStep({ onDataChange, initialData }: PreferencesStepProps) {
  const [formData, setFormData] = useState({
    jobTypes: initialData?.jobTypes || [],
    workArrangements: initialData?.workArrangements || [],
    expectedSalaryMin: initialData?.expectedSalaryMin || "",
    willingToRelocate: initialData?.willingToRelocate || false,
  });
  const [initialized, setInitialized] = useState(false);

  // Update form when initialData changes (only once)
  useEffect(() => {
    if (initialData && !initialized) {
      setFormData({
        jobTypes: initialData.jobTypes || [],
        workArrangements: initialData.workArrangements || [],
        expectedSalaryMin: initialData.expectedSalaryMin || "",
        willingToRelocate: initialData.willingToRelocate || false,
      });
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onDataChange(updated);
  };

  const handleToggle = (field: "jobTypes" | "workArrangements", value: string) => {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    handleChange(field, updated);
  };

  const jobTypes = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
  ];

  const workArrangements = [
    { value: "on-site", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
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
                onChange={() => handleToggle("jobTypes", type.value)}
                className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
              />
              <span className="text-sm text-neutral-text">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-3">
          Preferred work arrangement? *
        </label>
        <div className="space-y-2">
          {workArrangements.map((arrangement) => (
            <label
              key={arrangement.value}
              className="flex items-center gap-3 p-3 border border-neutral-border rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.workArrangements.includes(arrangement.value)}
                onChange={() => handleToggle("workArrangements", arrangement.value)}
                className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
              />
              <span className="text-sm text-neutral-text">{arrangement.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Expected Minimum Salary (KES) *
        </label>
        <input
          type="number"
          value={formData.expectedSalaryMin}
          onChange={(e) => handleChange("expectedSalaryMin", e.target.value)}
          placeholder="e.g., 50000"
          className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        />
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
    </div>
  );
}
