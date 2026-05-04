"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Video, Phone, User, FileText } from "lucide-react";

export interface InterviewDetails {
  date: string;
  time: string;
  format: "in-person" | "virtual" | "phone";
  location?: string;
  meetingLink?: string;
  interviewerName?: string;
  additionalNotes?: string;
}

interface InterviewModalProps {
  isOpen: boolean;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onConfirm: (details: InterviewDetails) => void;
  isLoading?: boolean;
}

const formatOptions = [
  { value: "in-person", label: "In-Person", icon: MapPin, description: "Candidate visits your office" },
  { value: "virtual", label: "Video Call", icon: Video, description: "Online meeting (Zoom, Meet, Teams)" },
  { value: "phone", label: "Phone Call", icon: Phone, description: "Standard phone interview" },
] as const;

export function InterviewModal({
  isOpen,
  candidateName,
  jobTitle,
  onClose,
  onConfirm,
  isLoading = false,
}: InterviewModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [details, setDetails] = useState<InterviewDetails>({
    date: "",
    time: "",
    format: "virtual",
    location: "",
    meetingLink: "",
    interviewerName: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InterviewDetails, string>>>({});

  if (!isOpen) return null;

  const set = (field: keyof InterviewDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!details.date) e.date = "Please select a date";
    if (!details.time) e.time = "Please select a time";
    if (details.format === "in-person" && !details.location?.trim()) e.location = "Please enter the interview location";
    if (details.format === "virtual" && !details.meetingLink?.trim()) e.meetingLink = "Please enter a meeting link";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const clean: InterviewDetails = {
      date: details.date,
      time: details.time,
      format: details.format,
      ...(details.format === "in-person" && { location: details.location }),
      ...(details.format === "virtual" && { meetingLink: details.meetingLink }),
      ...(details.interviewerName?.trim() && { interviewerName: details.interviewerName }),
      ...(details.additionalNotes?.trim() && { additionalNotes: details.additionalNotes }),
    };
    onConfirm(clean);
  };

  const handleClose = () => {
    if (isLoading) return;
    setErrors({});
    onClose();
  };

  const selectedFormat = formatOptions.find((f) => f.value === details.format)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {candidateName} &middot; <span className="text-gray-700">{jobTitle}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Interview Format</label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((f) => {
                const Icon = f.icon;
                const isSelected = details.format === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => set("format", f.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? "border-[#DC842C] bg-orange-50 text-[#DC842C]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-600">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </span>
              </label>
              <input
                type="date"
                min={today}
                value={details.date}
                onChange={(e) => set("date", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors ${
                  errors.date ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Time
                </span>
              </label>
              <input
                type="time"
                value={details.time}
                onChange={(e) => set("time", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors ${
                  errors.time ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* Location / Meeting Link */}
          {details.format === "in-person" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Interview Location
                </span>
              </label>
              <input
                type="text"
                value={details.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. ABC Building, 3rd Floor, Westlands, Nairobi"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors ${
                  errors.location ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
            </div>
          )}

          {details.format === "virtual" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Meeting Link
                </span>
              </label>
              <input
                type="url"
                value={details.meetingLink}
                onChange={(e) => set("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors ${
                  errors.meetingLink ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.meetingLink && <p className="mt-1 text-xs text-red-500">{errors.meetingLink}</p>}
            </div>
          )}

          {/* Interviewer Name (optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Interviewer Name{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            </label>
            <input
              type="text"
              value={details.interviewerName}
              onChange={(e) => set("interviewerName", e.target.value)}
              placeholder="e.g. Jane Mwangi, HR Manager"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors"
            />
          </div>

          {/* Additional Notes (optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes to Candidate{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            </label>
            <textarea
              value={details.additionalNotes}
              onChange={(e) => set("additionalNotes", e.target.value)}
              placeholder="e.g. Please bring your ID and portfolio. The interview will be 45 minutes long."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC842C]/20 focus:border-[#DC842C] transition-colors resize-none"
            />
          </div>

          {/* Email notice */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2.5">
            <span className="text-base">📧</span>
            <p className="text-xs text-gray-600 leading-relaxed">
              The candidate will receive a professional email with all these interview details as soon as you confirm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#DC842C] rounded-xl hover:bg-[#c67525] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scheduling...
              </>
            ) : (
              "Schedule Interview"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
