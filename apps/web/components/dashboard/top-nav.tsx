"use client";

import Link from "next/link";
import { Search, Mail, Bookmark, Bell, Menu } from "lucide-react";
import { useSidebar } from "./dashboard-layout";
import { ProfileDropdown } from "./profile-dropdown";
import { SearchDropdown } from "./search-dropdown";
import { useState, useRef, useEffect } from "react";

export function DashboardTopNav() {
  const { setMobileOpen } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  return (
    <>
      <div className="h-16 bg-white border-b border-neutral-border px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 hover:bg-neutral-hover rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-neutral-text" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted pointer-events-none z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for jobs, companies, locations..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-bg-secondary border border-transparent rounded-full text-sm text-neutral-text placeholder:text-neutral-text-muted focus:outline-none focus:bg-white focus:border-neutral-border transition-colors"
            />
          </div>
          
          <SearchDropdown 
            isOpen={searchOpen} 
            query={query}
            setQuery={setQuery}
            onClose={() => setSearchOpen(false)} 
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/messages"
            className="p-2.5 hover:bg-neutral-hover rounded-lg transition-colors"
            title="Messages"
          >
            <Mail className="w-5 h-5 text-neutral-text" />
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="p-2.5 hover:bg-neutral-hover rounded-lg transition-colors"
            title="Wishlist"
          >
            <Bookmark className="w-5 h-5 text-neutral-text" />
          </Link>

          <Link
            href="/dashboard/notifications"
            className="p-2.5 hover:bg-neutral-hover rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-text" />
          </Link>

          <div className="ml-2">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
