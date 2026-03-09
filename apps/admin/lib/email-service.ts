import { Resend } from "resend";
import { NewEmployerSignupEmail } from "../emails/new-employer-signup";
import { EmployerVerifiedEmail } from "../emails/employer-verified";
import { EmployerRejectedEmail } from "../emails/employer-rejected";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendNewEmployerNotification({
    employerName,
    companyName,
    email,
    phone,
    location,
    employerId,
  }: {
    employerName: string;
    companyName: string;
    email: string;
    phone?: string;
    location?: string;
    employerId: string;
  }) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@kazicloud.co.ke";
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

    try {
      const { data, error } = await resend.emails.send({
        from: "Kazicloud Platform <notifications@kazicloud.co.ke>",
        to: [adminEmail],
        subject: `New Employer Signup: ${companyName}`,
        react: NewEmployerSignupEmail({
          employerName,
          companyName,
          email,
          phone,
          location,
          employerId,
          adminUrl,
        }),
      });

      if (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  },

  async sendEmployerVerifiedEmail({
    companyName,
    contactName,
    email,
  }: {
    companyName: string;
    contactName: string;
    email: string;
  }) {
    const dashboardUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

    try {
      const { data, error } = await resend.emails.send({
        from: "Kazicloud Platform <notifications@kazicloud.co.ke>",
        to: [email],
        subject: "🎉 Your Company Has Been Verified - Start Posting Jobs!",
        react: EmployerVerifiedEmail({
          companyName,
          contactName,
          dashboardUrl: `${dashboardUrl}/employer-dashboard`,
        }),
      });

      if (error) {
        console.error("Failed to send verification email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  },

  async sendEmployerRejectedEmail({
    companyName,
    contactName,
    email,
    reason,
  }: {
    companyName: string;
    contactName: string;
    email: string;
    reason?: string;
  }) {
    const supportUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

    try {
      const { data, error } = await resend.emails.send({
        from: "Kazicloud Platform <notifications@kazicloud.co.ke>",
        to: [email],
        subject: "Update on Your Kazicloud Platform Verification",
        react: EmployerRejectedEmail({
          companyName,
          contactName,
          reason,
          supportUrl: `${supportUrl}/contact`,
        }),
      });

      if (error) {
        console.error("Failed to send rejection email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  },
};
