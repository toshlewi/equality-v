# 🚀 Netlify Deployment - Quick Start

Deploy Equality Vanguard to Netlify in 3 simple steps!

---

## Prerequisites

- GitHub account with access to `cissybosibori/equality-v` repository
- Netlify account (free tier is fine) - [Sign up here](https://app.netlify.com/signup)
- All environment variables ready (see `.env.local`)

---

## Option 1: Deploy via Netlify Dashboard (Easiest)

### Step 1: Create Site (5 minutes)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select repository: **`cissybosibori/equality-v`**
5. Select branch: **`integrations`**
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`
7. Click **"Deploy site"**
8. Wait for initial deployment (will fail without env vars - that's OK!)
9. **Note your site name**: e.g., `amazing-cupcake-123456.netlify.app`

### Step 2: Add Environment Variables (10 minutes)

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Open `NETLIFY_ENV_SETUP.md` in another window
3. Add each variable one by one (40+ variables total)
4. **Important**: Replace `YOUR-SITE-NAME` in these variables:
   - `NEXTAUTH_URL` → `https://amazing-cupcake-123456.netlify.app`
   - `MPESA_CALLBACK_URL` → `https://amazing-cupcake-123456.netlify.app/api/webhooks/mpesa`
   - `NEXT_PUBLIC_URL` → `https://amazing-cupcake-123456.netlify.app`
   - `NEXT_PUBLIC_API_URL` → `https://amazing-cupcake-123456.netlify.app/api`

### Step 3: Redeploy & Test (5 minutes)

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (3-5 minutes)
4. Click **"Open production deploy"**
5. Test your site! 🎉

---

## Option 2: Deploy via CLI (For Developers)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login & Deploy

```bash
# Login to Netlify
netlify login

# Navigate to project
cd /home/toshlewi/equality-v/equality-v

# Initialize Netlify site
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: Choose your team
# - Site name: Enter a name (e.g., equality-vanguard)
# - Build command: npm run build
# - Publish directory: .next

# Deploy to production
netlify deploy --prod
```

### Step 3: Set Environment Variables

**Option A: Use the automated script**

```bash
# Run the setup script with your site name
./scripts/netlify-env-setup.sh YOUR-SITE-NAME

# Example:
./scripts/netlify-env-setup.sh equality-vanguard
```

**Option B: Set manually**

```bash
netlify env:set MONGODB_URI "mongodb+srv://..."
netlify env:set NEXTAUTH_SECRET "P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM="
# ... continue for all variables (see NETLIFY_ENV_SETUP.md)
```

### Step 4: Redeploy

```bash
netlify deploy --prod
```

---

## Post-Deployment Steps

### 1. Configure Stripe Webhook (Required for payments)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set endpoint URL: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **webhook signing secret**
6. Update in Netlify:
   ```bash
   netlify env:set STRIPE_WEBHOOK_SECRET "whsec_your_actual_secret"
   ```
7. Redeploy: `netlify deploy --prod`

### 2. Test Your Site

Visit your site and test:

- ✅ Homepage loads
- ✅ All pages accessible
- ✅ Images display correctly
- ✅ Donation form works
- ✅ Stripe payment (test card: `4242 4242 4242 4242`)
- ✅ Admin login (`admin@equalityvanguard.org` / `Sylvia2025!`)

### 3. Optional: Add Custom Domain

1. In Netlify: **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `equalityvanguard.org`
4. Follow DNS configuration instructions
5. Update environment variables with new domain
6. Update Stripe webhook URL

---

## Quick Reference

### Your Environment Variables

All variables are in `NETLIFY_ENV_SETUP.md` - just copy and paste!

**Critical Variables** (must update with your site name):
- `NEXTAUTH_URL`
- `MPESA_CALLBACK_URL`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_API_URL`

**TODO Variables** (update after deployment):
- `STRIPE_WEBHOOK_SECRET` - Get from Stripe after creating webhook
- `MAILGUN_API_KEY` - Get from Mailgun dashboard (if using email)
- `GOOGLE_ANALYTICS_ID` - Get from Google Analytics (optional)

### Useful Commands

```bash
# View site in browser
netlify open:site

# View Netlify dashboard
netlify open:admin

# View logs
netlify logs

# View environment variables
netlify env:list

# Deploy
netlify deploy --prod

# Link to existing site
netlify link
```

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to Netlify dashboard → **Deploys** tab
2. Click on failed deployment
3. View logs for errors

**Common fixes:**
- Clear cache: `netlify build --clear-cache`
- Verify Node version is 18
- Check for missing dependencies

### Environment Variables Not Working

1. Verify all variables are set in Netlify dashboard
2. Check for typos in variable names
3. Redeploy after adding variables
4. Variables starting with `NEXT_PUBLIC_` are exposed to browser

### Images Not Loading

1. Verify images are in `public/images/` directory
2. Check image paths in code (case-sensitive!)
3. Ensure images are committed to git
4. Check browser console for 404 errors

### API Routes Not Working

1. Check function logs: Netlify dashboard → **Functions** tab
2. Verify environment variables are set
3. Check for errors in function code
4. Test API endpoint directly: `https://YOUR-SITE-NAME.netlify.app/api/health`

---

## Need Help?

- 📖 **Full Guide**: See `NETLIFY_SETUP.md`
- ✅ **Checklist**: See `NETLIFY_DEPLOY_CHECKLIST.md`
- 🔧 **Environment Variables**: See `NETLIFY_ENV_SETUP.md`
- 💬 **Netlify Support**: https://answers.netlify.com
- 📚 **Netlify Docs**: https://docs.netlify.com

---

## Success! 🎉

Your site should now be live at: `https://YOUR-SITE-NAME.netlify.app`

**Next steps:**
1. Share the URL with your team
2. Test all functionality
3. Configure custom domain (optional)
4. Set up monitoring and analytics
5. Celebrate! 🥳

---

**Last Updated**: 2025-11-10
**Status**: Ready for deployment
