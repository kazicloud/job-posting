import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user identity (lean)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    fullName: v.optional(v.string()),
    roles: v.array(v.string()), // ["job_seeker", "employer", "recruiter"]
    primaryRole: v.string(),
    profilePhoto: v.optional(v.string()), // URL from storage
    profilePhotoStorageId: v.optional(v.string()), // Storage ID for persistence
    phone: v.optional(v.string()),
    county: v.optional(v.string()),
    country: v.optional(v.string()), // Defaults to "Kenya"
    location: v.optional(v.string()), // Legacy field - keep for backward compatibility
    resumeStorageId: v.optional(v.string()), // Convex file storage ID
    onboardingCompleted: v.optional(v.boolean()),
    verified: v.optional(v.boolean()), // For employer verification
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_primary_role", ["primaryRole"]),

  // Job Seeker Profile (1:1 with users)
  jobSeekerProfiles: defineTable({
    userId: v.id("users"),
    headline: v.optional(v.string()),
    about: v.optional(v.string()),
    interestedFields: v.optional(v.array(v.string())),
    otherFieldDescription: v.optional(v.string()),
    
    // Career Summary
    careerSummary: v.optional(v.string()),
    
    // Status
    currentStatus: v.optional(v.union(
      v.literal("employed"),
      v.literal("unemployed"),
      v.literal("student"),
      v.literal("freelancer")
    )),
    yearsOfExperience: v.optional(v.number()),
    openToWork: v.optional(v.boolean()),
    availability: v.optional(v.union(
      v.literal("immediate"),
      v.literal("1_month"),
      v.literal("2_months"),
      v.literal("3_months")
    )),
    noticePeriod: v.optional(v.string()),
    
    // Languages
    languages: v.optional(v.array(v.object({
      language: v.string(),
      proficiency: v.optional(v.union(
        v.literal("basic"),
        v.literal("conversational"),
        v.literal("fluent"),
        v.literal("native")
      )),
    }))),
    
    // Preferences
    desiredJobTitle: v.optional(v.string()),
    desiredIndustries: v.optional(v.array(v.string())),
    jobTypes: v.optional(v.array(v.string())),
    workArrangements: v.optional(v.array(v.string())),
    salaryMin: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
    allowRecruiterContact: v.optional(v.boolean()),
    
    profileCompleteness: v.optional(v.number()),
    resumeUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_open_to_work", ["openToWork"]),

  // Employer Profile (1:1 with users)
  employerProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    companySize: v.optional(v.string()),
    companyIndustries: v.optional(v.array(v.string())),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    companyLogo: v.optional(v.string()),
    companyLogoStorageId: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    
    // Location
    isKenyaBased: v.optional(v.boolean()),
    headquarters: v.optional(v.string()), // City/County
    country: v.optional(v.string()),
    
    // Contact Person
    contactPersonName: v.optional(v.string()),
    contactPersonTitle: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    linkedInProfile: v.optional(v.string()),
    
    // Kenya-specific
    registrationNumber: v.optional(v.string()), // For Kenya BRS
    kraPin: v.optional(v.string()),
    
    // Documents
    incorporationCertStorageId: v.optional(v.string()),
    kraCertStorageId: v.optional(v.string()),
    registrationDocStorageId: v.optional(v.string()), // For international
    
    // Verification
    verificationStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("documents_submitted"),
      v.literal("under_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("suspended")
    )),
    verifiedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    
    // MetaMap BRS
    metamapVerificationId: v.optional(v.string()),
    brsVerified: v.optional(v.boolean()),
    
    onboardingCompleted: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_company_name", ["companyName"])
    .index("by_verification_status", ["verificationStatus"]),

  // Employer Onboarding Progress
  employerOnboardingProgress: defineTable({
    userId: v.id("users"),
    currentStep: v.number(),
    data: v.any(),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Recruiter Profile (1:1 with users)
  recruiterProfiles: defineTable({
    userId: v.id("users"),
    agencyName: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    yearsInRecruitment: v.optional(v.number()),
    linkedInProfile: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"]),

  workExperience: defineTable({
    userId: v.id("users"),
    company: v.string(),
    title: v.string(),
    industry: v.string(),
    employmentType: v.union(
      v.literal("permanent"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("freelance"),
      v.literal("attachment")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    currentlyWorking: v.boolean(),
    description: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_user", ["userId"]),

  education: defineTable({
    userId: v.id("users"),
    institution: v.string(),
    qualificationLevel: v.union(
      v.literal("certificate"),
      v.literal("diploma"),
      v.literal("degree"),
      v.literal("masters"),
      v.literal("phd"),
      v.literal("tvet")
    ),
    certificateType: v.optional(v.string()), // For certificate level: polytechnic, bootcamp, etc.
    fieldOfStudy: v.string(),
    startYear: v.string(),
    endYear: v.string(),
    grade: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_user", ["userId"]),

  skills: defineTable({
    userId: v.id("users"),
    skillName: v.string(),
    priority: v.optional(v.number()), // 1-3 = top skills, 4-10 = other skills
    category: v.optional(v.union(
      v.literal("technical"),
      v.literal("soft"),
      v.literal("language"),
      v.literal("computer")
    )),
    proficiency: v.optional(v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
  })
    .index("by_user", ["userId"]),

  certifications: defineTable({
    userId: v.id("users"),
    name: v.string(),
    issuingOrganization: v.string(),
    issueDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  languages: defineTable({
    userId: v.id("users"),
    language: v.string(),
    proficiency: v.union(
      v.literal("basic"),
      v.literal("conversational"),
      v.literal("fluent"),
      v.literal("native")
    ),
  })
    .index("by_user", ["userId"]),

  jobs: defineTable({
    employerId: v.id("users"),
    companyName: v.string(),
    title: v.string(),
    slug: v.optional(v.string()), // SEO-friendly URL slug, e.g. "software-engineer-at-safaricom-km4abc12"
    department: v.optional(v.string()),
    employmentType: v.string(),
    workplaceType: v.string(),
    location: v.string(),
    county: v.optional(v.string()),
    description: v.string(),
    responsibilities: v.string(),
    requirements: v.string(),
    requiredSkills: v.optional(v.array(v.string())), // Optional for backward compatibility
    preferredSkills: v.optional(v.array(v.string())),
    niceToHave: v.optional(v.string()),
    salaryDisclosure: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    benefits: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    positions: v.number(),
    experienceLevel: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
      v.literal("archived"),
      v.literal("expired")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()), // Job expiry date (30 days from posting)
    
    // Application Settings (NEW)
    applicationSettings: v.optional(v.object({
      requireResume: v.boolean(),
      requireCoverLetter: v.boolean(),
      requirePortfolio: v.boolean(),
      requireLinkedIn: v.boolean(),
      requireAvailability: v.boolean(),
      requireSalaryExpectations: v.boolean(),
      requireWorkAuthorization: v.boolean(),
      requireWillingToRelocate: v.boolean(),
      maxFileSize: v.optional(v.number()),
      acceptedFileTypes: v.optional(v.array(v.string())),
      allowMultipleResumes: v.optional(v.boolean()),
      customQuestions: v.optional(v.array(v.object({
        question: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("file")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        maxFileSize: v.number(),
        acceptedFileTypes: v.array(v.string()),
      }))),
    })),
  })
    .index("by_employer", ["employerId"])
    .index("by_status", ["status"])
    .index("by_slug", ["slug"]),

  applications: defineTable({
    jobId: v.id("jobs"),
    jobSeekerId: v.id("users"),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("shortlisted"),
      v.literal("interview"),
      v.literal("rejected"),
      v.literal("accepted")
    ),
    coverLetter: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    
    // Additional application data (NEW)
    portfolioUrl: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    availability: v.optional(v.string()),
    salaryExpectations: v.optional(v.string()),
    workAuthorization: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
    customAnswers: v.optional(v.array(v.object({
      questionIndex: v.number(),
      answer: v.union(
        v.string(),
        v.array(v.string())
      ),
      fileUrl: v.optional(v.string()),
    }))),
    
    // Response tracking
    firstActionAt: v.optional(v.number()), // Timestamp when employer first changed status
  })
    .index("by_job", ["jobId"])
    .index("by_job_seeker", ["jobSeekerId"])
    .index("by_status", ["status"])
    .index("by_job_and_status", ["jobId", "status"]),

  applicationNotes: defineTable({
    applicationId: v.id("applications"),
    authorId: v.id("users"),
    authorName: v.string(),
    note: v.string(),
  })
    .index("by_application", ["applicationId"]),

  // Job Views (for analytics)
  jobViews: defineTable({
    jobId: v.id("jobs"),
    userId: v.optional(v.id("users")), // null for anonymous views
    viewedAt: v.number(), // timestamp
  })
    .index("by_job", ["jobId"])
    .index("by_user", ["userId"])
    .index("by_job_and_user", ["jobId", "userId"]),

  // Saved Jobs (bookmarks)
  savedJobs: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_job", ["jobId"])
    .index("by_user_and_job", ["userId", "jobId"]),

  // Onboarding Progress (temporary storage)
  onboardingProgress: defineTable({
    userId: v.id("users"),
    currentStep: v.number(),
    data: v.any(), // Store all form data
    completeness: v.optional(v.number()), // Profile completeness percentage (0-100)
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Employer Subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("growth"),
      v.literal("enterprise")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    jobPostingsRemaining: v.number(), // -1 for unlimited
    startDate: v.number(),
    endDate: v.optional(v.number()), // null for free plan
    autoRenew: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Payment Transactions
  transactions: defineTable({
    userId: v.id("users"),
    reference: v.string(), // Paystack reference
    plan: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed")
    ),
    paystackData: v.optional(v.any()),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["reference"])
    .index("by_status", ["status"]),

  // Candidate Service Orders
  serviceOrders: defineTable({
    userId: v.id("users"),
    serviceType: v.union(
      v.literal("ats_cv"),
      v.literal("cv_revamp"),
      v.literal("job_search_support"),
      v.literal("career_coaching")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    amount: v.number(),
    currency: v.string(),
    paymentReference: v.optional(v.string()),
    
    // Customer inputs
    requirements: v.optional(v.string()), // Notes, preferences, goals
    uploadedFileStorageId: v.optional(v.string()), // CV or other documents
    uploadedFileName: v.optional(v.string()),
    
    // Admin deliverables
    deliverables: v.optional(v.string()), // Notes about what was delivered
    deliverableFileStorageId: v.optional(v.string()), // Revised CV, materials
    deliverableFileName: v.optional(v.string()),
    
    assignedTo: v.optional(v.id("users")), // Admin/staff member
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_service_type", ["serviceType"])
    .index("by_assigned_to", ["assignedTo"]),

  // Employer profile change requests
  profileChangeRequests: defineTable({
    userId: v.id("users"),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    adminNote: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
