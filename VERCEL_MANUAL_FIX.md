# VERCEL MANUAL CSP FIX - STEP BY STEP

## THE PROBLEM
Vercel is deploying OLD middleware code with restrictive CSP that blocks reCAPTCHA.

**Current (BROKEN) deployed CSP:**
```
connect-src ... https://www.google.com/recaptcha ...
frame-src ... https://www.google.com/recaptcha ...
```

**What we NEED:**
```
connect-src ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
frame-src ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
```

---

## SOLUTION 1: Force Redeploy with Cache Clear (EASIEST)

### Step 1: Go to Vercel Dashboard
https://vercel.com/silvyas-projects/equality-v-4j4t/deployments

### Step 2: Find Latest Deployment
- Should show commit: `[CRITICAL] Fix CSP middleware - reCAPTCHA blocked...`
- If not visible yet, wait 1-2 minutes for Git sync

### Step 3: Redeploy WITHOUT Cache
1. Click the **three dots (⋮)** on the right side of the deployment
2. Click **"Redeploy"**
3. **IMPORTANT:** In the modal that appears:
   - **UNCHECK** "Use existing Build Cache" (if checked)
   - OR **CHECK** "Clear cache and redeploy" (if available)
4. Click **"Redeploy"** button

### Step 4: Wait for Build (3-5 minutes)
- Watch the deployment progress
- Look for "Building" → "Deploying" → "Ready"

### Step 5: Verify Fix
Run this command:
```bash
curl -I https://equality-v-4j4t.vercel.app 2>&1 | grep "content-security-policy"
```

**Look for:**
```
connect-src 'self' ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
```

**NOT:**
```
connect-src 'self' ... https://www.google.com/recaptcha ...
```

---

## SOLUTION 2: Add Team Member for CLI Access

If you want to use `vercel --prod --force`:

### Step 1: Add Git Author to Vercel Team
1. Go to: https://vercel.com/teams/silvyas-projects/settings/members
2. Click **"Invite Member"**
3. Enter email: `adelewigitz@gmail.com`
4. Select role: **Developer** or **Admin**
5. Send invitation
6. Have them accept the invite

### Step 2: Deploy via CLI
```bash
cd ~/equality-v/equality-v
vercel --prod --force
```

---

## SOLUTION 3: Environment Variable Trick

Forces complete rebuild by changing environment:

### Step 1: Add Dummy Environment Variable
1. Go to: https://vercel.com/silvyas-projects/equality-v-4j4t/settings/environment-variables
2. Click **"Add New"**
3. Fill in:
   - **Key:** `FORCE_REBUILD_CSP`
   - **Value:** `2025-11-09-22-00`
   - **Environment:** Check **Production**
4. Click **"Save"**

### Step 2: Trigger Redeploy
1. Go to: https://vercel.com/silvyas-projects/equality-v-4j4t/deployments
2. Click **"Redeploy"** on latest deployment
3. This will rebuild with new env var, forcing middleware recompilation

### Step 3: Remove Dummy Variable (After Success)
1. Go back to Environment Variables
2. Delete `FORCE_REBUILD_CSP`
3. No need to redeploy after deletion

---

## SOLUTION 4: Check GitHub Actions (If Nothing Works)

The `.github/workflows/deploy.yml` should auto-deploy, but might be failing.

### Step 1: Check Workflow Runs
1. Go to: https://github.com/cissybosibori/equality-v/actions
2. Look for recent workflow runs
3. Check if they're:
   - ✅ **Succeeding** - Good, but CSP still wrong = cache issue
   - ❌ **Failing** - Check error logs
   - ⚪ **Not running** - Secrets missing

### Step 2: Verify GitHub Secrets (If Not Running)
1. Go to: https://github.com/cissybosibori/equality-v/settings/secrets/actions
2. Verify these secrets exist:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. If missing, get them from Vercel:
   - Token: https://vercel.com/account/tokens
   - Org ID & Project ID: Run `vercel link` in project directory

---

## VERIFICATION CHECKLIST

After redeployment, test these:

### 1. Check CSP Header
```bash
curl -I https://equality-v-4j4t.vercel.app 2>&1 | grep "content-security-policy"
```

Should include:
- ✅ `https://www.google.com` (not `/recaptcha`)
- ✅ `https://www.gstatic.com`
- ✅ `https://www.recaptcha.net`

### 2. Test reCAPTCHA on Site
1. Go to: https://equality-v-4j4t.vercel.app/get-involved
2. Scroll to donation form
3. Open browser console (F12)
4. Fill form and submit
5. Check console for errors:
   - ❌ **Before fix:** "violates Content Security Policy"
   - ✅ **After fix:** No CSP errors, reCAPTCHA works

### 3. Test Donation Flow
1. Fill donation form
2. Complete reCAPTCHA challenge
3. Submit form
4. Should see success message (or Stripe payment page)
5. **NOT:** "reCAPTCHA verification failed"

---

## TIMELINE

- **20:35** - First CSP fix committed
- **20:51** - Optimized CSP committed  
- **21:07** - Force redeploy trigger
- **21:08** - Explicit comment added
- **22:02** - Still showing old CSP ❌
- **22:03** - Critical fix with variable rename + backup
- **NOW** - Waiting for Vercel to deploy...

---

## IF STILL NOT WORKING

Contact Vercel support with this info:

**Subject:** Middleware not updating despite multiple deployments

**Message:**
```
Project: equality-v-4j4t
Issue: src/middleware.ts changes not being deployed
Evidence: CSP header still shows old configuration after 5+ commits
Latest commit: [CRITICAL] Fix CSP middleware - reCAPTCHA blocked...
Expected: connect-src with https://www.google.com
Actual: connect-src with https://www.google.com/recaptcha

Request: Please clear all build caches and force complete rebuild
```

Support: https://vercel.com/help
