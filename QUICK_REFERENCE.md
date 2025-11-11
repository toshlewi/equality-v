# Quick Reference - Equality Vanguard

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production
npm start
```

## 📍 Key Routes

### Public Routes
- `/` - Homepage
- `/read/[publicationId]` - **NEW** - PDF reader for publications
- `/matriarchive/publications` - Publications list
- `/events-news` - Events and news
- `/get-involved` - Get involved page

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/notifications` - **NEW** - Notifications page
- `/admin/members` - Members management
- `/admin/payments/donations` - Donations
- `/admin/events` - Events management

## 🔔 Notifications System

### API Endpoints
```
GET    /api/admin/notifications              # List notifications
POST   /api/admin/notifications              # Create notification
POST   /api/admin/notifications/[id]/read    # Mark as read
DELETE /api/admin/notifications/[id]         # Delete notification
POST   /api/admin/notifications/mark-all-read # Mark all as read (NEW)
```

### Components
- `NotificationBell` - Bell icon with badge in admin header
- `NotificationsPage` - Full notifications page with filters

### Usage Example
```javascript
import { createAdminNotification } from '@/lib/notifications';

await createAdminNotification({
  type: 'membership_activated',
  title: 'New Membership',
  message: 'Jane Doe joined as individual member',
  priority: 'medium',
  category: 'members',
  actionUrl: '/admin/members/123'
});
```

## 📄 PDF Reader

### Route
```
/read/[publicationId]
```

### Examples
- `/read/507f1f77bcf86cd799439020` (by MongoDB ID)
- `/read/digital-rights-africa` (by slug)

### Features
- Embedded PDF viewer
- Download button
- Share functionality
- Reading time calculation
- Responsive design

## 💳 Payment Webhooks

### Stripe Webhook
```
POST /api/webhooks/stripe
```

### Handled Events
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `customer.subscription.*` - Subscription events

### What Happens on Success
1. Database updated (status → 'active', 'paid', 'confirmed')
2. Email sent (confirmation, receipt, registration)
3. Admin notification created
4. Mailchimp subscriber added (if configured)

## 📧 Email Templates

### Available Templates
- `membership-confirmation` - Membership activated
- `donation-receipt` - Donation receipt
- `event-registration` - Event registration with ICS
- `order-confirmation` - Order confirmation
- `password-reset` - Password reset

### Send Email
```javascript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'membership-confirmation',
  data: {
    name: 'Jane Doe',
    membershipType: 'individual',
    amount: 50
  }
});
```

## 🔐 Environment Variables

### Required
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://equalityvanguard.org
NEXTAUTH_SECRET=your-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### Optional
```env
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
```

## 🗄️ Database Models

### Key Collections
- `members` - Membership records
- `donations` - Donation records
- `orders` - E-commerce orders
- `events` - Events
- `eventregistrations` - Event registrations
- `publications` - Publications/articles
- `notifications` - Admin notifications
- `users` - Admin users

## 🎨 Admin UI Components

### Notification Bell
```tsx
import NotificationBell from '@/components/admin/NotificationBell';

<NotificationBell />
```

### Features
- Shows unread count
- Dropdown with recent notifications
- Auto-refresh every 30s
- Click to mark as read

## 📊 Testing

### Run Tests
```bash
# Integration tests documented in:
INTEGRATION_TEST_REPORT.md

# Build test
npm run build

# Manual testing
npm run dev
```

## 🐛 Debugging

### Check Logs
```bash
# Vercel logs
vercel logs

# Local logs
npm run dev
# Check console output
```

### Common Issues

**Webhook not working?**
- Check Stripe webhook secret
- Verify endpoint URL
- Check webhook signature

**Email not sending?**
- Verify Resend API key
- Check domain verification
- Review email logs

**Notifications not showing?**
- Check authentication
- Verify API route
- Check browser console

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Setup instructions
- `NOTIFICATIONS_GUIDE.md` - Notification system
- `INTEGRATION_TEST_REPORT.md` - Test results
- `DEPLOYMENT_READY_SUMMARY.md` - Deployment guide
- `FIXES_COMPLETED.md` - Recent fixes
- `QUICK_REFERENCE.md` - This file

## 🔗 Important Links

### Development
- Local: http://localhost:3000
- Admin: http://localhost:3000/admin

### Production
- Website: https://equalityvanguard.org
- Admin: https://equalityvanguard.org/admin

### External Services
- Stripe: https://dashboard.stripe.com
- Resend: https://resend.com/dashboard
- MongoDB: https://cloud.mongodb.com
- Vercel: https://vercel.com/dashboard

## 🆘 Support

### Technical Issues
- Check documentation files
- Review error logs
- Test in development first

### Contact
- Email: support@equalityvanguard.org
- GitHub: [Repository URL]

---

**Last Updated:** November 11, 2025  
**Version:** 1.0
