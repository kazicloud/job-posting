"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Building2, LogOut, Settings } from "lucide-react";

export function EmployerProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const profile = useQuery(api.profile.getCurrentUserProfile);

  const companyData = {
    name: profile?.employerProfile?.companyName || "Company",
    logo: profile?.employerProfile?.companyLogo || null,
    email: profile?.email || user?.primaryEmailAddress?.emailAddress || "",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 bg-neutral-bg-secondary border border-neutral-border rounded-full overflow-hidden hover:ring-2 hover:ring-brand-orange/20 transition-all"
      >
        {companyData.logo ? (
          <img src={companyData.logo} alt={companyData.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-5 h-5 text-neutral-text-muted" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-neutral-border overflow-hidden z-50">
          {/* Company Info */}
          <div className="p-4 border-b border-neutral-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-bg-secondary border border-neutral-border rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {companyData.logo ? (
                  <img src={companyData.logo} alt={companyData.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-neutral-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-text text-sm truncate">
                  {companyData.name}
                </p>
                <p className="text-xs text-neutral-text-secondary truncate">
                  {companyData.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/employer-dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
