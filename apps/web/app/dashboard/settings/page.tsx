import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
        />

        <div className="max-w-3xl">
          {/* Preferences Section */}
          <section className="bg-white border border-neutral-border rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-neutral-text mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-text">
                    Email Notifications
                  </p>
                  <p className="text-xs text-neutral-text-secondary mt-0.5">
                    Receive updates about new job matches
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange/20"
                  defaultChecked
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-text">
                    Profile Visibility
                  </p>
                  <p className="text-xs text-neutral-text-secondary mt-0.5">
                    Allow employers to find your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange/20"
                  defaultChecked
                />
              </label>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="bg-white border border-neutral-border rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-neutral-text mb-4">
              Privacy
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-text">
                    Show Profile to Recruiters
                  </p>
                  <p className="text-xs text-neutral-text-secondary mt-0.5">
                    Let recruiters contact you directly
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange/20"
                  defaultChecked
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-text">
                    Activity Status
                  </p>
                  <p className="text-xs text-neutral-text-secondary mt-0.5">
                    Show when you're active on the platform
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange/20"
                />
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          <DeleteAccountSection />
        </div>
      </div>
    </DashboardLayout>
  );
}
