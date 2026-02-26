export interface JobTitle {
  title: string;
  field: string;
  skills: string[];
}

// Universal soft skills that appear in all job suggestions
export const universalSkills = [
  "Communication",
  "Problem Solving",
  "Team Leadership",
  "Time Management",
  "Critical Thinking",
  "Adaptability",
  "Attention to Detail",
  "Organization",
];

// Common skills for users without a specific job title
export const fallbackSkills = [
  "Communication",
  "Problem Solving",
  "Team Leadership",
  "Time Management",
  "Microsoft Office",
  "Customer Service",
  "Data Entry",
  "Organization",
  "Attention to Detail",
  "Critical Thinking",
  "Adaptability",
  "Teamwork",
  "Project Management",
  "Sales",
  "Marketing",
  "Accounting",
  "Excel",
  "PowerPoint",
  "Email Management",
  "Social Media",
];

export const jobTitlesWithSkills: JobTitle[] = [
  // Technology - Expanded with modern skills
  { title: "Software Developer", field: "technology", skills: ["JavaScript", "Python", "Java", "React", "Node.js", "Git", "REST APIs", "SQL", "MongoDB", "TypeScript", "Express.js", "Problem Solving", "Debugging", "Agile", "Testing", "Docker", "AWS"] },
  { title: "Software Engineer", field: "technology", skills: ["Java", "C++", "Python", "JavaScript", "React", "Next.js", "Django", "Flask", "Node.js", "Express.js", "SQL", "PostgreSQL", "MongoDB", "System Design", "Algorithms", "Data Structures", "Testing", "CI/CD", "Docker", "Kubernetes", "AWS", "Git", "Microservices", "TypeScript"] },
  { title: "Web Developer", field: "technology", skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express.js", "TypeScript", "Tailwind CSS", "Bootstrap", "Responsive Design", "Git", "REST APIs", "GraphQL", "MongoDB", "MySQL", "Webpack", "Sass"] },
  { title: "Mobile App Developer", field: "technology", skills: ["React Native", "Flutter", "Swift", "Kotlin", "Java", "Dart", "Firebase", "Mobile UI/UX", "API Integration", "Redux", "State Management", "App Store Deployment", "Google Play", "Push Notifications", "SQLite", "Expo"] },
  { title: "Data Analyst", field: "technology", skills: ["Python", "R", "SQL", "Excel", "Power BI", "Tableau", "Data Visualization", "Statistics", "Pandas", "NumPy", "Machine Learning", "Data Cleaning", "ETL", "Google Analytics", "Critical Thinking", "Report Writing", "Jupyter", "Matplotlib"] },
  { title: "IT Support Specialist", field: "technology", skills: ["Windows", "Linux", "macOS", "Troubleshooting", "Networking", "Active Directory", "Office 365", "Hardware Repair", "Remote Support", "Ticketing Systems", "Customer Service", "VPN", "Antivirus", "Backup Solutions", "Help Desk"] },
  { title: "Network Administrator", field: "technology", skills: ["Cisco", "Networking", "TCP/IP", "DNS", "DHCP", "Firewall Configuration", "VPN", "Network Security", "Routing", "Switching", "LAN/WAN", "Network Monitoring", "Troubleshooting", "Linux", "Windows Server", "Wireshark"] },
  { title: "Cybersecurity Analyst", field: "technology", skills: ["Security Auditing", "Penetration Testing", "Ethical Hacking", "Firewall Management", "Incident Response", "Risk Assessment", "SIEM", "Vulnerability Assessment", "Compliance", "Network Security", "Cryptography", "Security Policies", "Threat Intelligence", "Kali Linux"] },
  { title: "Database Administrator", field: "technology", skills: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Database Design", "Backup & Recovery", "Performance Tuning", "Data Security", "Query Optimization", "Replication", "Indexing", "Data Migration", "ETL", "Redis"] },
  { title: "DevOps Engineer", field: "technology", skills: ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitLab CI", "AWS", "Azure", "GCP", "Linux", "Bash", "Python", "Terraform", "Ansible", "Monitoring", "Prometheus", "Grafana", "Git", "Automation", "Nginx"] },
  { title: "UI/UX Designer", field: "technology", skills: ["Figma", "Adobe XD", "Sketch", "Adobe Photoshop", "Adobe Illustrator", "User Research", "Wireframing", "Prototyping", "Visual Design", "Usability Testing", "Design Systems", "Responsive Design", "HTML/CSS", "User Flows", "InVision"] },
  { title: "Systems Administrator", field: "technology", skills: ["Linux", "Windows Server", "Active Directory", "PowerShell", "Bash", "Virtualization", "VMware", "Hyper-V", "System Monitoring", "Backup Solutions", "Security", "Networking", "Cloud Computing", "Automation", "Scripting"] },
  { title: "Technical Support Engineer", field: "technology", skills: ["Technical Troubleshooting", "Customer Service", "Documentation", "Remote Support", "Ticketing Systems", "Windows", "Linux", "Networking", "Hardware", "Software Installation", "Communication", "Problem Solving", "Jira", "Zendesk"] },

  // Marketing - Expanded
  { title: "Marketing Manager", field: "marketing", skills: ["Marketing Strategy", "Campaign Management", "Budget Management", "Team Leadership", "Google Analytics", "Brand Management", "Market Research", "Digital Marketing", "Content Strategy", "SEO", "Social Media", "Email Marketing", "CRM", "ROI Analysis", "Project Management"] },
  { title: "Digital Marketing Specialist", field: "marketing", skills: ["SEO", "Google Ads", "Facebook Ads", "Instagram Ads", "Email Marketing", "Content Marketing", "Google Analytics", "Social Media Marketing", "PPC", "Conversion Optimization", "A/B Testing", "Marketing Automation", "HubSpot", "Mailchimp", "Copywriting"] },
  { title: "Social Media Manager", field: "marketing", skills: ["Content Creation", "Social Media Strategy", "Community Management", "Facebook", "Instagram", "Twitter", "LinkedIn", "TikTok", "Analytics", "Copywriting", "Graphic Design", "Canva", "Hootsuite", "Buffer", "Engagement", "Influencer Marketing"] },
  { title: "Content Creator", field: "marketing", skills: ["Content Writing", "Video Editing", "Photography", "Storytelling", "SEO", "Social Media", "Creativity", "Adobe Premiere", "Final Cut Pro", "Canva", "Copywriting", "Blogging", "YouTube", "TikTok", "Instagram"] },
  { title: "Brand Manager", field: "marketing", skills: ["Brand Strategy", "Market Research", "Campaign Planning", "Budget Management", "Stakeholder Management", "Brand Identity", "Creative Direction", "Consumer Insights", "Competitive Analysis", "Product Positioning", "Marketing Communications"] },
  { title: "SEO Specialist", field: "marketing", skills: ["Keyword Research", "On-Page SEO", "Off-Page SEO", "Link Building", "Google Analytics", "Google Search Console", "Technical SEO", "Content Optimization", "SEMrush", "Ahrefs", "Moz", "Schema Markup", "Site Speed Optimization"] },
  { title: "Marketing Coordinator", field: "marketing", skills: ["Project Coordination", "Event Planning", "Communication", "Social Media", "Content Creation", "Organization", "Email Marketing", "Campaign Support", "Market Research", "Budget Tracking", "Vendor Management", "Microsoft Office"] },
  { title: "Public Relations Officer", field: "marketing", skills: ["Media Relations", "Press Release Writing", "Crisis Management", "Communication", "Networking", "Event Management", "Stakeholder Engagement", "Brand Reputation", "Public Speaking", "Social Media", "Content Writing", "Media Monitoring"] },
  { title: "Market Research Analyst", field: "marketing", skills: ["Data Analysis", "Survey Design", "Statistical Analysis", "Report Writing", "Excel", "SPSS", "Critical Thinking", "Consumer Behavior", "Competitive Analysis", "Focus Groups", "Quantitative Research", "Qualitative Research", "Presentation Skills"] },
  { title: "Advertising Executive", field: "marketing", skills: ["Campaign Planning", "Client Management", "Creative Thinking", "Negotiation", "Presentation Skills", "Media Planning", "Budget Management", "Copywriting", "Market Research", "Brand Strategy", "Digital Advertising"] },
  { title: "Communications Officer", field: "marketing", skills: ["Corporate Communication", "Writing", "Public Speaking", "Media Relations", "Content Management", "Internal Communications", "Crisis Communication", "Social Media", "Press Releases", "Newsletter Creation", "Stakeholder Engagement"] },

  // Finance - Expanded
  { title: "Accountant", field: "finance", skills: ["Accounting", "Financial Reporting", "Tax Preparation", "Excel", "QuickBooks", "Sage", "Attention to Detail", "IFRS", "GAAP", "Bookkeeping", "Reconciliation", "Auditing", "Financial Analysis", "Payroll", "VAT"] },
  { title: "Financial Analyst", field: "finance", skills: ["Financial Modeling", "Excel", "Data Analysis", "Forecasting", "Budgeting", "Report Writing", "Critical Thinking", "PowerPoint", "SQL", "Financial Statements", "Valuation", "Investment Analysis", "Risk Assessment", "Bloomberg"] },
  { title: "Auditor", field: "finance", skills: ["Auditing", "Risk Assessment", "Compliance", "Attention to Detail", "Report Writing", "Analytical Thinking", "Internal Controls", "IFRS", "Fraud Detection", "Excel", "Audit Software", "Financial Analysis", "Communication"] },
  { title: "Tax Consultant", field: "finance", skills: ["Tax Law", "Tax Planning", "Compliance", "Client Advisory", "Research", "Attention to Detail", "VAT", "Income Tax", "Corporate Tax", "Tax Returns", "Excel", "Tax Software", "Communication"] },
  { title: "Credit Analyst", field: "finance", skills: ["Credit Analysis", "Risk Assessment", "Financial Modeling", "Report Writing", "Excel", "Decision Making", "Financial Statements", "Loan Evaluation", "Industry Analysis", "Credit Scoring", "Communication"] },
  { title: "Investment Analyst", field: "finance", skills: ["Financial Analysis", "Market Research", "Portfolio Management", "Excel", "Bloomberg Terminal", "Critical Thinking", "Valuation", "Financial Modeling", "Investment Strategy", "Risk Analysis", "Report Writing"] },
  { title: "Finance Manager", field: "finance", skills: ["Financial Planning", "Budget Management", "Team Leadership", "Financial Reporting", "Strategic Planning", "Cash Flow Management", "Forecasting", "Excel", "ERP Systems", "Risk Management", "Stakeholder Management"] },
  { title: "Bookkeeper", field: "finance", skills: ["Bookkeeping", "QuickBooks", "Sage", "Data Entry", "Reconciliation", "Attention to Detail", "Organization", "Accounts Payable", "Accounts Receivable", "Excel", "Payroll", "Financial Records"] },
  { title: "Payroll Officer", field: "finance", skills: ["Payroll Processing", "Tax Compliance", "Excel", "Attention to Detail", "Confidentiality", "Time Management", "PAYE", "NSSF", "NHIF", "Payroll Software", "Labor Laws", "Record Keeping"] },
  { title: "Treasury Analyst", field: "finance", skills: ["Cash Management", "Financial Analysis", "Risk Management", "Excel", "Banking Operations", "Liquidity Management", "Foreign Exchange", "Investment Management", "Financial Modeling", "Treasury Systems"] },
  { title: "Risk Analyst", field: "finance", skills: ["Risk Assessment", "Data Analysis", "Compliance", "Report Writing", "Critical Thinking", "Excel", "Risk Modeling", "Financial Analysis", "Regulatory Knowledge", "Risk Mitigation", "Communication"] },

  // Engineering - Expanded
  { title: "Civil Engineer", field: "engineering", skills: ["AutoCAD", "Structural Design", "Project Management", "Site Supervision", "Construction Management", "Technical Drawing", "Quantity Surveying", "Building Codes", "Surveying", "Concrete Design", "Steel Design", "Cost Estimation"] },
  { title: "Mechanical Engineer", field: "engineering", skills: ["CAD", "SolidWorks", "Mechanical Design", "Thermodynamics", "Manufacturing Processes", "Problem Solving", "Project Management", "HVAC", "Fluid Mechanics", "Materials Science", "3D Modeling", "Technical Drawing"] },
  { title: "Electrical Engineer", field: "engineering", skills: ["Circuit Design", "Electrical Systems", "AutoCAD", "PLC Programming", "Troubleshooting", "Project Management", "Power Systems", "Control Systems", "Electrical Installation", "Wiring Diagrams", "Safety Standards"] },
  { title: "Structural Engineer", field: "engineering", skills: ["Structural Analysis", "AutoCAD", "ETABS", "SAP2000", "Building Codes", "Load Calculations", "Technical Drawing", "Project Management", "Steel Design", "Concrete Design", "Foundation Design", "Seismic Design"] },
  { title: "Project Engineer", field: "engineering", skills: ["Project Management", "Technical Documentation", "Budget Management", "Quality Control", "Team Coordination", "MS Project", "AutoCAD", "Contract Management", "Risk Management", "Scheduling", "Stakeholder Communication"] },
  { title: "Quality Assurance Engineer", field: "engineering", skills: ["Quality Control", "Testing", "ISO Standards", "Documentation", "Problem Solving", "Attention to Detail", "Root Cause Analysis", "Process Improvement", "Inspection", "Quality Management Systems", "Auditing"] },
  { title: "Maintenance Engineer", field: "engineering", skills: ["Preventive Maintenance", "Troubleshooting", "Equipment Repair", "Technical Documentation", "Safety Compliance", "Mechanical Systems", "Electrical Systems", "CMMS", "Root Cause Analysis", "Reliability Engineering"] },
  { title: "Site Engineer", field: "engineering", skills: ["Site Supervision", "Construction Management", "Quality Control", "Technical Drawing", "Safety Management", "AutoCAD", "Surveying", "Material Testing", "Progress Reporting", "Coordination", "Problem Solving"] },
  { title: "Construction Manager", field: "engineering", skills: ["Project Management", "Budget Management", "Team Leadership", "Construction Planning", "Safety Management", "Contract Management", "Scheduling", "Quality Control", "Risk Management", "Stakeholder Management", "MS Project"] },
  { title: "Quantity Surveyor", field: "engineering", skills: ["Cost Estimation", "Bill of Quantities", "Contract Management", "Excel", "Construction Knowledge", "Tendering", "Valuation", "Cost Control", "Measurement", "Procurement", "Claims Management"] },

  // Healthcare - Expanded
  { title: "Nurse", field: "healthcare", skills: ["Patient Care", "Medical Procedures", "Medication Administration", "Communication", "Empathy", "Emergency Response", "Vital Signs Monitoring", "Wound Care", "IV Therapy", "Patient Assessment", "Medical Records", "Infection Control"] },
  { title: "Clinical Officer", field: "healthcare", skills: ["Patient Diagnosis", "Medical Treatment", "Emergency Care", "Medical Records", "Communication", "Clinical Skills", "Patient Assessment", "Prescription", "Minor Surgery", "Health Education", "Laboratory Interpretation"] },
  { title: "Medical Doctor", field: "healthcare", skills: ["Diagnosis", "Treatment Planning", "Patient Care", "Medical Knowledge", "Communication", "Decision Making", "Emergency Medicine", "Clinical Examination", "Prescription", "Medical Ethics", "Research", "Leadership"] },
  { title: "Pharmacist", field: "healthcare", skills: ["Pharmaceutical Knowledge", "Prescription Dispensing", "Patient Counseling", "Inventory Management", "Attention to Detail", "Drug Interactions", "Pharmacy Software", "Compounding", "Quality Control", "Regulatory Compliance"] },
  { title: "Lab Technician", field: "healthcare", skills: ["Laboratory Testing", "Sample Analysis", "Equipment Operation", "Attention to Detail", "Quality Control", "Microscopy", "Blood Analysis", "Urinalysis", "Laboratory Safety", "Record Keeping", "Calibration"] },
  { title: "Radiographer", field: "healthcare", skills: ["X-Ray Operation", "Patient Positioning", "Radiation Safety", "Image Analysis", "Technical Skills", "CT Scan", "MRI", "Ultrasound", "PACS", "Patient Care", "Equipment Maintenance"] },
  { title: "Physiotherapist", field: "healthcare", skills: ["Physical Therapy", "Patient Assessment", "Treatment Planning", "Exercise Prescription", "Communication", "Manual Therapy", "Rehabilitation", "Pain Management", "Mobility Training", "Patient Education"] },
  { title: "Nutritionist", field: "healthcare", skills: ["Nutrition Planning", "Diet Counseling", "Health Assessment", "Communication", "Research", "Client Management", "Meal Planning", "Nutrition Education", "Weight Management", "Clinical Nutrition", "Food Science"] },
  { title: "Health Records Officer", field: "healthcare", skills: ["Medical Records Management", "Data Entry", "Confidentiality", "Organization", "Attention to Detail", "ICD Coding", "Medical Terminology", "Filing Systems", "Database Management", "HIPAA Compliance"] },
  { title: "Medical Sales Representative", field: "healthcare", skills: ["Sales", "Product Knowledge", "Client Relations", "Presentation Skills", "Negotiation", "Territory Management", "Medical Terminology", "Relationship Building", "Market Analysis", "CRM", "Communication"] },

  // Education - Expanded
  { title: "Teacher", field: "education", skills: ["Lesson Planning", "Classroom Management", "Communication", "Subject Knowledge", "Assessment", "Patience", "Differentiated Instruction", "Student Engagement", "Curriculum Development", "Educational Technology", "Parent Communication"] },
  { title: "Lecturer", field: "education", skills: ["Teaching", "Research", "Curriculum Development", "Public Speaking", "Subject Expertise", "Academic Writing", "Student Assessment", "Mentoring", "Educational Technology", "Research Methodology", "Publication"] },
  { title: "Education Coordinator", field: "education", skills: ["Program Coordination", "Curriculum Planning", "Communication", "Organization", "Team Management", "Budget Management", "Event Planning", "Stakeholder Engagement", "Training Delivery", "Assessment"] },
  { title: "School Administrator", field: "education", skills: ["Administration", "Budget Management", "Staff Management", "Policy Implementation", "Communication", "Leadership", "Strategic Planning", "Compliance", "Student Affairs", "Facility Management"] },
  { title: "Curriculum Developer", field: "education", skills: ["Curriculum Design", "Educational Research", "Content Development", "Assessment Design", "Writing", "Instructional Design", "Learning Objectives", "Educational Standards", "Evaluation", "Subject Matter Expertise"] },
  { title: "Training Officer", field: "education", skills: ["Training Delivery", "Needs Assessment", "Content Development", "Presentation Skills", "Evaluation", "Facilitation", "Adult Learning", "E-Learning", "Training Materials", "Performance Improvement"] },
  { title: "Academic Advisor", field: "education", skills: ["Student Counseling", "Academic Planning", "Communication", "Problem Solving", "Record Keeping", "Career Guidance", "Student Support", "Policy Knowledge", "Advising Software", "Mentoring"] },
  { title: "Education Consultant", field: "education", skills: ["Educational Assessment", "Advisory Services", "Research", "Report Writing", "Communication", "Policy Analysis", "Program Evaluation", "Strategic Planning", "Stakeholder Engagement", "Change Management"] },
  { title: "Tutor", field: "education", skills: ["Subject Knowledge", "One-on-One Teaching", "Patience", "Communication", "Assessment", "Adaptability", "Lesson Planning", "Student Motivation", "Progress Tracking", "Feedback"] },
  { title: "Early Childhood Educator", field: "education", skills: ["Child Development", "Activity Planning", "Classroom Management", "Communication", "Patience", "Creativity", "Play-Based Learning", "Parent Communication", "Safety", "Observation", "Assessment"] },

  // Popular General Jobs - Expanded
  { title: "Sales Executive", field: "sales", skills: ["Sales", "Negotiation", "Customer Relations", "Communication", "Target Achievement", "Product Knowledge", "CRM", "Lead Generation", "Closing Deals", "Presentation Skills", "Market Research", "Cold Calling"] },
  { title: "Customer Service Representative", field: "customer_service", skills: ["Customer Service", "Communication", "Problem Solving", "Patience", "Active Listening", "Conflict Resolution", "CRM Software", "Phone Etiquette", "Email Communication", "Multitasking", "Empathy", "Product Knowledge"] },
  { title: "Driver", field: "logistics", skills: ["Driving", "Navigation", "Vehicle Maintenance", "Time Management", "Customer Service", "Safety Awareness", "Route Planning", "Defensive Driving", "GPS", "Record Keeping", "Communication"] },
  { title: "Secretary", field: "administration", skills: ["Office Administration", "Communication", "Organization", "Microsoft Office", "Word", "Excel", "PowerPoint", "Scheduling", "Record Keeping", "Email Management", "Phone Etiquette", "Filing", "Meeting Coordination"] },
  { title: "Receptionist", field: "customer_service", skills: ["Customer Service", "Communication", "Phone Etiquette", "Organization", "Microsoft Office", "Multitasking", "Scheduling", "Front Desk Management", "Visitor Management", "Email", "Professional Appearance"] },
  { title: "Security Guard", field: "security", skills: ["Security Procedures", "Surveillance", "Incident Reporting", "Alertness", "Physical Fitness", "Communication", "Access Control", "Patrol", "Emergency Response", "Conflict Resolution", "CCTV Monitoring"] },
  { title: "Human Resources Officer", field: "hr", skills: ["Recruitment", "Employee Relations", "HR Policies", "Communication", "Conflict Resolution", "Record Keeping", "Onboarding", "Performance Management", "Labor Laws", "HRIS", "Interviewing", "Training Coordination"] },
  { title: "Administrative Assistant", field: "administration", skills: ["Office Administration", "Microsoft Office", "Word", "Excel", "PowerPoint", "Communication", "Organization", "Time Management", "Data Entry", "Scheduling", "Email Management", "Document Preparation", "Filing"] },
  { title: "Data Entry Clerk", field: "administration", skills: ["Data Entry", "Typing Speed", "Attention to Detail", "Microsoft Excel", "Accuracy", "Time Management", "Database Management", "10-Key", "Data Verification", "Confidentiality", "Organization"] },
  { title: "Graphic Designer", field: "creative", skills: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Graphic Design", "Creativity", "Typography", "Branding", "Logo Design", "Layout Design", "Color Theory", "Print Design", "Digital Design", "Figma", "Canva"] },
];

// Legacy exports for backward compatibility
export const jobTitlesByField: Record<string, string[]> = {
  technology: jobTitlesWithSkills.filter(j => j.field === "technology").map(j => j.title),
  marketing: jobTitlesWithSkills.filter(j => j.field === "marketing").map(j => j.title),
  finance: jobTitlesWithSkills.filter(j => j.field === "finance").map(j => j.title),
  engineering: jobTitlesWithSkills.filter(j => j.field === "engineering").map(j => j.title),
  healthcare: jobTitlesWithSkills.filter(j => j.field === "healthcare").map(j => j.title),
  education: jobTitlesWithSkills.filter(j => j.field === "education").map(j => j.title),
  hospitality: [],
  agriculture: [],
  construction: [],
  logistics: [],
  creative: [],
  customer_service: [],
};

export const popularJobs = [
  "Accountant",
  "Sales Executive",
  "Customer Service Representative",
  "Driver",
  "Secretary",
  "Receptionist",
  "Security Guard",
  "Teacher",
  "Nurse",
  "Software Developer",
  "Marketing Manager",
  "Human Resources Officer",
  "Administrative Assistant",
  "Data Entry Clerk",
  "Graphic Designer",
];
