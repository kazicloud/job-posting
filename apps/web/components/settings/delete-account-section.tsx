"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { AlertTriangle, Trash2, X } from "lucide-react";

const CONFIRMATION_PHRASE = "delete my account";

export function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const { signOut } = useClerk();

  const isConfirmed = confirmText.toLowerCase() === CONFIRMATION_PHRASE;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete your account. Please try again or contact support.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-red-600 mb-1">
              Danger Zone
            </h2>
            <p className="text-sm text-neutral-text-secondary mb-4">
              Once you delete your account, there is no going back. All your data, profile
              information, applications, and saved jobs will be permanently removed.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* GitHub-style confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-text">
                  Are you absolutely sure?
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                }}
                className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
                <p className="text-sm text-red-800">
                  This action <strong>cannot be undone</strong>. This will permanently delete your
                  account, profile, all applications, saved jobs, and remove all your data from
                  Kazicloud.
                </p>
              </div>

              <label className="block">
                <span className="text-sm text-neutral-text">
                  To confirm, type{" "}
                  <span className="font-semibold text-neutral-text bg-neutral-bg-secondary px-1.5 py-0.5 rounded font-mono text-xs">
                    {CONFIRMATION_PHRASE}
                  </span>{" "}
                  below:
                </span>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRMATION_PHRASE}
                  className="mt-2 w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-border bg-neutral-bg-secondary rounded-b-lg">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                }}
                className="px-4 py-2 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete my account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
