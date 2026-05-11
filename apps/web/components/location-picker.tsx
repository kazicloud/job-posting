"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  EAST_AFRICA_COUNTRIES,
  REGIONS_BY_COUNTRY,
  CURRENCY_BY_COUNTRY,
  getRegionLabel,
  getRegionGroups,
  formatLocation,
} from "@/lib/east-africa-locations";
import {
  LocationEntry,
  groupLocationsByCountry,
} from "@/lib/location-utils";

// ─── SingleLocationPicker ─────────────────────────────────────────────────────

interface SingleLocationPickerProps {
  country: string;
  region: string;
  city: string;
  onCountryChange: (country: string, suggestedCurrency: string) => void;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
}

export function SingleLocationPicker({
  country,
  region,
  city,
  onCountryChange,
  onRegionChange,
  onCityChange,
}: SingleLocationPickerProps) {
  const cityPlaceholder: Record<string, string> = {
    Kenya: "Westlands",
    Uganda: "Kololo",
    Tanzania: "Mwenge",
    Rwanda: "Kimironko",
  };

  return (
    <div className="space-y-3">
      {/* Row: Country + Region */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-text-secondary mb-1">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => {
              const c = e.target.value;
              onCountryChange(c, CURRENCY_BY_COUNTRY[c]?.code ?? "KES");
            }}
            className="w-full px-3 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm"
          >
            {EAST_AFRICA_COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-neutral-text-secondary mb-1">
            {getRegionLabel(country)}
          </label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm"
          >
            <option value="">
              Select {getRegionLabel(country).toLowerCase()}
            </option>
            {getRegionGroups(country).map((group) => (
              <optgroup key={group} label={group}>
                {(REGIONS_BY_COUNTRY[country] ?? [])
                  .filter((r) => r.group === group)
                  .map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* City / Town (optional) */}
      <div>
        <label className="block text-xs text-neutral-text-secondary mb-1">
          City / Town{" "}
          <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder={`e.g. ${cityPlaceholder[country] ?? "City"}`}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm"
        />
      </div>

      {/* Preview pill */}
      {region && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange/5 border border-brand-orange/20 rounded-md w-fit">
          <MapPin className="w-3.5 h-3.5 text-brand-orange" />
          <span className="text-sm font-medium text-brand-orange">
            {formatLocation({ country, region, city })}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── MultiLocationPicker ──────────────────────────────────────────────────────

interface MultiLocationPickerProps {
  locations: LocationEntry[];
  onChange: (locs: LocationEntry[]) => void;
}

export function MultiLocationPicker({
  locations,
  onChange,
}: MultiLocationPickerProps) {
  const [draftCountry, setDraftCountry] = useState("Kenya");
  const [draftRegion, setDraftRegion] = useState("");
  const [draftCity, setDraftCity] = useState("");

  const addLocation = () => {
    if (!draftRegion) return;
    const entry: LocationEntry = {
      country: draftCountry,
      region: draftRegion,
      city: draftCity || undefined,
    };
    // Prevent exact duplicates
    const isDuplicate = locations.some(
      (l) =>
        l.country === entry.country &&
        l.region === entry.region &&
        (l.city ?? "") === (entry.city ?? "")
    );
    if (!isDuplicate) onChange([...locations, entry]);
    setDraftRegion("");
    setDraftCity("");
  };

  const removeRegion = (country: string, region: string) => {
    onChange(
      locations.filter((l) => !(l.country === country && l.region === region))
    );
  };

  const grouped = groupLocationsByCountry(locations);

  return (
    <div className="mt-4 space-y-4">
      {/* Country-grouped chips */}
      {grouped.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {grouped.map(({ country, flag, regions }) => {
            const countryObj = EAST_AFRICA_COUNTRIES.find(
              (c) => c.name === country
            );
            return (
              <span
                key={country}
                className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-medium"
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="font-semibold">
                  {flag} {country}:
                </span>
                <span className="flex items-center gap-1 flex-wrap">
                  {regions.map((regionLabel, i) => {
                    // Find the original LocationEntry to get the correct region key for removal
                    const entry = locations.find((l) => {
                      const label = l.city
                        ? `${l.city}, ${l.region}`
                        : l.region;
                      return l.country === country && label === regionLabel;
                    });
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-0.5"
                      >
                        {regionLabel}
                        <button
                          type="button"
                          onClick={() =>
                            entry && removeRegion(country, entry.region)
                          }
                          className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-200 hover:text-red-600 transition-colors"
                          aria-label={`Remove ${regionLabel}`}
                        >
                          ×
                        </button>
                        {i < regions.length - 1 && (
                          <span className="text-brand-orange/50">,</span>
                        )}
                      </span>
                    );
                  })}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Add-location panel */}
      <div className="border border-neutral-border rounded-lg p-4 bg-neutral-bg-secondary space-y-3">
        <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wide">
          Add a location
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-text-secondary mb-1">
              Country
            </label>
            <select
              value={draftCountry}
              onChange={(e) => {
                setDraftCountry(e.target.value);
                setDraftRegion("");
              }}
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              {EAST_AFRICA_COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-text-secondary mb-1">
              {getRegionLabel(draftCountry)}
            </label>
            <select
              value={draftRegion}
              onChange={(e) => setDraftRegion(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              <option value="">
                Select {getRegionLabel(draftCountry).toLowerCase()}
              </option>
              {getRegionGroups(draftCountry).map((group) => (
                <optgroup key={group} label={group}>
                  {(REGIONS_BY_COUNTRY[draftCountry] ?? [])
                    .filter((r) => r.group === group)
                    .map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="City / Town (optional)"
            value={draftCity}
            onChange={(e) => setDraftCity(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
          <button
            type="button"
            onClick={addLocation}
            disabled={!draftRegion}
            className="px-4 py-2 bg-brand-orange text-white rounded-md text-sm font-medium hover:bg-brand-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {locations.length > 0 && (
        <p className="text-sm text-green-600 font-medium">
          ✓ {locations.length} location{locations.length === 1 ? "" : "s"}{" "}
          across {grouped.length} countr{grouped.length === 1 ? "y" : "ies"}{" "}
          added
        </p>
      )}
    </div>
  );
}

// ─── LocationSection ──────────────────────────────────────────────────────────
// Combines single + multi pickers with the toggle checkbox.

interface LocationSectionProps {
  country: string;
  region: string;
  city: string;
  multipleLocations: boolean;
  locations: LocationEntry[];
  onSingleChange: (updates: {
    country?: string;
    region?: string;
    city?: string;
    currency?: string;
  }) => void;
  onMultipleLocationsToggle: (checked: boolean) => void;
  onLocationsChange: (locs: LocationEntry[]) => void;
}

export function LocationSection({
  country,
  region,
  city,
  multipleLocations,
  locations,
  onSingleChange,
  onMultipleLocationsToggle,
  onLocationsChange,
}: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Location *
        </label>

        {!multipleLocations ? (
          <SingleLocationPicker
            country={country}
            region={region}
            city={city}
            onCountryChange={(c, currency) =>
              onSingleChange({ country: c, region: "", city: "", currency })
            }
            onRegionChange={(r) => onSingleChange({ region: r })}
            onCityChange={(c) => onSingleChange({ city: c })}
          />
        ) : (
          <p className="text-sm text-neutral-text-secondary italic px-4 py-3 border border-neutral-border rounded-md bg-neutral-bg-secondary">
            Locations managed below
          </p>
        )}
      </div>

      {/* Multiple Locations Toggle */}
      <div className="border border-neutral-border rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={multipleLocations}
            onChange={(e) => {
              onMultipleLocationsToggle(e.target.checked);
              if (!e.target.checked) onLocationsChange([]);
            }}
            className="w-4 h-4 text-brand-orange rounded"
          />
          <div>
            <p className="font-medium text-neutral-text">
              This job is available in multiple locations
            </p>
            <p className="text-sm text-neutral-text-secondary">
              Add each country + region where this role is open
            </p>
          </div>
        </label>

        {multipleLocations && (
          <MultiLocationPicker
            locations={locations}
            onChange={onLocationsChange}
          />
        )}
      </div>
    </div>
  );
}
