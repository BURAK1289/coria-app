# CORIA Icon Catalog Guide

**Complete Developer Reference for the CORIA Icon System**

## Overview

The CORIA Icon System provides 78 carefully curated icons across 6 categories, designed for consistency, accessibility, and performance. This guide serves as the definitive reference for implementing icons throughout the CORIA application.

### Quick Stats

| Metric | Value |
|--------|-------|
| **Total Icons** | 78 |
| **Categories** | 6 |
| **Standard Sizes** | 16px, 20px, 24px, 32px |
| **Accessibility** | WCAG 2.1 AA Compliant |
| **Bundle Impact** | ~185KB reduction from Phase 3.3 |
| **Type Safety** | Full TypeScript support |

### Key Features

- 🎨 **Unified System** - Single source of truth for all icons
- 📐 **Consistent Sizing** - Standard size prop for all icons
- ♿ **Accessible** - Built-in ARIA support
- 🎯 **Type-Safe** - TypeScript autocomplete for icon names
- 🌳 **Tree-Shakeable** - Only imports what you use
- 🎨 **Themeable** - Full color token support

## Table of Contents

1. [Quick Start](#quick-start)
2. [Icon Categories](#icon-categories)
3. [Usage Patterns](#usage-patterns)
4. [Accessibility Guide](#accessibility-guide)
5. [Color Theming](#color-theming)
6. [Best Practices](#best-practices)
7. [Complete Icon Reference](#complete-icon-reference)
8. [Migration Guide](#migration-guide)

---

## Quick Start

### Basic Usage

```tsx
import { Icon } from '@/components/icons/Icon';

// Basic icon (24px default)
<Icon name="search" />

// Custom size
<Icon name="heart" size={32} />

// With color
<Icon name="star" className="text-yellow-500" />

// Decorative (hidden from screen readers)
<Icon name="check" aria-hidden="true" />
```

### TypeScript Autocomplete

The Icon component provides full TypeScript support with autocomplete for all 78 icon names:

```tsx
// Type-safe with autocomplete
<Icon name="search" />  // ✅ Valid
<Icon name="invalid" /> // ❌ TypeScript error
```

### Size Reference

```tsx
<Icon name="search" size={16} /> // Small - UI elements, tight spaces
<Icon name="search" size={20} /> // Medium - Buttons, navigation
<Icon name="search" size={24} /> // Default - General purpose
<Icon name="search" size={32} /> // Large - Headers, hero sections
```

---

## Icon Categories

### 1. Core Utility Icons (14 icons)

**Purpose:** Platform, status, navigation, and communication icons for core functionality.

| Icon Name | Use Case | Example |
|-----------|----------|---------|
| `apple` | Apple App Store link | Download buttons |
| `google-play` | Google Play Store link | Download buttons |
| `play` | Video/audio playback | Media controls |
| `check` | Success, completion | Form validation, task lists |
| `close` | Close dialogs, remove items | Modal headers, chips |
| `x` | Alternative close icon | Tag removal |
| `refresh` | Reload, refresh data | Data tables, retry actions |
| `shield-check` | Security, verified | Trust indicators |
| `arrow-up` | Scroll to top, increase | Pagination, quantity |
| `chevron-down` | Expand, dropdown | Accordions, selects |
| `envelope` | Email, messages | Contact forms |
| `chat` | Chat, support | Live chat, help |
| `question` | Help, information | Tooltips, FAQ |
| `star` | Favorites, rating | Wishlist, reviews |

**Usage Example:**

```tsx
// Success message
<div className="flex items-center gap-2 text-green-600">
  <Icon name="check" size={20} aria-hidden="true" />
  <span>Successfully saved</span>
</div>

// Close button
<button aria-label="Close">
  <Icon name="close" size={20} aria-hidden="true" />
</button>
```

### 2. CORIA Brand Icons (17 icons)

**Purpose:** CORIA-specific brand icons for foundation, features, environmental tracking, and values.

#### Foundation Icons

| Icon Name | Use Case |
|-----------|----------|
| `coria-foundation` | CORIA foundation branding |
| `heart` | Values, favorites, health |
| `leaf` | Vegan, plant-based, sustainability |

#### Feature Icons

| Icon Name | Use Case |
|-----------|----------|
| `vegan-analysis` | Product vegan analysis |
| `ai-assistant` | AI chat features |
| `smart-pantry` | Pantry management |
| `community` | Community features |

#### Environmental Icons

| Icon Name | Use Case |
|-----------|----------|
| `esg-score` | ESG scoring |
| `carbon-water` | Combined environmental tracking |
| `carbon` | Carbon footprint |
| `water` | Water usage |
| `sustainability` | Sustainability metrics |
| `green-energy` | Renewable energy |
| `cycle` | Circular economy |

#### Values Icons

| Icon Name | Use Case |
|-----------|----------|
| `token-economy` | Blockchain/token features |
| `transparency` | Data transparency |
| `impact-focus` | Social impact |

**Usage Example:**

```tsx
// Feature highlight
<div className="flex items-center gap-3">
  <Icon name="leaf" size={32} className="text-coria-primary" />
  <div>
    <h3 className="font-bold">100% Vegan Verified</h3>
    <p className="text-sm text-gray-600">AI-powered vegan analysis</p>
  </div>
</div>

// Environmental metrics
<div className="flex gap-4">
  <div className="flex items-center gap-2">
    <Icon name="carbon" size={20} className="text-green-600" />
    <span>Low Carbon</span>
  </div>
  <div className="flex items-center gap-2">
    <Icon name="water" size={20} className="text-blue-600" />
    <span>Water Efficient</span>
  </div>
</div>
```

### 3. Social Media Icons (5 icons)

**Purpose:** Social media platform icons for sharing and community engagement.

| Icon Name | Platform | Typical Use |
|-----------|----------|-------------|
| `twitter` | Twitter/X | Social sharing |
| `linkedin` | LinkedIn | Professional sharing |
| `instagram` | Instagram | Visual content |
| `youtube` | YouTube | Video content |
| `facebook` | Facebook | Social sharing |

**Usage Example:**

```tsx
// Social links
<div className="flex gap-3">
  {['twitter', 'linkedin', 'instagram', 'youtube', 'facebook'].map(platform => (
    <a
      key={platform}
      href={`https://social.com/${platform}`}
      aria-label={`Follow us on ${platform}`}
      className="p-2 hover:text-coria-primary transition-colors"
    >
      <Icon name={platform as IconName} size={20} aria-hidden="true" />
    </a>
  ))}
</div>
```

### 4. Navigation Icons (14 icons)

**Purpose:** Primary navigation, arrows, and directional chevrons for UI navigation.

#### Primary Navigation

| Icon Name | Use Case |
|-----------|----------|
| `home` | Home page |
| `menu` | Mobile menu toggle |
| `search` | Search functionality |
| `user` | User profile |
| `settings` | Settings page |
| `filter` | Filter controls |

#### Directional Arrows

| Icon Name | Direction | Use Case |
|-----------|-----------|----------|
| `arrow-down` | Down | Scroll, expand |
| `arrow-left` | Left | Back navigation |
| `arrow-right` | Right | Forward navigation |

#### Chevrons

| Icon Name | Direction | Use Case |
|-----------|-----------|----------|
| `chevron-left` | Left | Carousel, pagination |
| `chevron-right` | Right | Carousel, pagination |

**Usage Example:**

```tsx
// Main navigation
<nav className="flex gap-4">
  <a href="/" className="flex items-center gap-2">
    <Icon name="home" size={20} aria-hidden="true" />
    <span>Home</span>
  </a>
  <a href="/search" className="flex items-center gap-2">
    <Icon name="search" size={20} aria-hidden="true" />
    <span>Search</span>
  </a>
  <a href="/profile" className="flex items-center gap-2">
    <Icon name="user" size={20} aria-hidden="true" />
    <span>Profile</span>
  </a>
</nav>

// Back button
<button onClick={() => router.back()}>
  <Icon name="arrow-left" size={20} className="mr-2" aria-hidden="true" />
  Back
</button>
```

### 5. Action Icons (12 icons)

**Purpose:** Action icons for notifications, file operations, sharing, and utilities.

#### Notifications

| Icon Name | Use Case |
|-----------|----------|
| `bell` | Notifications center |

#### File Operations

| Icon Name | Use Case |
|-----------|----------|
| `download` | Download files |
| `upload` | Upload files |

#### Social Actions

| Icon Name | Use Case |
|-----------|----------|
| `share` | Share content |

#### Math Operations

| Icon Name | Use Case |
|-----------|----------|
| `plus` | Add, create new |
| `minus` | Remove, decrease |

#### Utilities

| Icon Name | Use Case |
|-----------|----------|
| `sort` | Sort controls |
| `cart` | Shopping cart |
| `external-link` | External links |
| `globe` | Language, region |
| `language` | Language switcher |
| `wallet` | Wallet, payments |

**Usage Example:**

```tsx
// File operations
<div className="flex gap-2">
  <button className="flex items-center gap-2 px-4 py-2 bg-coria-primary text-white rounded">
    <Icon name="download" size={20} aria-hidden="true" />
    Download
  </button>
  <button className="flex items-center gap-2 px-4 py-2 border rounded">
    <Icon name="upload" size={20} aria-hidden="true" />
    Upload
  </button>
</div>

// Notification badge
<button className="relative">
  <Icon name="bell" size={20} />
  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
    3
  </span>
</button>
```

### 6. Status & Data Icons (9 icons)

**Purpose:** Status indicators, data visualization, and content type icons.

#### Status

| Icon Name | Status | Color Suggestion |
|-----------|--------|------------------|
| `alert-triangle` | Warning, danger | `text-red-500` |
| `bug` | Error, debugging | `text-orange-500` |
| `info` | Information | `text-blue-500` |

#### Data Visualization

| Icon Name | Use Case |
|-----------|----------|
| `bar-chart` | Charts, analytics |
| `trending-up` | Growth, increase |

#### Content Types

| Icon Name | Content Type |
|-----------|--------------|
| `file-text` | Documents, articles |
| `flask` | Experiments, labs |
| `smartphone` | Mobile app |
| `book-open` | Documentation, guides |

**Usage Example:**

```tsx
// Alert messages
<div className="space-y-3">
  {/* Success */}
  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded">
    <Icon name="check" size={20} className="text-green-600 mt-0.5" />
    <span>Operation completed successfully</span>
  </div>

  {/* Warning */}
  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
    <Icon name="alert-triangle" size={20} className="text-yellow-600 mt-0.5" />
    <span>Please review your settings</span>
  </div>

  {/* Error */}
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded">
    <Icon name="bug" size={20} className="text-red-600 mt-0.5" />
    <span>An error occurred. Please try again.</span>
  </div>

  {/* Info */}
  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded">
    <Icon name="info" size={20} className="text-blue-600 mt-0.5" />
    <span>Your trial expires in 7 days</span>
  </div>
</div>

// Data dashboard
<div className="flex items-center gap-2">
  <Icon name="trending-up" size={24} className="text-green-600" />
  <div>
    <p className="text-2xl font-bold">+24%</p>
    <p className="text-sm text-gray-600">vs last month</p>
  </div>
</div>
```

---

## Usage Patterns

### 1. Buttons with Icons

#### Icon + Text Button

```tsx
// Primary action
<button className="flex items-center gap-2 px-4 py-2 bg-coria-primary text-white rounded hover:bg-green-700">
  <Icon name="download" size={20} aria-hidden="true" />
  Download Report
</button>

// Secondary action
<button className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50">
  <Icon name="share" size={20} aria-hidden="true" />
  Share
</button>

// Icon after text
<button className="flex items-center gap-2 px-4 py-2">
  Next
  <Icon name="arrow-right" size={20} aria-hidden="true" />
</button>
```

**Accessibility Note:** When icon is paired with text, use `aria-hidden="true"` on the icon.

#### Icon-Only Button

```tsx
// Interactive icon button - REQUIRES aria-label
<button
  aria-label="Close dialog"
  className="p-2 hover:bg-gray-100 rounded-lg"
>
  <Icon name="close" size={20} aria-hidden="true" />
</button>

// With tooltip
<button
  aria-label="Settings"
  title="Settings"
  className="p-2 hover:bg-gray-100 rounded-lg"
>
  <Icon name="settings" size={20} aria-hidden="true" />
</button>
```

**Accessibility Note:** Icon-only buttons MUST have `aria-label` on the button element.

### 2. Form Inputs

#### Input with Leading Icon

```tsx
<div className="relative">
  <Icon
    name="search"
    size={20}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    aria-hidden="true"
  />
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-4 py-2 border rounded-lg w-full"
  />
</div>
```

#### Input with Trailing Icon (Status)

```tsx
<div className="relative">
  <input
    type="email"
    value={email}
    className="pr-10 py-2 border rounded-lg w-full"
  />
  <Icon
    name="check"
    size={20}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
    aria-hidden="true"
  />
</div>
```

### 3. Navigation Menus

#### Sidebar Navigation

```tsx
<nav className="space-y-1">
  <a
    href="/dashboard"
    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
  >
    <Icon name="home" size={20} aria-hidden="true" />
    <span>Dashboard</span>
  </a>
  <a
    href="/profile"
    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
  >
    <Icon name="user" size={20} aria-hidden="true" />
    <span>Profile</span>
  </a>
  <a
    href="/settings"
    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
  >
    <Icon name="settings" size={20} aria-hidden="true" />
    <span>Settings</span>
  </a>
</nav>
```

#### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
  <a href="/" className="flex flex-col items-center gap-1 px-3 py-2 text-coria-primary">
    <Icon name="home" size={24} aria-hidden="true" />
    <span className="text-xs">Home</span>
  </a>
  <a href="/search" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600">
    <Icon name="search" size={24} aria-hidden="true" />
    <span className="text-xs">Search</span>
  </a>
  <a href="/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600">
    <Icon name="user" size={24} aria-hidden="true" />
    <span className="text-xs">Profile</span>
  </a>
</nav>
```

### 4. Alert Messages & Status

#### Alert with Icon

```tsx
// Success
<div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
  <Icon name="check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
  <div>
    <h4 className="font-medium text-green-900">Success</h4>
    <p className="text-sm text-green-700">Your changes have been saved successfully.</p>
  </div>
</div>

// Warning
<div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <Icon name="alert-triangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
  <div>
    <h4 className="font-medium text-yellow-900">Warning</h4>
    <p className="text-sm text-yellow-700">Please review these items before continuing.</p>
  </div>
</div>

// Error
<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
  <Icon name="bug" size={20} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
  <div>
    <h4 className="font-medium text-red-900">Error</h4>
    <p className="text-sm text-red-700">There was a problem processing your request.</p>
  </div>
</div>

// Info
<div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
  <div>
    <h4 className="font-medium text-blue-900">Information</h4>
    <p className="text-sm text-blue-700">Your trial period expires in 7 days.</p>
  </div>
</div>
```

### 5. Cards & Features

#### Feature Card

```tsx
<div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-3 bg-coria-primary/10 rounded-lg">
      <Icon name="leaf" size={32} className="text-coria-primary" aria-hidden="true" />
    </div>
    <h3 className="text-xl font-bold">Vegan Analysis</h3>
  </div>
  <p className="text-gray-600">AI-powered vegan product verification with detailed ingredient analysis.</p>
</div>
```

#### Stat Card

```tsx
<div className="p-6 bg-white rounded-lg shadow">
  <div className="flex items-center justify-between mb-4">
    <Icon name="trending-up" size={24} className="text-green-600" aria-hidden="true" />
    <span className="text-sm text-green-600 font-medium">+12%</span>
  </div>
  <p className="text-3xl font-bold">1,234</p>
  <p className="text-gray-600 text-sm">Total Users</p>
</div>
```

### 6. Loading States

#### Spinner with Icon

```tsx
<div className="flex items-center gap-2 text-gray-600">
  <Icon name="refresh" size={20} className="animate-spin" aria-hidden="true" />
  <span>Loading...</span>
</div>
```

#### Skeleton State

```tsx
<div className="animate-pulse flex gap-3">
  <div className="w-10 h-10 bg-gray-200 rounded" /> {/* Icon placeholder */}
  <div className="flex-1 space-y-2">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
</div>
```

---

## Accessibility Guide

### WCAG 2.1 AA Compliance

All CORIA icons are designed to meet WCAG 2.1 AA accessibility standards when properly implemented.

### Accessibility Rules

#### Rule 1: Decorative Icons

**When to use:** Icon is paired with text that conveys the same meaning.

```tsx
✅ CORRECT
<button className="flex items-center gap-2">
  <Icon name="download" size={20} aria-hidden="true" />
  <span>Download</span>
</button>

❌ INCORRECT
<button className="flex items-center gap-2">
  <Icon name="download" size={20} />
  <span>Download</span>
</button>
```

**Why:** Screen readers will announce both icon and text, creating redundancy.

#### Rule 2: Interactive Icons

**When to use:** Icon-only button or link without visible text.

```tsx
✅ CORRECT
<button aria-label="Close dialog">
  <Icon name="close" size={20} aria-hidden="true" />
</button>

❌ INCORRECT
<button>
  <Icon name="close" size={20} />
</button>
```

**Why:** Screen readers need text alternative to announce button purpose.

#### Rule 3: Informational Icons

**When to use:** Icon conveys meaning not expressed elsewhere.

```tsx
✅ CORRECT
<Icon name="check" size={20} aria-label="Completed" className="text-green-600" />

✅ ALSO CORRECT (with title)
<Icon name="check" size={20} title="Completed" className="text-green-600" />

❌ INCORRECT
<Icon name="check" size={20} aria-hidden="true" className="text-green-600" />
```

**Why:** Standalone icons with semantic meaning must be accessible.

### Accessibility Decision Tree

```
Does the icon appear with descriptive text?
├─ YES → Use aria-hidden="true"
│   Example: <Icon name="download" aria-hidden="true" /> Download
│
└─ NO → Is it interactive (button/link)?
    ├─ YES → Add aria-label to parent element
    │   Example: <button aria-label="Close"><Icon name="close" aria-hidden="true" /></button>
    │
    └─ NO → Add aria-label or title to icon
        Example: <Icon name="check" aria-label="Completed" />
```

### Color Contrast

All icons must meet minimum contrast ratios:

- **Normal text:** 4.5:1 minimum
- **Large text (18pt+):** 3:1 minimum
- **UI components:** 3:1 minimum

**Testing:**
```tsx
// Good contrast
<Icon name="heart" className="text-coria-primary" /> {/* Green on white: 4.5:1 */}

// Poor contrast (avoid)
<Icon name="heart" className="text-gray-300" /> {/* Light gray on white: 1.5:1 */}
```

### Focus Indicators

Interactive icons must have visible focus indicators:

```tsx
<button className="p-2 rounded hover:bg-gray-100 focus:ring-2 focus:ring-coria-primary focus:outline-none">
  <Icon name="settings" size={20} aria-hidden="true" />
</button>
```

### Screen Reader Testing

Test with screen readers:
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free) or JAWS
- **Mobile:** TalkBack (Android), VoiceOver (iOS)

---

## Color Theming

### Tailwind Color Utilities

Icons inherit `currentColor` by default and can be styled with any Tailwind color utility:

```tsx
// Grayscale
<Icon name="search" className="text-gray-400" />
<Icon name="search" className="text-gray-600" />
<Icon name="search" className="text-gray-900" />

// Brand colors
<Icon name="heart" className="text-coria-primary" />     // CORIA green
<Icon name="leaf" className="text-green-600" />

// Semantic colors
<Icon name="check" className="text-green-600" />         // Success
<Icon name="alert-triangle" className="text-red-600" />  // Error
<Icon name="info" className="text-blue-600" />           // Info
<Icon name="star" className="text-yellow-500" />         // Warning/Rating
```

### CORIA Color Tokens

```tsx
// Primary brand color
<Icon name="heart" className="text-coria-primary" />

// Use in different contexts
<Icon name="leaf" className="text-coria-primary" />      // Feature highlight
<Icon name="check" className="text-coria-primary" />     // Success state
```

### Semantic Color Guide

| Icon | Semantic Meaning | Recommended Color | Class |
|------|-----------------|-------------------|-------|
| `check` | Success, completed | Green | `text-green-600` |
| `alert-triangle` | Warning, caution | Red | `text-red-600` |
| `info` | Information | Blue | `text-blue-600` |
| `star` | Rating, favorite | Yellow | `text-yellow-500` |
| `heart` | Love, health | Red/Pink | `text-red-500` |
| `leaf` | Vegan, eco-friendly | Green | `text-green-600` |
| `carbon` | Environmental | Green | `text-green-600` |
| `water` | Water usage | Blue | `text-blue-600` |

### Hover States

```tsx
// Hover color change
<button className="text-gray-600 hover:text-coria-primary transition-colors">
  <Icon name="heart" size={20} aria-hidden="true" />
</button>

// Hover with background
<button className="p-2 hover:bg-gray-100 rounded transition-colors">
  <Icon name="settings" size={20} className="text-gray-600" aria-hidden="true" />
</button>
```

### Dark Mode Support

```tsx
// Responsive to dark mode
<Icon name="search" className="text-gray-900 dark:text-gray-100" />

// Icon with theme-aware background
<div className="p-3 bg-white dark:bg-gray-800 rounded">
  <Icon name="heart" className="text-coria-primary" size={24} />
</div>
```

---

## Best Practices

### DO ✅

1. **Use semantic icon names**
   ```tsx
   <Icon name="close" /> // ✅ Clear purpose
   ```

2. **Provide proper accessibility attributes**
   ```tsx
   <button aria-label="Close menu">
     <Icon name="close" aria-hidden="true" />
   </button>
   ```

3. **Use standard sizes**
   ```tsx
   <Icon name="search" size={20} /> // ✅ Standard size
   ```

4. **Pair with text for clarity**
   ```tsx
   <button>
     <Icon name="download" aria-hidden="true" />
     Download
   </button>
   ```

5. **Use color tokens for consistency**
   ```tsx
   <Icon name="heart" className="text-coria-primary" />
   ```

### DON'T ❌

1. **Don't use custom sizes**
   ```tsx
   <Icon name="search" size={23} /> // ❌ Non-standard
   ```

2. **Don't forget accessibility**
   ```tsx
   <button>
     <Icon name="close" /> // ❌ Missing aria-label
   </button>
   ```

3. **Don't use inline styles**
   ```tsx
   <Icon name="heart" style={{ color: '#10b981' }} /> // ❌ Use className
   ```

4. **Don't use unclear icon names**
   ```tsx
   <Icon name="x" /> // ❌ Prefer "close"
   ```

5. **Don't mix icon systems**
   ```tsx
   import { CheckIcon } from 'lucide-react'; // ❌ Use CORIA Icon
   ```

### Performance Best Practices

1. **Tree-Shaking:** Only imports icons you use
2. **Memoization:** Icon component is memoized by default
3. **SVG Optimization:** All icons optimized with SVGO
4. **Bundle Impact:** Monitor with `npm run build:analyze`

---

## Complete Icon Reference

### Quick Reference Table

| Category | Icon Count | Key Icons |
|----------|------------|-----------|
| Core Utility | 14 | check, close, star, search |
| CORIA Brand | 17 | leaf, heart, ai-assistant, community |
| Social Media | 5 | twitter, linkedin, instagram |
| Navigation | 14 | home, menu, arrow-left, arrow-right |
| Actions | 12 | download, upload, share, bell |
| Status & Data | 9 | alert-triangle, info, trending-up |

### Alphabetical List

All 78 icons in alphabetical order:

```
ai-assistant, alert-triangle, apple, arrow-down, arrow-left, arrow-right,
arrow-up, bar-chart, bell, book-open, bug, carbon, carbon-water, cart,
chat, check, chevron-down, chevron-left, chevron-right, close, community,
coria-foundation, cycle, download, envelope, esg-score, external-link,
facebook, file-text, filter, flask, globe, google-play, green-energy, heart,
home, info, instagram, language, leaf, linkedin, menu, minus, play, plus,
question, refresh, search, settings, share, shield-check, smartphone, smart-pantry,
sort, star, sustainability, token-economy, transparency, trending-up, twitter,
upload, user, vegan-analysis, wallet, water, x, youtube
```

### Category-Based Reference

#### Core Utility (14)
```
apple, google-play, play, check, close, x, refresh, shield-check,
arrow-up, chevron-down, envelope, chat, question, star
```

#### CORIA Brand (17)
```
coria-foundation, heart, leaf, vegan-analysis, ai-assistant, smart-pantry,
community, esg-score, carbon-water, carbon, water, sustainability,
green-energy, cycle, token-economy, transparency, impact-focus
```

#### Social Media (5)
```
twitter, linkedin, instagram, youtube, facebook
```

#### Navigation (14)
```
home, menu, search, user, settings, filter, arrow-down, arrow-left,
arrow-right, chevron-left, chevron-right
```

#### Actions (12)
```
bell, download, upload, share, plus, minus, sort, cart,
external-link, globe, language, wallet
```

#### Status & Data (9)
```
alert-triangle, bug, info, bar-chart, trending-up, file-text,
flask, smartphone, book-open
```

---

## Migration Guide

### From lucide-react (Phase 3.3)

#### Before (lucide-react)
```tsx
import { CheckIcon, SearchIcon, HeartIcon } from 'lucide-react';

<CheckIcon className="h-4 w-4" />
<SearchIcon className="h-5 w-5 text-gray-600" />
<HeartIcon className="h-6 w-6 text-red-500" />
```

#### After (CORIA Icon)
```tsx
import { Icon } from '@/components/icons/Icon';

<Icon name="check" size={16} />
<Icon name="search" size={20} className="text-gray-600" />
<Icon name="heart" size={24} className="text-red-500" />
```

### Size Conversion Table

| Tailwind Class | Size Prop | Pixels |
|----------------|-----------|--------|
| `h-4 w-4` | `size={16}` | 16px |
| `h-5 w-5` | `size={20}` | 20px |
| `h-6 w-6` | `size={24}` | 24px |
| `h-8 w-8` | `size={32}` | 32px |

### Icon Name Mapping

| lucide-react | CORIA Icon | Notes |
|--------------|------------|-------|
| `CheckIcon` | `check` | Direct mapping |
| `XIcon` | `close` | Semantic preference |
| `SearchIcon` | `search` | Direct mapping |
| `HeartIcon` | `heart` | Direct mapping |
| `LeafIcon` | `leaf` | Direct mapping |
| `HomeIcon` | `home` | Direct mapping |
| `UserIcon` | `user` | Direct mapping |
| `SettingsIcon` | `settings` | Direct mapping |
| `BellIcon` | `bell` | Direct mapping |

---

## Related Documentation

### Internal Documentation

- **[Icon Build Pipeline](../../claudedocs/Icon_Build_Pipeline.md)** - CI/CD and build process
- **[Phase 3.3 Migration Report](../../claudedocs/phase-3-3-icon-migration-report.md)** - Full migration details
- **[Phase 3.3 CI Protection](../../claudedocs/Phase_3_3_CI_Protection_Complete.md)** - Dependency protection

### Storybook

- **Icon Stories:** View interactive examples in Storybook
- **Run:** `npm run storybook`
- **Build:** `npm run build-storybook`

### External Resources

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/

---

## Support & Feedback

### Getting Help

1. **Check Documentation:** Review this guide and related docs
2. **View Examples:** See Storybook for interactive examples
3. **Search Icons:** Use icon gallery search functionality
4. **Check Migration Guide:** For lucide-react conversions

### Reporting Issues

If you encounter issues:

1. Check icon exists: `getAvailableIcons()`
2. Verify import: `import { Icon } from '@/components/icons/Icon'`
3. Check accessibility: Use screen reader testing
4. Review examples: See usage patterns above

### Contributing

To add new icons:

1. Add SVG to appropriate category
2. Update `icons-map.ts`
3. Update this documentation
4. Add Storybook examples
5. Test accessibility
6. Run `npm run icons:ci-guard`

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Phase:** 3.3 Complete
**Total Icons:** 78
**Status:** Production Ready ✅
