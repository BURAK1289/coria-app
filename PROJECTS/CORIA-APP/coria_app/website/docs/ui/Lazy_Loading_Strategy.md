# Lazy Loading Strategy - Sprint 4 Day 3

**Date**: October 7, 2025
**Objective**: Reduce commons chunk (90.8KB) through strategic lazy-loading
**Target**: Reduce First Load JS from 192KB to <180KB

---

## Bundle Analysis Summary

### Current Bundle Composition
```
+ First Load JS shared by all: 192 kB
  ├ chunks/255-f8ac0e3c6fc5c36c.js       45.5 kB (Framework: React, Next.js)
  ├ chunks/69246950-687cf907729e0a7d.js  54.2 kB (Large libs: likely Framer Motion)
  ├ chunks/commons-fb8bfe7de15b699b.js   90.8 kB (Commons: shared components)
  └ other shared chunks (total)          1.88 kB
```

### Page-Specific Bundle Sizes
| Page | Page JS | First Load | Notes |
|------|---------|------------|-------|
| Home | 6.11 kB | 199 kB | ✅ Acceptable |
| Foundation | 3.75 kB | 196 kB | ✅ Good |
| Pricing | 2.96 kB | 195 kB | ✅ Good |
| Features | 9.93 kB | 202 kB | ⚠️ Check animations |
| Contact | 20.5 kB | 213 kB | 🔴 Investigate (form logic?) |
| Blog Post | 22.8 kB | 215 kB | 🔴 MDX rendering overhead |

---

## Identified Components for Lazy-Loading

### Priority 1: Framer Motion Components (Est. -20KB from commons)
**Issue**: Animation library likely bundled in commons chunk (54.2KB large libs)

**Components to Lazy-Load**:
1. **Hero Animations** (`src/components/sections/hero-section.tsx`)
   - Stagger animations
   - Fade-in effects
   - Button hover animations

2. **Features Showcase** (`src/components/sections/features-showcase.tsx`)
   - Card animations
   - Scroll-triggered animations
   - List stagger effects

3. **Blog Cards** (`src/components/blog/blog-card.tsx`)
   - Hover animations
   - Image transitions

**Implementation Strategy**:
```tsx
// BEFORE: Direct import (bundles in commons)
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/sections/hero-section';

// AFTER: Lazy-load with skeleton
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/sections/hero-section'), {
  loading: () => <HeroSkeleton />,
  ssr: true, // Keep SSR for SEO
});

// OR: Lazy-load animations only
const MotionDiv = dynamic(() =>
  import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);
```

### Priority 2: Analytics & Non-Critical Features (Est. -10KB)
**Components to Defer**:

1. **Analytics Provider** (`src/components/analytics/analytics-provider.tsx`)
   ```tsx
   // Load after page interactive
   useEffect(() => {
     import('@/components/analytics/analytics-provider').then((mod) => {
       mod.initAnalytics();
     });
   }, []);
   ```

2. **Consent Banner** (`src/components/analytics/consent-banner.tsx`)
   ```tsx
   const ConsentBanner = dynamic(() => import('@/components/analytics/consent-banner'), {
     ssr: false, // Client-side only
   });
   ```

3. **PWA Components** (InstallPrompt, UpdateNotification, NotificationPermission)
   ```tsx
   const InstallPrompt = dynamic(() => import('@/components/pwa/install-prompt'), {
     ssr: false,
   });
   ```

### Priority 3: Heavy Page-Specific Components (Est. -15KB)
**Contact Page (20.5KB)**:
- Form validation library (yup/zod)?
- ReCAPTCHA widget?
- Contact form logic

**Action**: Lazy-load contact form
```tsx
// src/app/[locale]/contact/page.tsx
const ContactForm = dynamic(() => import('@/components/forms/contact-form'), {
  loading: () => <FormSkeleton />,
  ssr: false, // Client-side only (form interaction)
});
```

**Blog Post Page (22.8KB)**:
- MDX components
- Syntax highlighting
- Social sharing widgets

**Action**: Code-split MDX components
```tsx
const MDXComponents = dynamic(() => import('@/components/mdx/mdx-components'), {
  loading: () => <ContentSkeleton />,
});
```

---

## Implementation Plan

### Phase 1: Framer Motion Lazy-Loading (30min)
**Files to Modify**:
1. `src/components/sections/hero-section.tsx`
2. `src/components/sections/features-showcase.tsx`
3. `src/components/blog/blog-card.tsx`

**Implementation**:
```tsx
// src/components/sections/hero-section.tsx
'use client';

import dynamic from 'next/dynamic';
import { HeroSkeleton } from './hero-skeleton';

// Lazy-load motion components
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero content */}
      </MotionDiv>
    </section>
  );
}
```

### Phase 2: Non-Critical Components (15min)
**Files to Modify**:
- `src/app/[locale]/layout.tsx`

**Implementation**:
```tsx
// src/app/[locale]/layout.tsx
import dynamic from 'next/dynamic';

// Lazy-load non-critical components
const ConsentBanner = dynamic(() => import('@/components/analytics/consent-banner'), {
  ssr: false,
});

const InstallPrompt = dynamic(() => import('@/components/pwa/install-prompt'), {
  ssr: false,
});

const UpdateNotification = dynamic(() => import('@/components/pwa/update-notification'), {
  ssr: false,
});

const NotificationPermission = dynamic(() => import('@/components/pwa/notification-permission'), {
  ssr: false,
});

export default async function LocaleLayout({ children, params }) {
  // ...existing code

  return (
    <html lang={locale}>
      <body>
        <ThemeProvider>
          <AnalyticsProvider>
            {children}
            <ConsentBanner />
            <InstallPrompt />
            <UpdateNotification />
            <NotificationPermission />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Phase 3: Page-Specific Lazy-Loading (15min)
**Contact Page**:
```tsx
// src/app/[locale]/contact/page.tsx
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('@/components/forms/contact-form'), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-32 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-32"></div>
    </div>
  ),
  ssr: false,
});
```

**Blog Post Page**:
```tsx
// src/app/[locale]/blog/[slug]/page.tsx
import dynamic from 'next/dynamic';

const MDXContent = dynamic(() => import('@/components/mdx/mdx-content'), {
  loading: () => <ContentSkeleton />,
});

const SocialShare = dynamic(() => import('@/components/blog/social-share'), {
  ssr: false,
});
```

---

## Expected Performance Impact

### Bundle Size Reduction
| Optimization | Current | After | Reduction |
|--------------|---------|-------|-----------|
| Commons chunk | 90.8 KB | ~70 KB | **-20.8 KB** |
| Large libs | 54.2 KB | ~44 KB | **-10 KB** |
| **Total First Load** | **192 KB** | **~171 KB** | **-21 KB (11%)** |

### LCP Impact
- **Reduced render-blocking JS**: -100ms to -200ms
- **Faster initial paint**: Critical components load first
- **Deferred non-critical**: Analytics, PWA features load after interaction

### FCP Impact
- **Faster First Contentful Paint**: -50ms to -100ms
- **Progressive enhancement**: Page usable faster, features load progressively

---

## Validation Strategy

### Build Analysis
```bash
# 1. Run build with analysis
ANALYZE=true npm run build

# 2. Check bundle sizes
# - Commons chunk should be ~70KB (down from 90.8KB)
# - Large libs should be ~44KB (down from 54.2KB)
# - First Load JS should be ~171KB (down from 192KB)

# 3. Verify lazy-loading
# - Check Network tab in DevTools
# - Confirm components load on demand
# - Verify no duplicate bundles
```

### Performance Testing
```bash
# 1. Start production server
npm run start

# 2. Test with Chrome DevTools
# - Open Performance tab
# - Record page load
# - Verify:
#   - FCP < 1.5s
#   - LCP < 3.5s (target after all optimizations)
#   - No large JS blocking render

# 3. Test lazy-loading behavior
# - Scroll to trigger lazy components
# - Verify network requests only fire when needed
# - Check for flash of unstyled content (FOUC)
```

---

## Implementation Checklist

### Phase 1: Framer Motion (30min)
- [ ] Create `HeroSkeleton` component
- [ ] Lazy-load `hero-section.tsx` animations
- [ ] Lazy-load `features-showcase.tsx` animations
- [ ] Lazy-load `blog-card.tsx` hover effects
- [ ] Test animation loading behavior

### Phase 2: Non-Critical (15min)
- [ ] Lazy-load `ConsentBanner`
- [ ] Lazy-load `InstallPrompt`
- [ ] Lazy-load `UpdateNotification`
- [ ] Lazy-load `NotificationPermission`
- [ ] Verify PWA features still work

### Phase 3: Page-Specific (15min)
- [ ] Create `FormSkeleton` component
- [ ] Lazy-load contact form
- [ ] Create `ContentSkeleton` component
- [ ] Lazy-load MDX components
- [ ] Lazy-load social share widgets

### Phase 4: Validation (30min)
- [ ] Run `ANALYZE=true npm run build`
- [ ] Verify bundle size reduction
- [ ] Test lazy-loading in browser
- [ ] Measure LCP improvement
- [ ] Update documentation

---

## Risks & Mitigation

### Risk 1: FOUC (Flash of Unstyled Content)
**Mitigation**:
- Use loading skeletons matching final layout
- Keep critical components in main bundle
- Test loading states thoroughly

### Risk 2: SEO Impact
**Mitigation**:
- Keep `ssr: true` for content components
- Only set `ssr: false` for interactive features
- Verify Google can crawl lazy-loaded content

### Risk 3: Slower Perceived Performance
**Mitigation**:
- Preload critical lazy components
- Use intersection observer for below-fold
- Progressive enhancement approach

---

## Next Steps

1. **Implement Phase 1**: Framer Motion lazy-loading (30min)
2. **Implement Phase 2**: Non-critical components (15min)
3. **Implement Phase 3**: Page-specific (15min)
4. **Run bundle analysis**: Verify reduction (5min)
5. **Performance testing**: Measure impact (15min)
6. **Update documentation**: Record results (10min)

**Total Time**: ~90 minutes
**Expected Outcome**: -21KB bundle size, -100-200ms LCP improvement

---

**Created**: October 7, 2025 - Sprint 4 Day 3
**Status**: 🔄 READY FOR IMPLEMENTATION
