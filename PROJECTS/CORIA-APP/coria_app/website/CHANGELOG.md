# Changelog

All notable changes to the CORIA website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-icons] - 2025-10-13

### Added
- **Icon System v1.0**: Complete custom icon infrastructure with 78 icons across 6 categories
  - Core Icons (14): home, menu, search, user, settings, filter, bell, plus, minus, sort, cart, globe, language, wallet
  - Brand Icons (17): CORIA foundation, vegan analysis, AI assistant, smart pantry, community, ESG score, carbon/water tracking, token economy, transparency, impact focus, green energy, sustainability, leaf, carbon, water, heart, cycle
  - Social Icons (5): Twitter, LinkedIn, Instagram, YouTube, Facebook
  - Navigation Icons (14): arrow-up/down/left/right, chevron-down/left/right, external-link, book-open, and directional indicators
  - Actions Icons (12): check, close, download, upload, share, refresh, shield-check, smartphone, and interaction triggers
  - Status Icons (9): alert-triangle, info, bug, bar-chart, trending-up, file-text, flask, star, question
- **Icon Playground** (`/dev/icons`): Interactive developer tool with real-time search, 6 size controls, 15 brand color previews, and 4 copyable code patterns
- **Icon Build Pipeline**: Automated SVG optimization (SVGO) and React component generation (SVGR) with ~32% size reduction
- **CI/CD Quality Gates**:
  - Icon Guard job: Validates icon system integrity and blocks lucide-react imports
  - Bundle Size Check: Enforces 205 kB First Load JS limit (Next.js recommendation)
  - Artifact tracking: Icon check reports with 7-day retention
- **Comprehensive Documentation** (4,000+ lines):
  - Icon Catalog Guide (1,076 lines): Complete icon reference with usage patterns
  - Icon Build Pipeline (693 lines): Build system and optimization details
  - Icon Migration Report (652 lines): Technical migration documentation
  - Icon Playground Usage Guide (600+ lines): Developer tool instructions
  - CI Pipeline Enhancements (457 lines): CI/CD integration details
  - Release Notes: User-facing release information

### Changed
- **Bundle Size**: Reduced by ~153 KB (82% improvement) through lucide-react removal
  - Before: ~185 KB (lucide-react dependency)
  - After: ~32 KB (20 actively used CORIA icons)
- **Icon Components**: Now memoized for optimal rendering performance
- **Tree-Shaking**: Full support enabled - only bundle icons you import
- **Type Safety**: All icons now have TypeScript autocomplete and validation

### Removed
- **lucide-react dependency**: Completely removed (~185 KB)
- All lucide-react imports migrated to CORIA Icon system (12 files, 48 usages)

### Fixed
- **Accessibility**: All icons now WCAG 2.1 AA compliant with proper ARIA patterns
  - Decorative icons: aria-hidden="true" with adjacent text labels
  - Interactive icons: aria-label on parent elements for icon-only buttons
  - Informational icons: Direct aria-label for standalone status indicators
- **Performance**: First Load JS maintained under 205 kB Next.js recommendation

### Migration Guide
**Breaking Change**: lucide-react removed

**Before:**
```tsx
import { CheckIcon } from 'lucide-react';
<CheckIcon className="h-4 w-4" />
```

**After:**
```tsx
import { Icon } from '@/components/icons/Icon';
<Icon name="check" size={16} aria-hidden="true" />
```

**Size Conversion:**
- `h-4 w-4` → `size={16}`
- `h-5 w-5` → `size={20}`
- `h-6 w-6` → `size={24}`
- `h-8 w-8` → `size={32}`

**Validation Commands:**
```bash
npm run icons:ci-guard  # Check for lucide-react violations
npm run icons:check     # Validate icon system integrity
npm run build           # Verify production build succeeds
```

### Security
- Icon components follow zero-trust principles with proper sanitization
- All SVG content validated during build process
- No external icon CDN dependencies - all icons bundled securely

### Documentation
- See [Release Notes](docs/ui/Release_Notes_Icon_System_v1.0.md) for complete details
- See [Icon Catalog Guide](docs/ui/Icon_Catalog_Guide.md) for icon reference
- See [Icon Playground Usage Guide](docs/ui/Icon_Playground_Usage.md) for developer tool
- See [Migration Report](claudedocs/phase-3-3-icon-migration-report.md) for technical details

---

[Unreleased]: https://github.com/coria/website/compare/v1.0.0-icons...HEAD
[1.0.0-icons]: https://github.com/coria/website/releases/tag/v1.0.0-icons
