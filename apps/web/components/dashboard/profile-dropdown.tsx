"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { User, LogOut, Settings, HelpCircle } from "lucide-react";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const profile = useQuery(api.profile.getCurrentUserProfile);

  // Use Convex profile photo if available, otherwise fall back to Clerk
  const userData = {
    name: user?.firstName || profile?.fullName || "User",
    status: (user?.unsafeMetadata?.status as string) || profile?.jobSeekerProfile?.currentStatus || "Looking for Work",
    avatar: profile?.profilePhoto || user?.imageUrl || null,
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
        className="flex items-center justify-center w-9 h-9 bg-neutral-text rounded-full overflow-hidden hover:ring-2 hover:ring-brand-orange/20 transition-all"
      >
        {userData.avatar ? (
          <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-neutral-border overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-neutral-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-text rounded-full flex items-center justify-center flex-shrink-0">
                {userData.avatar ? (
                  <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-text mb-1">{userData.name}</h3>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-xs font-medium rounded-full whitespace-nowrap">
                  <span>⚡</span>
                  <span>{userData.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <User className="w-5 h-5 text-neutral-text-secondary" />
              <span className="text-sm font-medium">My profile</span>
            </Link>
          </div>

          <div className="border-t border-neutral-border py-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-neutral-text-secondary" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            <Link
              href="/dashboard/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-neutral-text-secondary" />
              <span className="text-sm font-medium">Help Center</span>
            </Link>
          </div>

          <div className="border-t border-neutral-border py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-between w-full px-4 py-3 text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-neutral-text-secondary" />
                <span className="text-sm font-medium">Log out</span>
              </div>
              <LogOut className="w-4 h-4 text-neutral-text-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
