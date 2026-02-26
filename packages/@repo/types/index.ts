export type UserRole = "job_seeker" | "employer" | "admin" | "recruiter";

export type JobStatus = "draft" | "published" | "closed" | "archived";

export type ApplicationStatus = 
  | "submitted" 
  | "under_review" 
  | "shortlisted" 
  | "interview" 
  | "rejected" 
  | "accepted";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export interface JobSeeker extends User {
  role: "job_seeker";
  fullName: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
}

export interface Employer extends User {
  role: "employer";
  companyName: string;
  companySize?: string;
  industry?: string;
  website?: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  type: "full_time" | "part_time" | "contract" | "internship";
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobSeekerId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: number;
  updatedAt: number;
}
