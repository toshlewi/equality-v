# Equality Vanguard Deployment Guide

This guide covers the complete deployment process for the Equality Vanguard website.

## Prerequisites

### Required Accounts
- [Vercel](https://vercel.com) - Hosting and deployment
- [MongoDB Atlas](https://mongodb.com/atlas) - Database
- [DigitalOcean Spaces](https://digitalocean.com/products/spaces) - File storage
- [Stripe](https://stripe.com) - Payment processing
- [M-Pesa Daraja API](https://developer.safaricom.co.ke) - Mobile payments
- [Mailgun](https://mailgun.com) - Email service
- [Mailchimp](https://mailchimp.com) - Newsletter management
- [Google Analytics](https://analytics.google.com) - Analytics
- [Sentry](https://sentry.io) - Error tracking

### Required Tools
- Node.js 18+
- npm or yarn
- Git
- Vercel CLI (optional)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/equality-vanguard.git
cd equality-vanguard
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equality-vanguard

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters

# Admin User
ADMIN_EMAIL=admin@equalityvanguard.org
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_NAME=System Administrator

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=production

# Email
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.equalityvanguard.org
MAILGUN_FROM_EMAIL=noreply@equalityvanguard.org
MAILGUN_FROM_NAME=Equality Vanguard

# Mailchimp
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_LIST_ID=your_mailchimp_list_id
MAILCHIMP_SERVER_PREFIX=us1

# File Storage
DO_SPACES_KEY=your_digitalocean_spaces_key
DO_SPACES_SECRET=your_digitalocean_spaces_secret
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=equality-vanguard-uploads
DO_SPACES_REGION=nyc3

# Security
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Redis
REDIS_URL=redis://username:password@host:port

# Application
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NODE_ENV=production
```

## Database Setup

### 1. MongoDB Atlas
1. Create a new cluster on MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist your IP addresses
4. Get the connection string
5. Update `MONGODB_URI` in environment variables

### 2. Database Indexes
The application will automatically create indexes on first run, but you can also run:
```bash
npm run seed:admin
```

## File Storage Setup

### 1. DigitalOcean Spaces
1. Create a new Space on DigitalOcean
2. Generate API keys
3. Configure CORS settings
4. Update environment variables

### 2. CDN Configuration
1. Enable CDN on your Space
2. Configure custom domain (optional)
3. Set up cache rules

## Payment Setup

### 1. Stripe
1. Create a Stripe account
2. Get API keys from dashboard
3. Set up webhook endpoints:
   - `https://your-domain.com/api/webhooks/stripe`
4. Configure webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

### 2. M-Pesa
1. Register for M-Pesa Daraja API
2. Get consumer key and secret
3. Configure callback URLs
4. Test with sandbox environment first

## Email Setup

### 1. Mailgun
1. Create a Mailgun account
2. Add and verify your domain
3. Get API key and domain
4. Configure DNS records

### 2. Mailchimp
1. Create a Mailchimp account
2. Create an audience
3. Get API key and list ID
4. Configure audience settings

## Deployment

### 1. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 2. Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables in Vercel
Add all environment variables from `.env.local` to Vercel dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add each variable with appropriate environment (Production, Preview, Development)

## Post-Deployment Setup

### 1. Create Admin User
```bash
npm run seed:admin
```

### 2. Configure Webhooks
- Stripe: `https://your-domain.com/api/webhooks/stripe`
- M-Pesa: `https://your-domain.com/api/webhooks/mpesa`

### 3. Test All Systems
1. Test user registration and login
2. Test payment processing
3. Test email sending
4. Test file uploads
5. Test admin dashboard

### 4. Configure Monitoring
1. Set up Sentry error tracking
2. Configure Google Analytics
3. Set up uptime monitoring
4. Configure log aggregation

## Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] reCAPTCHA is configured
- [ ] Database access is restricted
- [ ] File uploads are secured
- [ ] Payment data is encrypted
- [ ] Admin access is protected
- [ ] Regular backups are configured

## Monitoring and Maintenance

### 1. Regular Tasks
- Monitor error logs
- Check payment processing
- Review user registrations
- Update dependencies
- Backup database

### 2. Performance Monitoring
- Monitor page load times
- Check API response times
- Monitor database performance
- Track user engagement

### 3. Security Monitoring
- Monitor failed login attempts
- Check for suspicious activity
- Review access logs
- Update security patches

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check MongoDB Atlas connection string
   - Verify IP whitelist
   - Check database user permissions

2. **Payment Issues**
   - Verify Stripe/M-Pesa credentials
   - Check webhook configuration
   - Test with sandbox environment

3. **Email Issues**
   - Check Mailgun configuration
   - Verify domain settings
   - Check DNS records

4. **File Upload Issues**
   - Check DigitalOcean Spaces configuration
   - Verify CORS settings
   - Check file size limits

### Support
For technical support, contact the development team or check the project documentation.

## Backup and Recovery

### 1. Database Backups
- MongoDB Atlas provides automatic backups
- Configure backup retention policy
- Test restore procedures

### 2. File Backups
- DigitalOcean Spaces provides versioning
- Configure cross-region replication
- Regular backup verification

### 3. Code Backups
- Git repository serves as code backup
- Tag releases for easy rollback
- Document deployment procedures

## Scaling Considerations

### 1. Database Scaling
- Monitor database performance
- Consider read replicas
- Implement connection pooling

### 2. Application Scaling
- Vercel handles automatic scaling
- Monitor function execution times
- Optimize database queries

### 3. File Storage Scaling
- Monitor storage usage
- Implement CDN for better performance
- Consider archiving old files

This deployment guide should help you successfully deploy and maintain the Equality Vanguard website. For additional support, refer to the individual service documentation or contact the development team.
