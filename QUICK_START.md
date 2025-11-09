# 🚀 Quick Start Checklist

## Current Status
- ✅ Node.js v22.19.0 installed
- ✅ npm 10.9.3 installed
- 🔄 Dependencies installing... (wait for completion)

---

## Step-by-Step Setup (Run these commands in order)

### 1. Wait for Dependencies Installation
```bash
# Currently running: npm install
# Wait for it to complete (2-5 minutes)
# You'll see: "added XXX packages" when done
```

### 2. Create Environment File
```bash
# Copy the template
cp env.example.txt .env.local

# Edit the file with your preferred editor
nano .env.local
# or
code .env.local
# or
vim .env.local
```

### 3. Minimum Required Variables

Add these to `.env.local` to start:

```env
# Database (use MongoDB Atlas free tier)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equality-vanguard

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run_this_command_to_generate: openssl rand -base64 32
ADMIN_EMAIL=admin@equalityvanguard.org
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_NAME=Admin User

# File Storage (get free Cloudflare R2 account)
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_ACCOUNT_ID=your_r2_account_id
R2_BUCKET_NAME=equality-vanguard
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Application
NODE_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and paste it as `NEXTAUTH_SECRET` value in `.env.local`

### 5. Validate Environment
```bash
npm run validate:env
```
Expected: All required variables show ✅

### 6. Test Database Connection
```bash
npm run test:db
```
Expected: ✅ Connected to MongoDB successfully

### 7. Create Admin User
```bash
npm run seed:admin
```
Expected: ✅ Admin user created successfully

### 8. Start Development Server
```bash
npm run dev
```
Expected: Server running at http://localhost:3000

### 9. Open Browser
```
http://localhost:3000
```

### 10. Login to Admin Panel
```
http://localhost:3000/admin/login

Email: admin@equalityvanguard.org
Password: [your ADMIN_PASSWORD]
```

---

## Quick Setup Services

### MongoDB Atlas (Free Database)
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Add to `.env.local` as `MONGODB_URI`

### Cloudflare R2 (Free File Storage)
1. Visit: https://dash.cloudflare.com/
2. Go to R2 → Create bucket
3. Create API token
4. Add credentials to `.env.local`

---

## Troubleshooting

### If npm install fails:
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### If port 3000 is busy:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### If MongoDB connection fails:
- Check connection string format
- Verify username/password
- Add IP whitelist: 0.0.0.0/0 (for testing)

---

## Optional: Add Payment & Email (Later)

After basic setup works, add these for full functionality:

### Stripe (Payments)
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
Get from: https://dashboard.stripe.com/test/apikeys

### Mailgun (Emails)
```env
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@equalityvanguard.org
```
Get from: https://app.mailgun.com

---

## Files Created for You

1. ✅ `env.example.txt` - Environment variables template
2. ✅ `SETUP_GUIDE.md` - Detailed setup instructions
3. ✅ `QUICK_START.md` - This checklist

---

## Next Commands to Run

```bash
# 1. Check if npm install finished
npm list --depth=0

# 2. Create .env.local
cp env.example.txt .env.local

# 3. Edit .env.local with your values
nano .env.local

# 4. Validate environment
npm run validate:env

# 5. Test database
npm run test:db

# 6. Seed admin
npm run seed:admin

# 7. Start server
npm run dev
```

---

## Need Help?

- 📖 Read `SETUP_GUIDE.md` for detailed instructions
- 🐛 Read `DEBUGGING_ASSESSMENT.md` for troubleshooting
- 🔧 Run `npm run verify:integrations` to test all services
- 💬 Check console output for specific error messages

---

## Estimated Time

- Dependencies installation: 2-5 minutes ⏱️
- MongoDB setup: 5-10 minutes ⏱️
- R2 storage setup: 5-10 minutes ⏱️
- Environment configuration: 5 minutes ⏱️
- **Total: 20-30 minutes** to get running locally

---

## Success Indicators

✅ `npm install` completes without errors
✅ `.env.local` file exists with all required variables
✅ `npm run validate:env` shows all required vars as "Set"
✅ `npm run test:db` connects successfully
✅ `npm run seed:admin` creates admin user
✅ `npm run dev` starts server on port 3000
✅ Browser opens http://localhost:3000
✅ Can login to http://localhost:3000/admin/login

---

**You're currently on step 1 - waiting for npm install to complete!**
