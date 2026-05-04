import { Resend } from "resend";
import { NewEmployerSignupEmail } from "../emails/new-employer-signup";
import { EmployerVerifiedEmail } from "../emails/employer-verified";
import { EmployerRejectedEmail } from "../emails/employer-rejected";
import { NewServiceOrder } from "../emails/new-service-order";
import { ServiceOrderConfirmation } from "../emails/service-order-confirmation";
import { ServiceCompletedEmail } from "../emails/service-completed";
import { ServiceStatusUpdateEmail } from "../emails/service-status-update";

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

  async sendServiceOrderNotification({
    customerName,
    customerEmail,
    serviceType,
    amount,
    currency,
    orderId,
  }: {
    customerName: string;
    customerEmail: string;
    serviceType: string;
    amount: number;
    currency: string;
    orderId: string;
  }) {
    const adminEmail = "kazicloudcareers@gmail.com";
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

    try {
      // Send admin notification
      const adminResult = await resend.emails.send({
        from: "Kazicloud Platform <notifications@kazicloud.co.ke>",
        to: [adminEmail],
        subject: `New Service Order: ${serviceType.replace('_', ' ').toUpperCase()}`,
        react: NewServiceOrder({
          customerName,
          customerEmail,
          serviceType,
          amount,
          currency,
          orderId,
          adminUrl,
        }),
      });

      // Send customer confirmation
      const customerResult = await resend.emails.send({
        from: "Kazicloud Careers <notifications@kazicloud.co.ke>",
        to: [customerEmail],
        subject: "Order Confirmed - Your Career Service is Being Processed",
        react: ServiceOrderConfirmation({
          customerName,
          serviceType,
          amount,
          currency,
          orderId,
        }),
      });

      if (adminResult.error || customerResult.error) {
        console.error("Failed to send emails:", { adminResult, customerResult });
        return { success: false, error: adminResult.error || customerResult.error };
      }

      return { success: true, data: { adminResult, customerResult } };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  },

  async sendServiceStatusUpdate({
    customerName,
    customerEmail,
    serviceType,
    status,
    deliverables,
  }: {
    customerName: string;
    customerEmail: string;
    serviceType: string;
    status: string;
    deliverables?: string;
  }) {
    const dashboardUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

    // If completed, send the special completion email
    if (status === "completed") {
      try {
        const { data, error } = await resend.emails.send({
          from: "Kazicloud Careers <notifications@kazicloud.co.ke>",
          to: [customerEmail],
          subject: "Your Service is Complete - Download Your Deliverables",
          react: ServiceCompletedEmail({
            customerName,
            serviceType,
            dashboardUrl: `${dashboardUrl}/dashboard/services`,
          }),
        });

        if (error) {
          console.error("Failed to send completion email:", error);
          return { success: false, error };
        }

        return { success: true, data };
      } catch (error) {
        console.error("Email service error:", error);
        return { success: false, error };
      }
    }

    // For other status updates (in_progress, cancelled)
    const serviceNames: Record<string, string> = {
      ats_cv: "ATS CV Review",
      cv_revamp: "CV Revamp",
      job_search_support: "Job Search Support",
      career_coaching: "Career Coaching",
    };

    try {
      const { data, error } = await resend.emails.send({
        from: "Kazicloud Platform <notifications@kazicloud.co.ke>",
        to: [customerEmail],
        subject: status === "in_progress"
          ? `Your ${serviceNames[serviceType as keyof typeof serviceNames]} is now in progress`
          : `Service Order Update: ${serviceNames[serviceType as keyof typeof serviceNames]}`,
        react: ServiceStatusUpdateEmail({
          customerName,
          serviceType,
          status: status as "in_progress" | "cancelled",
          dashboardUrl: `${dashboardUrl}/dashboard/services`,
        }),
      });

      if (error) {
        console.error("Failed to send status update email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  },
};
