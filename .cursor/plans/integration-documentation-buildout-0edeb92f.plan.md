<!-- 0edeb92f-48c9-4840-8a51-09f71a4cc25e 25f85c50-cf29-412c-82cc-dfbcded957f3 -->
# Integration Documentation Buildout Plan

## Overview

Build out both `integration-execution-plan.md` and `INTEGRATION_TESTING_GUIDE.md` with comprehensive code examples, automation where possible, clear manual instructions, and fixes for identified implementation gaps.

---

## Phase 1: Environment & Configuration (Automated)

### 1.1 Update .env.example

**File:** `.env.example`
**Action:** Expand to match all variables in `src/scripts/validate-env.ts`

- Add missing variables: `MAILGUN_FROM_EMAIL`, `MAILGUN_FROM_NAME`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_API_URL`, `GOOGLE_*` (for Calendar), `REDIS_URL`
- Add comments explaining each variable's purpose
- Group by category (Database, Auth, Payments, Email, Storage, etc.)
- Include example values where helpful

### 1.2 Create Environment Setup Script

**File:** `scripts/setup-env-template.sh` (or `.ps1` for Windows)
**Action:** Generate `.env.local` from template with interactive prompts

- Check if `.env.local` exists
- Prompt for required variables
- Validate format (email, URL, etc.)
- Generate file with placeholders

### 1.3 Add Code Snippets to integration-execution-plan.md

**Sections to enhance:**

- Section 1 (Payments): Add code examples showing payment intent creation
- Section 2 (Email): Add email template structure examples
- Section 4 (Admin Notifications): Add notification creation code pattern
- Section 5 (Security): Add webhook verification code examples

---

## Phase 2: Implementation Fixes (Automated)

### 2.1 Fix M-Pesa Membership Flow

**File:** `src/app/api/membership/route.ts` (lines 162-175)
**Issue:** Returns placeholder message instead of initiating STK Push
**Action:**

- Implement STK Push call using `src/lib/mpesa.ts` `initiateSTKPush` function
- Follow pattern from `src/app/api/donations/route.ts` (lines 139-151)
- Update response to include `checkoutRequestID` for tracking
- Add error handling for STK Push failures

### 2.2 Complete Missing API Route Handlers

**Files to check/create:**

- `src/app/api/newsletter/unsubscribe/route.ts` - Verify GET/POST handlers exist
- `src/app/api/mpesa/stk-push/route.ts` - Verify STK Push initiation endpoint exists
- Add missing handlers if referenced but not implemented

### 2.3 Add Database Query Examples

**File:** `INTEGRATION_TESTING_GUIDE.md`
**Action:** Add MongoDB query examples for verification:

- Query members: `db.members.find({ email: "test@example.com" })`
- Query donations: `db.donations.find({ status: "completed" })`
- Query notifications: `db.notifications.find({ read: false })`
- Add aggregation examples for counts/stats

---

## Phase 3: Testing Automation (Automated)

### 3.1 Create Integration Test Scripts

**Files to create:**

- `scripts/test-stripe-webhook.ts` - Simulate Stripe webhook events locally
- `scripts/test-mpesa-callback.ts` - Simulate M-Pesa callback payloads
- `scripts/test-email-sending.ts` - Test Mailgun email delivery
- `scripts/test-mailchimp-api.ts` - Test Mailchimp subscribe/unsubscribe

**Purpose:** Allow testing integrations without external service setup

### 3.2 Add API Testing Examples

**File:** `INTEGRATION_TESTING_GUIDE.md`
**Action:** Add curl/Postman examples for each API endpoint:

- `POST /api/membership` with sample payload
- `POST /api/donations` with sample payload
- `POST /api/events/:id/register` with sample payload
- `GET /api/admin/notifications` with auth headers

### 3.3 Create Verification Checklist Script

**File:** `scripts/verify-integrations.ts`
**Action:** Script that checks:

- Environment variables are set
- Database connection works
- API routes are accessible
- External service credentials are valid (test API calls)
- Webhook endpoints are reachable

---

## Phase 4: Documentation Enhancements (Automated)

### 4.1 Add Code Examples to integration-execution-plan.md

**Sections to add:**

- **Section 1.4:** Code snippet showing Stripe payment intent creation with metadata
- **Section 1.5:** Code snippet showing M-Pesa STK Push initiation
- **Section 2.3:** Code snippet showing email template rendering
- **Section 2.4:** Code snippet showing Mailchimp subscriber addition with tags
- **Section 4.2:** Code snippet showing notification creation pattern
- **Section 5.2:** Code snippet showing webhook signature verification

### 4.2 Add Troubleshooting Section to INTEGRATION_TESTING_GUIDE.md

**Action:** Expand troubleshooting with:

- Common error messages and solutions
- Debug commands for each service
- Log file locations
- How to enable verbose logging
- Network debugging (ngrok, tunnels)

### 4.3 Add Visual Guides

**File:** `INTEGRATION_TESTING_GUIDE.md`
**Action:** Add ASCII diagrams showing:

- Payment flow diagram (user → form → API → payment provider → webhook → DB → email)
- Email flow diagram (event → Mailgun → user inbox)
- Notification flow diagram (event → DB → admin dashboard)

### 4.4 Add Production Deployment Checklist

**File:** `integration-execution-plan.md`
**Action:** Add new section "9) Production Deployment Checklist" with:

- Pre-deployment verification steps
- Environment variable migration guide
- Webhook URL updates
- DNS configuration checklist
- SSL certificate verification
- Monitoring setup

---

## Phase 5: Manual Setup Instructions (Documentation Only)

### 5.1 Enhance Manual Setup Sections

**File:** `integration-execution-plan.md`
**Action:** Add detailed screenshots/step descriptions for:

- Stripe Dashboard navigation (where to find keys, webhook setup)
- M-Pesa Daraja portal navigation
- Mailgun domain verification (DNS record setup)
- Mailchimp audience creation
- Google Calendar service account setup

### 5.2 Add Service-Specific Guides

**File:** `INTEGRATION_TESTING_GUIDE.md`
**Action:** Add appendices:

- **Appendix A:** Stripe Dashboard Quick Reference
- **Appendix B:** M-Pesa Sandbox Testing Guide
- **Appendix C:** Mailgun DNS Configuration Guide
- **Appendix D:** Mailchimp Tag Management Guide

### 5.3 Add Video/Screenshot References

**Action:** Note where screenshots should be added (markers in docs):

- Stripe webhook configuration screen
- M-Pesa callback URL configuration
- Mailgun domain verification screen
- Mailchimp audience settings

---

## Phase 6: Code Quality & Validation (Automated)

### 6.1 Add Type Safety Examples

**File:** `integration-execution-plan.md`
**Action:** Add TypeScript interface examples:

- PaymentIntentData interface usage
- STKPushData interface usage
- EmailData interface usage
- NotificationData interface usage

### 6.2 Add Error Handling Patterns

**File:** Both documents
**Action:** Document error handling patterns:

- Webhook retry logic
- Payment failure handling
- Email failure handling (non-blocking)
- Network timeout handling

### 6.3 Add Security Best Practices

**File:** `integration-execution-plan.md` Section 5
**Action:** Expand with:

- Key rotation procedures
- Secret management (Vercel, AWS Secrets Manager)
- Webhook signature verification details
- Rate limiting configuration
- CSRF protection for forms

---

## Deliverables

1. **Updated .env.example** - Complete with all variables and comments
2. **Enhanced integration-execution-plan.md** - Code examples, diagrams, production checklist
3. **Enhanced INTEGRATION_TESTING_GUIDE.md** - API examples, verification scripts, troubleshooting
4. **Test Scripts** - Automated testing helpers
5. **Implementation Fixes** - M-Pesa membership flow, missing handlers
6. **Verification Script** - Integration health check

---

## Manual Actions Required (Cannot Be Automated)

1. **Account Creation:**

- Stripe account setup and KYC
- M-Pesa Daraja developer account
- Mailgun account and domain verification
- Mailchimp account and audience creation
- Google Cloud project (if using Calendar)

2. **API Key Retrieval:**

- Copy keys from each service dashboard
- Add to `.env.local` or Vercel environment variables

3. **DNS Configuration:**

- Mailgun domain DNS records (TXT, CNAME, MX)
- Domain verification

4. **Webhook Configuration:**

- Stripe webhook endpoint URL setup
- M-Pesa callback URL configuration
- Event selection in dashboards

5. **Testing:**

- Manual form submissions
- Payment flow testing
- Email delivery verification
- Admin dashboard verification

---

## Success Criteria

- All environment variables documented with examples
- Code examples for every integration pattern
- Automated test scripts for each integration
- M-Pesa membership flow fully implemented
- Production deployment checklist complete
- Troubleshooting guide covers common issues
- Manual setup instructions are clear and actionable

### To-dos

- [ ] Update .env.example with all variables from validate-env.ts, add comments and grouping
- [ ] Create interactive environment setup script (setup-env-template.sh/.ps1)
- [ ] Fix M-Pesa membership flow in src/app/api/membership/route.ts to initiate STK Push
- [ ] Verify and create missing API route handlers (unsubscribe, stk-push)
- [ ] Add code snippets to integration-execution-plan.md for payment, email, notification patterns
- [ ] Add MongoDB query examples to INTEGRATION_TESTING_GUIDE.md for verification
- [ ] Create integration test scripts (test-stripe-webhook.ts, test-mpesa-callback.ts, etc.)
- [ ] Add curl/Postman examples to INTEGRATION_TESTING_GUIDE.md for each endpoint
- [ ] Create verify-integrations.ts script to check env vars, DB, API routes, credentials
- [ ] Expand troubleshooting section in INTEGRATION_TESTING_GUIDE.md with common errors and solutions
- [ ] Add ASCII flow diagrams to INTEGRATION_TESTING_GUIDE.md (payment, email, notification flows)
- [ ] Add production deployment checklist section to integration-execution-plan.md
- [ ] Enhance manual setup instructions with detailed navigation steps and screenshot markers
- [ ] Add appendices to INTEGRATION_TESTING_GUIDE.md (Stripe ref, M-Pesa sandbox, Mailgun DNS, Mailchimp tags)
- [ ] Expand security section in integration-execution-plan.md with key rotation, secret management, rate limiting