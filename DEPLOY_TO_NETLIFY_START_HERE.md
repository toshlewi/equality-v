# 🚀 Deploy to Netlify - START HERE

**Welcome!** This guide will help you deploy Equality Vanguard to Netlify in the simplest way possible.

---

## ⚡ Quick Deploy (20 minutes)

### Option 1: One-Command Deploy (Easiest)

```bash
# Run the automated deployment script
./deploy-to-netlify.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Test build locally
- ✅ Login to Netlify
- ✅ Deploy your site
- ✅ Show next steps

**Then follow the prompts!**

---

### Option 2: Manual Deploy (Dashboard)

**Step 1: Create Site (5 min)**

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → Select **`cissybosibori/equality-v`**
4. Branch: **`integrations`**
5. Build command: **`npm run build`**
6. Publish directory: **`.next`**
7. Click **"Deploy site"**

**Step 2: Add Environment Variables (10 min)**

1. Open `NETLIFY_ENV_SETUP.md` (it has all your variables!)
2. Go to Netlify: **Site settings** → **Environment variables**
3. Copy each variable from the doc
4. **Important**: Replace `YOUR-SITE-NAME` with your actual site name in these:
   - `NEXTAUTH_URL`
   - `MPESA_CALLBACK_URL`
   - `NEXT_PUBLIC_URL`
   - `NEXT_PUBLIC_API_URL`

**Step 3: Redeploy (2 min)**

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete
4. Click **"Open production deploy"**

**Step 4: Configure Webhooks (3 min)**

1. **Stripe**: Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/stripe`
   - Copy webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in Netlify
   - Redeploy

2. **M-Pesa** (if using): Update callback URL in Safaricom portal

**Done! 🎉**

---

## 📚 Documentation Quick Reference

| Document | When to Use |
|----------|-------------|
| **NETLIFY_DEPLOYMENT_SUMMARY.md** | Overview and links |
| **NETLIFY_QUICK_START.md** | Detailed quick start |
| **NETLIFY_ENV_SETUP.md** | All environment variables |
| **NETLIFY_DEPLOY_CHECKLIST.md** | Comprehensive checklist |
| **NETLIFY_SETUP.md** | Troubleshooting |

---

## ✅ Post-Deployment Testing

After deployment, test these:

```bash
# Open your site
netlify open:site

# Check these pages:
# ✓ Homepage: /
# ✓ About: /about
# ✓ Get Involved: /get-involved
# ✓ Admin: /admin (login: admin@equalityvanguard.org / Sylvia2025!)

# Test donation with Stripe test card: 4242 4242 4242 4242
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check logs
netlify logs

# Clear cache and rebuild
netlify build --clear-cache
```

### Environment Variables Not Working
1. Verify all variables are set in Netlify dashboard
2. Check for typos
3. Redeploy after adding variables

### Need Help?
- Check `NETLIFY_SETUP.md` for detailed troubleshooting
- Visit https://answers.netlify.com

---

## 🎯 Your Environment Variables

All your environment variables are in `NETLIFY_ENV_SETUP.md`.

**Key variables already configured:**
- ✅ MongoDB connection
- ✅ NextAuth secret
- ✅ Admin credentials
- ✅ Stripe keys (test mode)
- ✅ M-Pesa credentials (sandbox)
- ✅ Mailchimp API
- ✅ Cloudflare R2
- ✅ reCAPTCHA

**Variables to update with your site name:**
- ⚠️ `NEXTAUTH_URL`
- ⚠️ `MPESA_CALLBACK_URL`
- ⚠️ `NEXT_PUBLIC_URL`
- ⚠️ `NEXT_PUBLIC_API_URL`

**Variables to add after deployment:**
- ⚠️ `STRIPE_WEBHOOK_SECRET` (get from Stripe)
- ⚠️ `MAILGUN_API_KEY` (optional, for email)
- ⚠️ `GOOGLE_ANALYTICS_ID` (optional)

---

## 🚀 Ready to Deploy?

Choose your path:

**Quick & Easy:**
```bash
./deploy-to-netlify.sh
```

**Manual:**
Follow "Option 2: Manual Deploy" above

**Comprehensive:**
Read `NETLIFY_DEPLOY_CHECKLIST.md`

---

## 📞 Support

- 📖 Full docs: `NETLIFY_SETUP.md`
- 🔑 Environment variables: `NETLIFY_ENV_SETUP.md`
- ✅ Checklist: `NETLIFY_DEPLOY_CHECKLIST.md`
- 💬 Netlify Community: https://answers.netlify.com

---

## ✨ Success!

Once deployed, your site will be live at:
**`https://YOUR-SITE-NAME.netlify.app`**

Test it, share it, celebrate! 🎉

---

**Last Updated**: 2025-11-10  
**Status**: Ready for deployment
