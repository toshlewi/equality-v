# Netlify Deployment Checklist

## Pre-Deployment

- [ ] **Review Code**: Ensure all code is committed and pushed to GitHub
- [ ] **Check Branch**: Verify you're deploying from the correct branch (`integrations`)
- [ ] **Test Locally**: Run `npm run build` locally to ensure no build errors
- [ ] **Review Environment Variables**: Check `NETLIFY_ENV_SETUP.md` for all required variables

## Deployment Steps

### Step 1: Create Netlify Site

- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect to GitHub
- [ ] Select repository: `cissybosibori/equality-v`
- [ ] Select branch: `integrations`
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
- [ ] Click "Deploy site"
- [ ] **Note your site name**: `YOUR-SITE-NAME.netlify.app`

### Step 2: Configure Environment Variables

- [ ] Go to Site settings → Environment variables
- [ ] Open `NETLIFY_ENV_SETUP.md` in another window
- [ ] Add each environment variable one by one
- [ ] **Replace placeholders**:
  - [ ] `NEXTAUTH_URL` → `https://YOUR-SITE-NAME.netlify.app`
  - [ ] `MPESA_CALLBACK_URL` → `https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa`
  - [ ] `NEXT_PUBLIC_URL` → `https://YOUR-SITE-NAME.netlify.app`
  - [ ] `NEXT_PUBLIC_API_URL` → `https://YOUR-SITE-NAME.netlify.app/api`
- [ ] Verify all 40+ environment variables are added
- [ ] Click "Trigger deploy" to redeploy with new variables

### Step 3: Configure Webhooks

#### Stripe Webhook
- [ ] Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Click "Add endpoint"
- [ ] Set URL: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/stripe`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Netlify
- [ ] Redeploy site

#### M-Pesa Callback (if using production)
- [ ] Log in to Safaricom Daraja portal
- [ ] Update callback URL: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa`
- [ ] Save changes

### Step 4: Configure External Services (Optional)

#### Mailgun
- [ ] Get API key from [Mailgun Dashboard](https://app.mailgun.com)
- [ ] Update `MAILGUN_API_KEY` in Netlify
- [ ] Redeploy site

#### Google Analytics
- [ ] Get tracking ID from Google Analytics
- [ ] Update `GOOGLE_ANALYTICS_ID` in Netlify
- [ ] Redeploy site

#### Sentry (Optional)
- [ ] Get DSN from Sentry project
- [ ] Update `SENTRY_DSN` in Netlify
- [ ] Redeploy site

## Post-Deployment Testing

### Basic Functionality
- [ ] Visit homepage: `https://YOUR-SITE-NAME.netlify.app`
- [ ] Check all pages load:
  - [ ] Home `/`
  - [ ] About `/about`
  - [ ] Get Involved `/get-involved`
  - [ ] Events & News `/events-news`
  - [ ] Our Voices `/our-voices`
  - [ ] Contact `/contact`
  - [ ] Admin `/admin`

### Images & Assets
- [ ] Verify images load correctly
- [ ] Check team photos (team3.JPG, team4.JPG, team6.JPG)
- [ ] Verify logo displays
- [ ] Check favicon

### Forms & Interactions
- [ ] Test donation form
- [ ] Test contact form
- [ ] Test newsletter signup
- [ ] Verify reCAPTCHA works

### Payment Testing
- [ ] Test Stripe payment with test card: `4242 4242 4242 4242`
- [ ] Verify payment confirmation
- [ ] Check Stripe dashboard for test payment
- [ ] Test M-Pesa (sandbox mode)

### Admin Panel
- [ ] Login to admin: `/admin`
  - Email: `admin@equalityvanguard.org`
  - Password: `Sylvia2025!`
- [ ] Test admin functionality:
  - [ ] View dashboard
  - [ ] Manage events
  - [ ] Manage publications
  - [ ] View donations

### API Endpoints
- [ ] Test API routes work
- [ ] Check function logs in Netlify dashboard
- [ ] Verify no errors in logs

### Performance & SEO
- [ ] Run Lighthouse audit
- [ ] Check page load speed
- [ ] Verify meta tags
- [ ] Test mobile responsiveness

## Monitoring Setup

- [ ] Set up build notifications (Site settings → Build & deploy → Deploy notifications)
- [ ] Enable form notifications (if using Netlify Forms)
- [ ] Set up uptime monitoring (optional: UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)

## Custom Domain (Optional)

- [ ] Go to Site settings → Domain management
- [ ] Click "Add custom domain"
- [ ] Enter domain: `equalityvanguard.org`
- [ ] Follow DNS configuration instructions
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Update environment variables:
  - [ ] `NEXTAUTH_URL` → `https://equalityvanguard.org`
  - [ ] `NEXT_PUBLIC_URL` → `https://equalityvanguard.org`
  - [ ] `NEXT_PUBLIC_API_URL` → `https://equalityvanguard.org/api`
  - [ ] `MPESA_CALLBACK_URL` → `https://equalityvanguard.org/api/webhooks/mpesa`
- [ ] Update Stripe webhook URL
- [ ] Redeploy site

## Security Checklist

- [ ] Verify HTTPS is enabled (automatic on Netlify)
- [ ] Check security headers in `netlify.toml`
- [ ] Ensure no sensitive data in client-side code
- [ ] Verify environment variables are not exposed
- [ ] Test CORS settings
- [ ] Review function permissions

## Documentation

- [ ] Update README with new deployment URL
- [ ] Document any custom configuration
- [ ] Create runbook for common issues
- [ ] Share credentials with team (securely)

## Rollback Plan

If deployment fails:
- [ ] Check build logs in Netlify dashboard
- [ ] Verify environment variables are correct
- [ ] Clear cache and retry: `netlify build --clear-cache`
- [ ] Rollback to previous deployment (Deploys → Click previous deploy → Publish deploy)

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Build Logs**: Deploys tab → Click deployment → View logs
- **Function Logs**: Functions tab → Select function → View logs
- **Community**: https://answers.netlify.com

---

## Quick Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to site
netlify link

# Deploy
netlify deploy --prod

# View logs
netlify logs

# Open site
netlify open:site

# Open admin
netlify open:admin
```

---

## Troubleshooting

### Build Fails
1. Check build logs
2. Verify Node version (should be 18)
3. Clear cache: `netlify build --clear-cache`
4. Check for missing dependencies

### Environment Variables Not Working
1. Verify all variables are set
2. Check for typos in variable names
3. Redeploy after adding variables
4. Check if `NEXT_PUBLIC_` prefix is needed

### Images Not Loading
1. Verify images are in `public/` directory
2. Check image paths in code
3. Ensure images are committed to git
4. Check file extensions match (case-sensitive)

### API Routes Not Working
1. Check function logs
2. Verify API route files are in `src/app/api/`
3. Check for errors in function code
4. Verify environment variables are set

### Payment Issues
1. Verify Stripe keys are correct
2. Check webhook is configured
3. Test with Stripe test cards
4. Check Stripe dashboard for errors

---

**Last Updated**: 2025-11-10
**Deployment Status**: Ready for deployment
