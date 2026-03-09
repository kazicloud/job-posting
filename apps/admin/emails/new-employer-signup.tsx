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
} from "@react-email/components";

interface NewEmployerSignupEmailProps {
  employerName: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  employerId: string;
  adminUrl: string;
}

export const NewEmployerSignupEmail = ({
  employerName,
  companyName,
  email,
  phone,
  location,
  employerId,
  adminUrl,
}: NewEmployerSignupEmailProps) => {
  const verifyUrl = `${adminUrl}/employers/${employerId}`;

  return (
    <Html>
      <Head />
      <Preview>New employer signup: {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Employer Signup</Heading>
          
          <Text style={text}>
            A new employer has signed up on Kazicloud Platform and requires verification.
          </Text>

          <Section style={infoSection}>
            <Text style={infoLabel}>Company Name:</Text>
            <Text style={infoValue}>{companyName}</Text>

            <Text style={infoLabel}>Contact Person:</Text>
            <Text style={infoValue}>{employerName}</Text>

            <Text style={infoLabel}>Email:</Text>
            <Text style={infoValue}>{email}</Text>

            {phone && (
              <>
                <Text style={infoLabel}>Phone:</Text>
                <Text style={infoValue}>{phone}</Text>
              </>
            )}

            {location && (
              <>
                <Text style={infoLabel}>Location:</Text>
                <Text style={infoValue}>{location}</Text>
              </>
            )}
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={verifyUrl}>
              Review & Verify Employer
            </Button>
          </Section>

          <Text style={footer}>
            This is an automated notification from Kazicloud Platform.
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
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const infoSection = {
  padding: "24px 40px",
  backgroundColor: "#F7F9FC",
  margin: "24px 40px",
  borderRadius: "8px",
};

const infoLabel = {
  color: "#94A3B8",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "16px 0 4px 0",
};

const infoValue = {
  color: "#0F172A",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px 0",
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
  padding: "12px 24px",
};

const footer = {
  color: "#94A3B8",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  marginTop: "32px",
};

export default NewEmployerSignupEmail;
