"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  industry: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface ExperienceStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  cvExtras?: any;
}

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Education", "Engineering",
  "Marketing & Advertising", "Sales", "Operations", "Human Resources",
  "Legal", "Consulting", "Manufacturing", "Retail & E-commerce",
  "Hospitality & Tourism", "Agriculture", "Construction", "Media & Communications",
  "NGO / Non-profit", "Government / Public Sector", "Other",
];

const EMPLOYMENT_TYPES = [
  { value: "permanent", label: "Full-time / Permanent" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship / Attachment" },
  { value: "freelance", label: "Freelance / Consultant" },
  { value: "attachment", label: "Industrial Attachment" },
];

function makeId() {
  return Math.random().toString(36).slice(2);
}

function blankEntry(): ExperienceEntry {
  return {
    id: makeId(),
    company: "",
    title: "",
    industry: "",
    employmentType: "permanent",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  };
}

// Month-year picker helpers
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

function MonthYearPicker({
  value,
  onChange,
  label,
  required,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}) {
  // value format: "YYYY-MM"
  const [month, year] = value ? [value.slice(5, 7), value.slice(0, 4)] : ["", ""];
  const update = (m: string, y: string) => {
    if (m && y) onChange(`${y}-${m}`);
    else onChange("");
  };
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-text mb-1">
        {label}{required && " *"}
      </label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => update(e.target.value, year)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange disabled:opacity-50 disabled:bg-neutral-bg-secondary"
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => update(month, e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange disabled:opacity-50 disabled:bg-neutral-bg-secondary"
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function formatDateRange(entry: ExperienceEntry) {
  const fmt = (d: string) => {
    if (!d) return "";
    const [y, m] = d.split("-");
    return `${MONTHS[parseInt(m ?? "0", 10) - 1] || ""} ${y}`;
  };
  const start = fmt(entry.startDate);
  const end = entry.currentlyWorking ? "Present" : fmt(entry.endDate);
  if (!start) return "";
  return `${start} – ${end || "?"}`;
}

interface EntryFormProps {
  entry: ExperienceEntry;
  onChange: (updated: ExperienceEntry) => void;
  onDelete: () => void;
  onDone: () => void;
  isOnly: boolean;
}

function EntryForm({ entry, onChange, onDelete, onDone, isOnly }: EntryFormProps) {
  const set = (field: keyof ExperienceEntry, value: any) =>
    onChange({ ...entry, [field]: value });

  const [formError, setFormError] = useState("");

  const handleDone = () => {
    if (!entry.company.trim()) { setFormError("Company is required"); return; }
    if (!entry.title.trim()) { setFormError("Job title is required"); return; }
    if (!entry.startDate) { setFormError("Start date is required"); return; }
    if (!entry.currentlyWorking && !entry.endDate) { setFormError("End date is required (or tick 'I currently work here')"); return; }
    setFormError("");
    onDone();
  };

  return (
    <div className="border border-brand-orange/30 rounded-lg p-4 space-y-3 bg-brand-orange/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Company *</label>
          <input
            type="text"
            value={entry.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="e.g. Safaricom PLC"
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Job Title *</label>
          <input
            type="text"
            value={entry.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Employment Type</label>
          <select
            value={entry.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Industry</label>
          <select
            value={entry.industry}
            onChange={(e) => set("industry", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MonthYearPicker
          label="Start Date"
          value={entry.startDate}
          onChange={(v) => set("startDate", v)}
          required
        />
        <MonthYearPicker
          label="End Date"
          value={entry.endDate}
          onChange={(v) => set("endDate", v)}
          disabled={entry.currentlyWorking}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={entry.currentlyWorking}
          onChange={(e) => {
            set("currentlyWorking", e.target.checked);
            if (e.target.checked) set("endDate", "");
          }}
          className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
        />
        <span className="text-sm text-neutral-text">I currently work here</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Description <span className="text-neutral-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={entry.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Key responsibilities and achievements..."
          className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
        />
      </div>

      {formError && (
        <p className="text-sm text-red-600">{formError}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        {!isOnly ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        ) : <div />}
        <button
          type="button"
          onClick={handleDone}
          className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function ExperienceStep({ onDataChange, initialData, cvExtras }: ExperienceStepProps) {
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    // Prefer manually entered data if re-visiting the step
    if (initialData?.entries?.length) {
      setEntries(initialData.entries);
      return;
    }

    // Pre-fill from CV parser output
    const cvWork: any[] = cvExtras?.workExperience || [];
    if (cvWork.length > 0) {
      const prefilled = cvWork
        .filter((e) => e.company || e.title)
        .map((e) => ({
          id: makeId(),
          company: e.company || "",
          title: e.title || "",
          industry: e.industry || "",
          employmentType: e.employmentType || "permanent",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          currentlyWorking: e.currentlyWorking || false,
          description: e.description || "",
        }));
      setEntries(prefilled);
    }
  }, [initialData, cvExtras, initialized]);

  const notify = (updated: ExperienceEntry[]) => {
    onDataChange({ entries: updated });
  };

  const addNew = () => {
    const entry = blankEntry();
    const updated = [...entries, entry];
    setEntries(updated);
    setOpenId(entry.id);
    notify(updated);
  };

  const update = (id: string, updated: ExperienceEntry) => {
    const list = entries.map((e) => (e.id === id ? updated : e));
    setEntries(list);
    notify(list);
  };

  const remove = (id: string) => {
    const list = entries.filter((e) => e.id !== id);
    setEntries(list);
    if (openId === id) setOpenId(null);
    notify(list);
  };

  return (
    <div className="space-y-4">
      {/* Hint banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>Optional</strong> — Add your work history so employers can see your experience right away. You can always update this later from your profile.
      </div>

      {/* Entry cards */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) =>
            openId === entry.id ? (
              <EntryForm
                key={entry.id}
                entry={entry}
                onChange={(updated) => update(entry.id, updated)}
                onDelete={() => remove(entry.id)}
                onDone={() => setOpenId(null)}
                isOnly={entries.length === 1}
              />
            ) : (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-3 p-4 bg-white border border-neutral-border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-text truncate">
                      {entry.title || <span className="text-neutral-text-muted">Untitled</span>}
                    </p>
                    <p className="text-sm text-neutral-text-secondary truncate">
                      {entry.company || <span className="text-neutral-text-muted">No company</span>}
                    </p>
                    <p className="text-xs text-neutral-text-muted">{formatDateRange(entry)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(entry.id)}
                    className="p-1.5 text-neutral-text-muted hover:text-brand-orange transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="p-1.5 text-neutral-text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border-2 border-dashed border-neutral-border rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6 text-neutral-text-muted" />
          </div>
          <p className="text-sm font-medium text-neutral-text mb-1">No experience added yet</p>
          <p className="text-xs text-neutral-text-muted mb-4">Add your work history to stand out to employers</p>
        </div>
      )}

      {/* Add button — only show if no form is open */}
      {openId === null && (
        <button
          type="button"
          onClick={addNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-brand-orange/40 text-brand-orange text-sm font-medium rounded-lg hover:bg-brand-orange/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Work Experience
        </button>
      )}
    </div>
  );
}
