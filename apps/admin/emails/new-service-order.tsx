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

interface NewServiceOrderProps {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  amount: number;
  currency: string;
  orderId: string;
  adminUrl: string;
}

const SERVICE_NAMES = {
  ats_cv: "ATS CV Review",
  cv_revamp: "CV Revamp - Premium",
  job_search_support: "Job Search Support",
  career_coaching: "Career Success Program"
};

export const NewServiceOrder = ({
  customerName,
  customerEmail,
  serviceType,
  amount,
  currency,
  orderId,
  adminUrl,
}: NewServiceOrderProps) => {
  const serviceName = SERVICE_NAMES[serviceType as keyof typeof SERVICE_NAMES];

  return (
    <Html>
      <Head />
      <Preview>New service order: {serviceName} from {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎯 New Service Order Received</Heading>
          
          <Text style={text}>
            A new candidate service order has been placed and requires your attention.
          </Text>

          <Section style={orderBox}>
            <Heading style={h2}>Order Details</Heading>
            <Text style={orderText}>
              <strong>Service:</strong> {serviceName}<br />
              <strong>Customer:</strong> {customerName}<br />
              <strong>Email:</strong> <a href={`mailto:${customerEmail}`} style={link}>{customerEmail}</a><br />
              <strong>Amount:</strong> {currency} {amount.toLocaleString()}<br />
              <strong>Order ID:</strong> {orderId}<br />
              <strong>Date:</strong> {new Date().toLocaleString()}
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={`${adminUrl}/services`}>
              View in Admin Panel
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={actionSection}>
            <Heading style={h2}>Next Steps</Heading>
            <ul style={list}>
              <li style={listItem}>Review the order details in the admin panel</li>
              <li style={listItem}>Update the order status to "In Progress"</li>
              <li style={listItem}>Contact the customer if additional information is needed</li>
              <li style={listItem}>Complete the service within the expected delivery time</li>
              <li style={listItem}>Mark as "Completed" when done</li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated notification from Kazicloud Admin System.
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

const orderBox = {
  backgroundColor: "#FEF3C7",
  margin: "24px 40px",
  padding: "24px",
  borderRadius: "8px",
  border: "2px solid #FCD34D",
};

const orderText = {
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

const actionSection = {
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
  color: "#94A3B8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "24px",
};

const link = {
  color: "#DC842C",
  textDecoration: "underline",
};

export default NewServiceOrder;
