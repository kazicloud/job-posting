// Mock data for development
export const mockJobs = [
  {
    id: "1",
    title: "Senior Full-Stack Engineer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    description: "We're looking for an experienced full-stack engineer to join our growing team. You'll work on building scalable web applications using modern technologies.",
    postedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignHub",
    location: "New York, NY",
    type: "Full-time",
    description: "Join our design team to create beautiful, user-centered products. Experience with Figma and design systems required.",
    postedAt: "3 days ago",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Remote",
    type: "Contract",
    description: "Help us build and maintain our cloud infrastructure. Strong AWS and Kubernetes experience needed.",
    postedAt: "5 days ago",
  },
  {
    id: "4",
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Build responsive, performant web applications with React and TypeScript. Join a fast-paced startup environment.",
    postedAt: "1 week ago",
  },
];

export const mockStats = [
  { label: "Active Applications", value: 3, trend: { value: "+1 this week", positive: true } },
  { label: "Profile Views", value: 24, trend: { value: "+8 this week", positive: true } },
  { label: "Saved Jobs", value: 7 },
];

export const mockActivities = [
  {
    id: "1",
    type: "application" as const,
    jobTitle: "Senior Full-Stack Engineer",
    company: "TechCorp",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "view" as const,
    jobTitle: "Product Designer",
    company: "DesignHub",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "save" as const,
    jobTitle: "DevOps Engineer",
    company: "CloudScale",
    timestamp: "1 day ago",
  },
];

export const mockProfileCompleteness = {
  percentage: 65,
  missingItems: [
    "Add your resume",
    "Complete work experience",
    "Add skills and certifications",
  ],
};
