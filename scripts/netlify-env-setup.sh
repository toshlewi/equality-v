#!/bin/bash

# Netlify Environment Variables Setup Script
# This script helps you set all environment variables for Netlify deployment
# Usage: ./scripts/netlify-env-setup.sh YOUR-SITE-NAME

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if site name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Site name is required${NC}"
    echo "Usage: ./scripts/netlify-env-setup.sh YOUR-SITE-NAME"
    echo "Example: ./scripts/netlify-env-setup.sh equality-vanguard"
    exit 1
fi

SITE_NAME=$1
SITE_URL="https://${SITE_NAME}.netlify.app"

echo -e "${GREEN}Setting up environment variables for: ${SITE_URL}${NC}"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
fi

# Login to Netlify
echo -e "${YELLOW}Logging in to Netlify...${NC}"
netlify login

# Link to site
echo -e "${YELLOW}Linking to site...${NC}"
netlify link

echo ""
echo -e "${GREEN}Setting environment variables...${NC}"
echo ""

# Database Configuration
netlify env:set MONGODB_URI "mongodb+srv://equality-vanguard-user:B8Ccem6U6SQkAUvE@equality-vanguard-clust.gsfm6qe.mongodb.net/?retryWrites=true&w=majority&appName=equality-vanguard-cluster"

# Authentication
netlify env:set NEXTAUTH_URL "${SITE_URL}"
netlify env:set NEXTAUTH_SECRET "P2xxsL6RACghyhPJY/E6yGbT1PnesSz2msEv2fybNBM="

# Admin User
netlify env:set ADMIN_EMAIL "admin@equalityvanguard.org"
netlify env:set ADMIN_PASSWORD "Sylvia2025!"
netlify env:set ADMIN_NAME "System Administrator"

# Stripe
netlify env:set STRIPE_SECRET_KEY "sk_test_51SQ5cI4CpEJP3wofpDgeaENWkHAyicpubKabBg5JBO4ZhybR3MNo0pAw9oqCvPG0H1d1Z1yMk8glFeFzT1HrDr0K00XQnLQcfe"
netlify env:set STRIPE_PUBLISHABLE_KEY "pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb"
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "pk_test_51SQ5cI4CpEJP3wofqpLNo8H7uynwJPM3xIfLpDPA3oAZ9zdIcf4PAVJsJRWxnCOpSPFeHzOcWf3hDJGmghcPzgzY00agS7ALJb"
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_your_stripe_webhook_secret"

# M-Pesa
netlify env:set MPESA_CONSUMER_KEY "oMjEATGvBv9FjdFAJLAE7piHlVOA9IeGWCAmlpCu5zAkxIF5"
netlify env:set MPESA_CONSUMER_SECRET "zGAVAJI5ifsn1wIrmh0reGYUQhmACB2vUSnLNY7BIyTmyjJHyDn4NONrxqifKiyp"
netlify env:set MPESA_SHORTCODE "174379"
netlify env:set MPESA_PASSKEY "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
netlify env:set MPESA_BUSINESS_SHORTCODE "174379"
netlify env:set MPESA_ENVIRONMENT "sandbox"
netlify env:set MPESA_CALLBACK_URL "${SITE_URL}/api/webhooks/mpesa"

# Email - Mailgun
netlify env:set MAILGUN_API_KEY "your_mailgun_api_key"
netlify env:set MAILGUN_DOMAIN "mg.equalityvanguard.org"
netlify env:set MAILGUN_FROM_EMAIL "noreply@equalityvanguard.org"
netlify env:set MAILGUN_FROM_NAME "Equality Vanguard"

# Newsletter - Mailchimp
netlify env:set MAILCHIMP_API_KEY "d2a5027c23a8780439a9109380ca1202-us1"
netlify env:set MAILCHIMP_LIST_ID "1d50d52306"
netlify env:set MAILCHIMP_SERVER_PREFIX "us1"

# File Storage - Cloudflare R2
netlify env:set R2_ACCESS_KEY_ID "156079ef3687569ce1e59b2668cf056a"
netlify env:set R2_SECRET_ACCESS_KEY "5a5333a765a12826ce6d9cd25759857e2b9eadf793f83f02ffe3f497a7680712"
netlify env:set R2_ACCOUNT_ID "1a960de18723bbc182a9b2d12e9ae9b7"
netlify env:set R2_BUCKET_NAME "equality-vanguard-uploads"
netlify env:set R2_PUBLIC_URL "https://equalityvanguard.org"

# Security - reCAPTCHA
netlify env:set NEXT_PUBLIC_RECAPTCHA_SITE_KEY "6LenVQcsAAAAALBFGKdOYCMUargvkgxfdFEceUi7"
netlify env:set RECAPTCHA_SECRET_KEY "6LenVQcsAAAAAN0DP8nBBDzMm40nUCEKebzci1DD"

# Analytics
netlify env:set GOOGLE_ANALYTICS_ID "G-XXXXXXXXXX"
netlify env:set SENTRY_DSN "your_sentry_dsn"
netlify env:set SENTRY_AUTH_TOKEN "your_sentry_auth_token"

# Redis
netlify env:set REDIS_URL "redis://localhost:6379"

# Application URLs
netlify env:set NEXT_PUBLIC_URL "${SITE_URL}"
netlify env:set NEXT_PUBLIC_API_URL "${SITE_URL}/api"

# Environment
netlify env:set NODE_ENV "production"

# Instagram (Optional)
netlify env:set INSTAGRAM_ACCESS_TOKEN "your_instagram_access_token"
netlify env:set INSTAGRAM_USER_ID "your_instagram_user_id"

echo ""
echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
echo ""
echo "1. Update Stripe webhook:"
echo "   - Go to: https://dashboard.stripe.com/webhooks"
echo "   - Add endpoint: ${SITE_URL}/api/webhooks/stripe"
echo "   - Copy webhook secret and run:"
echo "     netlify env:set STRIPE_WEBHOOK_SECRET 'whsec_your_actual_secret'"
echo ""
echo "2. Update Mailgun API key (if needed):"
echo "   netlify env:set MAILGUN_API_KEY 'your_actual_mailgun_key'"
echo ""
echo "3. Update Google Analytics ID (if needed):"
echo "   netlify env:set GOOGLE_ANALYTICS_ID 'G-XXXXXXXXXX'"
echo ""
echo "4. Deploy your site:"
echo "   netlify deploy --prod"
echo ""
echo -e "${GREEN}Your site will be available at: ${SITE_URL}${NC}"
