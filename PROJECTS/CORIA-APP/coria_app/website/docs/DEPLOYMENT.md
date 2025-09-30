# CORIA Website Deployment Guide

## Overview

This guide covers the deployment setup for the CORIA website using Vercel with custom domain configuration, SSL certificates, and CDN optimization.

## Prerequisites

- Vercel account with team access
- GitHub repository access
- Domain registrar access (for coria.app)
- Environment variables configured

## Environment Setup

### Required Environment Variables

#### Vercel Project Settings
```bash
# Vercel Configuration
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TOKEN=your_vercel_token
```

#### Application Environment Variables
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://coria.app
CONTENTFUL_SPACE_ID=your_contentful_space_id
CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Setting Up Environment Variables

1. **Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add all required variables for Production, Preview, and Development

2. **GitHub Secrets**:
   - Go to Repository Settings → Secrets and Variables → Actions
   - Add all secrets required by the deployment workflow

## Custom Domain Configuration

### 1. Domain Setup

1. **Add Domain in Vercel**:
   ```bash
   vercel domains add coria.app
   vercel domains add www.coria.app
   ```

2. **DNS Configuration**:
   ```
   # A Records
   @ → 76.76.19.61
   www → cname.vercel-dns.com
   
   # CNAME Records
   www → coria.app
   ```

### 2. SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt:
- Automatic renewal every 90 days
- Wildcard certificates for subdomains
- HTTP/2 and HTTP/3 support enabled

### 3. Subdomain Configuration

```bash
# Staging environment
staging.coria.app → staging-coria-website.vercel.app

# Development environment  
dev.coria.app → dev-coria-website.vercel.app
```

## CDN Configuration

### Global Performance Optimization

Vercel's Edge Network provides:
- **Global CDN**: 40+ regions worldwide
- **Edge Caching**: Static assets cached at edge locations
- **Smart Routing**: Automatic traffic routing to nearest edge
- **Image Optimization**: Automatic WebP/AVIF conversion

### Regional Configuration

```json
{
  "regions": ["fra1", "iad1", "sfo1"],
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 30
    }
  }
}
```

### Cache Headers

```javascript
// Static assets - 1 year cache
"Cache-Control": "public, max-age=31536000, immutable"

// Service Worker - No cache
"Cache-Control": "public, max-age=0, must-revalidate"

// HTML pages - 1 hour cache with revalidation
"Cache-Control": "public, max-age=3600, must-revalidate"
```

## Deployment Environments

### 1. Production Environment

- **URL**: https://coria.app
- **Branch**: `main`
- **Auto-deploy**: Enabled
- **Environment**: `production`

**Deployment Process**:
1. Push to `main` branch
2. Automated tests run
3. Build and deploy to production
4. Lighthouse audit
5. Performance monitoring

### 2. Staging Environment

- **URL**: https://staging.coria.app
- **Branch**: `develop`
- **Auto-deploy**: Enabled
- **Environment**: `preview`

**Deployment Process**:
1. Push to `develop` branch
2. Automated tests run
3. Deploy to staging
4. Preview URL generated

### 3. Preview Deployments

- **Trigger**: Pull requests
- **URL**: Auto-generated preview URLs
- **Environment**: `preview`

## Manual Deployment

### Using Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Performance Monitoring

### Lighthouse CI

Automated performance audits run on every production deployment:

```javascript
// Performance thresholds
'categories:performance': ['error', { minScore: 0.9 }]
'categories:accessibility': ['error', { minScore: 0.9 }]
'categories:best-practices': ['error', { minScore: 0.95 }]
'categories:seo': ['error', { minScore: 1.0 }]
```

### Core Web Vitals

Monitoring key metrics:
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Real User Monitoring

```javascript
// Vercel Analytics integration
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Security Configuration

### Security Headers

```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options", 
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    }
  ]
}
```

### Content Security Policy

```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: *.contentful.com;
      font-src 'self';
      connect-src 'self' *.contentful.com *.google-analytics.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   vercel logs
   
   # Local build test
   npm run build
   ```

2. **Environment Variables**:
   ```bash
   # List environment variables
   vercel env ls
   
   # Pull environment variables
   vercel env pull .env.local
   ```

3. **Domain Issues**:
   ```bash
   # Check domain status
   vercel domains ls
   
   # Verify DNS configuration
   dig coria.app
   ```

### Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Performance Optimization**: https://web.dev/performance/

## Rollback Procedures

### Automatic Rollback

Vercel provides instant rollback capabilities:

1. Go to Vercel Dashboard → Deployments
2. Select previous successful deployment
3. Click "Promote to Production"

### Manual Rollback

```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote [deployment-url] --scope=team
```

## Monitoring and Alerts

### Uptime Monitoring

- **Service**: Vercel Analytics + external monitoring
- **Endpoints**: Homepage, API routes, critical pages
- **Alerts**: Email/Slack notifications for downtime

### Performance Alerts

- **Core Web Vitals**: Automated alerts for threshold breaches
- **Error Rate**: Sentry integration for error tracking
- **Build Failures**: GitHub Actions notifications

## Maintenance Schedule

### Regular Tasks

- **Weekly**: Review performance metrics
- **Monthly**: Security audit and dependency updates
- **Quarterly**: Full performance audit and optimization review

### Emergency Procedures

1. **Immediate Issues**: Use Vercel rollback
2. **Critical Bugs**: Hotfix deployment process
3. **Security Issues**: Emergency deployment with security patches