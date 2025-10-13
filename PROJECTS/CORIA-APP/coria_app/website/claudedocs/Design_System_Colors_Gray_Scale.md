# CORIA Design System - Gray Scale Specification

## Overview
CORIA gray scale tasarımı, doğal minimalist estetiği destekleyen 10 seviyeli nötr renk paleti sağlar. WCAG AA uyumlu kontrast oranları ile erişilebilirliği garanti eder.

## Gray Scale Palette

### Color Definitions

| Level | Variable | Hex Value | RGB | Usage | Contrast Ratio (on white) |
|-------|----------|-----------|-----|-------|---------------------------|
| **50** | `--coria-gray-50` | `#FBFAF7` | `rgb(251, 250, 247)` | Lightest backgrounds, subtle highlights | 1.02:1 |
| **100** | `--coria-gray-100` | `#F3EEE4` | `rgb(243, 238, 228)` | Card backgrounds, light surfaces | 1.08:1 |
| **200** | `--coria-gray-200` | `#E8E5E0` | `rgb(232, 229, 224)` | Borders, dividers, disabled states | 1.14:1 |
| **300** | `--coria-gray-300` | `#D4D0C9` | `rgb(212, 208, 201)` | Subtle borders, input borders | 1.35:1 |
| **400** | `--coria-gray-400` | `#B6B2AA` | `rgb(182, 178, 170)` | Placeholder text, disabled text | 2.1:1 |
| **500** | `--coria-gray-500` | `#7A8B7F` | `rgb(122, 139, 127)` | Secondary text, captions (greenish neutral) | 3.8:1 ⚠️ |
| **600** | `--coria-gray-600` | `#5F6F64` | `rgb(95, 111, 100)` | Body text, icons | 5.2:1 ✅ |
| **700** | `--coria-gray-700` | `#46554B` | `rgb(70, 85, 75)` | Headings, emphasized text | 7.2:1 ✅ |
| **800** | `--coria-gray-800` | `#38453C` | `rgb(56, 69, 60)` | Primary text, strong emphasis | 9.1:1 ✅ |
| **900** | `--coria-gray-900` | `#2C3E34` | `rgb(44, 62, 52)` | Headings, primary text, darkest | 11.3:1 ✅ |
| **Black** | `--coria-black` | `#101713` | `rgb(16, 23, 19)` | Maximum contrast | 17.1:1 ✅ |
| **White** | `--coria-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Pure white | 1:1 |

### Accessibility Notes

✅ **WCAG AA Compliant** (4.5:1 for normal text, 3:1 for large text):
- Gray 600-900 suitable for body text
- Gray 700-900 suitable for all text sizes
- Gray 500 requires careful usage (3.8:1 - acceptable for large text only)

⚠️ **Use with Caution**:
- Gray 500 should only be used for large text (18px+) or secondary information
- Gray 400 and lighter should not be used for text (use for decorative elements only)

## Tailwind CSS Integration

### Using Tailwind v4 @theme Inline

The gray scale is automatically available in Tailwind via the `@theme inline` configuration in `globals.css`:

```css
@theme inline {
  --color-coria-gray-50: var(--coria-gray-50);
  --color-coria-gray-100: var(--coria-gray-100);
  --color-coria-gray-200: var(--coria-gray-200);
  --color-coria-gray-300: var(--coria-gray-300);
  --color-coria-gray-400: var(--coria-gray-400);
  --color-coria-gray-500: var(--coria-gray-500);
  --color-coria-gray-600: var(--coria-gray-600);
  --color-coria-gray-700: var(--coria-gray-700);
  --color-coria-gray-800: var(--coria-gray-800);
  --color-coria-gray-900: var(--coria-gray-900);
  --color-coria-black: var(--coria-black);
  --color-coria-white: var(--coria-white);
}
```

### Tailwind Class Usage

```tsx
// Text Colors
<p className="text-coria-gray-900">Primary heading text</p>
<p className="text-coria-gray-800">Body text</p>
<p className="text-coria-gray-700">Secondary text</p>
<p className="text-coria-gray-600">Muted text</p>
<small className="text-coria-gray-500">Caption or metadata (large text only)</small>

// Background Colors
<div className="bg-coria-gray-50">Lightest background</div>
<div className="bg-coria-gray-100">Card background</div>
<div className="bg-coria-gray-200">Subtle surface</div>

// Border Colors
<div className="border border-coria-gray-300">Default border</div>
<div className="border border-coria-gray-400">Emphasized border</div>

// Hover States
<button className="bg-white hover:bg-coria-gray-50 border border-coria-gray-300 hover:border-coria-gray-400">
  Hover effect
</button>
```

## Design Patterns

### Card Component Example

```tsx
<div className="bg-white border border-coria-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-coria-gray-900 text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-coria-gray-700 mb-4">Primary card content with proper contrast.</p>
  <small className="text-coria-gray-600">Metadata or secondary information</small>
</div>
```

### Form Input Example

```tsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full border border-coria-gray-300 bg-white text-coria-gray-900 placeholder:text-coria-gray-400 focus:border-coria-primary focus:ring-2 focus:ring-coria-primary/20 rounded-md px-4 py-2"
/>
```

### Button Variants

```tsx
// Primary Button (uses brand colors, not gray)
<button className="bg-coria-primary text-white hover:bg-coria-primary-dark">
  Primary Action
</button>

// Secondary Button (uses gray scale)
<button className="bg-coria-gray-100 text-coria-gray-900 border border-coria-gray-300 hover:bg-coria-gray-200 hover:border-coria-gray-400">
  Secondary Action
</button>

// Ghost Button
<button className="bg-transparent text-coria-gray-700 border border-coria-gray-300 hover:bg-coria-gray-50">
  Ghost Action
</button>
```

### Navigation Example

```tsx
<nav className="bg-white border-b border-coria-gray-200">
  <a href="#" className="text-coria-gray-700 hover:text-coria-gray-900 hover:bg-coria-gray-50">
    Nav Item
  </a>
  <a href="#" className="text-coria-gray-700 hover:text-coria-gray-900 hover:bg-coria-gray-50">
    Nav Item
  </a>
</nav>
```

## Dark Mode Variants

In dark mode, gray scale values are automatically adjusted:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1A1A1A;              /* Dark mode background */
    --foreground: #E0E0E0;              /* Dark mode text */
    --text-primary: #E0E0E0;
    --text-secondary: var(--coria-gray-300);
    --koyu-gri: #454545;                /* Koyu Gri 80% */
    --acik-gri: #2C2C2C;                /* Açık Gri → Card background */
  }
}
```

### Dark Mode Usage

```tsx
// Text automatically adapts
<p className="text-foreground">Adapts to light/dark mode</p>
<p className="text-coria-gray-900 dark:text-coria-gray-100">Explicit dark mode override</p>

// Background automatically adapts
<div className="bg-background">Adapts to light/dark mode</div>
<div className="bg-coria-gray-100 dark:bg-coria-gray-800">Explicit dark mode background</div>
```

## Semantic Usage Guidelines

### DO ✅

- Use gray 800-900 for primary headings and important text
- Use gray 700-800 for body text
- Use gray 600 for secondary text and icons
- Use gray 500 for large text captions only (18px+)
- Use gray 200-300 for borders and dividers
- Use gray 50-100 for subtle backgrounds

### DON'T ❌

- Don't use gray 500 for small text (fails WCAG AA)
- Don't use gray 400 or lighter for any text
- Don't mix too many gray levels in one component (max 3-4)
- Don't forget to test contrast ratios when layering grays

## Testing & Validation

### Contrast Ratio Testing

Use browser dev tools or online contrast checkers:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse Accessibility Audit
- Browser Extension: "WAVE" or "axe DevTools"

### Example Validation

```tsx
// ✅ PASS - 11.3:1 contrast ratio
<p className="text-coria-gray-900">Important text on white background</p>

// ✅ PASS - 7.2:1 contrast ratio
<p className="text-coria-gray-700">Body text on white background</p>

// ⚠️ CAUTION - 3.8:1 contrast ratio (large text only)
<p className="text-lg text-coria-gray-500">Large caption text</p>

// ❌ FAIL - 2.1:1 contrast ratio
<p className="text-coria-gray-400">Insufficient contrast for text</p>
```

## Migration from Legacy Colors

### Old → New Mapping

| Legacy Variable | New Variable | Notes |
|----------------|--------------|-------|
| `--koyu-gri` | `--coria-gray-900` | Primary text color |
| `--acik-gri` | `--coria-gray-50` | Light backgrounds |
| `gray-500` (Tailwind default) | `coria-gray-700` | Use darker for better contrast |
| `gray-400` (Tailwind default) | `coria-gray-600` | Use darker for better contrast |

### Find & Replace Examples

```bash
# Find components using legacy gray colors
grep -r "text-gray-500" src/components

# Replace with CORIA gray scale
# Old: className="text-gray-500"
# New: className="text-coria-gray-700"
```

## Resources

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

## Version History

- **v2.0** (JIRA-617): Complete 10-level gray scale with Tailwind v4 integration
- **v1.0**: Initial gray scale with basic neutrals
