# 🚀 Quick Deploy to Vercel - 5 Minute Guide

## Step 1: Prepare (2 minutes)

```bash
# Run the deployment helper script
./deploy-to-vercel.sh
```

OR manually:

```bash
# Test build
npm run build

# Commit and push
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

### A. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### B. Import Project
1. Click **"Add New Project"**
2. Select your `equality-v` repository
3. Click **"Import"**

### C. Add Environment Variables
**Copy ALL variables from `VERCEL_ENV_VARIABLES.txt`**

Quick copy sections:
- Database (1 variable)
- Authentication (5 variables)
- Stripe (4 variables)
- M-Pesa (6 variables)
- Mailchimp (3 variables)
- Cloudflare R2 (5 variables)
- Email/Security (4 variables - use placeholders)
- App URLs (3 variables)

### D. Deploy
Click **"Deploy"** and wait 3-5 minutes

---

## Step 3: Post-Deployment (5 minutes)

### A. Update URLs
1. Copy your Vercel URL (e.g., `https://equality-v-xyz.vercel.app`)
2. Go to Settings → Environment Variables
3. Update these 4 variables:
   ```
   NEXTAUTH_URL=https://your-actual-url.vercel.app
   NEXT_PUBLIC_URL=https://your-actual-url.vercel.app
   NEXT_PUBLIC_API_URL=https://your-actual-url.vercel.app/api
   R2_PUBLIC_URL=https://your-actual-url.vercel.app
   ```
4. Click **"Redeploy"**

### B. Set Up Stripe Webhook
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://your-url.vercel.app/api/webhooks/stripe`
3. Select all payment events
4. Copy webhook secret (starts with `whsec_`)
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel
6. Redeploy

### C. Create Admin User
Visit: `https://your-url.vercel.app/api/seed`

Login at: `https://your-url.vercel.app/admin`
- Email: `admin@equalityvanguard.org`
- Password: `Sylvia2025!`

---

## ✅ You're Live!

### What Works Now:
- ✅ Full website
- ✅ Admin panel
- ✅ Stripe payments
- ✅ M-Pesa payments (sandbox)
- ✅ Newsletter signups
- ✅ File uploads
- ⚠️ Emails (need Mailgun key)
- ⚠️ Bot protection (need reCAPTCHA)

### Test Your Site:
1. Visit homepage
2. Try making a test donation (card: 4242 4242 4242 4242)
3. Sign up for newsletter
4. Log in to admin panel

---

## 🔧 Add Later (Optional)

### Enable Emails (10 minutes)
1. Sign up at [Mailgun](https://mailgun.com)
2. Get API key
3. Update `MAILGUN_API_KEY` in Vercel
4. Redeploy

### Enable Bot Protection (10 minutes)
1. Get keys from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Update `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`
3. Redeploy

---

## 📚 Full Documentation

- **Complete Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Environment Variables**: `VERCEL_ENV_VARIABLES.txt`
- **Post-Deployment**: `POST_DEPLOYMENT_CHECKLIST.md`

---

## 🆘 Need Help?

**Build fails?** Check Vercel logs for errors

**Database error?** Verify MongoDB URI and whitelist IPs

**Payments not working?** Check Stripe webhook setup

**Questions?** See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting

---

**Total Time**: 10-15 minutes for full deployment
**Site Status**: 85% functional immediately, 100% after optional configs
