"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  FileText,
  Settings,
  LogOut
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Employers", href: "/employers", icon: Building2 },
  { name: "Job Seekers", href: "/job-seekers", icon: Users },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-border z-50 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-border">
            <img 
              src="/images/kazicloud-logo.jpg" 
              alt="Kazicloud" 
              className="h-6 w-6 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-lg font-semibold text-neutral-text">Kazicloud</h1>
              <p className="text-xs text-neutral-text-muted">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-brand-orange text-white"
                          : "text-neutral-text-secondary hover:bg-neutral-bg-secondary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-neutral-bg-secondary ml-64">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-neutral-border sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="text-sm text-neutral-text-secondary">
              {navigation.find(item => item.href === pathname)?.name || "Admin"}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-text">{user?.fullName || "Admin User"}</p>
                <p className="text-xs text-neutral-text-muted">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold hover:bg-brand-orange/90 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
