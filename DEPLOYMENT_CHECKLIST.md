# Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] MongoDB Atlas connection string configured
- [ ] NextAuth secret generated and set
- [ ] Stripe API keys (test/live) configured
- [ ] M-Pesa API credentials configured
- [ ] Mailgun/SendGrid API keys configured
- [ ] Mailchimp API key and list ID configured
- [ ] AWS S3/R2 credentials configured
- [ ] Google reCAPTCHA keys configured
- [ ] All environment variables verified in Vercel

### Security
- [ ] CSP headers configured and tested
- [ ] Rate limiting enabled on API routes
- [ ] File upload security validated
- [ ] RBAC verified on all admin routes
- [ ] Input validation and sanitization checked
- [ ] Security headers verified (middleware.ts)

### Database
- [ ] MongoDB indexes created and verified
- [ ] Database connection tested
- [ ] Seed data loaded (if needed)
- [ ] Backup strategy configured

### Testing
- [ ] Build completes successfully
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Critical user flows tested:
  - [ ] Membership signup
  - [ ] Donation submission
  - [ ] Event registration
  - [ ] Contact form
  - [ ] Admin login
  - [ ] File uploads

## Staging Deployment

- [ ] Deploy to staging environment
- [ ] Verify all environment variables
- [ ] Test all critical flows
- [ ] Verify email notifications
- [ ] Check webhook endpoints
- [ ] Test payment flows (test mode)
- [ ] Performance check (Lighthouse)
- [ ] Security scan

## Production Deployment

- [ ] Switch to production API keys
- [ ] Deploy to production
- [ ] Verify DNS and SSL
- [ ] Test production flows
- [ ] Monitor error logs
- [ ] Verify analytics tracking
- [ ] Check backup system

## Post-Deployment

- [ ] Smoke tests completed
- [ ] Monitoring alerts configured
- [ ] Error tracking (Sentry) verified
- [ ] Analytics dashboard set up
- [ ] Backup verification
- [ ] Documentation updated

