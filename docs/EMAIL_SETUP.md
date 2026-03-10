# Email Service Setup

## Overview
The platform uses [Resend](https://resend.com) for transactional emails with React Email for beautiful, responsive email templates.

## Setup Instructions

### 1. Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Create an API key from the dashboard
4. Copy the API key

### 2. Configure Environment Variables
Create `/apps/admin/.env.local` with:
```env
RESEND_API_KEY=re_your_api_key_here
ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

For production, update `NEXT_PUBLIC_ADMIN_URL` to your actual admin dashboard URL.

### 3. Verify Domain (Production Only)
For production emails:
1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `kazicloud.com`)
3. Add the DNS records they provide
4. Wait for verification (usually a few minutes)
5. Update the `from` address in `/apps/admin/lib/email-service.ts`

## Current Email Flows

### 1. New Employer Signup
**Trigger:** When an employer completes onboarding  
**Recipient:** Admin  
**Content:**
- Company name
- Contact person details
- Email, phone, location
- Direct link to verify employer in admin dashboard

**Template:** `/apps/admin/emails/new-employer-signup.tsx`

## Testing Emails

### Development Mode
Resend provides a test mode that doesn't send real emails:
```bash
# In admin app
pnpm dev
```

### Preview Emails
Use React Email's preview tool:
```bash
cd apps/admin
pnpm email dev
```

This opens a browser at `http://localhost:3000` showing all email templates.

## Adding New Email Templates

1. Create template in `/apps/admin/emails/your-template.tsx`
2. Add function to `/apps/admin/lib/email-service.ts`
3. Create API route in `/apps/admin/app/api/emails/your-route/route.ts`
4. Create Convex action to trigger email

Example template structure:
```tsx
import { Html, Head, Body, Container, Heading, Text, Button } from "@react-email/components";

export const YourEmail = ({ name, actionUrl }: Props) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hello {name}</Heading>
        <Text style={text}>Your message here</Text>
        <Button style={button} href={actionUrl}>
          Take Action
        </Button>
      </Container>
    </Body>
  </Html>
);
```

## Future Email Flows

Planned email notifications:
- [ ] Employer verification approved/rejected
- [ ] New job application received (to employer)
- [ ] Application status update (to job seeker)
- [ ] Job posting approved/rejected
- [ ] Weekly digest for job seekers
- [ ] Password reset
- [ ] Welcome emails

## Troubleshooting

### Emails not sending
1. Check API key is correct in `.env.local`
2. Verify domain is verified (production)
3. Check Resend dashboard logs
4. Check server logs for errors

### Emails going to spam
1. Verify your domain with SPF, DKIM records
2. Use a professional "from" address
3. Avoid spam trigger words
4. Include unsubscribe link (for marketing emails)

## Best Practices

1. **Always test emails** before deploying
2. **Use transactional emails only** for user actions
3. **Keep emails concise** and action-oriented
4. **Mobile-first design** - most emails are read on mobile
5. **Include plain text version** for accessibility
6. **Track important metrics** (open rates, click rates)
7. **Handle failures gracefully** - don't block user actions if email fails

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Email Design Best Practices](https://react.email/docs/guides/email-design-best-practices)
