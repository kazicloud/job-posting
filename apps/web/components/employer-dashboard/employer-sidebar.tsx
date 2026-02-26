"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Users, BarChart3, Settings, ChevronLeft, ChevronRight, X, Building2 } from "lucide-react";
import { useSidebar } from "./employer-dashboard-layout";

const navItems = [
  { href: "/employer-dashboard", label: "Overview", icon: Home },
  { href: "/employer-dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer-dashboard/applications", label: "Applications", icon: Users },
  { href: "/employer-dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/employer-dashboard/settings", label: "Settings", icon: Settings },
];

export function EmployerSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

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
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-brand-orange" />
                <span className="text-lg font-semibold text-neutral-text">
                  Kazicloud
                </span>
              </div>
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
          </nav>
        </div>
      </aside>
    </>
  );
}
