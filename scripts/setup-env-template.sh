#!/bin/bash
# =============================================================================
# Equality Vanguard - Interactive Environment Setup Script (Bash)
# =============================================================================
# This script helps you create .env.local from .env.example
# Run: bash scripts/setup-env-template.sh
# =============================================================================

set -e

echo "============================================================================="
echo "Equality Vanguard - Environment Setup"
echo "============================================================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    read -p ".env.local already exists. Overwrite? (y/N) " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Aborted. Existing .env.local preserved."
        exit 0
    fi
    echo "Backing up existing .env.local to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "Error: .env.example not found!"
    exit 1
fi

echo "Reading .env.example..."

# Function to prompt for a value
get_env_value() {
    local var_name=$1
    local description=$2
    local required=${3:-false}
    local default_value=${4:-""}
    
    echo ""
    echo "$var_name"
    echo "  Description: $description"
    
    if [ -n "$default_value" ]; then
        read -p "Enter value (default: $default_value): " value
        value=${value:-$default_value}
    elif [ "$required" = "false" ]; then
        read -p "Enter value (optional, press Enter to skip): " value
    else
        read -p "Enter value (required): " value
        if [ -z "$value" ]; then
            echo "Error: $var_name is required!"
            get_env_value "$var_name" "$description" "$required" "$default_value"
            return
        fi
    fi
    
    echo "$value"
}

echo ""
echo "============================================================================="
echo "Required Variables"
echo "============================================================================="

# Required variables
MONGODB_URI=$(get_env_value "MONGODB_URI" "MongoDB connection string" true)
NEXTAUTH_URL=$(get_env_value "NEXTAUTH_URL" "NextAuth base URL" true "http://localhost:3000")
NEXTAUTH_SECRET=$(get_env_value "NEXTAUTH_SECRET" "NextAuth secret key (min 32 chars)" true)
ADMIN_EMAIL=$(get_env_value "ADMIN_EMAIL" "Admin user email" true "admin@equalityvanguard.org")
ADMIN_PASSWORD=$(get_env_value "ADMIN_PASSWORD" "Admin user password" true)
ADMIN_NAME=$(get_env_value "ADMIN_NAME" "Admin user name" true "Admin User")
R2_ACCESS_KEY_ID=$(get_env_value "R2_ACCESS_KEY_ID" "Cloudflare R2 access key" true)
R2_SECRET_ACCESS_KEY=$(get_env_value "R2_SECRET_ACCESS_KEY" "Cloudflare R2 secret key" true)
R2_ACCOUNT_ID=$(get_env_value "R2_ACCOUNT_ID" "Cloudflare R2 account ID" true)
R2_BUCKET_NAME=$(get_env_value "R2_BUCKET_NAME" "Cloudflare R2 bucket name" true)
R2_PUBLIC_URL=$(get_env_value "R2_PUBLIC_URL" "Cloudflare R2 public URL" true)
NEXT_PUBLIC_URL=$(get_env_value "NEXT_PUBLIC_URL" "Public application URL" true "http://localhost:3000")
NEXT_PUBLIC_API_URL=$(get_env_value "NEXT_PUBLIC_API_URL" "Public API URL" true "http://localhost:3000")
NODE_ENV=$(get_env_value "NODE_ENV" "Node environment" true "development")

echo ""
echo "============================================================================="
echo "Optional Variables (Press Enter to skip)"
echo "============================================================================="

# Optional variables
STRIPE_SECRET_KEY=$(get_env_value "STRIPE_SECRET_KEY" "Stripe secret key" false)
STRIPE_PUBLISHABLE_KEY=$(get_env_value "STRIPE_PUBLISHABLE_KEY" "Stripe publishable key" false)
STRIPE_WEBHOOK_SECRET=$(get_env_value "STRIPE_WEBHOOK_SECRET" "Stripe webhook secret" false)
MPESA_CONSUMER_KEY=$(get_env_value "MPESA_CONSUMER_KEY" "M-Pesa consumer key" false)
MPESA_CONSUMER_SECRET=$(get_env_value "MPESA_CONSUMER_SECRET" "M-Pesa consumer secret" false)
MPESA_SHORTCODE=$(get_env_value "MPESA_SHORTCODE" "M-Pesa shortcode" false)
MPESA_PASSKEY=$(get_env_value "MPESA_PASSKEY" "M-Pesa passkey" false)
MPESA_ENVIRONMENT=$(get_env_value "MPESA_ENVIRONMENT" "M-Pesa environment (sandbox/production)" false "sandbox")
MAILGUN_API_KEY=$(get_env_value "MAILGUN_API_KEY" "Mailgun API key" false)
MAILGUN_DOMAIN=$(get_env_value "MAILGUN_DOMAIN" "Mailgun domain" false)
MAILGUN_FROM_EMAIL=$(get_env_value "MAILGUN_FROM_EMAIL" "Mailgun from email" false)
MAILGUN_FROM_NAME=$(get_env_value "MAILGUN_FROM_NAME" "Mailgun from name" false "Equality Vanguard")
MAILCHIMP_API_KEY=$(get_env_value "MAILCHIMP_API_KEY" "Mailchimp API key" false)
MAILCHIMP_LIST_ID=$(get_env_value "MAILCHIMP_LIST_ID" "Mailchimp list ID" false)
MAILCHIMP_SERVER_PREFIX=$(get_env_value "MAILCHIMP_SERVER_PREFIX" "Mailchimp server prefix" false "us1")
RECAPTCHA_SITE_KEY=$(get_env_value "RECAPTCHA_SITE_KEY" "reCAPTCHA site key" false)
RECAPTCHA_SECRET_KEY=$(get_env_value "RECAPTCHA_SECRET_KEY" "reCAPTCHA secret key" false)

# Build .env.local content
cat > .env.local << EOF
# =============================================================================
# Equality Vanguard - Environment Variables
# Generated by setup-env-template.sh on $(date '+%Y-%m-%d %H:%M:%S')
# =============================================================================

# Database
MONGODB_URI=$MONGODB_URI

# Authentication
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Admin User
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_NAME=$ADMIN_NAME

# Payments - Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Payments - M-Pesa
MPESA_CONSUMER_KEY=$MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET=$MPESA_CONSUMER_SECRET
MPESA_SHORTCODE=$MPESA_SHORTCODE
MPESA_PASSKEY=$MPESA_PASSKEY
MPESA_ENVIRONMENT=$MPESA_ENVIRONMENT

# Email - Mailgun
MAILGUN_API_KEY=$MAILGUN_API_KEY
MAILGUN_DOMAIN=$MAILGUN_DOMAIN
MAILGUN_FROM_EMAIL=$MAILGUN_FROM_EMAIL
MAILGUN_FROM_NAME=$MAILGUN_FROM_NAME

# Email - Mailchimp
MAILCHIMP_API_KEY=$MAILCHIMP_API_KEY
MAILCHIMP_LIST_ID=$MAILCHIMP_LIST_ID
MAILCHIMP_SERVER_PREFIX=$MAILCHIMP_SERVER_PREFIX

# Storage - R2
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_ACCOUNT_ID=$R2_ACCOUNT_ID
R2_BUCKET_NAME=$R2_BUCKET_NAME
R2_PUBLIC_URL=$R2_PUBLIC_URL

# Security
RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY

# Application
NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
NODE_ENV=$NODE_ENV
EOF

echo ""
echo "============================================================================="
echo "Success! .env.local created."
echo "============================================================================="
echo ""
echo "Next steps:"
echo "1. Review .env.local and update any values as needed"
echo "2. Run: npm run validate:env"
echo "3. Never commit .env.local to version control"
echo ""




