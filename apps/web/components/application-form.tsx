"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onClose?: () => void;
}

export function ApplicationForm({ jobId, jobTitle, onClose }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resumeUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to Convex
    console.log("Submitting application:", { jobId, ...formData });
  };

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-8">
      <h2 className="text-2xl font-bold text-neutral-text mb-2">Apply for {jobTitle}</h2>
      <p className="text-neutral-text-secondary mb-6">
        Fill out the form below to submit your application.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1.5">
            Cover Letter
          </label>
          <textarea
            rows={6}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-neutral-text placeholder:text-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            placeholder="Tell us why you're a great fit for this role..."
            value={formData.coverLetter}
            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1.5">
            Resume/CV
          </label>
          <div className="border-2 border-dashed border-neutral-border rounded-lg p-6 text-center">
            <p className="text-sm text-neutral-text-muted mb-2">
              Upload your resume or paste a link
            </p>
            <Input
              placeholder="https://..."
              value={formData.resumeUrl}
              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" size="lg" className="flex-1">
            Submit Application
          </Button>
          {onClose && (
            <Button type="button" variant="secondary" size="lg" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
