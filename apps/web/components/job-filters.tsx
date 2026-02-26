import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

export function JobFilters() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <h3 className="font-semibold text-neutral-text mb-4">Filters</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Job Type
          </label>
          <div className="space-y-2">
            {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
                />
                <span className="ml-2 text-sm text-neutral-text-secondary">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Remote
          </label>
          <div className="space-y-2">
            {["Remote", "Hybrid", "On-site"].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
                />
                <span className="ml-2 text-sm text-neutral-text-secondary">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Location
          </label>
          <Input placeholder="City or country" />
        </div>

        <Button variant="secondary" className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
