"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, Users, Mail, Phone, Shield, Bell, CreditCard, Trash2, Lock, Pencil, X, Send, CheckCircle, Clock, AlertCircle, ChevronDown } from "lucide-react";
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

const INDUSTRIES = [
  { value: "technology", label: "Technology & IT" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "engineering", label: "Engineering" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education & Training" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "agriculture", label: "Agriculture" },
  { value: "construction", label: "Construction" },
  { value: "logistics", label: "Logistics & Transport" },
  { value: "creative", label: "Creative & Design" },
  { value: "customer_service", label: "Customer Service" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10)" },
  { value: "small", label: "Small (11-50)" },
  { value: "medium", label: "Medium (51-200)" },
  { value: "large", label: "Large (200+)" },
  { value: "ngo", label: "NGO/Non-Profit" },
  { value: "agency", label: "Recruitment Agency" },
];

// ─── Country / verification config (mirrors employer-wizard) ─────────────────
const SUPPORTED_COUNTRIES = [
  { code: "KE" as const, name: "Kenya",    hqLabel: "County",           hqPlaceholder: "e.g., Nairobi",       phonePlaceholder: "+254712345678 or 0712345678", isKenya: true  },
  { code: "RW" as const, name: "Rwanda",   hqLabel: "Province or City", hqPlaceholder: "e.g., Kigali",        phonePlaceholder: "+250 78 000 0000",           isKenya: false },
  { code: "TZ" as const, name: "Tanzania", hqLabel: "Region or City",   hqPlaceholder: "e.g., Dar es Salaam", phonePlaceholder: "+255 71 000 0000",           isKenya: false },
  { code: "UG" as const, name: "Uganda",   hqLabel: "District or City", hqPlaceholder: "e.g., Kampala",       phonePlaceholder: "+256 70 000 0000",           isKenya: false },
];

type CountryCode = "KE" | "RW" | "TZ" | "UG";

const COUNTRY_NAME_TO_CODE: Record<string, CountryCode> = {
  Kenya: "KE", Rwanda: "RW", Tanzania: "TZ", Uganda: "UG",
  KE: "KE", RW: "RW", TZ: "TZ", UG: "UG",
};

const VERIFICATION_CONFIG: Record<
  CountryCode,
  { regLabel: string; regHint: string; taxLabel: string; taxHint: string; certLabel: string; certHint: string }
> = {
  KE: {
    regLabel: "Business Registration Number (BRS)",
    regHint: "Verified with Kenya Business Registration Service",
    taxLabel: "KRA PIN",
    taxHint: "Kenya Revenue Authority Personal Identification Number",
    certLabel: "Certificate of Incorporation",
    certHint: "Certificate of Incorporation or Business Registration Certificate",
  },
  RW: {
    regLabel: "RDB Registration Number",
    regHint: "Rwanda Development Board business registration number",
    taxLabel: "RRA Tax Identification Number (TIN)",
    taxHint: "9-digit TIN issued by Rwanda Revenue Authority",
    certLabel: "Certificate of Incorporation",
    certHint: "Upload your RDB Certificate of Incorporation",
  },
  TZ: {
    regLabel: "BRELA Registration Number",
    regHint: "Business Registrations and Licensing Agency registration number",
    taxLabel: "TRA Tax Identification Number (TIN)",
    taxHint: "9-digit TIN issued by Tanzania Revenue Authority",
    certLabel: "Certificate of Incorporation",
    certHint: "Upload your BRELA Certificate of Incorporation",
  },
  UG: {
    regLabel: "URSB Registration Number",
    regHint: "Uganda Registration Services Bureau business registration number",
    taxLabel: "URA Tax Identification Number (TIN)",
    taxHint: "10-digit TIN issued by Uganda Revenue Authority",
    certLabel: "Certificate of Incorporation",
    certHint: "Upload your URSB Certificate of Incorporation",
  },
};

// ── Tiny helper: per-section save button ─────────────────────────────────────
function SectionSaveButton({
  dirty,
  saving,
  saved,
  onClick,
}: {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  if (saved) {
    return (
      <button
        type="button"
        disabled
        className="px-5 py-2 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5 cursor-default"
      >
        <CheckCircle className="w-4 h-4" />
        Saved
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!dirty || saving}
      className="px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-brand-orange text-white hover:bg-brand-orange/90"
    >
      {saving ? "Saving…" : "Save Changes"}
    </button>
  );
}

function MissingBadge() {
  return (
    <span className="ml-1.5 text-xs font-normal bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
      Missing
    </span>
  );
}

function CompanyProfileTab({ profile }: { profile: any }) {
  const updateProfile = useMutation(api.profile.updateEmployerProfile);
  const fillMissingData = useMutation(api.profile.fillMissingEmployerData);
  const generateUploadUrl = useMutation(api.employerDocuments.generateUploadUrl);
  const submitChangeRequest = useMutation(api.profileChangeRequests.submitChangeRequest);
  const notifyAdmin = useAction(api.emails.notifyAdminProfileChangeRequest);
  const changeRequest = useQuery(api.profileChangeRequests.getMyChangeRequest);

  const ep = profile?.employerProfile;

  // ── Edit-approval ─────────────────────────────────────────────────────────
  const isEditApproved = changeRequest?.status === "approved";
  const hasPendingRequest = changeRequest?.status === "pending";

  // ── Country resolution ────────────────────────────────────────────────────
  const resolvedCode: CountryCode | null = ep?.country
    ? (COUNTRY_NAME_TO_CODE[ep.country] ?? null)
    : null;

  // ── Which fields are missing ──────────────────────────────────────────────
  const missing = {
    country: !ep?.country,
    companySize: !ep?.companySize,
    companyIndustries: !ep?.companyIndustries?.length,
    website: !ep?.website,
    foundedYear: !ep?.foundedYear,
    linkedInProfile: !ep?.linkedInProfile,
    companyDescription: !ep?.companyDescription,
    headquarters: !ep?.headquarters,
    contactPersonName: !ep?.contactPersonName,
    contactPersonTitle: !ep?.contactPersonTitle,
    contactPersonPhone: !ep?.contactPersonPhone,
    companyLogo: !ep?.companyLogo,
    incorporationCert: !ep?.incorporationCertStorageId,
  };
  const missingCount = Object.values(missing).filter(Boolean).length;

  // Field is editable when it's missing OR edit is approved
  const editable = (isMissing: boolean) => isMissing || isEditApproved;

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode | "">(resolvedCode ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(ep?.companyLogo || null);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(ep?.companyIndustries || []);
  const [companySize, setCompanySize] = useState(ep?.companySize || "");
  const [companyName, setCompanyName] = useState(ep?.companyName || "");
  const [website, setWebsite] = useState(ep?.website || "");
  const [foundedYear, setFoundedYear] = useState(ep?.foundedYear?.toString() || "");
  const [linkedIn, setLinkedIn] = useState(ep?.linkedInProfile || "");
  const [description, setDescription] = useState(ep?.companyDescription || "");
  const [headquarters, setHeadquarters] = useState(ep?.headquarters || "");
  const [contactName, setContactName] = useState(ep?.contactPersonName || "");
  const [contactTitle, setContactTitle] = useState(ep?.contactPersonTitle || "");
  const [contactPhone, setContactPhone] = useState(ep?.contactPersonPhone || "");
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  // Derived: full country object
  const selectedCountry = selectedCountryCode
    ? SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) ?? null
    : null;

  // ── Debounced values for validation ──────────────────────────────────────
  const [debouncedWebsite, setDebouncedWebsite] = useState(website);
  const [debouncedLinkedIn, setDebouncedLinkedIn] = useState(linkedIn);
  const [debouncedPhone, setDebouncedPhone] = useState(contactPhone);
  const [debouncedDescription, setDebouncedDescription] = useState(description);
  const [debouncedYear, setDebouncedYear] = useState(foundedYear);

  useEffect(() => { const t = setTimeout(() => setDebouncedWebsite(website), 500); return () => clearTimeout(t); }, [website]);
  useEffect(() => { const t = setTimeout(() => setDebouncedLinkedIn(linkedIn), 500); return () => clearTimeout(t); }, [linkedIn]);
  useEffect(() => { const t = setTimeout(() => setDebouncedPhone(contactPhone), 500); return () => clearTimeout(t); }, [contactPhone]);
  useEffect(() => { const t = setTimeout(() => setDebouncedDescription(description), 500); return () => clearTimeout(t); }, [description]);
  useEffect(() => { const t = setTimeout(() => setDebouncedYear(foundedYear), 500); return () => clearTimeout(t); }, [foundedYear]);

  // ── Convex validation queries ────────────────────────────────────────────
  const websiteCheck = useQuery(
    api.signupValidation.validateWebsiteUrl,
    editable(missing.website) && debouncedWebsite.trim() ? { url: debouncedWebsite } : "skip"
  );
  const linkedInCheck = useQuery(
    api.signupValidation.validateLinkedInUrl,
    editable(missing.linkedInProfile) && debouncedLinkedIn.trim() ? { url: debouncedLinkedIn } : "skip"
  );
  const phoneCheck = useQuery(
    api.signupValidation.validatePhoneNumber,
    editable(missing.contactPersonPhone) && debouncedPhone.trim() && selectedCountry
      ? { phone: debouncedPhone, isKenyaBased: selectedCountry.isKenya }
      : "skip"
  );
  const descriptionCheck = useQuery(
    api.signupValidation.validateDescription,
    editable(missing.companyDescription) && debouncedDescription.trim() ? { description: debouncedDescription } : "skip"
  );
  const yearCheck = useQuery(
    api.signupValidation.validateYearFounded,
    editable(missing.foundedYear) && debouncedYear ? { year: parseInt(debouncedYear) } : "skip"
  );

  // ── Per-section saving / saved-flash state ───────────────────────────────
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [compSaving, setCompSaving] = useState(false);
  const [compSaved, setCompSaved] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [certSaving, setCertSaving] = useState(false);
  const [certSaved, setCertSaved] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Sync from reactive Convex updates
  useEffect(() => {
    if (ep) {
      setSelectedIndustries(ep.companyIndustries || []);
      setCompanySize(ep.companySize || "");
      setCompanyName(ep.companyName || "");
      setWebsite(ep.website || "");
      setFoundedYear(ep.foundedYear?.toString() || "");
      setLinkedIn(ep.linkedInProfile || "");
      setDescription(ep.companyDescription || "");
      setHeadquarters(ep.headquarters || "");
      setContactName(ep.contactPersonName || "");
      setContactTitle(ep.contactPersonTitle || "");
      setContactPhone(ep.contactPersonPhone || "");
      if (ep.companyLogo) setLogoPreview(ep.companyLogo);
      const code: CountryCode | "" = ep.country ? (COUNTRY_NAME_TO_CODE[ep.country] ?? "") : "";
      setSelectedCountryCode(code);
    }
  }, [ep]);

  // Flash "Saved" for 2.5s then reset
  const flashSaved = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  // ── Dirty flags per section ───────────────────────────────────────────────
  const logoDirty = logoPreview !== (ep?.companyLogo || null);

  const industriesSorted = (arr: string[]) => [...arr].sort().join(",");
  const companyInfoDirty =
    companyName !== (ep?.companyName || "") ||
    selectedCountryCode !== (resolvedCode ?? "") ||
    industriesSorted(selectedIndustries) !== industriesSorted(ep?.companyIndustries || []) ||
    companySize !== (ep?.companySize || "") ||
    foundedYear !== (ep?.foundedYear?.toString() || "") ||
    website !== (ep?.website || "") ||
    linkedIn !== (ep?.linkedInProfile || "") ||
    description !== (ep?.companyDescription || "") ||
    headquarters !== (ep?.headquarters || "");

  const contactInfoDirty =
    contactName !== (ep?.contactPersonName || "") ||
    contactTitle !== (ep?.contactPersonTitle || "") ||
    contactPhone !== (ep?.contactPersonPhone || "");

  // Show a section footer when it has at least one editable field
  const companyHasEditable =
    isEditApproved ||
    missing.country ||
    missing.companySize ||
    missing.companyIndustries ||
    missing.website ||
    missing.foundedYear ||
    missing.linkedInProfile ||
    missing.companyDescription ||
    missing.headquarters;

  const contactHasEditable =
    isEditApproved ||
    missing.contactPersonName ||
    missing.contactPersonTitle ||
    missing.contactPersonPhone;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleIndustry = (value: string) =>
    setSelectedIndustries((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );

  const handleSaveLogo = async () => {
    setLogoSaving(true);
    try {
      if (isEditApproved) {
        await updateProfile({ companyLogo: logoPreview || undefined });
      } else {
        await fillMissingData({ companyLogo: logoPreview || undefined });
      }
      flashSaved(setLogoSaved);
    } catch {
      alert("Failed to save logo. Please try again.");
    } finally {
      setLogoSaving(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (website && websiteCheck?.valid === false) {
      alert("Please enter a valid website URL before saving.");
      return;
    }
    if (linkedIn && linkedInCheck?.valid === false) {
      alert("Please enter a valid LinkedIn URL before saving.");
      return;
    }
    if (description && descriptionCheck?.valid === false) {
      alert("Please improve your company description before saving.");
      return;
    }
    if (foundedYear && yearCheck?.valid === false) {
      alert("Please enter a valid founding year before saving.");
      return;
    }
    setCompSaving(true);
    try {
      if (isEditApproved) {
        await updateProfile({
          companyName,
          companySize: companySize || undefined,
          companyIndustries: selectedIndustries,
          website: website || undefined,
          foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
          linkedInProfile: linkedIn || undefined,
          companyDescription: description || undefined,
          headquarters: headquarters || undefined,
          isKenyaBased: selectedCountry?.isKenya ?? ep?.isKenyaBased,
          country: selectedCountry?.name || ep?.country || undefined,
          registrationNumber: ep?.registrationNumber,
          kraPin: ep?.kraPin,
          contactPersonName: ep?.contactPersonName,
          contactPersonTitle: ep?.contactPersonTitle,
          contactPersonPhone: ep?.contactPersonPhone,
          companyLogo: ep?.companyLogo,
        });
      } else {
        await fillMissingData({
          companySize: missing.companySize && companySize ? companySize : undefined,
          companyIndustries: missing.companyIndustries && selectedIndustries.length ? selectedIndustries : undefined,
          companyDescription: missing.companyDescription && description ? description : undefined,
          website: missing.website && website ? website : undefined,
          foundedYear: missing.foundedYear && foundedYear ? parseInt(foundedYear) : undefined,
          linkedInProfile: missing.linkedInProfile && linkedIn ? linkedIn : undefined,
          headquarters: missing.headquarters && headquarters ? headquarters : undefined,
          country: missing.country && selectedCountryCode ? selectedCountry?.name : undefined,
          isKenyaBased: missing.country && selectedCountryCode ? selectedCountry?.isKenya : undefined,
        });
      }
      flashSaved(setCompSaved);
    } catch {
      alert("Failed to save company information. Please try again.");
    } finally {
      setCompSaving(false);
    }
  };

  const handleSaveContactInfo = async () => {
    if (contactPhone && phoneCheck?.valid === false) {
      alert("Please enter a valid phone number before saving.");
      return;
    }
    setContactSaving(true);
    try {
      if (isEditApproved) {
        await updateProfile({
          companyName: ep?.companyName,
          isKenyaBased: ep?.isKenyaBased,
          country: ep?.country || undefined,
          registrationNumber: ep?.registrationNumber,
          kraPin: ep?.kraPin,
          contactPersonName: contactName || undefined,
          contactPersonTitle: contactTitle || undefined,
          contactPersonPhone: contactPhone || undefined,
          companyLogo: ep?.companyLogo,
        });
      } else {
        await fillMissingData({
          contactPersonName: missing.contactPersonName && contactName ? contactName : undefined,
          contactPersonTitle: missing.contactPersonTitle && contactTitle ? contactTitle : undefined,
          contactPersonPhone: missing.contactPersonPhone && contactPhone ? contactPhone : undefined,
        });
      }
      flashSaved(setContactSaved);
    } catch {
      alert("Failed to save contact information. Please try again.");
    } finally {
      setContactSaving(false);
    }
  };

  const handleUploadCert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertSaving(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await fillMissingData({ incorporationCertStorageId: storageId });
      flashSaved(setCertSaved);
    } catch {
      alert("Failed to upload document. Please try again.");
    } finally {
      setCertSaving(false);
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

  // ── CSS helpers ───────────────────────────────────────────────────────────
  const readOnlyClass =
    "w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary cursor-not-allowed";
  const editableClass =
    "w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20";
  const missingClass =
    "w-full px-4 py-2.5 border border-dashed border-amber-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-amber-50/20";

  const inputClass = (isMissing: boolean) =>
    !editable(isMissing) ? readOnlyClass : isMissing && !isEditApproved ? missingClass : editableClass;

  // Layered class: base editable/missing styling + green/red validation border
  const validatedInputClass = (isMissing: boolean, valid: boolean | null | undefined) => {
    if (!editable(isMissing)) return readOnlyClass;
    const base =
      isMissing && !isEditApproved
        ? "w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-amber-50/20"
        : "w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20";
    if (valid === true) return `${base} border-green-500`;
    if (valid === false) return `${base} border-red-500`;
    return `${base} ${isMissing && !isEditApproved ? "border-dashed border-amber-400" : "border-neutral-border"}`;
  };

  // ── Verification config based on country ──────────────────────────────────
  const verificationConfig = selectedCountry
    ? VERIFICATION_CONFIG[selectedCountry.code]
    : VERIFICATION_CONFIG["KE"];

  return (
    <>
      <div className="space-y-6">
        {/* ── Banners ───────────────────────────────────────────────────────── */}
        {missingCount > 0 && (
          <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {missingCount} incomplete field{missingCount !== 1 ? "s" : ""} in your profile
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Fields marked <span className="font-semibold">Missing</span> can be filled and
                saved directly — no approval required. To change already-filled fields, use{" "}
                <span className="font-semibold">Request Edit</span>.
              </p>
            </div>
          </div>
        )}

        {hasPendingRequest && (
          <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Change Request Pending</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Your request to edit existing profile fields is under admin review. You'll be
                notified once it's approved.
              </p>
            </div>
          </div>
        )}

        {!isEditApproved && !hasPendingRequest && missingCount === 0 && (
          <div className="rounded-lg border bg-blue-50 border-blue-200 p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">Profile fields are locked</p>
              <p className="text-sm text-blue-700 mt-0.5">
                To protect data integrity, profile fields cannot be edited directly. Submit a
                request explaining what you need to update.
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
          </div>
        )}

        {!isEditApproved && !hasPendingRequest && missingCount > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-white border border-brand-orange text-brand-orange text-sm font-medium rounded-lg hover:bg-brand-orange/5 transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Request Edit for Existing Fields
            </button>
          </div>
        )}

        {isEditApproved && (
          <div className="rounded-lg border bg-green-50 border-green-200 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Edit Mode Active</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your change request was approved. You can now edit all profile fields below.
                Each section saves independently.
              </p>
            </div>
          </div>
        )}

        {/* ── Company Logo ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-base font-semibold text-neutral-text mb-5">
              Company Logo{missing.companyLogo && <MissingBadge />}
            </h3>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="w-24 h-24 border-2 border-neutral-border rounded-lg overflow-hidden bg-neutral-bg-secondary">
                    <img src={logoPreview} alt="Company logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-amber-400 rounded-lg flex items-center justify-center bg-amber-50/30">
                    <Building2 className="w-10 h-10 text-amber-400" />
                  </div>
                )}
              </div>
              {editable(missing.companyLogo) ? (
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-text mb-1">Upload your company logo</p>
                  <p className="text-sm text-neutral-text-secondary mb-4">
                    Square image, at least 200×200 px. Max 2 MB.
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-neutral-border text-neutral-text text-sm font-medium rounded-md hover:bg-neutral-bg-secondary cursor-pointer transition-colors">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-neutral-text-secondary">
                    {logoPreview ? "Logo uploaded." : "No logo uploaded yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
          {editable(missing.companyLogo) && (
            <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg-secondary/50 flex items-center justify-between">
              <p className="text-xs text-neutral-text-muted">
                {logoDirty ? "You have unsaved changes." : "No changes."}
              </p>
              <SectionSaveButton dirty={logoDirty} saving={logoSaving} saved={logoSaved} onClick={handleSaveLogo} />
            </div>
          )}
        </div>

        {/* ── Company Information ────────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-text">Company Information</h3>
              {!isEditApproved && (
                <span className="flex items-center gap-1.5 text-xs text-neutral-text-muted">
                  <Lock className="w-3.5 h-3.5" />
                  {missingCount > 0 ? "Existing fields locked" : "Read-only"}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => isEditApproved && setCompanyName(e.target.value)}
                  readOnly={!isEditApproved}
                  className={isEditApproved ? editableClass : readOnlyClass}
                />
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Industry / Industries{missing.companyIndustries && <MissingBadge />}
                </label>
                {editable(missing.companyIndustries) ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIndustryPicker((p) => !p)}
                      className={`${missing.companyIndustries && !isEditApproved ? missingClass : editableClass} text-left flex items-center justify-between`}
                    >
                      <span className={selectedIndustries.length ? "text-neutral-text" : "text-neutral-text-muted"}>
                        {selectedIndustries.length
                          ? selectedIndustries.map((v) => INDUSTRIES.find((i) => i.value === v)?.label).filter(Boolean).join(", ")
                          : "Select one or more industries…"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-neutral-text-muted flex-shrink-0" />
                    </button>
                    {showIndustryPicker && (
                      <>
                        <div className="fixed inset-0 z-[9]" onClick={() => setShowIndustryPicker(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-border rounded-lg shadow-lg z-[10] max-h-60 overflow-y-auto">
                          {INDUSTRIES.map((industry) => (
                            <label
                              key={industry.value}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-bg-secondary cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIndustries.includes(industry.value)}
                                onChange={() => toggleIndustry(industry.value)}
                                className="rounded border-neutral-border accent-brand-orange"
                              />
                              <span className="text-sm text-neutral-text">{industry.label}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={selectedIndustries.map((v) => INDUSTRIES.find((i) => i.value === v)?.label).filter(Boolean).join(", ") || "—"}
                    readOnly
                    className={readOnlyClass}
                  />
                )}
              </div>

              {/* Company Size + Founded Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Company Size{missing.companySize && <MissingBadge />}
                  </label>
                  {editable(missing.companySize) ? (
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className={missing.companySize && !isEditApproved ? missingClass : editableClass}
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={COMPANY_SIZES.find((s) => s.value === companySize)?.label || companySize || "—"}
                      readOnly
                      className={readOnlyClass}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Founded Year{missing.foundedYear && <MissingBadge />}
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={foundedYear}
                    onChange={(e) => editable(missing.foundedYear) && setFoundedYear(e.target.value)}
                    readOnly={!editable(missing.foundedYear)}
                    placeholder="e.g. 2010"
                    className={validatedInputClass(missing.foundedYear, yearCheck?.valid)}
                  />
                  {yearCheck?.valid === false && (
                    <p className="text-xs mt-1 text-red-600">{yearCheck.message}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Website{missing.website && <MissingBadge />}
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => editable(missing.website) && setWebsite(e.target.value)}
                  onBlur={(e) => {
                    if (editable(missing.website)) {
                      const val = e.target.value.trim();
                      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                        setWebsite("https://" + val);
                      }
                    }
                  }}
                  readOnly={!editable(missing.website)}
                  placeholder="https://example.com"
                  className={validatedInputClass(missing.website, websiteCheck?.valid)}
                />
                {websiteCheck?.valid === false && (
                  <p className="text-xs mt-1 text-red-600">{websiteCheck.message}</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  LinkedIn Profile{missing.linkedInProfile && <MissingBadge />}
                </label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => editable(missing.linkedInProfile) && setLinkedIn(e.target.value)}
                  readOnly={!editable(missing.linkedInProfile)}
                  placeholder="https://linkedin.com/company/your-company"
                  className={validatedInputClass(missing.linkedInProfile, linkedInCheck?.valid)}
                />
                {linkedInCheck?.valid === false && (
                  <p className="text-xs mt-1 text-red-600">{linkedInCheck.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Company Description{missing.companyDescription && <MissingBadge />}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => editable(missing.companyDescription) && setDescription(e.target.value)}
                  readOnly={!editable(missing.companyDescription)}
                  placeholder="Tell us about your company… (minimum 20 words)"
                  className={validatedInputClass(missing.companyDescription, descriptionCheck?.valid)}
                />
                {descriptionCheck?.valid === false && (
                  <p className="text-xs mt-1 text-red-600">{descriptionCheck.message}</p>
                )}
                {descriptionCheck?.valid === true && (
                  <p className="text-xs mt-1 text-green-600">{descriptionCheck.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="pt-4 border-t border-neutral-border">
                <h4 className="text-sm font-semibold text-neutral-text mb-4">Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Country — dropdown when missing, read-only when set */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      Country{missing.country && <MissingBadge />}
                    </label>
                    {missing.country ? (
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value as CountryCode | "")}
                        className={selectedCountryCode ? editableClass : missingClass}
                      >
                        <option value="">Select your country…</option>
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={selectedCountry?.name || ep?.country || "—"}
                          readOnly
                          className={readOnlyClass}
                        />
                        <p className="text-xs text-neutral-text-muted mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Set at registration
                        </p>
                      </>
                    )}
                  </div>

                  {/* Headquarters — label adapts to selected country */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      {selectedCountry?.hqLabel || "Headquarters"}{missing.headquarters && <MissingBadge />}
                    </label>
                    <input
                      type="text"
                      value={headquarters}
                      onChange={(e) => editable(missing.headquarters) && setHeadquarters(e.target.value)}
                      readOnly={!editable(missing.headquarters)}
                      placeholder={selectedCountry?.hqPlaceholder || "City, Region"}
                      className={inputClass(missing.headquarters)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {companyHasEditable && (
            <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg-secondary/50 flex items-center justify-between">
              <p className="text-xs text-neutral-text-muted">
                {companyInfoDirty ? "You have unsaved changes." : "No changes."}
              </p>
              <SectionSaveButton
                dirty={companyInfoDirty}
                saving={compSaving}
                saved={compSaved}
                onClick={handleSaveCompanyInfo}
              />
            </div>
          )}
        </div>

        {/* ── Contact Information ────────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-text">Contact Information</h3>
              {!isEditApproved && (
                <span className="flex items-center gap-1.5 text-xs text-neutral-text-muted">
                  <Lock className="w-3.5 h-3.5" />
                  {missingCount > 0 ? "Existing fields locked" : "Read-only"}
                </span>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Contact Person Name{missing.contactPersonName && <MissingBadge />}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => editable(missing.contactPersonName) && setContactName(e.target.value)}
                    readOnly={!editable(missing.contactPersonName)}
                    className={inputClass(missing.contactPersonName)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Job Title{missing.contactPersonTitle && <MissingBadge />}
                  </label>
                  <input
                    type="text"
                    value={contactTitle}
                    onChange={(e) => editable(missing.contactPersonTitle) && setContactTitle(e.target.value)}
                    readOnly={!editable(missing.contactPersonTitle)}
                    placeholder="e.g. HR Manager, Recruiter"
                    className={inputClass(missing.contactPersonTitle)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Email</label>
                  <input type="email" value={profile?.email || "—"} readOnly className={readOnlyClass} />
                  <p className="text-xs text-neutral-text-muted mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Managed by your account
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Phone{missing.contactPersonPhone && <MissingBadge />}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => editable(missing.contactPersonPhone) && setContactPhone(e.target.value)}
                    readOnly={!editable(missing.contactPersonPhone)}
                    placeholder={selectedCountry?.phonePlaceholder || "+254 7XX XXX XXX"}
                    className={validatedInputClass(missing.contactPersonPhone, phoneCheck?.valid)}
                  />
                  {phoneCheck?.valid === false && (
                    <p className="text-xs mt-1 text-red-600">{phoneCheck.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {contactHasEditable && (
            <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg-secondary/50 flex items-center justify-between">
              <p className="text-xs text-neutral-text-muted">
                {contactInfoDirty ? "You have unsaved changes." : "No changes."}
              </p>
              <SectionSaveButton
                dirty={contactInfoDirty}
                saving={contactSaving}
                saved={contactSaved}
                onClick={handleSaveContactInfo}
              />
            </div>
          )}
        </div>

        {/* ── Verification Documents ─────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-neutral-text">Verification Documents</h3>
              {missing.incorporationCert && <MissingBadge />}
            </div>
            <p className="text-sm text-neutral-text-secondary mb-6">
              Registration details are fixed at verification. You can upload the certificate if it's
              missing — contact support to update any other document.
            </p>
            <div className="space-y-4">
              {/* Registration Number + Tax ID — labels are country-aware */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {verificationConfig.regLabel}
                  </label>
                  <input type="text" value={ep?.registrationNumber || "—"} readOnly className={readOnlyClass} />
                  <p className="text-xs text-neutral-text-muted mt-1">{verificationConfig.regHint}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {verificationConfig.taxLabel}
                  </label>
                  <input type="text" value={ep?.kraPin || "—"} readOnly className={readOnlyClass} />
                  <p className="text-xs text-neutral-text-muted mt-1">{verificationConfig.taxHint}</p>
                </div>
              </div>

              {/* Certificate of Incorporation */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {verificationConfig.certLabel}{missing.incorporationCert && <MissingBadge />}
                </label>
                {ep?.incorporationCertStorageId || certSaved ? (
                  <div className={`${readOnlyClass} flex items-center gap-2`}>
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Uploaded</span>
                  </div>
                ) : certSaving ? (
                  <div className={`${readOnlyClass} flex items-center gap-2`}>
                    <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-neutral-text-secondary">Uploading…</span>
                  </div>
                ) : (
                  <label className={`${missingClass} flex items-center gap-3 cursor-pointer hover:bg-amber-50/40 transition-colors`}>
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-text flex-1">
                      No document — click to upload PDF, JPG, or PNG
                    </span>
                    <span className="text-xs font-medium text-brand-orange px-3 py-1 border border-brand-orange rounded-md flex-shrink-0">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleUploadCert}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-neutral-text-muted mt-1">{verificationConfig.certHint}</p>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Verification Status</label>
                <div className={`${readOnlyClass} flex items-center gap-2`}>
                  {ep?.verificationStatus === "verified" && (
                    <><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-green-700">Verified</span></>
                  )}
                  {ep?.verificationStatus === "documents_submitted" && (
                    <><Clock className="w-4 h-4 text-blue-600" /><span className="text-blue-700">Documents Submitted — pending review</span></>
                  )}
                  {ep?.verificationStatus === "under_review" && (
                    <><Clock className="w-4 h-4 text-yellow-600" /><span className="text-yellow-700">Under Review</span></>
                  )}
                  {ep?.verificationStatus === "rejected" && (
                    <><AlertCircle className="w-4 h-4 text-red-600" /><span className="text-red-700">Rejected</span></>
                  )}
                  {(ep?.verificationStatus === "pending" || !ep?.verificationStatus) && (
                    <span className="text-neutral-text-secondary">
                      {ep?.verificationStatus === "pending" ? "Pending Submission" : "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Request Edit Modal ─────────────────────────────────────────────── */}
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
                Please explain which existing fields you need to change and why. An admin will
                review your request and grant edit access if approved.
              </p>
              <label className="block">
                <span className="text-sm font-medium text-neutral-text">
                  Reason for Edit <span className="text-red-500">*</span>
                </span>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="e.g., We recently rebranded and need to update our company name and logo…"
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
                {isSubmittingRequest ? "Submitting…" : "Submit Request"}
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
