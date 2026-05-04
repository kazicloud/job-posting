"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  DollarSign,
  Eye,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Info,
} from "lucide-react";

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

const steps = [
  { number: 1, title: "Role Details",   icon: Briefcase  },
  { number: 2, title: "Job Content",    icon: FileText   },
  { number: 3, title: "Compensation",   icon: DollarSign },
  { number: 4, title: "Preview",        icon: Eye        },
];

// ─── Default form state ────────────────────────────────────────────────────────

const defaultForm = {
  title: "",
  department: "",
  employmentType: "",
  workplaceType: "",
  location: "",
  county: "",
  positions: "1",
  experienceLevel: "",
  applicationDeadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
  requiredSkills:   [] as string[],
  preferredSkills:  [] as string[],
  niceToHave: "",
  salaryDisclosure: "range" as "range" | "undisclosed",
  salaryMin: "",
  salaryMax: "",
  currency: "KES",
  benefits: "",
  status: "published" as "draft" | "published",
  adminNote: "",
};

type FormData = typeof defaultForm;
type Errors   = Record<string, string>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPostJobPage() {
  const params   = useParams();
  const router   = useRouter();
  const employerId = params.id as Id<"users">;

  const employer = useQuery(api.admin.getEmployerDetails, { userId: employerId });
  const adminPostJob = useMutation(api.admin.adminPostJobOnBehalf);

  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>(defaultForm);
  const [errors, setErrors]       = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");

  const companyName = employer?.profile?.companyName ?? "";

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const set = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addSkill = (type: "req" | "pref") => {
    const raw    = type === "req" ? skillInput.trim() : prefSkillInput.trim();
    const key    = type === "req" ? "requiredSkills"  : "preferredSkills";
    const setter = type === "req" ? setSkillInput      : setPrefSkillInput;
    if (!raw || (form[key] as string[]).includes(raw)) { setter(""); return; }
    set(key as keyof FormData, [...(form[key] as string[]), raw]);
    setter("");
  };

  const removeSkill = (type: "req" | "pref", skill: string) => {
    const key = type === "req" ? "requiredSkills" : "preferredSkills";
    set(key as keyof FormData, (form[key] as string[]).filter((s) => s !== skill));
  };

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = (s: number): boolean => {
    const errs: Errors = {};
    if (s === 1) {
      if (!form.title.trim())          errs.title          = "Job title is required";
      if (!form.employmentType)        errs.employmentType = "Employment type is required";
      if (!form.workplaceType)         errs.workplaceType  = "Workplace type is required";
      if (!form.location.trim())       errs.location       = "Location is required";
      if (!form.experienceLevel)       errs.experienceLevel = "Experience level is required";
      const p = parseInt(form.positions);
      if (isNaN(p) || p < 1)          errs.positions      = "Must be at least 1";
    }
    if (s === 2) {
      if (form.description.trim().length < 50)     errs.description     = "Minimum 50 characters";
      if (form.responsibilities.trim().length < 20) errs.responsibilities = "Responsibilities are required";
      if (form.requirements.trim().length < 20)     errs.requirements    = "Requirements are required";
    }
    if (s === 3) {
      if (form.salaryDisclosure === "range") {
        const mn = parseFloat(form.salaryMin), mx = parseFloat(form.salaryMax);
        if (!form.salaryMin || isNaN(mn)) errs.salaryMin = "Enter a valid minimum";
        if (!form.salaryMax || isNaN(mx)) errs.salaryMax = "Enter a valid maximum";
        if (!isNaN(mn) && !isNaN(mx) && mx < mn) errs.salaryMax = "Max must be ≥ min";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => Math.min(s + 1, 4)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await adminPostJob({
        employerId,
        title:            form.title.trim(),
        companyName,
        department:       form.department   || undefined,
        employmentType:   form.employmentType,
        workplaceType:    form.workplaceType,
        location:         form.location.trim(),
        county:           form.county       || undefined,
        description:      form.description.trim(),
        responsibilities: form.responsibilities.trim(),
        requirements:     form.requirements.trim(),
        requiredSkills:   form.requiredSkills.length  ? form.requiredSkills  : undefined,
        preferredSkills:  form.preferredSkills.length ? form.preferredSkills : undefined,
        niceToHave:       form.niceToHave.trim()      || undefined,
        salaryDisclosure: form.salaryDisclosure,
        salaryMin:        form.salaryDisclosure === "range" && form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax:        form.salaryDisclosure === "range" && form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        currency:         form.salaryDisclosure === "range" ? form.currency : undefined,
        benefits:         form.benefits.trim() || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        positions:        parseInt(form.positions) || 1,
        experienceLevel:  form.experienceLevel,
        status:           form.status,
        adminNote:        form.adminNote.trim() || undefined,
      });
      router.push(`/employers/${employerId}`);
    } catch (err: any) {
      setErrors({ _submit: err?.message ?? "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (!employer) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/employers/${employerId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {companyName}
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-neutral-text">Post Job on Behalf</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                <Info className="w-3 h-3" />
                Admin Action
              </span>
            </div>
            <p className="text-neutral-text-secondary">
              Posting for{" "}
              <span className="font-semibold text-neutral-text">{companyName}</span>{" "}
              — job will appear in their dashboard and be attributed to their account.
            </p>
          </div>
        </div>
      </div>

      {/* Step progress — desktop */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.number;
          const isDone   = step > s.number;
          return (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isDone   ? "bg-green-500 text-white" :
                  isActive ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30" :
                             "bg-neutral-200 text-neutral-400"
                }`}>
                  {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? "text-neutral-text" : isDone ? "text-neutral-text-secondary" : "text-neutral-text-muted"
                }`}>{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 mb-5 rounded-full transition-all ${isDone ? "bg-green-400" : "bg-neutral-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step progress — mobile */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center">
            {(() => { const Icon = steps[step - 1]?.icon; return Icon ? <Icon className="w-4 h-4" /> : null; })()}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-text">{steps[step - 1]?.title}</p>
            <p className="text-xs text-neutral-text-muted">Step {step} of {steps.length}</p>
          </div>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-1.5">
          <div className="bg-brand-orange h-1.5 rounded-full transition-all" style={{ width: `${(step / steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border border-neutral-border rounded-xl p-6 lg:p-8">

        {/* ── Step 1: Role Details ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <StepHeader title="Role Details" subtitle="Basic information about the position" />

            <Field label="Job Title" required error={errors.title}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={input(!!errors.title)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Department" error={errors.department}>
                <select value={form.department} onChange={(e) => set("department", e.target.value)} className={input(false)}>
                  <option value="">Select department (optional)</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Positions Available" required error={errors.positions}>
                <input type="number" min="1" value={form.positions} onChange={(e) => set("positions", e.target.value)} className={input(!!errors.positions)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Employment Type" required error={errors.employmentType}>
                <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={input(!!errors.employmentType)}>
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Workplace Type" required error={errors.workplaceType}>
                <select value={form.workplaceType} onChange={(e) => set("workplaceType", e.target.value)} className={input(!!errors.workplaceType)}>
                  <option value="">Select type</option>
                  {WORKPLACE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Location (City / Area)" required error={errors.location}>
                <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Nairobi CBD" className={input(!!errors.location)} />
              </Field>
              <Field label="County" error={errors.county}>
                <select value={form.county} onChange={(e) => set("county", e.target.value)} className={input(false)}>
                  <option value="">Select county</option>
                  {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Experience Level" required error={errors.experienceLevel}>
                <select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} className={input(!!errors.experienceLevel)}>
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <Field label="Application Deadline" error={errors.applicationDeadline}>
                <input type="date" value={form.applicationDeadline} onChange={(e) => set("applicationDeadline", e.target.value)} min={new Date().toISOString().split("T")[0]} className={input(false)} />
              </Field>
            </div>

            <StepActions onNext={next} />
          </div>
        )}

        {/* ── Step 2: Job Content ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <StepHeader title="Job Content" subtitle="Full description, responsibilities and requirements" />

            <Field label="Job Description" required error={errors.description}>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the role, team context and what makes this opportunity compelling…"
                rows={6} className={input(!!errors.description)} />
              <p className="text-xs text-neutral-text-muted mt-1">{form.description.length} chars (min 50)</p>
            </Field>

            <Field label="Responsibilities" required error={errors.responsibilities}>
              <textarea value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)}
                placeholder="• Lead development of core product features&#10;• Collaborate with cross-functional teams…"
                rows={5} className={input(!!errors.responsibilities)} />
            </Field>

            <Field label="Requirements" required error={errors.requirements}>
              <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)}
                placeholder="• Bachelor's degree in Computer Science or related&#10;• 3+ years experience with React…"
                rows={5} className={input(!!errors.requirements)} />
            </Field>

            <Field label="Required Skills" error={errors.requiredSkills}>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("req"); }}}
                  placeholder="Add a skill and press Enter" className={input(false)} />
                <button type="button" onClick={() => addSkill("req")} className="px-3 py-2.5 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary text-neutral-text-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.requiredSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
                      {s}
                      <button onClick={() => removeSkill("req", s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Preferred Skills" error={errors.preferredSkills}>
              <div className="flex gap-2 mb-2">
                <input type="text" value={prefSkillInput} onChange={(e) => setPrefSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("pref"); }}}
                  placeholder="Add a preferred skill and press Enter" className={input(false)} />
                <button type="button" onClick={() => addSkill("pref")} className="px-3 py-2.5 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary text-neutral-text-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.preferredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.preferredSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-bg-secondary text-neutral-text-secondary text-sm font-medium">
                      {s}
                      <button onClick={() => removeSkill("pref", s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Nice to Have" error={errors.niceToHave}>
              <textarea value={form.niceToHave} onChange={(e) => set("niceToHave", e.target.value)}
                placeholder="Any additional nice-to-have qualifications…" rows={3} className={input(false)} />
            </Field>

            <StepActions onNext={next} onBack={prev} />
          </div>
        )}

        {/* ── Step 3: Compensation ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <StepHeader title="Compensation & Publishing" subtitle="Salary range, benefits and how to publish this job" />

            <Field label="Salary Disclosure" required error={errors.salaryDisclosure}>
              <div className="flex gap-3">
                {(["range", "undisclosed"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => set("salaryDisclosure", opt)}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                      form.salaryDisclosure === opt
                        ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                        : "border-neutral-border text-neutral-text-secondary hover:border-neutral-400"
                    }`}>
                    {opt === "range" ? "Show Salary Range" : "Undisclosed"}
                  </button>
                ))}
              </div>
            </Field>

            {form.salaryDisclosure === "range" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Currency" required error={errors.currency}>
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={input(false)}>
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </Field>
                <Field label="Min (per month)" required error={errors.salaryMin}>
                  <input type="number" min="0" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="e.g. 50000" className={input(!!errors.salaryMin)} />
                </Field>
                <Field label="Max (per month)" required error={errors.salaryMax}>
                  <input type="number" min="0" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="e.g. 90000" className={input(!!errors.salaryMax)} />
                </Field>
              </div>
            )}

            <Field label="Benefits" error={errors.benefits}>
              <textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)}
                placeholder="Health insurance, annual leave, pension, bonuses…" rows={3} className={input(false)} />
            </Field>

            <div className="border-t border-neutral-border pt-6">
              <p className="text-sm font-semibold text-neutral-text mb-3">Publishing</p>
              <div className="flex gap-3">
                {(["published", "draft"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => set("status", opt)}
                    className={`flex-1 py-4 rounded-xl border text-sm font-medium transition-all ${
                      form.status === opt
                        ? opt === "published"
                          ? "border-green-400 bg-green-50 text-green-700"
                          : "border-neutral-400 bg-neutral-50 text-neutral-700"
                        : "border-neutral-border text-neutral-text-muted hover:border-neutral-300"
                    }`}>
                    <span className="block text-xl mb-1">{opt === "published" ? "🟢" : "📝"}</span>
                    {opt === "published" ? "Publish Now" : "Save as Draft"}
                    <span className="block text-xs font-normal mt-0.5 opacity-70">
                      {opt === "published" ? "Goes live immediately" : "Employer reviews & publishes"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Internal Admin Note"
              hint="Optional — only visible to admins. Add context about why this job was posted on behalf of the employer."
              error={errors.adminNote}>
              <textarea value={form.adminNote} onChange={(e) => set("adminNote", e.target.value)}
                placeholder="e.g. Employer requested via support ticket #1234…" rows={2} className={input(false)} />
            </Field>

            <StepActions onNext={next} onBack={prev} nextLabel="Preview" />
          </div>
        )}

        {/* ── Step 4: Preview ──────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <StepHeader title="Preview & Confirm" subtitle="Review the job before posting — this is what candidates will see" />

            {/* Preview card */}
            <div className="border border-neutral-border rounded-xl overflow-hidden">
              {/* Header band */}
              <div className="bg-neutral-bg-secondary px-6 py-5 border-b border-neutral-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-text">{form.title}</h3>
                    <p className="text-neutral-text-secondary mt-0.5">{companyName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {form.location && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-neutral-border text-xs text-neutral-text-secondary">
                          📍 {form.location}{form.county ? `, ${form.county}` : ""}
                        </span>
                      )}
                      {form.employmentType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-neutral-border text-xs text-neutral-text-secondary capitalize">
                          {form.employmentType.replace("_", " ")}
                        </span>
                      )}
                      {form.workplaceType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-neutral-border text-xs text-neutral-text-secondary capitalize">
                          {form.workplaceType.replace("_", " ")}
                        </span>
                      )}
                      {form.experienceLevel && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-neutral-border text-xs text-neutral-text-secondary capitalize">
                          {EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {form.salaryDisclosure === "range" && form.salaryMin && form.salaryMax ? (
                      <p className="text-sm font-semibold text-neutral-text">
                        {form.currency} {Number(form.salaryMin).toLocaleString()} – {Number(form.salaryMax).toLocaleString()}
                        <span className="text-xs font-normal text-neutral-text-muted"> /mo</span>
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-text-muted">Salary undisclosed</p>
                    )}
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      form.status === "published" ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                    }`}>
                      {form.status === "published" ? "Will go live" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {form.description && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-text mb-2">About this role</p>
                    <p className="text-sm text-neutral-text-secondary whitespace-pre-line">{form.description}</p>
                  </div>
                )}
                {form.responsibilities && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-text mb-2">Responsibilities</p>
                    <p className="text-sm text-neutral-text-secondary whitespace-pre-line">{form.responsibilities}</p>
                  </div>
                )}
                {form.requirements && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-text mb-2">Requirements</p>
                    <p className="text-sm text-neutral-text-secondary whitespace-pre-line">{form.requirements}</p>
                  </div>
                )}
                {form.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-text mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {form.requiredSkills.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {form.benefits && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-text mb-2">Benefits</p>
                    <p className="text-sm text-neutral-text-secondary">{form.benefits}</p>
                  </div>
                )}
              </div>

              {/* Admin note */}
              {form.adminNote && (
                <div className="px-6 py-4 bg-purple-50 border-t border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Internal Admin Note</p>
                  <p className="text-xs text-purple-600">{form.adminNote}</p>
                </div>
              )}
            </div>

            {/* Submit error */}
            {errors._submit && (
              <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{errors._submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button onClick={prev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-border text-neutral-text-secondary text-sm font-medium hover:bg-neutral-bg-secondary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange/90 transition-colors shadow-md shadow-brand-orange/20 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> {form.status === "published" ? "Post Job" : "Save as Draft"}</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold text-neutral-text">{title}</h2>
      <p className="text-sm text-neutral-text-secondary">{subtitle}</p>
    </div>
  );
}

interface FieldProps { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode; }
function Field({ label, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-text mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-text-muted mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

interface StepActionsProps { onNext: () => void; onBack?: () => void; nextLabel?: string; }
function StepActions({ onNext, onBack, nextLabel = "Next" }: StepActionsProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
      {onBack ? (
        <button onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-border text-neutral-text-secondary text-sm font-medium hover:bg-neutral-bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
      ) : <div />}
      <button onClick={onNext}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange/90 transition-colors shadow-sm shadow-brand-orange/20">
        {nextLabel}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-lg border text-sm text-neutral-text placeholder:text-neutral-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
    hasError ? "border-red-300 bg-red-50" : "border-neutral-border bg-white hover:border-neutral-400"
  }`;
}
