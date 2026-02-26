"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, FileText, Clipboard, HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSidebar } from "./dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/work", label: "My Work", icon: Clipboard },
  { href: "/dashboard/help", label: "Career Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const profile = useQuery(api.profile.getCurrentUserProfile);

  const completeness = profile?.jobSeekerProfile?.profileCompleteness || 0;
  const showProfileCard = profile !== undefined && completeness < 100;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-neutral-border transition-all duration-200 z-50 ${
          collapsed ? "w-16" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-border">
            {!collapsed && (
              <span className="text-lg font-semibold text-neutral-text">
                Kazicloud
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-2 hover:bg-neutral-hover rounded-md text-neutral-text-secondary"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 hover:bg-neutral-hover rounded-md text-neutral-text-secondary"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-brand-orange/10 text-brand-orange"
                          : "text-neutral-text-secondary hover:bg-neutral-hover hover:text-neutral-text"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-[15px] font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Profile Completion Card */}
            {!collapsed && showProfileCard && (
              <div className="px-3 mt-6">
                <div className="bg-[#0F172A] rounded-lg p-4 text-white">
                  <h3 className="font-semibold text-base mb-3">
                    Your profile is {completeness}% complete
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="bg-white/20 rounded-full h-2 mb-4">
                    <div 
                      className="bg-brand-orange h-2 rounded-full transition-all"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>

                  <p className="text-sm text-white/80 mb-4 leading-relaxed">
                    A complete profile increases your visibility to employers and improves your chances of getting hired.
                  </p>

                  {/* Action Items */}
                  <div className="space-y-2 text-sm mb-4">
                    {completeness < 15 && (
                      <Link 
                        href="/dashboard/profile/edit"
                        className="flex items-center justify-between hover:text-brand-orange transition-colors"
                      >
                        <span>Add a <span className="underline">Location</span></span>
                        <span className="text-white/60">15%</span>
                      </Link>
                    )}
                    {completeness < 45 && (
                      <Link 
                        href="/dashboard/profile/edit"
                        className="flex items-center justify-between hover:text-brand-orange transition-colors"
                      >
                        <span>Add your <span className="underline">Role</span></span>
                        <span className="text-white/60">30%</span>
                      </Link>
                    )}
                    {completeness < 60 && (
                      <Link 
                        href="/dashboard/profile"
                        className="flex items-center justify-between hover:text-brand-orange transition-colors"
                      >
                        <span>Add your <span className="underline">5 Skills</span></span>
                        <span className="text-white/60">15%</span>
                      </Link>
                    )}
                    {completeness < 75 && (
                      <Link 
                        href="/dashboard/profile"
                        className="flex items-center justify-between hover:text-brand-orange transition-colors"
                      >
                        <span>Add <span className="underline">Work Experience</span></span>
                        <span className="text-white/60">15%</span>
                      </Link>
                    )}
                  </div>

                  {/* Complete Profile Button */}
                  <Link
                    href="/dashboard/profile"
                    className="block w-full py-2.5 bg-brand-orange text-white text-sm font-medium text-center rounded-md hover:bg-brand-orange/90 transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
