# Icon Design Brief

**Project**: CORIA Website Icon System
**Version**: 1.0.0
**Date**: October 12, 2025
**Status**: Design Specification

---

## Design Philosophy

### Core Principles

1. **Organic Minimalism**: Icons reflect CORIA's connection to nature through clean, purposeful design
2. **Functional Clarity**: Every icon must be instantly recognizable at all sizes
3. **Systematic Consistency**: Unified stroke, grid, and color system across all icons
4. **Accessible by Default**: WCAG 2.1 AA compliance built into design specs
5. **Performance First**: Optimized for web delivery and tree-shaking

### Visual Identity

CORIA icons embody:
- **Nature-Inspired**: Rounded corners, organic shapes, flowing lines
- **Modern Simplicity**: Clean outlines, minimal detail, essential forms
- **Purposeful Design**: Every stroke serves a function
- **Brand Harmony**: Aligns with CORIA's green palette and leaf/heart motif

---

## Grid System

### Base Grid Specification

**Primary Grid**: 24×24 pixels
- Canvas size: 24×24px
- Safe area: 22×22px (1px padding)
- Keyline shapes:
  - Circle: 20px diameter (centered)
  - Square: 18×18px (centered)
  - Rectangle (portrait): 14×20px (centered)
  - Rectangle (landscape): 20×14px (centered)

**Grid Structure**:
```
┌─────────────────────────┐
│ 1px padding             │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   22×22 safe area │  │
│  │                   │  │
│  │   20px circle     │  │
│  │   18×18 square    │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
24×24 canvas
```

### Size Variants

| Size | Use Case | Grid | Stroke Adjustment |
|------|----------|------|-------------------|
| 16×16 | Inline text, dense UI | 16×16 canvas, 14×14 safe | 1.25px (thicker for clarity) |
| 20×20 | Compact buttons, nav | 20×20 canvas, 18×18 safe | 1.5px (standard) |
| **24×24** | **Primary size** | 24×24 canvas, 22×22 safe | **1.75px (base)** |
| 32×32 | Hero sections, large buttons | 32×32 canvas, 30×30 safe | 2px (visible at distance) |

**Scaling Formula**:
```
stroke_width = base_stroke × (target_size / 24)

Example 16×16:
1.75px × (16/24) = 1.17px → round to 1.25px
```

---

## Stroke Specifications

### Stroke Width Standards

**Primary**: 1.75px ± 0.25 (range: 1.5-2.0)
- Standard outline icons: 1.75px
- Delicate details: 1.5px
- Bold emphasis: 2.0px

**Secondary** (special cases):
- Decorative elements: 1.0px
- Subtle textures: 0.5px
- Never below 0.5px (visibility threshold)

### Stroke Properties

```css
/* CSS Stroke Standard */
stroke-width: 1.75;
stroke-linecap: round;
stroke-linejoin: round;
stroke-miterlimit: 10;
```

**SVG Attributes**:
```xml
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- icon paths -->
</svg>
```

### Corner Radius Guidelines

| Element Type | Radius | Example |
|--------------|--------|---------|
| Sharp corners | 0px | Arrows, technical icons |
| Soft corners | 1-2px | Rounded rectangles |
| Circular elements | 50% | Circles, pills |
| Organic shapes | Variable | Natural curves (leaf, water drop) |

**Rule**: Prefer round caps/joins over sharp corners for friendlier aesthetic

---

## Style System

### Icon Styles

CORIA uses three icon styles based on context:

#### 1. Outline (Primary Style)

**When to use**: Navigation, actions, UI controls
**Characteristics**:
- Stroke-only, no fill
- 1.75px stroke width
- `currentColor` for adaptability
- Clean, minimal detail

```xml
<!-- Outline Icon Example -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>
```

#### 2. Solid (Secondary Style)

**When to use**: Brand icons, active states, emphasis
**Characteristics**:
- Fill-only, no stroke
- `currentColor` for fill
- Bold presence
- Use sparingly for hierarchy

```xml
<!-- Solid Icon Example -->
<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</svg>
```

#### 3. Two-Tone (Tertiary Style)

**When to use**: Complex brand icons, feature illustrations
**Characteristics**:
- Combination of fill + stroke
- Primary element: solid or high opacity
- Secondary element: 10-40% opacity
- Adds depth and dimension

```xml
<!-- Two-Tone Icon Example -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
  <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.1" />
  <circle cx="12" cy="12" r="6" stroke="currentColor" />
  <path d="M12 8v4l2 2" stroke="currentColor" stroke-width="2" />
</svg>
```

### Style Selection Matrix

| Context | Style | Rationale |
|---------|-------|-----------|
| Top nav | Outline | Clean, scalable |
| Active nav item | Solid | Visual emphasis |
| Feature icons | Two-tone | Brand personality |
| Action buttons | Outline | Clarity over decoration |
| Social media | Solid | Brand recognition |
| Loading states | Outline | Animation-friendly |
| Error/warning | Solid | Immediate recognition |
| Form controls | Outline | Functional clarity |

---

## Color Integration

### Color Token Mapping

All icons use `currentColor` by default, inheriting from parent element:

```tsx
// Automatically inherits text color
<Icon name="search" className="text-coria-primary" />
```

### Semantic Color Usage

| State | Token | Hex | Use Case |
|-------|-------|-----|----------|
| Primary | `var(--coria-primary)` | #1B5E3F | Default icons |
| Success | `var(--coria-success)` | #66BB6A | Checkmarks, confirmations |
| Warning | `var(--coria-warning)` | #FFD93D | Alert icons |
| Error | `var(--coria-error)` | #FF6B6B | Error states, delete actions |
| Info | `var(--coria-info)` | #87CEEB | Information, help icons |
| Muted | `var(--coria-gray-400)` | #B6B2AA | Disabled, inactive |

### Opacity System for Two-Tone Icons

| Layer | Opacity | Purpose | Example |
|-------|---------|---------|---------|
| Background | 0.06-0.10 | Subtle context | Circle behind icon |
| Secondary | 0.20-0.40 | Supporting elements | Icon details |
| Primary | 0.60-0.80 | Main shapes | Primary icon form |
| Focal | 0.90-1.00 | Key elements | Important details |

**Example Implementation**:
```xml
<svg>
  <!-- Background: 10% opacity -->
  <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.1" />

  <!-- Secondary: 30% opacity -->
  <path d="..." fill="currentColor" fill-opacity="0.3" />

  <!-- Primary: 80% opacity -->
  <path d="..." fill="currentColor" fill-opacity="0.8" />

  <!-- Focal: 100% opacity -->
  <circle cx="12" cy="12" r="2" fill="currentColor" />
</svg>
```

### Dark Mode Considerations

Icons automatically adapt to dark mode via CSS variables:

```css
/* Light mode */
:root {
  --icon-primary: #1B5E3F;
  --icon-muted: #B6B2AA;
}

/* Dark mode (80% brightness) */
[data-theme="dark"] {
  --icon-primary: #3F7C5A; /* Lighter variant */
  --icon-muted: #7A8B7F;
}
```

**Implementation**:
```tsx
// Icon automatically adapts to theme
<Icon name="menu" className="text-coria-primary" />
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### 1. Color Contrast

**Text-sized icons (16-20px)**:
- Minimum ratio: 4.5:1 against background
- Enhanced ratio: 7:1 (AAA level)

**Large icons (24px+)**:
- Minimum ratio: 3:1 against background
- Enhanced ratio: 4.5:1 (AAA level)

**Testing**:
```bash
# Use contrast checker
Primary (#1B5E3F) on White (#FFFFFF) = 8.3:1 ✅
Gray-400 (#B6B2AA) on White = 2.8:1 ⚠️ (fails for small text)
```

#### 2. Semantic Attributes

**Standalone icons** (convey meaning without text):
```tsx
<svg
  role="img"
  aria-label="Search products"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Search</title>
  <!-- paths -->
</svg>
```

**Decorative icons** (accompany text):
```tsx
<button>
  <svg aria-hidden="true">
    <!-- paths -->
  </svg>
  Search Products
</button>
```

**Interactive icons** (buttons, links):
```tsx
<button aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">
    <use href="#icon-close" />
  </svg>
</button>
```

#### 3. Focus Indicators

Icons within interactive elements must have visible focus:

```css
/* Focus ring for icon buttons */
button:focus-visible {
  outline: 2px solid var(--coria-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Ensure icon inherits focus color */
button:focus-visible svg {
  color: var(--coria-primary);
}
```

#### 4. Touch Target Size

Interactive icons must meet minimum touch target:
- **Minimum**: 44×44px (iOS/Android guideline)
- **Recommended**: 48×48px (Material Design)

```tsx
// Icon with proper touch target
<button className="w-12 h-12 flex items-center justify-center">
  <Icon name="menu" size={24} /> {/* 24px icon in 48px target */}
</button>
```

### Screen Reader Support

#### Icon Announcements

**Informative icons**:
```tsx
<Icon name="success" title="Success" aria-label="Operation completed successfully" />
```

**Status icons**:
```tsx
<Icon name="loading" role="status" aria-live="polite" aria-label="Loading content" />
```

**Decorative icons**:
```tsx
<Icon name="star" aria-hidden="true" /> {/* Not announced */}
```

#### Best Practices

1. **Always provide text alternative** for standalone icons
2. **Use `aria-hidden="true"`** for decorative icons
3. **Include `<title>` element** for tooltip support
4. **Set `role="img"`** for semantic icons
5. **Use `aria-live` regions** for dynamic icon changes

---

## Animation Guidelines

### Motion Principles

1. **Purpose-Driven**: Animations should enhance UX, not distract
2. **Performant**: Use CSS transforms and opacity (GPU-accelerated)
3. **Accessible**: Respect `prefers-reduced-motion`
4. **Subtle**: 200-400ms duration for micro-interactions

### Common Animations

#### 1. Hover State

```css
.icon-button svg {
  transition: transform 0.2s ease, color 0.2s ease;
}

.icon-button:hover svg {
  transform: scale(1.1);
  color: var(--coria-primary);
}
```

#### 2. Loading Spinner

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-loading {
  animation: spin 1s linear infinite;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .icon-loading {
    animation: none;
  }
}
```

#### 3. Success Checkmark

```css
@keyframes checkmark {
  0% {
    stroke-dashoffset: 24;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.icon-check path {
  stroke-dasharray: 24;
  animation: checkmark 0.4s ease-out;
}
```

#### 4. Pulse (Notification)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.icon-notification {
  animation: pulse 2s ease-in-out infinite;
}
```

### Animation Accessibility

```tsx
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Conditionally apply animation
<Icon
  name="loading"
  className={prefersReducedMotion ? '' : 'animate-spin'}
/>
```

---

## Implementation Specifications

### SVG Structure Template

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- Optional: Title for accessibility -->
  <title>Icon Name</title>

  <!-- Icon paths and shapes -->
  <path d="..." />
  <circle cx="12" cy="12" r="10" />

  <!-- Optional: Background for two-tone style -->
  <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.1" />
</svg>
```

### React Component Template

```tsx
import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export function IconName({
  size = 24,
  title,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Icon paths */}
      <path d="..." />
    </svg>
  );
}
```

### TypeScript Types

```typescript
// Icon name string literal union
export type IconName =
  | 'home'
  | 'menu'
  | 'search'
  | 'user'
  | 'settings'
  // ... all icon names
  ;

// Icon size variants
export type IconSize = 16 | 20 | 24 | 32 | number;

// Icon style variants
export type IconStyle = 'outline' | 'solid' | 'two-tone';

// Icon props interface
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: IconSize;
  style?: IconStyle;
  color?: string;
  title?: string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}
```

---

## Quality Checklist

### Pre-Production Validation

Before adding any icon to the library, verify:

#### Visual Quality
- [ ] Icon renders clearly at all sizes (16, 20, 24, 32)
- [ ] Stroke width is consistent (1.75px ± 0.25)
- [ ] Corners use round caps/joins
- [ ] Icon fits within 22×22 safe area
- [ ] Visual weight matches existing icons
- [ ] Recognizable at small sizes (16×16)

#### Technical Quality
- [ ] `viewBox="0 0 24 24"` is correct
- [ ] Paths use relative commands (lowercase)
- [ ] No unnecessary transforms or groups
- [ ] Optimized with SVGO (remove metadata)
- [ ] File size < 2KB
- [ ] Uses `currentColor` for adaptability

#### Accessibility
- [ ] `<title>` element present (if standalone)
- [ ] `role="img"` added (if semantic)
- [ ] `aria-hidden="true"` (if decorative)
- [ ] Color contrast ratio meets WCAG AA
- [ ] Touch target ≥ 44×44px (if interactive)

#### Code Quality
- [ ] TypeScript types defined
- [ ] Props interface extends SVGProps
- [ ] Size prop with default value
- [ ] Component exported from icons-map
- [ ] Documentation added to usage guide

#### Brand Alignment
- [ ] Matches CORIA design language
- [ ] Consistent with existing icon family
- [ ] Aligns with organic minimalism principle
- [ ] No trademark violations (for brand icons)

---

## File Naming Conventions

### Icon File Names

**Format**: `icon-[name].tsx`

Examples:
- `icon-home.tsx`
- `icon-search.tsx`
- `icon-arrow-right.tsx`
- `icon-chevron-down.tsx`

**Rules**:
- Lowercase only
- Kebab-case for multi-word names
- Descriptive, not implementation-specific
- Match semantic meaning, not visual appearance

### Component Naming

**Format**: `[Name]Icon`

Examples:
- `HomeIcon`
- `SearchIcon`
- `ArrowRightIcon`
- `ChevronDownIcon`

**Rules**:
- PascalCase
- Suffix with "Icon"
- Match file name in casing

---

## Version Control & Changelog

### Icon Versioning

Icons follow semantic versioning based on changes:

**Major (X.0.0)**: Breaking changes
- Grid system redesign
- Stroke width standard change
- Style system overhaul

**Minor (1.X.0)**: New features
- New icon additions
- New size variants
- Style variants

**Patch (1.0.X)**: Bug fixes
- Path corrections
- Accessibility improvements
- Optimization updates

### Changelog Format

```markdown
## [1.1.0] - 2025-10-15

### Added
- New icons: search, filter, menu, user, settings, bell (6 icons)
- Size variants: 16×16, 20×20, 32×32
- Two-tone style support

### Changed
- Standardized stroke width to 1.75px (from 2px)
- Updated accessibility attributes on all icons

### Fixed
- ChevronDownIcon path rendering at 16×16
- SearchIcon alignment in Safari
```

---

## Design Tools & Resources

### Recommended Tools

1. **Figma** (Primary)
   - 24×24 frame template
   - Stroke width: 1.75px
   - Export: SVG, optimize on export

2. **Adobe Illustrator**
   - Artboard: 24×24px
   - Stroke: 1.75pt, round caps
   - Export: SVG, optimize with SVGO

3. **SVGOMG** (Optimization)
   - Remove metadata: ✅
   - Remove comments: ✅
   - Merge paths: ✅
   - Round coordinates: 2 decimals

4. **Contrast Checker**
   - WebAIM Contrast Checker
   - Chrome DevTools: Lighthouse

### Icon Design Resources

**Inspiration** (maintain CORIA originality):
- Heroicons (outline style reference)
- Feather Icons (minimalism)
- Phosphor Icons (two-tone patterns)
- Material Symbols (grid system)

**Do NOT copy** - use for structural reference only

---

## Support & Maintenance

### Icon Request Process

1. **Submit Request**: Create GitHub issue with label `icon-request`
2. **Design Review**: Frontend team reviews feasibility
3. **Design**: Create icon following this specification
4. **Quality Check**: Run through checklist
5. **Implementation**: Add to icons-map and update docs
6. **Release**: Publish in next minor version

### Icon Update Process

1. **Identify Issue**: File bug or improvement request
2. **Impact Analysis**: Check usage across codebase
3. **Update Design**: Maintain backward compatibility if possible
4. **Visual Regression Test**: Compare before/after
5. **Deploy**: Update in all size variants

### Deprecation Policy

Icons should rarely be deprecated. If necessary:
1. Mark as `@deprecated` in code comments
2. Add deprecation notice to changelog
3. Provide migration path to replacement icon
4. Remove in next major version (1-2 releases later)

---

## Conclusion

This design brief establishes the foundation for a scalable, accessible, and performant icon system for CORIA. All icons must adhere to these specifications to ensure visual consistency and technical quality.

**Key Takeaways**:
- 24×24 grid, 1.75px stroke, round caps
- Three styles: outline (primary), solid, two-tone
- `currentColor` for adaptability
- WCAG 2.1 AA accessibility compliance
- Optimized SVG with <2KB file size

**Next Steps**:
1. Review Icon_Usage_Guide.md for implementation patterns
2. Reference Icon_Inventory_Report.md for audit findings
3. Begin icon generation using these specifications

---

**Design Brief Prepared By**: Claude (Frontend Architect Agent)
**Approved By**: [Pending Design Team Review]
**Effective Date**: October 12, 2025
