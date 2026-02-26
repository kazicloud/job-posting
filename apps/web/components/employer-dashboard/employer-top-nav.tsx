"use client";

import { Menu, Bell } from "lucide-react";
import { useSidebar } from "./employer-dashboard-layout";
import { UserButton } from "@clerk/nextjs";

export function EmployerTopNav() {
  const { setMobileOpen } = useSidebar();

  return (
    <div className="h-16 bg-white border-b border-neutral-border sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 hover:bg-neutral-hover rounded-md text-neutral-text-secondary"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-neutral-hover rounded-md text-neutral-text-secondary relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
