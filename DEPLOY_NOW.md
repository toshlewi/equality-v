# 🚀 Deploy Now - Step-by-Step Guide

## ✅ Step 1: Code Pushed to GitHub ✓

Your code is now on GitHub at: `github.com:cissybosibori/equality-v`

---

## 📋 Step 2: Go to Vercel (5 minutes)

### A. Sign In to Vercel
1. Open your browser
2. Go to: **https://vercel.com**
3. Click **"Sign Up"** or **"Log In"**
4. Choose **"Continue with GitHub"**
5. Authorize Vercel to access your GitHub account

### B. Import Your Project
1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"equality-v"** in the list
4. Click **"Import"** next to it

### C. Configure Project
Vercel will auto-detect Next.js. You'll see:
- **Framework Preset**: Next.js ✓ (auto-detected)
- **Root Directory**: `./` ✓ (leave as is)
- **Build Command**: `npm run build` ✓ (auto-filled)
- **Output Directory**: `.next` ✓ (auto-filled)
- **Install Command**: `npm ci` ✓ (auto-filled)

**Don't click Deploy yet!** We need to add environment variables first.

---

## 🔑 Step 3: Add Environment Variables (10 minutes)

### Click "Environment Variables" Section

Now copy and paste these variables **ONE BY ONE**:

### Database
```
Name: MONGODB_URI
Value: mongodb+srv://equality-vanguard-user:B8Ccem6U6SQkAUvE@equality-vanguard-clust.gsfm6qe.mongodb.net/?retryWrites=true&w=majority&appName=equality-vanguard-cluster
```

### Authentication (Add these 5)
```
Name: NEXTAUTH_URL
Value: https://TEMPORARY.vercel.app
(We'll update this after deployment)

Name: NEXTAUTH_SECRET
Value: P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM=

Name: ADMIN_EMAIL
Value: admin@equalityvanguard.org

Name: ADMIN_PASSWORD
Value: Sylvia2025!

Name: ADMIN_NAME
Value: System Administrator
```

### Stripe Payments (Add these 4)
```
Name: STRIPE_SECRET_KEY
Value: sk_test_51SQ5cI4CpEJP3wofpDgeaENWkHAyicpubKabBg5JBO4ZhybR3MNo0pAw9oqCvPG0H1d1Z1yMk8glFeFzT1HrDr0K00XQnLQcfe

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb

Name: STRIPE_WEBHOOK_SECRET
Value: WILL_UPDATE_AFTER_DEPLOYMENT
```

### M-Pesa Payments (Add these 6)
```
Name: MPESA_CONSUMER_KEY
Value: oMjEATGvBv9FjdFAJLAE7piHlVOA9IeGWCAmlpCu5zAkxIF5

Name: MPESA_CONSUMER_SECRET
Value: zGAVAJI5ifsn1wIrmh0reGYUQhmACB2vUSnLNY7BIyTmyjJHyDn4NONrxqifKiyp

Name: MPESA_SHORTCODE
Value: 174379

Name: MPESA_PASSKEY
Value: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

Name: MPESA_BUSINESS_SHORTCODE
Value: 174379

Name: MPESA_ENVIRONMENT
Value: sandbox
```

### Mailchimp Newsletter (Add these 3)
```
Name: MAILCHIMP_API_KEY
Value: d2a5027c23a8780439a9109380ca1202-us1

Name: MAILCHIMP_LIST_ID
Value: 1d50d52306

Name: MAILCHIMP_SERVER_PREFIX
Value: us1
```

### Cloudflare R2 Storage (Add these 5)
```
Name: R2_ACCESS_KEY_ID
Value: 156079ef3687569ce1e59b2668cf056a

Name: R2_SECRET_ACCESS_KEY
Value: 5a5333a765a12826ce6d9cd25759857e2b9eadf793f83f02ffe3f497a7680712

Name: R2_ACCOUNT_ID
Value: 1a960de18723bbc182a9b2d12e9ae9b7

Name: R2_BUCKET_NAME
Value: equality-vanguard-uploads

Name: R2_PUBLIC_URL
Value: https://TEMPORARY.vercel.app
(We'll update this after deployment)
```

### Email Service - Mailgun (Add these 4)
```
Name: MAILGUN_API_KEY
Value: PLACEHOLDER_GET_FROM_MAILGUN

Name: MAILGUN_DOMAIN
Value: mg.equalityvanguard.org

Name: MAILGUN_FROM_EMAIL
Value: noreply@equalityvanguard.org

Name: MAILGUN_FROM_NAME
Value: Equality Vanguard
```

### Security - reCAPTCHA (Add these 2)
```
Name: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
Value: PLACEHOLDER_GET_FROM_GOOGLE

Name: RECAPTCHA_SECRET_KEY
Value: PLACEHOLDER_GET_FROM_GOOGLE
```

### Application URLs (Add these 3)
```
Name: NEXT_PUBLIC_URL
Value: https://TEMPORARY.vercel.app
(We'll update this after deployment)

Name: NEXT_PUBLIC_API_URL
Value: https://TEMPORARY.vercel.app/api
(We'll update this after deployment)

Name: NODE_ENV
Value: production
```

**Total: 33 environment variables added**

---

## 🚀 Step 4: Deploy! (3-5 minutes)

1. After adding all environment variables, scroll down
2. Click the big **"Deploy"** button
3. Wait 3-5 minutes while Vercel builds your site
4. You'll see a progress screen with logs

**What's happening:**
- Installing dependencies
- Building Next.js app
- Optimizing production build
- Deploying to Vercel's edge network

---

## 🎉 Step 5: Your Site is Live!

Once deployment completes, you'll see:
- ✅ **Congratulations!** message
- 🔗 Your site URL (something like: `https://equality-v-abc123.vercel.app`)

**Copy this URL!** You'll need it for the next steps.

---

## 🔧 Step 6: Update Environment Variables (5 minutes)

Now that you have your actual Vercel URL, let's update the temporary values:

1. In Vercel, go to your project
2. Click **"Settings"** (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Find and update these 4 variables:

### Update These:
```
NEXTAUTH_URL
Change from: https://TEMPORARY.vercel.app
Change to: https://YOUR-ACTUAL-URL.vercel.app

R2_PUBLIC_URL
Change from: https://TEMPORARY.vercel.app
Change to: https://YOUR-ACTUAL-URL.vercel.app

NEXT_PUBLIC_URL
Change from: https://TEMPORARY.vercel.app
Change to: https://YOUR-ACTUAL-URL.vercel.app

NEXT_PUBLIC_API_URL
Change from: https://TEMPORARY.vercel.app/api
Change to: https://YOUR-ACTUAL-URL.vercel.app/api
```

5. After updating all 4, click **"Redeploy"** button (top right)
6. Wait 2-3 minutes for redeployment

---

## 🔗 Step 7: Set Up Stripe Webhook (5 minutes)

1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click **"Add endpoint"** button
3. In "Endpoint URL", enter:
   ```
   https://YOUR-ACTUAL-URL.vercel.app/api/webhooks/stripe
   ```
4. Click **"Select events"**
5. Select these events:
   - ✓ `payment_intent.succeeded`
   - ✓ `payment_intent.payment_failed`
   - ✓ `charge.refunded`
   - ✓ `customer.subscription.created`
   - ✓ `customer.subscription.updated`
   - ✓ `customer.subscription.deleted`
6. Click **"Add events"**
7. Click **"Add endpoint"**
8. You'll see your new webhook with a **"Signing secret"**
9. Click **"Reveal"** next to the signing secret
10. Copy the secret (starts with `whsec_`)

### Update Stripe Webhook Secret in Vercel:
1. Go back to Vercel → Settings → Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Click **"Edit"**
4. Replace `WILL_UPDATE_AFTER_DEPLOYMENT` with your actual secret
5. Click **"Save"**
6. Click **"Redeploy"** again

---

## 👤 Step 8: Create Admin User (2 minutes)

1. Open your browser
2. Go to: `https://YOUR-ACTUAL-URL.vercel.app/api/seed`
3. You should see: `{"success": true, "message": "Admin user created"}`
4. Now go to: `https://YOUR-ACTUAL-URL.vercel.app/admin`
5. Log in with:
   - **Email**: `admin@equalityvanguard.org`
   - **Password**: `Sylvia2025!`

**✅ You're in!** You now have full admin access.

---

## 🧪 Step 9: Test Your Site (5 minutes)

### Test 1: Homepage
- Visit: `https://YOUR-ACTUAL-URL.vercel.app`
- ✓ Should load without errors
- ✓ Navigation should work
- ✓ Images should display

### Test 2: Make a Test Donation
1. Go to the donation page
2. Fill out the form
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Submit
7. ✓ Should process successfully

### Test 3: Newsletter Signup
1. Find the newsletter form
2. Enter your email
3. Submit
4. ✓ Should show success message
5. Check your Mailchimp dashboard - subscriber should appear

### Test 4: Admin Panel
1. Go to: `https://YOUR-ACTUAL-URL.vercel.app/admin`
2. ✓ Dashboard should load
3. ✓ Can view donations
4. ✓ Can view members
5. ✓ Can upload files

---

## ✅ Step 10: You're Live!

### What's Working Now (85%):
- ✅ Full website
- ✅ Admin panel
- ✅ Stripe payments
- ✅ M-Pesa payments (sandbox)
- ✅ Newsletter subscriptions
- ✅ File uploads
- ✅ Database operations
- ✅ All features

### What Needs Configuration (15%):
- ⚠️ **Email notifications** - Need Mailgun API key
- ⚠️ **Bot protection** - Need reCAPTCHA keys

**Note**: Your site is fully functional without these. They're optional enhancements.

---

## 🎯 Optional: Enable Email Notifications (10 minutes)

### Get Mailgun API Key:
1. Go to: **https://www.mailgun.com**
2. Sign up for free account (5,000 emails/month free)
3. Verify your email
4. Go to **Settings** → **API Keys**
5. Copy your **Private API Key**

### Update in Vercel:
1. Go to Vercel → Settings → Environment Variables
2. Find `MAILGUN_API_KEY`
3. Click **"Edit"**
4. Replace `PLACEHOLDER_GET_FROM_MAILGUN` with your actual key
5. Click **"Save"**
6. Click **"Redeploy"**

**Test**: Make a donation and check your email for receipt!

---

## 🛡️ Optional: Enable Bot Protection (10 minutes)

### Get reCAPTCHA Keys:
1. Go to: **https://www.google.com/recaptcha/admin/create**
2. Register a new site:
   - **Label**: Equality Vanguard
   - **reCAPTCHA type**: v2 "I'm not a robot"
   - **Domains**: Add your Vercel domain
3. Click **"Submit"**
4. Copy both keys:
   - **Site Key**
   - **Secret Key**

### Update in Vercel:
1. Go to Vercel → Settings → Environment Variables
2. Find `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and update with Site Key
3. Find `RECAPTCHA_SECRET_KEY` and update with Secret Key
4. Click **"Save"** for both
5. Click **"Redeploy"**

**Test**: Forms should now show reCAPTCHA checkbox!

---

## 🎊 Congratulations!

Your Equality Vanguard site is now live on Vercel!

### Your URLs:
- **Website**: `https://YOUR-ACTUAL-URL.vercel.app`
- **Admin Panel**: `https://YOUR-ACTUAL-URL.vercel.app/admin`

### Your Credentials:
- **Email**: `admin@equalityvanguard.org`
- **Password**: `Sylvia2025!`

### Next Steps:
1. ✅ Test all features thoroughly
2. ✅ Add Mailgun key when ready
3. ✅ Add reCAPTCHA when ready
4. ✅ Consider adding a custom domain
5. ✅ Switch to production mode (Stripe/M-Pesa) when ready

---

## 🆘 Need Help?

### Common Issues:

**Build Failed?**
- Check Vercel logs for errors
- Verify all environment variables are set
- Check GitHub repo has latest code

**Database Connection Error?**
- Go to MongoDB Atlas
- Click "Network Access"
- Add IP: `0.0.0.0/0` (allows all IPs)

**Payments Not Working?**
- Verify Stripe webhook is set up
- Check webhook secret is correct
- View Vercel function logs

**Can't Log In to Admin?**
- Make sure you visited `/api/seed` first
- Check credentials are correct
- Try resetting password

---

## 📞 Support Resources:
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **MongoDB Atlas**: https://cloud.mongodb.com/

---

**You did it!** 🎉 Your site is live and working!
