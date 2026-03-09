"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  companyName: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function RejectionModal({ isOpen, companyName, onClose, onConfirm }: RejectionModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(reason.trim() || undefined);
    setReason("");
  };

  const handleSkip = () => {
    onConfirm(undefined);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <h3 className="text-lg font-semibold text-neutral-text">
            Reject Verification
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-neutral-text-secondary mb-4">
            You are about to reject the verification for <strong>{companyName}</strong>.
          </p>

          <label className="block mb-2">
            <span className="text-sm font-medium text-neutral-text">
              Reason for Rejection <span className="text-neutral-text-muted">(Optional)</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Incomplete verification documents, Company information could not be verified..."
              className="mt-2 w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
              rows={4}
            />
          </label>

          <p className="text-xs text-neutral-text-muted mt-2">
            This reason will be included in the rejection email sent to the employer.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-border bg-neutral-bg-secondary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-text-secondary hover:text-neutral-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-neutral-text hover:bg-gray-100 rounded-lg transition-colors"
          >
            Skip & Reject
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Reject with Reason
          </button>
        </div>
      </div>
    </div>
  );
}
