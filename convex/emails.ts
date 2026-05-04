"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ---------------------------------------------------------------------------
// Shared modern email template
// ---------------------------------------------------------------------------
const getEmailTemplate = (content: string, preheader = "") => {
  const logoUrl = process.env.LOGO_URL || "https://kazicloud.co.ke/images/kazicloud-logo.jpg";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Kazicloud</title>
  ${preheader ? `<!--[if !mso]><!--><div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${preheader}&nbsp;‌&zwnj;&nbsp;‌&zwnj;</div><!--<![endif]-->` : ""}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 16px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,0.08); }

    /* Header */
    .header { background: #ffffff; padding: 28px 40px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
    .logo-wrap { display: inline-flex; align-items: center; gap: 10px; }
    .logo { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
    .brand { font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; }
    .brand span { color: #DC842C; }

    /* Content */
    .content { padding: 40px; }
    .greeting { font-size: 15px; color: #64748b; margin: 0 0 6px; }
    .headline { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.25; margin: 0 0 20px; letter-spacing: -0.5px; }
    .headline .accent { color: #DC842C; }
    .body-text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 24px; }

    /* Status badge */
    .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }
    .badge-orange { background: #FFF3E0; color: #DC842C; }
    .badge-green  { background: #F0FDF4; color: #16a34a; }
    .badge-blue   { background: #EFF6FF; color: #2563eb; }
    .badge-red    { background: #FEF2F2; color: #dc2626; }

    /* Job card */
    .job-card { border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 24px 0; background: #ffffff; }
    .job-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
    .company-avatar { width: 48px; height: 48px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #DC842C; flex-shrink: 0; overflow: hidden; }
    .company-avatar img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .job-title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .company-name { font-size: 14px; color: #64748b; font-weight: 500; margin: 0 0 4px; }
    .job-meta { font-size: 13px; color: #94a3b8; margin: 0; }
    .job-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .tag { padding: 4px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #475569; font-weight: 500; }

    /* Detail card */
    .detail-card { background: #f8fafc; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .detail-row { display: flex; gap: 10px; margin: 0 0 14px; }
    .detail-row:last-child { margin: 0; }
    .detail-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 3px; }
    .detail-value { font-size: 15px; color: #0f172a; font-weight: 500; margin: 0; }

    /* CTA Button */
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #DC842C; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 10px; letter-spacing: -0.1px; }
    .btn-outline { display: inline-block; background: transparent; color: #DC842C !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 8px; border: 1.5px solid #DC842C; margin-top: 12px; }

    /* Alert boxes */
    .alert { border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .alert-orange { background: #FFF7ED; border: 1px solid #FDBA74; }
    .alert-red    { background: #FEF2F2; border: 1px solid #FCA5A5; }
    .alert-green  { background: #F0FDF4; border: 1px solid #86EFAC; }
    .alert-title { font-size: 14px; font-weight: 600; margin: 0 0 8px; color: #0f172a; }
    .alert-text  { font-size: 14px; color: #475569; margin: 0; line-height: 1.6; }

    /* Divider */
    .divider { height: 1px; background: #f1f5f9; margin: 28px 0; }

    /* Footer */
    .footer-note { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 28px 0 0; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .footer { padding: 24px 40px 32px; background: #f8fafc; text-align: center; }
    .footer-text { font-size: 12px; color: #94a3b8; margin: 6px 0; line-height: 1.6; }
    .footer-link { color: #DC842C; text-decoration: none; }

    @media (max-width: 600px) {
      .wrapper { padding: 16px 8px !important; }
      .header, .content, .footer { padding: 20px !important; }
      .headline { font-size: 22px !important; }
      .job-card { padding: 16px !important; }
      .detail-card { padding: 16px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-wrap">
          <img src="${logoUrl}" alt="Kazicloud" class="logo" />
          <span class="brand">Kazi<span>cloud</span></span>
        </div>
      </div>

      <!-- Body -->
      ${content}

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">© ${year} Kazicloud Platform. All rights reserved.</p>
        <p class="footer-text">
          <a href="https://kazicloud.co.ke" class="footer-link">Visit Website</a>
          &nbsp;•&nbsp;
          <a href="mailto:support@contact.kazicloud.co.ke" class="footer-link">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
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

    const initials = (jobSeeker?.name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const appliedDate = new Date(application._creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const content = `
      <div class="content">
        <p class="greeting">Hello ${employer.fullName || "there"},</p>
        <h2 class="headline">You have a <span class="accent">new applicant</span> for ${job.title}</h2>
        <p class="body-text">A candidate has submitted an application and is waiting for your review. Check their profile and move them through the hiring pipeline.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar">${initials}</div>
            <div>
              <p class="job-title">${jobSeeker?.name || "Applicant"}</p>
              <p class="company-name">${jobSeeker?.email || ""}</p>
              <p class="job-meta">Applied for &middot; ${job.title}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            <span class="tag">📅 ${appliedDate}</span>
            ${application.matchScore ? `<span class="tag" style="background:#FFF7ED;border-color:#FDBA74;color:#DC842C;">⚡ ${application.matchScore}% match</span>` : ""}
            ${job.location ? `<span class="tag">📍 ${job.location}</span>` : ""}
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${applicationUrl}" class="btn">Review Application</a>
        </div>
        <p style="text-align:center;margin:0;">
          <a href="${jobApplicationsUrl}" class="btn-outline">View All Applications</a>
        </p>

        <p class="footer-note">
          This notification was sent because a candidate applied to one of your job postings on Kazicloud. Respond promptly to give candidates a great experience.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [employer.email],
        subject: `New Application: ${job.title}`,
        html: getEmailTemplate(content, `${jobSeeker?.name || "A candidate"} just applied for ${job.title}`),
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

    const adminEmail = process.env.ADMIN_EMAIL || "admin@contact.kazicloud.co.ke";
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    const companyName = profile?.companyName || "N/A";
    const employerName = employer.fullName || "N/A";

    // Always send to kazicloudcareers@gmail.com + admin email (if different)
    const recipients = ["kazicloudcareers@gmail.com"];
    if (adminEmail !== "kazicloudcareers@gmail.com") {
      recipients.push(adminEmail);
    }

    const content = `
      <div class="content">
        <p class="greeting">Action required</p>
        <h2 class="headline">New employer needs <span class="accent">verification</span></h2>
        <p class="body-text">A new employer has completed registration and is waiting for your review before they can post jobs on the platform.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#FFF7ED;color:#DC842C;font-size:20px;">🏢</div>
            <div>
              <p class="job-title">${companyName}</p>
              <p class="company-name">${employerName}</p>
              <p class="job-meta">${employer.email}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            ${employer.phone ? `<span class="tag">📞 ${employer.phone}</span>` : ""}
            ${employer.county ? `<span class="tag">📍 ${employer.county}</span>` : ""}
            <span class="tag">📅 ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            <span class="badge badge-orange">Pending Verification</span>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${adminUrl}/employers/${args.employerId}" class="btn">Review &amp; Verify Employer</a>
        </div>

        <p class="footer-note">
          Please review the employer account and verify or reject it from the admin panel. Verified employers can immediately start posting jobs.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: recipients,
        subject: `New Employer Registration: ${companyName}`,
        html: getEmailTemplate(content, `${companyName} has registered and needs verification`),
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
      <div class="content">
        <p class="greeting">Congratulations, ${contactName}!</p>
        <h2 class="headline">${companyName} is <span class="accent">verified</span> ✓</h2>
        <p class="body-text">Your company has been reviewed and approved on Kazicloud. You can now post jobs, receive applications, and connect with thousands of talented professionals across Kenya.</p>

        <div class="btn-wrap">
          <a href="${dashboardUrl}/employer-dashboard" class="btn">Go to Dashboard &rarr;</a>
        </div>

        <div class="alert alert-orange">
          <p class="alert-title">⚠️ Platform Guidelines — Please Read</p>
          <p class="alert-text">To keep Kazicloud safe and fair for all job seekers:</p>
          <ul style="margin:10px 0 0;padding-left:18px;color:#475569;font-size:14px;line-height:1.8;">
            <li><strong>Never charge job seekers</strong> to apply, interview, or get hired</li>
            <li>Post accurate, legitimate job opportunities only</li>
            <li>Treat all candidates professionally and respond promptly</li>
            <li>Misuse may result in immediate account suspension</li>
          </ul>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Quick start tips</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:18px;">📝</span>
            <div><p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Write a great job post</p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">Clear descriptions with salary ranges attract better candidates</p></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:18px;">⚡</span>
            <div><p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Respond within 48 hours</p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">Fast responses improve candidate experience and your hiring rate</p></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:18px;">🏢</span>
            <div><p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Complete your company profile</p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">Companies with full profiles get 3x more quality applicants</p></div>
          </div>
        </div>

        <p class="footer-note">
          Questions? We're here to help — <a href="mailto:support@contact.kazicloud.co.ke" style="color:#DC842C;text-decoration:none;">support@contact.kazicloud.co.ke</a>
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [employer.email],
        subject: "Your Company Has Been Verified - Start Posting Jobs",
        html: getEmailTemplate(content, `${companyName} has been verified on Kazicloud!`),
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
      <div class="content">
        <p class="greeting">Hello ${contactName},</p>
        <h2 class="headline">Verification update for <span class="accent">${companyName}</span></h2>
        <p class="body-text">Thank you for registering on Kazicloud. After carefully reviewing your application, we were unable to approve your employer account at this time.</p>

        ${args.reason ? `
        <div class="alert alert-red">
          <p class="alert-title">Reason for this decision</p>
          <p class="alert-text">${args.reason}</p>
        </div>
        ` : ""}

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">What you can do next</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">📋</span>
            <p style="margin:0;font-size:14px;color:#475569;">Review and update your company information and documentation</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">📧</span>
            <p style="margin:0;font-size:14px;color:#475569;">Contact our support team for clarification or to appeal this decision</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:16px;">🔄</span>
            <p style="margin:0;font-size:14px;color:#475569;">Re-submit your application once the issue has been resolved</p>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="mailto:support@contact.kazicloud.co.ke" class="btn">Contact Support</a>
        </div>

        <p class="footer-note">
          We're committed to keeping Kazicloud a safe platform. If you have questions, reach out at <a href="mailto:support@contact.kazicloud.co.ke" style="color:#DC842C;text-decoration:none;">support@contact.kazicloud.co.ke</a>.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [employer.email],
        subject: "Update on Your Kazicloud Platform Verification",
        html: getEmailTemplate(content, "An update on your Kazicloud employer verification"),
      });

      console.log("Rejection email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending rejection email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Notify a user that their account has been deleted by an admin
export const notifyUserDeleted = action({
  args: {
    email: v.string(),
    fullName: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const contactName = args.fullName || "there";

    const content = `
      <div class="content">
        <p class="greeting">Hello ${contactName},</p>
        <h2 class="headline">Your account has been <span class="accent">removed</span></h2>
        <p class="body-text">We are writing to inform you that your Kazicloud account has been removed by our administration team. Your profile and all associated data have been permanently deleted from our platform.</p>

        <div class="alert alert-red">
          <p class="alert-title">Reason for removal</p>
          <p class="alert-text">${args.reason}</p>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f172a;">What this means for you</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
            <span style="font-size:14px;color:#dc2626;">&#x25CF;</span>
            <p style="margin:0;font-size:14px;color:#475569;">Your account and profile have been permanently deleted</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
            <span style="font-size:14px;color:#dc2626;">&#x25CF;</span>
            <p style="margin:0;font-size:14px;color:#475569;">All active applications or job postings have been removed</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:14px;color:#dc2626;">&#x25CF;</span>
            <p style="margin:0;font-size:14px;color:#475569;">You can no longer sign in with your previous credentials</p>
          </div>
        </div>

        <p class="body-text">If you believe this was done in error, please reach out to our support team immediately.</p>

        <div class="btn-wrap">
          <a href="mailto:support@contact.kazicloud.co.ke" class="btn">Contact Support</a>
        </div>

        <p class="footer-note">
          This action was performed by the Kazicloud admin team. Questions? <a href="mailto:support@contact.kazicloud.co.ke" style="color:#DC842C;text-decoration:none;">support@contact.kazicloud.co.ke</a>
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <noreply@contact.kazicloud.co.ke>",
        to: [args.email],
        subject: "Your Kazicloud Account Has Been Removed",
        html: getEmailTemplate(content, "Important update about your Kazicloud account"),
      });

      console.log("User deletion email sent:", result);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending deletion email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Notify admin that an employer wants to edit their profile
export const notifyAdminProfileChangeRequest = action({
  args: {
    employerName: v.string(),
    companyName: v.string(),
    employerEmail: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

    const content = `
      <div class="content">
        <p class="greeting">Action required</p>
        <h2 class="headline"><span class="accent">${args.companyName}</span> wants to update their profile</h2>
        <p class="body-text">An employer has submitted a request to edit their company profile. Please review and approve or reject the changes from the admin panel.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#FFF7ED;color:#DC842C;font-size:20px;">🏢</div>
            <div>
              <p class="job-title">${args.companyName}</p>
              <p class="company-name">${args.employerName}</p>
              <p class="job-meta">${args.employerEmail}</p>
            </div>
          </div>
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Reason for change</p>
            <p style="margin:0;font-size:14px;color:#475569;">${args.reason}</p>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${adminUrl}/employers" class="btn">Review in Admin Panel</a>
        </div>

        <p class="footer-note">
          Please approve or reject this request from the employer management section of the admin dashboard.
        </p>
      </div>
    `;

    try {
      const adminEmail = process.env.ADMIN_EMAIL || "kazicloudcareers@gmail.com";
      const result = await resend.emails.send({
        from: "Kazicloud <noreply@contact.kazicloud.co.ke>",
        to: [adminEmail],
        subject: `Profile Change Request: ${args.companyName}`,
        html: getEmailTemplate(content, `${args.companyName} has requested a profile update`),
      });

      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending change request email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// ---------------------------------------------------------------------------
// Job-seeker status notification emails
// ---------------------------------------------------------------------------

// Sent to job seeker immediately after they submit an application
export const notifyJobSeekerApplicationReceived = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.runQuery(api.applications.getApplicationById, { applicationId: args.applicationId });
    if (!application) return { success: false, error: "Application not found" };

    const jobSeeker = application.jobSeeker;
    if (!jobSeeker?.email) return { success: false, error: "Job seeker email not found" };

    const job = application.job;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const applicationsUrl = `${webUrl}/dashboard/applications`;

    const content = `
      <div class="content">
        <p class="greeting">Hi ${jobSeeker.name?.split(" ")[0] || "there"},</p>
        <h2 class="headline">Your application is <span class="accent">on its way!</span> ✈️</h2>
        <p class="body-text">Great move! Your application has been submitted successfully. The employer will review it and get back to you. We'll keep you posted on every update.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#FFF7ED;color:#DC842C;font-size:22px;">🏢</div>
            <div>
              <p class="job-title">${job.title}</p>
              <p class="company-name">${(job as any).companyName || "Company"}</p>
              <p class="job-meta">${[job.location, job.employmentType].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            <span class="badge badge-orange">Application Submitted</span>
            <span class="tag">📅 ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">What happens next?</p>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px;">
            <span style="min-width:24px;height:24px;border-radius:50%;background:#FFF7ED;border:1.5px solid #DC842C;color:#DC842C;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">1</span>
            <div><p style="margin:0;font-size:14px;font-weight:500;color:#0f172a;">Employer reviews your application</p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">This usually takes 3–7 business days</p></div>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px;">
            <span style="min-width:24px;height:24px;border-radius:50%;background:#f1f5f9;border:1.5px solid #e2e8f0;color:#94a3b8;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">2</span>
            <div><p style="margin:0;font-size:14px;font-weight:500;color:#94a3b8;">Shortlisting decision</p><p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">You'll be notified if you're shortlisted</p></div>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="min-width:24px;height:24px;border-radius:50%;background:#f1f5f9;border:1.5px solid #e2e8f0;color:#94a3b8;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">3</span>
            <div><p style="margin:0;font-size:14px;font-weight:500;color:#94a3b8;">Interview &amp; offer stage</p><p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Interview details will be sent via email</p></div>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${applicationsUrl}" class="btn">Track Your Application</a>
        </div>

        <p class="footer-note">
          You're receiving this because you applied for a job on Kazicloud. Track all your applications in your <a href="${applicationsUrl}" style="color:#DC842C;text-decoration:none;">dashboard</a>.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [jobSeeker.email],
        subject: `Application submitted — ${job.title}`,
        html: getEmailTemplate(content, `Your application for ${job.title} is on its way!`),
      });
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending application confirmation:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Sent when employer marks an application as "shortlisted"
export const notifyJobSeekerShortlisted = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.runQuery(api.applications.getApplicationById, { applicationId: args.applicationId });
    if (!application) return { success: false, error: "Application not found" };

    const jobSeeker = application.jobSeeker;
    if (!jobSeeker?.email) return { success: false, error: "Job seeker email not found" };

    const job = application.job;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const applicationsUrl = `${webUrl}/dashboard/applications`;

    const content = `
      <div class="content">
        <p class="greeting">Hi ${jobSeeker.name?.split(" ")[0] || "there"},</p>
        <h2 class="headline">You've been <span class="accent">shortlisted!</span> 🎉</h2>
        <p class="body-text">Fantastic news — out of all the applicants, the employer has shortlisted you for <strong>${job.title}</strong>. This means your profile stood out. Keep an eye on your inbox for the next steps.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#FFF7ED;color:#DC842C;font-size:22px;">🏢</div>
            <div>
              <p class="job-title">${job.title}</p>
              <p class="company-name">${(job as any).companyName || "Company"}</p>
              <p class="job-meta">${[job.location, job.employmentType].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            <span class="badge badge-green">✓ Shortlisted</span>
          </div>
        </div>

        <div class="alert alert-green">
          <p class="alert-title">💡 What this means</p>
          <p class="alert-text">Being shortlisted means the employer is seriously considering you. They may reach out for an interview soon. Stay professional and keep your profile updated.</p>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Tips to prepare</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">🔍</span>
            <p style="margin:0;font-size:14px;color:#475569;">Research the company — their products, culture, and recent news</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">📋</span>
            <p style="margin:0;font-size:14px;color:#475569;">Review the job description and prepare for common interview questions</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:16px;">📱</span>
            <p style="margin:0;font-size:14px;color:#475569;">Make sure your phone and email are reachable — the employer may contact you anytime</p>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${applicationsUrl}" class="btn">View Application Status</a>
        </div>

        <p class="footer-note">
          You're receiving this because you applied for a job on Kazicloud. Keep working hard — you're almost there!
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [jobSeeker.email],
        subject: `🎉 You've been shortlisted for ${job.title}`,
        html: getEmailTemplate(content, `You've been shortlisted for ${job.title}!`),
      });
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending shortlisted notification:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Sent when employer schedules an interview (includes interview details)
export const notifyJobSeekerInterview = internalAction({
  args: {
    applicationId: v.id("applications"),
    interviewDetails: v.object({
      date: v.string(),
      time: v.string(),
      format: v.string(),
      location: v.optional(v.string()),
      meetingLink: v.optional(v.string()),
      interviewerName: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const application = await ctx.runQuery(api.applications.getApplicationById, { applicationId: args.applicationId });
    if (!application) return { success: false, error: "Application not found" };

    const jobSeeker = application.jobSeeker;
    if (!jobSeeker?.email) return { success: false, error: "Job seeker email not found" };

    const job = application.job;
    const d = args.interviewDetails;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const applicationsUrl = `${webUrl}/dashboard/applications`;

    const formatIcon: Record<string, string> = { "in-person": "🏢", "virtual": "💻", "phone": "📞" };
    const formatLabel: Record<string, string> = { "in-person": "In-Person", "virtual": "Virtual / Video Call", "phone": "Phone Call" };

    const locationOrLink = d.format === "virtual" && d.meetingLink
      ? `<a href="${d.meetingLink}" style="color:#DC842C;text-decoration:none;">${d.meetingLink}</a>`
      : (d.location || "To be communicated");

    const content = `
      <div class="content">
        <p class="greeting">Hi ${jobSeeker.name?.split(" ")[0] || "there"},</p>
        <h2 class="headline">You're invited to an <span class="accent">interview!</span> 🗓️</h2>
        <p class="body-text">The employer for <strong>${job.title}</strong> would like to meet you! Please review the interview details below and make sure you're prepared and on time.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#FFF7ED;color:#DC842C;font-size:22px;">🏢</div>
            <div>
              <p class="job-title">${job.title}</p>
              <p class="company-name">${(job as any).companyName || "Company"}</p>
              <p class="job-meta">${[job.location, job.employmentType].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            <span class="badge badge-blue">📋 Interview Scheduled</span>
          </div>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#0f172a;">Interview Details</p>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;">
            <span style="font-size:18px;min-width:28px;">📅</span>
            <div><p style="margin:0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Date</p><p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${d.date}</p></div>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;">
            <span style="font-size:18px;min-width:28px;">⏰</span>
            <div><p style="margin:0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Time</p><p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${d.time}</p></div>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;">
            <span style="font-size:18px;min-width:28px;">${formatIcon[d.format] || "📍"}</span>
            <div><p style="margin:0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Format</p><p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${formatLabel[d.format] || d.format}</p></div>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:${d.interviewerName ? "14px" : "0"};">
            <span style="font-size:18px;min-width:28px;">📍</span>
            <div><p style="margin:0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">${d.format === "virtual" ? "Meeting Link" : "Location"}</p><p style="margin:4px 0 0;font-size:15px;font-weight:500;color:#0f172a;">${locationOrLink}</p></div>
          </div>
          ${d.interviewerName ? `
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:0;">
            <span style="font-size:18px;min-width:28px;">👤</span>
            <div><p style="margin:0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Interviewer</p><p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${d.interviewerName}</p></div>
          </div>
          ` : ""}
        </div>

        ${d.additionalNotes ? `
        <div class="alert alert-orange">
          <p class="alert-title">📝 Additional Notes from the Employer</p>
          <p class="alert-text">${d.additionalNotes}</p>
        </div>
        ` : ""}

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">How to prepare</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">🔍</span>
            <p style="margin:0;font-size:14px;color:#475569;">Research the company thoroughly and understand the role requirements</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">💼</span>
            <p style="margin:0;font-size:14px;color:#475569;">Prepare examples of past work, achievements, and relevant experience</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:16px;">⏱️</span>
            <p style="margin:0;font-size:14px;color:#475569;">Join or arrive 5–10 minutes early and test your tech if it's a video call</p>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${applicationsUrl}" class="btn">View Application Details</a>
        </div>

        <p class="footer-note">
          If you have any questions about the interview, please contact the employer directly. You can track all your applications in your <a href="${applicationsUrl}" style="color:#DC842C;text-decoration:none;">Kazicloud dashboard</a>.
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [jobSeeker.email],
        subject: `Interview scheduled — ${job.title} on ${d.date}`,
        html: getEmailTemplate(content, `Your interview for ${job.title} is on ${d.date} at ${d.time}`),
      });
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending interview notification:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Sent when employer rejects an application
export const notifyJobSeekerRejected = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.runQuery(api.applications.getApplicationById, { applicationId: args.applicationId });
    if (!application) return { success: false, error: "Application not found" };

    const jobSeeker = application.jobSeeker;
    if (!jobSeeker?.email) return { success: false, error: "Job seeker email not found" };

    const job = application.job;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const jobsUrl = `${webUrl}/jobs`;

    const content = `
      <div class="content">
        <p class="greeting">Hi ${jobSeeker.name?.split(" ")[0] || "there"},</p>
        <h2 class="headline">An update on your application</h2>
        <p class="body-text">Thank you for taking the time to apply for <strong>${job.title}</strong>. After careful consideration, the employer has decided to move forward with other candidates at this time.</p>

        <div class="job-card">
          <div class="job-card-header">
            <div class="company-avatar" style="background:#f8fafc;color:#94a3b8;font-size:22px;">🏢</div>
            <div>
              <p class="job-title" style="color:#64748b;">${job.title}</p>
              <p class="company-name">${(job as any).companyName || "Company"}</p>
              <p class="job-meta">${[job.location, job.employmentType].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #f1f5f9;">
            <span class="badge badge-red">Not Selected</span>
          </div>
        </div>

        <div class="alert alert-orange">
          <p class="alert-title">Don't be discouraged</p>
          <p class="alert-text">Rejection is a natural part of any job search. Many successful professionals faced multiple rejections before landing their dream role. Every application gets you one step closer.</p>
        </div>

        <div class="detail-card">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Keep your momentum going</p>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">🚀</span>
            <p style="margin:0;font-size:14px;color:#475569;">Browse hundreds of new job opportunities posted daily on Kazicloud</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:16px;">📝</span>
            <p style="margin:0;font-size:14px;color:#475569;">Update your profile and CV to strengthen future applications</p>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="font-size:16px;">🎯</span>
            <p style="margin:0;font-size:14px;color:#475569;">Set job alerts to be notified about roles matching your skills</p>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="${jobsUrl}" class="btn">Browse New Opportunities</a>
        </div>

        <p class="footer-note">
          We believe in you and are rooting for your success. Keep applying — your next great opportunity is out there. 💪
        </p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: "Kazicloud <notifications@contact.kazicloud.co.ke>",
        to: [jobSeeker.email],
        subject: `Application update — ${job.title}`,
        html: getEmailTemplate(content, `An update on your application for ${job.title}`),
      });
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending rejection notification:", error);
      return { success: false, error: String(error) };
    }
  },
});
