"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useState, use } from "react";
import { ArrowLeft, Download, Upload, FileText } from "lucide-react";
import Link from "next/link";

const SERVICE_TYPES = {
  ats_cv: "ATS CV Review",
  cv_revamp: "CV Revamp",
  job_search_support: "Job Search Support",
  career_coaching: "Career Coaching"
};

export default function ServiceOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = id as Id<"serviceOrders">;
  const order = useQuery(api.serviceOrders.getById, { orderId });
  const updateStatus = useMutation(api.serviceOrders.updateStatus);
  const generateUploadUrl = useMutation(api.serviceOrders.generateUploadUrl);
  
  const uploadedFileUrl = useQuery(
    api.serviceOrders.getFileUrl,
    order?.uploadedFileStorageId ? { storageId: order.uploadedFileStorageId } : "skip"
  );
  
  const deliverableFileUrl = useQuery(
    api.serviceOrders.getFileUrl,
    order?.deliverableFileStorageId ? { storageId: order.deliverableFileStorageId } : "skip"
  );
  
  const [deliverables, setDeliverables] = useState("");
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadDeliverable = async () => {
    if (!deliverableFile) return;
    
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": deliverableFile.type },
        body: deliverableFile,
      });
      const { storageId } = await result.json();
      
      await updateStatus({
        orderId,
        status: "completed", // Auto-complete when deliverable is uploaded
        deliverables,
        deliverableFileStorageId: storageId,
        deliverableFileName: deliverableFile.name,
      });
      
      // Send email notification to customer
      if (order?.user) {
        try {
          await fetch("/api/emails/service-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: order.user.fullName || "Customer",
              customerEmail: order.user.email,
              serviceType: order.serviceType,
              status: "completed",
            }),
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
      
      alert("Deliverable uploaded successfully! Customer has been notified via email.");
      setDeliverableFile(null);
      setDeliverables("");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload deliverable");
    } finally {
      setUploading(false);
    }
  };

  if (!order) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/services" className="inline-flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Order Details</h2>
        <p className="text-neutral-text-secondary">Manage service order and deliverables</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <h3 className="text-lg font-bold text-neutral-text mb-4">Order Information</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-neutral-text-secondary">Service</label>
              <p className="font-medium text-neutral-text">{SERVICE_TYPES[order.serviceType]}</p>
            </div>
            
            <div>
              <label className="text-sm text-neutral-text-secondary">Customer</label>
              <p className="font-medium text-neutral-text">{order.user?.fullName}</p>
              <p className="text-sm text-neutral-text-secondary">{order.user?.email}</p>
            </div>
            
            <div>
              <label className="text-sm text-neutral-text-secondary">Amount</label>
              <p className="font-medium text-neutral-text">{order.currency} {order.amount.toLocaleString()}</p>
            </div>
            
            <div>
              <label className="text-sm text-neutral-text-secondary">Payment Reference</label>
              <p className="font-mono text-sm text-neutral-text">{order.paymentReference}</p>
            </div>
            
            <div>
              <label className="text-sm text-neutral-text-secondary">Order Date</label>
              <p className="text-neutral-text">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Customer Inputs */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <h3 className="text-lg font-bold text-neutral-text mb-4">Customer Information</h3>
          
          {order.requirements && (
            <div className="mb-4">
              <label className="text-sm text-neutral-text-secondary block mb-2">Requirements/Notes</label>
              <div className="p-3 bg-neutral-bg-secondary rounded-lg text-sm text-neutral-text">
                {order.requirements}
              </div>
            </div>
          )}
          
          {order.uploadedFileStorageId && uploadedFileUrl && (
            <div>
              <label className="text-sm text-neutral-text-secondary block mb-2">Uploaded File</label>
              <a
                href={uploadedFileUrl}
                download={order.uploadedFileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-neutral-text transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {order.uploadedFileName}
              </a>
            </div>
          )}
          
          {!order.requirements && !order.uploadedFileStorageId && (
            <p className="text-neutral-text-secondary text-sm">No additional information provided</p>
          )}
        </div>

        {/* Deliverables */}
        <div className="bg-white rounded-lg border border-neutral-border p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-neutral-text mb-4">Deliverables</h3>
          
          {order.deliverableFileStorageId && deliverableFileUrl ? (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-text mb-1">Deliverable Uploaded</p>
                  <p className="text-sm text-neutral-text-secondary">{order.deliverableFileName}</p>
                  {order.deliverables && (
                    <p className="text-sm text-neutral-text mt-2">{order.deliverables}</p>
                  )}
                </div>
                <a
                  href={deliverableFileUrl}
                  download={order.deliverableFileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-neutral-text transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Deliverable Notes
                </label>
                <textarea
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="Add notes about what you're delivering..."
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Upload Deliverable File
                </label>
                <input
                  type="file"
                  onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                />
                {deliverableFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {deliverableFile.name}</p>
                )}
              </div>
              
              <button
                onClick={handleUploadDeliverable}
                disabled={!deliverableFile || uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-neutral-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Deliverable"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
