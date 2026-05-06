"use client";

import { useState, useEffect } from "react";
import { Plus, GraduationCap, Trash2, Edit2 } from "lucide-react";

export interface EducationEntry {
  id: string;
  institution: string;
  qualificationLevel: string;
  certificateType: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade: string;
  currentlyStudying: boolean;
}

interface EducationStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  cvExtras?: any;
}

const QUALIFICATION_LEVELS = [
  { value: "phd", label: "PhD / Doctorate" },
  { value: "masters", label: "Master's Degree" },
  { value: "degree", label: "Bachelor's Degree" },
  { value: "diploma", label: "Diploma" },
  { value: "certificate", label: "Certificate" },
  { value: "tvet", label: "TVET / Vocational" },
];

const CERTIFICATE_TYPES = [
  "Polytechnic Certificate",
  "Bootcamp Certificate",
  "Professional Certificate",
  "Online Course Certificate",
  "Short Course Certificate",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => String(currentYear + 5 - i));

function makeId() {
  return Math.random().toString(36).slice(2);
}

function blankEntry(): EducationEntry {
  return {
    id: makeId(),
    institution: "",
    qualificationLevel: "degree",
    certificateType: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    grade: "",
    currentlyStudying: false,
  };
}

function formatEduRange(entry: EducationEntry) {
  const end = entry.currentlyStudying ? "Present" : entry.endYear || "?";
  if (!entry.startYear) return "";
  return `${entry.startYear} – ${end}`;
}

function qualLabel(val: string) {
  return QUALIFICATION_LEVELS.find((q) => q.value === val)?.label || val;
}

interface EntryFormProps {
  entry: EducationEntry;
  onChange: (updated: EducationEntry) => void;
  onDelete: () => void;
  onDone: () => void;
  isOnly: boolean;
}

function EntryForm({ entry, onChange, onDelete, onDone, isOnly }: EntryFormProps) {
  const set = (field: keyof EducationEntry, value: any) =>
    onChange({ ...entry, [field]: value });

  const [formError, setFormError] = useState("");

  const handleDone = () => {
    if (!entry.institution.trim()) { setFormError("Institution is required"); return; }
    if (!entry.fieldOfStudy.trim()) { setFormError("Field of study is required"); return; }
    if (!entry.startYear) { setFormError("Start year is required"); return; }
    if (!entry.currentlyStudying && !entry.endYear) { setFormError("End year is required (or tick 'Currently studying here')"); return; }
    setFormError("");
    onDone();
  };

  return (
    <div className="border border-brand-orange/30 rounded-lg p-4 space-y-3 bg-brand-orange/5">
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">Institution *</label>
        <input
          type="text"
          value={entry.institution}
          onChange={(e) => set("institution", e.target.value)}
          placeholder="e.g. University of Nairobi"
          className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Qualification Level *</label>
          <select
            value={entry.qualificationLevel}
            onChange={(e) => set("qualificationLevel", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            {QUALIFICATION_LEVELS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">
            Field of Study *
          </label>
          <input
            type="text"
            value={entry.fieldOfStudy}
            onChange={(e) => set("fieldOfStudy", e.target.value)}
            placeholder="e.g. Computer Science"
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
      </div>

      {entry.qualificationLevel === "certificate" && (
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Certificate Type</label>
          <select
            value={entry.certificateType}
            onChange={(e) => set("certificateType", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            <option value="">Select type</option>
            {CERTIFICATE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Start Year *</label>
          <select
            value={entry.startYear}
            onChange={(e) => set("startYear", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">End Year</label>
          <select
            value={entry.endYear}
            onChange={(e) => set("endYear", e.target.value)}
            disabled={entry.currentlyStudying}
            className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange disabled:opacity-50 disabled:bg-neutral-bg-secondary"
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={entry.currentlyStudying}
          onChange={(e) => {
            set("currentlyStudying", e.target.checked);
            if (e.target.checked) set("endYear", "");
          }}
          className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
        />
        <span className="text-sm text-neutral-text">I currently study here</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Grade / GPA <span className="text-neutral-text-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={entry.grade}
          onChange={(e) => set("grade", e.target.value)}
          placeholder="e.g. First Class, 3.8 GPA, Pass"
          className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
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

export function EducationStep({ onDataChange, initialData, cvExtras }: EducationStepProps) {
  const [entries, setEntries] = useState<EducationEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (initialData?.entries?.length) {
      setEntries(initialData.entries);
      return;
    }

    const cvEdu: any[] = cvExtras?.education || [];
    if (cvEdu.length > 0) {
      const prefilled = cvEdu
        .filter((e) => e.institution || e.fieldOfStudy)
        .map((e) => ({
          id: makeId(),
          institution: e.institution || "",
          qualificationLevel: e.qualificationLevel || "degree",
          certificateType: e.certificateType || "",
          fieldOfStudy: e.fieldOfStudy || "",
          startYear: e.startYear || "",
          endYear: e.endYear || "",
          grade: e.grade || "",
          currentlyStudying: false,
        }));
      setEntries(prefilled);
    }
  }, [initialData, cvExtras, initialized]);

  const notify = (updated: EducationEntry[]) => {
    onDataChange({ entries: updated });
  };

  const addNew = () => {
    const entry = blankEntry();
    const updated = [...entries, entry];
    setEntries(updated);
    setOpenId(entry.id);
    notify(updated);
  };

  const update = (id: string, updated: EducationEntry) => {
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
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>Optional</strong> — Add your educational background. You can skip this and fill it in later from your profile.
      </div>

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
                    <GraduationCap className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-text truncate">
                      {entry.fieldOfStudy || <span className="text-neutral-text-muted">No field</span>}
                    </p>
                    <p className="text-sm text-neutral-text-secondary truncate">
                      {entry.institution || <span className="text-neutral-text-muted">No institution</span>}
                    </p>
                    <p className="text-xs text-neutral-text-muted">
                      {qualLabel(entry.qualificationLevel)}
                      {formatEduRange(entry) ? ` · ${formatEduRange(entry)}` : ""}
                    </p>
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

      {entries.length === 0 && (
        <div className="border-2 border-dashed border-neutral-border rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6 text-neutral-text-muted" />
          </div>
          <p className="text-sm font-medium text-neutral-text mb-1">No education added yet</p>
          <p className="text-xs text-neutral-text-muted mb-4">Add your academic background to build your profile</p>
        </div>
      )}

      {openId === null && (
        <button
          type="button"
          onClick={addNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-brand-orange/40 text-brand-orange text-sm font-medium rounded-lg hover:bg-brand-orange/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      )}
    </div>
  );
}
