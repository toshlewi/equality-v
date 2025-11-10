# Equality Vanguard

A Pan-African feminist collective platform built with Next.js, featuring content management, event registration, donations, memberships, and more.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun
- MongoDB Atlas account (or local MongoDB instance)
- Cloudflare R2 or AWS S3 account (for file storage)

### Environment Variables Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all required environment variables in `.env.local`:
   - **Database**: `MONGODB_URI` - MongoDB connection string
   - **Authentication**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth configuration
   - **Admin User**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` - Initial admin account
   - **File Storage**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
   - **Application**: `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_API_URL`, `NODE_ENV`

3. **Client-side variables** (must have `NEXT_PUBLIC_` prefix):
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For Stripe payments
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - For reCAPTCHA verification
   - `NEXT_PUBLIC_URL` - Public-facing URL
   - `NEXT_PUBLIC_API_URL` - Public-facing API URL

4. **Optional variables** (set as needed):
   - Payment providers: Stripe, M-Pesa
   - Email providers: Mailgun, Mailchimp
   - Google OAuth, Google Calendar
   - Analytics: Google Analytics, Sentry
   - Redis (for background jobs)
   - Instagram API (for social media integration)

5. Validate your environment:
   ```bash
   npm run validate:env
   ```

### Installation

```bash
# Install dependencies
npm install

# Seed admin user (first time setup)
npm run seed:admin

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run validate:env` - Validate environment variables
- `npm run seed:admin` - Create initial admin user
- `npm run test:db` - Test database connection
- `npm run verify:integrations` - Verify all integrations

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Run `npm run validate:env` to check for missing variables
   - Ensure all required variables are set in `.env.local`
   - Client-side variables must have `NEXT_PUBLIC_` prefix

2. **Database Connection Errors**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas IP whitelist
   - Ensure network connectivity

3. **Stripe Payments Not Working**
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set (client-side)
   - Verify `STRIPE_SECRET_KEY` is set (server-side)
   - Check Stripe API keys are for the correct environment (test/live)

4. **File Upload Errors**
   - Verify R2/S3 credentials are correct
   - Check bucket permissions
   - Ensure `R2_PUBLIC_URL` is configured

5. **Build Errors**
   - Run `npm run type-check` to find TypeScript errors
   - Run `npm run lint` to find linting errors
   - Check that all environment variables are set

### Getting Help

- Check the [DEBUGGING_ASSESSMENT.md](./DEBUGGING_ASSESSMENT.md) for detailed debugging information
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) before deploying
- See [TECHNICAL_ASSESSMENT.md](./TECHNICAL_ASSESSMENT.md) for technical details

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## Deployment

### Deploy on Netlify (Recommended)

The easiest way to deploy this Next.js app is to use [Netlify](https://www.netlify.com).

**Quick Start:**
1. See [NETLIFY_QUICK_START.md](./NETLIFY_QUICK_START.md) for step-by-step instructions
2. See [NETLIFY_ENV_SETUP.md](./NETLIFY_ENV_SETUP.md) for complete environment variables list
3. See [NETLIFY_DEPLOY_CHECKLIST.md](./NETLIFY_DEPLOY_CHECKLIST.md) for deployment checklist

**Migration from Vercel:**
- See [VERCEL_TO_NETLIFY_MIGRATION.md](./VERCEL_TO_NETLIFY_MIGRATION.md) for migration guide

### Deploy on Vercel (Alternative)

You can also deploy to [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure all environment variables in Vercel dashboard
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
