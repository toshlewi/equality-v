# Integration Testing Guide - Step by Step

This guide walks you through testing each integration manually, with clear success criteria for each step.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] `.env.local` file created with all required variables (see `integration-execution-plan.md` section 5)
- [ ] MongoDB connection working (`npm run test:db`)
- [ ] Development server running (`npm run dev`)
- [ ] Admin account created (`npm run seed:admin`)

---

## Integration Flow Diagrams

### Payment Flow (Stripe)

```
User → Form Submission
  ↓
POST /api/membership (or /api/donations)
  ↓
Create Payment Intent (Stripe API)
  ↓
Return client_secret to frontend
  ↓
Frontend: Stripe.js handles payment
  ↓
Payment succeeds → Stripe sends webhook
  ↓
POST /api/webhooks/stripe
  ↓
Verify webhook signature
  ↓
Update database (Member/Donation status: 'completed')
  ↓
Send confirmation email (Mailgun)
  ↓
Create admin notification
  ↓
Optionally add to Mailchimp
  ↓
✅ User receives confirmation email
✅ Admin sees notification
```

### Payment Flow (M-Pesa)

```
User → Form Submission
  ↓
POST /api/membership (or /api/donations)
  ↓
Format phone number (add country code 254)
  ↓
Initiate STK Push (M-Pesa API)
  ↓
Return checkoutRequestID to frontend
  ↓
User receives M-Pesa prompt on phone
  ↓
User enters PIN → Payment succeeds
  ↓
M-Pesa sends callback
  ↓
POST /api/webhooks/mpesa
  ↓
Verify callback signature
  ↓
Extract transaction details
  ↓
Update database (Member/Donation status: 'completed')
  ↓
Send confirmation email (Mailgun)
  ↓
Create admin notification
  ↓
Optionally add to Mailchimp
  ↓
✅ User receives confirmation email
✅ Admin sees notification
```

### Email Flow (Mailgun)

```
Event occurs (payment, registration, etc.)
  ↓
Call sendEmail() with template name
  ↓
Render email template (HTML + text)
  ↓
Mailgun API: messages.create()
  ↓
Mailgun processes email
  ↓
Email delivered to recipient
  ↓
Mailgun logs delivery status
  ↓
✅ User receives email
✅ Delivery tracked in Mailgun dashboard
```

### Notification Flow

```
Event occurs (new member, donation, etc.)
  ↓
Call createAdminNotification()
  ↓
Create Notification document in MongoDB
  ↓
Status: 'unread'
  ↓
Optionally send email notification
  ↓
Admin dashboard polls /api/admin/notifications
  ↓
Or WebSocket sends real-time update
  ↓
Admin sees notification
  ↓
Admin marks as read
  ↓
✅ Notification status: 'read'
```

### Newsletter Subscription Flow

```
User submits newsletter form
  ↓
POST /api/newsletter/subscribe
  ↓
Validate email and reCAPTCHA
  ↓
Call addSubscriber() (Mailchimp API)
  ↓
Mailchimp adds subscriber to list
  ↓
Apply tags (e.g., 'newsletter', 'member')
  ↓
Send confirmation email (Mailgun)
  ↓
✅ Subscriber added to Mailchimp
✅ User receives confirmation email
```

### Newsletter Unsubscribe Flow

```
User clicks unsubscribe link
  ↓
GET /api/newsletter/unsubscribe?email=...
  ↓
Get subscriber hash from email
  ↓
Call removeSubscriber() (Mailchimp API)
  ↓
Mailchimp removes subscriber from list
  ↓
Send confirmation email (Mailgun)
  ↓
✅ Subscriber removed from Mailchimp
✅ User receives confirmation email
```

---

## Step 1: Environment Variables Validation

### What to do:
1. Run: `npm run validate:env`
2. Review the output - all required variables should show ✅

### Expected output:
```
📂 Database:
  ✅ MONGODB_URI (Required)
  ✅ NEXTAUTH_URL (Required)
  ✅ NEXTAUTH_SECRET (Required)

📂 Payments:
  ✅ STRIPE_SECRET_KEY (Optional)
  ✅ STRIPE_PUBLISHABLE_KEY (Optional)
  ⚠️ MPESA_CONSUMER_KEY (Optional)

📊 Summary:
  Required variables: 15/15 set
  Optional variables: 8/20 set
```

### Success criteria:
- ✅ All required variables show ✅ (not ❌)
- ✅ No errors in console
- ✅ Database connection test passes

### If validation fails:
- Check `.env.local` file exists in project root
- Verify variable names match exactly (case-sensitive)
- Ensure no extra spaces or quotes around values

---

## Step 2: Stripe Integration Testing

### 2.1 Manual Setup (One-time)

**What you need to do:**

1. **Create Stripe Account** (if not done):
   - Go to https://dashboard.stripe.com
   - Complete onboarding/KYC
   - Switch to Test Mode (toggle in top right)

2. **Get API Keys:**
   - Developers → API keys
   - Copy "Secret key" → `STRIPE_SECRET_KEY` in `.env.local`
   - Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY` in `.env.local`

3. **Set up Webhook (Local Development):**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

4. **Set up Webhook (Production/Staging):**
   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel env vars

### 2.2 Test Membership Payment

**What to do:**

1. Navigate to `/get-involved` page
2. Click "Join our community" or membership form
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+254712345678`
   - Membership tier: `1 year`
   - Payment method: `Stripe`
4. Submit form
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
6. Complete payment

**Expected results:**

- ✅ Form submits successfully
- ✅ Payment intent created (check Stripe Dashboard → Payments)
- ✅ Webhook received (check Stripe CLI output or Dashboard → Webhooks → Events)
- ✅ Member record created in MongoDB with `status: 'active'`
- ✅ Confirmation email sent (check Mailgun logs)
- ✅ Admin notification created (check admin dashboard)
- ✅ Mailchimp subscriber added (if opted in)

**How to verify:**

```bash
# Check member in database
# Use MongoDB Compass or run:
npm run test:db
# Then query: db.members.find({ email: "test@example.com" })
```

**MongoDB Query Examples:**

```javascript
// Connect to MongoDB (use MongoDB Compass or mongosh)
use equality_vanguard

// Query member by email
db.members.find({ email: "test@example.com" })

// Query active members
db.members.find({ 
  isActive: true,
  expiryDate: { $gt: new Date() }
})

// Query members by payment status
db.members.find({ paymentStatus: "completed" })

// Query members by payment method
db.members.find({ paymentMethod: "stripe" })

// Count total members
db.members.countDocuments({})

// Count active members
db.members.countDocuments({ isActive: true })

// Query donations
db.donations.find({ status: "completed" })

// Query donations by amount range
db.donations.find({ 
  amount: { $gte: 50, $lte: 500 }
})

// Query event registrations
db.eventregistrations.find({ status: "confirmed" })

// Query notifications
db.notifications.find({ read: false })

// Count unread notifications
db.notifications.countDocuments({ read: false })

// Aggregate: Total donations by month
db.donations.aggregate([
  {
    $match: { status: "completed" }
  },
  {
    $group: {
      _id: { 
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      totalAmount: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  }
])

// Aggregate: Members by membership type
db.members.aggregate([
  {
    $group: {
      _id: "$membershipType",
      count: { $sum: 1 },
      totalRevenue: { $sum: "$amount" }
    }
  }
])
```

**Check Stripe Dashboard:**
- Payments → Should show test payment with status "Succeeded"

**Check webhook logs:**
- Stripe CLI should show: "Received payment_intent.succeeded"

**API Testing Examples:**

**cURL Examples:**

```bash
# Create membership with Stripe
curl -X POST http://localhost:3000/api/membership \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0712345678",
    "membershipType": "annual",
    "membershipYears": "1",
    "paymentMethod": "stripe",
    "termsAccepted": true,
    "privacyAccepted": true,
    "recaptchaToken": "test_token"
  }'

# Create membership with M-Pesa
curl -X POST http://localhost:3000/api/membership \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0712345678",
    "membershipType": "annual",
    "membershipYears": "1",
    "paymentMethod": "mpesa",
    "termsAccepted": true,
    "privacyAccepted": true,
    "recaptchaToken": "test_token"
  }'

# Create donation
curl -X POST http://localhost:3000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Test Donor",
    "donorEmail": "donor@example.com",
    "amount": 50,
    "currency": "USD",
    "donationType": "cash",
    "paymentMethod": "stripe",
    "anonymous": false,
    "recaptchaToken": "test_token"
  }'

# Subscribe to newsletter
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "name": "Subscriber Name",
    "tags": ["newsletter"]
  }'

# Unsubscribe from newsletter
curl -X POST http://localhost:3000/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "reason": "No longer interested"
  }'

# Get member by email
curl -X GET "http://localhost:3000/api/membership?email=test@example.com"

# Get admin notifications (requires auth)
curl -X GET http://localhost:3000/api/admin/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Postman Collection:**

Import these requests into Postman:

1. **Create Membership (Stripe)**
   - Method: POST
   - URL: `{{baseUrl}}/api/membership`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "phone": "0712345678",
     "membershipType": "annual",
     "membershipYears": "1",
     "paymentMethod": "stripe",
     "termsAccepted": true,
     "privacyAccepted": true,
     "recaptchaToken": "test_token"
   }
   ```

2. **Create Membership (M-Pesa)**
   - Method: POST
   - URL: `{{baseUrl}}/api/membership`
   - Same as above, but set `"paymentMethod": "mpesa"`

3. **Create Donation**
   - Method: POST
   - URL: `{{baseUrl}}/api/donations`
   - Body (JSON):
   ```json
   {
     "donorName": "Test Donor",
     "donorEmail": "donor@example.com",
     "amount": 50,
     "currency": "USD",
     "donationType": "cash",
     "paymentMethod": "stripe",
     "anonymous": false,
     "recaptchaToken": "test_token"
   }
   ```

4. **Subscribe to Newsletter**
   - Method: POST
   - URL: `{{baseUrl}}/api/newsletter/subscribe`
   - Body (JSON):
   ```json
   {
     "email": "subscriber@example.com",
     "name": "Subscriber Name",
     "tags": ["newsletter"]
   }
   ```

5. **Unsubscribe from Newsletter**
   - Method: POST
   - URL: `{{baseUrl}}/api/newsletter/unsubscribe`
   - Body (JSON):
   ```json
   {
     "email": "subscriber@example.com",
     "reason": "No longer interested"
   }
   ```

6. **Get Member**
   - Method: GET
   - URL: `{{baseUrl}}/api/membership?email=test@example.com`

7. **Get Admin Notifications**
   - Method: GET
   - URL: `{{baseUrl}}/api/admin/notifications`
   - Headers: `Authorization: Bearer {{token}}`

### 2.3 Test Donation Payment

**What to do:**

1. Navigate to `/get-involved` page
2. Click "Support our work" or donation form
3. Fill in:
   - Name: `Test Donor`
   - Email: `donor@example.com`
   - Phone: `+254712345678`
   - Donation type: `Cash`
   - Amount: `50` (USD)
   - Payment method: `Stripe`
4. Submit and complete payment with test card

**Expected results:**

- ✅ Donation record created with `status: 'completed'`
- ✅ Receipt email sent
- ✅ Admin notification created
- ✅ Mailchimp tag added (if opted in)

### 2.4 Test Event Registration Payment

**What to do:**

1. Create a test event in admin dashboard (or use existing)
2. Navigate to `/events` page
3. Click on an event with paid tickets
4. Fill registration form:
   - Name: `Event Attendee`
   - Email: `attendee@example.com`
   - Phone: `+254712345678`
   - Ticket type: `Paid`
   - Payment method: `Stripe`
5. Complete payment

**Expected results:**

- ✅ Registration created with `status: 'confirmed'`
- ✅ Ticket email sent with `.ics` calendar attachment
- ✅ Event registration count updated
- ✅ Admin notification created

### 2.5 Test Stripe Webhook Failure Handling

**What to do:**

1. Temporarily set wrong `STRIPE_WEBHOOK_SECRET` in `.env.local`
2. Complete a test payment
3. Check webhook logs

**Expected results:**

- ✅ Webhook returns 400/401 error
- ✅ Payment intent still succeeds in Stripe
- ✅ Security event logged (check audit logs)
- ✅ Admin notified of webhook failure

**Fix:** Restore correct `STRIPE_WEBHOOK_SECRET`

---

## Step 3: M-Pesa Integration Testing

### 3.1 Manual Setup (One-time)

**What you need to do:**

1. **Create Safaricom Daraja Account:**
   - Go to https://developer.safaricom.co.ke/
   - Register/login
   - Create an app (or use existing)

2. **Get Credentials:**
   - Consumer Key → `MPESA_CONSUMER_KEY`
   - Consumer Secret → `MPESA_CONSUMER_SECRET`
   - Short Code (PayBill/Till) → `MPESA_SHORTCODE`
   - Passkey (Lipa na M-Pesa Online) → `MPESA_PASSKEY`

3. **Set Environment:**
   - For testing: `MPESA_ENVIRONMENT=sandbox`
   - For production: `MPESA_ENVIRONMENT=production`

4. **Configure Callback URL:**
   - In Daraja portal, set callback URL to: `https://your-domain.com/api/webhooks/mpesa`
   - For local testing, use ngrok or similar tunnel

### 3.2 Test M-Pesa STK Push (Sandbox)

**What to do:**

1. Navigate to membership/donation form
2. Select payment method: `M-Pesa`
3. Fill form and submit
4. Use test phone number: `254708374149` (Daraja sandbox number)
5. Enter test PIN: `174379` (sandbox default)

**Expected results:**

- ✅ STK Push initiated
- ✅ Callback received at `/api/webhooks/mpesa`
- ✅ Member/donation record updated with `status: 'completed'`
- ✅ Confirmation email sent
- ✅ Admin notification created

**How to verify:**

```bash
# Check callback logs
# Server console should show: "Received M-Pesa callback"
```

**MongoDB Query Examples:**

```javascript
// Query member with M-Pesa payment
db.members.find({ 
  email: "test@example.com",
  paymentProvider: "mpesa"
})

// Query by checkout request ID
db.members.find({ 
  paymentId: "checkout_request_id_here"
})

// Query pending M-Pesa payments
db.members.find({ 
  paymentMethod: "mpesa",
  paymentStatus: "pending"
})

// Query completed M-Pesa payments
db.members.find({ 
  paymentMethod: "mpesa",
  paymentStatus: "completed"
})
```

**Check M-Pesa Dashboard:**
- Transactions → Should show test transaction

### 3.3 Test M-Pesa Callback Handling

**What to do:**

1. Simulate callback manually (or use Daraja test tools)
2. Send POST to `/api/webhooks/mpesa` with valid callback payload

**Expected results:**

- ✅ Callback processed successfully
- ✅ Returns `ResultCode: 0, ResultDesc: 'Callback processed successfully'`
- ✅ Database record updated
- ✅ Email sent

---

## Step 4: Mailgun Email Testing

### 4.1 Manual Setup (One-time)

**What you need to do:**

1. **Create Mailgun Account:**
   - Go to https://www.mailgun.com/
   - Sign up/login

2. **Add Domain:**
   - Add domain (e.g., `mg.equalityvanguard.org`)
   - Add DNS records (TXT, CNAME, MX) as instructed
   - Verify domain

3. **Get API Key:**
   - Settings → API Keys
   - Copy Private API key → `MAILGUN_API_KEY`

4. **Set Environment Variables:**
   - `MAILGUN_DOMAIN=mg.equalityvanguard.org`
   - `MAILGUN_FROM_EMAIL=noreply@mg.equalityvanguard.org`
   - `MAILGUN_FROM_NAME=Equality Vanguard`
   - `ADMIN_EMAIL=admin@equalityvanguard.org`

### 4.2 Test Transactional Emails

**What to do:**

1. Complete a membership payment (Step 2.2)
2. Check email inbox for `test@example.com`
3. Check Mailgun Dashboard → Logs

**Expected results:**

- ✅ Email received within 1-2 minutes
- ✅ Email has correct branding (Equality Vanguard styling)
- ✅ Email contains:
   - Membership confirmation
   - Receipt details
   - Membership dates
- ✅ Mailgun logs show "Delivered" status

**Test all email templates:**

- [ ] Membership confirmation (`membership-confirmation`)
- [ ] Donation receipt (`donation-receipt`)
- [ ] Event ticket (`event-registration`)
- [ ] Admin notification (`admin-notification`)
- [ ] Submission received (`submission-received`)
- [ ] Story published (`story-published`)

### 4.3 Test Email Failures

**What to do:**

1. Temporarily set wrong `MAILGUN_API_KEY`
2. Complete a form submission
3. Check server logs

**Expected results:**

- ✅ Form submission succeeds (email failure doesn't block)
- ✅ Error logged in console
- ✅ Admin notified of email failure (if configured)

**Fix:** Restore correct `MAILGUN_API_KEY`

---

## Step 5: Mailchimp Integration Testing

### 5.1 Manual Setup (One-time)

**What you need to do:**

1. **Create Mailchimp Account:**
   - Go to https://mailchimp.com/
   - Sign up/login

2. **Create Audience (List):**
   - Audience → Create Audience
   - Note the Audience ID → `MAILCHIMP_LIST_ID`

3. **Get API Key:**
   - Account → Extras → API keys
   - Create API key
   - Note server prefix (e.g., `us1`) → `MAILCHIMP_SERVER_PREFIX`
   - Copy full API key → `MAILCHIMP_API_KEY`

### 5.2 Test Newsletter Subscribe

**What to do:**

1. Navigate to newsletter signup (footer or dedicated page)
2. Enter email: `newsletter@example.com`
3. Submit

**Expected results:**

- ✅ Subscriber added to Mailchimp audience
- ✅ Status: `subscribed` or `pending` (if double opt-in enabled)
- ✅ Confirmation email sent (if double opt-in)
- ✅ Success message shown to user

**How to verify:**

- Check Mailchimp Dashboard → Audience → All contacts
- Should see `newsletter@example.com` with tag `newsletter`

### 5.3 Test Tagging by Source

**What to do:**

1. Complete membership with email `member@example.com`
2. Complete donation with email `donor@example.com`
3. Register for event with email `attendee@example.com`

**Expected results:**

- ✅ Each contact added to Mailchimp
- ✅ Tags applied:
   - `member_1yr` for membership
   - `donor` for donation
   - `event_{eventId}` for event registration

**How to verify:**

- Mailchimp Dashboard → Audience → Select contact
- Check Tags section for correct tags

### 5.4 Test Unsubscribe

**What to do:**

1. Navigate to `/unsubscribe` page
2. Enter email: `newsletter@example.com`
3. Submit

**Expected results:**

- ✅ Subscriber status changed to `unsubscribed` in Mailchimp
- ✅ Confirmation message shown
- ✅ No further emails sent to this address

**How to verify:**

- Mailchimp Dashboard → Audience → Select contact
- Status should be `unsubscribed`

---

## Step 6: Admin Notifications Testing

### 6.1 Test In-App Notifications

**What to do:**

1. Log in to admin dashboard (`/admin`)
2. Complete a form submission (membership, donation, contact, etc.)
3. Check admin dashboard notifications

**Expected results:**

- ✅ Notification appears in admin dashboard
- ✅ Notification shows:
   - Type (e.g., "New Membership")
   - Details (name, email, amount)
   - Timestamp
   - Link to detail page
- ✅ Notification marked as "unread"

**How to verify:**

- Admin Dashboard → Notifications (bell icon or sidebar)
- Should see new notification without page refresh (if real-time enabled)

### 6.2 Test Email Notifications to Admin

**What to do:**

1. Complete a form submission
2. Check `ADMIN_EMAIL` inbox

**Expected results:**

- ✅ Email received at admin email
- ✅ Email contains:
   - Subject: "New [Type] Submission"
   - Details of submission
   - Link to admin dashboard

### 6.3 Test Real-time Updates (Optional)

**What to do:**

1. Open admin dashboard in two browser windows
2. In one window, complete a form submission
3. Check if other window updates automatically

**Expected results:**

- ✅ If WebSockets enabled: Notification appears without refresh
- ✅ If polling enabled: Notification appears within 30 seconds

**Note:** Real-time requires WebSocket server or polling implementation (see `src/lib/websocket.ts`)

---

## Step 7: Google Calendar Integration (Optional)

### 7.1 Manual Setup

**What you need to do:**

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com/
   - Create project → Enable Google Calendar API

2. **Create Service Account:**
   - IAM & Admin → Service Accounts
   - Create service account
   - Create and download JSON key

3. **Share Calendar:**
   - Open Google Calendar
   - Settings → Share with specific people
   - Add service account email (from JSON key)
   - Permission: "Make changes to events"

4. **Set Environment Variables:**
   - `GOOGLE_PROJECT_ID=your-project-id`
   - `GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com`
   - `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - `GOOGLE_CALENDAR_ID=primary` or specific calendar ID

### 7.2 Test Calendar Event Creation

**What to do:**

1. Create an event in admin dashboard
2. Check Google Calendar

**Expected results:**

- ✅ Event created in shared Google Calendar
- ✅ Event has:
   - Correct title
   - Date/time
   - Description
   - Location (if provided)

**Note:** `.ics` file attachments in emails work without Google Calendar API (already implemented via `src/lib/calendar.ts`)

---

## Step 8: End-to-End Flow Testing

### 8.1 Complete User Journey: Membership

**What to do:**

1. User visits `/get-involved`
2. Clicks "Join our community"
3. Fills membership form
4. Selects Stripe payment
5. Completes payment
6. Receives confirmation email
7. Added to Mailchimp

**Expected results:**

- ✅ All steps complete without errors
- ✅ User receives confirmation
- ✅ Admin sees notification
- ✅ Database records created
- ✅ Email sent
- ✅ Mailchimp updated

### 8.2 Complete User Journey: Event Registration

**What to do:**

1. User visits `/events`
2. Clicks on event
3. Fills registration form
4. Selects M-Pesa payment
5. Completes STK Push
6. Receives ticket email with `.ics`

**Expected results:**

- ✅ Registration confirmed
- ✅ Payment processed
- ✅ Ticket email received
- ✅ Calendar invite opens in calendar app
- ✅ Admin sees registration

---

## Troubleshooting Common Issues

### Issue: Stripe webhook not received

**Symptoms:**
- Payment succeeds but member/donation status remains 'pending'
- No confirmation emails sent
- Admin notifications not created

**Check:**
- Webhook URL is correct in Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
- Webhook endpoint is publicly accessible (use ngrok for local testing)
- Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook logs in Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Logs

**Solution:**
1. Verify webhook secret: Copy from Stripe Dashboard → Webhooks → [Your endpoint] → Signing secret
2. Update `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
3. For local testing, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Test webhook: `stripe trigger payment_intent.succeeded`

### Issue: M-Pesa STK Push fails

**Symptoms:**
- Error: "M-Pesa is not configured"
- Error: "Invalid BusinessShortCode"
- STK Push initiated but no callback received

**Check:**
- All M-Pesa credentials are set in `.env.local`
- `MPESA_SHORTCODE` is numeric only (e.g., `174379`)
- `MPESA_ENVIRONMENT` is set to `sandbox` for testing
- Phone number format is correct (starts with `254` for Kenya)
- Callback URL is accessible: `${NEXTAUTH_URL}/api/webhooks/mpesa`

**Solution:**
1. Verify credentials in M-Pesa Daraja portal
2. Ensure shortcode is numeric: `MPESA_SHORTCODE=174379` (not `"174379"` or with spaces)
3. Format phone number: Ensure it starts with country code `254`
4. Test callback URL: `curl -X POST ${NEXTAUTH_URL}/api/webhooks/mpesa`
5. Check M-Pesa sandbox logs in Daraja portal

### Issue: Email not sending (Mailgun)

**Symptoms:**
- No emails received after form submission
- Error: "Mailgun API key invalid"
- Error: "Domain not verified"

**Check:**
- `MAILGUN_API_KEY` is set correctly
- `MAILGUN_DOMAIN` matches verified domain in Mailgun dashboard
- DNS records (TXT, CNAME, MX) are configured correctly
- Domain verification status in Mailgun dashboard
- Check Mailgun logs: Dashboard → Logs

**Solution:**
1. Verify API key: Mailgun Dashboard → Settings → API Keys
2. Check domain verification: Mailgun Dashboard → Sending → Domains → [Your domain]
3. Verify DNS records:
   - TXT record for SPF
   - CNAME record for DKIM
   - MX record (if using Mailgun for receiving)
4. Test email sending: `npm run test:email`
5. Check Mailgun logs for delivery status

### Issue: Mailchimp subscription fails

**Symptoms:**
- Error: "Invalid API key"
- Error: "List not found"
- Subscriber not added to list

**Check:**
- `MAILCHIMP_API_KEY` format: `your_key-us1` (server prefix included)
- `MAILCHIMP_LIST_ID` matches audience ID in Mailchimp dashboard
- `MAILCHIMP_SERVER_PREFIX` matches API key suffix (e.g., `us1`)
- API key has correct permissions

**Solution:**
1. Get API key: Mailchimp Dashboard → Account → Extras → API keys
2. Get List ID: Mailchimp Dashboard → Audience → Settings → Audience name and defaults → Audience ID
3. Extract server prefix from API key (e.g., `abc123-us1` → prefix is `us1`)
4. Test subscription: `npm run test:mailchimp`
5. Check Mailchimp logs: Dashboard → Audience → Activity

### Issue: Database connection fails

**Symptoms:**
- Error: "MongoServerError: connection timeout"
- Error: "Authentication failed"
- Error: "IP not whitelisted"

**Check:**
- `MONGODB_URI` format is correct
- MongoDB Atlas IP whitelist includes your IP (or `0.0.0.0/0` for all)
- Database user has correct permissions
- Network access rules in MongoDB Atlas

**Solution:**
1. Verify connection string format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
2. Check IP whitelist: MongoDB Atlas → Network Access → IP Access List
3. For local dev, add your IP or use `0.0.0.0/0` (not recommended for production)
4. Test connection: `npm run test:db`
5. Check MongoDB Atlas logs: Dashboard → Monitoring → Logs

### Issue: reCAPTCHA verification fails

**Symptoms:**
- Error: "reCAPTCHA verification failed"
- Forms cannot be submitted
- reCAPTCHA widget not loading

**Check:**
- `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` are set
- Site key matches secret key (same reCAPTCHA account)
- reCAPTCHA domain is whitelisted in Google reCAPTCHA console
- CSP allows `https://www.google.com` and `https://www.gstatic.com`

**Solution:**
1. Get keys: Google reCAPTCHA Console → [Your site] → Settings
2. Verify domain whitelist: Add your domain to allowed domains
3. Check CSP in `src/middleware.ts`: Ensure Google domains are allowed
4. Test reCAPTCHA: Check browser console for errors
5. Verify keys match: Site key and secret key must be from same account

### Issue: File upload fails (R2/S3)

**Symptoms:**
- Error: "Access denied"
- Error: "Bucket not found"
- Files not accessible after upload

**Check:**
- R2/S3 credentials are set correctly
- Bucket name matches `R2_BUCKET_NAME`
- Bucket permissions allow public read (if needed)
- CORS configuration allows uploads from your domain

**Solution:**
1. Verify credentials: Cloudflare R2 Dashboard → Manage R2 API Tokens
2. Check bucket name: Ensure it matches `R2_BUCKET_NAME`
3. Configure CORS: R2 Dashboard → Bucket → Settings → CORS
4. Test upload: `npm run test:upload`
5. Verify public URL: Check `R2_PUBLIC_URL` is correct

### Issue: API routes return 500 errors

**Symptoms:**
- API calls fail with 500 status
- Error logs show unhandled exceptions
- Database queries fail

**Check:**
- Server logs for error messages
- Database connection is working
- Environment variables are set correctly
- API route handlers have proper error handling

**Solution:**
1. Check server logs: Look for error stack traces
2. Verify environment: `npm run validate:env`
3. Test database: `npm run test:db`
4. Check API route code: Ensure try-catch blocks handle errors
5. Test API routes: Use curl or Postman to test endpoints

### Issue: NextAuth authentication fails

**Symptoms:**
- Cannot log in
- Error: "Invalid credentials"
- Session not persisting

**Check:**
- `NEXTAUTH_SECRET` is set (minimum 32 characters)
- `NEXTAUTH_URL` matches your application URL
- Database connection is working (for MongoDB adapter)
- Session configuration in NextAuth options

**Solution:**
1. Generate secret: `openssl rand -base64 32`
2. Set `NEXTAUTH_SECRET` in `.env.local`
3. Verify `NEXTAUTH_URL`: Should match your app URL (e.g., `http://localhost:3000`)
4. Test authentication: `npm run test:auth`
5. Check NextAuth logs: Look for authentication errors

### Debug Commands

**Environment Validation:**
```bash
npm run validate:env          # Check all environment variables
npm run debug:env            # Print env vars (redacted)
```

**Database Testing:**
```bash
npm run test:db              # Test database connection
npm run test:indexes         # Test database indexes
```

**Integration Testing:**
```bash
npm run test:stripe-webhook  # Simulate Stripe webhook
npm run test:mpesa-callback # Simulate M-Pesa callback
npm run test:email           # Test email sending
npm run test:mailchimp       # Test Mailchimp API
npm run verify:integrations  # Verify all integrations
```

**Network Debugging:**
```bash
# For local webhook testing, use ngrok:
ngrok http 3000

# Then update webhook URL in Stripe/M-Pesa dashboard to:
# https://your-ngrok-url.ngrok.io/api/webhooks/stripe
```

### Log File Locations

- **Application logs**: Check server console output
- **Stripe logs**: Stripe Dashboard → Developers → Logs
- **M-Pesa logs**: M-Pesa Daraja Portal → Logs
- **Mailgun logs**: Mailgun Dashboard → Logs
- **Mailchimp logs**: Mailchimp Dashboard → Audience → Activity
- **MongoDB logs**: MongoDB Atlas → Monitoring → Logs
- **Vercel logs**: Vercel Dashboard → [Your project] → Logs

### Enabling Verbose Logging

**Development:**
- Set `NODE_ENV=development` in `.env.local`
- Check server console for detailed logs

**Production:**
- Enable Sentry error tracking (if configured)
- Check Vercel function logs
- Monitor external service dashboards
- `STRIPE_WEBHOOK_SECRET` matches signing secret
- Server is accessible (use ngrok for local testing)
- Webhook events are selected in Stripe Dashboard

**Fix:**
- Re-run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local
- Verify webhook endpoint is public in production

### Issue: M-Pesa callback not received

**Check:**
- Callback URL configured in Daraja portal
- Callback URL is publicly accessible
- `MPESA_ENVIRONMENT` matches (sandbox vs production)
- Phone number format is correct (E.164: `+254712345678`)

**Fix:**
- Use ngrok or similar tunnel for local testing
- Verify callback route is not blocked by middleware

### Issue: Emails not sending

**Check:**
- Mailgun domain is verified
- DNS records are correct
- `MAILGUN_API_KEY` is valid
- `MAILGUN_DOMAIN` matches verified domain

**Fix:**
- Re-verify domain in Mailgun Dashboard
- Check Mailgun logs for delivery errors
- Test with Mailgun's API directly

### Issue: Mailchimp not adding subscribers

**Check:**
- `MAILCHIMP_API_KEY` is valid
- `MAILCHIMP_LIST_ID` is correct
- `MAILCHIMP_SERVER_PREFIX` matches API key server
- Double opt-in is not blocking (check Mailchimp settings)

**Fix:**
- Test API key with Mailchimp's API directly
- Check Mailchimp logs for errors
- Verify list ID in Mailchimp Dashboard

---

## Success Criteria Summary

After completing all steps, you should have:

- ✅ Stripe payments working (membership, donations, events, shop)
- ✅ M-Pesa payments working (sandbox tested)
- ✅ All transactional emails sending correctly
- ✅ Mailchimp integration working (subscribe, unsubscribe, tagging)
- ✅ Admin notifications appearing (in-app and email)
- ✅ Calendar invites (`.ics`) working
- ✅ All webhooks processing correctly
- ✅ Error handling working (failed payments, email failures)

---

## Next Steps

Once all integrations are tested and working:

1. **Production Cutover:**
   - Switch to live Stripe keys
   - Switch to production M-Pesa
   - Update webhook URLs to production
   - Re-test critical flows

2. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor webhook delivery rates
   - Track email delivery rates
   - Set up alerts for failures

3. **Documentation:**
   - Update `DEPLOYMENT_STATUS.md`
   - Document any custom configurations
   - Create runbook for common issues

---

**Last Updated:** [Current Date]
**Version:** 1.0

---

## Appendices

### Appendix A: Stripe Dashboard Quick Reference

**Finding API Keys:**
- Navigate to: Developers → API keys
- Test mode keys start with `sk_test_` and `pk_test_`
- Live mode keys start with `sk_live_` and `pk_live_`
- Toggle test/live mode in top right of dashboard

**Setting up Webhooks:**
- Navigate to: Developers → Webhooks
- Click "Add endpoint"
- Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Copy signing secret (starts with `whsec_`)

**Testing Webhooks Locally:**
- Install Stripe CLI: https://stripe.com/docs/stripe-cli
- Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Copy webhook signing secret from CLI output
- Test webhook: `stripe trigger payment_intent.succeeded`

**Viewing Logs:**
- Navigate to: Developers → Logs
- Filter by event type, date, or status
- Click on log entry to see full details

### Appendix B: M-Pesa Sandbox Testing Guide

**Sandbox Credentials:**
- Consumer Key: Get from M-Pesa Daraja portal → My Apps → [Your App] → App Keys
- Consumer Secret: Get from M-Pesa Daraja portal → My Apps → [Your App] → App Keys
- Shortcode: `174379` (sandbox test shortcode)
- Passkey: Get from M-Pesa Daraja portal → My Apps → [Your App] → App Settings

**Testing STK Push:**
1. Use test phone number: `254708374149` (sandbox test number)
2. Use test amount: Any amount (e.g., `1` KES)
3. Initiate STK Push via API
4. Check phone for M-Pesa prompt
5. Enter PIN: `174379` (sandbox test PIN)
6. Verify callback received at `/api/webhooks/mpesa`

**Sandbox Limitations:**
- Only works with test phone numbers
- No actual money is transferred
- Callbacks may be delayed
- Some features may not be available in sandbox

**Production Migration:**
- Get production credentials from M-Pesa Daraja portal
- Update `MPESA_ENVIRONMENT=production`
- Update all M-Pesa credentials
- Test with real phone numbers
- Monitor callback delivery

### Appendix C: Mailgun DNS Configuration Guide

**Required DNS Records:**

1. **TXT Record (SPF):**
   - Name: `@` or your domain
   - Value: `v=spf1 include:mailgun.org ~all`
   - Purpose: Prevents email spoofing

2. **CNAME Record (DKIM):**
   - Name: `k1._domainkey` (or as provided by Mailgun)
   - Value: `k1._domainkey.mailgun.org` (or as provided by Mailgun)
   - Purpose: Email authentication

3. **MX Record (Optional - for receiving):**
   - Name: `@` or your domain
   - Priority: `10`
   - Value: `mxa.mailgun.org`
   - Purpose: Receive emails at your domain

**DNS Configuration Steps:**
1. Log in to your domain registrar or DNS provider
2. Navigate to DNS management
3. Add TXT record for SPF (copy from Mailgun)
4. Add CNAME record for DKIM (copy from Mailgun)
5. Add MX record if using Mailgun for receiving
6. Wait for DNS propagation (can take up to 48 hours)
7. Verify DNS records in Mailgun dashboard

**Verifying DNS Records:**
- Use `dig` command: `dig TXT your-domain.com`
- Use online DNS checker: https://mxtoolbox.com/
- Check Mailgun dashboard: Sending → Domains → [Your Domain] → DNS Records

### Appendix D: Mailchimp Tag Management Guide

**Creating Tags:**
- Navigate to: Audience → All contacts → Manage contacts → Tags
- Click "Create tag"
- Enter tag name (e.g., `member_1yr`, `donor`, `newsletter`)
- Click "Save"

**Adding Tags to Subscribers:**
- Via API: Use `addTags()` function with tag names
- Via Dashboard: Audience → All contacts → Select subscriber → Add tags
- Via Automation: Set up automation to add tags based on actions

**Common Tags:**
- `member_1yr`: Annual members
- `member_lifetime`: Lifetime members
- `donor`: Donors
- `newsletter`: Newsletter subscribers
- `event_attendee`: Event attendees
- `active_member`: Active members

**Using Tags in Campaigns:**
- Navigate to: Campaigns → Create campaign
- Select audience segment
- Filter by tags
- Send campaign to tagged subscribers

**Tag Best Practices:**
- Use consistent naming conventions
- Keep tag names short and descriptive
- Use tags to segment audiences
- Remove tags when no longer relevant
- Document tag meanings

