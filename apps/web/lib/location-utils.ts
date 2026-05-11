/**
 * Pure utility helpers for working with East Africa location data.
 * No React imports — safe to use anywhere.
 */
import {
  EAST_AFRICA_COUNTRIES,
  formatLocation,
} from "@/lib/east-africa-locations";

export interface LocationEntry {
  country: string;
  region: string;
  city?: string;
}

export interface ParsedLocation {
  /** Active country for the single-location selector */
  country: string;
  /** Active region for the single-location selector */
  region: string;
  /** Optional city for the single-location selector */
  city: string;
  /** Whether the multiple-locations toggle is on */
  multipleLocations: boolean;
  /** Entries when multiple-locations is on */
  locations: LocationEntry[];
}

const COUNTRY_NAMES = ["Kenya", "Uganda", "Tanzania", "Rwanda"] as const;

/**
 * Parse one "City, Region, Country" segment into a LocationEntry.
 * Falls back to Kenya when no country name is found (old format).
 */
function parseSegment(segment: string): LocationEntry | null {
  const parts = segment.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const lastPart = parts[parts.length - 1] ?? "";
  if ((COUNTRY_NAMES as readonly string[]).includes(lastPart)) {
    const country = lastPart;
    const region = parts[parts.length - 2] ?? "";
    const city =
      parts.length > 2 ? parts.slice(0, parts.length - 2).join(", ") : undefined;
    return { country, region, city };
  }

  // Old single-county format e.g. "Nairobi"
  return { country: "Kenya", region: parts[0] ?? "", city: undefined };
}

/**
 * Parse a stored location string from the DB back into form-state shape.
 *
 * Handles:
 *  - New single:  "Westlands, Nairobi, Kenya"
 *  - New multi:   "Westlands, Nairobi, Kenya | Kampala, Uganda | ..."
 *  - Old single:  "Nairobi"
 *  - Old multi:   "Nairobi, Kisumu, +3 more"  (comma-separated counties)
 */
export function parseStoredLocation(locationStr: string): ParsedLocation {
  const stripped = locationStr.replace(/\s*\+\d+\s*more$/, "").trim();

  // New multi-location format uses " | " as separator
  if (stripped.includes(" | ")) {
    const segments = stripped.split(" | ");
    const locations = segments
      .map(parseSegment)
      .filter(Boolean) as LocationEntry[];
    return {
      country: locations[0]?.country ?? "Kenya",
      region: "",
      city: "",
      multipleLocations: true,
      locations,
    };
  }

  // Old multi-county format: no country name, multiple comma parts
  const parts = stripped.split(",").map((s) => s.trim()).filter(Boolean);
  const hasCountryName = parts.some((p) =>
    (COUNTRY_NAMES as readonly string[]).includes(p)
  );

  if (!hasCountryName && parts.length > 1) {
    // Old format: each part is a Kenya county
    const locations: LocationEntry[] = parts.map((p) => ({
      country: "Kenya",
      region: p,
    }));
    return {
      country: "Kenya",
      region: "",
      city: "",
      multipleLocations: true,
      locations,
    };
  }

  // Single location (new or old)
  const parsed = parseSegment(stripped);
  return {
    country: parsed?.country ?? "Kenya",
    region: parsed?.region ?? "",
    city: parsed?.city ?? "",
    multipleLocations: false,
    locations: [],
  };
}

/**
 * Compose location args for persisting to the DB from the form's location state.
 */
export function buildLocationArgs(formData: {
  multipleLocations: boolean;
  locations: LocationEntry[];
  country: string;
  region: string;
  city: string;
}): { location: string; county: string | undefined } {
  if (formData.multipleLocations) {
    const displayed = formData.locations.slice(0, 5);
    const overflow = formData.locations.length - displayed.length;
    const locationStr =
      displayed.map(formatLocation).join(" | ") +
      (overflow > 0 ? ` +${overflow} more` : "");
    return {
      location: locationStr,
      county: formData.locations[0]?.region,
    };
  }
  return {
    location: formatLocation({
      country: formData.country,
      region: formData.region,
      city: formData.city,
    }),
    county: formData.region || undefined,
  };
}

/** Group an array of location entries by country for display. */
export function groupLocationsByCountry(
  locations: LocationEntry[]
): Array<{ country: string; flag: string; regions: string[] }> {
  const map = new Map<string, string[]>();
  const order: string[] = [];

  for (const loc of locations) {
    if (!map.has(loc.country)) {
      map.set(loc.country, []);
      order.push(loc.country);
    }
    const label = loc.city ? `${loc.city}, ${loc.region}` : loc.region;
    map.get(loc.country)!.push(label);
  }

  return order.map((country) => ({
    country,
    flag: EAST_AFRICA_COUNTRIES.find((c) => c.name === country)?.flag ?? "🌍",
    regions: map.get(country) ?? [],
  }));
}

/**
 * Returns a short human-readable location summary for display in cards/badges.
 * Groups by country like: "🇰🇪 Nairobi, Kisumu • 🇺🇬 Kampala"
 */
export function formatLocationSummary(
  locations: LocationEntry[],
  maxCountries = 3
): string {
  const groups = groupLocationsByCountry(locations);
  const shown = groups.slice(0, maxCountries);
  const overflow = groups.length - shown.length;
  const parts = shown.map(
    ({ flag, regions }) => `${flag} ${regions.join(", ")}`
  );
  if (overflow > 0) parts.push(`+${overflow} more`);
  return parts.join(" • ");
}
