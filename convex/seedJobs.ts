import { mutation } from "./_generated/server";

export const addSampleJobs = mutation({
  args: {},
  handler: async (ctx) => {
    // Get first employer
    const employers = await ctx.db.query("employerProfiles").collect();
    
    if (employers.length === 0) {
      return { error: "No employers found" };
    }

    const employer = employers[0];
    if (!employer) {
      return { error: "No employer found" };
    }
    
    const sampleJobs = [
      {
        employerId: employer.userId,
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
        employerId: employer.userId,
        companyName: employer.companyName,
        title: "Product Manager",
        department: "Product",
        employmentType: "full-time",
        workplaceType: "on-site",
        location: "Nairobi",
        county: "Nairobi County",
        description: "Join our product team to drive the vision and execution of our flagship products. You'll work closely with engineering, design, and business teams to deliver exceptional user experiences.",
        responsibilities: "• Define product strategy and roadmap\n• Gather and prioritize product requirements\n• Work with engineering teams on product delivery\n• Analyze user feedback and metrics\n• Present product updates to stakeholders",
        requirements: "• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with agile methodologies\n• Excellent communication skills\n• Bachelor's degree in Business, Computer Science, or related field",
        requiredSkills: ["Product Management", "Agile", "Data Analysis"],
        preferredSkills: ["SQL", "Jira", "Figma"],
        niceToHave: "• MBA or advanced degree\n• Experience in fintech or e-commerce\n• Technical background",
        salaryDisclosure: "negotiable",
        currency: "KES",
        benefits: "• Competitive salary package\n• Health and dental insurance\n• Stock options\n• Learning and development budget",
        positions: 1,
        experienceLevel: "mid",
        status: "published" as const,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        employerId: employer.userId,
        companyName: employer.companyName,
        title: "UI/UX Designer",
        department: "Design",
        employmentType: "contract",
        workplaceType: "remote",
        location: "Remote",
        description: "We're seeking a talented UI/UX designer to help us create beautiful, intuitive interfaces for our web and mobile applications.",
        responsibilities: "• Create wireframes, prototypes, and high-fidelity designs\n• Conduct user research and usability testing\n• Collaborate with product and engineering teams\n• Maintain and evolve our design system\n• Present design concepts to stakeholders",
        requirements: "• 3+ years of UI/UX design experience\n• Proficiency in Figma and Adobe Creative Suite\n• Strong portfolio demonstrating design process\n• Understanding of responsive design principles\n• Excellent visual design skills",
        requiredSkills: ["Figma", "UI Design", "UX Research", "Prototyping"],
        preferredSkills: ["Adobe XD", "Sketch", "HTML/CSS"],
        niceToHave: "• Experience with design systems\n• Motion design skills\n• Front-end development knowledge (HTML/CSS)",
        salaryDisclosure: "range",
        salaryMin: 150000,
        salaryMax: 250000,
        currency: "KES",
        benefits: "• Flexible schedule\n• Remote work\n• Latest design tools and software",
        positions: 1,
        experienceLevel: "mid",
        status: "published" as const,
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
      {
        employerId: employer.userId,
        companyName: employer.companyName,
        title: "Marketing Manager",
        department: "Marketing",
        employmentType: "full-time",
        workplaceType: "hybrid",
        location: "Nairobi",
        county: "Nairobi County",
        description: "Lead our marketing efforts to drive brand awareness and customer acquisition. You'll develop and execute marketing strategies across multiple channels.",
        responsibilities: "• Develop and execute marketing strategies\n• Manage digital marketing campaigns\n• Analyze campaign performance and ROI\n• Lead content creation and social media\n• Manage marketing budget",
        requirements: "• 4+ years of marketing experience\n• Strong understanding of digital marketing\n• Experience with marketing analytics tools\n• Excellent written and verbal communication\n• Bachelor's degree in Marketing or related field",
        requiredSkills: ["Digital Marketing", "SEO", "Google Analytics", "Content Marketing"],
        preferredSkills: ["Social Media Marketing", "Email Marketing"],
        salaryDisclosure: "undisclosed",
        benefits: "• Competitive package\n• Performance bonuses\n• Health insurance\n• Professional development",
        positions: 1,
        experienceLevel: "senior",
        status: "draft" as const,
        createdAt: Date.now() - 259200000,
        updatedAt: Date.now() - 259200000,
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
