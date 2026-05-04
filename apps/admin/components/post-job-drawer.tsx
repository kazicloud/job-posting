"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  X,
  Briefcase,
  FileText,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostJobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: Id<"users">;
  companyName: string;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KENYA_COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa",
  "Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu",
  "Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a",
  "Kiambu","Turkana","West Pokot","Samburu","Trans-Nzoia","Uasin Gishu",
  "Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado",
  "Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu",
  "Homa Bay","Migori","Kisii","Nyamira","Nairobi",
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "attachment", label: "Attachment" },
];

const WORKPLACE_TYPES = [
  { value: "on_site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level (0–2 yrs)" },
  { value: "mid", label: "Mid level (2–5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
  { value: "lead", label: "Lead / Manager" },
  { value: "executive", label: "Executive / Director" },
  { value: "internship", label: "Internship / Student" },
];

const DEPARTMENTS = [
  "Engineering & Technology","Marketing & Sales","Finance & Accounting",
  "Human Resources","Operations","Customer Service","Legal","Product",
  "Design & Creative","Data & Analytics","Research","Healthcare",
  "Education","Administration","Other",
];

// ─── Default form state ────────────────────────────────────────────────────────

const defaultForm = {
  // Step 1 — Role details
  title: "",
  department: "",
  employmentType: "",
  workplaceType: "",
  location: "",
  county: "",
  positions: "1",
  experienceLevel: "",
  applicationDeadline: "",

  // Step 2 — Job content
  description: "",
  responsibilities: "",
  requirements: "",
  requiredSkills: [] as string[],
  preferredSkills: [] as string[],
  niceToHave: "",

  // Step 3 — Compensation & publish
  salaryDisclosure: "range" as "range" | "undisclosed",
  salaryMin: "",
  salaryMax: "",
  currency: "KES",
  benefits: "",
  status: "published" as "draft" | "published",
  adminNote: "",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function PostJobDrawer({ isOpen, onClose, employerId, companyName }: PostJobDrawerProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  const adminPostJob = useMutation(api.admin.adminPostJobOnBehalf);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm(defaultForm);
      setErrors({});
      setSuccess(false);
      setSkillInput("");
      setPreferredSkillInput("");
    }
  }, [isOpen]);

  // Trap focus inside drawer & close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const set = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addSkill = (type: "required" | "preferred") => {
    const raw = type === "required" ? skillInput.trim() : preferredSkillInput.trim();
    if (!raw) return;
    const key = type === "required" ? "requiredSkills" : "preferredSkills";
    const inputKey = type === "required" ? setSkillInput : setPreferredSkillInput;
    if (!(form[key] as string[]).includes(raw)) {
      set(key, [...(form[key] as string[]), raw]);
    }
    inputKey("");
  };

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    const key = type === "required" ? "requiredSkills" : "preferredSkills";
    set(key, (form[key] as string[]).filter((s) => s !== skill));
  };

  // ─── Validation ───────────────────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const errs: FormErrors = {};

    if (s === 1) {
      if (!form.title.trim()) errs.title = "Job title is required";
      if (!form.employmentType) errs.employmentType = "Employment type is required";
      if (!form.workplaceType) errs.workplaceType = "Workplace type is required";
      if (!form.location.trim()) errs.location = "Location is required";
      if (!form.experienceLevel) errs.experienceLevel = "Experience level is required";
      const pos = parseInt(form.positions);
      if (isNaN(pos) || pos < 1) errs.positions = "Must be at least 1";
    }

    if (s === 2) {
      if (form.description.trim().length < 50) errs.description = "Description must be at least 50 characters";
      if (form.responsibilities.trim().length < 20) errs.responsibilities = "Responsibilities are required";
      if (form.requirements.trim().length < 20) errs.requirements = "Requirements are required";
    }

    if (s === 3) {
      if (form.salaryDisclosure === "range") {
        const min = parseFloat(form.salaryMin);
        const max = parseFloat(form.salaryMax);
        if (!form.salaryMin || isNaN(min) || min < 0) errs.salaryMin = "Enter a valid minimum";
        if (!form.salaryMax || isNaN(max) || max < 0) errs.salaryMax = "Enter a valid maximum";
        if (!isNaN(min) && !isNaN(max) && max < min) errs.salaryMax = "Max must be ≥ min";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      await adminPostJob({
        employerId,
        title: form.title.trim(),
        companyName,
        department: form.department || undefined,
        employmentType: form.employmentType,
        workplaceType: form.workplaceType,
        location: form.location.trim(),
        county: form.county || undefined,
        description: form.description.trim(),
        responsibilities: form.responsibilities.trim(),
        requirements: form.requirements.trim(),
        requiredSkills: form.requiredSkills.length > 0 ? form.requiredSkills : undefined,
        preferredSkills: form.preferredSkills.length > 0 ? form.preferredSkills : undefined,
        niceToHave: form.niceToHave.trim() || undefined,
        salaryDisclosure: form.salaryDisclosure,
        salaryMin: form.salaryDisclosure === "range" && form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryDisclosure === "range" && form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        currency: form.salaryDisclosure === "range" ? form.currency : undefined,
        benefits: form.benefits.trim() || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        positions: parseInt(form.positions) || 1,
        experienceLevel: form.experienceLevel,
        status: form.status,
        adminNote: form.adminNote.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrors({ _submit: err?.message ?? "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Steps config ─────────────────────────────────────────────────────────────

  const steps = [
    { number: 1, label: "Role Details", icon: Briefcase },
    { number: 2, label: "Job Content", icon: FileText },
    { number: 3, label: "Compensation", icon: DollarSign },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post job on behalf of employer"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold">
                <Info className="w-3 h-3" />
                Admin Action
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Post Job on Behalf</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Posting for <span className="font-semibold text-neutral-700">{companyName}</span> — job will appear in their dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Progress ───────────────────────────────────────────────────── */}
        {!success && (
          <div className="flex items-center gap-0 px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex-shrink-0">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isDone = step > s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isDone
                          ? "bg-brand-orange text-white"
                          : isActive
                          ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                          : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? "text-neutral-900" : isDone ? "text-neutral-600" : "text-neutral-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                        step > s.number ? "bg-brand-orange" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">

          {/* Success state */}
          {success && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Job Posted!</h3>
              <p className="text-neutral-500 mb-1">
                The job <span className="font-semibold text-neutral-700">&ldquo;{form.title}&rdquo;</span> has been successfully posted for {companyName}.
              </p>
              <p className="text-sm text-neutral-400 mb-8">
                Status: <span className="font-medium capitalize text-neutral-600">{form.status}</span>
                {form.status === "published" && " — live on the platform"}
                {form.status === "draft" && " — saved as draft in their dashboard"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSuccess(false); setStep(1); setForm(defaultForm); setErrors({}); }}
                  className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-sm font-medium transition-colors"
                >
                  Post Another Job
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Role Details */}
          {!success && step === 1 && (
            <div className="space-y-5">
              <SectionHeader title="Role Details" subtitle="Basic information about the position" />

              <Field label="Job Title" required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className={inputClass(!!errors.title)}
                />
              </Field>

              <Field label="Department" error={errors.department}>
                <select value={form.department} onChange={(e) => set("department", e.target.value)} className={inputClass(false)}>
                  <option value="">Select department (optional)</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Employment Type" required error={errors.employmentType}>
                  <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inputClass(!!errors.employmentType)}>
                    <option value="">Select type</option>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>

                <Field label="Workplace Type" required error={errors.workplaceType}>
                  <select value={form.workplaceType} onChange={(e) => set("workplaceType", e.target.value)} className={inputClass(!!errors.workplaceType)}>
                    <option value="">Select type</option>
                    {WORKPLACE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Location (City / Area)" required error={errors.location}>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Nairobi CBD"
                    className={inputClass(!!errors.location)}
                  />
                </Field>

                <Field label="County" error={errors.county}>
                  <select value={form.county} onChange={(e) => set("county", e.target.value)} className={inputClass(false)}>
                    <option value="">Select county</option>
                    {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Experience Level" required error={errors.experienceLevel}>
                  <select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} className={inputClass(!!errors.experienceLevel)}>
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>

                <Field label="Positions Available" required error={errors.positions}>
                  <input
                    type="number"
                    min="1"
                    value={form.positions}
                    onChange={(e) => set("positions", e.target.value)}
                    className={inputClass(!!errors.positions)}
                  />
                </Field>
              </div>

              <Field label="Application Deadline" error={errors.applicationDeadline}>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) => set("applicationDeadline", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputClass(false)}
                />
              </Field>
            </div>
          )}

          {/* Step 2 — Job Content */}
          {!success && step === 2 && (
            <div className="space-y-5">
              <SectionHeader title="Job Content" subtitle="The full job description, responsibilities and requirements" />

              <Field label="Job Description" required error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the role, team, company context and what makes this opportunity great…"
                  rows={5}
                  className={inputClass(!!errors.description)}
                />
                <p className="text-xs text-neutral-400 mt-1">{form.description.length} chars (min 50)</p>
              </Field>

              <Field label="Responsibilities" required error={errors.responsibilities}>
                <textarea
                  value={form.responsibilities}
                  onChange={(e) => set("responsibilities", e.target.value)}
                  placeholder="• Lead development of core product features&#10;• Collaborate with cross-functional teams&#10;• Mentor junior engineers…"
                  rows={4}
                  className={inputClass(!!errors.responsibilities)}
                />
              </Field>

              <Field label="Requirements" required error={errors.requirements}>
                <textarea
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  placeholder="• Bachelor's degree in Computer Science or related field&#10;• 3+ years of experience with React&#10;• Strong communication skills…"
                  rows={4}
                  className={inputClass(!!errors.requirements)}
                />
              </Field>

              {/* Required Skills */}
              <Field label="Required Skills" error={errors.requiredSkills}>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("required"); } }}
                    placeholder="Add a skill and press Enter"
                    className={inputClass(false)}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill("required")}
                    className="px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.requiredSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
                        {skill}
                        <button onClick={() => removeSkill("required", skill)} className="hover:text-brand-orange/60">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              {/* Preferred Skills */}
              <Field label="Preferred Skills" error={errors.preferredSkills}>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred"); } }}
                    placeholder="Add a preferred skill and press Enter"
                    className={inputClass(false)}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill("preferred")}
                    className="px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.preferredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.preferredSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium">
                        {skill}
                        <button onClick={() => removeSkill("preferred", skill)} className="hover:text-neutral-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Nice to Have" error={errors.niceToHave}>
                <textarea
                  value={form.niceToHave}
                  onChange={(e) => set("niceToHave", e.target.value)}
                  placeholder="Any additional nice-to-have experience or qualifications…"
                  rows={2}
                  className={inputClass(false)}
                />
              </Field>
            </div>
          )}

          {/* Step 3 — Compensation & Publish */}
          {!success && step === 3 && (
            <div className="space-y-5">
              <SectionHeader title="Compensation & Publishing" subtitle="Salary details, benefits, and publishing settings" />

              {/* Salary disclosure toggle */}
              <Field label="Salary Disclosure" required error={errors.salaryDisclosure}>
                <div className="flex gap-3">
                  {(["range", "undisclosed"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("salaryDisclosure", opt)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        form.salaryDisclosure === opt
                          ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {opt === "range" ? "Show Salary Range" : "Undisclosed"}
                    </button>
                  ))}
                </div>
              </Field>

              {form.salaryDisclosure === "range" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Currency" required error={errors.currency}>
                      <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputClass(false)}>
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </Field>

                    <Field label="Minimum (per month)" required error={errors.salaryMin}>
                      <input
                        type="number"
                        min="0"
                        value={form.salaryMin}
                        onChange={(e) => set("salaryMin", e.target.value)}
                        placeholder="e.g. 50000"
                        className={inputClass(!!errors.salaryMin)}
                      />
                    </Field>

                    <Field label="Maximum (per month)" required error={errors.salaryMax}>
                      <input
                        type="number"
                        min="0"
                        value={form.salaryMax}
                        onChange={(e) => set("salaryMax", e.target.value)}
                        placeholder="e.g. 90000"
                        className={inputClass(!!errors.salaryMax)}
                      />
                    </Field>
                  </div>
                </>
              )}

              <Field label="Benefits" error={errors.benefits}>
                <textarea
                  value={form.benefits}
                  onChange={(e) => set("benefits", e.target.value)}
                  placeholder="Health insurance, annual leave, remote work options, pension, performance bonuses…"
                  rows={3}
                  className={inputClass(false)}
                />
              </Field>

              {/* Divider */}
              <div className="border-t border-neutral-100 pt-5">
                <SectionHeader title="Publishing" subtitle="Control how this job is immediately listed" />

                <div className="flex gap-3 mt-4">
                  {(["published", "draft"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("status", opt)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                        form.status === opt
                          ? opt === "published"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-neutral-400 bg-neutral-50 text-neutral-700"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      <span className="block text-base mb-0.5">{opt === "published" ? "🟢" : "📝"}</span>
                      {opt === "published" ? "Publish Now" : "Save as Draft"}
                      <span className="block text-xs font-normal mt-0.5 opacity-70">
                        {opt === "published" ? "Goes live immediately" : "Employer reviews & publishes"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Note */}
              <Field
                label="Internal Admin Note"
                error={errors.adminNote}
                hint="Optional — only visible to admins. Add context about why this job was posted on behalf of the employer."
              >
                <textarea
                  value={form.adminNote}
                  onChange={(e) => set("adminNote", e.target.value)}
                  placeholder="e.g. Employer requested via support ticket #1234 — urgent senior hire needed…"
                  rows={2}
                  className={inputClass(false)}
                />
              </Field>

              {/* Submit error */}
              {errors._submit && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{errors._submit}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ──────────────────────────────────────────────────── */}
        {!success && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
            <button
              onClick={prev}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-sm font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${
                    step === n ? "w-6 bg-brand-orange" : step > n ? "w-3 bg-brand-orange/50" : "w-3 bg-neutral-200"
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange/90 transition-colors shadow-sm shadow-brand-orange/20"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange/90 transition-colors shadow-sm shadow-brand-orange/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {form.status === "published" ? "Post Job" : "Save Draft"}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-1">
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="text-sm text-neutral-400">{subtitle}</p>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2.5 rounded-lg border text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange ${
    hasError
      ? "border-red-300 bg-red-50"
      : "border-neutral-200 bg-white hover:border-neutral-300"
  }`;
}
