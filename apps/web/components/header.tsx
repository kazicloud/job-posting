import Link from "next/link";
import { Button } from "@repo/ui/button";

export function Header() {
  return (
    <header className="border-b border-neutral-border bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-semibold text-neutral-text">
            Kazicloud
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/jobs"
              className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/about"
              className="text-neutral-text-secondary hover:text-neutral-text transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Post a Job
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
