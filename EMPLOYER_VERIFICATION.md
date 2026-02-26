# Employer Onboarding & Verification System

## Overview

Complete employer verification system with Kenya BRS integration, document uploads, and email validation.

## Features Implemented

### 1. File Upload for Documents
- **Location**: `convex/employerDocuments.ts`
- Employers can upload:
  - Certificate of Incorporation (Kenya)
  - KRA Certificate (Kenya)
  - Business Registration Documents (International)
- Files stored in Convex storage
- Automatic upload URL generation

### 2. Email Domain Verification
- **Location**: `apps/web/lib/email-validation.ts`
- Blocks free email providers (Gmail, Yahoo, Hotmail, etc.)
- Validates work email addresses
- Real-time validation feedback in UI

### 3. MetaMap Kenya BRS Integration
- **Location**: `convex/metamapVerification.ts`
- Automatic verification against Kenya Business Registration Service
- Webhook handler for async verification results
- **Webhook endpoint**: `/api/webhooks/metamap`

### 4. Employer Dashboard
- **Location**: `apps/web/app/employer-dashboard`
- Verification status tracking
- Job posting management (ready for implementation)
- Company profile display
- Application tracking

## Setup Instructions

### Environment Variables

Add to `.env.local`:

```bash
# MetaMap API (for Kenya BRS verification)
METAMAP_API_TOKEN=your_metamap_token_here
METAMAP_WEBHOOK_URL=https://yourdomain.com/api/webhooks/metamap

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### MetaMap Setup

1. Sign up at [MetaMap](https://metamap.com)
2. Get API token from dashboard
3. Configure webhook URL in MetaMap dashboard
4. Test with Kenya BRS registration numbers:
   - Format: `CPR/2010/000000` (Corporate)
   - Format: `PVT/2010/000000` (Private)

## User Flow

### For Kenya-Based Companies

1. **Sign Up** → Select "Hire talent"
2. **Email Verification** → Verify email
3. **Employer Onboarding**:
   - Step 1: Company Info (name, size, industry, website)
   - Step 2: Contact Person (name, work email, title, phone)
   - Step 3: Verification (BRS registration number, optional docs)
   - Step 4: Review & Submit
4. **Automatic BRS Verification** → MetaMap API call
5. **Admin Review** → Manual approval (24-48 hours)
6. **Employer Dashboard** → Start posting jobs

### For International Companies (Remote Only)

1. **Sign Up** → Select "Hire talent"
2. **Email Verification** → Verify email
3. **Employer Onboarding**:
   - Step 1: Company Info (mark as international)
   - Step 2: Contact Person (work email required)
   - Step 3: Verification (LinkedIn company page + registration docs)
   - Step 4: Review & Submit
4. **Manual Review** → Admin verification
5. **Employer Dashboard** → Start posting jobs (remote only)

## Verification Statuses

- `pending` - Just registered, no documents submitted
- `documents_submitted` - Completed onboarding, awaiting review
- `under_review` - Admin/MetaMap reviewing
- `verified` - Approved, can post jobs
- `rejected` - Failed verification (with reason)
- `suspended` - Account suspended for policy violation

## Database Schema

### employerProfiles Table

```typescript
{
  userId: Id<"users">,
  companyName: string,
  companySize: string,
  companyIndustries: string[],
  companyDescription: string,
  website: string,
  
  isKenyaBased: boolean,
  headquarters: string, // County for Kenya
  country: string,
  
  contactPersonName: string,
  contactPersonTitle: string,
  contactPersonPhone: string,
  linkedInProfile: string,
  
  // Kenya-specific
  registrationNumber: string,
  kraPin: string,
  incorporationCertStorageId: string,
  kraCertStorageId: string,
  
  // International
  registrationDocStorageId: string,
  
  // Verification
  verificationStatus: "pending" | "documents_submitted" | "under_review" | "verified" | "rejected" | "suspended",
  metamapVerificationId: string,
  brsVerified: boolean,
  verifiedAt: number,
  rejectionReason: string,
}
```

## API Endpoints

### POST /api/webhooks/metamap
Receives verification results from MetaMap BRS API.

**Payload**:
```json
{
  "verificationId": "string",
  "status": "completed",
  "data": {
    "verified": true,
    "registrationNumber": "CPR/2010/000000",
    "companyName": "Example Ltd"
  }
}
```

## Security Features

1. **Email Validation**: Blocks free email providers
2. **Document Verification**: Manual review of uploaded docs
3. **BRS Integration**: Automatic government registry check (Kenya)
4. **Webhook Security**: Verify MetaMap webhook signatures (TODO)
5. **Rate Limiting**: Prevent abuse (TODO)

## Next Steps

1. Add webhook signature verification for MetaMap
2. Implement job posting functionality
3. Add employer analytics dashboard
4. Create admin panel for manual verification
5. Add email notifications for verification status
6. Implement employer reputation scoring

## Testing

### Test Kenya BRS Verification

```bash
# Use test registration numbers provided by MetaMap
CPR/2010/000000  # Valid corporate
PVT/2010/000000  # Valid private
```

### Test File Upload

1. Go to employer onboarding
2. Upload PDF/JPG/PNG (max 10MB)
3. Check Convex storage for file

### Test Email Validation

Try these emails:
- ❌ `test@gmail.com` - Blocked
- ❌ `user@yahoo.com` - Blocked
- ✅ `hr@company.com` - Allowed
- ✅ `recruiter@startup.co.ke` - Allowed

## Troubleshooting

### MetaMap API Errors

- Check API token is valid
- Verify webhook URL is publicly accessible
- Check registration number format
- Review MetaMap dashboard for error logs

### File Upload Failures

- Check file size (<10MB)
- Verify file type (PDF, JPG, PNG only)
- Check Convex storage quota
- Review browser console for errors

### Email Validation Issues

- Update free email list in `lib/email-validation.ts`
- Check domain extraction logic
- Test with various email formats
