# Monitoring & Alerts Setup Guide

## Overview
This document outlines the monitoring and alerting setup for Equality Vanguard production deployment.

## Monitoring Tools

### 1. Sentry (Error Tracking)
**Setup:**
1. Create Sentry project at https://sentry.io
2. Get DSN from Sentry dashboard
3. Add `SENTRY_DSN` to Vercel environment variables
4. Configure alert rules in Sentry dashboard

**Alerts:**
- Error rate > 5% in 5 minutes
- New error type detected
- Critical errors (payment failures, auth failures)

**Dashboard:**
- Monitor error trends
- Review error details and stack traces
- Track release impact

### 2. Vercel Analytics
**Setup:**
- Automatic with Vercel deployment
- Enable in Vercel dashboard

**Metrics:**
- Page views
- API route performance
- Response times
- Error rates

### 3. MongoDB Atlas Monitoring
**Setup:**
- Automatic with Atlas cluster
- Configure in Atlas dashboard

**Metrics:**
- Database connections
- Query performance
- Storage usage
- Replication lag

**Alerts:**
- Connection limit approaching
- High query latency
- Storage > 80% capacity
- Replica set issues

### 4. Stripe Dashboard
**Setup:**
- Automatic with Stripe account
- Monitor in Stripe dashboard

**Metrics:**
- Payment success rate
- Failed payments
- Refund rate
- Revenue trends

**Alerts:**
- Failed payment webhooks
- High refund rate
- Unusual payment patterns

### 5. Uptime Monitoring (UptimeRobot/BetterStack)
**Setup:**
1. Create account at UptimeRobot or BetterStack
2. Add HTTP(S) monitors for:
   - Homepage: `https://equalityvanguard.org`
   - API health: `https://equalityvanguard.org/api/health`
   - Admin login: `https://equalityvanguard.org/admin/login`
3. Configure alert channels (email, Slack)

**Alerts:**
- Site down (HTTP 5xx)
- Slow response (> 5 seconds)
- SSL certificate expiry

### 6. Email Delivery (Mailgun/SendGrid)
**Setup:**
- Automatic with email provider account
- Monitor in provider dashboard

**Metrics:**
- Delivery rate
- Bounce rate
- Spam complaints
- API usage

**Alerts:**
- High bounce rate (> 5%)
- Spam complaints
- API rate limit approaching

## Alert Channels

### Email Alerts
- Primary: admin@equalityvanguard.org
- Secondary: tech@equalityvanguard.org

### Slack Integration (Optional)
1. Create Slack webhook URL
2. Add to Sentry alert rules
3. Configure UptimeRobot/BetterStack alerts

### SMS Alerts (Critical Only)
- Configure for critical errors only
- Use Twilio or similar service
- Alert for: site down, payment failures, security breaches

## Key Metrics Dashboard

### Daily Checks
1. **Error Rate**: Should be < 1%
2. **Payment Success Rate**: Should be > 95%
3. **Email Delivery Rate**: Should be > 98%
4. **API Response Time**: P95 < 500ms
5. **Database Performance**: Query time < 100ms

### Weekly Reviews
1. Review error trends in Sentry
2. Analyze payment patterns in Stripe
3. Review email delivery metrics
4. Check database growth and performance
5. Review security events in audit logs

## Health Check Endpoint

### Create Health Check API
File: `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'unknown',
        uptime: process.uptime()
      }
    };

    // Check database connection
    try {
      await connectDB();
      health.checks.database = 'connected';
    } catch (error) {
      health.checks.database = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    );
  }
}
```

## Log Aggregation

### Vercel Logs
- View logs in Vercel dashboard
- Export logs for analysis
- Configure log retention

### Application Logs
- Critical errors logged to Sentry
- Admin actions logged to AuditLog collection
- Payment events logged to webhook logs

## Performance Monitoring

### Lighthouse Targets
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### API Performance Targets
- P50: < 200ms
- P95: < 500ms
- P99: < 1000ms

### Database Query Targets
- Simple queries: < 50ms
- Complex queries: < 200ms
- Aggregations: < 500ms

## Incident Response

### Severity Levels
1. **Critical**: Site down, payment system down, data breach
2. **High**: API errors > 10%, payment failures, email delivery issues
3. **Medium**: Performance degradation, minor feature issues
4. **Low**: Non-critical errors, minor UI issues

### Response Times
- Critical: Immediate (< 15 minutes)
- High: < 1 hour
- Medium: < 4 hours
- Low: < 24 hours

## Backup & Recovery

### Database Backups
- Frequency: Daily automatic backups
- Retention: 30 days
- Test restore: Monthly

### File Storage
- S3/Spaces versioning enabled
- Lifecycle policies configured
- Cross-region replication (optional)

## Compliance & Auditing

### Audit Logs
- All admin actions logged
- Security events logged
- Payment events logged
- Retention: 1 year (TTL index)

### Data Privacy
- GDPR compliance: User data deletion
- Data export: Available via admin panel
- Privacy policy: Required acceptance

