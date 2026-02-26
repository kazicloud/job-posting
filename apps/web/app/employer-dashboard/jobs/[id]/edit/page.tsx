"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  
  const job = useQuery(api.jobs.getWithApplicationCount, { id: jobId });
  const updateJob = useMutation(api.jobMutations.update);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    employmentType: "full-time",
    workplaceType: "on-site",
    location: "",
    county: "",
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
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        department: job.department || "",
        employmentType: job.employmentType,
        workplaceType: job.workplaceType,
        location: job.location,
        county: job.county || "",
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
      });
    }
  }, [job]);

  if (!job) {
    return (
      <EmployerDashboardLayout>
        <div className="p-8">Loading...</div>
      </EmployerDashboardLayout>
    );
  }

  if (job.applicationCount >= 10) {
    return (
      <EmployerDashboardLayout>
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-neutral-text mb-2">Cannot Edit This Job</h2>
            <p className="text-neutral-text-secondary mb-4">
              This job has {job.applicationCount} applications. Jobs with 10 or more applications cannot be edited.
            </p>
            <p className="text-sm text-neutral-text-muted mb-4">
              To make changes, close this job and create a new posting.
            </p>
            <button
              onClick={() => router.push("/employer-dashboard/jobs")}
              className="px-6 py-2 bg-neutral-text text-white rounded-md hover:bg-neutral-text/90"
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
        department: formData.department,
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location: formData.location,
        county: formData.county,
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
      });
      router.push("/employer-dashboard/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
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
      const currentLine = lines[lines.length - 1];
      
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
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">Edit Job Posting</h1>
          {job.applicationCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              ⚠️ This job has {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}. 
              Changes will update the live posting.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    />
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">County</label>
                    <input
                      type="text"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Experience Level *</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-border rounded-md"
                    required
                  >
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
            </div>
          </div>
        </form>
      </div>
    </EmployerDashboardLayout>
  );
}
