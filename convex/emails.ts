"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Shared email template styles
const getEmailTemplate = (content: string) => {
  const logoUrl = process.env.LOGO_URL || "https://kazicloud.co.ke/images/kazicloud-logo.jpg";
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1e293b;
            background-color: #f8fafc;
          }
          .email-wrapper { 
            width: 100%; 
            background-color: #f8fafc; 
            padding: 40px 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .email-header { 
            background-color: #ffffff;
            padding: 32px 40px;
            border-bottom: 1px solid #e2e8f0;
            text-align: center;
          }
          .logo { 
            width: 48px; 
            height: 48px; 
            margin: 0 auto 16px;
            border-radius: 8px;
          }
          .brand-name {
            font-size: 24px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
          }
          .email-content { 
            padding: 40px;
            background-color: #ffffff;
          }
          .greeting {
            font-size: 16px;
            color: #475569;
            margin: 0 0 24px 0;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 16px 0;
            line-height: 1.3;
          }
          .text {
            font-size: 15px;
            color: #475569;
            margin: 0 0 24px 0;
          }
          .info-card { 
            background-color: #f7f9fc;
            border-left: 4px solid #DC842C;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-row {
            margin: 12px 0;
          }
          .info-label {
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
          }
          .info-value {
            font-size: 15px;
            color: #0f172a;
            margin: 0;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button { 
            display: inline-block;
            background-color: #DC842C;
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #c67525;
          }
          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }
          .footer-note {
            font-size: 14px;
            color: #64748b;
            margin: 24px 0 0 0;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
          }
          .email-footer { 
            padding: 32px 40px;
            background-color: #f8fafc;
            text-align: center;
          }
          .footer-text {
            font-size: 13px;
            color: #94a3b8;
            margin: 8px 0;
          }
          .footer-link {
            color: #DC842C;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .email-content { padding: 24px !important; }
            .email-header { padding: 24px !important; }
            .title { font-size: 20px !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <img src="${logoUrl}" alt="Kazicloud" class="logo" />
              <h1 class="brand-name">Kazicloud</h1>
            </div>
            ${content}
            <div class="email-footer">
              <p class="footer-text">© ${new Date().getFullYear()} Kazicloud Platform. All rights reserved.</p>
              <p class="footer-text">
                <a href="https://kazicloud.co.ke" class="footer-link">Visit Website</a> • 
                <a href="mailto:support@kazicloud.co.ke" class="footer-link">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Notify employer of new application
export const notifyEmployerNewApplication = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.runQuery(api.applications.getApplicationById, { applicationId: args.applicationId });
    if (!application) return { success: false, error: "Application not found" };

    const job = application.job;
    const jobSeeker = application.jobSeeker;
    const employer = await ctx.runQuery(api.users.get, { id: job.employerId });
    
    if (!employer?.email) return { success: false, error: "Employer email not found" };

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const applicationUrl = `${webUrl}/employer-dashboard/applications/${args.applicationId}`;
    const jobApplicationsUrl = `${webUrl}/employer-dashboard/applications?jobId=${job._id}`;

    const content = `
      <div class="email-content">
        <p class="greeting">Hello ${employer.fullName || 'there'},</p>
        
        <h2 class="title">New Application Received</h2>
        
        <p class="text">
          You have received a new application for your job posting. A qualified candidate has expressed interest in joining your team.
        </p>

        <div class="info-card">
          <div class="info-row">
            <p class="info-label">Job Position</p>
            <p class="info-value">${job.title}</p>
          </div>
          <div class="info-row">
            <p class="info-label">Candidate Name</p>
            <p class="info-value">${jobSeeker?.name || 'Not provided'}</p>
          </div>
          ${application.matchScore ? `
          <div class="info-row">
            <p class="info-label">Match Score</p>
            <p class="info-value">${application.matchScore}% match</p>
          </div>
          ` : ''}
          <div class="info-row">
            <p class="info-label">Applied On</p>
            <p class="info-value">${new Date(application._creationTime).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        <div class="button-container">
          <a href="${applicationUrl}" class="button">Review Application</a>
        </div>

        <p class="text" style="text-align: center; margin-top: 16px;">
          <a href="${jobApplicationsUrl}" style="color: #DC842C; text-decoration: none;">View all applications for this job</a>
        </p>

        <p class="footer-note">
          This is an automated notification. Please review the application at your earliest convenience to maintain a positive candidate experience.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@kazicloud.co.ke>",
        to: [employer.email],
        subject: `New Application: ${job.title}`,
        html: getEmailTemplate(content),
      });

      console.log("Employer notification email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending employer notification:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Action to notify admin about new employer signup
export const notifyAdminNewEmployer = internalAction({
  args: {
    employerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const employer = await ctx.runQuery(api.users.get, { id: args.employerId });
    if (!employer) return { success: false, error: "Employer not found" };

    const profile = await ctx.runQuery(api.profile.getEmployerProfile, { userId: args.employerId });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@kazicloud.co.ke";
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    const companyName = profile?.companyName || "N/A";
    const employerName = employer.fullName || "N/A";

    // Always send to kazicloudcareers@gmail.com + admin email (if different)
    const recipients = ["kazicloudcareers@gmail.com"];
    if (adminEmail !== "kazicloudcareers@gmail.com") {
      recipients.push(adminEmail);
    }

    const content = `
      <div class="email-content">
        <p class="greeting">Hello Admin,</p>
        
        <h2 class="title">New Employer Registration</h2>
        
        <p class="text">
          A new employer has registered on Kazicloud Platform and requires verification before they can post jobs.
        </p>

        <div class="info-card">
          <div class="info-row">
            <p class="info-label">Company Name</p>
            <p class="info-value">${companyName}</p>
          </div>
          <div class="info-row">
            <p class="info-label">Contact Person</p>
            <p class="info-value">${employerName}</p>
          </div>
          <div class="info-row">
            <p class="info-label">Email Address</p>
            <p class="info-value">${employer.email}</p>
          </div>
          ${employer.phone ? `
          <div class="info-row">
            <p class="info-label">Phone Number</p>
            <p class="info-value">${employer.phone}</p>
          </div>
          ` : ''}
          ${employer.location ? `
          <div class="info-row">
            <p class="info-label">Location</p>
            <p class="info-value">${employer.location}</p>
          </div>
          ` : ''}
          <div class="info-row">
            <p class="info-label">Registered On</p>
            <p class="info-value">${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        <div class="button-container">
          <a href="${adminUrl}/employers/${args.employerId}" class="button">Review & Verify Employer</a>
        </div>

        <p class="footer-note">
          Please review and verify this employer account to enable them to post job opportunities on the platform.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@kazicloud.co.ke>",
        to: recipients,
        subject: `New Employer Registration: ${companyName}`,
        html: getEmailTemplate(content),
      });

      console.log("Admin notification email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Action to notify employer of verification approval
export const notifyEmployerVerified = action({
  args: {
    employerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const employer = await ctx.runQuery(api.users.get, { id: args.employerId });
    if (!employer) return { success: false, error: "Employer not found" };

    const profile = await ctx.runQuery(api.profile.getEmployerProfile, { userId: args.employerId });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const dashboardUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const companyName = profile?.companyName || "Your Company";
    const contactName = employer.fullName || "there";

    const content = `
      <div class="email-content">
        <p class="greeting">Dear ${contactName},</p>
        
        <h2 class="title">Your Company Has Been Verified</h2>
        
        <p class="text">
          Congratulations! <strong>${companyName}</strong> has been successfully verified on Kazicloud Platform. You can now start posting jobs and connecting with talented professionals.
        </p>

        <div class="button-container">
          <a href="${dashboardUrl}/employer-dashboard" class="button">Go to Dashboard</a>
        </div>

        <div class="info-card" style="background-color: #FFF7ED; border-left-color: #FDBA74;">
          <h3 style="margin-top: 0; color: #DC842C; font-size: 16px;">Important Platform Guidelines</h3>
          <p style="margin: 12px 0;"><strong>Kazicloud is a fair and transparent platform.</strong> To maintain trust and integrity:</p>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li style="margin: 8px 0;"><strong>Never request payment</strong> from job seekers for applications, interviews, or job offers</li>
            <li style="margin: 8px 0;"><strong>No recruitment fees</strong> - Job seekers should never pay to apply or get hired</li>
            <li style="margin: 8px 0;"><strong>Honest job postings</strong> - Ensure all job details are accurate and legitimate</li>
            <li style="margin: 8px 0;"><strong>Professional conduct</strong> - Treat all candidates with respect and fairness</li>
            <li style="margin: 8px 0;"><strong>Timely communication</strong> - Respond to applications and keep candidates informed</li>
          </ul>
          <p style="margin: 12px 0; color: #DC842C; font-weight: 600;">Violation of these guidelines may result in account suspension or permanent ban.</p>
        </div>

        <div style="margin: 24px 0;">
          <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0;">Tips for Success</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin: 8px 0;">Write clear, detailed job descriptions</li>
            <li style="margin: 8px 0;">Include salary ranges to attract quality candidates</li>
            <li style="margin: 8px 0;">Respond to applications within 48 hours</li>
            <li style="margin: 8px 0;">Keep your company profile updated</li>
          </ul>
        </div>

        <p class="footer-note">
          Need help getting started? Contact us at <a href="mailto:support@kazicloud.co.ke" style="color: #DC842C; text-decoration: none;">support@kazicloud.co.ke</a>
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@kazicloud.co.ke>",
        to: [employer.email],
        subject: "Your Company Has Been Verified - Start Posting Jobs",
        html: getEmailTemplate(content),
      });

      console.log("Verification email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Action to notify employer of verification rejection
export const notifyEmployerRejected = action({
  args: {
    employerId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const employer = await ctx.runQuery(api.users.get, { id: args.employerId });
    if (!employer) return { success: false, error: "Employer not found" };

    const profile = await ctx.runQuery(api.profile.getEmployerProfile, { userId: args.employerId });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const supportUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const companyName = profile?.companyName || "Your Company";
    const contactName = employer.fullName || "there";

    const content = `
      <div class="email-content">
        <p class="greeting">Dear ${contactName},</p>
        
        <h2 class="title">Verification Status Update</h2>
        
        <p class="text">
          Thank you for your interest in joining Kazicloud Platform. After reviewing your application for <strong>${companyName}</strong>, we are unable to verify your account at this time.
        </p>

        ${args.reason ? `
        <div class="info-card" style="background-color: #FEF2F2; border-left-color: #FCA5A5;">
          <h3 style="margin-top: 0; font-size: 16px; color: #0f172a;">Reason for Rejection</h3>
          <p style="margin: 0; color: #475569;">${args.reason}</p>
        </div>
        ` : ''}

        <div style="margin: 24px 0;">
          <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0;">What You Can Do</h3>
          <p class="text">If you believe this decision was made in error or if you have additional information to share:</p>
          <ul style="margin: 12px 0; padding-left: 20px; color: #475569;">
            <li style="margin: 8px 0;">Review and update your company information</li>
            <li style="margin: 8px 0;">Ensure all verification documents are clear and valid</li>
            <li style="margin: 8px 0;">Contact our support team for clarification</li>
          </ul>
        </div>

        <div class="button-container">
          <a href="mailto:support@kazicloud.co.ke" class="button">Contact Support</a>
        </div>

        <div style="margin: 24px 0;">
          <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0;">Common Reasons for Rejection</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin: 8px 0;">Incomplete or unclear verification documents</li>
            <li style="margin: 8px 0;">Company information could not be verified</li>
            <li style="margin: 8px 0;">Suspicious or fraudulent activity detected</li>
            <li style="margin: 8px 0;">Non-compliance with platform policies</li>
          </ul>
        </div>

        <p class="footer-note">
          We're here to help! Reach out to us at <a href="mailto:support@kazicloud.co.ke" style="color: #DC842C; text-decoration: none;">support@kazicloud.co.ke</a> for assistance.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@kazicloud.co.ke>",
        to: [employer.email],
        subject: "Update on Your Kazicloud Platform Verification",
        html: getEmailTemplate(content),
      });

      console.log("Rejection email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending rejection email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});
