# M-Pesa Callback URL Fix

## Problem
```
Error: STK Push failed: Bad Request - Invalid CallBackURL
```

## Root Cause
M-Pesa API requires a **publicly accessible HTTPS URL** for the callback. The error occurs when:
- `NEXTAUTH_URL` is set to `localhost` or `http://`
- `MPESA_CALLBACK_URL` is not set
- The callback URL is not a valid HTTPS URL

## Solution

### Option 1: Set MPESA_CALLBACK_URL in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   ```
   MPESA_CALLBACK_URL=https://equality-v-4j4t.vercel.app/api/webhooks/mpesa
   ```
3. Redeploy the project

### Option 2: Update NEXTAUTH_URL

Make sure `NEXTAUTH_URL` is set to your production URL:
```
NEXTAUTH_URL=https://equality-v-4j4t.vercel.app
```

## Verification

After deploying, the M-Pesa callback URL will be:
```
https://equality-v-4j4t.vercel.app/api/webhooks/mpesa
```

This URL must be:
- ✅ Publicly accessible (not localhost)
- ✅ HTTPS (not HTTP)
- ✅ Reachable from Safaricom's servers

## Testing M-Pesa

Once the callback URL is fixed:

1. **Fill out donation form**
2. **Select M-Pesa payment**
3. **Enter phone number**: `254712345678` format
4. **Submit** - Should get STK push on phone
5. **Enter M-Pesa PIN** on your phone
6. **Wait for confirmation**

## What Was Fixed

### Code Changes (Commit: `b0ffbd3`)

1. **`src/lib/mpesa.ts`**:
   - Added callback URL validation
   - Checks for HTTPS protocol
   - Better error messages
   - Prioritizes `MPESA_CALLBACK_URL` over `NEXTAUTH_URL`

2. **`src/middleware.ts`**:
   - Added `https://vercel.live` to CSP `script-src`
   - Fixes Vercel Live feedback script CSP violation

## Environment Variables Needed

```env
# Required for M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

# Callback URL (choose one)
MPESA_CALLBACK_URL=https://your-domain.com/api/webhooks/mpesa
# OR
NEXTAUTH_URL=https://your-domain.com

# Optional
MPESA_ENVIRONMENT=sandbox  # or 'production'
```

## Troubleshooting

### Still Getting "Invalid CallBackURL"

1. **Check environment variables in Vercel**:
   - Go to Settings → Environment Variables
   - Verify `MPESA_CALLBACK_URL` or `NEXTAUTH_URL` is set
   - Make sure it starts with `https://`

2. **Check server logs**:
   - Look for: `Invalid CallBackURL: ...`
   - The error will show what URL is being used

3. **Test the callback URL**:
   ```bash
   curl https://your-domain.com/api/webhooks/mpesa
   ```
   Should return a response (not 404)

### M-Pesa Sandbox vs Production

**Sandbox** (for testing):
- Use test credentials from Safaricom Daraja
- Use test phone numbers
- No real money involved

**Production** (live):
- Use real business credentials
- Real phone numbers
- Real money transactions
- Requires approval from Safaricom

## Next Steps

1. ✅ Set `MPESA_CALLBACK_URL` in Vercel
2. ✅ Redeploy project
3. ✅ Test M-Pesa payment
4. ✅ Check webhook receives callbacks

## Additional Notes

- reCAPTCHA is currently disabled for testing
- Stripe payments should work independently
- M-Pesa requires valid Kenyan phone numbers (254...)
