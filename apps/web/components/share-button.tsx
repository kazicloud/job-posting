"use client";

import { Share2, Link as LinkIcon, Mail, X, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function ShareButton({ jobId, jobTitle, className }: { 
  jobId: Id<"jobs">; 
  jobTitle: string;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackShare = useMutation(api.analytics.trackShare);

  const shareUrl = `${window.location.origin}/jobs/${jobId}`;

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
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      platform: "linkedin",
      color: "text-blue-600"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this job: ${jobTitle} - ${shareUrl}`)}`,
      platform: "whatsapp",
      color: "text-green-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job: ${jobTitle}`)}&url=${encodeURIComponent(shareUrl)}`,
      platform: "twitter",
      color: "text-sky-500"
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${jobTitle}`)}&body=${encodeURIComponent(`I found this job that might interest you:\n\n${jobTitle}\n\n${shareUrl}`)}`,
      platform: "email",
      color: "text-gray-600"
    }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-text">Share Job</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-bg-secondary rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-neutral-bg-secondary rounded-lg">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-neutral-text-secondary outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-brand-orange text-white text-sm font-medium rounded hover:bg-brand-orange/90 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-text-secondary mb-3">Share via</p>
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.platform}
                    onClick={() => handleShare(option.platform, option.url)}
                    className="w-full flex items-center gap-3 p-3 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="text-sm font-medium text-neutral-text">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
