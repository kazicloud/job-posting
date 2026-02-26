"use client";

import { useState, useEffect } from "react";
import { Search, Briefcase, GraduationCap, Laptop } from "lucide-react";

interface StatusStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function StatusStep({ onDataChange, initialData }: StatusStepProps) {
  const [formData, setFormData] = useState({
    currentStatus: initialData?.currentStatus || "",
    yearsOfExperience: initialData?.yearsOfExperience || 0,
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
      });
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
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
          Years of Experience
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
    </div>
  );
}
