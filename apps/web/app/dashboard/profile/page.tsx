"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import Link from "next/link";
import { Edit2, Briefcase, GraduationCap, Award, MapPin, Phone, Mail, Loader2, Plus, Camera, Upload, Trash2, Edit3, RefreshCw, RotateCcw, RotateCw, ZoomIn, FileText, Settings, X, Search, ChevronDown, CheckCircle, Zap, Bookmark } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useUser } from "@clerk/nextjs";
import countiesData from "@/data/counties.json";

// Country/region config (mirrors onboarding)
const WORK_COUNTRIES = [
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
];

const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  RW: ["Kigali City", "Northern Province", "Southern Province", "Eastern Province", "Western Province"],
  TZ: [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
    "Kigoma", "Kilimanjaro", "Lindi", "Mara", "Mbeya", "Morogoro", "Mtwara",
    "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani", "Rukwa",
    "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga",
    "Zanzibar North", "Zanzibar South", "Zanzibar West",
  ],
  UG: [
    "Adjumani", "Arua", "Busia", "Fort Portal", "Gulu", "Hoima", "Iganga",
    "Jinja", "Kabale", "Kampala", "Kasese", "Lira", "Masaka", "Mbarara",
    "Mbale", "Moroto", "Mubende", "Mukono", "Soroti", "Tororo", "Wakiso",
  ],
};

function getRegionsForCountry(countryCode: string): string[] {
  if (countryCode === "KE") {
    return (countiesData as any[]).map((c: any) => c.county_name).sort();
  }
  return REGIONS_BY_COUNTRY[countryCode] || [];
}

const COUNTRY_CURRENCY: Record<string, string> = {
  KE: "KES",
  RW: "RWF",
  TZ: "TZS",
  UG: "UGX",
};

// Normalize stored country value to 2-letter code (handles legacy full-name storage)
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Kenya: "KE",
  Rwanda: "RW",
  Tanzania: "TZ",
  Uganda: "UG",
};
function normalizeCountryCode(country: string | undefined | null): string {
  if (!country) return "KE";
  if (COUNTRY_NAME_TO_CODE[country]) return COUNTRY_NAME_TO_CODE[country];
  return country; // already a code like "KE"
}

// Career Summary Component
function CareerSummarySection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(profile.jobSeekerProfile?.careerSummary || "");
  const updateCareerSummary = useMutation(api.profile.updateCareerSummary);
  const refreshCompleteness = useMutation(api.profile.refreshCompleteness);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCareerSummary({ summary });
      void refreshCompleteness({});
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save career summary:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="section-summary" className="bg-white rounded-xl border border-neutral-border p-4 sm:p-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-text">About</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief summary about your career goals, experience, and what you're looking for..."
            className="w-full min-h-[120px] sm:min-h-[150px] p-3 border border-neutral-border rounded-md text-sm sm:text-base text-neutral-text placeholder:text-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            maxLength={500}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2">
            <span className="text-xs text-neutral-text-muted">
              {summary.length}/500 characters
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSummary(profile.jobSeekerProfile?.careerSummary || "");
                  setIsEditing(false);
                }}
                className="flex-1 sm:flex-none px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {summary ? (
            <p className="text-neutral-text-secondary leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          ) : (
            <p className="text-neutral-text-muted italic">
              Add a career summary to help employers understand your goals and experience.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Basic Info Edit Section (LinkedIn-style)
function BasicInfoSection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const updateBasicInfo = useMutation(api.profile.updateJobSeekerBasicInfo);
  const refreshCompleteness = useMutation(api.profile.refreshCompleteness);

  const [form, setForm] = useState({
    fullName: profile.fullName || "",
    phone: profile.phone || "",
    headline: profile.jobSeekerProfile?.headline || "",
    desiredJobTitle: profile.jobSeekerProfile?.desiredJobTitle || "",
    preferredCountry: normalizeCountryCode(profile.country),
    preferredRegions: (profile.preferredRegions as string[]) || (profile.county ? [profile.county] : []),
  });

  const availableRegions = useMemo(() => getRegionsForCountry(form.preferredCountry), [form.preferredCountry]);
  const filteredRegions = useMemo(() => {
    if (!regionSearch) return availableRegions;
    return availableRegions.filter(r => r.toLowerCase().includes(regionSearch.toLowerCase()));
  }, [availableRegions, regionSearch]);

  const toggleRegion = (region: string) => {
    const current = form.preferredRegions;
    if (current.includes(region)) {
      setForm(f => ({ ...f, preferredRegions: current.filter(r => r !== region) }));
    } else if (current.length < 5) {
      setForm(f => ({ ...f, preferredRegions: [...current, region] }));
    }
  };

  const countryConfig = WORK_COUNTRIES.find(c => c.code === form.preferredCountry);
  const regionLabel = form.preferredCountry === "KE" ? "Counties" : "Regions";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBasicInfo({
        fullName: form.fullName,
        phone: form.phone,
        headline: form.headline,
        desiredJobTitle: form.desiredJobTitle,
        country: form.preferredCountry,
        preferredRegions: form.preferredRegions,
        county: form.preferredRegions[0] || "",
      });
      void refreshCompleteness({});
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update basic info:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      headline: profile.jobSeekerProfile?.headline || "",
      desiredJobTitle: profile.jobSeekerProfile?.desiredJobTitle || "",
      preferredCountry: normalizeCountryCode(profile.country),
      preferredRegions: (profile.preferredRegions as string[]) || (profile.county ? [profile.county] : []),
    });
    setIsEditing(false);
  };

  // View mode location string
  const displayCountry = WORK_COUNTRIES.find(c => c.code === normalizeCountryCode(profile.country));
  const displayRegions = profile.preferredRegions?.length
    ? profile.preferredRegions
    : profile.county
    ? [profile.county]
    : [];

  return (
    <div id="section-basic" className="bg-white border border-neutral-border rounded-xl p-4 sm:p-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-text">Basic Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Phone (WhatsApp)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Professional Headline</label>
            <input
              type="text"
              value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
              placeholder="e.g. Software Engineer | Open to Work"
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Desired Job Title</label>
            <input
              type="text"
              value={form.desiredJobTitle}
              onChange={e => setForm(f => ({ ...f, desiredJobTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Preferred Work Country</label>
            <select
              value={form.preferredCountry}
              onChange={e => setForm(f => ({ ...f, preferredCountry: e.target.value, preferredRegions: [] }))}
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            >
              {WORK_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-neutral-text-muted">
                Preferred {regionLabel} (up to 5)
              </label>
              {form.preferredRegions.length > 0 && (
                <span className="text-xs text-neutral-text-muted">{form.preferredRegions.length}/5</span>
              )}
            </div>

            {form.preferredRegions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.preferredRegions.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-xs rounded-full">
                    {r}
                    <button type="button" onClick={() => toggleRegion(r)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                disabled={form.preferredRegions.length >= 5}
                className="w-full flex items-center justify-between px-3 py-2 border border-neutral-border rounded-md text-sm text-neutral-text-muted focus:outline-none disabled:opacity-50"
              >
                <span>{form.preferredRegions.length >= 5 ? "Maximum 5 selected" : `Add ${regionLabel.toLowerCase()}...`}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${regionDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {regionDropdownOpen && form.preferredRegions.length < 5 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-border rounded-md shadow-lg">
                  <div className="p-2 border-b border-neutral-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-text-muted" />
                      <input
                        type="text"
                        value={regionSearch}
                        onChange={e => setRegionSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-neutral-border rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {filteredRegions.map(region => {
                      const sel = form.preferredRegions.includes(region);
                      return (
                        <button
                          key={region}
                          type="button"
                          onClick={() => { toggleRegion(region); if (!sel && form.preferredRegions.length >= 4) setRegionDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm ${sel ? "bg-brand-orange/10 text-brand-orange font-medium" : "text-neutral-text hover:bg-neutral-bg-secondary"}`}
                        >
                          {region}
                        </button>
                      );
                    })}
                    {filteredRegions.length === 0 && (
                      <p className="px-3 py-2 text-sm text-neutral-text-muted">No results</p>
                    )}
                  </div>
                </div>
              )}
              {regionDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setRegionDropdownOpen(false)} />}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={handleCancel} className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-neutral-text-secondary">
          {form.headline && <p className="text-neutral-text font-medium">{form.headline}</p>}
          {form.desiredJobTitle && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Looking for: {form.desiredJobTitle}</span>
            </div>
          )}
          {form.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{form.phone}</span>
            </div>
          )}
          {(displayRegions.length > 0 || displayCountry) && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                {displayRegions.length > 0 ? displayRegions.join(", ") : ""}
                {displayCountry ? `, ${displayCountry.flag} ${displayCountry.name}` : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Career Preferences Edit Section (LinkedIn-style)
function CareerPreferencesSection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const updatePreferences = useMutation(api.profile.updateJobSeekerPreferences);
  const refreshCompleteness = useMutation(api.profile.refreshCompleteness);

  const countryCurrency = COUNTRY_CURRENCY[normalizeCountryCode(profile.country)] || "KES";

  const [form, setForm] = useState({
    currentStatus: profile.jobSeekerProfile?.currentStatus || "",
    yearsOfExperience: profile.jobSeekerProfile?.yearsOfExperience ?? "",
    openToWork: profile.jobSeekerProfile?.openToWork ?? false,
    desiredJobTitle: profile.jobSeekerProfile?.desiredJobTitle || "",
    jobTypes: (profile.jobSeekerProfile?.jobTypes as string[]) || [],
    workArrangements: (profile.jobSeekerProfile?.workArrangements as string[]) || [],
    salaryMin: profile.jobSeekerProfile?.salaryMin ?? "",
    salaryCurrency: profile.jobSeekerProfile?.salaryCurrency || countryCurrency,
    willingToRelocate: profile.jobSeekerProfile?.willingToRelocate ?? false,
    availability: profile.jobSeekerProfile?.availability || "",
  });

  const toggleArray = (field: "jobTypes" | "workArrangements", value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        currentStatus: form.currentStatus || undefined,
        yearsOfExperience: form.yearsOfExperience !== "" ? Number(form.yearsOfExperience) : undefined,
        openToWork: form.openToWork,
        desiredJobTitle: form.desiredJobTitle || undefined,
        jobTypes: form.jobTypes.length ? form.jobTypes : undefined,
        workArrangements: form.workArrangements.length ? form.workArrangements : undefined,
        salaryMin: form.salaryMin !== "" ? Number(form.salaryMin) : undefined,
        salaryCurrency: form.salaryCurrency || undefined,
        willingToRelocate: form.willingToRelocate,
        availability: form.availability || undefined,
      });
      void refreshCompleteness({});
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const statusMap: Record<string, string> = {
    employed: "Currently Employed",
    unemployed: "Looking for Work",
    student: "Student",
    freelancer: "Freelancer",
  };

  const jobTypeOptions = ["full-time", "part-time", "contract", "internship"];
  const arrangementOptions = ["on-site", "remote", "hybrid"];
  const availabilityOptions = [
    { value: "immediate", label: "Immediately" },
    { value: "2_weeks", label: "2 Weeks" },
    { value: "1_month", label: "1 Month" },
    { value: "3_months", label: "3 Months" },
  ];

  return (
    <div id="section-preferences" className="bg-white border border-neutral-border rounded-xl p-4 sm:p-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base font-semibold text-neutral-text">Career Preferences</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Current Status</label>
              <select
                value={form.currentStatus}
                onChange={e => setForm(f => ({ ...f, currentStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="">Select status</option>
                {Object.entries(statusMap).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.yearsOfExperience}
                onChange={e => setForm(f => ({ ...f, yearsOfExperience: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Desired Job Title</label>
            <input
              type="text"
              value={form.desiredJobTitle}
              onChange={e => setForm(f => ({ ...f, desiredJobTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Job Type</label>
            <div className="flex flex-wrap gap-2">
              {jobTypeOptions.map(jt => (
                <button
                  key={jt}
                  type="button"
                  onClick={() => toggleArray("jobTypes", jt)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                    form.jobTypes.includes(jt)
                      ? "bg-brand-orange text-white border-brand-orange"
                      : "border-neutral-border text-neutral-text hover:border-brand-orange"
                  }`}
                >
                  {jt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text-muted mb-1">Work Arrangement</label>
            <div className="flex flex-wrap gap-2">
              {arrangementOptions.map(ar => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => toggleArray("workArrangements", ar)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                    form.workArrangements.includes(ar)
                      ? "bg-brand-orange text-white border-brand-orange"
                      : "border-neutral-border text-neutral-text hover:border-brand-orange"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Min Salary</label>
              <div className="flex gap-2">
                <select
                  value={form.salaryCurrency}
                  onChange={e => setForm(f => ({ ...f, salaryCurrency: e.target.value }))}
                  className="w-20 px-2 py-2 border border-neutral-border rounded-md text-xs focus:outline-none"
                >
                  {Object.values(COUNTRY_CURRENCY).filter((v, i, a) => a.indexOf(v) === i).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-text-muted mb-1">Availability</label>
              <select
                value={form.availability}
                onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="">Select</option>
                {availabilityOptions.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.willingToRelocate}
                onChange={e => setForm(f => ({ ...f, willingToRelocate: e.target.checked }))}
                className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
              />
              <span className="text-sm text-neutral-text">Willing to relocate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.openToWork}
                onChange={e => setForm(f => ({ ...f, openToWork: e.target.checked }))}
                className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
              />
              <span className="text-sm text-neutral-text">Open to work</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {profile.jobSeekerProfile?.desiredJobTitle && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Looking for</p>
                  <p className="text-sm sm:text-base font-medium text-neutral-text">{profile.jobSeekerProfile.desiredJobTitle}</p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.yearsOfExperience !== undefined && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Experience</p>
                  <p className="font-medium text-neutral-text">{profile.jobSeekerProfile.yearsOfExperience} years</p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.currentStatus && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Status</p>
                  <p className="font-medium text-neutral-text">{statusMap[profile.jobSeekerProfile.currentStatus] || profile.jobSeekerProfile.currentStatus}</p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.jobTypes && profile.jobSeekerProfile.jobTypes.length > 0 && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Job Type</p>
                  <p className="font-medium text-neutral-text capitalize">{profile.jobSeekerProfile.jobTypes.join(", ")}</p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.workArrangements && profile.jobSeekerProfile.workArrangements.length > 0 && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Work Arrangement</p>
                  <p className="font-medium text-neutral-text capitalize">{profile.jobSeekerProfile.workArrangements.join(", ")}</p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.salaryMin && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Min Salary</p>
                  <p className="font-medium text-neutral-text">
                    {profile.jobSeekerProfile.salaryCurrency || countryCurrency} {profile.jobSeekerProfile.salaryMin.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.availability && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-1">Availability</p>
                  <p className="font-medium text-neutral-text capitalize">
                    {profile.jobSeekerProfile.availability === "immediate"
                      ? "Immediately"
                      : profile.jobSeekerProfile.availability.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {profile.jobSeekerProfile?.desiredIndustries && profile.jobSeekerProfile.desiredIndustries.length > 0 && (
            <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg sm:col-span-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-text-muted mb-2">Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.jobSeekerProfile.desiredIndustries.map((ind: string) => (
                      <span key={ind} className="px-2 py-0.5 bg-white border border-neutral-border text-neutral-text text-xs rounded-full">{ind}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!profile.jobSeekerProfile?.desiredJobTitle && !profile.jobSeekerProfile?.jobTypes?.length && (
            <p className="text-sm text-neutral-text-muted col-span-2 italic">No preferences set yet. Click Edit to add your career preferences.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Skills Section Component
function SkillsSection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile.skills?.map((s: any) => s.skillName) || []);
  const [newSkill, setNewSkill] = useState("");
  const addSkill = useMutation(api.educationSkillsMutations.addSkill);
  const deleteSkill = useMutation(api.educationSkillsMutations.deleteSkill);
  const refreshCompleteness = useMutation(api.profile.refreshCompleteness);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current skills from profile
      const currentSkills = profile.skills?.map((s: any) => s.skillName) || [];
      
      // Find skills to add
      const skillsToAdd = skills.filter(s => !currentSkills.includes(s));
      
      // Find skills to delete
      const skillsToDelete = profile.skills?.filter((s: any) => !skills.includes(s.skillName)) || [];
      
      // Add new skills
      for (const skillName of skillsToAdd) {
        await addSkill({
          userId: profile._id,
          skillName,
          category: "technical",
          proficiency: "intermediate"
        });
      }
      
      // Delete removed skills
      for (const skill of skillsToDelete) {
        await deleteSkill({ id: skill._id });
      }
      
      void refreshCompleteness({});
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save skills:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="section-skills" className="bg-white border border-neutral-border rounded-xl p-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-text">Skills</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 inline mr-1" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-neutral-bg-secondary text-neutral-text text-sm rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-neutral-text-secondary hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 text-sm bg-neutral-bg-secondary text-neutral-text rounded-md hover:bg-neutral-border transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setSkills(profile.skills?.map((s: any) => s.skillName) || []);
                setNewSkill("");
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((skill: any) => (
            <span
              key={skill._id}
              className="px-3 py-1.5 bg-neutral-bg-secondary text-neutral-text text-sm rounded-full"
            >
              {skill.skillName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Edit Work Experience Modal
// ─── shared helpers for date pickers ───────────────────────────────────────
const MONTHS_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const EXP_YEARS = Array.from({ length: 50 }, (_, i) => String(CURRENT_YEAR - i));
const EDU_YEARS = Array.from({ length: 60 }, (_, i) => String(CURRENT_YEAR + 5 - i));

const INDUSTRIES_LIST = [
  "Technology","Finance & Banking","Healthcare","Education","Engineering",
  "Marketing & Advertising","Sales","Operations","Human Resources",
  "Legal","Consulting","Manufacturing","Retail & E-commerce",
  "Hospitality & Tourism","Agriculture","Construction","Media & Communications",
  "NGO / Non-profit","Government / Public Sector","Other",
];
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "permanent", label: "Full-time / Permanent" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship / Attachment" },
  { value: "freelance", label: "Freelance / Consultant" },
  { value: "attachment", label: "Industrial Attachment" },
];

function MonthYearSelect({
  label, value, onChange, years, disabled, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  years: string[]; disabled?: boolean; required?: boolean;
}) {
  const [month, year] = value ? [value.slice(5, 7), value.slice(0, 4)] : ["", ""];
  const update = (m: string, y: string) => { if (m && y) onChange(`${y}-${m}`); else onChange(""); };
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-text mb-1">{label}{required && " *"}</label>
      <div className="flex gap-2">
        <select
          value={month} onChange={(e) => update(e.target.value, year)} disabled={disabled}
          className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:opacity-50 disabled:bg-neutral-bg-secondary"
        >
          <option value="">Month</option>
          {MONTHS_ABBR.map((m, i) => <option key={m} value={String(i+1).padStart(2,"0")}>{m}</option>)}
        </select>
        <select
          value={year} onChange={(e) => update(month, e.target.value)} disabled={disabled}
          className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:opacity-50 disabled:bg-neutral-bg-secondary"
        >
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

// Edit Work Experience Modal
function EditExperienceModal({ experience, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: experience.title || "",
    company: experience.company || "",
    industry: experience.industry || "",
    employmentType: experience.employmentType || "permanent",
    startDate: experience.startDate || "",
    endDate: experience.endDate || "",
    currentlyWorking: experience.currentlyWorking || false,
    description: experience.description || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-neutral-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text">
            {experience._id ? "Edit Experience" : "Add Experience"}
          </h3>
          <button onClick={onClose} className="text-neutral-text-secondary hover:text-neutral-text p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Job Title *</label>
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="e.g. Software Engineer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Company *</label>
              <input type="text" value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="e.g. Safaricom PLC" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Employment Type</label>
              <select value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                {EMPLOYMENT_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Industry</label>
              <select value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                <option value="">Select industry</option>
                {INDUSTRIES_LIST.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MonthYearSelect label="Start Date" value={formData.startDate}
              onChange={(v) => setFormData({ ...formData, startDate: v })}
              years={EXP_YEARS} required />
            <MonthYearSelect label="End Date" value={formData.endDate}
              onChange={(v) => setFormData({ ...formData, endDate: v })}
              years={EXP_YEARS} disabled={formData.currentlyWorking} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.currentlyWorking}
              onChange={(e) => setFormData({ ...formData, currentlyWorking: e.target.checked, endDate: "" })}
              className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange" />
            <span className="text-sm text-neutral-text">I currently work here</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">
              Description <span className="text-neutral-text-muted font-normal">(optional)</span>
            </label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4} placeholder="Key responsibilities and achievements..."
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
            {onDelete ? (
              <button type="button" onClick={onDelete}
                className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Education Modal
function EditEducationModal({ education, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    institution: education.institution || "",
    qualificationLevel: education.qualificationLevel || "degree",
    certificateType: education.certificateType || "",
    fieldOfStudy: education.fieldOfStudy || "",
    startYear: education.startYear || "",
    endYear: education.endYear || "",
    grade: education.grade || "",
    currentlyStudying: !education.endYear && !!education.startYear,
  });
  const [saving, setSaving] = useState(false);

  const qualificationLevels = [
    { label: "PhD / Doctorate", value: "phd" },
    { label: "Master's Degree", value: "masters" },
    { label: "Bachelor's Degree", value: "degree" },
    { label: "Diploma", value: "diploma" },
    { label: "Certificate", value: "certificate" },
    { label: "TVET / Vocational", value: "tvet" },
  ];

  const certificateTypes = [
    "Polytechnic Certificate","Bootcamp Certificate","Professional Certificate",
    "Online Course Certificate","Short Course Certificate",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { currentlyStudying, ...rest } = formData;
      await onSave({ ...rest, endYear: currentlyStudying ? "" : rest.endYear });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-neutral-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text">
            {education._id ? "Edit Education" : "Add Education"}
          </h3>
          <button onClick={onClose} className="text-neutral-text-secondary hover:text-neutral-text p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Institution *</label>
            <input type="text" value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g. University of Nairobi"
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Qualification Level *</label>
              <select value={formData.qualificationLevel}
                onChange={(e) => setFormData({ ...formData, qualificationLevel: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20" required>
                {qualificationLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Field of Study *</label>
              <input type="text" value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                required />
            </div>
          </div>

          {formData.qualificationLevel === "certificate" && (
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Certificate Type</label>
              <select value={formData.certificateType}
                onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                <option value="">Select type</option>
                {certificateTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Start Year *</label>
              <select value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20" required>
                <option value="">Year</option>
                {EDU_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">End Year</label>
              <select value={formData.endYear}
                onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                disabled={formData.currentlyStudying}
                className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:opacity-50 disabled:bg-neutral-bg-secondary">
                <option value="">Year</option>
                {EDU_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.currentlyStudying}
              onChange={(e) => setFormData({ ...formData, currentlyStudying: e.target.checked, endYear: "" })}
              className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange" />
            <span className="text-sm text-neutral-text">I currently study here</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">
              Grade / GPA <span className="text-neutral-text-muted font-normal">(optional)</span>
            </label>
            <input type="text" value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              placeholder="e.g. First Class, 3.8 GPA"
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


// Sidebar checklist card — mirrors the computation logic so the user
// sees exactly what's missing and can click to fix each item.
function ProfileStrengthSidebar({ profile }: { profile: any }) {
  const pct = profile.jobSeekerProfile?.profileCompleteness || 0;
  const label =
    pct >= 90 ? "All-Star"
    : pct >= 70 ? "Strong"
    : pct >= 40 ? "Intermediate"
    : "Getting started";

  const hasPhoto = !!(profile.profilePhoto || profile.profilePhotoStorageId);
  const hasContact = !!(profile.fullName && profile.phone && (profile.county || profile.preferredRegions?.length));
  const hasHeadline = !!(profile.jobSeekerProfile?.headline?.trim().length >= 3);
  const hasSummary = !!(profile.jobSeekerProfile?.careerSummary?.trim().length >= 50);
  const hasExp = (profile.workExperience?.length ?? 0) >= 1;
  const hasEdu = (profile.education?.length ?? 0) >= 1;
  const hasSkills = (profile.skills?.length ?? 0) >= 3;
  const hasCerts = (profile.certifications?.length ?? 0) >= 1;

  const items = [
    { label: "Profile photo",        done: hasPhoto,    pts: 10, section: "section-photo" },
    { label: "Name, phone & region", done: hasContact,  pts: 10, section: "section-basic" },
    { label: "Professional headline",done: hasHeadline, pts: 10, section: "section-basic" },
    { label: "Career summary",       done: hasSummary,  pts: 15, note: "≥ 50 chars", section: "section-summary" },
    { label: "Work experience",      done: hasExp,      pts: 20, section: "section-experience" },
    { label: "Education",            done: hasEdu,      pts: 10, section: "section-education" },
    { label: "Skills (min. 3)",      done: hasSkills,   pts: 15, section: "section-skills" },
    { label: "Certifications",       done: hasCerts,    pts: 10, section: "section-skills" },
  ];

  const done = items.filter(i => i.done).length;

  return (
    <div className="bg-white border border-neutral-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-neutral-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-text">Profile strength</h3>
          <span className="text-xs font-bold text-brand-orange">{label}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-neutral-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-orange rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-neutral-text tabular-nums">{pct}%</span>
        </div>
        <p className="text-xs text-neutral-text-muted">{done}/{items.length} sections complete</p>
      </div>

      {/* Checklist */}
      <div className="p-4 space-y-0.5">
        {items.map(({ label, done, pts, note, section }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              const el = document.getElementById(section);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`w-full flex items-center gap-3 px-1 py-2 rounded-lg text-left cursor-pointer hover:bg-neutral-bg-secondary transition-colors`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              done ? "bg-green-50" : "border-2 border-neutral-border"
            }`}>
              {done && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
            <span className={`flex-1 text-xs ${done ? "text-neutral-text-secondary line-through" : "text-neutral-text"}`}>
              {label}
              {note && !done && <span className="text-neutral-text-muted ml-1">({note})</span>}
            </span>
            <span className={`text-[10px] font-semibold tabular-nums ${done ? "text-green-600" : "text-neutral-text-muted"}`}>
              +{pts}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.profile.updateProfilePhoto);
  const removeProfilePhoto = useMutation(api.profile.removeProfilePhoto);
  const refreshCompleteness = useMutation(api.profile.refreshCompleteness);
  const updateWorkExperience = useMutation(api.workExperienceMutations.updateWorkExperience);
  const deleteWorkExperience = useMutation(api.workExperienceMutations.deleteWorkExperience);
  const addWorkExperience = useMutation(api.workExperienceMutations.addWorkExperience);
  const updateEducation = useMutation(api.educationSkillsMutations.updateEducation);
  const deleteEducation = useMutation(api.educationSkillsMutations.deleteEducation);
  const addEducation = useMutation(api.educationSkillsMutations.addEducation);
  const { user } = useUser();

  // Recalculate completeness based on actual DB state the first time the page loads.
  // This corrects any stale value left over from onboarding's lighter calculation.
  useEffect(() => {
    refreshCompleteness({}).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [addingExperience, setAddingExperience] = useState(false);
  const [addingEducation, setAddingEducation] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  const filters = [
    { name: "Natural", css: "none" },
    { name: "Vibrant", css: "saturate(1.3) contrast(1.1)" },
    { name: "B&W", css: "grayscale(1)" },
    { name: "Warm", css: "sepia(0.3) saturate(1.2)" },
  ];

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (): Promise<Blob> => {
    if (!editingImageUrl) throw new Error("No image to crop");
    
    const image = await createImage(editingImageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const maxSize = 1024;
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Apply filters
    if (ctx) {
      const filterCss = filters[selectedFilter]?.css || "";
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filterCss}`;

      // Draw rotated and cropped image
      ctx.save();
      ctx.translate(maxSize / 2, maxSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
    }
    ctx.translate(-maxSize / 2, -maxSize / 2);

    if (croppedAreaPixels) {
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        maxSize,
        maxSize
      );
    }

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg", 0.95);
    });
  };

  const handleSaveEditedPhoto = async () => {
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg();
      
      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: croppedBlob,
      });
      const { storageId } = await uploadResult.json();

      // Update user profile in Convex
      const result = await updateProfilePhoto({ storageId });
      
      // Update Clerk profile image
      if (user && result?.photoUrl) {
        await user.setProfileImage({ file: croppedBlob });
      }
      void refreshCompleteness({});
      
      // Reset states
      setEditMode(false);
      setShowPhotoModal(false);
      setEditingImageUrl(null);
      setZoom(1);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setSelectedFilter(0);
    } catch (error) {
      setUploadError("Failed to save photo");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    // Load image for editing
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingImageUrl(e.target?.result as string);
      setShowPhotoModal(false);
      setEditMode(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Remove profile photo?")) return;
    
    try {
      setUploading(true);
      await removeProfilePhoto();
      setShowPhotoModal(false);
    } catch (error) {
      setUploadError("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  if (profile === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-neutral-text-secondary">Profile not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusMap: Record<string, string> = {
    employed: "Currently Employed",
    unemployed: "Looking for Work",
    student: "Student",
    freelancer: "Freelancer",
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page title */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-neutral-text">My Profile</h1>
            <p className="text-sm text-neutral-text-secondary mt-0.5">Manage your professional information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Hero card — photo + name + meta */}
            <div id="section-photo" className="bg-white border border-neutral-border rounded-xl p-5 sm:p-6 scroll-mt-20">
              <div className="flex items-start gap-5">
                {/* Photo */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    disabled={uploading}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-neutral-text group cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {profile.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt={profile.fullName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
                        {profile.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                    {!uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                  {/* Open-to-work ring */}
                  {profile.jobSeekerProfile?.openToWork && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-green-600 text-white text-[10px] font-semibold rounded-full">
                      Open to work
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {uploadError && <p className="text-xs text-red-600 mb-1">{uploadError}</p>}
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-text leading-tight">
                    {profile.fullName || "Your Name"}
                  </h2>
                  <p className="text-sm text-neutral-text-secondary mt-0.5 mb-3 truncate">
                    {profile.jobSeekerProfile?.headline || (
                      <span className="italic text-neutral-text-muted">Add a headline</span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-text-secondary">
                    {(() => {
                      const displayCountry = WORK_COUNTRIES.find(c => c.code === normalizeCountryCode(profile.country));
                      const displayRegions = profile.preferredRegions?.length ? profile.preferredRegions : profile.county ? [profile.county] : [];
                      if (!displayRegions.length && !displayCountry) return null;
                      return (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {displayRegions.slice(0, 2).join(", ")}{displayRegions.length > 2 ? ` +${displayRegions.length - 2}` : ""}{displayCountry ? `, ${displayCountry.flag} ${displayCountry.name}` : ""}
                        </span>
                      );
                    })()}
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{profile.email}</span>
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {profile.phone}
                      </span>
                    )}
                  </div>

                  {profile.jobSeekerProfile?.currentStatus && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-bg-secondary text-neutral-text-secondary text-xs font-medium rounded-full border border-neutral-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange inline-block" />
                        {statusMap[profile.jobSeekerProfile.currentStatus] || profile.jobSeekerProfile.currentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info Edit Card */}
            <BasicInfoSection profile={profile} />

            {/* Career Summary Section */}
            <CareerSummarySection profile={profile} />

            {/* Career Preferences */}
            <CareerPreferencesSection profile={profile} />

            {/* Work Experience */}
            <div id="section-experience" className="bg-white border border-neutral-border rounded-xl p-5 sm:p-6 scroll-mt-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-neutral-text-secondary" />
                  <h3 className="text-base font-semibold text-neutral-text">Work Experience</h3>
                </div>
                <button
                  onClick={() => setAddingExperience(true)}
                  className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {profile.workExperience && profile.workExperience.length > 0 ? (
                <div className="space-y-0">
                  {profile.workExperience.map((exp, idx) => (
                    <div key={exp._id}>
                      {idx > 0 && <div className="border-t border-neutral-border mb-5" />}
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-neutral-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-text">{exp.title}</h4>
                              <p className="text-sm text-neutral-text-secondary">
                                {exp.company}
                                {exp.employmentType && exp.employmentType !== "permanent" && (
                                  <span className="ml-2 text-xs text-neutral-text-muted capitalize">· {exp.employmentType}</span>
                                )}
                              </p>
                              <p className="text-xs text-neutral-text-muted mt-0.5">
                                {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                                {exp.industry && ` · ${exp.industry}`}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-neutral-text-secondary mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => setEditingExperience(exp)}
                              className="text-neutral-text-muted hover:text-brand-orange transition-colors flex-shrink-0"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setAddingExperience(true)}
                  className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-neutral-border rounded-lg hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-neutral-bg-secondary rounded-full flex items-center justify-center group-hover:bg-brand-orange/10">
                    <Briefcase className="w-5 h-5 text-neutral-text-muted group-hover:text-brand-orange" />
                  </div>
                  <p className="text-sm text-neutral-text-muted group-hover:text-brand-orange">Add your work experience</p>
                </button>
              )}
            </div>

            {/* Education */}
            <div id="section-education" className="bg-white border border-neutral-border rounded-lg p-6 scroll-mt-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-text">Education</h3>
                <button
                  onClick={() => setAddingEducation(true)}
                  className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-5">
                  {profile.education.map((edu, idx) => (
                    <div key={edu._id}>
                      {idx > 0 && <div className="border-t border-neutral-border mb-5" />}
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-neutral-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-text">{edu.fieldOfStudy}</h4>
                              <p className="text-sm text-neutral-text-secondary">{edu.institution}</p>
                              <p className="text-xs text-neutral-text-muted mt-0.5">
                                {edu.qualificationLevel && (
                                  <span className="capitalize">{edu.qualificationLevel.replace("degree", "Bachelor's").replace("masters", "Master's").replace("phd", "PhD")} · </span>
                                )}
                                {edu.startYear}
                                {(edu.endYear || edu.startYear) && " – "}
                                {edu.endYear || (edu.startYear ? "Present" : "")}
                                {edu.grade && ` · ${edu.grade}`}
                              </p>
                            </div>
                            <button
                              onClick={() => setEditingEducation(edu)}
                              className="text-neutral-text-muted hover:text-brand-orange transition-colors flex-shrink-0"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setAddingEducation(true)}
                  className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-neutral-border rounded-lg hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-neutral-bg-secondary rounded-full flex items-center justify-center group-hover:bg-brand-orange/10">
                    <GraduationCap className="w-5 h-5 text-neutral-text-muted group-hover:text-brand-orange" />
                  </div>
                  <p className="text-sm text-neutral-text-muted group-hover:text-brand-orange">Add your education</p>
                </button>
              )}
            </div>

            {/* Skills */}
            <SkillsSection profile={profile} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-5">
            {/* Profile Strength checklist card */}
            <ProfileStrengthSidebar profile={profile} />

            {/* Quick links */}
            <div className="bg-white border border-neutral-border rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-neutral-text mb-3">Quick links</h3>
              <div className="space-y-1">
                <Link
                  href="/dashboard/applications"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4 text-neutral-text-muted" />
                  My Applications
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-lg transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-neutral-text-muted" />
                  Saved Jobs
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-text-muted" />
                  Account Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      {showPhotoModal && !editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-text">Profile Photo</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-neutral-text-secondary hover:text-neutral-text"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Preview */}
            <div className="p-8 flex items-center justify-center bg-neutral-bg-secondary">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-neutral-text">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt={profile.fullName || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-semibold">
                    {profile.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Icon Buttons */}
            <div className="p-6">
              {uploadError && (
                <p className="text-sm text-red-600 mb-3">{uploadError}</p>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={uploading}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                {/* Left - Edit & Change */}
                <div className="flex gap-2">
                  {profile.profilePhoto && (
                    <button
                      onClick={() => {
                        setEditingImageUrl(profile.profilePhoto!);
                        setEditMode(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-neutral-border text-neutral-text text-sm font-medium rounded-md hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        {profile.profilePhoto ? "Change" : "Upload"}
                      </>
                    )}
                  </button>
                </div>

                {/* Right - Remove */}
                {profile.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-text-muted text-center pt-3">
                Max file size: 5MB • Supported: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Modal - Unique Minimal Design */}
      {editMode && editingImageUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Edit Photo</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditingImageUrl(null);
                    setZoom(1);
                    setRotation(0);
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setSelectedFilter(0);
                  }}
                  className="px-4 py-2 text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedPhoto}
                  disabled={uploading}
                  className="px-6 py-2 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[600px]">
              {/* Cropper Area */}
              <div className="flex-1 relative bg-black">
                <Cropper
                  image={editingImageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filters[selectedFilter]?.css || ""}`,
                    },
                  }}
                />
              </div>

              {/* Controls Sidebar */}
              <div className="w-80 bg-white p-6 overflow-y-auto space-y-6">
                {/* Filters */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Filters</h4>
                <div className="grid grid-cols-2 gap-4">
                  {filters.map((filter, index) => (
                    <button
                      key={filter.name}
                      onClick={() => setSelectedFilter(index)}
                      className="flex flex-col items-center gap-2 transition-all"
                    >
                      {/* Filter Preview */}
                      <div 
                        className={`w-16 h-16 rounded-full overflow-hidden bg-black transition-all ${
                          selectedFilter === index
                            ? 'ring-2 ring-brand-orange ring-offset-2'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          filter: filter.css
                        }}
                      >
                        <img 
                          src={editingImageUrl} 
                          alt={filter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedFilter === index ? 'text-brand-orange' : 'text-neutral-text-secondary'
                      }`}>
                        {filter.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop & Position */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Crop & Position</h4>
                
                {/* Zoom */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Zoom</span>
                    <span className="text-xs text-neutral-text-secondary">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Rotate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Rotate</span>
                    <span className="text-xs text-neutral-text-secondary">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRotation(r => r - 15)}
                      className="p-2 border border-neutral-border rounded hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-neutral-text" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                    />
                    <button
                      onClick={() => setRotation(r => r + 15)}
                      className="p-2 border border-neutral-border rounded hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <RotateCw className="w-4 h-4 text-neutral-text" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Adjustments</h4>
                
                {/* Brightness */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Brightness</span>
                    <span className="text-xs text-neutral-text-secondary">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Contrast */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Contrast</span>
                    <span className="text-xs text-neutral-text-secondary">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Saturation</span>
                    <span className="text-xs text-neutral-text-secondary">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Edit Work Experience Modal */}
      {editingExperience && (
        <EditExperienceModal
          experience={editingExperience}
          onClose={() => setEditingExperience(null)}
          onSave={async (data: any) => {
            await updateWorkExperience({ id: editingExperience._id, ...data });
            void refreshCompleteness({});
            setEditingExperience(null);
          }}
          onDelete={async () => {
            if (confirm("Delete this experience?")) {
              await deleteWorkExperience({ id: editingExperience._id });
              void refreshCompleteness({});
              setEditingExperience(null);
            }
          }}
        />
      )}

      {/* Add Work Experience Modal */}
      {addingExperience && (
        <EditExperienceModal
          experience={{}}
          onClose={() => setAddingExperience(false)}
          onSave={async (data: any) => {
            await addWorkExperience({
              userId: profile._id,
              company: data.company,
              title: data.title,
              industry: data.industry || "",
              employmentType: data.employmentType || "permanent",
              startDate: data.startDate,
              endDate: data.endDate || undefined,
              currentlyWorking: data.currentlyWorking,
              description: data.description || undefined,
            });
            void refreshCompleteness({});
            setAddingExperience(false);
          }}
          onDelete={null}
        />
      )}

      {/* Edit Education Modal */}
      {editingEducation && (
        <EditEducationModal
          education={editingEducation}
          onClose={() => setEditingEducation(null)}
          onSave={async (data: any) => {
            await updateEducation({ id: editingEducation._id, ...data });
            void refreshCompleteness({});
            setEditingEducation(null);
          }}
          onDelete={async () => {
            if (confirm("Delete this education?")) {
              await deleteEducation({ id: editingEducation._id });
              void refreshCompleteness({});
              setEditingEducation(null);
            }
          }}
        />
      )}

      {/* Add Education Modal */}
      {addingEducation && (
        <EditEducationModal
          education={{}}
          onClose={() => setAddingEducation(false)}
          onSave={async (data: any) => {
            await addEducation({ userId: profile._id, ...data });
            void refreshCompleteness({});
            setAddingEducation(false);
          }}
          onDelete={null}
        />
      )}
    </DashboardLayout>
  );
}
