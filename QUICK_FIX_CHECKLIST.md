# Quick Fix Checklist - Before Launch

## 🚨 Critical Fixes Required (Do These NOW)

### 1. Generate NextAuth Secret ⏱️ 2 minutes

```bash
openssl rand -base64 32
```

Copy the output and update in `.env.local`:
```env
NEXTAUTH_SECRET=<paste-the-generated-secret-here>
```

---

### 2. Set Admin Password ⏱️ 1 minute

Update in `.env.local`:
```env
ADMIN_PASSWORD=YourSecurePassword123!
```

**Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols

---

### 3. Fix M-Pesa Shortcode 🚨 CRITICAL ⏱️ 2 minutes

**Current value is WRONG** (it's encrypted/encoded):
```env
MPESA_SHORTCODE=eA0I8AjO8gEHhrq7FTfQnv7FHne5k1sj+kNYuBJ0omO5LUN79e5LsHTfkIImh/kkK9t/9mPmoyGKK3ThQfqMXW4HzrClNMLMo60joszcBeaFofsxVrf/3eJiqn67BohDZOhEuGB1Q6OinjqWqHWW4cQFiYNW83rixsR8VhEAjKCWqOQADcO9qwumibNSe5FOtG6o+nr1DSjtTnn99jMCzhm5NWj0o9aNOgVjKXoLVV0AebOmdbYjNJFuGkK6gkgu6CQHbEkSriVEpVKKnPlA8IDH+mwvQf+Y89fbNP5DzaIBpAR7rO35/VwlW4/f/WNbofpHLWgsCEf0TKPv16+tAw==
```

**Should be** (numeric only):
```env
MPESA_SHORTCODE=174379
# Replace with YOUR actual shortcode from Safaricom Daraja
```

**Where to find it:**
1. Log in to https://developer.safaricom.co.ke
2. Go to your app
3. Look for "Business Short Code" or "Paybill Number"
4. Should be 5-7 digits

---

### 4. Get Stripe Webhook Secret ⏱️ 3 minutes

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. Click "Reveal" on Signing secret
4. Copy and update:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 📧 Email Setup (Required for Notifications) ⏱️ 15 minutes

### Setup Mailgun

1. **Sign up:** https://mailgun.com
2. **Add domain:** `mg.equalityvanguard.org` (or your domain)
3. **Verify domain:** Add DNS records they provide
4. **Get API key:** Settings → API Keys
5. **Update `.env.local`:**

```env
MAILGUN_API_KEY=your-actual-api-key-here
MAILGUN_DOMAIN=mg.equalityvanguard.org
```

**Without this:** No emails will be sent (receipts, confirmations, etc.)

---

## 🔒 Spam Protection (Recommended) ⏱️ 5 minutes

### Setup reCAPTCHA

1. Go to https://www.google.com/recaptcha/admin
2. Register new site (use reCAPTCHA v2)
3. Add your domain
4. Copy keys:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

---

## ✅ Verification Steps

After making changes:

```bash
# 1. Validate environment
npm run validate:env

# 2. Test database
npm run test:db

# 3. Seed admin user
npm run seed:admin

# 4. Test email (if Mailgun configured)
npm run test:email

# 5. Start development server
npm run dev
```

---

## 📋 Final Checklist

Before launching:

- [ ] ✅ `NEXTAUTH_SECRET` generated and set
- [ ] ✅ `ADMIN_PASSWORD` set (strong password)
- [ ] 🚨 `MPESA_SHORTCODE` fixed (numeric only)
- [ ] ✅ `STRIPE_WEBHOOK_SECRET` obtained and set
- [ ] 📧 `MAILGUN_API_KEY` configured
- [ ] 📧 `MAILGUN_DOMAIN` verified
- [ ] 🔒 `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set (optional)
- [ ] 🔒 `RECAPTCHA_SECRET_KEY` set (optional)
- [ ] ✅ Ran `npm run validate:env`
- [ ] ✅ Ran `npm run seed:admin`
- [ ] ✅ Tested payment flow (Stripe)
- [ ] ✅ Tested payment flow (M-Pesa)
- [ ] ✅ Verified email notifications work

---

## 🆘 Quick Troubleshooting

### "NEXTAUTH_SECRET is not configured"
```bash
openssl rand -base64 32
# Copy output to .env.local
```

### "M-Pesa shortcode must be numeric"
- Get from Safaricom Daraja portal
- Should look like: `174379` or `600000`
- NOT encrypted/base64 string

### "Mailgun API key not configured"
- Sign up at mailgun.com
- Verify your domain
- Get API key from dashboard

### "Emails not sending"
- Check `MAILGUN_API_KEY` is set
- Verify domain in Mailgun
- Check DNS records
- Run `npm run test:email`

---

## 🚀 Ready to Launch?

Once all checkboxes are ticked:

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy to Vercel
vercel --prod
```

---

## 📚 Additional Resources

- **Full Setup Guide:** [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- **M-Pesa Implementation:** [MPESA_EMAIL_IMPLEMENTATION.md](./MPESA_EMAIL_IMPLEMENTATION.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)

---

**Estimated Total Time:** 30-45 minutes

**Priority Order:**
1. 🚨 Fix M-Pesa shortcode (CRITICAL)
2. ✅ Generate NextAuth secret
3. ✅ Set admin password
4. ✅ Get Stripe webhook secret
5. 📧 Setup Mailgun (for emails)
6. 🔒 Setup reCAPTCHA (optional)
