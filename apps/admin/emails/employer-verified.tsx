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

interface EmployerVerifiedEmailProps {
  companyName: string;
  contactName: string;
  dashboardUrl: string;
}

export const EmployerVerifiedEmail = ({
  companyName,
  contactName,
  dashboardUrl,
}: EmployerVerifiedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your company has been verified on Kazicloud Platform</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Congratulations! Your Company is Verified</Heading>
          
          <Text style={text}>
            Dear {contactName},
          </Text>

          <Text style={text}>
            Great news! <strong>{companyName}</strong> has been successfully verified on Kazicloud Platform. 
            You can now start posting jobs and connecting with talented professionals.
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={dashboardUrl}>
              Start Posting Jobs
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={warningSection}>
            <Heading style={h2}>⚠️ Important Guidelines</Heading>
            
            <Text style={warningText}>
              <strong>Kazicloud is a fair and transparent platform.</strong> To maintain trust and integrity:
            </Text>

            <ul style={list}>
              <li style={listItem}>
                <strong>Never request payment</strong> from job seekers for applications, interviews, or job offers
              </li>
              <li style={listItem}>
                <strong>No recruitment fees</strong> - Job seekers should never pay to apply or get hired
              </li>
              <li style={listItem}>
                <strong>Honest job postings</strong> - Ensure all job details are accurate and legitimate
              </li>
              <li style={listItem}>
                <strong>Professional conduct</strong> - Treat all candidates with respect and fairness
              </li>
              <li style={listItem}>
                <strong>Timely communication</strong> - Respond to applications and keep candidates informed
              </li>
            </ul>

            <Text style={warningText}>
              <strong>⚠️ Violation of these guidelines may result in account suspension or permanent ban.</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={tipsSection}>
            <Heading style={h2}>💡 Tips for Success</Heading>
            <ul style={list}>
              <li style={listItem}>Write clear, detailed job descriptions</li>
              <li style={listItem}>Include salary ranges to attract quality candidates</li>
              <li style={listItem}>Respond to applications within 48 hours</li>
              <li style={listItem}>Keep your company profile updated</li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Contact us at <a href="mailto:support@kazicloud.co.ke" style={link}>support@kazicloud.co.ke</a>
          </Text>

          <Text style={footer}>
            Best regards,<br />
            The Kazicloud Team
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

const hr = {
  borderColor: "#E2E8F0",
  margin: "32px 40px",
};

const warningSection = {
  backgroundColor: "#FFF7ED",
  margin: "0 40px",
  padding: "24px",
  borderRadius: "8px",
  border: "2px solid #FDBA74",
};

const tipsSection = {
  padding: "0 40px",
};

const warningText = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "12px 0",
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

const footer = {
  color: "#94A3B8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "16px",
};

const link = {
  color: "#DC842C",
  textDecoration: "underline",
};

export default EmployerVerifiedEmail;
