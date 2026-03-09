"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { KENYA_COUNTIES } from "@/lib/counties";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  
  const job = useQuery(api.jobs.getWithApplicationCount, { id: jobId });
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const updateJob = useMutation(api.jobMutations.update);
  const publishJob = useMutation(api.jobMutations.publish);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationStatus = profile?.employerProfile?.verificationStatus;
  const isVerified = verificationStatus === "verified";
  const isDraft = job?.status === "draft";
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    customDepartment: "",
    employmentType: "full-time",
    workplaceType: "on-site",
    location: "",
    multipleLocations: false,
    locations: [] as string[],
    description: "",
    responsibilities: "",
    requirements: "",
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    niceToHave: "",
    salaryDisclosure: "undisclosed",
    salaryMin: "",
    salaryMax: "",
    currency: "KES",
    benefits: "",
    applicationDeadline: "",
    positions: "1",
    experienceLevel: "mid",
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

  useEffect(() => {
    if (job) {
      // Parse location to check if it has multiple locations
      const locationStr = job.location;
      const hasMultiple = locationStr.includes(",");
      const locationsList = hasMultiple 
        ? locationStr.replace(/\s*\+\d+\s*more$/, "").split(",").map((l: string) => l.trim())
        : [];
      
      setFormData({
        title: job.title,
        department: job.department || "",
        customDepartment: "",
        employmentType: job.employmentType,
        workplaceType: job.workplaceType,
        location: hasMultiple ? "" : locationStr,
        multipleLocations: hasMultiple,
        locations: locationsList,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        niceToHave: job.niceToHave || "",
        salaryDisclosure: job.salaryDisclosure,
        salaryMin: job.salaryMin?.toString() || "",
        salaryMax: job.salaryMax?.toString() || "",
        currency: job.currency || "KES",
        benefits: job.benefits || "",
        applicationDeadline: job.applicationDeadline || "",
        positions: job.positions.toString(),
        experienceLevel: job.experienceLevel,
        applicationSettings: {
          requireResume: job.applicationSettings?.requireResume ?? true,
          requireCoverLetter: job.applicationSettings?.requireCoverLetter ?? false,
          requirePortfolio: job.applicationSettings?.requirePortfolio ?? false,
          requireLinkedIn: job.applicationSettings?.requireLinkedIn ?? false,
          requireAvailability: job.applicationSettings?.requireAvailability ?? false,
          requireSalaryExpectations: job.applicationSettings?.requireSalaryExpectations ?? false,
          requireWorkAuthorization: job.applicationSettings?.requireWorkAuthorization ?? false,
          requireWillingToRelocate: job.applicationSettings?.requireWillingToRelocate ?? false,
          customQuestions: (job.applicationSettings?.customQuestions || []).map(q => ({
            ...q,
            maxFileSize: (q as any).maxFileSize ?? 5242880,
            acceptedFileTypes: (q as any).acceptedFileTypes ?? ['.pdf', '.doc', '.docx']
          })),
        },
      });
    }
  }, [job]);

  if (!job) {
    return (
      <EmployerDashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-4 sm:mb-6">
            <div className="h-7 sm:h-8 bg-gray-200 rounded w-48 mb-2"></div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  {/* Two column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  {/* Another two column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-border">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  if (job.applicationCount >= 10) {
    return (
      <EmployerDashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-text mb-2">Cannot Edit This Job</h2>
            <p className="text-sm sm:text-base text-neutral-text-secondary mb-4">
              This job has {job.applicationCount} applications. Jobs with 10 or more applications cannot be edited.
            </p>
            <p className="text-xs sm:text-sm text-neutral-text-muted mb-4">
              To make changes, close this job and create a new posting.
            </p>
            <button
              onClick={() => router.push("/employer-dashboard/jobs")}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-neutral-text text-white rounded-md hover:bg-neutral-text/90"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateJob({
        id: jobId,
        title: formData.title,
        department: formData.department === "other" ? formData.customDepartment : formData.department,
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location: formData.multipleLocations 
          ? formData.locations.slice(0, 7).join(", ") + (formData.locations.length > 7 ? ` +${formData.locations.length - 7} more` : "")
          : formData.location,
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
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        positions: parseInt(formData.positions),
        experienceLevel: formData.experienceLevel,
        applicationSettings: formData.applicationSettings,
      });
      router.push("/employer-dashboard/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      // First update the job with latest changes
      await updateJob({
        id: jobId,
        title: formData.title,
        department: formData.department === "other" ? formData.customDepartment : formData.department,
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location: formData.multipleLocations 
          ? formData.locations.slice(0, 7).join(", ") + (formData.locations.length > 7 ? ` +${formData.locations.length - 7} more` : "")
          : formData.location,
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
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        positions: parseInt(formData.positions),
        experienceLevel: formData.experienceLevel,
        applicationSettings: formData.applicationSettings,
      });
      
      // Then publish it
      await publishJob({ id: jobId });
      router.push("/employer-dashboard/jobs");
    } catch (error) {
      console.error("Error publishing job:", error);
      alert("Failed to publish job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: string) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1] || "";
      
      if (currentLine.trim().startsWith('•') || currentLine.trim().startsWith('-')) {
        e.preventDefault();
        const newValue = textBefore + '\n• ' + textAfter;
        setFormData({ ...formData, [field]: newValue });
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
        }, 0);
      }
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 pb-12 sm:pb-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-2">Edit Job Posting</h1>
          {job.applicationCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs sm:text-sm text-yellow-800">
              ⚠️ This job has {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}. 
              Changes will update the live posting.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-text mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-neutral-border rounded-md text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Department *</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border border-neutral-border rounded-md text-sm sm:text-base"
                    >
                      <option value="">Select department</option>
                      <option value="technology">Technology & IT</option>
                      <option value="marketing">Marketing & Sales</option>
                      <option value="finance">Finance & Accounting</option>
                      <option value="engineering">Engineering</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education & Training</option>
                      <option value="hospitality">Hospitality & Tourism</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="construction">Construction</option>
                      <option value="logistics">Logistics & Transport</option>
                      <option value="creative">Creative & Design</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {formData.department === "other" && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">Specify Department *</label>
                      <input
                        type="text"
                        required
                        value={formData.customDepartment}
                        onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
                        placeholder="Enter department name"
                        className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Positions *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.positions}
                      onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Employment Type *</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      required
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Workplace Type *</label>
                    <select
                      value={formData.workplaceType}
                      onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      required
                    >
                      <option value="on-site">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Location *
                  </label>
                  {!formData.multipleLocations ? (
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    >
                      <option value="">Select county</option>
                      {KENYA_COUNTIES.map((county) => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-4 py-2 border border-neutral-border rounded-md bg-neutral-bg-secondary text-sm text-neutral-text-secondary">
                      Multiple locations selected below
                    </p>
                  )}
                </div>

                {/* Multiple Locations Option */}
                <div className="border border-neutral-border rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.multipleLocations}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          multipleLocations: e.target.checked,
                          locations: e.target.checked ? formData.locations : [],
                        });
                      }}
                      className="w-4 h-4 text-brand-orange rounded"
                    />
                    <div>
                      <p className="font-medium text-neutral-text">This job is available in multiple locations</p>
                      <p className="text-sm text-neutral-text-secondary">Select multiple counties where this role is available</p>
                    </div>
                  </label>

                  {formData.multipleLocations && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Select Counties *
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-neutral-border rounded-md p-3 bg-white">
                        {KENYA_COUNTIES.map((county) => (
                          <label key={county} className="flex items-center gap-2 text-sm hover:bg-neutral-bg-secondary p-1 rounded">
                            <input
                              type="checkbox"
                              checked={formData.locations.includes(county)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    locations: [...formData.locations, county]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    locations: formData.locations.filter(l => l !== county)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-brand-orange rounded"
                            />
                            <span>{county}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-text-muted mt-2">
                        {formData.locations.length} location{formData.locations.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Experience Level *</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    required
                  >
                    <option value="intern">Intern</option>
                    <option value="attachee">Attachee</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Job Description</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md h-32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Responsibilities *</label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "responsibilities")}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md h-32 font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-neutral-text-muted mt-1">Press Enter to auto-add bullet points</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Requirements & Skills</h3>
              <div className="space-y-4">
                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Required Skills (Min 3, Max 5)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          if (input.value.trim() && formData.requiredSkills.length < 5) {
                            setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, input.value.trim()] });
                            input.value = '';
                          }
                        }
                      }}
                      placeholder="Type skill and press Enter"
                      className="flex-1 px-4 py-2 border border-neutral-border rounded-md"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md text-sm flex items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter((_, i) => i !== index) })}
                          className="hover:text-orange-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Preferred Skills (Optional)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          if (input.value.trim()) {
                            setFormData({ ...formData, preferredSkills: [...formData.preferredSkills, input.value.trim()] });
                            input.value = '';
                          }
                        }
                      }}
                      placeholder="Type skill and press Enter"
                      className="flex-1 px-4 py-2 border border-neutral-border rounded-md"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredSkills: formData.preferredSkills.filter((_, i) => i !== index) })}
                          className="hover:text-gray-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Required Qualifications *</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "requirements")}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md h-32 font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-neutral-text-muted mt-1">Press Enter to auto-add bullet points</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Nice to Have</label>
                  <textarea
                    value={formData.niceToHave}
                    onChange={(e) => setFormData({ ...formData, niceToHave: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "niceToHave")}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md h-24 font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-text-muted mt-1">Press Enter to auto-add bullet points</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Compensation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Salary Disclosure *</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="range"
                        checked={formData.salaryDisclosure === "range"}
                        onChange={(e) => setFormData({ ...formData, salaryDisclosure: e.target.value })}
                      />
                      <span className="text-sm">Show salary range</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="undisclosed"
                        checked={formData.salaryDisclosure === "undisclosed"}
                        onChange={(e) => setFormData({ ...formData, salaryDisclosure: e.target.value })}
                      />
                      <span className="text-sm">To be discussed</span>
                    </label>
                  </div>
                </div>

                {formData.salaryDisclosure === "range" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      >
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">Minimum *</label>
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">Maximum *</label>
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-border rounded-md"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Benefits</label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "benefits")}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md h-24 font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-text-muted mt-1">Press Enter to auto-add bullet points</p>
                </div>
              </div>
            </div>

            {/* Application Settings */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Application Settings</h3>
              <p className="text-sm text-neutral-text-secondary mb-4">Customize what information you collect from applicants</p>
              
              <div className="space-y-4">
                {/* Required Information */}
                <div className="bg-white border border-neutral-border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-neutral-text mb-4">Required Information</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
                      <input
                        type="checkbox"
                        checked={formData.applicationSettings.requireResume}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireResume: e.target.checked }
                        })}
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
                        checked={formData.applicationSettings.requireCoverLetter}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireCoverLetter: e.target.checked }
                        })}
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
                        checked={formData.applicationSettings.requirePortfolio}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requirePortfolio: e.target.checked }
                        })}
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
                        checked={formData.applicationSettings.requireLinkedIn}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireLinkedIn: e.target.checked }
                        })}
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
                  <h4 className="text-lg font-semibold text-neutral-text mb-4">Additional Questions</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
                      <input
                        type="checkbox"
                        checked={formData.applicationSettings.requireAvailability}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireAvailability: e.target.checked }
                        })}
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
                        checked={formData.applicationSettings.requireSalaryExpectations}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireSalaryExpectations: e.target.checked }
                        })}
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
                        checked={formData.applicationSettings.requireWorkAuthorization}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireWorkAuthorization: e.target.checked }
                        })}
                        className="w-4 h-4 text-brand-orange rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-text">Work Authorization</p>
                        <p className="text-sm text-neutral-text-secondary">Are they authorized to work in Kenya?</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-neutral-border rounded-lg cursor-pointer hover:bg-neutral-bg-secondary">
                      <input
                        type="checkbox"
                        checked={formData.applicationSettings.requireWillingToRelocate}
                        onChange={(e) => setFormData({
                          ...formData,
                          applicationSettings: { ...formData.applicationSettings, requireWillingToRelocate: e.target.checked }
                        })}
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
                      <h4 className="text-lg font-semibold text-neutral-text">Custom Questions</h4>
                      <p className="text-sm text-neutral-text-secondary">Add up to 5 custom questions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.applicationSettings.customQuestions.length < 5) {
                          setFormData({
                            ...formData,
                            applicationSettings: {
                              ...formData.applicationSettings,
                              customQuestions: [
                                ...formData.applicationSettings.customQuestions,
                                {
                                  question: "",
                                  type: "text" as const,
                                  required: false,
                                  options: [],
                                  acceptedFileTypes: [],
                                  maxFileSize: 5,
                                }
                              ]
                            }
                          });
                        }
                      }}
                      disabled={formData.applicationSettings.customQuestions.length >= 5}
                      className="px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Question
                    </button>
                  </div>

                  {formData.applicationSettings.customQuestions.length === 0 ? (
                    <p className="text-sm text-neutral-text-muted text-center py-8">
                      No custom questions yet. Click "Add Question" to create one.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.applicationSettings.customQuestions.map((q: any, index: number) => (
                        <div key={index} className="p-4 border border-neutral-border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium text-neutral-text-secondary">Question {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.applicationSettings.customQuestions.filter((_: any, i: number) => i !== index);
                                setFormData({
                                  ...formData,
                                  applicationSettings: { ...formData.applicationSettings, customQuestions: updated }
                                });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-neutral-text mb-1">Question *</label>
                              <input
                                type="text"
                                required
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...formData.applicationSettings.customQuestions];
                                  const current = updated[index];
                                  if (current) {
                                    updated[index] = { 
                                      ...current, 
                                      question: e.target.value,
                                      type: current.type || "text",
                                      required: current.required ?? false,
                                      maxFileSize: current.maxFileSize || 5,
                                      acceptedFileTypes: current.acceptedFileTypes || []
                                    };
                                    setFormData({
                                      ...formData,
                                      applicationSettings: { ...formData.applicationSettings, customQuestions: updated }
                                    });
                                  }
                                }}
                                placeholder="Enter your question"
                                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-neutral-text mb-1">Answer Type</label>
                                <select
                                  value={q.type}
                                  onChange={(e) => {
                                    const updated = [...formData.applicationSettings.customQuestions];
                                    const current = updated[index];
                                    if (current) {
                                      updated[index] = { 
                                        ...current, 
                                        type: e.target.value as "text" | "textarea" | "select" | "radio" | "checkbox" | "file",
                                        required: current.required ?? false,
                                        maxFileSize: current.maxFileSize || 5,
                                        acceptedFileTypes: current.acceptedFileTypes || []
                                      };
                                      setFormData({
                                        ...formData,
                                        applicationSettings: { ...formData.applicationSettings, customQuestions: updated }
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm"
                                >
                                  <option value="text">Short Text</option>
                                  <option value="textarea">Long Text</option>
                                  <option value="select">Dropdown</option>
                                  <option value="radio">Multiple Choice</option>
                                  <option value="checkbox">Checkboxes</option>
                                  <option value="file">File Upload</option>
                                </select>
                              </div>

                              <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={q.required}
                                    onChange={(e) => {
                                      const updated = [...formData.applicationSettings.customQuestions];
                                      const current = updated[index];
                                      if (current) {
                                        updated[index] = { 
                                          ...current, 
                                          required: e.target.checked,
                                          type: current.type || "text",
                                          maxFileSize: current.maxFileSize || 5,
                                          acceptedFileTypes: current.acceptedFileTypes || []
                                        };
                                        setFormData({
                                          ...formData,
                                          applicationSettings: { ...formData.applicationSettings, customQuestions: updated }
                                        });
                                      }
                                    }}
                                    className="w-4 h-4 text-brand-orange rounded"
                                  />
                                  <span className="text-sm text-neutral-text">Required</span>
                                </label>
                              </div>
                            </div>

                            {(q.type === "select" || q.type === "radio" || q.type === "checkbox") && (
                              <div>
                                <label className="block text-sm font-medium text-neutral-text mb-1">Options (comma-separated)</label>
                                <input
                                  type="text"
                                  value={q.options?.join(", ") || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.applicationSettings.customQuestions];
                                    const current = updated[index];
                                    if (current) {
                                      updated[index] = { 
                                        ...current, 
                                        options: e.target.value.split(",").map((opt: string) => opt.trim()).filter(Boolean),
                                        type: current.type || "text",
                                        required: current.required ?? false,
                                        maxFileSize: current.maxFileSize || 5,
                                        acceptedFileTypes: current.acceptedFileTypes || []
                                      };
                                      setFormData({
                                        ...formData,
                                        applicationSettings: { ...formData.applicationSettings, customQuestions: updated }
                                      });
                                    }
                                  }}
                                  placeholder="Option 1, Option 2, Option 3"
                                  className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-neutral-border">
              <button
                type="button"
                onClick={() => router.push("/employer-dashboard/jobs")}
                className="px-6 py-3 border border-neutral-border text-neutral-text rounded-md hover:bg-neutral-bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              {isDraft && isVerified && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing..." : "Publish Job"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </EmployerDashboardLayout>
  );
}
