# Netlify Deployment Setup

## Quick Start

### 1. Deploy to Netlify

**Option A: Via Netlify Dashboard (Recommended)**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select repository: `cissybosibori/equality-v`
5. Select branch: `integrations`
6. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
7. Click "Deploy site"

**Option B: Via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd /home/toshlewi/equality-v/equality-v
netlify init
netlify deploy --prod
```

### 2. Configure Environment Variables

Go to Site settings → Environment variables and add all variables.

**📋 See `NETLIFY_ENV_SETUP.md` for the complete list of environment variables with actual values.**

Key variables to update with your Netlify site name:
- `NEXTAUTH_URL` → `https://YOUR-SITE-NAME.netlify.app`
- `MPESA_CALLBACK_URL` → `https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa`
- `NEXT_PUBLIC_URL` → `https://YOUR-SITE-NAME.netlify.app`
- `NEXT_PUBLIC_API_URL` → `https://YOUR-SITE-NAME.netlify.app/api`

**Quick Reference** (see NETLIFY_ENV_SETUP.md for full details):
- Database: `MONGODB_URI`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- M-Pesa: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`
- Email: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`
- Mailchimp: `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_SERVER_PREFIX`
- R2 Storage: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`
- reCAPTCHA: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
- Environment: `NODE_ENV=production`

### 3. Update Webhook URLs

#### Stripe Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL: `https://your-site-name.netlify.app/api/webhooks/stripe`
3. Copy webhook secret and update `STRIPE_WEBHOOK_SECRET`

#### M-Pesa Callbacks
1. Update M-Pesa callback URL in Safaricom portal
2. Set to: `https://your-site-name.netlify.app/api/webhooks/mpesa`

### 4. Test Deployment

After deployment:

1. **Visit your site**: `https://your-site-name.netlify.app`
2. **Test pages load** correctly
3. **Test donation form** (reCAPTCHA is disabled for testing)
4. **Test Stripe payment** with card: `4242 4242 4242 4242`
5. **Check images load** (team3.JPG, team4.JPG, team6.JPG)

## Configuration Files

- `netlify.toml` - Netlify build configuration
- `package.json` - Dependencies and build scripts
- `.gitignore` - Excludes build artifacts and secrets

## Features

✅ Automatic deployments on git push
✅ Deploy previews for pull requests
✅ HTTPS enabled by default
✅ Global CDN
✅ Environment variables management
✅ Function logs and monitoring

## Troubleshooting

### Build Fails

Check build logs in Netlify dashboard. Common issues:
- Missing environment variables
- Node version mismatch
- Dependency installation errors

**Solution**: Clear cache and retry
```bash
netlify build --clear-cache
```

### Images Not Loading

Verify images are in `public/images/` directory and committed to git.

### API Routes Not Working

Check function logs in Netlify dashboard → Functions tab.

### Environment Variables Not Working

- Verify all variables are set in Netlify dashboard
- Redeploy after adding/updating variables

## Monitoring

- **Build logs**: Deploys tab → Click deployment → View logs
- **Function logs**: Functions tab → Select function → View logs
- **Analytics**: Analytics tab (basic on free tier)

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to custom domain

## Support

- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/next-js/
- Community: https://answers.netlify.com
