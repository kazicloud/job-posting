"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, Users, Mail, Phone, Shield, Bell, CreditCard, Trash2, Lock, Pencil, X, Send, CheckCircle, Clock, AlertCircle, ChevronDown, BadgeCheck } from "lucide-react";
import Link from "next/link";
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
  const submitPendingEdits = useMutation(api.employerPendingEdits.submitPendingEdits);
  const cancelPendingEdits = useMutation(api.employerPendingEdits.cancelPendingEdits);
  const notifyAdminVerificationReminder = useAction(api.emails.notifyAdminVerificationReminder);
  const pendingEdits = useQuery(api.employerPendingEdits.getMyPendingEdits);

  const ep = profile?.employerProfile;
  const pending = (pendingEdits?.changes ?? {}) as Record<string, any>;
  const hasPending = !!pendingEdits;
  const pendingChangedCount = Object.entries(pending).filter(
    ([k, v]) => JSON.stringify((ep as any)?.[k]) !== JSON.stringify(v)
  ).length;

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

  // All fields are always editable; changes are staged as pending for admin review

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
    debouncedWebsite.trim() ? { url: debouncedWebsite } : "skip"
  );
  const linkedInCheck = useQuery(
    api.signupValidation.validateLinkedInUrl,
    debouncedLinkedIn.trim() ? { url: debouncedLinkedIn } : "skip"
  );
  const phoneCheck = useQuery(
    api.signupValidation.validatePhoneNumber,
    debouncedPhone.trim() && selectedCountry
      ? { phone: debouncedPhone, isKenyaBased: selectedCountry.isKenya }
      : "skip"
  );
  const descriptionCheck = useQuery(
    api.signupValidation.validateDescription,
    debouncedDescription.trim() ? { description: debouncedDescription } : "skip"
  );
  const yearCheck = useQuery(
    api.signupValidation.validateYearFounded,
    debouncedYear ? { year: parseInt(debouncedYear) } : "skip"
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

  // ── Modal state (cancel pending edits confirmation) ──────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Verification reminder cooldown (3 hours, persisted in localStorage) ──
  const [reminderLastSent, setReminderLastSent] = useState<number | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderNotice, setReminderNotice] = useState<{ kind: "success" | "cooldown"; message: string } | null>(null);

  useEffect(() => {
    if (!ep?._id) return;
    const stored = localStorage.getItem(`verificationReminder_${ep._id}`);
    if (stored) setReminderLastSent(parseInt(stored, 10));
  }, [ep?._id]);

  const handleSendReminder = async () => {
    const COOLDOWN_MS = 3 * 60 * 60 * 1000;
    const now = Date.now();
    if (reminderLastSent && now - reminderLastSent < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - (now - reminderLastSent);
      const h = Math.floor(remaining / (60 * 60 * 1000));
      const m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      setReminderNotice({
        kind: "cooldown",
        message: `A reminder was already sent recently. Please wait ${h > 0 ? `${h}h ` : ""}${m}m before sending another.`,
      });
      setTimeout(() => setReminderNotice(null), 6000);
      return;
    }
    setIsSendingReminder(true);
    try {
      await notifyAdminVerificationReminder({
        employerName: profile?.fullName || "Employer",
        companyName: ep?.companyName || "Company",
        employerEmail: profile?.email || "",
        verificationStatus: ep?.verificationStatus || "pending",
      });
      localStorage.setItem(`verificationReminder_${ep?._id}`, now.toString());
      setReminderLastSent(now);
      setReminderNotice({
        kind: "success",
        message: "Reminder sent to the Kazicloud team. We will process your verification shortly.",
      });
      setTimeout(() => setReminderNotice(null), 6000);
    } catch {
      alert("Failed to send reminder. Please try again.");
    } finally {
      setIsSendingReminder(false);
    }
  };

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

  // Show save footer for all sections (always editable)
  const companyHasEditable = true;
  const contactHasEditable = true;

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
      await submitPendingEdits({ changes: { companyLogo: logoPreview || undefined } });
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
      await submitPendingEdits({ changes: {
        companyName: companyName || undefined,
        companySize: companySize || undefined,
        companyIndustries: selectedIndustries.length ? selectedIndustries : undefined,
        website: website || undefined,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        linkedInProfile: linkedIn || undefined,
        companyDescription: description || undefined,
        headquarters: headquarters || undefined,
        isKenyaBased: selectedCountry?.isKenya ?? ep?.isKenyaBased,
        country: selectedCountry?.name || ep?.country || undefined,
      } });
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
      await submitPendingEdits({ changes: {
        contactPersonName: contactName || undefined,
        contactPersonTitle: contactTitle || undefined,
        contactPersonPhone: contactPhone || undefined,
      } });
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

  // ── CSS helpers ───────────────────────────────────────────────────────────
  const editableClass =
    "w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20";
  const missingClass =
    "w-full px-4 py-2.5 border border-dashed border-amber-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-amber-50/20";

  const inputClass = (isMissing: boolean) =>
    isMissing ? missingClass : editableClass;

  // Layered class: base editable/missing styling + green/red validation border
  const validatedInputClass = (isMissing: boolean, valid: boolean | null | undefined) => {
    const base = isMissing
      ? "w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-amber-50/20"
      : "w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20";
    if (valid === true) return `${base} border-green-500`;
    if (valid === false) return `${base} border-red-500`;
    return `${base} ${isMissing ? "border-dashed border-amber-400" : "border-neutral-border"}`;
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
                Fields highlighted in amber are unfilled. Fill them in and save — changes go for
                admin review before going live.
              </p>
            </div>
          </div>
        )}

        {/* Pending edits banner */}
        {hasPending && (
          <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Changes pending admin review</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                {pendingChangedCount} field{pendingChangedCount !== 1 ? "s" : ""} are
                saved and awaiting approval. The live profile remains unchanged until an admin approves.
                Fields with a <span className="font-semibold text-yellow-800">⏳</span> label show the
                proposed value.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Changes
            </button>
          </div>
        )}

        {!hasPending && missingCount === 0 && (
          <div className="rounded-lg border bg-blue-50 border-blue-200 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Profile up to date</p>
              <p className="text-sm text-blue-700 mt-0.5">
                All profile fields are filled. Edit any section below — your changes will be
                submitted for admin review before going live.
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
            </div>
          </div>
          <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg-secondary/50 flex items-center justify-between">
              <p className="text-xs text-neutral-text-muted">
                {logoDirty ? "You have unsaved changes — will go for review." : pending?.companyLogo ? "⏳ Logo change pending admin review." : "No changes."}
              </p>
              <SectionSaveButton dirty={logoDirty} saving={logoSaving} saved={logoSaved} onClick={handleSaveLogo} />
            </div>
        </div>

        {/* ── Company Information ────────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-text">Company Information</h3>
              <span className="text-xs text-neutral-text-muted">Changes require admin approval</span>
            </div>

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={editableClass}
                />
                {pending?.companyName && pending.companyName !== (ep?.companyName || "") && (
                  <p className="text-xs mt-1 text-yellow-700">⏳ Pending: {pending.companyName}</p>
                )}
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Industry / Industries{missing.companyIndustries && <MissingBadge />}
                </label>
                <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIndustryPicker((p) => !p)}
                      className={`${missing.companyIndustries ? missingClass : editableClass} text-left flex items-center justify-between`}
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
              </div>

              {/* Company Size + Founded Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Company Size{missing.companySize && <MissingBadge />}
                  </label>
                  <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className={missing.companySize ? missingClass : editableClass}
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
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
                    onChange={(e) => setFoundedYear(e.target.value)}
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
                  onChange={(e) => setWebsite(e.target.value)}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                      setWebsite("https://" + val);
                    }
                  }}
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
                  onChange={(e) => setLinkedIn(e.target.value)}
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
                  onChange={(e) => setDescription(e.target.value)}
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
                  {/* Country — always a dropdown so employer can update it if needed */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      Country{missing.country && <MissingBadge />}
                    </label>
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
                  </div>

                  {/* Headquarters — label adapts to selected country */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      {selectedCountry?.hqLabel || "Headquarters"}{missing.headquarters && <MissingBadge />}
                    </label>
                    <input
                      type="text"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder={selectedCountry?.hqPlaceholder || "City, Region"}
                      className={inputClass(missing.headquarters)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg-secondary/50 flex items-center justify-between">
              <p className="text-xs text-neutral-text-muted">
                {companyInfoDirty ? "You have unsaved changes — will go for review." : hasPending ? "⏳ Changes pending admin review." : "No changes."}
              </p>
              <SectionSaveButton
                dirty={companyInfoDirty}
                saving={compSaving}
                saved={compSaved}
                onClick={handleSaveCompanyInfo}
              />
            </div>
        </div>

        {/* ── Contact Information ────────────────────────────────────────────── */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-text">Contact Information</h3>
              <span className="text-xs text-neutral-text-muted">Changes require admin approval</span>
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
                    onChange={(e) => setContactName(e.target.value)}
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
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="e.g. HR Manager, Recruiter"
                    className={inputClass(missing.contactPersonTitle)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">Email</label>
                  <input type="email" value={profile?.email || "—"} readOnly className="w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary cursor-not-allowed" />
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
                    onChange={(e) => setContactPhone(e.target.value)}
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
                {contactInfoDirty ? "You have unsaved changes — will go for review." : hasPending ? "⏳ Changes pending admin review." : "No changes."}
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
                  <input type="text" value={ep?.registrationNumber || "—"} readOnly className="w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary cursor-not-allowed" />
                  <p className="text-xs text-neutral-text-muted mt-1">{verificationConfig.regHint}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {verificationConfig.taxLabel}
                  </label>
                  <input type="text" value={ep?.kraPin || "—"} readOnly className="w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary cursor-not-allowed" />
                  <p className="text-xs text-neutral-text-muted mt-1">{verificationConfig.taxHint}</p>
                </div>
              </div>

              {/* Certificate of Incorporation */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {verificationConfig.certLabel}{missing.incorporationCert && <MissingBadge />}
                </label>
                {ep?.incorporationCertStorageId || certSaved ? (
                  <div className="w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">Uploaded</span>
                  </div>
                ) : certSaving ? (
                  <div className="w-full px-4 py-2.5 border border-neutral-border rounded-md bg-gray-50 text-neutral-text-secondary flex items-center gap-2">
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
                <label className="block text-sm font-medium text-neutral-text mb-3">Verification Status</label>

                {/* ── Verified ────────────────────────────────────────────── */}
                {ep?.verificationStatus === "verified" && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <BadgeCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Your company is verified</p>
                      <p className="text-xs text-blue-600 mt-0.5">Your account has been reviewed and approved by the Kazicloud team.</p>
                    </div>
                  </div>
                )}

                {/* ── Profile incomplete ──────────────────────────────────── */}
                {!ep?.onboardingCompleted && ep?.verificationStatus !== "verified" && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Company profile incomplete</p>
                      <p className="text-xs text-amber-700 mt-1 mb-3">
                        Complete your company profile to initiate the verification process and unlock full access to the platform.
                      </p>
                      <Link
                        href="/employer-onboarding"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-xs font-semibold rounded-md hover:bg-brand-orange/90 transition-colors"
                      >
                        Complete Your Profile
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── Profile complete, awaiting verification ─────────────── */}
                {ep?.onboardingCompleted && ep?.verificationStatus !== "verified" && (
                  <div className="flex items-start gap-3 p-4 bg-neutral-bg-secondary border border-neutral-border rounded-lg">
                    {ep?.verificationStatus === "rejected"
                      ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      : <Clock className="w-5 h-5 text-neutral-text-muted mt-0.5 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        ep?.verificationStatus === "rejected" ? "text-red-700" : "text-neutral-text"
                      }`}>
                        {ep?.verificationStatus === "documents_submitted" && "Documents Submitted — Pending Review"}
                        {ep?.verificationStatus === "under_review" && "Under Review"}
                        {ep?.verificationStatus === "rejected" && "Verification Rejected"}
                        {(ep?.verificationStatus === "pending" || !ep?.verificationStatus) && "Awaiting Verification"}
                      </p>
                      <p className="text-xs text-neutral-text-secondary mt-1 mb-3">
                        {ep?.verificationStatus === "rejected"
                          ? (ep?.rejectionReason || "Your verification was not approved. Please contact support for further assistance.")
                          : "Your profile is complete. Our team will review your account and verify it shortly. You may send a reminder if you have not heard back."}
                      </p>
                      {ep?.verificationStatus !== "rejected" && (
                        <button
                          onClick={handleSendReminder}
                          disabled={isSendingReminder}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-border text-neutral-text text-xs font-semibold rounded-md hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isSendingReminder ? "Sending…" : "Send Verification Reminder"}
                        </button>
                      )}
                      {reminderNotice && (
                        <div className={`mt-2 text-xs rounded-md px-3 py-2 border ${
                          reminderNotice.kind === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}>
                          {reminderNotice.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel Pending Edits Modal ─────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-base font-semibold text-neutral-text mb-2">Cancel pending changes?</h3>
              <p className="text-sm text-neutral-text-secondary mb-5">
                This will discard all {pendingChangedCount} pending field update{pendingChangedCount !== 1 ? "s" : ""} awaiting review.
                The live profile will remain unchanged.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
                >
                  Keep Changes
                </button>
                <button
                  onClick={async () => {
                    await cancelPendingEdits();
                    setShowCancelModal(false);
                  }}
                  className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Discard Changes
                </button>
              </div>
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
