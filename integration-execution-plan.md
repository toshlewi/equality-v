## Integration Execution Plan

This document details how to configure, connect, and test all external integrations (payments, email/notifications, calendar, and admin notifications) across the frontend, backend (API routes), admin portal, and database.

- Codebase context: Next.js app with API routes under `src/app/api`, frontend pages/components under `src/app` and `src/components`, MongoDB via Mongoose models in `src/models`, integration helpers in `src/lib`.
- Always confirm content and flows against the project content plan in `EV CONTEXT.md`.

### Index
- 0) Pre-flight fixes from assessment (headers/CSP, fonts, i18n, images)
- 1) Payments: Stripe and M-Pesa (Daraja)
- 2) Email and Notifications: Mailgun and Mailchimp
- 3) Google Calendar: Events syncing and reminders
- 4) Admin Portal Notifications: In-app and optional real-time
- 5) Security and API Keys: Managing secrets locally and in production
- 6) Testing Matrix: How to test each integration
- 7) Rollout plan, milestones, and owners
- 8) Risks and mitigations

---

## 0) Pre-flight fixes from assessment

Make these adjustments before turning on live integrations:

- Consolidate security headers/CSP: Prefer a single authoritative source. Recommendation: keep CSP in `src/middleware.ts` and remove/trim duplicates from `next.config.ts` and `vercel.json` headers to avoid double headers. Ensure allowed domains cover Stripe, reCAPTCHA, Mailgun, M-Pesa, Google Fonts.
- Fonts: Ensure Fredoka and League Spartan are loaded via `next/font` (self-host) or Google Fonts. If using Google Fonts, CSP already allows `fonts.googleapis.com` and `fonts.gstatic.com`.
- i18n coverage: Populate `messages/fr.json` and `messages/sw.json` and verify `[locale]` routes render without fallback gaps.
- Next/Image domains: Extend `images.remotePatterns` in `next.config.ts` if images are served from domains beyond `equalityvanguard.org`.
- Env validation: Run `npm run validate:env` (or `tsx src/scripts/validate-env.ts`) for staging and prod to confirm all required variables are present.
- Build check: `npm run type-check && npm run lint && npm run build` to surface issues before wiring keys.
- Lighthouse/accessibility: Run a Lighthouse pass; target 80+ per EV CONTEXT. Fix contrast and aria labels where needed.

## 1) Payments

### What they do
- **Stripe**: International card-based payments; used for membership, donations, event tickets, shop orders.
- **M-Pesa (Daraja API)**: Mobile money (Kenya, E. Africa); used for membership, donations, event tickets.

### Relevant code
- Stripe helper: `src/lib/stripe.ts`
- M-Pesa helper: `src/lib/mpesa.ts`
- Webhooks: `src/app/api/webhooks/stripe/route.ts` (Stripe), `src/app/api/webhooks/mpesa` (callback path used in code)
- API entry points using payments:
  - Membership: `src/app/api/membership/route.ts`
  - Donations: `src/app/api/donations/route.ts`
  - Events: `src/app/api/events/register/route.ts`
  - Admin refunds/orders: `src/app/api/admin/*`
- Frontend forms with payment options:
  - Membership: `src/components/get-involved/forms/MembershipForm.tsx`
  - Donations: `src/components/get-involved/forms/DonateForm.tsx`
  - Events: events page under `src/app/events`

### Environment variables (create these; placeholders only)
Add to `.env.local` for local, and to your hosting environment (e.g., Vercel Project Settings → Environment Variables) for production:

```bash
# Database
MONGODB_URI=

# App URL (used for webhooks and links)
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_ENVIRONMENT=sandbox # or production

# Email (Mailgun)
MAILGUN_API_KEY=
MAILGUN_DOMAIN=mg.example.org
MAILGUN_FROM_EMAIL=noreply@example.org
MAILGUN_FROM_NAME=Equality Vanguard
ADMIN_EMAIL=admin@equalityvanguard.org

# Mailchimp
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
MAILCHIMP_SERVER_PREFIX=us1

# Google reCAPTCHA (already used by forms)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Organization Info (used in receipts)
ORG_TAX_ID=
ORG_NAME=Equality Vanguard
ORG_ADDRESS=Your Address
```

Keep `.env.local` out of version control (already standard). Use Vercel/host env vars for production and staging. Never commit real keys.

### Manual setup: Stripe
1. Create a Stripe account at `https://dashboard.stripe.com` and complete onboarding/KYC.
2. In Developers → API keys:
   - Copy Secret key → `STRIPE_SECRET_KEY`
   - Copy Publishable key → `STRIPE_PUBLISHABLE_KEY`
3. In Developers → Webhooks:
   - Add endpoint URL: `[PROD_BASE_URL]/api/webhooks/stripe`
   - For local dev, use a tunnel (e.g., `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
   - Select events: at minimum `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, and any subscription events if used.
   - Copy Signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Currency: default is set per request in `src/lib/stripe.ts`. Use appropriate currency per flow (e.g., `kes` for Kenya).

### Manual setup: M-Pesa (Daraja)
1. Create a Safaricom Daraja developer account at `https://developer.safaricom.co.ke/`.
2. Create an app to receive `Consumer Key` and `Consumer Secret` → set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`.
3. Obtain your `Short Code` (PayBill/Till) → `MPESA_SHORTCODE`.
4. Get your `Passkey` (Lipa na M-Pesa Online) → `MPESA_PASSKEY`.
5. Set `MPESA_ENVIRONMENT` to `sandbox` for testing, `production` for live.
6. Callback URL in code defaults to `${NEXTAUTH_URL}/api/webhooks/mpesa`. Ensure this route is publicly reachable and added in the M-Pesa portal for your app.

### Wiring: pages, routes, admin
- Donations
  - Frontend: `DonateForm.tsx` allows `paymentMethod` of `stripe` or `mpesa` for cash donations.
  - Backend: `POST /api/donations` creates intent (Stripe) or starts STK Push (M-Pesa) and returns processing data.
  - Webhooks: Stripe updates finalized status; M-Pesa callback sets result. Both should send email receipts and admin notifications.
  - Admin: Donations visible via admin APIs (see `src/app/api/admin/donations/[id]/route.ts` and dashboards under `src/app/admin`).

- Membership
  - Frontend: `MembershipForm.tsx` with `paymentMethod`.
  - Backend: `POST /api/membership` creates payment intent or STK Push; Stripe webhook path finalizes.
  - Admin: Members visible and manageable under admin routes `src/app/api/admin/members/[id]`.

- Events
  - Backend: `POST /api/events/:id/register` supports `stripe`, `mpesa`, and `free` flows. On success, backend can generate `.ics` and email tickets.
  - Admin: Attendees and payments visible via admin event pages.

- Shop (if enabled)
  - Stripe PaymentIntents for orders, refunds via admin (`src/app/api/admin/orders/[id]/route.ts`).

### Payment confirmations and receipts
- Stripe: `src/app/api/webhooks/stripe/route.ts` verifies signature, updates models (member/donation/order/registration), triggers Mailgun emails: donation receipts, membership confirmations, event tickets, and admin notifications, and optionally adds contacts to Mailchimp.
- M-Pesa: `src/lib/mpesa.ts` outlines STK Push and callback parsing. Ensure an API route exists at `/api/webhooks/mpesa` to:
  1) Verify/parse callback,
  2) Update the related entity by metadata (`accountReference` or mapping),
  3) Send user receipt email (`donation-receipt`, etc.),
  4) Notify admin via in-app notification,
  5) Optionally add to Mailchimp.

Recommended callback handler location: `src/app/api/webhooks/mpesa/route.ts` following the pattern in the Stripe webhook route.

### Code Examples: Payment Intent Creation

**Stripe Payment Intent:**
```typescript
// Example from src/app/api/membership/route.ts
import { createPaymentIntent } from '@/lib/stripe';

const paymentIntent = await createPaymentIntent({
  amount: Math.round(usdAmount * 100), // Convert to cents
  currency: 'usd',
  metadata: {
    memberId: member._id.toString(),
    membershipType: validatedData.membershipType,
    membershipYears: membershipYears.toString(),
    originalAmount: amount.toString(),
    originalCurrency: 'KES',
    type: 'membership'
  },
  customerEmail: sanitizedData.email,
  customerName: sanitizedData.name,
  description: `Equality Vanguard ${validatedData.membershipType} membership`
});

// Update member with payment ID
member.paymentId = paymentIntent.id;
await member.save();

// Return client secret for frontend
return NextResponse.json({
  success: true,
  data: {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount: amount,
    currency: 'KES'
  }
});
```

**M-Pesa STK Push:**
```typescript
// Example from src/app/api/membership/route.ts
import { initiateSTKPush } from '@/lib/mpesa';

// Format phone number (ensure it starts with country code)
let phoneNumber = sanitizedData.phone.trim();
if (!phoneNumber.startsWith('254')) {
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.substring(1);
  } else if (phoneNumber.startsWith('7')) {
    phoneNumber = '254' + phoneNumber;
  }
}

// Generate callback URL
const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/mpesa`;

// Create account reference in format: membership_{memberId}
const accountReference = `membership_${member._id.toString()}`;

// Initiate STK Push
const stkPushResponse = await initiateSTKPush({
  phone: phoneNumber,
  amount: amount,
  accountReference: accountReference,
  transactionDesc: `Equality Vanguard ${validatedData.membershipType} membership`,
  callbackUrl: callbackUrl
});

// Update member with checkout request ID for tracking
member.paymentId = stkPushResponse.CheckoutRequestID;
member.paymentProvider = 'mpesa';
await member.save();

// Return response
return NextResponse.json({
  success: true,
  data: {
    checkoutRequestId: stkPushResponse.CheckoutRequestID,
    merchantRequestId: stkPushResponse.MerchantRequestID,
    customerMessage: stkPushResponse.CustomerMessage,
    amount: amount,
    currency: 'KES'
  }
});
```

---

## 2) Email and Notifications

### What they do
- **Mailgun**: Transactional/automated emails (confirmations, receipts, status updates, admin alerts) via `src/lib/email.ts` with HTML templates.
- **Mailchimp**: Newsletter signup and marketing list management via `src/lib/mailchimp.ts` and endpoints under `src/app/api/newsletter/subscribe/route.ts`.

### Relevant code
- Mailgun: `src/lib/email.ts` (templates like `donation-receipt`, `membership-confirmation`, `event-registration`, `admin-notification`, etc.)
- Mailchimp: `src/lib/mailchimp.ts`, newsletter subscribe API `src/app/api/newsletter/subscribe/route.ts`, unsubscribe UI `src/app/unsubscribe/page.tsx`
- Admin notification creation: `src/lib/notifications.ts` and multiple API routes call `createAdminNotification`

### Manual setup: Mailgun

**Step-by-step navigation:**

1. **Create Account:**
   - Go to https://www.mailgun.com/
   - Click "Sign Up" or "Log In"
   - Complete account creation
   - [SCREENSHOT: Mailgun Dashboard Home]

2. **Add Domain:**
   - Navigate to: Sending → Domains → Add New Domain
   - Enter domain name (recommended: subdomain like `mg.equalityvanguard.org`)
   - Click "Add Domain"
   - [SCREENSHOT: Add Domain Page]

3. **Configure DNS Records:**
   - Navigate to: Sending → Domains → [Your Domain] → DNS Records
   - Add TXT record for SPF (copy from Mailgun)
   - Add CNAME record for DKIM (copy from Mailgun)
   - Add MX record (if using Mailgun for receiving)
   - Wait for DNS propagation (can take up to 48 hours)
   - [SCREENSHOT: DNS Records Page]

4. **Verify Domain:**
   - Navigate to: Sending → Domains → [Your Domain]
   - Click "Verify DNS Settings"
   - Wait for verification (green checkmarks)
   - [SCREENSHOT: Domain Verification Status]

5. **Get API Key:**
   - Navigate to: Settings → API Keys
   - Copy "Private API key" → `MAILGUN_API_KEY`
   - [SCREENSHOT: API Keys Page]

6. **Set Environment Variables:**
   - `MAILGUN_API_KEY`: From step 5
   - `MAILGUN_DOMAIN`: Your verified domain (e.g., `mg.equalityvanguard.org`)
   - `MAILGUN_FROM_EMAIL`: Email address (e.g., `noreply@mg.equalityvanguard.org`)
   - `MAILGUN_FROM_NAME`: Display name (e.g., `Equality Vanguard`)

7. **Optional: Configure Webhooks:**
   - Navigate to: Settings → Webhooks
   - Add webhook for bounces/complaints
   - Enter webhook URL: `https://your-domain.com/api/webhooks/mailgun`
   - [SCREENSHOT: Webhook Configuration]

### Manual setup: Mailchimp

**Step-by-step navigation:**

1. **Create Account:**
   - Go to https://mailchimp.com/
   - Click "Sign Up" or "Log In"
   - Complete account creation
   - [SCREENSHOT: Mailchimp Dashboard Home]

2. **Create Audience (List):**
   - Navigate to: Audience → All contacts → Create Audience
   - Enter audience name (e.g., "Equality Vanguard Newsletter")
   - Enter default from email and name
   - Click "Save"
   - [SCREENSHOT: Create Audience Page]

3. **Get List ID:**
   - Navigate to: Audience → All contacts → Settings → Audience name and defaults
   - Copy "Audience ID" → `MAILCHIMP_LIST_ID`
   - [SCREENSHOT: Audience Settings Page]

4. **Create API Key:**
   - Navigate to: Account → Extras → API keys
   - Click "Create A Key"
   - Enter key name (e.g., "Equality Vanguard API")
   - Click "Generate Key"
   - Copy API key (format: `your_key-us1`) → `MAILCHIMP_API_KEY`
   - Extract server prefix (e.g., `us1`) → `MAILCHIMP_SERVER_PREFIX`
   - [SCREENSHOT: API Keys Page]

5. **Configure GDPR and Double Opt-in:**
   - Navigate to: Audience → All contacts → Settings → Audience name and defaults
   - Configure GDPR settings per your compliance requirements
   - Configure double opt-in settings (enable/disable as needed)
   - [SCREENSHOT: GDPR Settings Page]

### Wiring and flows
- Contact forms, submissions, memberships, donations, events should:
  - Send user confirmation via Mailgun templates (already scaffolded in `src/lib/email.ts`).
  - Send admin alert emails using the `admin-notification` template to `ADMIN_EMAIL`.
  - Optionally add contact to Mailchimp (e.g., donor/member/event attendee) with tags.

- Newsletter subscribe endpoint: `POST /api/newsletter/subscribe` uses `addSubscriber` in `lib/mailchimp.ts` with `MAILCHIMP_LIST_ID`.

- Unsubscribe page: `src/app/unsubscribe/page.tsx` is wired to call `/api/newsletter/unsubscribe` (implement GET/POST handler if not present) and should also trigger Mailchimp unsubscribe by subscriber hash.

### Code Examples: Email Template Usage

**Sending Transactional Email:**
```typescript
// Example from src/lib/email.ts
import { sendEmail } from '@/lib/email';

// Send membership confirmation email
await sendEmail({
  to: member.email,
  subject: 'Membership Confirmed - Equality Vanguard',
  template: 'membership-confirmation',
  data: {
    name: member.name,
    membershipType: member.membershipType,
    startDate: member.joinDate,
    endDate: member.expiryDate,
    amount: member.amount,
    currency: member.currency
  }
});

// Send email with attachment (e.g., event ticket with .ics)
await sendEmail({
  to: attendee.email,
  subject: 'Event Registration Confirmed',
  template: 'event-registration',
  data: {
    eventTitle: event.title,
    eventDate: event.date,
    eventLocation: event.location,
    attendeeName: attendee.name
  },
  attachments: [
    {
      filename: 'event.ics',
      data: icsBuffer, // Buffer from generateICSBuffer()
      contentType: 'text/calendar'
    }
  ]
});
```

**Mailchimp Subscriber Addition with Tags:**
```typescript
// Example from src/lib/mailchimp.ts
import { addSubscriber } from '@/lib/mailchimp';

// Add member to Mailchimp with tags
await addSubscriber({
  email: member.email,
  name: member.name,
  tags: ['member_1yr', 'active_member'],
  mergeFields: {
    FNAME: member.firstName,
    LNAME: member.lastName,
    MEMBERTYPE: member.membershipType
  },
  status: 'subscribed'
});

// Add donor with tag
await addSubscriber({
  email: donation.donorEmail,
  name: donation.donorName,
  tags: ['donor'],
  status: 'subscribed'
});
```

### Admin notifications (emails + in-dashboard)
- Many API routes already call `createAdminNotification` to write to `Notification` model and optionally send an email to admins.
- Ensure `ADMIN_EMAIL` is set; templates exist in `src/lib/email.ts`.

### Code Examples: Notification Creation

**Creating Admin Notification:**
```typescript
// Example from src/lib/notifications.ts
import { createNotification } from '@/lib/notifications';

// Create notification for new membership
await createNotification({
  userId: adminUserId, // Admin user ID
  type: 'membership_created',
  title: 'New Membership Signup',
  message: `${member.name} (${member.email}) has signed up for ${member.membershipType} membership`,
  metadata: {
    memberId: member._id.toString(),
    membershipType: member.membershipType,
    amount: member.amount,
    paymentMethod: member.paymentMethod
  },
  priority: 'high',
  category: 'membership',
  actionUrl: `/admin/members/${member._id}`
});

// Create notification for new donation
await createNotification({
  userId: adminUserId,
  type: 'donation_received',
  title: 'New Donation',
  message: `${donation.donorName} donated ${donation.amount} ${donation.currency}`,
  metadata: {
    donationId: donation._id.toString(),
    donationType: donation.donationType,
    amount: donation.amount
  },
  priority: 'medium',
  category: 'donations',
  actionUrl: `/admin/payments/donations/${donation._id}`
});
```

---

## 3) Google Calendar

### What it does
- Provide calendar invites to participants via `.ics` files and optionally sync events to a Google Calendar (service account or OAuth).

### Relevant code
- `.ics` generation utilities in `src/lib/calendar.ts` (`generateICS`, `generateICSFile`, `generateICSBuffer`). Used by event registration and emails.
- For live Google Calendar sync, add a new lib (e.g., `src/lib/googleCalendar.ts`) using Google Calendar API.

### Manual setup (Google Cloud Console)
Choose one:
1) Service Account (recommended for server-to-server, single org calendar)
   - Create a project → Enable Google Calendar API.
   - Create a Service Account; create and download a JSON key.
   - Share your target Google Calendar with the service account email (at least `Make changes to events`).
   - Env vars to add:
```bash
GOOGLE_PROJECT_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary_or_calendar_id@group.calendar.google.com
```

2) OAuth Client (used if admins connect their own calendars)
   - Create OAuth credentials and configure redirect URI (e.g., `[BASE_URL]/api/integrations/google/callback`).
   - Store and encrypt refresh tokens per admin.

### Wiring to events
- Admin portal creates/updates events → backend calls Google Calendar API to create/update corresponding calendar events and stores the external eventId in DB.
- Event registrations continue to attach `.ics` files via Mailgun for attendees (already supported via `generateICSBuffer`).
- Reminders:
  - Use Google Calendar reminders for attendees added as guests, or
  - Use Mailgun scheduled emails/background jobs for reminders (7 days/1 day before) as per `EV CONTEXT.md`.

---

## 4) Admin Portal Notifications

### What it does
- Create in-app notifications for admins whenever a new submission, registration, donation, member signup, order, or contact form is received. Optional email and real-time updates.

### Relevant code
- Model: `src/models/Notification.ts`
- Service: `src/lib/notifications.ts` (`createNotification`, `getNotifications`, `markAsRead`)
- API: `src/app/api/admin/notifications` and `src/app/api/admin/notifications/[id]/read`
- Many business routes already call `createAdminNotification`.

### Real-time updates (optional)
- `socket.io` dependencies exist; implement `src/lib/websocket.ts` server and connect the admin UI client to receive new-notification events.
- If sockets are not yet enabled in hosting, use polling in the admin dashboard (e.g., poll `/api/admin/notifications?read=false` every 20–30s).

### Email notifications
- Ensure admin alerts also send an email using `sendEmail({ template: 'admin-notification', ... })`. Several routes have this pattern; complete any TODOs.

---

## 5) Security and API Keys

### Secrets required
- Database: `MONGODB_URI`
- Auth/URLs: `NEXTAUTH_SECRET` (already in `.env.example`), `NEXTAUTH_URL`
- Payments: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, all `MPESA_*`
- Email: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`, `MAILGUN_FROM_NAME`, `ADMIN_EMAIL`
- Mailchimp: `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_SERVER_PREFIX`
- reCAPTCHA: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- Storage (if used): `R2_*` / S3 equivalents
- Monitoring (optional): `SENTRY_*`

### Storage and management
- Local development: `.env.local` only; never commit. Use `src/scripts/validate-env.ts` to validate presence.
- Production/staging: Configure in your host (e.g., Vercel) under Project Settings → Environment Variables. Use separate environments. Rotate keys annually.
- Reference keys in server code only. Never expose secret keys to the browser. Publishable keys (e.g., Stripe publishable) can be safely used client-side.

### Additional security controls
- Webhook signature verification (Stripe already implemented via `verifyWebhookSignature`). For M-Pesa, verify callback payloads and source; add signature checks when feasible.
- Rate limiting: middleware already present under `src/middleware`.
- ReCAPTCHA: implemented in forms (`RecaptchaProvider`, `useRecaptcha`, and scripts in form components).
- CSP: configured in `next.config.ts` to allow Stripe, Mailgun, M-Pesa, and reCAPTCHA domains.

Note: Prefer middleware-driven CSP to avoid duplication. After consolidating, verify only one CSP header is returned in responses.

### Key Rotation Procedures

**Annual Key Rotation Schedule:**
1. **Stripe Keys:**
   - Generate new API keys in Stripe Dashboard
   - Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in environment variables
   - Update webhook signing secret if webhook endpoint changed
   - Test with new keys before revoking old ones
   - Revoke old keys after verification

2. **M-Pesa Credentials:**
   - Generate new consumer key/secret in M-Pesa Daraja portal
   - Update `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET`
   - Test with new credentials
   - Revoke old credentials after verification

3. **Mailgun API Key:**
   - Generate new API key in Mailgun Dashboard
   - Update `MAILGUN_API_KEY` in environment variables
   - Test email sending with new key
   - Revoke old key after verification

4. **Mailchimp API Key:**
   - Generate new API key in Mailchimp Dashboard
   - Update `MAILCHIMP_API_KEY` in environment variables
   - Test subscription/unsubscribe with new key
   - Revoke old key after verification

5. **NextAuth Secret:**
   - Generate new secret: `openssl rand -base64 32`
   - Update `NEXTAUTH_SECRET` in environment variables
   - Note: This will invalidate existing sessions
   - Users will need to log in again

**Emergency Key Rotation:**
- If a key is compromised, rotate immediately
- Generate new keys and update environment variables
- Revoke compromised keys immediately
- Monitor for any unauthorized access
- Update documentation with new keys (if needed)

### Secret Management Best Practices

**Vercel Environment Variables:**
- Use separate environments (development, preview, production)
- Never commit secrets to version control
- Use Vercel's encryption for sensitive values
- Rotate keys regularly (annually or as needed)
- Limit access to production secrets
- Use Vercel's environment variable groups for organization

**Alternative: AWS Secrets Manager / Google Secret Manager:**
- Store secrets in cloud secret manager
- Access via API in application code
- Enable automatic rotation (if supported)
- Audit secret access
- Use IAM roles for access control

**Local Development:**
- Use `.env.local` file (never commit to git)
- Add `.env.local` to `.gitignore`
- Use `.env.example` as template
- Never share `.env.local` files
- Rotate local keys if compromised

### Rate Limiting Configuration

**Current Rate Limits (configured in `src/middleware/rate-limit.ts`):**
- Form submissions: 10 requests per 15 minutes per IP
- API routes: 100 requests per 15 minutes per IP
- Webhook endpoints: No rate limiting (verify signatures instead)
- Admin routes: 1000 requests per 15 minutes per authenticated user

**Rate Limiting Implementation:**
```typescript
// Example from src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const formRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests, please try again later',
});

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many admin requests, please try again later',
});
```

**DDoS Protection:**
- Enable Vercel DDoS protection (automatic)
- Configure Cloudflare (if using) for additional protection
- Monitor for unusual traffic patterns
- Set up alerts for traffic spikes
- Use rate limiting as first line of defense

**CSRF Protection:**
- Next.js provides built-in CSRF protection
- Use SameSite cookies for session management
- Verify origin headers for sensitive operations
- Use reCAPTCHA for form submissions

### Security Headers Configuration

**Current Security Headers (configured in `src/middleware.ts`):**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (production only)
- `Content-Security-Policy: ...` (configured to allow necessary domains)

**CSP Configuration:**
- Default source: `'self'`
- Script sources: `'self'`, `'unsafe-eval'`, `'unsafe-inline'`, Stripe, reCAPTCHA domains
- Style sources: `'self'`, `'unsafe-inline'`, Google Fonts
- Font sources: `'self'`, Google Fonts
- Image sources: `'self'`, `data:`, `https:`, `blob:`
- Connect sources: `'self'`, Stripe API, Mailgun API, M-Pesa API, reCAPTCHA
- Frame sources: `'self'`, Stripe, reCAPTCHA
- Object sources: `'none'`
- Base URI: `'self'`
- Form action: `'self'`
- Frame ancestors: `'none'`
- Upgrade insecure requests: enabled

### Code Examples: Webhook Signature Verification

**Stripe Webhook Verification:**
```typescript
// Example from src/app/api/webhooks/stripe/route.ts
import { verifyWebhookSignature } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Process verified event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      // ... other event types
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

**M-Pesa Callback Verification:**
```typescript
// Example from src/app/api/webhooks/mpesa/route.ts
import { verifyCallback, extractTransactionDetails } from '@/lib/mpesa';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-callback-signature');

    // Verify callback authenticity
    const isValidCallback = verifyCallback(body, signature || '');
    if (!isValidCallback) {
      console.error('Invalid M-Pesa callback signature');
      return NextResponse.json(
        { error: 'Invalid callback signature' },
        { status: 400 }
      );
    }

    // Extract transaction details
    const transactionDetails = extractTransactionDetails(body);

    if (transactionDetails.success) {
      await handleSuccessfulPayment(transactionDetails);
    } else {
      await handleFailedPayment(transactionDetails);
    }

    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    return NextResponse.json(
      { 
        ResultCode: 1,
        ResultDesc: 'Callback processing failed'
      },
      { status: 500 }
    );
  }
}
```

---

## 6) Testing Matrix

**📘 For detailed step-by-step testing instructions, see `INTEGRATION_TESTING_GUIDE.md`**

### Quick Test Checklist

**Stripe:**
- [ ] Set test keys and run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Test membership payment with card `4242 4242 4242 4242`
- [ ] Test donation payment
- [ ] Test event registration payment
- [ ] Verify webhook updates DB, emails sent, admin notified

**M-Pesa (Sandbox):**
- [ ] Configure sandbox credentials in `.env.local`
- [ ] Test STK Push via membership/donation with `paymentMethod=mpesa`
- [ ] Verify callback received at `/api/webhooks/mpesa`
- [ ] Check record status updated, email sent, admin notified

**Mailgun:**
- [ ] Verify domain verified and sending allowed
- [ ] Test all email templates (membership, donation, event, admin)
- [ ] Check Mailgun logs for delivery status

**Mailchimp:**
- [ ] Test newsletter subscribe via `/api/newsletter/subscribe`
- [ ] Verify contact added with correct tags
- [ ] Test unsubscribe via `/unsubscribe` page

**Google Calendar:**
- [ ] Verify `.ics` attachments in event registration emails
- [ ] (Optional) Test service account sync if implemented

**Admin Notifications:**
- [ ] Submit forms and verify notifications appear in admin dashboard
- [ ] Check email notifications sent to `ADMIN_EMAIL`
- [ ] Test real-time updates (if WebSockets/polling enabled)

**See `INTEGRATION_TESTING_GUIDE.md` for detailed instructions, troubleshooting, and success criteria.**

---

## 9) Production Deployment Checklist

### Pre-Deployment Verification

**Environment Variables:**
- [ ] All required variables set in Vercel (or hosting platform)
- [ ] Separate environments for staging and production
- [ ] No test/development keys in production
- [ ] All secrets properly encrypted

**Database:**
- [ ] Production MongoDB cluster created and configured
- [ ] IP whitelist configured (restrict to Vercel IPs or specific ranges)
- [ ] Database user has correct permissions
- [ ] Connection string tested and working
- [ ] Database indexes created and verified

**API Keys & Credentials:**
- [ ] Stripe live keys configured (not test keys)
- [ ] M-Pesa production credentials configured
- [ ] Mailgun production domain verified
- [ ] Mailchimp production list configured
- [ ] reCAPTCHA production keys configured
- [ ] All keys rotated from staging/test

**Webhooks:**
- [ ] Stripe webhook endpoint configured for production URL
- [ ] M-Pesa callback URL configured for production
- [ ] Webhook secrets updated in environment variables
- [ ] Webhook events selected correctly
- [ ] Webhook endpoints tested and verified

**DNS Configuration:**
- [ ] Domain DNS records configured
- [ ] Mailgun domain DNS records (TXT, CNAME, MX) verified
- [ ] SSL certificate valid and auto-renewing
- [ ] Domain verification complete

**Application Configuration:**
- [ ] `NODE_ENV=production` set
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXT_PUBLIC_URL` set to production domain
- [ ] `NEXT_PUBLIC_API_URL` set to production domain
- [ ] CSP headers configured correctly
- [ ] Security headers enabled

### Deployment Steps

1. **Build Verification:**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Environment Variable Migration:**
   - Export staging variables (if applicable)
   - Import to production environment
   - Update production-specific values
   - Verify all variables are set

3. **Webhook URL Updates:**
   - Update Stripe webhook endpoint to production URL
   - Update M-Pesa callback URL to production URL
   - Verify webhook secrets match

4. **DNS Configuration:**
   - Verify domain DNS records
   - Check Mailgun domain verification
   - Test SSL certificate

5. **Deploy to Production:**
   - Deploy via Vercel (or hosting platform)
   - Monitor deployment logs
   - Verify build succeeds

6. **Post-Deployment Verification:**
   - Run smoke tests
   - Verify API routes are accessible
   - Test critical user flows
   - Check error tracking (Sentry)

### Post-Deployment Smoke Tests

**Critical Flows:**
- [ ] Homepage loads correctly
- [ ] Membership form submission works
- [ ] Donation form submission works
- [ ] Newsletter subscription works
- [ ] Admin login works
- [ ] Admin dashboard loads

**Payment Testing:**
- [ ] Stripe test payment succeeds (use test card)
- [ ] Webhook received and processed
- [ ] Confirmation email sent
- [ ] Admin notification created
- [ ] Database updated correctly

**Email Testing:**
- [ ] Transactional emails sending
- [ ] Email delivery tracked in Mailgun
- [ ] No bounce/complaint errors

**Monitoring Setup:**
- [ ] Error tracking enabled (Sentry)
- [ ] Webhook delivery monitoring
- [ ] Email delivery monitoring
- [ ] Database performance monitoring
- [ ] Application performance monitoring

### Production Monitoring

**Key Metrics to Monitor:**
- Webhook delivery success rate
- Email delivery success rate
- Payment success rate
- API response times
- Error rates
- Database connection pool usage

**Alerts to Configure:**
- Webhook delivery failures
- Email delivery failures
- Payment processing errors
- Database connection errors
- High error rates
- Performance degradation

### Rollback Plan

**If deployment fails:**
1. Revert to previous deployment
2. Check deployment logs for errors
3. Verify environment variables
4. Test critical flows
5. Fix issues and redeploy

**If issues discovered post-deployment:**
1. Identify affected features
2. Check error logs (Sentry, Vercel)
3. Verify webhook/email delivery
4. Check database connectivity
5. Rollback if critical issues

### Key Rotation Procedures

**Annual Key Rotation:**
1. Generate new API keys
2. Update in environment variables
3. Test with new keys
4. Update webhook secrets if changed
5. Monitor for any issues

**Emergency Key Rotation:**
1. Generate new keys immediately
2. Update environment variables
3. Revoke old keys
4. Monitor for any issues
5. Update documentation

### Secret Management Best Practices

**Vercel Environment Variables:**
- Use separate environments (development, preview, production)
- Never commit secrets to version control
- Use Vercel's encryption for sensitive values
- Rotate keys regularly
- Limit access to production secrets

**Alternative: AWS Secrets Manager / Google Secret Manager:**
- Store secrets in cloud secret manager
- Access via API in application code
- Enable automatic rotation
- Audit secret access

### Rate Limiting Configuration

**API Rate Limits:**
- Form submissions: 10 requests per 15 minutes per IP
- API routes: 100 requests per 15 minutes per IP
- Webhook endpoints: No rate limiting (verify signatures)
- Admin routes: 1000 requests per 15 minutes per user

**Configure in `src/middleware/rate-limit.ts`:**
```typescript
// Example rate limit configuration
export const formRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again later'
});
```

**DDoS Protection:**
- Enable Vercel DDoS protection
- Configure Cloudflare (if using)
- Monitor for unusual traffic patterns
- Set up alerts for traffic spikes

---

## Page/Route Mapping Reference

- Donations: Frontend `get-involved` pages and `DonateForm.tsx` → `POST /api/donations` → payment provider → webhook → Mailgun receipt → Admin notification → Admin donation pages.
- Memberships: `MembershipForm.tsx` → `POST /api/membership` → Stripe/M-Pesa → webhook/callback → Mailgun confirmation → Mailchimp add → Admin members pages.
- Events: `/events` pages → `POST /api/events/:id/register` → Stripe/M-Pesa → webhook/callback → Mailgun ticket with `.ics` → Admin events pages; optional Google Calendar sync.
- Newsletter: `/api/newsletter/subscribe` and `/unsubscribe` → Mailchimp list mgmt.
- Contact/Partnership/Volunteers/Stories/Publications: corresponding `POST /api/...` routes create DB entries, send Mailgun confirmations, and create Admin notifications.

---

## Final Notes
- Ensure `NEXTAUTH_URL` matches your public URL in production; webhooks rely on it.
- For M-Pesa production, ensure whitelisting and live app approval are complete with Safaricom.
- Keep templates consistent with the brand and `EV CONTEXT.md`; adjust HTML in `src/lib/email.ts` where necessary.
- Monitor via dashboards noted in `docs/MONITORING.md` and handle incidents via `docs/RUNBOOK.md`.

---

## 7) Rollout plan, milestones, and owners

Phased rollout to reduce risk. Replace [Owner] with assignees.

- Phase 1 — Staging wiring (Day 1–2)
  - [Owner] Consolidate CSP/headers and deploy to staging.
  - [Owner] Fonts via `next/font`; verify typography matches EV CONTEXT.
  - [Owner] Populate staging env vars for Stripe (test), Mailgun (sandbox), Mailchimp, M-Pesa (sandbox).
  - [Owner] Build and run smoke tests: `npm run type-check && npm run lint && npm run build && npm run test:integration || npm run test:smoke`.

- Phase 2 — Payments & email E2E (Day 3–4)
  - [Owner] Stripe test flows (membership, donations, events, shop if enabled) with webhooks.
  - [Owner] M-Pesa sandbox STK push end-to-end with callback.
  - [Owner] Mailgun templates finalized; receipts/tickets render brand styles.

- Phase 3 — Mailing list, unsubscribe, and i18n (Day 5)
  - [Owner] Mailchimp subscribe/unsubscribe flows; tags per source.
  - [Owner] Ensure `/unsubscribe` updates Mailchimp; confirmation UI text finalized.
  - [Owner] Fill `messages/fr.json` and `messages/sw.json`; validate `[locale]` routes.

- Phase 4 — Calendar and notifications (Day 6)
  - [Owner] `.ics` attachments validated; optional Google Calendar service account wiring (if required now).
  - [Owner] Admin in-app notifications verified; optional sockets enabled or polling tuned (≤30s).

- Phase 5 — Production cutover (Day 7)
  - [Owner] Switch envs to live Stripe and M-Pesa; update webhook endpoints to production URL.
  - [Owner] Re-run smoke tests; Lighthouse ≥80; accessibility fixes.
  - [Owner] Monitor logs and error tracking for 48 hours; triage any failures.

Deliverables per phase: updated `DEPLOYMENT_STATUS.md` and `DEPLOYMENT_SUMMARY.md` entries.

---

## 8) Risks and mitigations

- Duplicate CSP/headers cause blocked assets or console violations
  - Mitigation: Single-source CSP in middleware; remove duplicates; test with browser devtools.

- Missing image domains in Next/Image breaks image loads
  - Mitigation: Add all required domains to `next.config.ts images.remotePatterns`.

- Incomplete i18n JSON leads to runtime errors on `[locale]` routes
  - Mitigation: Provide fallback strings, complete `fr.json` and `sw.json` before enablement.

- Email deliverability (SPF/DKIM/DMARC not aligned)
  - Mitigation: Verify DNS for Mailgun domain; run mail-tester; warm up sending.

- M-Pesa callbacks blocked by CSP or platform networking
  - Mitigation: Ensure callback route is public; confirm allowlist on provider; log incoming payloads.

- Webhook handler failures (Stripe/M-Pesa)
  - Mitigation: Idempotency keys; robust signature verification; retry logic; dead-letter queue in BullMQ if used.



