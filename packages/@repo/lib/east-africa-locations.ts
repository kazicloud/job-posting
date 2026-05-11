// East Africa location data for Kenya, Uganda, Tanzania, and Rwanda.
// Terminology follows each country's official administrative naming:
//   Kenya    → Counties (47)
//   Uganda   → Districts (grouped by region)
//   Tanzania → Regions / Mikoa (31)
//   Rwanda   → Districts grouped by Province (30)

export interface Country {
  name: string;
  code: string;         // ISO 3166-1 alpha-2
  flag: string;         // emoji flag
  currency: string;     // ISO 4217 currency code
  currencySymbol: string;
  regionLabel: string;  // how this country calls its subdivisions
}

export interface Region {
  name: string;
  group?: string; // e.g. "Central Region" (Uganda) or "Northern Province" (Rwanda)
}

// ─── Countries ────────────────────────────────────────────────────────────────

export const EAST_AFRICA_COUNTRIES: Country[] = [
  {
    name: "Kenya",
    code: "KE",
    flag: "🇰🇪",
    currency: "KES",
    currencySymbol: "KSh",
    regionLabel: "County",
  },
  {
    name: "Uganda",
    code: "UG",
    flag: "🇺🇬",
    currency: "UGX",
    currencySymbol: "USh",
    regionLabel: "District",
  },
  {
    name: "Tanzania",
    code: "TZ",
    flag: "🇹🇿",
    currency: "TZS",
    currencySymbol: "TSh",
    regionLabel: "Region",
  },
  {
    name: "Rwanda",
    code: "RW",
    flag: "🇷🇼",
    currency: "RWF",
    currencySymbol: "Fr",
    regionLabel: "District",
  },
];

// ─── Kenya — 47 Counties ──────────────────────────────────────────────────────

export const KENYA_COUNTIES: Region[] = [
  { name: "Nairobi", group: "Nairobi" },
  { name: "Mombasa", group: "Coast" },
  { name: "Kilifi", group: "Coast" },
  { name: "Kwale", group: "Coast" },
  { name: "Lamu", group: "Coast" },
  { name: "Taita-Taveta", group: "Coast" },
  { name: "Tana River", group: "Coast" },
  { name: "Garissa", group: "North Eastern" },
  { name: "Wajir", group: "North Eastern" },
  { name: "Mandera", group: "North Eastern" },
  { name: "Marsabit", group: "Eastern" },
  { name: "Isiolo", group: "Eastern" },
  { name: "Meru", group: "Eastern" },
  { name: "Tharaka-Nithi", group: "Eastern" },
  { name: "Embu", group: "Eastern" },
  { name: "Kitui", group: "Eastern" },
  { name: "Machakos", group: "Eastern" },
  { name: "Makueni", group: "Eastern" },
  { name: "Nyandarua", group: "Central" },
  { name: "Nyeri", group: "Central" },
  { name: "Kirinyaga", group: "Central" },
  { name: "Murang'a", group: "Central" },
  { name: "Kiambu", group: "Central" },
  { name: "Turkana", group: "Rift Valley" },
  { name: "West Pokot", group: "Rift Valley" },
  { name: "Samburu", group: "Rift Valley" },
  { name: "Trans-Nzoia", group: "Rift Valley" },
  { name: "Uasin Gishu", group: "Rift Valley" },
  { name: "Elgeyo-Marakwet", group: "Rift Valley" },
  { name: "Nandi", group: "Rift Valley" },
  { name: "Baringo", group: "Rift Valley" },
  { name: "Laikipia", group: "Rift Valley" },
  { name: "Nakuru", group: "Rift Valley" },
  { name: "Narok", group: "Rift Valley" },
  { name: "Kajiado", group: "Rift Valley" },
  { name: "Kericho", group: "Rift Valley" },
  { name: "Bomet", group: "Rift Valley" },
  { name: "Kakamega", group: "Western" },
  { name: "Vihiga", group: "Western" },
  { name: "Bungoma", group: "Western" },
  { name: "Busia", group: "Western" },
  { name: "Siaya", group: "Nyanza" },
  { name: "Kisumu", group: "Nyanza" },
  { name: "Homa Bay", group: "Nyanza" },
  { name: "Migori", group: "Nyanza" },
  { name: "Kisii", group: "Nyanza" },
  { name: "Nyamira", group: "Nyanza" },
];

// ─── Uganda — Districts grouped by region ─────────────────────────────────────

export const UGANDA_DISTRICTS: Region[] = [
  // Central Region
  { name: "Kampala", group: "Central" },
  { name: "Wakiso", group: "Central" },
  { name: "Mukono", group: "Central" },
  { name: "Buikwe", group: "Central" },
  { name: "Kayunga", group: "Central" },
  { name: "Luwero", group: "Central" },
  { name: "Nakaseke", group: "Central" },
  { name: "Nakasongola", group: "Central" },
  { name: "Masaka", group: "Central" },
  { name: "Kalangala", group: "Central" },
  { name: "Rakai", group: "Central" },
  { name: "Lwengo", group: "Central" },
  { name: "Lyantonde", group: "Central" },
  { name: "Bukomansimbi", group: "Central" },
  { name: "Kalungu", group: "Central" },
  { name: "Gomba", group: "Central" },
  { name: "Butebo", group: "Central" },
  { name: "Ssembabule", group: "Central" },
  { name: "Mubende", group: "Central" },
  { name: "Kassanda", group: "Central" },
  { name: "Mityana", group: "Central" },
  { name: "Kiboga", group: "Central" },
  { name: "Kyankwanzi", group: "Central" },
  // Eastern Region
  { name: "Jinja", group: "Eastern" },
  { name: "Iganga", group: "Eastern" },
  { name: "Kamuli", group: "Eastern" },
  { name: "Bugiri", group: "Eastern" },
  { name: "Busia", group: "Eastern" },
  { name: "Tororo", group: "Eastern" },
  { name: "Mbale", group: "Eastern" },
  { name: "Sironko", group: "Eastern" },
  { name: "Bududa", group: "Eastern" },
  { name: "Manafwa", group: "Eastern" },
  { name: "Bulambuli", group: "Eastern" },
  { name: "Kween", group: "Eastern" },
  { name: "Bukwo", group: "Eastern" },
  { name: "Kapchorwa", group: "Eastern" },
  { name: "Kibuku", group: "Eastern" },
  { name: "Pallisa", group: "Eastern" },
  { name: "Soroti", group: "Eastern" },
  { name: "Ngora", group: "Eastern" },
  { name: "Serere", group: "Eastern" },
  { name: "Amuria", group: "Eastern" },
  { name: "Katakwi", group: "Eastern" },
  { name: "Kumi", group: "Eastern" },
  { name: "Bukedea", group: "Eastern" },
  { name: "Kaberamaido", group: "Eastern" },
  { name: "Kaliro", group: "Eastern" },
  { name: "Namutumba", group: "Eastern" },
  { name: "Buyende", group: "Eastern" },
  { name: "Luuka", group: "Eastern" },
  { name: "Mayuge", group: "Eastern" },
  // Northern Region
  { name: "Gulu", group: "Northern" },
  { name: "Amuru", group: "Northern" },
  { name: "Nwoya", group: "Northern" },
  { name: "Omoro", group: "Northern" },
  { name: "Kitgum", group: "Northern" },
  { name: "Pader", group: "Northern" },
  { name: "Agago", group: "Northern" },
  { name: "Lamwo", group: "Northern" },
  { name: "Lira", group: "Northern" },
  { name: "Alebtong", group: "Northern" },
  { name: "Otuke", group: "Northern" },
  { name: "Oyam", group: "Northern" },
  { name: "Apac", group: "Northern" },
  { name: "Kole", group: "Northern" },
  { name: "Dokolo", group: "Northern" },
  { name: "Abim", group: "Northern" },
  { name: "Kaabong", group: "Northern" },
  { name: "Kotido", group: "Northern" },
  { name: "Moroto", group: "Northern" },
  { name: "Napak", group: "Northern" },
  { name: "Nakapiripirit", group: "Northern" },
  { name: "Amudat", group: "Northern" },
  // Western Region
  { name: "Mbarara", group: "Western" },
  { name: "Kiruhura", group: "Western" },
  { name: "Isingiro", group: "Western" },
  { name: "Ntungamo", group: "Western" },
  { name: "Bushenyi", group: "Western" },
  { name: "Mitooma", group: "Western" },
  { name: "Buhweju", group: "Western" },
  { name: "Rubirizi", group: "Western" },
  { name: "Sheema", group: "Western" },
  { name: "Ibanda", group: "Western" },
  { name: "Kazo", group: "Western" },
  { name: "Rwampara", group: "Western" },
  { name: "Kabale", group: "Western" },
  { name: "Kisoro", group: "Western" },
  { name: "Rubanda", group: "Western" },
  { name: "Kanungu", group: "Western" },
  { name: "Rukungiri", group: "Western" },
  { name: "Rukiga", group: "Western" },
  { name: "Kasese", group: "Western" },
  { name: "Kabarole", group: "Western" },
  { name: "Bunyangabu", group: "Western" },
  { name: "Kyenjojo", group: "Western" },
  { name: "Kibaale", group: "Western" },
  { name: "Kagadi", group: "Western" },
  { name: "Kakumiro", group: "Western" },
  { name: "Kyegegwa", group: "Western" },
  { name: "Buliisa", group: "Western" },
  { name: "Hoima", group: "Western" },
  { name: "Kikuube", group: "Western" },
  { name: "Kiryandongo", group: "Western" },
  { name: "Masindi", group: "Western" },
];

// ─── Tanzania — 31 Regions (Mikoa) ───────────────────────────────────────────

export const TANZANIA_REGIONS: Region[] = [
  { name: "Arusha", group: "Northern Zone" },
  { name: "Kilimanjaro", group: "Northern Zone" },
  { name: "Manyara", group: "Northern Zone" },
  { name: "Tanga", group: "Northern Zone" },
  { name: "Dar es Salaam", group: "Eastern Zone" },
  { name: "Pwani", group: "Eastern Zone" },
  { name: "Morogoro", group: "Eastern Zone" },
  { name: "Dodoma", group: "Central Zone" },
  { name: "Singida", group: "Central Zone" },
  { name: "Tabora", group: "Central Zone" },
  { name: "Mwanza", group: "Lake Zone" },
  { name: "Mara", group: "Lake Zone" },
  { name: "Kagera", group: "Lake Zone" },
  { name: "Shinyanga", group: "Lake Zone" },
  { name: "Simiyu", group: "Lake Zone" },
  { name: "Geita", group: "Lake Zone" },
  { name: "Mbeya", group: "Southern Highlands Zone" },
  { name: "Iringa", group: "Southern Highlands Zone" },
  { name: "Njombe", group: "Southern Highlands Zone" },
  { name: "Songwe", group: "Southern Highlands Zone" },
  { name: "Rukwa", group: "Southern Highlands Zone" },
  { name: "Katavi", group: "Southern Highlands Zone" },
  { name: "Mtwara", group: "Southern Zone" },
  { name: "Lindi", group: "Southern Zone" },
  { name: "Ruvuma", group: "Southern Zone" },
  { name: "Kigoma", group: "Western Zone" },
  { name: "Pemba North", group: "Zanzibar" },
  { name: "Pemba South", group: "Zanzibar" },
  { name: "Zanzibar Central/South", group: "Zanzibar" },
  { name: "Zanzibar North", group: "Zanzibar" },
  { name: "Zanzibar Urban/West", group: "Zanzibar" },
];

// ─── Rwanda — 30 Districts grouped by Province ────────────────────────────────

export const RWANDA_DISTRICTS: Region[] = [
  // Kigali City
  { name: "Gasabo", group: "Kigali City" },
  { name: "Kicukiro", group: "Kigali City" },
  { name: "Nyarugenge", group: "Kigali City" },
  // Northern Province
  { name: "Burera", group: "Northern Province" },
  { name: "Gakenke", group: "Northern Province" },
  { name: "Gicumbi", group: "Northern Province" },
  { name: "Musanze", group: "Northern Province" },
  { name: "Rulindo", group: "Northern Province" },
  // Southern Province
  { name: "Gisagara", group: "Southern Province" },
  { name: "Huye", group: "Southern Province" },
  { name: "Kamonyi", group: "Southern Province" },
  { name: "Muhanga", group: "Southern Province" },
  { name: "Nyamagabe", group: "Southern Province" },
  { name: "Nyanza", group: "Southern Province" },
  { name: "Nyaruguru", group: "Southern Province" },
  { name: "Ruhango", group: "Southern Province" },
  // Eastern Province
  { name: "Bugesera", group: "Eastern Province" },
  { name: "Gatsibo", group: "Eastern Province" },
  { name: "Kayonza", group: "Eastern Province" },
  { name: "Kirehe", group: "Eastern Province" },
  { name: "Ngoma", group: "Eastern Province" },
  { name: "Nyagatare", group: "Eastern Province" },
  { name: "Rwamagana", group: "Eastern Province" },
  // Western Province
  { name: "Karongi", group: "Western Province" },
  { name: "Ngororero", group: "Western Province" },
  { name: "Nyabihu", group: "Western Province" },
  { name: "Nyamasheke", group: "Western Province" },
  { name: "Rubavu", group: "Western Province" },
  { name: "Rutsiro", group: "Western Province" },
  { name: "Rusizi", group: "Western Province" },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const REGIONS_BY_COUNTRY: Record<string, Region[]> = {
  Kenya: KENYA_COUNTIES,
  Uganda: UGANDA_DISTRICTS,
  Tanzania: TANZANIA_REGIONS,
  Rwanda: RWANDA_DISTRICTS,
};

export const CURRENCY_BY_COUNTRY: Record<string, { code: string; symbol: string }> = {
  Kenya:    { code: "KES", symbol: "KSh" },
  Uganda:   { code: "UGX", symbol: "USh" },
  Tanzania: { code: "TZS", symbol: "TSh" },
  Rwanda:   { code: "RWF", symbol: "Fr"  },
};

/** Returns the human-readable label for a country's subdivisions (e.g. "County", "District") */
export function getRegionLabel(country: string): string {
  return EAST_AFRICA_COUNTRIES.find((c) => c.name === country)?.regionLabel ?? "Region";
}

/** Composes a display location string from parts */
export function formatLocation({
  country,
  region,
  city,
}: {
  country: string;
  region: string;
  city?: string;
}): string {
  return [city, region, country].filter(Boolean).join(", ");
}

/** Returns unique group names for the regions of a given country */
export function getRegionGroups(country: string): string[] {
  const regions = REGIONS_BY_COUNTRY[country] ?? [];
  const groups = regions.map((r) => r.group).filter(Boolean) as string[];
  return [...new Set(groups)];
}
