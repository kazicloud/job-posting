"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Headphones,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  UserCog,
  Inbox,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  badge?: boolean; // true = show unread count badge
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// Grouped navigation — mirrors kci-ecommerce pattern.
// Items with no `permission` are always shown to any authenticated admin.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Employers",     href: "/employers",     icon: Building2,  permission: "employers:view" },
      { name: "Job Seekers",   href: "/job-seekers",   icon: Users,      permission: "job_seekers:view" },
      { name: "Jobs",          href: "/jobs",          icon: Briefcase,  permission: "jobs:view" },
      { name: "Applications",  href: "/applications",  icon: FileText,   permission: "applications:view" },
    ],
  },
  {
    label: "Communication",
    items: [
      { name: "Messages", href: "/messages", icon: MessageSquare, permission: "messages:view",  badge: true },
      { name: "Chats",    href: "/chats",    icon: Inbox,         permission: "chats:view",     badge: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Subscriptions", href: "/subscriptions", icon: CreditCard,  permission: "subscriptions:view" },
      { name: "Services",      href: "/services",      icon: Headphones,  permission: "services:view" },
    ],
  },
  {
    label: "Administration",
    items: [
      { name: "Admins",   href: "/admins",   icon: UserCog,    permission: "admins:view" },
      { name: "Roles",    href: "/roles",    icon: ShieldCheck, permission: "roles:view" },
      { name: "Settings", href: "/settings", icon: Settings,   permission: "settings:view" },
    ],
  },
];

// All items flattened (for active label lookup)
const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const unreadMessages = useQuery(api.contactMessages.unreadCount, {});
  const unreadChats = useQuery(api.conversations.totalUnreadCount);

  const adminProfile = useQuery(api.adminRoles.getCurrentAdminRole);
  const permissions: string[] = adminProfile?.permissions ?? [];
  const isSuperAdmin = permissions.includes("*");

  const isVisible = (permission?: string) => {
    if (!permission) return true;
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const unreadTotal = (unreadMessages ?? 0) + (unreadChats ?? 0);

  // Per-item badge count: Messages shows contact-form unread, Chats shows in-app chat unread
  const getBadgeCount = (itemName: string) => {
    if (itemName === "Messages") return unreadMessages ?? 0;
    if (itemName === "Chats") return unreadChats ?? 0;
    return unreadTotal;
  };

  // Current page label for topbar
  const currentLabel =
    ALL_ITEMS.slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
      ?.name ?? "Admin";

  return (
    <div className="flex">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-neutral-border z-50 flex-shrink-0 flex flex-col">

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-border shrink-0">
          <img
            src="/images/kazicloud-logo.jpg"
            alt="Kazicloud"
            className="h-7 w-7 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-[15px] font-bold text-neutral-text leading-none">Kazicloud</h1>
            <p className="text-[10px] text-neutral-text-muted mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Role badge */}
        {adminProfile?.role && (
          <div className="px-5 py-2.5 border-b border-neutral-border bg-neutral-bg-secondary shrink-0">
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <ShieldCheck className="w-3 h-3 text-brand-orange shrink-0" />
              ) : (
                <UserCog className="w-3 h-3 text-neutral-text-muted shrink-0" />
              )}
              <span className="text-[11px] font-semibold text-neutral-text truncate">
                {adminProfile.role.name}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => isVisible(item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-5">
                <p className="px-5 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-text-muted">
                  {group.label}
                </p>
                <ul className="space-y-0.5 px-3">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    const badgeCount = getBadgeCount(item.name);
                    const showBadge = item.badge && badgeCount > 0;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                            isActive
                              ? "bg-brand-orange text-white shadow-sm"
                              : "text-neutral-text-secondary hover:bg-neutral-bg-secondary hover:text-neutral-text"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{item.name}</span>
                          {showBadge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                                isActive
                                  ? "bg-white/25 text-white"
                                  : "bg-brand-orange text-white"
                              }`}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-neutral-border px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold flex items-center justify-center shrink-0">
            {(user?.fullName ?? "A").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-neutral-text truncate leading-tight">
              {user?.fullName ?? "Admin"}
            </p>
            <p className="text-[10px] text-neutral-text-muted truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-md text-neutral-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-screen bg-neutral-bg-secondary ml-60">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-neutral-border sticky top-0 z-30">
          <div className="h-full px-6 flex items-center">
            <h2 className="text-sm font-semibold text-neutral-text">{currentLabel}</h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

