import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addSampleJobsForUser = mutation({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.userEmail))
      .first();
    
    if (!user) {
      return { error: "User not found" };
    }

    // Get employer profile
    const employer = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (!employer) {
      return { error: "Employer profile not found" };
    }
    
    const sampleJobs = [
      {
        employerId: user._id,
        companyName: employer.companyName,
        title: "Senior Software Engineer",
        department: "Engineering",
        employmentType: "full-time",
        workplaceType: "hybrid",
        location: "Nairobi",
        county: "Nairobi County",
        description: "We're looking for an experienced software engineer to join our growing team. You'll work on building scalable web applications that serve thousands of users across Kenya.",
        responsibilities: "• Design and develop scalable backend systems\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Write clean, maintainable code\n• Participate in code reviews",
        requirements: "• Bachelor's degree in Computer Science or related field\n• 5+ years of experience in software development\n• Strong knowledge of Python and Django\n• Experience with AWS cloud services\n• Excellent problem-solving skills",
        requiredSkills: ["Python", "Django", "AWS", "PostgreSQL"],
        preferredSkills: ["Kubernetes", "Docker", "React"],
        niceToHave: "• Experience with Kubernetes\n• Contributions to open source projects\n• Previous startup experience",
        salaryDisclosure: "range",
        salaryMin: 250000,
        salaryMax: 400000,
        currency: "KES",
        benefits: "• Health insurance\n• Flexible working hours\n• Professional development budget\n• Remote work options\n• Annual team retreats",
        positions: 2,
        experienceLevel: "senior",
        status: "published" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        employerId: user._id,
        companyName: employer.companyName,
        title: "Product Manager",
        department: "Product",
        employmentType: "full-time",
        workplaceType: "on-site",
        location: "Nairobi",
        county: "Nairobi County",
        description: "Join our product team to drive the vision and execution of our flagship products.",
        responsibilities: "• Define product strategy and roadmap\n• Gather and prioritize product requirements\n• Work with engineering teams on product delivery\n• Analyze user feedback and metrics",
        requirements: "• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with agile methodologies\n• Excellent communication skills",
        requiredSkills: ["Product Management", "Agile", "Data Analysis"],
        preferredSkills: ["SQL", "Jira"],
        niceToHave: "• MBA or advanced degree\n• Experience in fintech or e-commerce",
        salaryDisclosure: "negotiable",
        currency: "KES",
        benefits: "• Competitive salary package\n• Health and dental insurance\n• Stock options",
        positions: 1,
        experienceLevel: "mid",
        status: "published" as const,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        employerId: user._id,
        companyName: employer.companyName,
        title: "UI/UX Designer",
        department: "Design",
        employmentType: "contract",
        workplaceType: "remote",
        location: "Remote",
        description: "We're seeking a talented UI/UX designer to create beautiful interfaces.",
        responsibilities: "• Create wireframes, prototypes, and high-fidelity designs\n• Conduct user research and usability testing\n• Collaborate with product and engineering teams",
        requirements: "• 3+ years of UI/UX design experience\n• Proficiency in Figma and Adobe Creative Suite\n• Strong portfolio demonstrating design process",
        requiredSkills: ["Figma", "UI Design", "UX Research", "Prototyping"],
        preferredSkills: ["Adobe XD", "Sketch"],
        niceToHave: "• Experience with design systems\n• Motion design skills",
        salaryDisclosure: "range",
        salaryMin: 150000,
        salaryMax: 250000,
        currency: "KES",
        benefits: "• Flexible schedule\n• Remote work\n• Latest design tools",
        positions: 1,
        experienceLevel: "mid",
        status: "published" as const,
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
    ];

    const jobIds = [];
    for (const job of sampleJobs) {
      const id = await ctx.db.insert("jobs", job);
      jobIds.push(id);
    }

    return { 
      success: true, 
      message: `Added ${jobIds.length} sample jobs for ${employer.companyName}`,
      jobIds 
    };
  },
});
