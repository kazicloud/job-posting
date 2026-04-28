"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, Users, Mail, Phone, Shield, Bell, CreditCard, Trash2, Lock, Pencil, X, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

export default function EmployerSettingsPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState<"company" | "notifications" | "security">("company");

  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">Settings</h1>
          <p className="text-neutral-text-secondary">Manage your company profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-border rounded-lg p-2">
              <button
                onClick={() => setActiveTab("company")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "company"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Building2 className="w-5 h-5" />
                Company Profile
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "company" && <CompanyProfileTab profile={profile} />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "security" && <SecurityTab />}
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function CompanyProfileTab({ profile }: { profile: any }) {
  const updateProfile = useMutation(api.profile.updateEmployerProfile);
  const submitChangeRequest = useMutation(api.profileChangeRequests.submitChangeRequest);
  const notifyAdmin = useAction(api.emails.notifyAdminProfileChangeRequest);
  const changeRequest = useQuery(api.profileChangeRequests.getMyChangeRequest);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    profile?.employerProfile?.companyLogo || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [industry, setIndustry] = useState(profile?.employerProfile?.companyIndustries?.[0] || "");
  const [companySize, setCompanySize] = useState(profile?.employerProfile?.companySize || "");

  const ep = profile?.employerProfile;

  // Editing is allowed only if admin approved the change request
  const isEditApproved = changeRequest?.status === "approved";
  const hasPendingRequest = changeRequest?.status === "pending";

  useEffect(() => {
    if (ep?.companyLogo) setLogoPreview(ep.companyLogo);
  }, [ep?.companyLogo]);

  useEffect(() => {
    if (ep) {
      setIndustry(ep.companyIndustries?.[0] || "");
      setCompanySize(ep.companySize || "");
    }
  }, [ep]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditApproved) return;
    setIsSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateProfile({
        companyName: fd.get("companyName") as string,
        companySize: fd.get("companySize") as string,
        companyIndustries: [fd.get("industry") as string].filter(Boolean),
        website: fd.get("website") as string,
        foundedYear: fd.get("foundedYear") ? parseInt(fd.get("foundedYear") as string) : undefined,
        linkedInProfile: fd.get("linkedInProfile") as string,
        companyDescription: fd.get("companyDescription") as string,
        isKenyaBased: ep?.isKenyaBased,
        headquarters: fd.get("headquarters") as string,
        country: ep?.country || "Kenya",
        registrationNumber: ep?.registrationNumber,
        kraPin: ep?.kraPin,
        contactPersonName: fd.get("contactPersonName") as string,
        contactPersonTitle: fd.get("contactPersonTitle") as string,
        contactPersonPhone: fd.get("contactPersonPhone") as string,
        companyLogo: logoPreview || undefined,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestReason.trim()) return;
    setIsSubmittingRequest(true);
    try {
      await submitChangeRequest({ reason: requestReason.trim() });
      await notifyAdmin({
        employerName: profile?.fullName || "Employer",
        companyName: ep?.companyName || "Company",
        employerEmail: profile?.email || "",
        reason: requestReason.trim(),
      });
      setShowRequestModal(false);
      setRequestReason("");
      alert("Your change request has been submitted. You'll be notified once an admin reviews it.");
    } catch (error: any) {
      if (error?.message?.includes("already have a pending")) {
        alert("You already have a pending change request. Please wait for admin review.");
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const COUNTRY_MAP: Record<string, string> = {
    KE: "Kenya", RW: "Rwanda", TZ: "Tanzania", UG: "Uganda",
    Kenya: "Kenya", Rwanda: "Rwanda", Tanzania: "Tanzania", Uganda: "Uganda",
  };
  const displayCountry = COUNTRY_MAP[ep?.country || ""] || ep?.country || "—";

  // Greyed out input styles
  const readOnlyClass = "w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary cursor-not-allowed";
  const editableClass = "w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Edit Request Banner */}
        {!isEditApproved && (
          <div className={`rounded-lg border p-4 flex items-start gap-3 ${
            hasPendingRequest
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200"
          }`}>
            {hasPendingRequest ? (
              <>
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Change Request Pending</p>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    Your request to edit your profile is under review by an admin. You&apos;ll be notified once it&apos;s approved.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Profile fields are locked</p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    To protect data integrity, profile fields cannot be edited directly. To make changes, submit a request explaining what you need to update.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="flex-shrink-0 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Request Edit
                </button>
              </>
            )}
          </div>
        )}

        {isEditApproved && (
          <div className="rounded-lg border bg-green-50 border-green-200 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Edit Mode Active</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your change request was approved. You can now edit your profile fields below. Save your changes when done.
              </p>
            </div>
          </div>
        )}

        {/* Company Logo */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-text mb-6">Company Logo</h3>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative w-32 h-32 border-2 border-neutral-border rounded-lg overflow-hidden bg-neutral-bg-secondary">
                  <img src={logoPreview} alt="Company logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-neutral-border rounded-lg flex items-center justify-center bg-neutral-bg-secondary">
                  <Building2 className="w-12 h-12 text-neutral-text-muted" />
                </div>
              )}
            </div>
            {isEditApproved && (
              <div className="flex-1">
                <p className="text-sm text-neutral-text mb-2 font-medium">Upload your company logo</p>
                <p className="text-sm text-neutral-text-secondary mb-4">Recommended: Square image, at least 200x200px. Max 2MB</p>
                <label className="px-4 py-2.5 bg-white border border-neutral-border text-neutral-text text-sm font-medium rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors">
                  Choose File
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-text">Company Information</h3>
            {!isEditApproved && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-text-muted">
                <Lock className="w-3.5 h-3.5" /> Read-only
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                defaultValue={ep?.companyName}
                readOnly={!isEditApproved}
                className={isEditApproved ? editableClass : readOnlyClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Industry</label>
                {isEditApproved ? (
                  <select
                    name="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={editableClass}
                  >
                    <option value="">Select industry</option>
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
                ) : (
                  <input type="text" value={industry || "—"} readOnly className={readOnlyClass} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Company Size</label>
                {isEditApproved ? (
                  <select
                    name="companySize"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={editableClass}
                  >
                    <option value="">Select size</option>
                    <option value="startup">Startup (1-10)</option>
                    <option value="small">Small (11-50)</option>
                    <option value="medium">Medium (51-200)</option>
                    <option value="large">Large (200+)</option>
                    <option value="ngo">NGO/Non-Profit</option>
                    <option value="agency">Recruitment Agency</option>
                  </select>
                ) : (
                  <input type="text" value={companySize || "—"} readOnly className={readOnlyClass} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={ep?.website}
                  readOnly={!isEditApproved}
                  placeholder="https://example.com"
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Founded Year</label>
                <input
                  type="number"
                  name="foundedYear"
                  min="1800"
                  max={new Date().getFullYear()}
                  defaultValue={ep?.foundedYear}
                  readOnly={!isEditApproved}
                  placeholder="2020"
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedInProfile"
                defaultValue={ep?.linkedInProfile}
                readOnly={!isEditApproved}
                placeholder="https://linkedin.com/company/your-company"
                className={isEditApproved ? editableClass : readOnlyClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">Company Description</label>
              <textarea
                rows={4}
                name="companyDescription"
                defaultValue={ep?.companyDescription}
                readOnly={!isEditApproved}
                placeholder="Tell us about your company..."
                className={isEditApproved ? editableClass : readOnlyClass}
              />
            </div>

            {/* Location */}
            <div className="pt-4 border-t border-neutral-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-neutral-text">Location</h4>
                <span className="flex items-center gap-1.5 text-xs text-neutral-text-muted">
                  <Lock className="w-3.5 h-3.5" /> Read-only
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Country</label>
                  <input type="text" value={displayCountry} readOnly className={readOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Headquarters</label>
                  <input
                    type="text"
                    name="headquarters"
                    defaultValue={ep?.headquarters}
                    readOnly={!isEditApproved}
                    className={isEditApproved ? editableClass : readOnlyClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditApproved && (
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-text">Contact Information</h3>
            {!isEditApproved && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-text-muted">
                <Lock className="w-3.5 h-3.5" /> Read-only
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Contact Person Name</label>
                <input
                  type="text"
                  name="contactPersonName"
                  defaultValue={ep?.contactPersonName}
                  readOnly={!isEditApproved}
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Job Title</label>
                <input
                  type="text"
                  name="contactPersonTitle"
                  defaultValue={ep?.contactPersonTitle}
                  readOnly={!isEditApproved}
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Email</label>
                <input type="email" value={profile?.email || "—"} readOnly className={readOnlyClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Phone</label>
                <input
                  type="tel"
                  name="contactPersonPhone"
                  defaultValue={ep?.contactPersonPhone}
                  readOnly={!isEditApproved}
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>
            </div>
          </div>

          {isEditApproved && (
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Request Edit Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-neutral-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-text">Request Profile Edit</h3>
              </div>
              <button
                onClick={() => { setShowRequestModal(false); setRequestReason(""); }}
                className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-neutral-text-secondary mb-4">
                Please explain which fields you need to change and why. An admin will review your request and grant edit access if approved.
              </p>
              <label className="block">
                <span className="text-sm font-medium text-neutral-text">
                  Reason for Edit <span className="text-red-500">*</span>
                </span>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="e.g., We recently rebranded and need to update our company name and logo. We also moved our headquarters to a new city..."
                  className="mt-2 w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
                  rows={5}
                />
              </label>
              <p className="text-xs text-neutral-text-muted mt-2">
                Your request will be sent to the Kazicloud admin team for review.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-border bg-neutral-bg-secondary rounded-b-lg">
              <button
                onClick={() => { setShowRequestModal(false); setRequestReason(""); }}
                className="px-4 py-2 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!requestReason.trim() || isSubmittingRequest}
                className="px-6 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NotificationsTab() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-neutral-text mb-6">Notification Preferences</h3>
      <div className="space-y-4">
        <NotificationToggle
          label="New Applications"
          description="Get notified when someone applies to your jobs"
          defaultChecked={true}
        />
        <NotificationToggle
          label="Application Updates"
          description="Updates on application status changes"
          defaultChecked={true}
        />
        <NotificationToggle
          label="Job Performance"
          description="Weekly reports on job posting performance"
          defaultChecked={false}
        />
        <NotificationToggle
          label="Marketing Updates"
          description="Tips and best practices for hiring"
          defaultChecked={false}
        />
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-neutral-border last:border-0">
      <div>
        <p className="font-medium text-neutral-text mb-1">{label}</p>
        <p className="text-sm text-neutral-text-secondary">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
      </label>
    </div>
  );
}

function BillingTab() {
  const profile = useQuery(api.profile.getCurrentUserProfile)
  const subscription = useQuery(api.billing.getCurrentSubscription)
  const billingHistory = useQuery(api.billing.getBillingHistory)
  const createTransaction = useMutation(api.billing.createTransaction)
  const verifyPayment = useAction(api.billing.verifyAndUpdateSubscription)
  
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'bulk' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Starter (Free Trial)',
      price: 0,
      period: '',
      description: 'Test the platform before committing',
      tagline: 'Best for: Testing the platform before committing',
      subtitle: 'Start hiring in minutes and experience how Kazicloud helps you identify top candidates instantly—without manual screening.',
      features: [
        '2 job postings (free)',
        '14-day listing duration per job',
        'Candidate ranking (see top candidates first)',
        'Custom screening questions (filter applicants automatically)',
        'Candidate analysis (quick insights on every applicant)',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'Instantly see qualified candidates without sorting through hundreds of CVs',
        'Experience faster hiring before upgrading',
        'Test the system without financial commitment',
      ],
      limitations: [
        'Limited to 2 total job posts',
        'No reposting or additional credits',
        'No featured placement',
      ],
      cta: 'Test the platform. See results.',
    },
    {
      id: 'basic',
      name: 'Basic (Pay As You Hire)',
      price: 3500,
      period: '/job',
      description: 'Ideal for urgent or competitive roles',
      tagline: 'Ideal for urgent or competitive roles',
      subtitle: 'Post a job and let our system automatically rank and highlight your best candidates—so you don\'t waste time reviewing irrelevant applications.',
      features: [
        '1 job posting (30 days)',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'No subscription commitment',
        'Pay only when you need to hire',
        'Upscale based on demand',
        'Quickly identify top candidates without manual effort',
      ],
      cta: 'Post a job and Instantly Identify top candidates',
    },
    {
      id: 'growth',
      name: 'Growth (Save More As You Scale)',
      price: 7500,
      period: '/month',
      description: 'Up to 5 Jobs',
      tagline: 'Best for: SMEs and growing teams with consistent hiring',
      subtitle: 'Hire smarter every month while saving over 40% compared to Basic job postings.',
      features: [
        'Up to 5 job postings per month',
        '30-day listing duration per job',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'Lower cost per job',
        'Consistent hiring without paying per post',
        'Spend less time filtering candidates',
      ],
      cta: 'Consistent hiring at lower cost',
    },
    {
      id: 'enterprise',
      name: 'Enterprise (Hire Without Limits)',
      price: 15000,
      period: '/month',
      description: 'Unlimited Jobs',
      tagline: 'Best for: High-volume hiring, recruitment agencies, and fast-growing companies',
      subtitle: 'Post as many jobs as you need while our system helps you focus only on the most qualified candidates.',
      features: [
        'Unlimited job postings per month',
        '30-day listing duration per job',
        'Priority listing visibility (above free users)',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'No limits on hiring',
        'Predictable monthly cost',
        'Faster hiring cycles with better candidate filtering',
      ],
      cta: 'Unlimited hiring with speed and efficiency',
    },
  ]

  const handleUpgrade = async (planId: string, amount: number) => {
    if (amount === 0 || !profile?.email) return

    setIsProcessing(true)
    setSelectedPlan(planId as any)

    try {
      const reference = `${planId}_${Date.now()}`
      
      // Create transaction record
      await createTransaction({
        reference,
        plan: planId,
        amount,
        currency: 'KES',
      })

      // Initialize Paystack
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
        email: profile.email,
        amount: amount * 100, // Convert to kobo
        currency: 'KES',
        ref: reference,
        metadata: {
          plan: planId,
          userId: profile._id,
        },
        callback: function(response: any) {
          // Payment successful
          verifyPayment({ reference: response.reference })
            .then((result) => {
              if (result.success) {
                alert('Payment successful! Your plan has been upgraded.')
                window.location.reload()
              } else {
                alert('Payment verification failed: ' + result.message)
              }
            })
            .catch((error) => {
              console.error('Verification error:', error)
              alert('Payment verification failed. Please contact support.')
            })
            .finally(() => {
              setIsProcessing(false)
              setSelectedPlan(null)
            })
        },
        onClose: function () {
          setIsProcessing(false)
          setSelectedPlan(null)
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initialization failed. Please try again.')
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  const currentPlan = subscription?.plan || 'free'

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Current Plan</h3>
        <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg mb-4">
          <div>
            <p className="font-semibold text-neutral-text capitalize">{currentPlan} Plan</p>
            <p className="text-sm text-neutral-text-secondary">
              {subscription?.jobPostingsRemaining === -1
                ? 'Unlimited job postings'
                : `${subscription?.jobPostingsRemaining || 1} job posting${
                    subscription?.jobPostingsRemaining === 1 ? '' : 's'
                  } remaining`}
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {subscription?.status || 'Active'}
          </span>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Choose Your Plan</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 ${
                currentPlan === plan.id
                  ? 'border-brand-orange bg-brand-orange/5'
                  : 'border-neutral-border hover:border-brand-orange/50 transition-colors'
              }`}
            >
              <div className="mb-4">
                <h4 className="font-bold text-lg text-neutral-text mb-1">{plan.name}</h4>
                {plan.tagline && (
                  <p className="text-sm text-neutral-text-secondary mb-3">{plan.tagline}</p>
                )}
                <div className="mt-3">
                  <span className="text-4xl font-bold text-neutral-text">
                    KES {plan.price.toLocaleString()}
                  </span>
                  <span className="text-neutral-text-secondary ml-1">{plan.period}</span>
                </div>
                {plan.description && (
                  <p className="text-sm font-medium text-brand-orange mt-2">{plan.description}</p>
                )}
              </div>

              {plan.subtitle && (
                <p className="text-sm text-neutral-text-secondary mb-4 leading-relaxed">{plan.subtitle}</p>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold text-neutral-text mb-3">What's included:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-text-secondary">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.whyItWorks && plan.whyItWorks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-neutral-text mb-2">Why it works:</p>
                  <ul className="space-y-1.5">
                    {plan.whyItWorks.map((reason, index) => (
                      <li key={index} className="text-sm text-neutral-text-secondary flex items-start gap-2">
                        <span className="text-brand-orange">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.limitations && plan.limitations.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-neutral-text mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-neutral-text-secondary flex items-start gap-2">
                        <span>•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleUpgrade(plan.id, plan.price)}
                disabled={currentPlan === plan.id || isProcessing}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-neutral-bg-secondary text-neutral-text-secondary cursor-not-allowed'
                    : isProcessing && selectedPlan === plan.id
                    ? 'bg-brand-orange/50 text-white cursor-wait'
                    : 'bg-brand-orange text-white hover:bg-brand-orange/90'
                }`}
              >
                {currentPlan === plan.id
                  ? '✓ Current Plan'
                  : isProcessing && selectedPlan === plan.id
                  ? 'Processing...'
                  : plan.cta || (plan.price === 0 ? 'Start Free' : 'Choose Plan')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Billing History</h3>
        {billingHistory && billingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-text-secondary">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-text-secondary">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-text-secondary">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-neutral-border">
                    <td className="py-3 px-4 text-sm text-neutral-text">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-text capitalize">{transaction.plan}</td>
                    <td className="py-3 px-4 text-sm text-neutral-text">
                      {transaction.currency} {transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-text-secondary text-center py-8">No billing history yet</p>
        )}
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Verification Status</h3>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Verified Company</p>
            <p className="text-sm text-green-700">Your company has been verified</p>
          </div>
        </div>
      </div>

      <DeleteAccountSection />
    </div>
  );
}
