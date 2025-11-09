# Vercel Deployment Guide - Equality Vanguard

## 🚀 Complete Deployment Process

This guide will walk you through deploying your Equality Vanguard site to Vercel with all integrations working.

---

## Phase 1: Pre-Deployment Preparation (5 minutes)

### Step 1: Verify Your Code is Ready
```bash
# Run these commands to ensure everything is ready
npm run build
npm run type-check
```

### Step 2: Commit and Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Phase 2: Deploy to Vercel (10 minutes)

### Step 1: Sign Up / Log In to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account

### Step 2: Import Your Project
1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose your `equality-v` repository
4. Click **"Import"**

### Step 3: Configure Project Settings
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `.next` (auto-filled)
5. **Install Command**: `npm ci` (auto-filled)

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add ALL of these:

#### Database
```
MONGODB_URI=mongodb+srv://equality-vanguard-user:B8Ccem6U6SQkAUvE@equality-vanguard-clust.gsfm6qe.mongodb.net/?retryWrites=true&w=majority&appName=equality-vanguard-cluster
```

#### Authentication
```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM=
ADMIN_EMAIL=admin@equalityvanguard.org
ADMIN_PASSWORD=Sylvia2025!
ADMIN_NAME=System Administrator
```

#### Stripe Payments
```
STRIPE_SECRET_KEY=sk_test_51SQ5cI4CpEJP3wofpDgeaENWkHAyicpubKabBg5JBO4ZhybR3MNo0pAw9oqCvPG0H1d1Z1yMk8glFeFzT1HrDr0K00XQnLQcfe
STRIPE_PUBLISHABLE_KEY=pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```
**Note**: We'll update `STRIPE_WEBHOOK_SECRET` after deployment

#### M-Pesa Payments
```
MPESA_CONSUMER_KEY=oMjEATGvBv9FjdFAJLAE7piHlVOA9IeGWCAmlpCu5zAkxIF5
MPESA_CONSUMER_SECRET=zGAVAJI5ifsn1wIrmh0reGYUQhmACB2vUSnLNY7BIyTmyjJHyDn4NONrxqifKiyp
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_BUSINESS_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
```

#### Mailchimp Newsletter
```
MAILCHIMP_API_KEY=d2a5027c23a8780439a9109380ca1202-us1
MAILCHIMP_LIST_ID=1d50d52306
MAILCHIMP_SERVER_PREFIX=us1
```

#### Cloudflare R2 Storage
```
R2_ACCESS_KEY_ID=156079ef3687569ce1e59b2668cf056a
R2_SECRET_ACCESS_KEY=5a5333a765a12826ce6d9cd25759857e2b9eadf793f83f02ffe3f497a7680712
R2_ACCOUNT_ID=1a960de18723bbc182a9b2d12e9ae9b7
R2_BUCKET_NAME=equality-vanguard-uploads
R2_PUBLIC_URL=https://your-project-name.vercel.app
```
**Note**: Update `R2_PUBLIC_URL` with your actual Vercel URL after deployment

#### Email Service (Mailgun) - TEMPORARY PLACEHOLDER
```
MAILGUN_API_KEY=temporary_placeholder_key
MAILGUN_DOMAIN=mg.equalityvanguard.org
MAILGUN_FROM_EMAIL=noreply@equalityvanguard.org
MAILGUN_FROM_NAME=Equality Vanguard
```
**Note**: Emails won't work until you add a real Mailgun API key

#### Security (reCAPTCHA) - TEMPORARY PLACEHOLDER
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=temporary_placeholder_key
RECAPTCHA_SECRET_KEY=temporary_placeholder_key
```
**Note**: Forms will work but without bot protection until you add real keys

#### Application URLs
```
NEXT_PUBLIC_URL=https://your-project-name.vercel.app
NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app/api
NODE_ENV=production
```

#### Optional (can add later)
```
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn
REDIS_URL=redis://localhost:6379
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_USER_ID=your_instagram_user_id
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for the build to complete
3. You'll get a URL like: `https://equality-v-xyz123.vercel.app`

---

## Phase 3: Post-Deployment Configuration (15 minutes)

### Step 1: Update Environment Variables with Your Vercel URL

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Update these variables with your actual Vercel URL:

```
NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
NEXT_PUBLIC_URL=https://your-actual-vercel-url.vercel.app
NEXT_PUBLIC_API_URL=https://your-actual-vercel-url.vercel.app/api
R2_PUBLIC_URL=https://your-actual-vercel-url.vercel.app
```

4. Click **"Redeploy"** to apply changes

### Step 2: Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter webhook URL:
   ```
   https://your-actual-vercel-url.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Go back to Vercel → Settings → Environment Variables
8. Update `STRIPE_WEBHOOK_SECRET` with the real secret
9. Click **"Redeploy"**

### Step 3: Set Up Admin User

1. Visit: `https://your-vercel-url.vercel.app/api/seed`
2. This will create your admin user with credentials:
   - Email: `admin@equalityvanguard.org`
   - Password: `Sylvia2025!`
3. Log in at: `https://your-vercel-url.vercel.app/admin`

---

## Phase 4: Enable Full Functionality (Optional - 30 minutes)

### Option A: Set Up Mailgun (For Email Notifications)

**Why**: Without this, no emails will be sent (confirmations, receipts, etc.)

1. Go to [Mailgun](https://www.mailgun.com/)
2. Sign up for free account (5,000 emails/month free)
3. Verify your domain `mg.equalityvanguard.org` OR use their sandbox domain
4. Get your API key from Settings → API Keys
5. Update in Vercel:
   ```
   MAILGUN_API_KEY=your_real_mailgun_api_key
   ```
6. Redeploy

### Option B: Set Up reCAPTCHA (For Bot Protection)

**Why**: Without this, forms work but have no bot protection

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. Register a new site:
   - Label: "Equality Vanguard"
   - reCAPTCHA type: v2 "I'm not a robot"
   - Domains: Add your Vercel domain
3. Copy the **Site Key** and **Secret Key**
4. Update in Vercel:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
   RECAPTCHA_SECRET_KEY=your_secret_key
   ```
5. Redeploy

### Option C: Set Up Custom Domain (Optional)

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `equalityvanguard.org`)
3. Follow Vercel's DNS configuration instructions
4. Update all environment variables with your custom domain
5. Redeploy

---

## Phase 5: Testing Your Deployment (10 minutes)

### Test Checklist

#### ✅ Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] All pages are accessible

#### ✅ Database Connection
- [ ] Admin login works
- [ ] Can view admin dashboard
- [ ] Can create/edit content

#### ✅ Payment Systems
- [ ] Stripe donation form loads
- [ ] Can create test payment (use test card: 4242 4242 4242 4242)
- [ ] M-Pesa form loads (sandbox mode)

#### ✅ Newsletter
- [ ] Newsletter signup form works
- [ ] Subscribers appear in Mailchimp dashboard

#### ✅ File Uploads
- [ ] Can upload images in admin
- [ ] Uploaded files are accessible

#### ⚠️ Email (if Mailgun configured)
- [ ] Confirmation emails are sent
- [ ] Receipt emails are sent

#### ⚠️ reCAPTCHA (if configured)
- [ ] reCAPTCHA appears on forms
- [ ] Form submission works with verification

---

## 🎯 What Works Right Now (Without Additional Setup)

### ✅ Fully Working
1. **Website**: All pages, navigation, content
2. **Database**: MongoDB connection, data storage
3. **Admin Panel**: Full admin functionality
4. **Stripe Payments**: Credit card payments work
5. **M-Pesa Payments**: Mobile money (sandbox)
6. **Newsletter**: Mailchimp integration
7. **File Storage**: Cloudflare R2 uploads
8. **Authentication**: Admin login system

### ⚠️ Partially Working (Need Configuration)
1. **Email Notifications**: Forms work but emails won't send
   - Fix: Add Mailgun API key (Phase 4, Option A)
2. **Bot Protection**: Forms work but no reCAPTCHA
   - Fix: Add reCAPTCHA keys (Phase 4, Option B)

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

### Database Connection Fails
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
- Ensure database user has correct permissions

### Payments Not Working
- Check Stripe webhook is configured
- Verify webhook secret is correct
- Check Vercel function logs for errors

### Files Not Uploading
- Verify all R2 credentials are correct
- Check R2 bucket CORS settings
- Ensure R2_PUBLIC_URL is set correctly

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs
- **Mailchimp API**: https://mailchimp.com/developer/
- **Cloudflare R2**: https://developers.cloudflare.com/r2/

---

## 🎉 Success Criteria

Your site is successfully deployed when:
1. ✅ Site loads at your Vercel URL
2. ✅ Admin can log in
3. ✅ Payments can be processed
4. ✅ Newsletter signups work
5. ✅ Files can be uploaded

**Optional (but recommended):**
6. ⚠️ Emails are being sent (requires Mailgun)
7. ⚠️ Forms have bot protection (requires reCAPTCHA)

---

## 🚀 Quick Start Commands

```bash
# 1. Prepare for deployment
npm run build
git add .
git commit -m "Deploy to Vercel"
git push

# 2. After deployment, test the site
curl https://your-vercel-url.vercel.app/api/health

# 3. Seed admin user
curl https://your-vercel-url.vercel.app/api/seed
```

---

## 📝 Post-Deployment Checklist

- [ ] Site is live and accessible
- [ ] Admin user created and can log in
- [ ] Stripe webhook configured
- [ ] Environment variables updated with actual URLs
- [ ] Test payment processed successfully
- [ ] Newsletter signup tested
- [ ] File upload tested
- [ ] (Optional) Mailgun configured
- [ ] (Optional) reCAPTCHA configured
- [ ] (Optional) Custom domain added

---

## 🎯 Next Steps After Deployment

1. **Monitor**: Check Vercel dashboard for errors
2. **Test**: Run through all user flows
3. **Configure**: Add Mailgun and reCAPTCHA when ready
4. **Optimize**: Review performance metrics
5. **Scale**: Upgrade Vercel plan if needed

---

**Estimated Total Time**: 30-60 minutes (depending on optional configurations)

**Current Status**: Your site will be 85% functional immediately after deployment. The remaining 15% (emails and bot protection) can be added anytime.
