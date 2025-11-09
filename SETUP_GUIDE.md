# Equality Vanguard - Quick Setup Guide

## Prerequisites ✅

You already have:
- ✅ Node.js v22.19.0
- ✅ npm 10.9.3

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15.5.4
- React 19.1.0
- MongoDB/Mongoose
- Stripe SDK
- Mailgun
- Mailchimp
- And 90+ other dependencies

**Expected time:** 2-5 minutes depending on your internet connection

---

## Step 2: Create Environment File

### Option A: Manual Setup (Recommended for first-time setup)

1. **Copy the template:**
   ```bash
   cp env.example.txt .env.local
   ```

2. **Edit `.env.local`** and fill in the minimum required variables:

   **REQUIRED (App won't start without these):**
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equality-vanguard
   
   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_random_32_char_string_here
   ADMIN_EMAIL=admin@equalityvanguard.org
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_NAME=Admin User
   
   # File Storage (Cloudflare R2 or AWS S3)
   R2_ACCESS_KEY_ID=your_key
   R2_SECRET_ACCESS_KEY=your_secret
   R2_ACCOUNT_ID=your_account_id
   R2_BUCKET_NAME=your_bucket
   R2_PUBLIC_URL=https://your-bucket.r2.dev
   
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   **OPTIONAL (But recommended for full functionality):**
   ```env
   # Stripe (for payments)
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Mailgun (for emails)
   MAILGUN_API_KEY=your_key
   MAILGUN_DOMAIN=mg.yourdomain.com
   MAILGUN_FROM_EMAIL=noreply@equalityvanguard.org
   MAILGUN_FROM_NAME=Equality Vanguard
   ```

### Option B: Interactive Setup (Linux/Mac)

```bash
bash scripts/setup-env-template.sh
```

### Option C: Interactive Setup (Windows PowerShell)

```powershell
.\scripts\setup-env-template.ps1
```

---

## Step 3: Generate Secrets

### Generate NEXTAUTH_SECRET:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

---

## Step 4: Set Up MongoDB Database

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (Free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `equality-vanguard`
8. Add to `.env.local` as `MONGODB_URI`

**Example:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/equality-vanguard?retryWrites=true&w=majority
```

### Option B: Local MongoDB

1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/equality-vanguard
   ```

---

## Step 5: Set Up File Storage (Cloudflare R2)

### Why R2?
- Free tier: 10GB storage
- No egress fees
- S3-compatible API
- Fast CDN

### Setup Steps:

1. Go to https://dash.cloudflare.com/
2. Sign up/login
3. Go to **R2** in the sidebar
4. Click **Create bucket**
5. Name it: `equality-vanguard-uploads`
6. Click **Manage R2 API Tokens**
7. Create API token with:
   - Permissions: Object Read & Write
   - Apply to specific buckets: Select your bucket
8. Copy the credentials:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Account ID (from R2 dashboard) → `R2_ACCOUNT_ID`
   - Bucket name → `R2_BUCKET_NAME`
9. Get public URL:
   - Go to bucket settings
   - Enable public access (if needed)
   - Copy the public URL → `R2_PUBLIC_URL`

---

## Step 6: Validate Environment Variables

```bash
npm run validate:env
```

**Expected output:**
```
✅ MONGODB_URI: Set
✅ NEXTAUTH_URL: Set
✅ NEXTAUTH_SECRET: Set
✅ R2_ACCESS_KEY_ID: Set
...
⚠️  STRIPE_SECRET_KEY: Not set (optional)
⚠️  MAILGUN_API_KEY: Not set (optional)
```

All required variables should show ✅. Optional variables can show ⚠️.

---

## Step 7: Test Database Connection

```bash
npm run test:db
```

**Expected output:**
```
🔗 Testing MongoDB connection...
✅ Connected to MongoDB successfully
✅ Database: equality-vanguard
✅ Connection state: connected
```

---

## Step 8: Seed Admin User

```bash
npm run seed:admin
```

**Expected output:**
```
🌱 Seeding admin user...
✅ Admin user created successfully
   Email: admin@equalityvanguard.org
   Password: [your password from .env.local]
```

---

## Step 9: Run Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

Open http://localhost:3000 in your browser.

---

## Step 10: Access Admin Panel

1. Go to http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@equalityvanguard.org` (or your `ADMIN_EMAIL`)
   - Password: Your `ADMIN_PASSWORD` from `.env.local`

---

## Troubleshooting

### Error: "Missing required environment variables"
- Run `npm run validate:env` to see which variables are missing
- Check `.env.local` exists in the project root
- Ensure all required variables are set

### Error: "Failed to connect to MongoDB"
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for testing)
- Test connection with MongoDB Compass

### Error: "R2 credentials invalid"
- Verify all R2 credentials are correct
- Check API token has correct permissions
- Ensure bucket name matches exactly

### Error: "Port 3000 already in use"
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Error: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

---

## Optional Integrations Setup

### Stripe (Payment Processing)

1. Go to https://dashboard.stripe.com/register
2. Create account
3. Get test API keys from https://dashboard.stripe.com/test/apikeys
4. Add to `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Test: `npm run verify:integrations`

### Mailgun (Email Service)

1. Go to https://signup.mailgun.com/new/signup
2. Create account
3. Add domain or use sandbox domain
4. Get API key from https://app.mailgun.com/app/account/security/api_keys
5. Add to `.env.local`:
   ```env
   MAILGUN_API_KEY=your_key
   MAILGUN_DOMAIN=sandboxXXX.mailgun.org
   MAILGUN_FROM_EMAIL=noreply@sandboxXXX.mailgun.org
   ```
6. Test: `npm run test:email`

### Mailchimp (Email Marketing)

1. Go to https://mailchimp.com/
2. Create account
3. Create an audience/list
4. Get API key from Account → Extras → API keys
5. Get List ID from Audience → Settings → Audience name and defaults
6. Add to `.env.local`:
   ```env
   MAILCHIMP_API_KEY=your_key
   MAILCHIMP_LIST_ID=your_list_id
   MAILCHIMP_SERVER_PREFIX=us1
   ```
7. Test: `npm run test:mailchimp`

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Database
npm run test:db          # Test database connection
npm run seed:admin       # Create admin user

# Testing
npm run validate:env     # Validate environment variables
npm run verify:integrations  # Test all integrations
npm run test:email       # Test email sending
npm run test:stripe-webhook  # Test Stripe webhook
npm run test:mpesa-callback  # Test M-Pesa callback
npm run test:mailchimp   # Test Mailchimp API

# Utilities
npm run clean            # Clean build files
```

---

## Next Steps After Setup

1. ✅ Install dependencies
2. ✅ Create `.env.local`
3. ✅ Set up MongoDB
4. ✅ Set up R2 storage
5. ✅ Validate environment
6. ✅ Test database connection
7. ✅ Seed admin user
8. ✅ Run dev server
9. ✅ Access admin panel
10. 🔄 Set up optional integrations (Stripe, Mailgun, etc.)
11. 🔄 Customize content
12. 🔄 Deploy to production

---

## Getting Help

- Check `DEBUGGING_ASSESSMENT.md` for detailed debugging info
- Check `TECHNICAL_ASSESSMENT.md` for technical details
- Check `DEPLOYMENT.md` for deployment instructions
- Run `npm run verify:integrations` to diagnose issues

---

## Minimum Setup to Run Locally

If you just want to see the app running without full functionality:

```env
# .env.local (minimum)
MONGODB_URI=mongodb://localhost:27017/equality-vanguard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_32_character_string_here_123456
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
R2_ACCESS_KEY_ID=dummy
R2_SECRET_ACCESS_KEY=dummy
R2_ACCOUNT_ID=dummy
R2_BUCKET_NAME=dummy
R2_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note:** File uploads won't work with dummy R2 credentials, but the app will start.
