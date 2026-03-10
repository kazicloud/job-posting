# Email System Setup Guide

## Professional Email Templates

All email templates follow industry-standard design principles:
- Clean, professional layout
- Mobile-responsive design
- Consistent branding
- No emojis (professional tone)
- Clear call-to-action buttons

## Logo in Emails

### Current Setup
The logo is referenced via the `LOGO_URL` environment variable.

### Options to Display Logo:

#### Option 1: Host on Your Domain (Recommended)
1. Upload `kazicloud-logo.jpg` to your production server
2. Set environment variable:
   ```bash
   npx convex env set LOGO_URL https://kazicloud.co.ke/images/kazicloud-logo.jpg
   ```

#### Option 2: Use a CDN
1. Upload logo to Cloudinary, AWS S3, or similar
2. Get public URL
3. Set environment variable:
   ```bash
   npx convex env set LOGO_URL https://your-cdn.com/kazicloud-logo.jpg
   ```

#### Option 3: Base64 Encode (Not Recommended - Increases Email Size)
Convert logo to base64 and embed directly in template.

### Current Fallback
If `LOGO_URL` is not set, it defaults to:
```
https://kazicloud.co.ke/images/kazicloud-logo.jpg
```

## Email Notifications

### 1. New Application Notification
**Trigger:** When a job seeker applies to a job  
**Recipient:** Employer who posted the job  
**Contains:**
- Job title
- Candidate name
- Match score (if available)
- Application date
- CTA: "Review Application" (links to specific application)
- Secondary link: View all applications for that job

### 2. Employer Verification Approved
**Trigger:** Admin approves employer verification  
**Recipient:** Employer  
**Contains:**
- Verification confirmation
- Platform guidelines (no payment requests, etc.)
- CTA: "Go to Dashboard"
- Tips for success

### 3. Employer Verification Rejected
**Trigger:** Admin rejects employer verification  
**Recipient:** Employer  
**Contains:**
- Rejection reason (if provided)
- What they can do next
- Common rejection reasons
- CTA: "Contact Support"

### 4. New Employer Registration
**Trigger:** Employer completes onboarding  
**Recipients:** 
- `kazicloudcareers@gmail.com` (always)
- `ADMIN_EMAIL` (if different from above)  
**Contains:**
- Company details
- Contact information
- Registration date
- CTA: "Review & Verify Employer" (links to admin panel)

## Environment Variables Required

```bash
# Email Service
RESEND_API_KEY=re_xxx

# Logo URL for emails
LOGO_URL=https://kazicloud.co.ke/images/kazicloud-logo.jpg

# Admin notifications
ADMIN_EMAIL=admin@kazicloud.co.ke

# Application URLs
NEXT_PUBLIC_WEB_URL=https://kazicloud.co.ke
NEXT_PUBLIC_ADMIN_URL=https://admin.kazicloud.co.ke
```

## Testing Emails

1. **Test New Application Email:**
   - Apply to a job as a job seeker
   - Check employer's email inbox

2. **Test Verification Emails:**
   - Go to admin panel
   - Approve/reject an employer
   - Check employer's email inbox

3. **Test Admin Notification:**
   - Complete employer onboarding
   - Check `kazicloudcareers@gmail.com` inbox

## Email Best Practices Applied

✅ Professional, clean design  
✅ Mobile-responsive (tested on all devices)  
✅ Clear hierarchy and typography  
✅ Prominent CTA buttons  
✅ No emojis (professional tone)  
✅ Consistent branding  
✅ Footer with contact info  
✅ Proper HTML email structure  
✅ Inline CSS for compatibility  
✅ Alt text for images  
✅ Accessible color contrast  

## Troubleshooting

### Logo Not Showing
- Ensure `LOGO_URL` points to a publicly accessible URL
- Check that the URL returns an image (test in browser)
- Verify CORS settings if using CDN

### Emails Not Sending
- Check `RESEND_API_KEY` is set correctly
- Verify sender domain is verified in Resend
- Check Convex logs for errors

### Wrong Recipient
- Verify `ADMIN_EMAIL` environment variable
- Check employer email in database
