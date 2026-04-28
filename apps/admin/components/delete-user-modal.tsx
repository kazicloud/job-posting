"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  userType: "employer" | "job_seeker";
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function DeleteUserModal({
  isOpen,
  userName,
  userEmail,
  userType,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const label = userType === "employer" ? "employer" : "job seeker";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-text">Delete User Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action is permanent and cannot be undone. All data
              associated with this {label} will be permanently deleted.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-neutral-text-secondary">
              You are about to delete the account for:
            </p>
            <p className="font-semibold text-neutral-text mt-1">{userName}</p>
            <p className="text-sm text-neutral-text-secondary">{userEmail}</p>
          </div>

          <label className="block mb-2">
            <span className="text-sm font-medium text-neutral-text">
              Reason for Deletion <span className="text-red-500">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a professional explanation for removing this account. This message will be sent to the user via email..."
              className="mt-2 w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
              rows={5}
            />
          </label>

          <p className="text-xs text-neutral-text-muted mt-2">
            This message will be sent to the user at <strong>{userEmail}</strong> from noreply@kazicloud.co.ke.
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
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account & Notify User
          </button>
        </div>
      </div>
    </div>
  );
}
