# Operations Runbook

## Emergency Procedures

### Site Down
1. Check Vercel dashboard for deployment status
2. Check MongoDB Atlas for database connectivity
3. Check Sentry for error alerts
4. Verify environment variables in Vercel
5. Check DNS records if domain issues

### Database Issues
1. Check MongoDB Atlas dashboard
2. Verify connection string in Vercel env vars
3. Check database connection limits
4. Review recent database operations in logs

### Payment Issues
1. Check Stripe dashboard for failed payments
2. Verify Stripe webhook endpoint is receiving events
3. Check M-Pesa API status
4. Review payment webhook logs in Vercel

## Common Operations

### Process Refund

#### Donation Refund (Stripe)
1. Navigate to `/admin/payments/donations/[id]`
2. Click "Process Refund"
3. Enter refund amount (leave blank for full refund)
4. Select reason
5. Confirm refund
6. Verify email sent to donor

#### Order Refund (Stripe)
1. Navigate to `/admin/shop/orders/[id]`
2. Click "Process Refund"
3. Enter refund amount and reason
4. Confirm refund
5. Verify inventory updated (if applicable)

### Resend Confirmation Email

#### Membership
1. Navigate to `/admin/members/[id]`
2. Click "Resend Confirmation Email"
3. Verify email sent

#### Donation Receipt
1. Navigate to `/admin/payments/donations/[id]`
2. Click "Resend Receipt"
3. Verify receipt email sent

#### Event Registration
1. Navigate to event registration details
2. Click "Resend Confirmation"
3. Verify email with ICS attachment sent

### Update Member Status
1. Navigate to `/admin/members/[id]`
2. Update status (pending → active → suspended/cancelled)
3. Add notes if needed
4. Save changes
5. Confirmation email sent automatically if activated

### Export Data

#### Members CSV
1. Navigate to `/admin/members`
2. Apply filters if needed
3. Click "Export CSV"
4. File downloads automatically

#### Donations CSV
1. Navigate to `/admin/payments/donations`
2. Apply filters
3. Click "Export CSV"

#### Orders CSV
1. Navigate to `/admin/shop/orders`
2. Apply filters
3. Click "Export CSV"

### Review Volunteer Applications
1. Navigate to `/admin/members/volunteers`
2. Filter by status/job
3. Click on application to view details
4. Update status (pending → reviewed → accepted/rejected)
5. Add review notes
6. Email notification sent automatically

### Review Partnership Inquiries
1. Navigate to `/admin/members/partnerships`
2. Click on inquiry to view details
3. Update status (pending → contacted → in_progress/declined)
4. Add response/notes
5. Email notification sent to organization

### Manage Products
1. Navigate to `/admin/shop/products`
2. Create new product: Click "New Product"
3. Edit product: Click on product
4. Archive product: Set status to "archived"

### Update Order Status
1. Navigate to `/admin/shop/orders/[id]`
2. Update status (pending → confirmed → processing → shipped → delivered)
3. Add tracking number if shipped
4. Save changes

### View Audit Logs
1. Navigate to `/admin/logs/audit`
2. Filter by event type, severity, date range
3. Export CSV if needed
4. Review security events

### Update Settings
1. Navigate to `/admin/settings`
2. Find setting by category
3. Update value
4. Click "Save"
5. Setting takes effect immediately

## Monitoring

### Key Metrics to Watch
- **Error Rate**: Check Sentry dashboard daily
- **Payment Success Rate**: Monitor Stripe dashboard
- **Email Delivery**: Check Mailgun/SendGrid dashboard
- **API Response Times**: Monitor Vercel analytics
- **Database Performance**: Check MongoDB Atlas metrics

### Alerts Setup
- Sentry: Error rate > 5% in 5 minutes
- UptimeRobot: HTTP 5xx errors
- Stripe: Failed payment webhooks
- MongoDB: Connection errors or high latency

## Backup Procedures

### Database Backup
- MongoDB Atlas: Automatic daily backups (configure retention)
- Manual backup: Export via MongoDB Compass or Atlas UI

### File Storage Backup
- S3/Spaces: Enable versioning
- Configure lifecycle policies for old files

## Troubleshooting

### Email Not Sending
1. Check Mailgun/SendGrid API key in Vercel env vars
2. Verify sender domain DNS (SPF/DKIM)
3. Check email logs in provider dashboard
4. Review email template syntax

### Payment Webhook Not Working
1. Verify webhook URL in Stripe/M-Pesa dashboard
2. Check webhook secret in Vercel env vars
3. Review webhook logs in Vercel
4. Test webhook endpoint manually

### File Upload Failing
1. Check S3/Spaces credentials in Vercel env vars
2. Verify bucket permissions
3. Check file size limits (10MB images, 50MB docs)
4. Review MIME type validation

### Database Connection Issues
1. Verify MongoDB URI in Vercel env vars
2. Check IP whitelist in MongoDB Atlas
3. Verify connection string format
4. Check database user permissions

## Security Incidents

### Suspected Attack
1. Check audit logs for security events
2. Review IP addresses in logs
3. Block IP if necessary (add to blocked list)
4. Review affected data
5. Notify team immediately

### Data Breach
1. Immediately revoke affected API keys
2. Review audit logs for unauthorized access
3. Change all admin passwords
4. Notify affected users
5. Document incident

## Maintenance Windows

### Database Maintenance
- Schedule during low-traffic hours
- Notify users in advance
- Backup before maintenance
- Test after maintenance

### Deployment
- Deploy during low-traffic hours
- Run smoke tests after deployment
- Monitor error rates post-deployment
- Have rollback plan ready

