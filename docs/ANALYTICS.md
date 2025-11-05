# Analytics Setup Guide

## Overview
This document outlines the analytics setup for Equality Vanguard.

## Google Analytics 4 (GA4)

### Setup
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (format: G-XXXXXXXXXX)
3. Add to Vercel environment variables: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
4. Add Google Analytics script to `src/app/layout.tsx`

### Events to Track
- Page views (automatic)
- Membership signup
- Donation submission
- Event registration
- Newsletter subscription
- Contact form submission
- Partnership inquiry
- Product purchase
- Volunteer application

### Implementation
Add to `src/lib/analytics.ts`:
```typescript
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};
```

## Plausible Analytics (Alternative)

### Setup
1. Create account at https://plausible.io
2. Add domain to Plausible
3. Get script URL
4. Add to `src/app/layout.tsx`

### Benefits
- Privacy-focused
- No cookies
- GDPR compliant
- Simple setup

## Custom Analytics Events

### Membership Events
- `membership_signup_started`
- `membership_signup_completed`
- `membership_payment_success`
- `membership_payment_failed`

### Donation Events
- `donation_started`
- `donation_completed`
- `donation_failed`

### Event Events
- `event_view`
- `event_registration_started`
- `event_registration_completed`

### Shop Events
- `product_view`
- `add_to_cart`
- `checkout_started`
- `purchase_completed`

## Conversion Tracking

### Key Conversions
1. Membership signup → Payment completion
2. Donation submission → Payment completion
3. Event registration → Payment completion (if paid)
4. Newsletter subscription
5. Contact form submission

## Dashboard Setup

### Key Metrics
- Total visitors
- Page views per session
- Bounce rate
- Conversion rate by flow
- Revenue by source
- Top pages
- User flow analysis

## Privacy Compliance

### GDPR
- Anonymize IP addresses
- Cookie consent banner
- Opt-out mechanism
- Data retention policy

### Cookie Policy
- Required cookies: Session, authentication
- Analytics cookies: Optional (consent required)
- Marketing cookies: Optional (consent required)

## Reporting

### Daily Reports
- Traffic overview
- Conversion rates
- Error rates

### Weekly Reports
- Traffic trends
- Conversion analysis
- Top pages
- User behavior

### Monthly Reports
- Revenue analysis
- User acquisition
- Engagement metrics
- Performance trends

