<!-- 2850183c-51d9-40d7-9783-4e63da59e57f 581df4c5-488e-4e50-9fe0-21f2625ad079 -->
# Comprehensive Debugging and Fix Plan

## Phase 1: Environment Variables and Configuration (Critical)

### 1.1 Fix .env.example typo

- File: `.env.example` line 1
- Change `n# =============================================================================` to `# =============================================================================`
- Remove the 'n' character from the first line

### 1.2 Add missing NEXT_PUBLIC_ environment variables

- File: `.env.example`
- Add these client-side variables if missing:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here`
  - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here`
  - `NEXT_PUBLIC_URL=http://localhost:3000`
  - `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Add optional Instagram variables:
  - `INSTAGRAM_ACCESS_TOKEN=your_instagram_token_here` (optional)
  - `INSTAGRAM_USER_ID=your_instagram_user_id_here` (optional)

### 1.3 Create environment validation utility

- File: `src/lib/env-validation.ts` (new file)
- Create `validateRequiredEnvVars()` function that checks:
  - MONGODB_URI
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_ACCOUNT_ID
  - R2_BUCKET_NAME
  - R2_PUBLIC_URL
  - NEXT_PUBLIC_URL
  - NEXT_PUBLIC_API_URL
- Throw error with list of missing variables if any are missing
- Export function for use in startup scripts

### 1.4 Update .env.local with NEXT_PUBLIC_ variables

- Ensure `.env.local` has all NEXT_PUBLIC_ prefixed variables
- Verify values match server-side equivalents where applicable

## Phase 2: Component Fixes (Critical)

### 2.1 Fix Stripe initialization in form components

- Files:
  - `src/components/events-news/EventModal.tsx` (line 15)
  - `src/components/get-involved/forms/MembershipForm.tsx` (line 14)
  - `src/components/get-involved/forms/DonateForm.tsx` (line 13)
  - `src/app/buy-merch/page.tsx` (line 17)
- Remove fallback to `process.env.STRIPE_PUBLISHABLE_KEY`
- Change from: `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || ''`
- To: `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''`
- Add error handling: if `stripeKey` is empty, show user-friendly error message or disable payment functionality
- Add check: `if (!stripePromise) { return <div>Payment system is not configured</div>; }`

### 2.2 Fix reCAPTCHA script loading

- Files:
  - `src/components/get-involved/forms/ContactForm.tsx` (lines 31-40)
  - `src/components/get-involved/forms/MembershipForm.tsx` (lines 147-156)
  - `src/components/get-involved/forms/DonateForm.tsx` (lines 147-156)
- Add `script.onerror` handler to log error and set error state
- Add error message display: "Security verification failed to load. Please refresh the page."
- Add timeout handling (optional but recommended)

## Phase 3: Configuration Files (Critical)

### 3.1 Update next.config.ts

- Add R2/S3 image domain to `remotePatterns`:
  ```typescript
  {
    protocol: 'https',
    hostname: '*.r2.dev', // or custom R2 domain
    pathname: '/**',
  }
  ```

- Add localhost for development:
  ```typescript
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '3000',
    pathname: '/**',
  }
  ```

- Consider setting `eslint.ignoreDuringBuilds: false` for production (after fixing lint errors)

### 3.2 Fix vercel.json redundant rewrite

- File: `vercel.json` lines 42-47
- Remove the redundant rewrite rule for `/api/webhooks/:path*` to `/api/webhooks/:path*`
- Or document its purpose if intentionally kept

## Phase 4: API Routes (Critical)

### 4.1 Fix Instagram API route

- File: `src/app/api/instagram/route.ts`
- Already has error handling for missing token (line 70-75), but add to `.env.example`:
  - `INSTAGRAM_ACCESS_TOKEN=your_instagram_token_here` (optional)
  - `INSTAGRAM_USER_ID=your_instagram_user_id_here` (optional)

### 4.2 Fix admin stories route authentication

- File: `src/app/api/admin/stories/route.ts` (lines 22-29)
- Remove TODO comment and implement authentication check:
  ```typescript
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return ApiResponse.unauthorized('Authentication required');
  }
  if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
    return ApiResponse.forbidden('Insufficient permissions');
  }
  ```


### 4.3 Add environment variable validation to API routes

- Review all API routes that use environment variables
- Add validation checks at the start of route handlers:
  ```typescript
  if (!process.env.REQUIRED_VAR) {
    return ApiResponse.error('Configuration error', 500);
  }
  ```


## Phase 5: Database Connection (Critical)

### 5.1 Improve MongoDB connection error handling

- File: `src/lib/mongodb.ts`
- Add retry logic with exponential backoff:
  - Implement retry mechanism (3 attempts)
  - Add delay between retries: `1000 * (attemptNumber)`
  - Better error propagation
- Keep existing connection caching for serverless environments

## Phase 6: Dependencies (Warning)

### 6.1 Remove aws-sdk v2

- File: `package.json` line 58
- Check if `aws-sdk` is used anywhere in the codebase
- If not used, remove: `npm uninstall aws-sdk`
- If used, migrate to `@aws-sdk/client-s3` v3

### 6.2 Verify React 19 compatibility

- Check Next.js 15.5.4 release notes for React 19 compatibility
- If issues found, consider downgrading to React 18 or upgrading Next.js
- Test thoroughly after any version changes

## Phase 7: Build Configuration (Warning)

### 7.1 Fix ESLint configuration

- File: `next.config.ts` line 7
- After fixing all lint errors, set `eslint.ignoreDuringBuilds: false`
- Run `npm run lint` and fix all errors before changing this setting

## Phase 8: CI/CD Setup (Warning)

### 8.1 Create GitHub Actions workflow

- File: `.github/workflows/deploy.yml` (new file)
- Create workflow that:
  - Runs on push to main branch
  - Sets up Node.js 20
  - Runs `npm ci`
  - Runs `npm run lint`
  - Runs `npm run type-check`
  - Runs `npm run build`
  - Optionally deploys to Vercel if build succeeds

## Phase 9: Testing and Validation

### 9.1 Run validation scripts

- Run `npm run validate:env` and fix all missing variables
- Run `npm run type-check` and fix all TypeScript errors
- Run `npm run lint` and fix all linting errors
- Run `npm run build` and verify no build errors

### 9.2 Test error scenarios

- Test admin login with missing `NEXTAUTH_SECRET`
- Test file uploads with missing R2 credentials
- Test email sending with missing Mailgun credentials
- Test Stripe payments with missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Test reCAPTCHA with missing `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Test database operations with invalid `MONGODB_URI`
- Test API routes with missing authentication
- Test API routes with invalid permissions

## Phase 10: Documentation

### 10.1 Update documentation

- Update README.md with environment variable setup instructions
- Document all required and optional environment variables
- Add troubleshooting section for common issues

## Execution Order

1. Phase 1 (Environment Variables) - Must be done first
2. Phase 2 (Components) - Depends on Phase 1
3. Phase 3 (Configuration) - Can be done in parallel with Phase 2
4. Phase 4 (API Routes) - Depends on Phase 1
5. Phase 5 (Database) - Can be done independently
6. Phase 6 (Dependencies) - Can be done independently
7. Phase 7 (Build Config) - Depends on Phase 9.1
8. Phase 8 (CI/CD) - Can be done independently
9. Phase 9 (Testing) - Must be done after all fixes
10. Phase 10 (Documentation) - Can be done at any time

## Success Criteria

- All environment variables properly configured with NEXT_PUBLIC_ prefix
- All components handle missing configuration gracefully
- All API routes have proper error handling and authentication
- Database connection has retry logic
- No linting or TypeScript errors
- Build succeeds without errors
- CI/CD pipeline runs successfully
- All error scenarios tested and handled properly

### To-dos

- [ ] Fix .env.example typo on line 1 (remove n character)
- [ ] Add NEXT_PUBLIC_ environment variables to .env.example and .env.local
- [ ] Create src/lib/env-validation.ts with validateRequiredEnvVars() function
- [ ] Fix Stripe initialization in EventModal.tsx, MembershipForm.tsx, DonateForm.tsx, and buy-merch/page.tsx
- [ ] Add error handling to reCAPTCHA script loading in ContactForm, MembershipForm, and DonateForm
- [ ] Update next.config.ts to add R2/S3 and localhost image domains
- [ ] Remove or document redundant rewrite in vercel.json
- [ ] Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env.example
- [ ] Implement authentication check in src/app/api/admin/stories/route.ts
- [ ] Add retry logic with exponential backoff to MongoDB connection in src/lib/mongodb.ts
- [ ] Check and remove aws-sdk v2 if not used, or migrate to v3
- [ ] Verify React 19 compatibility with Next.js 15.5.4
- [ ] Set eslint.ignoreDuringBuilds to false after fixing all lint errors
- [ ] Create .github/workflows/deploy.yml with build and test steps
- [ ] Run validate:env, type-check, lint, and build scripts and fix all errors
- [ ] Test all error scenarios (missing env vars, invalid credentials, etc.)