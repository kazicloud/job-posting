import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

export interface ParsedCV {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  skills?: string[];
  yearsOfExperience?: number;
  currentStatus?: "employed" | "unemployed" | "student" | "freelancer";
  desiredJobTitle?: string;
}

export async function parseCVWithGemini(
  fileBuffer: Buffer,
  apiKey: string
): Promise<ParsedCV> {
  // Extract text from PDF
  const pdfData = await pdf(fileBuffer);
  const cvText = pdfData.text;

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Prompt for structured extraction
  const prompt = `
Extract the following information from this CV/Resume and return ONLY a valid JSON object with these exact fields:

{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "city/town or null",
  "headline": "professional headline/title or null",
  "skills": ["array of skills"] or [],
  "yearsOfExperience": number or null,
  "currentStatus": "employed" or "unemployed" or "student" or "freelancer" or null,
  "desiredJobTitle": "string or null"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- Extract skills as an array (max 10 most relevant)
- Calculate yearsOfExperience from work history dates
- Infer currentStatus from latest job status
- Use null if information is not found

CV Text:
${cvText}
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    const cleanJson = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response);
    throw new Error("Failed to parse CV data");
  }
}

export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  const pdfData = await pdf(fileBuffer);
  return pdfData.text;
}
