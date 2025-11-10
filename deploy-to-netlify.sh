#!/bin/bash

# Deploy Equality Vanguard to Netlify
# This script helps you deploy the application to Netlify

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║        Equality Vanguard - Netlify Deployment              ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✓ Netlify CLI installed${NC}"
else
    echo -e "${GREEN}✓ Netlify CLI found${NC}"
fi

echo ""
echo -e "${BLUE}Step 1: Pre-deployment checks${NC}"
echo "─────────────────────────────────────────────────────────────"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found!${NC}"
    echo -e "${YELLOW}Please create .env.local with your environment variables${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.local found${NC}"

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies found${NC}"
fi

# Test build locally
echo -e "${YELLOW}Testing build locally...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    echo -e "${YELLOW}Please fix build errors before deploying${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Netlify Setup${NC}"
echo "─────────────────────────────────────────────────────────────"

# Login to Netlify
echo -e "${YELLOW}Logging in to Netlify...${NC}"
netlify login

# Check if site is already linked
if [ -f .netlify/state.json ]; then
    echo -e "${GREEN}✓ Site already linked${NC}"
    SITE_NAME=$(netlify status --json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}Site: ${SITE_NAME}${NC}"
else
    echo -e "${YELLOW}Initializing new site...${NC}"
    netlify init
fi

echo ""
echo -e "${BLUE}Step 3: Environment Variables${NC}"
echo "─────────────────────────────────────────────────────────────"
echo -e "${YELLOW}⚠️  Important: You need to set environment variables in Netlify${NC}"
echo ""
echo -e "Options:"
echo -e "  1. ${GREEN}Automated${NC}: Run ./scripts/netlify-env-setup.sh YOUR-SITE-NAME"
echo -e "  2. ${GREEN}Manual${NC}: Go to Netlify dashboard → Site settings → Environment variables"
echo -e "  3. ${GREEN}CLI${NC}: Use 'netlify env:set VARIABLE_NAME \"value\"'"
echo ""
echo -e "See ${BLUE}NETLIFY_ENV_SETUP.md${NC} for complete list of variables"
echo ""
read -p "Have you set all environment variables? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please set environment variables before deploying${NC}"
    echo -e "Run: ${GREEN}./scripts/netlify-env-setup.sh YOUR-SITE-NAME${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Deploy to Netlify${NC}"
echo "─────────────────────────────────────────────────────────────"
echo -e "${YELLOW}Deploying to production...${NC}"

if netlify deploy --prod; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║              🎉 Deployment Successful! 🎉                  ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Get site URL
    SITE_URL=$(netlify status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}Your site is live at: ${BLUE}${SITE_URL}${NC}"
    echo ""
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo -e "1. ${GREEN}Update Stripe webhook${NC}"
    echo -e "   URL: ${SITE_URL}/api/webhooks/stripe"
    echo -e "   Dashboard: https://dashboard.stripe.com/webhooks"
    echo ""
    echo -e "2. ${GREEN}Update M-Pesa callback${NC} (if using production)"
    echo -e "   URL: ${SITE_URL}/api/webhooks/mpesa"
    echo ""
    echo -e "3. ${GREEN}Test your site${NC}"
    echo -e "   - Visit: ${SITE_URL}"
    echo -e "   - Test donation form"
    echo -e "   - Test admin login: ${SITE_URL}/admin"
    echo ""
    echo -e "4. ${GREEN}Monitor logs${NC}"
    echo -e "   Run: netlify logs"
    echo -e "   Or visit: Netlify dashboard → Functions"
    echo ""
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    echo ""
    
    # Open site in browser
    read -p "Open site in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        netlify open:site
    fi
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║              ✗ Deployment Failed ✗                         ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo -e "1. Check build logs above for errors"
    echo -e "2. Verify all environment variables are set"
    echo -e "3. Run: ${GREEN}netlify logs${NC}"
    echo -e "4. Check: ${BLUE}NETLIFY_SETUP.md${NC} for troubleshooting"
    echo ""
    exit 1
fi
