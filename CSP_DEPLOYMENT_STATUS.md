# CSP Deployment Status & Troubleshooting

## Current Issue
Vercel deployment is still serving **OLD CSP configuration** despite multiple commits with fixes.

### Evidence
**Deployed CSP (from curl):**
```
connect-src 'self' ... https://www.google.com/recaptcha ...
frame-src 'self' ... https://www.google.com/recaptcha ...
```

**Local Code (correct):**
```
connect-src 'self' ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
frame-src 'self' ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
```

## Root Cause Analysis

### Possible Causes:
1. **Vercel Build Cache** - Middleware not being rebuilt
2. **GitHub Actions Not Running** - Secrets might be missing (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
3. **Vercel Git Integration** - Direct Git integration might be deploying but caching
4. **Edge Function Cache** - Middleware runs on Edge, might have aggressive caching

## Commits Made (Last 20 mins)
1. `8f8a717` - Optimize CSP: Remove wildcard HTTPS, keep specific reCAPTCHA domains (20:51)
2. `0ba0e07` - Force redeploy: Trigger new build for CSP fix (21:07)
3. `[latest]` - CSP Fix: Explicit reCAPTCHA v2 domains (21:08)

## Immediate Actions Needed

### Option 1: Check Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Find the `equality-v` project
3. Check **Deployments** tab
4. Look for:
   - Are deployments running?
   - Are they failing?
   - Is there a "Skipped" status?
5. If deployment succeeded, check the **Build Logs** for middleware compilation

### Option 2: Manual Vercel CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy with force flag
vercel --prod --force
```

### Option 3: Clear Vercel Cache
In Vercel Dashboard:
1. Project Settings → General
2. Scroll to "Build & Development Settings"
3. Enable "Clear Build Cache" for next deployment
4. Trigger new deployment

### Option 4: Check GitHub Actions
1. Go to https://github.com/cissybosibori/equality-v/actions
2. Check if workflows are running
3. If failing, check if these secrets are set:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## What the CSP Fix Does

### Before (Broken):
- `connect-src` only allowed `https://www.google.com/recaptcha`
- reCAPTCHA tries to connect to `https://www.google.com/recaptcha/api2/clr?k=...`
- **BLOCKED** because `/api2/clr` path not in allowed pattern

### After (Fixed):
- `connect-src` allows `https://www.google.com` (all paths)
- `connect-src` allows `https://www.gstatic.com` (for reCAPTCHA assets)
- `connect-src` allows `https://www.recaptcha.net` (fallback domain)
- `frame-src` allows same domains for iframe embedding
- **RESULT**: reCAPTCHA works, donations succeed

## Verification Command
Once deployed, run:
```bash
curl -I https://equality-v-4j4t.vercel.app 2>&1 | grep "content-security-policy"
```

Look for:
```
connect-src 'self' ... https://www.google.com https://www.gstatic.com https://www.recaptcha.net ...
```

## Timeline
- 20:35 - Initial CSP fix committed
- 20:51 - Optimized CSP committed
- 21:07 - Force redeploy trigger
- 21:08 - Explicit comment added to middleware
- **Still showing old CSP as of 21:08**

## Next Steps
1. **Check Vercel Dashboard** for deployment status
2. If deployments are succeeding but CSP not updating → **Clear build cache**
3. If deployments aren't running → **Check GitHub Actions secrets**
4. If all else fails → **Manual Vercel CLI deployment**
