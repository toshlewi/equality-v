# reCAPTCHA Temporarily Disabled for Testing

**Date**: 2025-11-10  
**Commits**: `71f0364`, `ab7296b`, `a6d7a56`  
**Status**: ⚠️ TESTING MODE - SECURITY REDUCED

## What Was Changed

reCAPTCHA verification has been **completely disabled** to test if payment functionality works without it.

### Files Modified

1. **`src/lib/recaptcha.ts`**
   - `verifyRecaptcha()` now always returns `true`
   - Original verification code commented out
   - Console warnings added to indicate bypass

2. **`src/components/get-involved/forms/DonateForm.tsx`**
   - reCAPTCHA script loading disabled
   - `getRecaptchaToken()` returns `'testing-bypass-token'` immediately
   - No actual reCAPTCHA widget will load

3. **`src/components/get-involved/forms/MembershipForm.tsx`**
   - reCAPTCHA script loading disabled
   - `getRecaptchaToken()` returns `'testing-bypass-token'` immediately

4. **`src/components/get-involved/forms/PartnerForm.tsx`**
   - reCAPTCHA script loading disabled
   - `getRecaptchaToken()` returns `'testing-bypass-token'` immediately

5. **`src/components/get-involved/forms/ContactForm.tsx`**
   - reCAPTCHA script loading disabled
   - `getRecaptchaToken()` returns `'testing-bypass-token'` immediately

## Impact

### ✅ What Works Now
- Donation form submission without reCAPTCHA errors
- All forms that use reCAPTCHA will bypass verification
- Payment processing can be tested independently

### ⚠️ Security Implications
- **NO bot protection** - any automated script can submit forms
- **NO spam prevention** - forms are vulnerable to abuse
- **Production risk** - DO NOT deploy this to production

## Testing the Payment Flow

Now you can test:

1. **Stripe Payments**:
   - Fill out donation form
   - Select "Credit/Debit Card (Stripe)"
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Submit and verify payment processes

2. **M-Pesa Payments**:
   - Fill out donation form
   - Select "M-Pesa"
   - Enter phone number in format: `254712345678`
   - Submit and check STK push

3. **Check Console Logs**:
   - Look for: `⚠️ reCAPTCHA verification DISABLED for testing purposes`
   - Look for: `⚠️ reCAPTCHA token generation BYPASSED for testing`

## How to Re-enable reCAPTCHA

When testing is complete, restore the original code:

### Option 1: Git Revert (Recommended)
```bash
git revert 71f0364
git push origin integrations
```

### Option 2: Manual Restore

**In `src/lib/recaptcha.ts`**:
- Remove the `return true;` line
- Uncomment the original verification code
- Remove the testing comments

**In `src/components/get-involved/forms/DonateForm.tsx`**:
- Uncomment the reCAPTCHA script loading in `useEffect`
- Uncomment the original `getRecaptchaToken()` implementation
- Remove the `return 'testing-bypass-token';` line

## Alternative: Use Test reCAPTCHA Keys

Google provides test keys that always pass:

```env
# Test keys (always pass)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

These keys will make reCAPTCHA work without actual verification.

## Next Steps

1. ✅ Test donation form submission
2. ✅ Verify Stripe payment processing
3. ✅ Test M-Pesa integration
4. ✅ Check server logs for payment errors
5. ⚠️ **RE-ENABLE reCAPTCHA** before production deployment

## Important Reminders

- 🚨 This is a **temporary testing configuration**
- 🚨 **DO NOT** leave this disabled in production
- 🚨 Monitor for any abuse during testing period
- 🚨 Re-enable reCAPTCHA as soon as payment testing is complete

## Troubleshooting

If payments still fail:

1. **Check Stripe Configuration**:
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Verify `STRIPE_SECRET_KEY` is set
   - Check Stripe dashboard for errors

2. **Check M-Pesa Configuration**:
   - Verify M-Pesa credentials in environment variables
   - Check M-Pesa API logs
   - Verify phone number format

3. **Check Server Logs**:
   - Look for payment processing errors
   - Check database connection issues
   - Verify API endpoint responses

4. **Browser Console**:
   - Check for JavaScript errors
   - Verify API responses (Network tab)
   - Look for CORS issues
