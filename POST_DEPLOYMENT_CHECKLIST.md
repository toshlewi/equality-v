# Post-Deployment Checklist

## ✅ Immediate Actions (After First Deployment)

### 1. Update Environment Variables with Actual URL
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Update `NEXTAUTH_URL` to your actual Vercel URL
- [ ] Update `NEXT_PUBLIC_URL` to your actual Vercel URL
- [ ] Update `NEXT_PUBLIC_API_URL` to your actual Vercel URL + `/api`
- [ ] Update `R2_PUBLIC_URL` to your actual Vercel URL
- [ ] Click "Redeploy" to apply changes

**Example:**
```
NEXTAUTH_URL=https://equality-v-abc123.vercel.app
NEXT_PUBLIC_URL=https://equality-v-abc123.vercel.app
NEXT_PUBLIC_API_URL=https://equality-v-abc123.vercel.app/api
R2_PUBLIC_URL=https://equality-v-abc123.vercel.app
```

### 2. Configure Stripe Webhook
- [ ] Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
- [ ] Click "Add endpoint"
- [ ] Enter: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
- [ ] Select events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy the "Signing secret" (starts with `whsec_`)
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Redeploy

### 3. Create Admin User
- [ ] Visit: `https://your-vercel-url.vercel.app/api/seed`
- [ ] Verify response: `{"success": true, "message": "Admin user created"}`
- [ ] Login at: `https://your-vercel-url.vercel.app/admin`
- [ ] Credentials:
  - Email: `admin@equalityvanguard.org`
  - Password: `Sylvia2025!`

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Homepage loads without errors
- [ ] All navigation links work
- [ ] Images load correctly
- [ ] Mobile responsive design works

### Admin Panel
- [ ] Can log in to admin panel
- [ ] Dashboard displays correctly
- [ ] Can create/edit content
- [ ] Can view analytics

### Payments - Stripe
- [ ] Donation form loads
- [ ] Can submit donation form
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Payment success page displays
- [ ] Webhook receives payment confirmation
- [ ] Check Vercel logs for webhook processing

### Payments - M-Pesa
- [ ] M-Pesa form loads
- [ ] Can enter phone number
- [ ] STK Push initiates (sandbox mode)
- [ ] Webhook endpoint is accessible

### Newsletter
- [ ] Newsletter signup form works
- [ ] Subscriber appears in Mailchimp dashboard
- [ ] No errors in Vercel logs

### File Uploads
- [ ] Can upload images in admin
- [ ] Uploaded files are accessible via URL
- [ ] File deletion works

### Database
- [ ] Data persists after page refresh
- [ ] Can create new records
- [ ] Can update existing records
- [ ] Can delete records

---

## ⚠️ Optional Configurations

### Configure Mailgun (For Emails)
**Status**: ⚠️ Not configured - emails won't send

**Steps to enable:**
1. [ ] Sign up at [Mailgun](https://www.mailgun.com/)
2. [ ] Get API key from dashboard
3. [ ] Update `MAILGUN_API_KEY` in Vercel
4. [ ] Redeploy
5. [ ] Test by making a donation
6. [ ] Check email inbox for receipt

**Test email functionality:**
- [ ] Donation receipt email
- [ ] Membership confirmation email
- [ ] Event registration email
- [ ] Newsletter welcome email

### Configure reCAPTCHA (For Bot Protection)
**Status**: ⚠️ Not configured - forms work but no bot protection

**Steps to enable:**
1. [ ] Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. [ ] Create new site (reCAPTCHA v2)
3. [ ] Add your Vercel domain
4. [ ] Copy Site Key and Secret Key
5. [ ] Update in Vercel:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `RECAPTCHA_SECRET_KEY`
6. [ ] Redeploy
7. [ ] Verify reCAPTCHA appears on forms

**Test reCAPTCHA:**
- [ ] Contact form shows reCAPTCHA
- [ ] Donation form shows reCAPTCHA
- [ ] Membership form shows reCAPTCHA
- [ ] Newsletter signup shows reCAPTCHA

---

## 🔍 Monitoring & Debugging

### Check Vercel Logs
- [ ] Go to Vercel Dashboard → Deployments → Latest → Functions
- [ ] Check for any errors in function logs
- [ ] Monitor webhook calls

### Check MongoDB
- [ ] Go to MongoDB Atlas dashboard
- [ ] Verify collections are being created
- [ ] Check data is being stored correctly

### Check Stripe Dashboard
- [ ] Verify test payments appear
- [ ] Check webhook delivery status
- [ ] Review payment events

### Check Mailchimp
- [ ] Verify subscribers are being added
- [ ] Check subscriber tags are correct
- [ ] Review audience growth

---

## 🚨 Common Issues & Solutions

### Issue: Build Fails
**Solution:**
- Check Vercel build logs
- Verify all environment variables are set
- Run `npm run build` locally to test

### Issue: Database Connection Error
**Solution:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Ensure database user has correct permissions

### Issue: Stripe Webhook Not Working
**Solution:**
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` is set
- Test webhook using Stripe CLI
- Check Vercel function logs

### Issue: Files Not Uploading
**Solution:**
- Verify all R2 credentials are correct
- Check R2 bucket CORS settings
- Ensure `R2_PUBLIC_URL` matches your domain

### Issue: Emails Not Sending
**Solution:**
- Verify `MAILGUN_API_KEY` is set correctly
- Check Mailgun domain is verified
- Review Mailgun logs for errors

---

## 📊 Performance Optimization

### After Deployment
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images if needed
- [ ] Review bundle size

### Monitoring
- [ ] Set up Vercel Analytics (optional)
- [ ] Configure Sentry for error tracking (optional)
- [ ] Set up Google Analytics (optional)

---

## 🎯 Production Readiness

### Before Going Live
- [ ] All tests passing
- [ ] Emails configured and working
- [ ] reCAPTCHA configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] All environment variables updated
- [ ] Stripe in production mode (when ready)
- [ ] M-Pesa in production mode (when ready)

### Security
- [ ] Change default admin password
- [ ] Review user permissions
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Review security headers

---

## 📞 Support & Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)

### Dashboards
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Mailchimp](https://mailchimp.com/)
- [Cloudflare R2](https://dash.cloudflare.com/)

---

## ✅ Deployment Complete When:

- [x] Site is live and accessible
- [x] Admin can log in
- [x] Payments work (Stripe)
- [x] Newsletter signups work
- [x] Files can be uploaded
- [ ] Emails are being sent (optional)
- [ ] Forms have bot protection (optional)

---

**Last Updated**: After initial deployment
**Next Review**: After enabling optional features
