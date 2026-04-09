import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface ServiceOrderConfirmationProps {
  customerName: string;
  serviceType: string;
  amount: number;
  currency: string;
  orderId: string;
}

const SERVICE_DETAILS = {
  ats_cv: {
    name: "ATS CV Review",
    description: "Your CV will be automatically optimized for Applicant Tracking Systems",
    deliveryTime: "Instant download",
    whatToExpect: [
      "ATS-friendly formatting",
      "Keyword optimization",
      "Achievement highlights",
      "Ready-to-use professional CV"
    ]
  },
  cv_revamp: {
    name: "CV Revamp - Premium Upgrade",
    description: "Our career experts will create two tailored CVs for your top target roles",
    deliveryTime: "3-5 business days",
    whatToExpect: [
      "Two fully customized CVs for different roles",
      "Personalized achievement framing",
      "ATS and recruiter optimized",
      "Professional consultation included"
    ]
  },
  job_search_support: {
    name: "Job Search Support",
    description: "We'll curate matching jobs and share your CV with our recruiter network",
    deliveryTime: "Ongoing monthly service",
    whatToExpect: [
      "Up to 5 curated job matches per month",
      "CV shared with recruiter network",
      "Application tracking support",
      "Monthly progress updates"
    ]
  },
  career_coaching: {
    name: "Career Success Program",
    description: "One-on-one coaching sessions to accelerate your career growth",
    deliveryTime: "Scheduled within 48 hours",
    whatToExpect: [
      "Personalized coaching sessions",
      "Career strategy development",
      "Interview preparation",
      "Salary negotiation guidance"
    ]
  }
};

export const ServiceOrderConfirmation = ({
  customerName,
  serviceType,
  amount,
  currency,
  orderId,
}: ServiceOrderConfirmationProps) => {
  const service = SERVICE_DETAILS[serviceType as keyof typeof SERVICE_DETAILS];

  return (
    <Html>
      <Head />
      <Preview>Your {service.name} order has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Order Confirmed!</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Thank you for choosing Kazicloud! Your order for <strong>{service.name}</strong> has been successfully received and is being processed.
          </Text>

          <Section style={orderBox}>
            <Heading style={h2}>Order Details</Heading>
            <Text style={orderText}>
              <strong>Service:</strong> {service.name}<br />
              <strong>Amount Paid:</strong> {currency} {amount.toLocaleString()}<br />
              <strong>Order ID:</strong> {orderId}<br />
              <strong>Expected Delivery:</strong> {service.deliveryTime}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={detailsSection}>
            <Heading style={h2}>What Happens Next?</Heading>
            <Text style={text}>
              {service.description}
            </Text>

            <Heading style={h3}>What to Expect:</Heading>
            <ul style={list}>
              {service.whatToExpect.map((item, index) => (
                <li key={index} style={listItem}>{item}</li>
              ))}
            </ul>
          </Section>

          <Hr style={hr} />

          <Section style={contactSection}>
            <Heading style={h2}>Need Assistance?</Heading>
            <Text style={text}>
              Our team is here to help! If you have any questions about your order, please contact us:
            </Text>
            <Text style={contactText}>
              📧 Email: <a href="mailto:kazicloudcareers@gmail.com" style={link}>kazicloudcareers@gmail.com</a><br />
              📱 We'll respond within 24 hours
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Best regards,<br />
            The Kazicloud Careers Team
          </Text>

          <Text style={footerNote}>
            This is an automated confirmation email. Please do not reply to this email.
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

const h3 = {
  color: "#0F172A",
  fontSize: "16px",
  fontWeight: "600",
  margin: "20px 0 12px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  margin: "16px 0",
};

const orderBox = {
  backgroundColor: "#F0FDF4",
  margin: "24px 40px",
  padding: "24px",
  borderRadius: "8px",
  border: "2px solid #86EFAC",
};

const orderText = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "12px 0",
};

const detailsSection = {
  padding: "0 40px",
};

const contactSection = {
  padding: "0 40px",
};

const contactText = {
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

const hr = {
  borderColor: "#E2E8F0",
  margin: "32px 40px",
};

const footer = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "24px",
};

const footerNote = {
  color: "#94A3B8",
  fontSize: "12px",
  lineHeight: "20px",
  padding: "0 40px",
  marginTop: "8px",
};

const link = {
  color: "#DC842C",
  textDecoration: "underline",
};

export default ServiceOrderConfirmation;
