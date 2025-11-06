## Integration Execution Plan

This document details how to configure, connect, and test all external integrations (payments, email/notifications, calendar, and admin notifications) across the frontend, backend (API routes), admin portal, and database.

- Codebase context: Next.js app with API routes under `src/app/api`, frontend pages/components under `src/app` and `src/components`, MongoDB via Mongoose models in `src/models`, integration helpers in `src/lib`.
- Always confirm content and flows against the project content plan in `EV CONTEXT.md`.

### Index
- 1) Payments: Stripe and M-Pesa (Daraja)
- 2) Email and Notifications: Mailgun and Mailchimp
- 3) Google Calendar: Events syncing and reminders
- 4) Admin Portal Notifications: In-app and optional real-time
- 5) Security and API Keys: Managing secrets locally and in production
- 6) Testing Matrix: How to test each integration

---

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
1. Create account at `https://www.mailgun.com/`.
2. Add a domain (recommended: subdomain like `mg.example.org`). Add DNS records (TXT/SPF, DKIM, CNAME) and verify the domain.
3. In Mailgun dashboard, get API key and set envs:
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `MAILGUN_FROM_EMAIL` (e.g., `noreply@mg.example.org`)
   - `MAILGUN_FROM_NAME` (e.g., `Equality Vanguard`)
4. Optional: configure route/webhooks in Mailgun for bounces/complaints to an API route if you want automated suppression handling.

### Manual setup: Mailchimp
1. Create account at `https://mailchimp.com/`.
2. Create an Audience (List) and capture:
   - `MAILCHIMP_LIST_ID`
3. Create an API key and note server prefix (e.g., `us1`):
   - `MAILCHIMP_API_KEY`
   - `MAILCHIMP_SERVER_PREFIX`
4. Configure default GDPR and double opt-in settings per your compliance requirements.

### Wiring and flows
- Contact forms, submissions, memberships, donations, events should:
  - Send user confirmation via Mailgun templates (already scaffolded in `src/lib/email.ts`).
  - Send admin alert emails using the `admin-notification` template to `ADMIN_EMAIL`.
  - Optionally add contact to Mailchimp (e.g., donor/member/event attendee) with tags.

- Newsletter subscribe endpoint: `POST /api/newsletter/subscribe` uses `addSubscriber` in `lib/mailchimp.ts` with `MAILCHIMP_LIST_ID`.

- Unsubscribe page: `src/app/unsubscribe/page.tsx` is wired to call `/api/newsletter/unsubscribe` (implement GET/POST handler if not present) and should also trigger Mailchimp unsubscribe by subscriber hash.

### Admin notifications (emails + in-dashboard)
- Many API routes already call `createAdminNotification` to write to `Notification` model and optionally send an email to admins.
- Ensure `ADMIN_EMAIL` is set; templates exist in `src/lib/email.ts`.

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

---

## 6) Testing Matrix

### Stripe
- Local:
  - Set test keys and run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
  - Use Stripe test cards (e.g., 4242 4242 4242 4242) to complete flows for:
    - Membership (`/get-involved` → membership form)
    - Donations (cash)
    - Events (paid ticket)
    - Shop orders
  - Verify: Webhook updates DB, user receives email receipt/confirmation, admin gets in-app notification and email, Mailchimp is updated (if configured).

### M-Pesa (Sandbox)
- Configure sandbox credentials in `.env.local`.
- Trigger STK Push via membership/donation/events with `paymentMethod=mpesa`.
- Simulate/receive callback to `/api/webhooks/mpesa`.
- Verify: Record status updated, user email receipt sent, admin notified, Mailchimp updated if opted-in.

### Mailgun
- Verify domain is verified and sending allowed.
- Trigger sample emails via:
  - Donation (receipt)
  - Event registration (ticket with `.ics`)
  - Membership confirmation
  - Admin notification
- Check Mailgun logs for delivery and any bounces. Update templates as needed in `src/lib/email.ts`.

### Mailchimp
- Newsletter: call `POST /api/newsletter/subscribe` with a test email.
- Verify the contact is added to the audience with expected tags.
- Test unsubscribe via `/unsubscribe` page and confirm in Mailchimp.

### Google Calendar
- `.ics` attachments: ensure event registration emails include an `.ics` file generated from `generateICSBuffer` with correct date/time.
- (If syncing) Use a service account to create an event on the configured `GOOGLE_CALENDAR_ID` when an admin creates/updates an event; verify the event appears on the shared Google Calendar.

### Admin Notifications
- Submit each form (donation, membership, event registration, partnership inquiry, contact, volunteers) and confirm entries appear in the admin dashboard Notifications page and are optionally emailed to `ADMIN_EMAIL`.
- If using sockets, confirm new notifications arrive without a page refresh; otherwise confirm polling updates within 30 seconds.

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


