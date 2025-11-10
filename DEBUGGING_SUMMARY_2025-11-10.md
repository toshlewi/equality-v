# Debugging Summary - 2025-11-10

## Issues Reported

### 1. Missing Team Images (404 Errors)
- **Error**: `GET https://equality-v-4j4t.vercel.app/images/team3.JPG 404 (Not Found)`
- **Files affected**: `team3.JPG`, `team4.JPG`, `team6.JPG`

### 2. reCAPTCHA CSP Violations
- **Error**: Multiple CSP violations blocking reCAPTCHA functionality
  - Frame-src blocking `https://www.google.com/`
  - Connect-src blocking `https://www.google.com/recaptcha/api2/clr`

### 3. Donation Form Failure
- **Error**: `POST https://equality-v-4j4t.vercel.app/api/donations 400 (Bad Request)`
- **Message**: "reCAPTCHA verification failed"

## Root Causes

### Team Images
- **Status**: ✅ Images exist in repository
- **Location**: `/public/images/team3.JPG`, `team4.JPG`, `team6.JPG`
- **Committed**: Yes (commit `321a124`)
- **Issue**: Deployment cache or build not including latest files

### reCAPTCHA CSP Issues
- **Root Cause**: Overly restrictive CSP policy
- **Problems**:
  1. `frame-src` was set to `https://www.google.com/recaptcha` but reCAPTCHA tries to frame `https://www.google.com/` (without path)
  2. CSP path matching is strict - paths in CSP directives don't work as prefixes
  3. Missing `www.gstatic.com` in `style-src` for reCAPTCHA styling

## Fixes Applied

### 1. Updated CSP Policy in `src/middleware.ts`

**Changes**:
- ✅ Added `https://www.gstatic.com` to `style-src` for reCAPTCHA styling
- ✅ Ensured `frame-src` allows full `https://www.google.com` domain (not path-restricted)
- ✅ Confirmed `connect-src` allows `https://www.google.com` for `/recaptcha/api2/clr` endpoint
- ✅ Updated comments to clarify reCAPTCHA v3 requirements

**Final CSP Configuration**:
```javascript
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://api.stripe.com https://api.mailgun.net https://api.mpesa.vm.co.ke https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://vercel.live",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ');
```

### 2. Commits Pushed
- `15f7078`: "fix: Update CSP to properly allow reCAPTCHA v3 /api2/clr endpoint"
- `2292f1b`: "fix: Add www.gstatic.com to style-src for reCAPTCHA styling support"
- `1a41ced`: "fix: Add recaptcha.google.com to CSP script-src and connect-src"

## Expected Results After Deployment

1. **reCAPTCHA**: Should load and function correctly without CSP violations
2. **Team Images**: Should be accessible at `/images/team3.JPG`, `/images/team4.JPG`, `/images/team6.JPG`
3. **Donation Form**: Should successfully submit with reCAPTCHA verification

## Verification Steps

After Vercel deployment completes:

1. **Check reCAPTCHA**:
   - Open browser console on donation form
   - Verify no CSP violations for Google domains
   - Verify reCAPTCHA badge appears

2. **Check Team Images**:
   - Navigate to Get Involved page
   - Verify all team images load correctly
   - Check browser network tab for 200 status on image requests

3. **Test Donation Form**:
   - Fill out donation form
   - Submit and verify no "reCAPTCHA verification failed" error
   - Confirm successful submission

## Additional Notes

- **reCAPTCHA Version**: Using reCAPTCHA v3 (invisible)
- **Site Key**: `6LenVQcsAAAAALBFGKdOYCMUargvkgxfdFEceUi7`
- **Implementation**: Client-side script loaded via `https://www.google.com/recaptcha/api.js?render=${siteKey}`
- **Verification**: Server-side via `/lib/recaptcha.ts` using `https://www.google.com/recaptcha/api/siteverify`

## Files Modified
- `src/middleware.ts` - CSP policy updates

## Files Verified (Already Committed)
- `public/images/team3.JPG`
- `public/images/team4.JPG`
- `public/images/team6.JPG`
