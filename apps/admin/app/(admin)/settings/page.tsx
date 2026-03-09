"use client";

import { useState } from "react";
import { 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe, 
  DollarSign,
  Users,
  FileText,
  Settings as SettingsIcon,
  Save,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Settings</h2>
        <p className="text-neutral-text-secondary">Manage platform configuration and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-neutral-border p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-orange text-white"
                      : "text-neutral-text-secondary hover:bg-neutral-bg-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-neutral-border">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-text mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue="support@kazicloud.com"
                        className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Timezone
                      </label>
                      <select className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                        <option>Africa/Nairobi (EAT)</option>
                        <option>UTC</option>
                        <option>America/New_York (EST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Default Currency
                      </label>
                      <select className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                        <option>KES - Kenyan Shilling</option>
                        <option>USD - US Dollar</option>
                        <option>EUR - Euro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Job Posting Expiry (Days)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      />
                      <p className="text-sm text-neutral-text-muted mt-1">Jobs will automatically close after this period</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Max Applications Per Job
                      </label>
                      <input
                        type="number"
                        defaultValue="100"
                        className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      />
                      <p className="text-sm text-neutral-text-muted mt-1">Maximum number of applications allowed per job</p>
                    </div>


                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">Allow New Registrations</p>
                        <p className="text-sm text-neutral-text-muted">Enable new user sign-ups</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">Auto-approve Employers</p>
                        <p className="text-sm text-neutral-text-muted">Automatically verify new employers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-text mb-4">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">New User Registrations</p>
                        <p className="text-sm text-neutral-text-muted">Get notified when new users sign up</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">New Job Postings</p>
                        <p className="text-sm text-neutral-text-muted">Alert when employers post new jobs</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">Employer Verification Requests</p>
                        <p className="text-sm text-neutral-text-muted">Notify when employers need verification</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-text">Daily Summary Report</p>
                        <p className="text-sm text-neutral-text-muted">Receive daily platform activity summary</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Save Button */}
            <div className="border-t border-neutral-border p-6">
              <div className="flex items-center justify-between">
                {saved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings saved successfully</span>
                  </div>
                )}
                <div className="ml-auto">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
