# Equality Vanguard – Pre-Deployment Technical & Functional Assessment

## Scope and Context
- Source reviewed per `EV CONTEXT.md`, Next.js 15 app with API routes, Admin portal under `src/app/admin`, APIs under `src/app/api`, MongoDB/Mongoose models, Mailchimp/SendGrid, Stripe/M-Pesa libraries, security middleware, and Vercel config.

## What is fully done (no further action needed)
- **Core pages**: `Home`, `About`, `Our Voice`, `Matri Archive`, `Events & News` implemented with layouts, sections, and content.
- **Content modules completed**:
  - Publications / Matri Archive (APIs: `publications`, `toolkits`, `book-suggestions`, admin CMS pages present)
  - ALKA Library / Our Voice (APIs: `our-voices/hero`, stories, media sections; admin pages present)
  - Toolkits & Guides (API + pages)
  - Events & News (APIs: `events`, `news`; admin pages present)
- **Shop backend**: Models `Product`, `Order`, `Cart`; APIs `products`, `orders`; Stripe library present.
- **Donations**: API `src/app/api/donations/route.ts`, Stripe/M-Pesa webhooks present.
- **Memberships**: API `src/app/api/membership/route.ts`; frontend form component exists.
- **Newsletter & Mailing**: APIs `newsletter/subscribe`, `newsletter/unsubscribe`; `lib/mailchimp.ts` implemented; unsubscribe page exists.
- **Contact**: API `src/app/api/contact/route.ts` and `models/Contact.ts` in place.
- **Security foundations**: `middleware/security.ts`, `middleware/rate-limit.ts`, security headers in `next.config.ts` and `vercel.json`, reCAPTCHA client/server helpers, CSRF controls noted, Sentry integration present.
- **Infra config**: `vercel.json` routing and function limits defined; Next image remote pattern; deployment scripts present.

## What is partially done or pending
- **Get Involved – Members**: Form + API exist; missing admin list/management views for active/expired members and renewals.
- **Get Involved – Partnerships**: Inquiry API (`/api/partnerships/inquire`) and models exist; verify admin list/detail workflow and status updates (basic page present under `admin/members/partnerships`).
- **Get Involved – Volunteer & Jobs**: Landing UI exists, but no API endpoints for job postings, volunteer applications, or admin review flows.
- **Donations & Payment**: Server/webhooks ready; needs end-to-end tests, receipts templating confirmation, and finance/admin dashboards polishing.
- **Shop Management**: APIs/models complete; admin UI for product CRUD, categories, and orders not found.
- **Events Management**: Events CRUD and registration API exist; needs payment gating for paid tickets, ticket/QR email, and calendar invite generation.
- **Email & Notifications**: `lib/email.ts` and `lib/notifications.ts` exist; ensure each submission/payment path sends confirmations and admin alerts (some paths may still be stubs).
- **Admin Settings Page**: `models/Setting.ts` exists but no admin UI for configuration, audit logs view, or integration toggles.

## What is not yet started or missing
- **Volunteer & Jobs APIs**: Endpoints for creating job posts, applying, and admin review.
- **Google Calendar integration**: No `.ics` generation or Google Calendar API hooks found for event confirmation/reminders.
- **Admin Logs UI**: `AuditLog` model exists; no admin views for audit or admin action logs.
- **Comprehensive tests**: Unit/integration/e2e tests largely missing (scripts exist for env/db checks only).

## Gaps and deployment risks
- **Operational completeness**: Lacking admin UIs for Members, Orders, and Settings could hinder handover.
- **Payments**: Stripe/M-Pesa flows exist but require live-mode key wiring, webhook secrets, and receipt templates; missing refund/admin controls UI.
- **Events tickets**: No confirmed email ticket or calendar invite; paid registration path may be incomplete without end-to-end wiring.
- **Volunteer/Jobs**: Missing backend could block client workflows.
- **Email deliverability**: DNS (SPF/DKIM) and from-domain not validated here.
- **Monitoring and error handling**: Sentry included; ensure DSN and sampling configured; 5xx fallbacks and user-friendly errors to verify.
- **Env management**: Many integrations require secrets; ensure staging/production env parity in Vercel.

## Deployment Readiness Checklist
- **Security audit**
  - Review headers/CSP (`next.config.ts`, `vercel.json`) against Stripe/Google requirements.
  - Verify reCAPTCHA on all public forms; server-side verification via `lib/recaptcha.ts`.
  - Confirm rate limiting and auth guards on admin routes; check RBAC in `lib/auth.ts`/middleware.
  - Validate all API inputs with Zod/Joi; sanitize and enforce size/MIME limits for uploads.
  - Enable strong cookies/session settings; review NextAuth configs and secrets.
  - Ensure no PII/logging leakage; enable `AuditLog` writes on admin actions.
- **Testing coverage**
  - Happy-path tests: Membership, Donation, Event registration (free/paid), Newsletter subscribe/unsubscribe, Contact, Partnerships.
  - Webhook tests: Stripe and M-Pesa callbacks update records idempotently.
  - Negative tests: validation failures, rate limits, recaptcha failure, payment failure.
  - Admin flows: approve/publish, refund, update statuses, export CSV.
- **Performance**
  - Lighthouse targets ≥ 85; optimize images with Next/Image; enable caching headers for static assets.
  - DB indexes for high-traffic collections (Events, Publications, Products, Members, Orders).
  - Avoid N+1 in API handlers; paginate lists (admin tables).
- **Error handling**
  - Standardized API error responses; user-friendly frontend error states.
  - Sentry DSN configured (frontend+backend), source maps on build, alerting.
- **Environment/config**
  - Required envs: Mongo URI, JWT/NextAuth secrets, Stripe keys + webhook secret, M-Pesa keys + callback URL, SendGrid/Mailgun API key and from domain, Mailchimp API key + list IDs, reCAPTCHA site/secret keys, S3/Spaces keys + bucket, Sentry DSN.
  - Separate staging vs production secrets in Vercel; rotate test keys out.
- **CI/CD**
  - Vercel preview deploys for PRs; protected main branch.
  - GitHub Actions: type-check, lint, minimal test suite; block merge on failure.
  - Automated run of `scripts/validate-env.ts` on build.

## Action Plan (2-Day Timeline)
- **Day 1 (Engineering Complete, High Priority)**
  1) Volunteer & Jobs module
     - Create models: `Job`, `VolunteerApplication`.
     - APIs: `POST /api/jobs`, `GET /api/jobs`, `POST /api/volunteers/apply`.
     - Admin pages: list/detail, approve/reject; email notifications.
  2) Members admin UI
     - Admin list/detail for `Member`; actions: activate/cancel, resend confirmation, export CSV.
  3) Shop admin UI
     - Product CRUD (name, price, stock), categories; Orders list/detail; refund action hooks to Stripe.
  4) Donations polish
     - Receipt email templates; admin donations dashboard totals; test both Stripe/M-Pesa sandbox.

- **Day 2 (Integration, QA, Launch Readiness)**
  5) Events enhancements
     - Paid ticket flow wiring to Stripe/M-Pesa; confirmation email with `.ics` attachment; optional Google Calendar integration or ICS-only fallback.
  6) Settings & Logs
     - Admin Settings page (Mail, Payments, reCAPTCHA toggles). Audit Log viewer with filters.
  7) Emails & notifications
     - Ensure confirmations for all forms (Membership, Donation, Events, Partnerships, Contact, Newsletter opt-in); admin alerts wired.
  8) Security & tests
     - Run end-to-end smoke tests (staging). Validate CSP with Stripe/Google. Confirm webhooks live.
  9) Performance checks
     - Lighthouse, image optimizations, verify DB indexes; paginate large lists.

## Handover Notes
- Provide credentials for Stripe, M-Pesa, SendGrid/Mailgun, Mailchimp, S3/Spaces, MongoDB Atlas, Sentry, and Google.
- Document admin roles, data exports, and backup process.
- Attach email templates and ICS generator utility usage to the repo.

---
This document is intended to guide the final 48-hour pre-deployment phase and ensure a smooth client handover.
