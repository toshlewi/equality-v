#!/bin/bash

# Equality Vanguard - Vercel Deployment Helper Script
# This script helps prepare your project for Vercel deployment

set -e

echo "🚀 Equality Vanguard - Vercel Deployment Helper"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
echo "📁 Checking project directory..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Project directory confirmed${NC}"
echo ""

# Step 2: Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"
if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js 18+ recommended for Next.js 15${NC}"
else
    echo -e "${GREEN}✅ Node.js version is compatible${NC}"
fi
echo ""

# Step 3: Install dependencies
echo "📦 Installing dependencies..."
if npm ci; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 4: Run type check
echo "🔍 Running TypeScript type check..."
if npm run type-check; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type check found issues (non-blocking)${NC}"
fi
echo ""

# Step 5: Test build
echo "🏗️  Testing production build..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi
echo ""

# Step 6: Clean up build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf .next
echo -e "${GREEN}✅ Cleaned up${NC}"
echo ""

# Step 7: Git status check
echo "📊 Checking Git status..."
if [ -d ".git" ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
        git status --short
        echo ""
        read -p "Do you want to commit these changes? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " COMMIT_MSG
            git add .
            git commit -m "$COMMIT_MSG"
            echo -e "${GREEN}✅ Changes committed${NC}"
        fi
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
    
    echo ""
    read -p "Do you want to push to GitHub? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BRANCH=$(git branch --show-current)
        git push origin $BRANCH
        echo -e "${GREEN}✅ Pushed to GitHub${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not a Git repository. Initialize Git first:${NC}"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   git push -u origin main"
fi
echo ""

# Step 8: Display next steps
echo "================================================"
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New Project'"
echo "3. Import your GitHub repository"
echo "4. Add environment variables from VERCEL_ENV_VARIABLES.txt"
echo "5. Click 'Deploy'"
echo ""
echo "📄 Important Files:"
echo "   - VERCEL_DEPLOYMENT_GUIDE.md (Complete deployment guide)"
echo "   - VERCEL_ENV_VARIABLES.txt (Environment variables to copy)"
echo ""
echo "🎯 After deployment:"
echo "   1. Update NEXTAUTH_URL with your Vercel URL"
echo "   2. Update R2_PUBLIC_URL with your Vercel URL"
echo "   3. Set up Stripe webhook"
echo "   4. Visit /api/seed to create admin user"
echo ""
echo "================================================"
echo -e "${GREEN}🚀 Ready to deploy to Vercel!${NC}"
echo ""
