#!/bin/bash

# CORIA Website Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Deploying CORIA website to $ENVIRONMENT..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌍 Deploying to production..."
    
    # Pull production environment
    vercel pull --yes --environment=production
    
    # Build for production
    vercel build --prod
    
    # Deploy to production
    vercel deploy --prebuilt --prod
    
    # Run Lighthouse audit
    echo "🔍 Running Lighthouse audit..."
    npm run lighthouse:ci
    
    echo "✅ Production deployment complete!"
    echo "🌐 Site available at: https://coria.app"
    
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo "🧪 Deploying to staging..."
    
    # Pull preview environment
    vercel pull --yes --environment=preview
    
    # Build for preview
    vercel build
    
    # Deploy to preview
    PREVIEW_URL=$(vercel deploy --prebuilt)
    
    echo "✅ Staging deployment complete!"
    echo "🌐 Preview available at: $PREVIEW_URL"
    
else
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "🎉 Deployment finished successfully!"