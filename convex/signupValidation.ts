import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if a company name is available (not already taken)
 */
export const checkCompanyNameAvailability = query({
  args: {
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.companyName.trim();
    
    if (!trimmedName || trimmedName.length < 2) {
      return { available: null, message: "", similarNames: [] };
    }

    // Normalize name for comparison (remove common suffixes, special chars)
    const normalizeCompanyName = (name: string) => {
      return name
        .toLowerCase()
        .replace(/\s+(ltd|limited|inc|incorporated|corp|corporation|llc|plc|co|company)\b/gi, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
    };

    const normalizedInput = normalizeCompanyName(trimmedName);

    // Get all employer profiles and check
    const allProfiles = await ctx.db
      .query("employerProfiles")
      .collect();

    // Check for exact match (case-insensitive)
    const exactMatch = allProfiles.find(
      profile => profile.companyName?.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exactMatch) {
      return {
        available: false,
        message: "This company name is already registered",
        similarNames: [],
      };
    }

    // Check for similar names (normalized comparison)
    const similarNames: string[] = [];
    for (const profile of allProfiles) {
      if (!profile.companyName) continue;
      
      const normalizedExisting = normalizeCompanyName(profile.companyName);
      
      // Exact normalized match
      if (normalizedExisting === normalizedInput) {
        return {
          available: false,
          message: `Too similar to existing company "${profile.companyName}"`,
          similarNames: [profile.companyName],
        };
      }
      
      // Very similar (Levenshtein distance or contains)
      if (
        normalizedExisting.includes(normalizedInput) ||
        normalizedInput.includes(normalizedExisting) ||
        calculateSimilarity(normalizedInput, normalizedExisting) > 0.8
      ) {
        similarNames.push(profile.companyName);
      }
    }

    if (similarNames.length > 0) {
      return {
        available: false,
        message: `Similar to existing: ${similarNames.slice(0, 2).join(", ")}${similarNames.length > 2 ? "..." : ""}`,
        similarNames: similarNames.slice(0, 3),
      };
    }

    return {
      available: true,
      message: "Company name is available",
      similarNames: [],
    };
  },
});

// Simple similarity calculation (Dice coefficient)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;

  const bigrams1 = new Set<string>();
  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }

  const bigrams2 = new Set<string>();
  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2));
  }

  let intersection = 0;
  bigrams1.forEach(bigram => {
    if (bigrams2.has(bigram)) intersection++;
  });

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

/**
 * Validate website URL format
 */
export const validateWebsiteUrl = query({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const url = args.url.trim();
    
    if (!url) {
      return { valid: null, message: "" };
    }

    // Check if URL starts with http:// or https://
    if (!url.match(/^https?:\/\//i)) {
      return {
        valid: false,
        message: "URL must start with http:// or https://",
      };
    }

    // Basic URL format validation
    try {
      new URL(url);
      return {
        valid: true,
        message: "Valid website URL",
      };
    } catch {
      return {
        valid: false,
        message: "Invalid URL format",
      };
    }
  },
});

/**
 * Validate email domain matches company website
 */
export const validateEmailDomain = query({
  args: {
    email: v.string(),
    website: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const website = args.website.trim().toLowerCase();
    
    if (!email || !website) {
      return { valid: null, message: "" };
    }

    try {
      const emailDomain = email.split("@")[1];
      const websiteUrl = new URL(website);
      const websiteDomain = websiteUrl.hostname.replace("www.", "");
      
      if (emailDomain === websiteDomain) {
        return {
          valid: true,
          message: "Email domain matches company website",
        };
      }
      
      return {
        valid: false,
        message: `Email should use @${websiteDomain} domain`,
        warning: true,
      };
    } catch {
      return { valid: null, message: "" };
    }
  },
});

/**
 * Validate phone number format
 */
export const validatePhoneNumber = query({
  args: {
    phone: v.string(),
    isKenyaBased: v.boolean(),
  },
  handler: async (ctx, args) => {
    const phone = args.phone.trim();
    
    if (!phone) {
      return { valid: null, message: "" };
    }

    if (args.isKenyaBased) {
      // Kenyan phone format: +254... or 07xx/01xx
      const kenyanPattern = /^(\+254|254|0)(7|1)\d{8}$/;
      if (kenyanPattern.test(phone.replace(/\s/g, ""))) {
        return {
          valid: true,
          message: "Valid Kenyan phone number",
        };
      }
      return {
        valid: false,
        message: "Invalid Kenyan phone format (use +254... or 07xx/01xx)",
      };
    } else {
      // International: basic check for + and digits
      const intlPattern = /^\+\d{10,15}$/;
      if (intlPattern.test(phone.replace(/\s/g, ""))) {
        return {
          valid: true,
          message: "Valid international phone number",
        };
      }
      return {
        valid: false,
        message: "Use international format: +[country code][number]",
      };
    }
  },
});

/**
 * Validate LinkedIn profile URL
 */
export const validateLinkedInUrl = query({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const url = args.url.trim();
    
    if (!url) {
      return { valid: null, message: "" };
    }

    // LinkedIn URL patterns
    const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i;
    
    if (linkedInPattern.test(url)) {
      return {
        valid: true,
        message: "Valid LinkedIn URL",
      };
    }
    
    return {
      valid: false,
      message: "Invalid LinkedIn URL format",
    };
  },
});

/**
 * Validate company description quality
 */
export const validateDescription = query({
  args: {
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const desc = args.description.trim();
    
    if (!desc) {
      return { valid: null, message: "", wordCount: 0 };
    }

    const wordCount = desc.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount < 20) {
      return {
        valid: false,
        message: `Too short. Add ${20 - wordCount} more words (minimum 20 words)`,
        wordCount,
      };
    }

    // Check for spam patterns (repeated characters, all caps)
    const hasSpam = /(.)\1{4,}/.test(desc) || desc === desc.toUpperCase();
    if (hasSpam) {
      return {
        valid: false,
        message: "Description appears to be spam or low quality",
        wordCount,
      };
    }

    return {
      valid: true,
      message: `Good description (${wordCount} words)`,
      wordCount,
    };
  },
});

/**
 * Validate year founded
 */
export const validateYearFounded = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    
    if (args.year > currentYear) {
      return {
        valid: false,
        message: "Year cannot be in the future",
      };
    }
    
    if (args.year < 1800) {
      return {
        valid: false,
        message: "Please enter a valid year",
      };
    }
    
    if (currentYear - args.year < 1) {
      return {
        valid: true,
        message: "Very new company (less than 1 year old)",
        warning: true,
      };
    }
    
    return {
      valid: true,
      message: "Valid founding year",
    };
  },
});
