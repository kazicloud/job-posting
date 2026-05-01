"use client";

import { Share2, X } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ── Brand SVG icons ──────────────────────────────────────────────────────────

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export function ShareButton({ jobId, jobTitle, jobSlug, className }: { 
  jobId: Id<"jobs">; 
  jobTitle: string;
  jobSlug?: string;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackShare = useMutation(api.analytics.trackShare);

  const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://kazicloud.com";
  const shareUrl = jobSlug
    ? `${MARKETING_URL}/job/${jobSlug}`
    : `${MARKETING_URL}/jobs`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    await trackShare({ jobId, platform: "copy_link" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: string, url: string) => {
    await trackShare({ jobId, platform });
    window.open(url, "_blank", "width=600,height=400");
    setShowModal(false);
  };

  const shareOptions = [
    {
      name: "LinkedIn",
      Icon: LinkedInIcon,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      platform: "linkedin",
      bg: "bg-[#0A66C2] hover:bg-[#004182]",
      fg: "text-white",
    },
    {
      name: "WhatsApp",
      Icon: WhatsAppIcon,
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this job: ${jobTitle} - ${shareUrl}`)}`,
      platform: "whatsapp",
      bg: "bg-[#25D366] hover:bg-[#128C7E]",
      fg: "text-white",
    },
    {
      name: "X",
      Icon: XIcon,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job: ${jobTitle}`)}&url=${encodeURIComponent(shareUrl)}`,
      platform: "twitter",
      bg: "bg-black hover:bg-neutral-800",
      fg: "text-white",
    },
    {
      name: "Email",
      Icon: EmailIcon,
      url: `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${jobTitle}`)}&body=${encodeURIComponent(`I found this job that might interest you:\n\n${jobTitle}\n\n${shareUrl}`)}`,
      platform: "email",
      bg: "bg-gray-100 hover:bg-gray-200",
      fg: "text-gray-700",
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || "p-2 hover:bg-neutral-bg-secondary rounded-lg transition-colors"}
        title="Share job"
      >
        <Share2 className="w-5 h-5 text-neutral-text-secondary" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-text">Share this job</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-neutral-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-text-secondary" />
              </button>
            </div>

            {/* Job title preview */}
            <p className="text-sm text-neutral-text-secondary mb-5 line-clamp-2 leading-snug">
              {jobTitle}
            </p>

            {/* Social icons — horizontal row */}
            <div className="flex items-center justify-between gap-3 mb-6">
              {shareOptions.map(({ name, Icon, url, platform, bg, fg }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform, url)}
                  title={`Share on ${name}`}
                  className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-xl transition-colors ${bg}`}
                >
                  <Icon className={`w-5 h-5 ${fg}`} />
                  <span className={`text-[10px] font-medium ${fg}`}>{name}</span>
                </button>
              ))}
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-xs text-neutral-text-secondary outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-brand-orange text-white text-xs font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
