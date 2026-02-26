"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Building2, MapPin, Globe, Users, Mail, Phone, Shield, Bell, CreditCard, Trash2 } from "lucide-react";

export default function EmployerSettingsPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState<"company" | "notifications" | "billing" | "security">("company");

  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">Settings</h1>
          <p className="text-neutral-text-secondary">Manage your company profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-border rounded-lg p-2">
              <button
                onClick={() => setActiveTab("company")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "company"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Building2 className="w-5 h-5" />
                Company Profile
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "billing"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Billing
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-neutral-text hover:bg-neutral-bg-secondary"
                }`}
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "company" && <CompanyProfileTab profile={profile} />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "security" && <SecurityTab />}
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function CompanyProfileTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Company Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Company Name
            </label>
            <input
              type="text"
              defaultValue={profile?.employerProfile?.companyName}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Industry
              </label>
              <select className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                <option>{profile?.employerProfile?.companyIndustries?.[0] || "Select industry"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Company Size
              </label>
              <select className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                <option>{profile?.employerProfile?.companySize || "Select size"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Website
            </label>
            <input
              type="url"
              defaultValue={profile?.employerProfile?.website}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Company Description
            </label>
            <textarea
              rows={4}
              defaultValue={profile?.employerProfile?.companyDescription}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Location
            </label>
            <input
              type="text"
              defaultValue={profile?.employerProfile?.headquarters || profile?.employerProfile?.country}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90">
            Save Changes
          </button>
          <button className="px-6 py-2.5 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary">
            Cancel
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Contact Person
            </label>
            <input
              type="text"
              defaultValue={profile?.employerProfile?.contactPersonName}
              className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={profile?.email}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={profile?.employerProfile?.contactPersonPhone}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90">
            Save Changes
          </button>
          <button className="px-6 py-2.5 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-neutral-text mb-6">Notification Preferences</h3>
      <div className="space-y-4">
        <NotificationToggle
          label="New Applications"
          description="Get notified when someone applies to your jobs"
          defaultChecked={true}
        />
        <NotificationToggle
          label="Application Updates"
          description="Updates on application status changes"
          defaultChecked={true}
        />
        <NotificationToggle
          label="Job Performance"
          description="Weekly reports on job posting performance"
          defaultChecked={false}
        />
        <NotificationToggle
          label="Marketing Updates"
          description="Tips and best practices for hiring"
          defaultChecked={false}
        />
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-neutral-border last:border-0">
      <div>
        <p className="font-medium text-neutral-text mb-1">{label}</p>
        <p className="text-sm text-neutral-text-secondary">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
      </label>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Current Plan</h3>
        <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg mb-4">
          <div>
            <p className="font-semibold text-neutral-text">Free Plan</p>
            <p className="text-sm text-neutral-text-secondary">Post up to 3 jobs per month</p>
          </div>
          <button className="px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90">
            Upgrade
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Billing History</h3>
        <p className="text-neutral-text-secondary text-center py-8">No billing history yet</p>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Verification Status</h3>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Verified Company</p>
            <p className="text-sm text-green-700">Your company has been verified</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium text-neutral-text mb-1">Delete Account</p>
              <p className="text-sm text-neutral-text-secondary">
                Permanently delete your company account and all data
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
