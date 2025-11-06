# =============================================================================
# Equality Vanguard - Interactive Environment Setup Script (PowerShell)
# =============================================================================
# This script helps you create .env.local from .env.example
# Run: .\scripts\setup-env-template.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host "Equality Vanguard - Environment Setup" -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    $overwrite = Read-Host ".env.local already exists. Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Aborted. Existing .env.local preserved." -ForegroundColor Yellow
        exit 0
    }
    Write-Host "Backing up existing .env.local to .env.local.backup" -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup" -Force
}

# Check if .env.example exists
if (-not (Test-Path ".env.example")) {
    Write-Host "Error: .env.example not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading .env.example..." -ForegroundColor Green
$template = Get-Content ".env.example" -Raw

# Function to prompt for a value with validation
function Get-EnvValue {
    param(
        [string]$VarName,
        [string]$Description,
        [bool]$Required = $false,
        [string]$DefaultValue = "",
        [string]$ValidationPattern = ""
    )
    
    Write-Host ""
    Write-Host "$VarName" -ForegroundColor Yellow
    Write-Host "  Description: $Description" -ForegroundColor Gray
    
    if ($DefaultValue) {
        $prompt = "Enter value (default: $DefaultValue): "
    } elseif (-not $Required) {
        $prompt = "Enter value (optional, press Enter to skip): "
    } else {
        $prompt = "Enter value (required): "
    }
    
    $value = Read-Host $prompt
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($Required) {
            Write-Host "Error: $VarName is required!" -ForegroundColor Red
            return Get-EnvValue -VarName $VarName -Description $Description -Required $true -DefaultValue $DefaultValue -ValidationPattern $ValidationPattern
        }
        return $DefaultValue
    }
    
    # Validate if pattern provided
    if ($ValidationPattern -and $value -notmatch $ValidationPattern) {
        Write-Host "Warning: Value doesn't match expected format. Continuing anyway..." -ForegroundColor Yellow
    }
    
    return $value
}

Write-Host ""
Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host "Required Variables" -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

# Required variables
$mongodbUri = Get-EnvValue -VarName "MONGODB_URI" -Description "MongoDB connection string" -Required $true
$nextAuthUrl = Get-EnvValue -VarName "NEXTAUTH_URL" -Description "NextAuth base URL" -Required $true -DefaultValue "http://localhost:3000"
$nextAuthSecret = Get-EnvValue -VarName "NEXTAUTH_SECRET" -Description "NextAuth secret key (min 32 chars)" -Required $true
$adminEmail = Get-EnvValue -VarName "ADMIN_EMAIL" -Description "Admin user email" -Required $true -DefaultValue "admin@equalityvanguard.org"
$adminPassword = Get-EnvValue -VarName "ADMIN_PASSWORD" -Description "Admin user password" -Required $true
$adminName = Get-EnvValue -VarName "ADMIN_NAME" -Description "Admin user name" -Required $true -DefaultValue "Admin User"
$r2AccessKey = Get-EnvValue -VarName "R2_ACCESS_KEY_ID" -Description "Cloudflare R2 access key" -Required $true
$r2SecretKey = Get-EnvValue -VarName "R2_SECRET_ACCESS_KEY" -Description "Cloudflare R2 secret key" -Required $true
$r2AccountId = Get-EnvValue -VarName "R2_ACCOUNT_ID" -Description "Cloudflare R2 account ID" -Required $true
$r2BucketName = Get-EnvValue -VarName "R2_BUCKET_NAME" -Description "Cloudflare R2 bucket name" -Required $true
$r2PublicUrl = Get-EnvValue -VarName "R2_PUBLIC_URL" -Description "Cloudflare R2 public URL" -Required $true
$nextPublicUrl = Get-EnvValue -VarName "NEXT_PUBLIC_URL" -Description "Public application URL" -Required $true -DefaultValue "http://localhost:3000"
$nextPublicApiUrl = Get-EnvValue -VarName "NEXT_PUBLIC_API_URL" -Description "Public API URL" -Required $true -DefaultValue "http://localhost:3000"
$nodeEnv = Get-EnvValue -VarName "NODE_ENV" -Description "Node environment" -Required $true -DefaultValue "development"

Write-Host ""
Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host "Optional Variables (Press Enter to skip)" -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

# Optional variables
$stripeSecretKey = Get-EnvValue -VarName "STRIPE_SECRET_KEY" -Description "Stripe secret key" -Required $false
$stripePublishableKey = Get-EnvValue -VarName "STRIPE_PUBLISHABLE_KEY" -Description "Stripe publishable key" -Required $false
$stripeWebhookSecret = Get-EnvValue -VarName "STRIPE_WEBHOOK_SECRET" -Description "Stripe webhook secret" -Required $false
$mpesaConsumerKey = Get-EnvValue -VarName "MPESA_CONSUMER_KEY" -Description "M-Pesa consumer key" -Required $false
$mpesaConsumerSecret = Get-EnvValue -VarName "MPESA_CONSUMER_SECRET" -Description "M-Pesa consumer secret" -Required $false
$mpesaShortcode = Get-EnvValue -VarName "MPESA_SHORTCODE" -Description "M-Pesa shortcode" -Required $false
$mpesaPasskey = Get-EnvValue -VarName "MPESA_PASSKEY" -Description "M-Pesa passkey" -Required $false
$mpesaEnvironment = Get-EnvValue -VarName "MPESA_ENVIRONMENT" -Description "M-Pesa environment (sandbox/production)" -Required $false -DefaultValue "sandbox"
$mailgunApiKey = Get-EnvValue -VarName "MAILGUN_API_KEY" -Description "Mailgun API key" -Required $false
$mailgunDomain = Get-EnvValue -VarName "MAILGUN_DOMAIN" -Description "Mailgun domain" -Required $false
$mailgunFromEmail = Get-EnvValue -VarName "MAILGUN_FROM_EMAIL" -Description "Mailgun from email" -Required $false
$mailgunFromName = Get-EnvValue -VarName "MAILGUN_FROM_NAME" -Description "Mailgun from name" -Required $false -DefaultValue "Equality Vanguard"
$mailchimpApiKey = Get-EnvValue -VarName "MAILCHIMP_API_KEY" -Description "Mailchimp API key" -Required $false
$mailchimpListId = Get-EnvValue -VarName "MAILCHIMP_LIST_ID" -Description "Mailchimp list ID" -Required $false
$mailchimpServerPrefix = Get-EnvValue -VarName "MAILCHIMP_SERVER_PREFIX" -Description "Mailchimp server prefix" -Required $false -DefaultValue "us1"
$recaptchaSiteKey = Get-EnvValue -VarName "RECAPTCHA_SITE_KEY" -Description "reCAPTCHA site key" -Required $false
$recaptchaSecretKey = Get-EnvValue -VarName "RECAPTCHA_SECRET_KEY" -Description "reCAPTCHA secret key" -Required $false

# Build .env.local content
$envContent = @"
# =============================================================================
# Equality Vanguard - Environment Variables
# Generated by setup-env-template.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# =============================================================================

# Database
MONGODB_URI=$mongodbUri

# Authentication
NEXTAUTH_URL=$nextAuthUrl
NEXTAUTH_SECRET=$nextAuthSecret

# Admin User
ADMIN_EMAIL=$adminEmail
ADMIN_PASSWORD=$adminPassword
ADMIN_NAME=$adminName

# Payments - Stripe
STRIPE_SECRET_KEY=$stripeSecretKey
STRIPE_PUBLISHABLE_KEY=$stripePublishableKey
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey
STRIPE_WEBHOOK_SECRET=$stripeWebhookSecret

# Payments - M-Pesa
MPESA_CONSUMER_KEY=$mpesaConsumerKey
MPESA_CONSUMER_SECRET=$mpesaConsumerSecret
MPESA_SHORTCODE=$mpesaShortcode
MPESA_PASSKEY=$mpesaPasskey
MPESA_ENVIRONMENT=$mpesaEnvironment

# Email - Mailgun
MAILGUN_API_KEY=$mailgunApiKey
MAILGUN_DOMAIN=$mailgunDomain
MAILGUN_FROM_EMAIL=$mailgunFromEmail
MAILGUN_FROM_NAME=$mailgunFromName

# Email - Mailchimp
MAILCHIMP_API_KEY=$mailchimpApiKey
MAILCHIMP_LIST_ID=$mailchimpListId
MAILCHIMP_SERVER_PREFIX=$mailchimpServerPrefix

# Storage - R2
R2_ACCESS_KEY_ID=$r2AccessKey
R2_SECRET_ACCESS_KEY=$r2SecretKey
R2_ACCOUNT_ID=$r2AccountId
R2_BUCKET_NAME=$r2BucketName
R2_PUBLIC_URL=$r2PublicUrl

# Security
RECAPTCHA_SITE_KEY=$recaptchaSiteKey
RECAPTCHA_SECRET_KEY=$recaptchaSecretKey

# Application
NEXT_PUBLIC_URL=$nextPublicUrl
NEXT_PUBLIC_API_URL=$nextPublicApiUrl
NODE_ENV=$nodeEnv
"@

# Write to .env.local
Write-Host ""
Write-Host "Writing .env.local..." -ForegroundColor Green
$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "=============================================================================" -ForegroundColor Green
Write-Host "Success! .env.local created." -ForegroundColor Green
Write-Host "=============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review .env.local and update any values as needed" -ForegroundColor White
Write-Host "2. Run: npm run validate:env" -ForegroundColor White
Write-Host "3. Never commit .env.local to version control" -ForegroundColor White
Write-Host ""



