# Netlify Environment Variables Setup

## Complete Environment Variables for Netlify

Copy these environment variables to your Netlify dashboard:
**Site Settings → Environment Variables → Add a variable**

---

## Database Configuration

```
MONGODB_URI
mongodb+srv://equality-vanguard-user:B8Ccem6U6SQkAUvE@equality-vanguard-clust.gsfm6qe.mongodb.net/?retryWrites=true&w=majority&appName=equality-vanguard-cluster
```

---

## Authentication (NextAuth.js)

```
NEXTAUTH_URL
https://YOUR-SITE-NAME.netlify.app
```
⚠️ **IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify site name

```
NEXTAUTH_SECRET
P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM=
```

---

## Admin User

```
ADMIN_EMAIL
admin@equalityvanguard.org
```

```
ADMIN_PASSWORD
Sylvia2025!
```

```
ADMIN_NAME
System Administrator
```

---

## Payment Processing - Stripe

```
STRIPE_SECRET_KEY
sk_test_51SQ5cI4CpEJP3wofpDgeaENWkHAyicpubKabBg5JBO4ZhybR3MNo0pAw9oqCvPG0H1d1Z1yMk8glFeFzT1HrDr0K00XQnLQcfe
```

```
STRIPE_PUBLISHABLE_KEY
pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb
```

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb
```

```
STRIPE_WEBHOOK_SECRET
whsec_your_stripe_webhook_secret
```
⚠️ **TODO**: Update this after configuring Stripe webhook (see below)

---

## Payment Processing - M-Pesa (Kenya)

```
MPESA_CONSUMER_KEY
oMjEATGvBv9FjdFAJLAE7piHlVOA9IeGWCAmlpCu5zAkxIF5
```

```
MPESA_CONSUMER_SECRET
zGAVAJI5ifsn1wIrmh0reGYUQhmACB2vUSnLNY7BIyTmyjJHyDn4NONrxqifKiyp
```

```
MPESA_SHORTCODE
174379
```

```
MPESA_PASSKEY
bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

```
MPESA_BUSINESS_SHORTCODE
174379
```

```
MPESA_ENVIRONMENT
sandbox
```

```
MPESA_CALLBACK_URL
https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa
```
⚠️ **IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify site name

---

## Email Service - Mailgun

```
MAILGUN_API_KEY
your_mailgun_api_key
```
⚠️ **TODO**: Add your actual Mailgun API key

```
MAILGUN_DOMAIN
mg.equalityvanguard.org
```

```
MAILGUN_FROM_EMAIL
noreply@equalityvanguard.org
```

```
MAILGUN_FROM_NAME
Equality Vanguard
```

---

## Newsletter - Mailchimp

```
MAILCHIMP_API_KEY
d2a5027c23a8780439a9109380ca1202-us1
```

```
MAILCHIMP_LIST_ID
1d50d52306
```

```
MAILCHIMP_SERVER_PREFIX
us1
```

---

## File Storage - Cloudflare R2

```
R2_ACCESS_KEY_ID
156079ef3687569ce1e59b2668cf056a
```

```
R2_SECRET_ACCESS_KEY
5a5333a765a12826ce6d9cd25759857e2b9eadf793f83f02ffe3f497a7680712
```

```
R2_ACCOUNT_ID
1a960de18723bbc182a9b2d12e9ae9b7
```

```
R2_BUCKET_NAME
equality-vanguard-uploads
```

```
R2_PUBLIC_URL
https://equalityvanguard.org
```

---

## Security - reCAPTCHA

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
6LenVQcsAAAAALBFGKdOYCMUargvkgxfdFEceUi7
```

```
RECAPTCHA_SECRET_KEY
6LenVQcsAAAAAN0DP8nBBDzMm40nUCEKebzci1DD
```

---

## Analytics & Monitoring

```
GOOGLE_ANALYTICS_ID
G-XXXXXXXXXX
```
⚠️ **TODO**: Add your actual Google Analytics ID

```
SENTRY_DSN
your_sentry_dsn
```
⚠️ **TODO**: Add your actual Sentry DSN (optional)

```
SENTRY_AUTH_TOKEN
your_sentry_auth_token
```
⚠️ **TODO**: Add your actual Sentry auth token (optional)

---

## Redis (Optional - for queues and caching)

```
REDIS_URL
redis://localhost:6379
```
⚠️ **NOTE**: You may need to use a cloud Redis service like Upstash for Netlify

---

## Application URLs

```
NEXT_PUBLIC_URL
https://YOUR-SITE-NAME.netlify.app
```
⚠️ **IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify site name

```
NEXT_PUBLIC_API_URL
https://YOUR-SITE-NAME.netlify.app/api
```
⚠️ **IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify site name

---

## Environment

```
NODE_ENV
production
```

---

## Instagram Integration (Optional)

```
INSTAGRAM_ACCESS_TOKEN
your_instagram_access_token
```
⚠️ **TODO**: Add your actual Instagram access token (optional)

```
INSTAGRAM_USER_ID
your_instagram_user_id
```
⚠️ **TODO**: Add your actual Instagram user ID (optional)

---

## Post-Deployment Steps

### 1. Update Stripe Webhook

After your site is deployed:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Netlify environment variables
7. Redeploy the site

### 2. Update M-Pesa Callback URL

If using M-Pesa in production:

1. Log in to Safaricom Daraja portal
2. Update callback URL to: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa`
3. Save changes

### 3. Configure Mailgun (if needed)

1. Go to [Mailgun Dashboard](https://app.mailgun.com)
2. Get your API key
3. Update `MAILGUN_API_KEY` in Netlify environment variables
4. Redeploy the site

### 4. Test Your Deployment

Run these tests after deployment:

- [ ] Visit homepage: `https://YOUR-SITE-NAME.netlify.app`
- [ ] Test donation form
- [ ] Test Stripe payment with test card: `4242 4242 4242 4242`
- [ ] Test admin login: `/admin`
- [ ] Check images load correctly
- [ ] Test contact form
- [ ] Test newsletter signup

---

## Quick Setup via Netlify CLI (Optional)

If you have Netlify CLI installed, you can set environment variables via command line:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set environment variables (example)
netlify env:set MONGODB_URI "mongodb+srv://..."
netlify env:set NEXTAUTH_SECRET "P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM="
# ... continue for all variables
```

---

## Notes

- **Never commit** `.env.local` or `.env` files to git
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- After adding/updating environment variables, **redeploy** your site
- Keep sensitive keys secure and rotate them regularly
- Use different keys for development and production

---

## Support

If you encounter issues:

1. Check Netlify build logs: Deploys → Click deployment → View logs
2. Check function logs: Functions tab
3. Verify all environment variables are set correctly
4. Clear cache and redeploy: `netlify build --clear-cache`
