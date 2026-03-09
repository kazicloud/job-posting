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

interface EmployerRejectedEmailProps {
  companyName: string;
  contactName: string;
  reason?: string;
  supportUrl: string;
}

export const EmployerRejectedEmail = ({
  companyName,
  contactName,
  reason,
  supportUrl,
}: EmployerRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Update on your Kazicloud Platform verification</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verification Status Update</Heading>
          
          <Text style={text}>
            Dear {contactName},
          </Text>

          <Text style={text}>
            Thank you for your interest in joining Kazicloud Platform. After reviewing your application 
            for <strong>{companyName}</strong>, we are unable to verify your account at this time.
          </Text>

          {reason && (
            <Section style={reasonSection}>
              <Heading style={h2}>Reason for Rejection</Heading>
              <Text style={reasonText}>{reason}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={nextStepsSection}>
            <Heading style={h2}>What You Can Do</Heading>
            
            <Text style={text}>
              If you believe this decision was made in error or if you have additional information to share:
            </Text>

            <ul style={list}>
              <li style={listItem}>Review and update your company information</li>
              <li style={listItem}>Ensure all verification documents are clear and valid</li>
              <li style={listItem}>Contact our support team for clarification</li>
            </ul>

            <Section style={buttonSection}>
              <Button style={button} href={supportUrl}>
                Contact Support
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={infoSection}>
            <Heading style={h2}>Common Reasons for Rejection</Heading>
            <ul style={list}>
              <li style={listItem}>Incomplete or unclear verification documents</li>
              <li style={listItem}>Company information could not be verified</li>
              <li style={listItem}>Suspicious or fraudulent activity detected</li>
              <li style={listItem}>Non-compliance with platform policies</li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            We're here to help! Reach out to us at <a href="mailto:support@kazicloud.co.ke" style={link}>support@kazicloud.co.ke</a>
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
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#DC842C",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const hr = {
  borderColor: "#E2E8F0",
  margin: "32px 40px",
};

const reasonSection = {
  padding: "24px",
  backgroundColor: "#FEF2F2",
  margin: "24px 40px",
  borderRadius: "8px",
  border: "2px solid #FCA5A5",
};

const reasonText = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const nextStepsSection = {
  padding: "0 40px",
};

const infoSection = {
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

export default EmployerRejectedEmail;
