# 🚀 Install and Run - Simple Steps

## Problem: `next: not found`
**Cause:** Dependencies are not installed yet.

---

## Solution: Install Dependencies First

### Step 1: Install All Dependencies (REQUIRED)

Run this command in your terminal:

```bash
npm install
```

**What this does:**
- Downloads and installs 110+ packages
- Creates `node_modules` folder with all dependencies
- Takes 2-5 minutes depending on internet speed

**Wait for it to complete!** You'll see:
```
added 1234 packages, and audited 1235 packages in 2m
```

---

### Step 2: Verify Installation

Check if Next.js was installed:

```bash
ls node_modules/.bin/next
```

**Expected output:** `node_modules/.bin/next` (file exists)

Or check all installed packages:

```bash
npm list --depth=0
```

---

### Step 3: Now You Can Run the App

After `npm install` completes successfully:

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

---

## Complete Installation Steps

### 1️⃣ Install Dependencies (YOU ARE HERE)
```bash
npm install
```
⏱️ **Wait 2-5 minutes for this to complete**

### 2️⃣ Create Environment File
```bash
cp env.example.txt .env.local
nano .env.local  # Edit with your values
```

### 3️⃣ Add Minimum Required Variables to .env.local

```env
MONGODB_URI=mongodb://localhost:27017/equality-vanguard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_char_secret_here_generate_with_openssl_rand_base64
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

### 4️⃣ Generate Secret
```bash
openssl rand -base64 32
```
Copy output and replace `your_32_char_secret_here...` in `.env.local`

### 5️⃣ Validate Environment
```bash
npm run validate:env
```

### 6️⃣ Test Database (if using MongoDB)
```bash
npm run test:db
```

### 7️⃣ Create Admin User
```bash
npm run seed:admin
```

### 8️⃣ Start Development Server
```bash
npm run dev
```

### 9️⃣ Open Browser
```
http://localhost:3000
```

---

## Troubleshooting npm install

### If npm install fails with errors:

**Option 1: Clear cache and retry**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Option 2: Use legacy peer deps (if dependency conflicts)**
```bash
npm install --legacy-peer-deps
```

**Option 3: Check Node.js version**
```bash
node --version  # Should be v18+ (you have v22.19.0 ✅)
npm --version   # Should be v8+ (you have 10.9.3 ✅)
```

**Option 4: Check disk space**
```bash
df -h .
```
Need at least 1GB free space for node_modules

**Option 5: Check network connection**
```bash
ping registry.npmjs.org
```

---

## Quick Test After Installation

```bash
# 1. Check if Next.js is installed
npx next --version

# 2. Check if all packages are installed
npm list --depth=0 | grep -E "next|react|mongoose"

# Expected output:
# ├── next@15.5.4
# ├── react@19.1.0
# ├── mongoose@8.19.1
```

---

## Current Status

- ✅ Node.js v22.19.0 installed
- ✅ npm 10.9.3 installed
- ❌ Dependencies NOT installed yet
- ❌ Cannot run `npm run dev` until dependencies are installed

**Next action:** Wait for `npm install` to complete (currently running)

---

## What npm install Downloads

The project needs these main packages:
- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **Mongoose 8.19.1** - MongoDB ODM
- **Stripe** - Payment processing
- **Mailgun** - Email service
- **Mailchimp** - Email marketing
- **90+ other packages** - Various utilities

**Total size:** ~500MB in node_modules folder

---

## After Installation Success

You'll see something like:
```
added 1234 packages, and audited 1235 packages in 2m

123 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Then you can run:
```bash
npm run dev
```

---

## Common Errors and Fixes

### Error: `EACCES: permission denied`
```bash
sudo chown -R $USER:$USER ~/.npm
npm install
```

### Error: `ENOSPC: no space left on device`
```bash
# Free up space or use different directory
df -h
```

### Error: `network timeout`
```bash
# Increase timeout
npm install --timeout=60000
```

### Error: `peer dependency conflicts`
```bash
npm install --legacy-peer-deps
```

---

**IMPORTANT: You must complete `npm install` before running `npm run dev`**

The installation is currently running. Please wait for it to complete!
