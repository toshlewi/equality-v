# Deployment Preparation Checklist

This checklist ensures the app is ready for production deployment before configuring integrations.

## ✅ Pre-Deployment Checks

### 1. Build & Type Safety
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run build` - Build succeeds without errors
- [ ] Test production build locally: `npm run build && npm run start`

### 2. Environment Variables
- [ ] All required env vars documented in `.env.example`
- [ ] `.env.local` exists with all required variables (for local testing)
- [ ] Production environment variables configured in Vercel/hosting platform
- [ ] No sensitive keys committed to git (verify `.gitignore` includes `.env*`)

### 3. Critical Environment Variables Required
- [ ] `MONGODB_URI` - Production database connection string
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `NEXTAUTH_URL` - Production URL (e.g., `https://equalityvanguard.org`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For client-side Stripe.js
- [ ] `STRIPE_SECRET_KEY` - Server-side Stripe operations
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- [ ] `MAILGUN_API_KEY` - Email sending
- [ ] `MAILGUN_DOMAIN` - Verified Mailgun domain
- [ ] `MAILGUN_FROM_EMAIL` - Sender email address
- [ ] `ADMIN_EMAIL` - Admin notification recipient

### 4. Security
- [ ] CSP headers configured in `next.config.ts`
- [ ] Security headers enabled (X-Frame-Options, etc.)
- [ ] reCAPTCHA keys configured (if using forms)
- [ ] Rate limiting middleware active
- [ ] Webhook signature verification implemented (Stripe, M-Pesa)

### 5. Database
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database indexes created (run `npm run test:indexes`)
- [ ] Connection tested (`npm run test:db`)
- [ ] Backup strategy configured

### 6. File Storage
- [ ] R2/S3 bucket created and configured
- [ ] Storage credentials in environment variables
- [ ] Upload functionality tested

### 7. API Routes
- [ ] All API routes have proper error handling
- [ ] Authentication checks in place for admin routes
- [ ] Webhook routes are publicly accessible but secured
- [ ] CORS configured if needed

### 8. Frontend
- [ ] All pages load without errors
- [ ] Forms submit correctly
- [ ] Client-side validation working
- [ ] reCAPTCHA loading on forms

### 9. Deployment Configuration
- [ ] `vercel.json` configured correctly
- [ ] GitHub Actions workflows working (if using CI/CD)
- [ ] Build command: `npm run build` (without --turbopack for production)
- [ ] Node version specified (18+)

### 10. Monitoring & Logging
- [ ] Error tracking configured (Sentry, if using)
- [ ] Logging strategy in place
- [ ] Uptime monitoring set up

## 🚀 Deployment Steps

1. **Push to main branch** (triggers CI/CD if configured)
2. **Verify build succeeds** in CI/CD pipeline
3. **Deploy to staging** first (if available)
4. **Run smoke tests** on staging
5. **Deploy to production**
6. **Verify production deployment**
7. **Monitor for errors** in first 24 hours

## 📝 Post-Deployment

- [ ] Verify all integrations working (payments, emails, etc.)
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check email delivery
- [ ] Verify webhook endpoints receiving events

## ⚠️ Common Issues

- **Build fails**: Check for TypeScript errors, missing dependencies
- **Env vars not loading**: Ensure they're set in Vercel project settings
- **Webhooks not working**: Verify webhook URLs are publicly accessible
- **Email not sending**: Check Mailgun domain verification and API key
- **Database connection fails**: Verify MongoDB URI and network access

## 🔗 Quick Commands

```bash
# Validate environment
npm run validate:env

# Test database connection
npm run test:db

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test production build locally
npm run build && npm run start
```

