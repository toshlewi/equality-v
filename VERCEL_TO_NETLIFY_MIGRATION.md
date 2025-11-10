# Vercel to Netlify Migration Guide

This document outlines the migration from Vercel to Netlify for the Equality Vanguard project.

---

## Why Netlify?

- ✅ Better support for Next.js App Router
- ✅ More generous free tier
- ✅ Easier environment variable management
- ✅ Better function logs and monitoring
- ✅ Simpler deployment process

---

## Key Differences

### Build Configuration

**Vercel** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Netlify** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Function Timeouts

**Vercel**:
- Default: 10s (Hobby), 60s (Pro)
- Configured in `vercel.json`

**Netlify**:
- Default: 10s (Free), 26s (Pro)
- Configured in `netlify.toml` or function files

### Environment Variables

**Vercel**:
- Set via dashboard or `vercel env`
- Automatic preview deployments get production vars

**Netlify**:
- Set via dashboard or `netlify env:set`
- Can configure different vars for different contexts (production, deploy-preview, branch-deploy)

### API Routes

**Vercel**:
- Automatically deployed as serverless functions
- No special configuration needed

**Netlify**:
- Uses `@netlify/plugin-nextjs` to handle Next.js API routes
- Automatically converts to Netlify Functions

---

## Migration Checklist

### 1. Pre-Migration

- [x] Review current Vercel configuration
- [x] Document all environment variables
- [x] Test build locally: `npm run build`
- [x] Create Netlify configuration files
- [x] Update documentation

### 2. Netlify Setup

- [ ] Create Netlify account (if not already done)
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Add all environment variables
- [ ] Deploy to Netlify

### 3. Update External Services

- [ ] **Stripe Webhooks**
  - Old: `https://equality-v-4j4t.vercel.app/api/webhooks/stripe`
  - New: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/stripe`

- [ ] **M-Pesa Callbacks**
  - Old: `https://equality-v-4j4t.vercel.app/api/webhooks/mpesa`
  - New: `https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa`

- [ ] **OAuth Callbacks** (if any)
  - Update redirect URIs in OAuth providers

- [ ] **DNS Records** (if using custom domain)
  - Update A/CNAME records to point to Netlify

### 4. Testing

- [ ] Test all pages load correctly
- [ ] Test API routes work
- [ ] Test file uploads (R2 integration)
- [ ] Test payment processing (Stripe)
- [ ] Test M-Pesa integration
- [ ] Test email sending (Mailgun)
- [ ] Test admin panel
- [ ] Test forms and reCAPTCHA

### 5. Post-Migration

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Update documentation with new URLs
- [ ] Archive Vercel project (optional)

---

## Configuration Files

### Files to Keep

- ✅ `netlify.toml` - Netlify configuration
- ✅ `vercel.json` - Keep for reference (not used by Netlify)
- ✅ `package.json` - No changes needed
- ✅ `next.config.ts` - No changes needed

### Files to Update

- ✅ `.env.local` - Update URLs to Netlify domain
- ✅ `README.md` - Update deployment instructions
- ✅ Documentation files - Update references to Vercel

---

## Environment Variables Changes

### URLs to Update

Replace Vercel URLs with Netlify URLs:

```bash
# Old (Vercel)
NEXTAUTH_URL=https://equality-v-4j4t.vercel.app
MPESA_CALLBACK_URL=https://equality-v-4j4t.vercel.app/api/webhooks/mpesa
NEXT_PUBLIC_URL=https://equality-v-4j4t.vercel.app
NEXT_PUBLIC_API_URL=https://equality-v-4j4t.vercel.app/api

# New (Netlify)
NEXTAUTH_URL=https://YOUR-SITE-NAME.netlify.app
MPESA_CALLBACK_URL=https://YOUR-SITE-NAME.netlify.app/api/webhooks/mpesa
NEXT_PUBLIC_URL=https://YOUR-SITE-NAME.netlify.app
NEXT_PUBLIC_API_URL=https://YOUR-SITE-NAME.netlify.app/api
```

### All Other Variables

All other environment variables remain the same:
- Database credentials (MongoDB)
- API keys (Stripe, M-Pesa, Mailgun, etc.)
- Secrets (NextAuth, reCAPTCHA, etc.)

See `NETLIFY_ENV_SETUP.md` for complete list.

---

## Deployment Process

### Vercel (Old)

```bash
# Deploy to Vercel
vercel --prod

# Set environment variable
vercel env add VARIABLE_NAME
```

### Netlify (New)

```bash
# Deploy to Netlify
netlify deploy --prod

# Set environment variable
netlify env:set VARIABLE_NAME "value"
```

---

## Feature Comparison

| Feature | Vercel | Netlify | Notes |
|---------|--------|---------|-------|
| **Next.js Support** | ✅ Native | ✅ Via Plugin | Both excellent |
| **API Routes** | ✅ Automatic | ✅ Automatic | No changes needed |
| **Edge Functions** | ✅ Yes | ✅ Yes | Both support edge runtime |
| **Build Minutes** | 6,000/mo (Hobby) | 300/mo (Free) | Netlify more generous for small projects |
| **Bandwidth** | 100GB/mo | 100GB/mo | Same |
| **Function Timeout** | 10s (Hobby) | 10s (Free) | Same |
| **Environment Variables** | ✅ Dashboard/CLI | ✅ Dashboard/CLI | Both easy to use |
| **Deploy Previews** | ✅ Yes | ✅ Yes | Both support PR previews |
| **Custom Domains** | ✅ Yes | ✅ Yes | Both support custom domains |
| **Analytics** | ✅ Yes (paid) | ✅ Yes (free basic) | Netlify has free basic analytics |

---

## Troubleshooting

### Issue: Build Fails on Netlify

**Solution:**
1. Check build logs in Netlify dashboard
2. Verify Node version is 18 (set in `netlify.toml`)
3. Clear cache: `netlify build --clear-cache`
4. Check for missing dependencies

### Issue: API Routes Return 404

**Solution:**
1. Verify `@netlify/plugin-nextjs` is installed
2. Check `netlify.toml` has the plugin configured
3. Verify API route files are in `src/app/api/`
4. Check function logs in Netlify dashboard

### Issue: Environment Variables Not Working

**Solution:**
1. Verify all variables are set in Netlify dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. For client-side vars, ensure `NEXT_PUBLIC_` prefix

### Issue: Images Not Loading

**Solution:**
1. Verify images are in `public/` directory
2. Check image paths are correct
3. Ensure images are committed to git
4. Check file extensions match (case-sensitive)

### Issue: Webhooks Not Working

**Solution:**
1. Update webhook URLs in external services (Stripe, M-Pesa)
2. Verify webhook secrets are correct
3. Check function logs for errors
4. Test webhook endpoints directly

---

## Rollback Plan

If migration fails, you can quickly rollback to Vercel:

1. **Keep Vercel project active** during migration
2. **Test thoroughly** on Netlify before switching DNS
3. **Update DNS** only after confirming everything works
4. **If issues arise**, simply revert DNS changes

---

## Support Resources

### Netlify
- **Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Community**: https://answers.netlify.com

### Migration Guides
- **Quick Start**: `NETLIFY_QUICK_START.md`
- **Full Setup**: `NETLIFY_SETUP.md`
- **Environment Variables**: `NETLIFY_ENV_SETUP.md`
- **Deployment Checklist**: `NETLIFY_DEPLOY_CHECKLIST.md`

---

## Timeline

### Estimated Migration Time

- **Setup Netlify**: 5 minutes
- **Add Environment Variables**: 10 minutes
- **First Deployment**: 5 minutes
- **Update Webhooks**: 10 minutes
- **Testing**: 30 minutes
- **DNS Update** (if custom domain): 24-48 hours

**Total**: ~1 hour (excluding DNS propagation)

---

## Notes

- ✅ No code changes required
- ✅ All features work the same on Netlify
- ✅ Can run both Vercel and Netlify simultaneously during migration
- ✅ Easy to rollback if needed
- ✅ Better monitoring and logs on Netlify

---

**Migration Status**: Ready to proceed
**Last Updated**: 2025-11-10
