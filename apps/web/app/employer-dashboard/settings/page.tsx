"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, Users, Mail, Phone, Shield, Bell, CreditCard, Trash2 } from "lucide-react";

export default function EmployerSettingsPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState<"company" | "notifications" | "billing" | "security">("company");

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
                onClick={() => setActiveTab("billing")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "billing"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Billing
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
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "security" && <SecurityTab />}
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function CompanyProfileTab({ profile }: { profile: any }) {
  const updateProfile = useMutation(api.profile.updateEmployerProfile);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    profile?.employerProfile?.companyLogo || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [linkedInError, setLinkedInError] = useState("");
  const [regNumberError, setRegNumberError] = useState("");
  const [kraPinError, setKraPinError] = useState("");
  const [industry, setIndustry] = useState(profile?.employerProfile?.companyIndustries?.[0] || "");
  const [companySize, setCompanySize] = useState(profile?.employerProfile?.companySize || "");

  // Update logo preview when profile changes
  useEffect(() => {
    if (profile?.employerProfile?.companyLogo) {
      setLogoPreview(profile.employerProfile.companyLogo);
    }
  }, [profile?.employerProfile?.companyLogo]);

  // Update industry and company size when profile loads
  useEffect(() => {
    if (profile?.employerProfile) {
      setIndustry(profile.employerProfile.companyIndustries?.[0] || "");
      setCompanySize(profile.employerProfile.companySize || "");
    }
  }, [profile?.employerProfile]);

  const validatePhone = (phone: string) => {
    if (!phone) {
      setPhoneError("");
      return true;
    }
    const phoneRegex = /^(\+254[71]\d{8}|0[71]\d{8})$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Phone must start with +2547, +2541, 07, or 01 followed by 8 digits.");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateWebsite = (url: string) => {
    if (!url) {
      setWebsiteError("");
      return true;
    }
    try {
      new URL(url);
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        setWebsiteError("Website must start with http:// or https://");
        return false;
      }
      setWebsiteError("");
      return true;
    } catch {
      setWebsiteError("Please enter a valid website URL");
      return false;
    }
  };

  const validateLinkedIn = (url: string) => {
    if (!url) {
      setLinkedInError("");
      return true;
    }
    if (!url.includes("linkedin.com/")) {
      setLinkedInError("Please enter a valid LinkedIn URL (must contain linkedin.com/)");
      return false;
    }
    setLinkedInError("");
    return true;
  };

  const validateRegNumber = (value: string) => {
    if (!value) {
      setRegNumberError("");
      return true;
    }
    const upperValue = value.toUpperCase();
    const regNumberRegex = /^(CPR|PVT|BN)\/\d{4}\/\d{6}$|^C\.\d{6}$/;
    
    if (!regNumberRegex.test(upperValue)) {
      setRegNumberError("Invalid format. Use CPR/YYYY/NNNNNN, PVT/YYYY/NNNNNN, BN/YYYY/NNNNNN, or C.NNNNNN");
      return false;
    }
    setRegNumberError("");
    return true;
  };

  const validateKraPin = (value: string) => {
    if (!value) {
      setKraPinError("");
      return true;
    }
    const kraPinRegex = /^[A-Z]\d{9}[A-Z]$/;
    
    if (!kraPinRegex.test(value)) {
      setKraPinError("Invalid format. KRA PIN should be like A000000000X (letter + 9 digits + letter)");
      return false;
    }
    setKraPinError("");
    return true;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      await updateProfile({
        companyName: formData.get("companyName") as string,
        companySize: formData.get("companySize") as string,
        companyIndustries: [formData.get("industry") as string].filter(Boolean),
        website: formData.get("website") as string,
        foundedYear: formData.get("foundedYear") ? parseInt(formData.get("foundedYear") as string) : undefined,
        linkedInProfile: formData.get("linkedInProfile") as string,
        companyDescription: formData.get("companyDescription") as string,
        isKenyaBased: formData.get("isKenyaBased") === "on",
        headquarters: formData.get("headquarters") as string,
        country: formData.get("country") as string,
        registrationNumber: formData.get("registrationNumber") as string,
        kraPin: formData.get("kraPin") as string,
        contactPersonName: formData.get("contactPersonName") as string,
        contactPersonTitle: formData.get("contactPersonTitle") as string,
        contactPersonPhone: formData.get("contactPersonPhone") as string,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Logo */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Company Logo</h3>
        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            {logoPreview ? (
              <div className="relative w-32 h-32 border-2 border-neutral-border rounded-lg overflow-hidden bg-neutral-bg-secondary">
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-neutral-border rounded-lg flex items-center justify-center bg-neutral-bg-secondary">
                <Building2 className="w-12 h-12 text-neutral-text-muted" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <p className="text-sm text-neutral-text mb-2 font-medium">
              Upload your company logo
            </p>
            <p className="text-sm text-neutral-text-secondary mb-4">
              Recommended: Square image, at least 200x200px. Max file size: 2MB
            </p>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2.5 bg-white border border-neutral-border text-neutral-text text-sm font-medium rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              {logoPreview && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-4 py-2.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Company Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              defaultValue={profile?.employerProfile?.companyName}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Industry
              </label>
              <select 
                name="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Company Size
              </label>
              <select 
                name="companySize"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="">Select size</option>
                <option value="startup">Startup (1-10 employees)</option>
                <option value="small">Small Business (11-50)</option>
                <option value="medium">Medium Company (51-200)</option>
                <option value="large">Large Enterprise (200+)</option>
                <option value="ngo">NGO/Non-Profit</option>
                <option value="agency">Recruitment Agency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                defaultValue={profile?.employerProfile?.website}
                onChange={(e) => validateWebsite(e.target.value)}
                placeholder="https://example.com"
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                  websiteError ? "border-red-500" : "border-neutral-border"
                }`}
              />
              {websiteError && (
                <p className="text-xs text-red-600 mt-1">{websiteError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Founded Year
              </label>
              <input
                type="number"
                name="foundedYear"
                min="1800"
                max={new Date().getFullYear()}
                defaultValue={profile?.employerProfile?.foundedYear}
                placeholder="2020"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              name="linkedInProfile"
              defaultValue={profile?.employerProfile?.linkedInProfile}
              onChange={(e) => validateLinkedIn(e.target.value)}
              placeholder="https://linkedin.com/company/your-company"
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                linkedInError ? "border-red-500" : "border-neutral-border"
              }`}
            />
            {linkedInError && (
              <p className="text-xs text-red-600 mt-1">{linkedInError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Company Description
            </label>
            <textarea
              rows={4}
              name="companyDescription"
              defaultValue={profile?.employerProfile?.companyDescription}
              placeholder="Tell us about your company..."
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          {/* Location Section */}
          <div className="pt-4 border-t border-neutral-border">
            <h4 className="text-sm font-semibold text-neutral-text mb-4">Location</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isKenyaBased"
                  name="isKenyaBased"
                  defaultChecked={profile?.employerProfile?.isKenyaBased}
                  className="w-4 h-4 text-brand-orange rounded"
                />
                <label htmlFor="isKenyaBased" className="text-sm text-neutral-text">
                  Company is based in Kenya
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Headquarters (City/County)
                  </label>
                  <input
                    type="text"
                    name="headquarters"
                    defaultValue={profile?.employerProfile?.headquarters}
                    placeholder="Nairobi"
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    defaultValue={profile?.employerProfile?.country || "Kenya"}
                    placeholder="Kenya"
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kenya Registration (Optional) */}
          <div className="pt-4 border-t border-neutral-border">
            <h4 className="text-sm font-semibold text-neutral-text mb-2">Company Registration</h4>
            <p className="text-xs text-neutral-text-secondary mb-4">For verification purposes</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  defaultValue={profile?.employerProfile?.registrationNumber}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    validateRegNumber(e.target.value);
                  }}
                  placeholder="CPR/2024/123456"
                  style={{ textTransform: 'uppercase' }}
                  className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                    regNumberError ? "border-red-500" : "border-neutral-border"
                  }`}
                />
                {regNumberError && (
                  <p className="text-xs text-red-600 mt-1">{regNumberError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  KRA PIN (Optional)
                </label>
                <input
                  type="text"
                  name="kraPin"
                  defaultValue={profile?.employerProfile?.kraPin}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    validateKraPin(e.target.value);
                  }}
                  placeholder="A000000000X"
                  style={{ textTransform: 'uppercase' }}
                  className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                    kraPinError ? "border-red-500" : "border-neutral-border"
                  }`}
                />
                {kraPinError && (
                  <p className="text-xs text-red-600 mt-1">{kraPinError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button 
            type="submit"
            disabled={isSaving || !!phoneError || !!websiteError || !!linkedInError || !!regNumberError || !!kraPinError}
            className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button 
            type="button"
            className="px-6 py-2.5 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Contact Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Contact Person Name
              </label>
              <input
                type="text"
                name="contactPersonName"
                defaultValue={profile?.employerProfile?.contactPersonName}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="contactPersonTitle"
                defaultValue={profile?.employerProfile?.contactPersonTitle}
                placeholder="HR Manager"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={profile?.email}
                placeholder="contact@company.com"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="contactPersonPhone"
                defaultValue={profile?.employerProfile?.contactPersonPhone}
                onChange={(e) => validatePhone(e.target.value)}
                placeholder="+254 700 000 000"
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${
                  phoneError ? "border-red-500" : "border-neutral-border"
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button 
            type="submit"
            disabled={isSaving || !!phoneError || !!websiteError || !!linkedInError || !!regNumberError || !!kraPinError}
            className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button 
            type="button"
            className="px-6 py-2.5 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
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
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Current Plan</h3>
        <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg mb-4">
          <div>
            <p className="font-semibold text-neutral-text">Free Plan</p>
            <p className="text-sm text-neutral-text-secondary">Post up to 3 jobs per month</p>
          </div>
          <button className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90">
            Upgrade
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Billing History</h3>
        <p className="text-neutral-text-secondary text-center py-8">No billing history yet</p>
      </div>
    </div>
  );
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

      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium text-neutral-text mb-1">Delete Account</p>
              <p className="text-sm text-neutral-text-secondary">
                Permanently delete your company account and all data
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
