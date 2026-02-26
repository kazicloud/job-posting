import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-border bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-neutral-text mb-4">Kazicloud</h3>
            <p className="text-sm text-neutral-text-secondary">
              Professional job platform connecting talent with opportunity.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-text mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-neutral-text-secondary hover:text-neutral-text">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-neutral-text-secondary hover:text-neutral-text">
                  Companies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-text mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="text-neutral-text-secondary hover:text-neutral-text">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-text-secondary hover:text-neutral-text">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-text mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-neutral-text-secondary hover:text-neutral-text">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-text-secondary hover:text-neutral-text">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-border">
          <p className="text-sm text-neutral-text-muted text-center">
            © {new Date().getFullYear()} Kazicloud. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
