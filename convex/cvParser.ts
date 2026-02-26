"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

interface ParsedCV {
  fullName?: string;
  email?: string;
  phone?: string;
  county?: string;
  headline?: string;
  careerSummary?: string;
  skills?: string[];
  yearsOfExperience?: number;
  currentStatus?: "employed" | "unemployed" | "student" | "freelancer";
  desiredJobTitle?: string;
  languages?: Array<{
    language: string;
    proficiency?: "basic" | "conversational" | "fluent" | "native";
  }>;
  workExperience?: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    qualificationLevel?: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear?: string;
    grade?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate?: string;
  }>;
}

export const parseCV = action({
  args: {
    fileBuffer: v.bytes(),
  },
  handler: async (ctx, args): Promise<ParsedCV> => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    try {
      // Convert ArrayBuffer to Buffer for pdf-parse
      const buffer = Buffer.from(args.fileBuffer);
      
      // Extract text from PDF
      const pdfData = await pdf(buffer);
      const cvText = pdfData.text;

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Prompt for structured extraction
      const prompt = `
Extract the following information from this CV/Resume and return ONLY a valid JSON object with these exact fields:

{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "county": "Kenyan county name (e.g., Nairobi, Mombasa, Kiambu) or null",
  "headline": "professional headline/title or null",
  "careerSummary": "brief career summary/objective (2-3 sentences about career goals and experience) or null",
  "skills": ["array of skills"] or [],
  "yearsOfExperience": number or null,
  "currentStatus": "employed" or "unemployed" or "student" or "freelancer" or null,
  "desiredJobTitle": "string or null",
  "languages": [
    {
      "language": "string",
      "proficiency": "basic" or "conversational" or "fluent" or "native" or null
    }
  ] or [],
  "workExperience": [
    {
      "company": "string",
      "title": "string (job title)",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "currentlyWorking": boolean,
      "description": "brief description or null"
    }
  ] or [],
  "education": [
    {
      "institution": "string",
      "qualificationLevel": "certificate" or "diploma" or "degree" or "masters" or "phd" or "tvet",
      "fieldOfStudy": "string",
      "startYear": "YYYY",
      "endYear": "YYYY or null if current",
      "grade": "string or null"
    }
  ] or [],
  "certifications": [
    {
      "name": "string",
      "issuingOrganization": "string",
      "issueDate": "YYYY-MM or YYYY or null"
    }
  ] or []
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- Extract skills as an array (max 10 most relevant)
- Calculate yearsOfExperience from work history dates
- Infer currentStatus from latest job status
- For workExperience, extract up to 5 most recent/relevant positions
- For education, extract all degrees/diplomas
- For certifications, extract all professional certifications
- For languages, include proficiency level if mentioned
- For desiredJobTitle, match to one of these exact titles if possible: Software Developer, Software Engineer, Web Developer, Mobile App Developer, Data Analyst, IT Support Specialist, Network Administrator, Cybersecurity Analyst, Database Administrator, DevOps Engineer, UI/UX Designer, Systems Administrator, Technical Support Engineer, Marketing Manager, Digital Marketing Specialist, Social Media Manager, Content Creator, Brand Manager, SEO Specialist, Marketing Coordinator, Public Relations Officer, Market Research Analyst, Advertising Executive, Communications Officer, Accountant, Financial Analyst, Auditor, Tax Consultant, Credit Analyst, Investment Analyst, Finance Manager, Bookkeeper, Payroll Officer, Treasury Analyst, Risk Analyst, Civil Engineer, Mechanical Engineer, Electrical Engineer, Structural Engineer, Project Engineer, Quality Assurance Engineer, Maintenance Engineer, Site Engineer, Construction Manager, Quantity Surveyor, Nurse, Clinical Officer, Medical Doctor, Pharmacist, Lab Technician, Radiographer, Physiotherapist, Nutritionist, Health Records Officer, Medical Sales Representative, Teacher, Lecturer, Education Coordinator, School Administrator, Curriculum Developer, Training Officer, Academic Advisor, Education Consultant, Tutor, Early Childhood Educator, Sales Executive, Customer Service Representative, Driver, Secretary, Receptionist, Security Guard, Human Resources Officer, Administrative Assistant, Data Entry Clerk, Graphic Designer
- Use null if information is not found
- Use empty arrays [] if no items found

CV Text:
${cvText}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON response
      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const parsed = JSON.parse(cleanJson);
      return parsed;
      
    } catch (error: any) {
      console.error("CV parsing error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw new Error(`Failed to parse CV: ${error.message || 'Unknown error'}`);
    }
  },
});
