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

interface ServiceCompletedEmailProps {
  customerName: string;
  serviceType: string;
  dashboardUrl: string;
}

const SERVICE_NAMES = {
  ats_cv: "ATS CV Review",
  cv_revamp: "CV Revamp - Premium",
  job_search_support: "Job Search Support",
  career_coaching: "Career Success Program"
};

export const ServiceCompletedEmail = ({
  customerName,
  serviceType,
  dashboardUrl,
}: ServiceCompletedEmailProps) => {
  const serviceName = SERVICE_NAMES[serviceType as keyof typeof SERVICE_NAMES];

  return (
    <Html>
      <Head />
      <Preview>Your {serviceName} is ready for download!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Your Service is Complete!</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Great news! Your <strong>{serviceName}</strong> has been completed and is ready for you.
          </Text>

          <Section style={completedBox}>
            <Heading style={h2}>✅ What's Ready</Heading>
            <Text style={boxText}>
              Your deliverables have been uploaded and are available for download in your dashboard.
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={dashboardUrl}>
              Download Your Deliverables
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={tipsSection}>
            <Heading style={h2}>💡 Next Steps</Heading>
            <ul style={list}>
              <li style={listItem}>Review your deliverables carefully</li>
              <li style={listItem}>Apply the improvements to your job search</li>
              <li style={listItem}>Track your progress and results</li>
              <li style={listItem}>Reach out if you have any questions</li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Section style={feedbackSection}>
            <Heading style={h2}>We'd Love Your Feedback</Heading>
            <Text style={text}>
              How was your experience? Your feedback helps us improve our services for everyone.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Contact us at <a href="mailto:kazicloudcareers@gmail.com" style={link}>kazicloudcareers@gmail.com</a>
          </Text>

          <Text style={footer}>
            Best regards,<br />
            The Kazicloud Careers Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#0F172A",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0 20px",
  padding: "0 40px",
  lineHeight: "1.3",
};

const h2 = {
  color: "#0F172A",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0 16px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  margin: "16px 0",
};

const completedBox = {
  backgroundColor: "#F0FDF4",
  margin: "24px 40px",
  padding: "24px",
  borderRadius: "8px",
  border: "2px solid #86EFAC",
};

const boxText = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "12px 0",
};

const buttonSection = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#DC842C",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const tipsSection = {
  padding: "0 40px",
};

const feedbackSection = {
  padding: "0 40px",
};

const list = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  paddingLeft: "20px",
  margin: "12px 0",
};

const listItem = {
  marginBottom: "8px",
};

const hr = {
  borderColor: "#E2E8F0",
  margin: "32px 40px",
};

const footer = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "16px",
};

const link = {
  color: "#DC842C",
  textDecoration: "underline",
};

export default ServiceCompletedEmail;
