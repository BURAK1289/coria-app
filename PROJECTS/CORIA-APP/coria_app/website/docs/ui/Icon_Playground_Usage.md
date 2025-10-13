# Icon Playground - Developer Tool Guide

**URL:** `/dev/icons`
**Purpose:** Interactive icon exploration, testing, and code generation tool
**Status:** ✅ Production Ready

---

## Overview

The Icon Playground is a comprehensive developer tool for exploring and testing the CORIA Icon System. It provides:

- **Interactive Search & Filter:** Find icons quickly across 6 categories
- **Visual Customization:** Test different sizes (16-64px) and brand colors
- **Code Generation:** Copy-paste ready code with proper accessibility patterns
- **Brand Token Preview:** Visual preview of all CORIA brand color tokens
- **Accessibility Patterns:** Pre-configured patterns for decorative, interactive, and informational icons

---

## Features

### 1. Real-Time Search

**Functionality:**
- Instant search across all 78 icons
- Case-insensitive matching
- Partial keyword matching

**Usage:**
```
Search: "heart" → finds: heart, leaf (partial match)
Search: "arrow" → finds: arrow-up, arrow-down, arrow-left, arrow-right
Search: "social" → No direct match, use category filter instead
```

**Example:**
Type `"download"` in the search box to instantly filter to download-related icons.

---

### 2. Category Filtering

**Available Categories:**

| Türkçe | İngilizce | İkon Sayısı | Örnekler |
|--------|-----------|-------------|----------|
| **Temel İşlevler** | Core Utility | 14 | apple, google-play, check, close, refresh |
| **CORIA Markası** | CORIA Brand | 17 | coria-foundation, heart, leaf, vegan-analysis |
| **Sosyal Medya** | Social Media | 5 | twitter, linkedin, instagram, youtube, facebook |
| **Navigasyon** | Navigation | 14 | home, menu, search, user, settings, arrows, chevrons |
| **Aksiyonlar** | Actions | 12 | bell, download, upload, share, plus, minus, cart |
| **Durum & Veri** | Status & Data | 9 | alert-triangle, bug, info, bar-chart, trending-up |

**Combined Filtering:**
- Select a category, then use search to narrow within that category
- Example: Select "CORIA Markası" → Search "carbon" → Finds carbon-related brand icons

---

### 3. Size Control

**Standard Sizes:**

| Boyut | Kullanım | Örnek Durumlar |
|-------|----------|----------------|
| **16px** | Küçük | Inline buttons, tight spaces, form elements |
| **20px** | Orta | Navigation buttons, controls |
| **24px** | Varsayılan | General purpose, cards, lists |
| **32px** | Büyük | Headers, prominent actions, feature sections |
| **48px** | Çok Büyük | Error states, empty states, hero elements |
| **64px** | Hero | Critical alerts, splash screens, large displays |

**Generated Code:**
```tsx
// Default (24px) - size prop omitted
<Icon name="heart" />

// Custom size - size prop included
<Icon name="heart" size={32} />
```

---

### 4. Brand Color Tokens

**Available Colors:**

#### Primary Brand Colors
| Token Name | CSS Variable | Kullanım |
|------------|--------------|----------|
| Primary | `var(--coria-primary)` | Primary brand color, CTAs, headings |
| Primary Dark | `var(--coria-primary-dark)` | Dark accent, gradients, hover states |
| Primary Light | `var(--coria-primary-light)` | Light variant, backgrounds |
| Açık Yeşil | `var(--acik-yesil)` | Success messages, positive indicators |
| Su Yeşili | `var(--su-yesili)` | Links, hover states, secondary accents |

#### Support Colors
| Token Name | CSS Variable | Kullanım |
|------------|--------------|----------|
| Mercan | `var(--mercan)` | Warnings, critical info, error states |
| Toprak | `var(--toprak)` | Neutral areas, tertiary elements |
| Lime | `var(--lime)` | Energetic highlights, accents |
| Sky | `var(--sky)` | Water & clarity themes, info states |
| Gold | `var(--gold)` | Achievements, premium features |

#### Semantic Colors
| Token Name | CSS Variable | Kullanım |
|------------|--------------|----------|
| Başarı | `var(--coria-success)` | Success states |
| Uyarı | `var(--coria-warning)` | Warning states |
| Hata | `var(--coria-error)` | Error states |
| Bilgi | `var(--coria-info)` | Info states |

**How It Works:**
- Hover over any color button to see the CSS variable
- Selected color is applied to all displayed icons
- Generated code includes the correct Tailwind class

**Generated Code:**
```tsx
// No color selected - uses currentColor
<Icon name="heart" />

// Brand color selected
<Icon name="heart" className="text-coria-primary" />

// Semantic color
<Icon name="alert-triangle" className="text-coria-error" />
```

---

### 5. Copyable Code Snippets

Each icon provides **4 copy patterns** based on accessibility requirements:

#### Pattern 1: TSX (Basic)
**Use Case:** Quick testing, basic implementation

**Generated Code:**
```tsx
<Icon name="download" size={24} />
```

**When to Use:**
- Rapid prototyping
- Testing icon appearance
- Placeholder during development

---

#### Pattern 2: Dekoratif (Decorative)
**Use Case:** Icon appears with descriptive text

**Generated Code:**
```tsx
<Icon name="download" size={24} aria-hidden="true" />
```

**When to Use:**
- Icon next to text label
- Icon inside labeled button
- Purely visual enhancement

**Example:**
```tsx
<button>
  <Icon name="download" aria-hidden="true" />
  İndir
</button>
```

**Screen Reader Behavior:**
Announces "İndir" (button text), skips icon announcement.

---

#### Pattern 3: İnteraktif (Interactive)
**Use Case:** Icon-only buttons or links

**Generated Code:**
```tsx
<button aria-label="Action description">
  <Icon name="close" size={24} aria-hidden="true" />
</button>
```

**When to Use:**
- Icon-only buttons
- Icon-only links
- Interactive elements without visible text

**Example:**
```tsx
<button aria-label="Close dialog">
  <Icon name="close" aria-hidden="true" />
</button>
```

**Screen Reader Behavior:**
Announces "Close dialog" (from aria-label), skips icon announcement.

---

#### Pattern 4: Bilgilendirici (Informational)
**Use Case:** Icon conveys standalone meaning

**Generated Code:**
```tsx
<Icon name="alert-triangle" size={24} aria-label="Status description" />
```

**When to Use:**
- Status indicators
- Standalone warnings/errors
- Icons communicating critical info

**Example:**
```tsx
<div>
  <Icon name="check" aria-label="Completed" />
  <Icon name="alert-triangle" aria-label="Warning" />
  <Icon name="bug" aria-label="Error" />
</div>
```

**Screen Reader Behavior:**
Announces "Completed", "Warning", "Error" (from aria-label).

---

## Accessibility Decision Tree

Use this flowchart to choose the correct pattern:

```
Does the icon appear with descriptive text?
├─ YES → Use "Dekoratif" pattern
│   Code: <Icon name="icon" aria-hidden="true" />
│   Example: <button><Icon name="download" aria-hidden="true" /> Download</button>
│
└─ NO → Is it interactive (button/link)?
    ├─ YES → Use "İnteraktif" pattern
    │   Code: <button aria-label="Label"><Icon name="icon" aria-hidden="true" /></button>
    │   Example: <button aria-label="Close"><Icon name="close" aria-hidden="true" /></button>
    │
    └─ NO → Use "Bilgilendirici" pattern
        Code: <Icon name="icon" aria-label="Label" />
        Example: <Icon name="check" aria-label="Completed" />
```

---

## Usage Examples

### Example 1: Testing Icon Sizes

**Goal:** Compare how the `heart` icon looks at different sizes

**Steps:**
1. Search for "heart"
2. Click size buttons (16px → 64px) to see size changes
3. Copy TSX pattern for desired size
4. Use in your component

**Result:**
```tsx
// Small inline
<Icon name="heart" size={16} className="text-coria-primary" />

// Hero section
<Icon name="heart" size={64} className="text-coria-primary" />
```

---

### Example 2: Finding Social Media Icons

**Goal:** Get Instagram icon with brand color

**Steps:**
1. Click "Sosyal Medya" category (5 icons shown)
2. Find `instagram` icon
3. Select "Primary" color
4. Copy "Dekoratif" pattern

**Result:**
```tsx
<a href="https://instagram.com/coria" aria-label="Follow us on Instagram">
  <Icon name="instagram" size={24} className="text-coria-primary" aria-hidden="true" />
</a>
```

---

### Example 3: Status Indicators

**Goal:** Create error message with icon

**Steps:**
1. Click "Durum & Veri" category
2. Find `alert-triangle` icon
3. Select "Hata" (error) color
4. Copy "Bilgilendirici" pattern

**Result:**
```tsx
<div className="flex items-center gap-2 text-coria-error">
  <Icon name="alert-triangle" size={20} className="text-coria-error" aria-label="Error" />
  <span>Bir hata oluştu</span>
</div>
```

---

### Example 4: Button with Icon and Text

**Goal:** Create download button

**Steps:**
1. Search "download"
2. Keep default size (24px)
3. Select "Primary" color
4. Copy "Dekoratif" pattern

**Result:**
```tsx
<button className="flex items-center gap-2 bg-coria-primary text-white px-4 py-2 rounded-lg">
  <Icon name="download" size={20} className="text-white" aria-hidden="true" />
  Dosyayı İndir
</button>
```

---

### Example 5: Navigation Icons

**Goal:** Create navigation menu

**Steps:**
1. Click "Navigasyon" category
2. Find: home, search, user, settings
3. Copy "İnteraktif" pattern for each

**Result:**
```tsx
<nav className="flex gap-4">
  <button aria-label="Ana Sayfa">
    <Icon name="home" size={24} aria-hidden="true" />
  </button>
  <button aria-label="Ara">
    <Icon name="search" size={24} aria-hidden="true" />
  </button>
  <button aria-label="Profil">
    <Icon name="user" size={24} aria-hidden="true" />
  </button>
  <button aria-label="Ayarlar">
    <Icon name="settings" size={24} aria-hidden="true" />
  </button>
</nav>
```

---

## Developer Workflow

### Recommended Workflow for New Features

1. **Explore:** Open `/dev/icons` to browse available icons
2. **Filter:** Use category or search to find relevant icons
3. **Customize:** Adjust size and color to match design
4. **Test:** Visually verify the icon matches requirements
5. **Copy:** Use the appropriate accessibility pattern
6. **Integrate:** Paste into your component
7. **Validate:** Test with screen reader (VoiceOver, NVDA, etc.)

---

### Integration with Development Tools

#### Storybook Integration
The Playground complements Storybook:
- **Playground:** Quick exploration and code generation
- **Storybook:** Comprehensive component documentation and testing

**Workflow:**
```
Playground (find icon) → Copy code → Use in component → Document in Storybook
```

#### TypeScript Support
All icon names are type-safe:
```tsx
import { Icon, IconName } from '@/components/icons/Icon';

// TypeScript autocomplete works
const iconName: IconName = 'heart'; // ✅ Valid
const invalid: IconName = 'invalid'; // ❌ Type error
```

---

## Performance Considerations

### Tree-Shaking
The Icon system supports tree-shaking:
- Only imported icons are bundled
- Unused icons are excluded from production build
- No performance penalty for large icon library

### Lazy Loading
Icons are loaded on demand:
```tsx
// Only 'heart' icon is loaded
<Icon name="heart" />
```

### Bundle Impact
- Each icon: ~0.5-1KB gzipped
- Icon component: ~2KB gzipped
- Total overhead: ~3KB for 10 icons

---

## Keyboard Shortcuts (Future Enhancement)

*Planned for future release:*

| Shortcut | Action |
|----------|--------|
| `/` | Focus search input |
| `Ctrl+K` | Clear filters |
| `Ctrl+C` | Copy selected icon code |
| `Arrow Keys` | Navigate icon grid |
| `Enter` | Copy TSX pattern |

---

## Troubleshooting

### Issue: Icon not found in search

**Cause:** Icon may be in a different category

**Solution:**
1. Try partial keyword matching
2. Browse category by category
3. Check [Icon_Catalog_Guide.md](./Icon_Catalog_Guide.md) for full list

---

### Issue: Color not applying

**Cause:** Custom CSS overriding Tailwind class

**Solution:**
```tsx
// Use !important or increase specificity
<Icon name="heart" className="!text-coria-primary" />
```

---

### Issue: Copied code not working

**Cause:** Missing imports

**Solution:**
```tsx
// Add to top of file
import { Icon } from '@/components/icons/Icon';
```

---

### Issue: Accessibility warnings

**Cause:** Wrong pattern for use case

**Solution:** Refer to [Accessibility Decision Tree](#accessibility-decision-tree) above

---

## Related Documentation

- **[Icon_Usage_Guide.md](./Icon_Usage_Guide.md)** - Comprehensive usage patterns
- **[Icon_Catalog_Guide.md](./Icon_Catalog_Guide.md)** - Complete icon reference
- **[Icon_A11y_Compliance_Report.md](./Icon_A11y_Compliance_Report.md)** - Accessibility compliance
- **[Color_Migration_Guide.md](./Color_Migration_Guide.md)** - Brand color tokens
- **[Icon_Build_Pipeline.md](./Icon_Build_Pipeline.md)** - Build system and CI

---

## Technical Details

### Component Architecture

**File:** `src/app/dev/icons/page.tsx`

**Key Features:**
- Client-side rendering (`'use client'`)
- React state for filters and selections
- Memoized filtering for performance
- Clipboard API for code copying
- Responsive grid layout

**Dependencies:**
```tsx
import { Icon, IconName } from '@/components/icons/Icon';
import { getAvailableIcons } from '@/components/icons/icons-map';
```

---

### State Management

**Local State:**
```tsx
const [searchQuery, setSearchQuery] = useState('');          // Search input
const [selectedCategory, setSelectedCategory] = useState('all'); // Category filter
const [selectedSize, setSelectedSize] = useState(24);        // Size control
const [selectedColor, setSelectedColor] = useState('');      // Color control
const [copiedIcon, setCopiedIcon] = useState<string | null>(null); // Copy feedback
```

**Computed State:**
```tsx
const filteredIcons = useMemo(() => {
  // Filter by category
  // Filter by search query
  // Return matching icons
}, [allIcons, selectedCategory, searchQuery]);
```

---

### Code Generation Logic

**Function:** `copyIconCode(iconName, variant)`

**Variants:**
1. `'tsx'` - Basic implementation
2. `'decorative'` - With aria-hidden
3. `'interactive'` - Button wrapper with aria-label
4. `'informational'` - With aria-label on icon

**Example:**
```tsx
copyIconCode('heart', 'decorative');
// Generates: <Icon name="heart" size={24} aria-hidden="true" />
```

---

## Best Practices

### DO ✅

- **Use the Playground** to explore before implementing
- **Copy the correct pattern** for your use case
- **Test with screen readers** after integration
- **Follow size standards** (16/20/24/32/48/64px)
- **Use brand colors** from the token system

### DON'T ❌

- **Don't hardcode icon sizes** outside standard values
- **Don't use TSX pattern** for production (lacks accessibility)
- **Don't skip aria attributes** for decorative icons
- **Don't use hex colors** instead of brand tokens
- **Don't mix accessibility patterns** without understanding

---

## Feedback & Contributions

**Found a bug?** Report to the development team
**Have suggestions?** Propose enhancements via PR
**Need help?** Check related documentation or ask the team

---

## Changelog

### Version 1.0.0 (2025-10-13)
- ✅ Initial release
- ✅ 78 icons across 6 categories
- ✅ 4 copyable code patterns
- ✅ 15 brand color token previews
- ✅ 6 standard size options
- ✅ Real-time search and filtering
- ✅ Mobile-responsive design
- ✅ Accessibility-first patterns

---

**Last Updated:** 2025-10-13
**Status:** Production Ready
**URL:** `/dev/icons`
**Maintained By:** CORIA Development Team
