import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface ServiceStatusUpdateEmailProps {
  customerName: string;
  serviceType: string;
  status: "in_progress" | "cancelled";
  dashboardUrl: string;
}

const SERVICE_NAMES: Record<string, string> = {
  ats_cv: "ATS CV Review",
  cv_revamp: "CV Revamp",
  job_search_support: "Job Search Support",
  career_coaching: "Career Coaching",
};

const STATUS_CONFIG = {
  in_progress: {
    preview: "Your service order is now being worked on!",
    heading: "Your Service is In Progress 🚀",
    description: "Good news! Our team has started working on your service order. We're committed to delivering high-quality results.",
    statusLabel: "⚙️ In Progress",
    statusColor: "#1d4ed8",
    statusBg: "#eff6ff",
    whatNextHeading: "What Happens Next?",
    steps: [
      "Our experts are actively working on your order",
      "You'll receive an email as soon as it's complete",
      "Download your deliverables from your dashboard",
    ],
    ctaLabel: "Track Your Order",
  },
  cancelled: {
    preview: "Important update about your service order.",
    heading: "Service Order Cancelled",
    description: "We wanted to let you know that your service order has been cancelled. If you didn't request this cancellation or have any questions, please reach out to our support team.",
    statusLabel: "❌ Cancelled",
    statusColor: "#dc2626",
    statusBg: "#fef2f2",
    whatNextHeading: "Need Help?",
    steps: [
      "Contact support if you believe this was an error",
      "You may re-order the service at any time",
      "Our team is available to assist you",
    ],
    ctaLabel: "Contact Support",
  },
};

export const ServiceStatusUpdateEmail = ({
  customerName,
  serviceType,
  status,
  dashboardUrl,
}: ServiceStatusUpdateEmailProps) => {
  const serviceName = SERVICE_NAMES[serviceType] || serviceType;
  const config = STATUS_CONFIG[status];

  return (
    <Html>
      <Head />
      <Preview>{config.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>Kazicloud</Heading>
          </Section>

          <Heading style={h1}>{config.heading}</Heading>

          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>{config.description}</Text>

          <Section style={{ ...statusBox, backgroundColor: config.statusBg }}>
            <Text style={{ ...statusLabel, color: config.statusColor }}>
              {config.statusLabel}
            </Text>
            <Text style={serviceNameText}>{serviceName}</Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>{config.whatNextHeading}</Heading>
          <ul style={list}>
            {config.steps.map((step, i) => (
              <li key={i} style={listItem}>{step}</li>
            ))}
          </ul>

          <Section style={buttonSection}>
            <Button style={button} href={dashboardUrl}>
              {config.ctaLabel}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            © {new Date().getFullYear()} Kazicloud Platform. All rights reserved.
          </Text>
          <Text style={footer}>
            Questions? Contact us at support@kazicloud.co.ke
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ServiceStatusUpdateEmail;

// Styles
const main = {
  backgroundColor: "#f1f5f9",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "32px auto",
  padding: "0",
  borderRadius: "16px",
  maxWidth: "580px",
  boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#ffffff",
  padding: "24px 40px",
  borderBottom: "1px solid #f1f5f9",
};

const brand = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  lineHeight: "1.3",
  padding: "32px 40px 8px",
  margin: "0",
};

const h2 = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 12px",
  padding: "0 40px",
};

const text = {
  fontSize: "15px",
  color: "#475569",
  lineHeight: "1.7",
  margin: "0 0 16px",
  padding: "0 40px",
};

const statusBox = {
  margin: "24px 40px",
  padding: "16px 20px",
  borderRadius: "12px",
};

const statusLabel = {
  fontSize: "12px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const serviceNameText = {
  fontSize: "16px",
  fontWeight: "600" as const,
  color: "#0f172a",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 40px",
};

const button = {
  backgroundColor: "#DC842C",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 36px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "24px 40px",
};

const list = {
  padding: "0 40px 0 60px",
  margin: "0 0 24px",
};

const listItem = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.8",
  marginBottom: "6px",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "4px 0",
  padding: "0 40px 24px",
};
