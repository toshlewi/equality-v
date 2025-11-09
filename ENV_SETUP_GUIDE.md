# Environment Variables Setup Guide

This guide will help you configure all required environment variables for the Equality Vanguard platform.

## 🚨 Critical Variables (Must Update Before Launch)

### 1. NextAuth Secret
Generate a secure 32+ character secret for NextAuth:

```bash
# Generate using OpenSSL (recommended)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update in `.env.local`:
```env
NEXTAUTH_SECRET=<paste-generated-secret-here>
```

### 2. Admin Password
Set a strong password for the admin account:

```env
ADMIN_PASSWORD=YourSecurePassword123!
```

**Security Tips:**
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Don't use common words or patterns

### 3. M-Pesa Shortcode Configuration

**CRITICAL FIX REQUIRED:** Your current `MPESA_SHORTCODE` appears to be encrypted/encoded. It should be a **numeric value only**.

**Current (INCORRECT):**
```env
MPESA_SHORTCODE=eA0I8AjO8gEHhrq7FTfQnv7FHne5k1sj+kNYuBJ0omO5LUN79e5LsHTfkIImh/kkK9t/9mPmoyGKK3ThQfqMXW4HzrClNMLMo60joszcBeaFofsxVrf/3eJiqn67BohDZOhEuGB1Q6OinjqWqHWW4cQFiYNW83rixsR8VhEAjKCWqOQADcO9qwumibNSe5FOtG6o+nr1DSjtTnn99jMCzhm5NWj0o9aNOgVjKXoLVV0AebOmdbYjNJFuGkK6gkgu6CQHbEkSriVEpVKKnPlA8IDH+mwvQf+Y89fbNP5DzaIBpAR7rO35/VwlW4/f/WNbofpHLWgsCEf0TKPv16+tAw==
```

**Should be (CORRECT):**
```env
MPESA_SHORTCODE=174379
# Or your actual numeric shortcode from Safaricom Daraja
```

**Where to find your M-Pesa shortcode:**
1. Log in to [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
2. Go to your app dashboard
3. Look for "Business Short Code" or "Paybill Number"
4. It should be a 5-7 digit number (e.g., 174379, 600000)

### 4. Stripe Webhook Secret
Get this from your Stripe dashboard:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. Reveal the **Signing secret**
5. Copy and paste:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 📧 Email Service Configuration (Required for Notifications)

### Mailgun Setup

**Why needed:** Sends all email notifications (receipts, confirmations, etc.)

1. **Create Account:** [mailgun.com](https://mailgun.com)
2. **Add Domain:** Add and verify your domain (e.g., `mg.equalityvanguard.org`)
3. **Get API Key:** Dashboard → Settings → API Keys
4. **Update `.env.local`:**

```env
MAILGUN_API_KEY=your-actual-mailgun-api-key-here
MAILGUN_DOMAIN=mg.equalityvanguard.org
MAILGUN_FROM_EMAIL=noreply@equalityvanguard.org
MAILGUN_FROM_NAME=Equality Vanguard
```

**DNS Records Required:**
- Add TXT and MX records provided by Mailgun to your domain DNS

---

## 📬 Newsletter Service (Optional but Recommended)

### Mailchimp Setup

1. **Create Account:** [mailchimp.com](https://mailchimp.com)
2. **Create Audience:** Marketing → Audience → Create Audience
3. **Get API Key:** Account → Extras → API Keys → Create A Key
4. **Get List ID:** Audience → Settings → Audience name and defaults → Audience ID
5. **Get Server Prefix:** From your API key (e.g., if key is `xxxxx-us1`, prefix is `us1`)

```env
MAILCHIMP_API_KEY=your-mailchimp-api-key-here
MAILCHIMP_LIST_ID=your-list-id-here
MAILCHIMP_SERVER_PREFIX=us1
```

---

## 🔒 Security Services (Recommended)

### reCAPTCHA Setup

**Why needed:** Prevents spam on forms

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register a new site (use reCAPTCHA v2 or v3)
3. Add your domain
4. Copy keys:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-here
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

**Note:** `NEXT_PUBLIC_` prefix is required for client-side access.

---

## 📊 Analytics & Monitoring (Optional)

### Google Analytics

1. Create property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (starts with `G-`)

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Get DSN from project settings

```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## 🗄️ Redis (Optional - For Background Jobs)

If you want to use background job processing:

```env
REDIS_URL=redis://localhost:6379
# Or use a cloud provider like Upstash, Redis Labs, etc.
```

---

## ✅ Complete Environment Variable Checklist

### Required (Must Have)
- [x] `MONGODB_URI` - ✅ Already configured
- [x] `NEXTAUTH_URL` - ✅ Already configured
- [ ] `NEXTAUTH_SECRET` - ⚠️ **MUST UPDATE**
- [ ] `ADMIN_PASSWORD` - ⚠️ **MUST UPDATE**
- [x] `STRIPE_SECRET_KEY` - ✅ Already configured
- [x] `STRIPE_PUBLISHABLE_KEY` - ✅ Already configured
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - ✅ Already configured
- [ ] `STRIPE_WEBHOOK_SECRET` - ⚠️ **MUST UPDATE**
- [x] `MPESA_CONSUMER_KEY` - ✅ Already configured
- [x] `MPESA_CONSUMER_SECRET` - ✅ Already configured
- [ ] `MPESA_SHORTCODE` - 🚨 **CRITICAL: MUST FIX (should be numeric)**
- [x] `MPESA_PASSKEY` - ✅ Already configured
- [x] `MPESA_BUSINESS_SHORTCODE` - ✅ Already configured
- [x] `R2_ACCESS_KEY_ID` - ✅ Already configured
- [x] `R2_SECRET_ACCESS_KEY` - ✅ Already configured
- [x] `R2_ACCOUNT_ID` - ✅ Already configured
- [x] `R2_BUCKET_NAME` - ✅ Already configured

### Highly Recommended (For Full Functionality)
- [ ] `MAILGUN_API_KEY` - ⚠️ **Needed for emails**
- [ ] `MAILCHIMP_API_KEY` - ⚠️ **Needed for newsletter**
- [ ] `MAILCHIMP_LIST_ID` - ⚠️ **Needed for newsletter**
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - ⚠️ **Prevents spam**
- [ ] `RECAPTCHA_SECRET_KEY` - ⚠️ **Prevents spam**

### Optional (Nice to Have)
- [ ] `GOOGLE_ANALYTICS_ID`
- [ ] `SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`
- [ ] `REDIS_URL`

---

## 🧪 Testing Your Configuration

After updating environment variables, run these tests:

```bash
# 1. Validate all environment variables
npm run validate:env

# 2. Test database connection
npm run test:db

# 3. Test email sending (if Mailgun configured)
npm run test:email

# 4. Test Stripe integration
npm run test:stripe-webhook

# 5. Test M-Pesa integration
npm run test:mpesa-callback

# 6. Verify all integrations
npm run verify:integrations
```

---

## 🚀 Quick Start Commands

```bash
# 1. Generate NextAuth secret
openssl rand -base64 32

# 2. Update .env.local with all required variables

# 3. Seed admin user
npm run seed:admin

# 4. Start development server
npm run dev
```

---

## 🆘 Troubleshooting

### "Mailgun API key not configured"
- Set `MAILGUN_API_KEY` in `.env.local`
- Verify domain in Mailgun dashboard
- Check DNS records are properly configured

### "M-Pesa shortcode must be numeric"
- Replace encrypted value with actual numeric shortcode
- Get from Safaricom Daraja portal
- Should be 5-7 digits (e.g., 174379)

### "Stripe webhook signature verification failed"
- Get correct webhook secret from Stripe dashboard
- Ensure webhook endpoint is configured: `https://yourdomain.com/api/webhooks/stripe`
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### "NextAuth secret is not configured"
- Generate using: `openssl rand -base64 32`
- Must be at least 32 characters
- Keep it secret and never commit to version control

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to version control**
   - Already in `.gitignore` ✅

2. **Use different values for development and production**
   - Test keys for development
   - Live keys for production

3. **Rotate secrets regularly**
   - Change `NEXTAUTH_SECRET` every 6 months
   - Update API keys if compromised

4. **Use environment-specific configurations**
   - Vercel: Set in project settings
   - Local: Use `.env.local`

5. **Restrict API key permissions**
   - Only grant necessary permissions
   - Use separate keys for different environments

---

## 📝 Next Steps

1. ✅ Update all **MUST UPDATE** variables
2. ✅ Fix M-Pesa shortcode (make it numeric)
3. ✅ Set up Mailgun for email notifications
4. ✅ Configure reCAPTCHA for spam protection
5. ✅ Run validation tests
6. ✅ Test payment flows (Stripe + M-Pesa)
7. ✅ Test email notifications
8. 🚀 Deploy to production

---

**Need Help?** Check the main [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md) for more information.
