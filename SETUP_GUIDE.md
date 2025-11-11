# Complete Integration Setup Guide
**Equality Vanguard - Staging Environment**

---

## 🚀 Quick Start Checklist

### Step 1: Update Your Local `.env.local`

Update your `.env.local` file with the correct Mailgun settings:

```bash
# Email Service - Mailgun
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org
MAILGUN_FROM_NAME=Equality Vanguard
```

### Step 2: Add Environment Variables to Vercel

Go to: https://vercel.com/toshlewi/equality-v/settings/environment-variables

Add these **4 new variables** (select **All Environments**):

1. **MAILGUN_API_KEY**
   ```
   your_mailgun_api_key_here
   ```
   (Get this from your Mailgun dashboard)

2. **MAILGUN_DOMAIN**
   ```
   sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org
   ```

3. **MAILGUN_FROM_EMAIL**
   ```
   noreply@sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org
   ```

4. **MAILGUN_FROM_NAME**
   ```
   Equality Vanguard
   ```

### Step 3: Add Authorized Recipients in Mailgun

1. Go to: https://app.mailgun.com/app/sending/domains/sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org
2. Click **"Authorized Recipients"**
3. Add your test email addresses (the emails you'll use for testing)
4. Check your inbox and verify each email

### Step 4: Redeploy on Vercel

After adding environment variables:
1. Go to: https://vercel.com/toshlewi/equality-v/deployments
2. Click the latest deployment
3. Click **"Redeploy"** (three dots menu → Redeploy)

---

## 📧 Email Testing Guide

Once deployed, test each email template:

### Test 1: Contact Form Email
1. Go to: https://equality-v.vercel.app/contact
2. Fill out the form
3. Submit
4. **Expected**: 
   - Confirmation email to your address
   - Admin notification email
   - Admin notification in dashboard

### Test 2: Donation Receipt Email
1. Go to: https://equality-v.vercel.app/get-involved/donate
2. Fill out donation form
3. Use M-Pesa test number: `254708374149`
4. Complete payment (PIN: `1234` in sandbox)
5. **Expected**:
   - Donation receipt email
   - Admin notification email
   - Payment record in database

### Test 3: Membership Confirmation Email
1. Go to: https://equality-v.vercel.app/get-involved/membership
2. Fill out membership form
3. Complete payment
4. **Expected**:
   - Membership confirmation email with start/end dates
   - Admin notification
   - Member record in database

### Test 4: Event Registration Email
1. Go to: https://equality-v.vercel.app/events-news
2. Register for an event
3. Complete payment (if paid event)
4. **Expected**:
   - Event registration confirmation
   - Calendar invite (once Google Calendar is set up)
   - Ticket code
   - Admin notification

### Test 5: Newsletter Welcome Email
1. Go to: https://equality-v.vercel.app (footer)
2. Subscribe to newsletter
3. **Expected**:
   - Welcome email
   - Added to Mailchimp list

### Test 6: Story Submission Email
1. Go to: https://equality-v.vercel.app/our-voice/tell-your-story
2. Submit a story
3. **Expected**:
   - "Submission received" email
   - Admin notification
   - Story appears in admin pending queue

### Test 7: Partnership Inquiry Email
1. Go to: https://equality-v.vercel.app/get-involved/partner
2. Submit partnership inquiry
3. **Expected**:
   - Confirmation email
   - Admin notification

---

## 🗓️ Google Calendar Setup (Optional but Recommended)

### Step 1: Create Google Service Account

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing: "Equality Vanguard"
3. Enable **Google Calendar API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click **Enable**

4. Create Service Account:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **Service Account**
   - Name: `equality-vanguard-calendar`
   - Role: **Editor**
   - Click **Done**

5. Create Key:
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key**
   - Choose **JSON**
   - Download the JSON file

### Step 2: Share Calendar with Service Account

1. Open Google Calendar: https://calendar.google.com
2. Create a new calendar (or use existing):
   - Name: "Equality Vanguard Events"
3. Click the three dots next to the calendar → **Settings and sharing**
4. Scroll to **Share with specific people**
5. Click **Add people**
6. Add the service account email (from the JSON file, looks like: `equality-vanguard-calendar@project-id.iam.gserviceaccount.com`)
7. Set permission to **Make changes to events**
8. Click **Send**

### Step 3: Add to Vercel

1. Open the downloaded JSON file
2. Copy the **entire contents** (it's a single line of JSON)
3. Go to Vercel environment variables
4. Add **GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON**:
   - Paste the entire JSON content
   - Select **All Environments**
5. Add **GOOGLE_CALENDAR_ID**:
   - Go to calendar settings
   - Find **Calendar ID** (looks like: `abc123@group.calendar.google.com`)
   - Paste it
   - Select **All Environments**

### Step 4: Redeploy

Redeploy your Vercel app after adding the variables.

---

## 📸 Instagram Feed Setup (Optional)

### Step 1: Get Instagram Access Token

**Option A: Instagram Basic Display API** (Personal Account)
1. Go to: https://developers.facebook.com/apps
2. Create an app → **Consumer** type
3. Add **Instagram Basic Display** product
4. Configure OAuth redirect: `https://equality-v.vercel.app/`
5. Add Instagram test user
6. Generate access token
7. Exchange for long-lived token (60 days)

**Option B: Instagram Graph API** (Business Account - Recommended)
1. Convert Instagram to Business account
2. Connect to Facebook Page
3. Go to: https://developers.facebook.com/apps
4. Create app → **Business** type
5. Add **Instagram Graph API** product
6. Get Page Access Token
7. Exchange for long-lived token

### Step 2: Add to Vercel

```bash
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
INSTAGRAM_USER_ID=your_instagram_user_id
```

### Step 3: Test

Visit: https://equality-v.vercel.app/api/instagram

Should return JSON with your latest posts.

---

## 🔒 Stripe Webhook Setup

### Step 1: Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://equality-v.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
5. Click **Add endpoint**

### Step 2: Get Webhook Secret

1. Click on the webhook you just created
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)

### Step 3: Update Vercel

1. Go to Vercel environment variables
2. Find **STRIPE_WEBHOOK_SECRET**
3. Update with the new secret
4. Save

### Step 4: Test

Use Stripe CLI to test:
```bash
stripe listen --forward-to https://equality-v.vercel.app/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## 🧪 Testing Checklist

### Email Tests
- [ ] Contact form sends confirmation email
- [ ] Donation sends receipt email
- [ ] Membership sends confirmation with dates
- [ ] Event registration sends confirmation
- [ ] Newsletter subscription sends welcome email
- [ ] Story submission sends "received" email
- [ ] Partnership inquiry sends confirmation
- [ ] Admin receives notification emails

### Payment Tests
- [ ] M-Pesa STK push works
- [ ] M-Pesa callback updates database
- [ ] Stripe payment succeeds
- [ ] Stripe webhook processes payment
- [ ] Payment records created in MongoDB
- [ ] Admin notifications created

### Admin Notification Tests
- [ ] New submission creates notification
- [ ] New payment creates notification
- [ ] New member creates notification
- [ ] New contact creates notification
- [ ] Notifications appear in admin UI
- [ ] Mark as read works
- [ ] Badge count updates

### Content Workflow Tests
- [ ] Publication submission → pending → admin approve → published
- [ ] Story submission → pending → admin approve → public page
- [ ] Book suggestion captured
- [ ] Admin can publish/reject content

### Integration Tests
- [ ] Instagram feed displays posts
- [ ] Mailchimp subscription works
- [ ] Mailchimp unsubscribe works
- [ ] Google Calendar event created (if configured)
- [ ] Calendar invite in email (if configured)

---

## 📊 Monitoring & Logs

### View Vercel Logs
https://vercel.com/toshlewi/equality-v/logs

**What to look for**:
- Email sending success/failure
- Webhook processing
- Payment processing
- Database operations
- API errors

### View Mailgun Logs
https://app.mailgun.com/app/logs

**What to look for**:
- Email delivery status
- Bounces
- Opens/clicks (if tracking enabled)

### View Stripe Logs
https://dashboard.stripe.com/test/logs

**What to look for**:
- Webhook delivery
- Payment events
- Errors

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check**:
1. Mailgun API key is correct in Vercel
2. FROM email uses sandbox domain format
3. Recipient email is in authorized recipients list
4. Recipient verified the Mailgun confirmation email
5. Check Vercel logs for Mailgun errors

**Test Mailgun directly**:
```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org/messages \
  -F from='noreply@sandbox10ca81ae73d1422b97aed0344c4d366c.mailgun.org' \
  -F to='your-email@example.com' \
  -F subject='Test' \
  -F text='Testing Mailgun'
```

### M-Pesa Not Working

**Check**:
1. Using test phone number: `254708374149`
2. Using sandbox credentials
3. MPESA_ENVIRONMENT=sandbox
4. Callback URL is correct
5. Check Vercel logs for Daraja errors

### Stripe Webhook Not Firing

**Check**:
1. Webhook URL is correct
2. Webhook secret matches Vercel env var
3. Events are selected in Stripe dashboard
4. Check Stripe webhook logs for delivery attempts
5. Verify signature verification in code

### Admin Notifications Not Appearing

**Check**:
1. MongoDB connection is working
2. Admin user exists with role='admin'
3. Notification creation code is called
4. Check Vercel logs for errors
5. Verify admin UI is polling/fetching notifications

---

## 📝 Next Steps

1. **Complete Mailgun setup** (Priority 1)
   - Add credentials to Vercel
   - Add authorized recipients
   - Test all email templates

2. **Test Stripe payments** (Priority 2)
   - Update webhook secret
   - Test donation flow
   - Test membership flow
   - Test event registration

3. **Implement Google Calendar** (Priority 3)
   - Create service account
   - Share calendar
   - Add credentials to Vercel
   - Test event creation

4. **Configure Instagram** (Priority 4)
   - Get access token
   - Add to Vercel
   - Test feed endpoint

5. **Run comprehensive tests** (Priority 5)
   - Test all flows
   - Take screenshots
   - Document results
   - Create test report

6. **Generate integration report** (Final)
   - Document all test results
   - Include screenshots
   - Include logs
   - Include DB samples
   - Create PR for main branch

---

## 📞 Support

If you encounter issues:
1. Check Vercel logs first
2. Check service provider logs (Mailgun, Stripe, etc.)
3. Verify environment variables are set correctly
4. Test individual components in isolation
5. Review error messages carefully

---

**Last Updated**: 2025-11-11  
**Environment**: Staging (https://equality-v.vercel.app)  
**Branch**: integrations
