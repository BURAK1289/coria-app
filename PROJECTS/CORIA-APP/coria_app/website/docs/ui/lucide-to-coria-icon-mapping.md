# Lucide-React to CORIA Icon Migration Mapping

**Purpose**: Complete mapping guide for migrating from lucide-react icons to CORIA Icon component
**Status**: Phase 3.3 Migration Guide
**Date**: October 12, 2025

---

## Icon Mapping Table

| Lucide-React Import | CORIA Icon Name | Notes |
|---------------------|-----------------|-------|
| `AlertTriangle` | `'alert-triangle'` | ✅ Available (Phase 3.2) |
| `ArrowLeftIcon` | `'arrow-left'` | ✅ Available |
| `ArrowRightIcon` | `'arrow-right'` | ✅ Available |
| `BarChart3Icon` | `'bar-chart'` | ✅ Available (Phase 3.2) - Note: BarChart3 → bar-chart |
| `Bell` | `'bell'` | ✅ Available |
| `BookOpen` | `'book-open'` | ✅ Available (Phase 3.2) |
| `Bug` | `'bug'` | ✅ Available (Phase 3.2) |
| `CheckIcon` | `'check'` | ✅ Available |
| `ChevronLeftIcon` | `'chevron-left'` | ✅ Available |
| `ChevronRightIcon` | `'chevron-right'` | ✅ Available |
| `DollarSign` | N/A | ⚠️ Not available - needs custom icon or alternative |
| `Download` | `'download'` | ✅ Available |
| `ExternalLinkIcon` | `'external-link'` | ✅ Available |
| `FileTextIcon` | `'file-text'` | ✅ Available (Phase 3.2) |
| `FlaskConicalIcon` | `'flask'` | ✅ Available (Phase 3.2) - Note: FlaskConical → flask |
| `Home` | `'home'` | ✅ Available |
| `Info` / `InfoIcon` | `'info'` | ✅ Available (Phase 3.2) |
| `Leaf` | `'leaf'` | ✅ Available (CORIA brand icon) |
| `Menu` | `'menu'` | ✅ Available |
| `MessageCircle` | N/A | ⚠️ Not available - use 'chat' as alternative |
| `PlayIcon` | `'play'` | ✅ Available |
| `RefreshCw` | `'refresh'` | ✅ Available - Note: RefreshCw → refresh |
| `Smartphone` | `'smartphone'` | ✅ Available (Phase 3.2) |
| `Star` | `'star'` | ✅ Available |
| `TrendingUpIcon` | `'trending-up'` | ✅ Available (Phase 3.2) |
| `X` | `'close'` or `'x'` | ✅ Both available |

---

## Migration Patterns

### Pattern 1: Import Statement Migration

**Before** (lucide-react):
```tsx
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
```

**After** (CORIA Icon):
```tsx
import { Icon } from '@/components/icons/Icon';
```

### Pattern 2: Component Usage Migration

**Before** (lucide-react with className):
```tsx
<AlertTriangle className="h-16 w-16 text-red-500" />
```

**After** (CORIA Icon with size and className):
```tsx
<Icon name="alert-triangle" size={64} className="text-red-500" />
```

### Pattern 3: Size Conversion

Tailwind height classes to size prop conversion:

| Tailwind Class | Size Prop | Pixels |
|----------------|-----------|--------|
| `h-3 w-3` | `size={12}` | 12px |
| `h-4 w-4` | `size={16}` | 16px |
| `h-5 w-5` | `size={20}` | 20px |
| `h-6 w-6` | `size={24}` | 24px (default) |
| `h-8 w-8` | `size={32}` | 32px |
| `h-12 w-12` | `size={48}` | 48px |
| `h-16 w-16` | `size={64}` | 64px |

### Pattern 4: Accessibility Migration

**Before** (basic aria-hidden):
```tsx
<Bug className="h-8 w-8 text-orange-500" />
```

**After** (explicit accessibility):
```tsx
{/* Decorative icon */}
<Icon name="bug" size={32} className="text-orange-500" aria-hidden="true" />

{/* Semantic icon */}
<Icon name="bug" size={32} className="text-orange-500" title="Bug report" aria-label="Report a bug" />
```

### Pattern 5: Icon in Button

**Before**:
```tsx
<button>
  <RefreshCw className="h-4 w-4 mr-2" />
  Tekrar Dene
</button>
```

**After** (decorative, text provides context):
```tsx
<button>
  <Icon name="refresh" size={16} className="mr-2" aria-hidden="true" />
  Tekrar Dene
</button>
```

### Pattern 6: Icon as Action Button

**Before**:
```tsx
<button aria-label="Close menu">
  <X className="h-6 w-6 text-gray-700" aria-hidden="true" />
</button>
```

**After** (icon-only button, needs aria-label on button):
```tsx
<button aria-label="Close menu">
  <Icon name="close" size={24} className="text-gray-700" aria-hidden="true" />
</button>
```

---

## Special Cases

### Case 1: Variable Icon Component

**Before** (storing component reference):
```tsx
const Icon = item.icon;
<Icon className="h-5 w-5" aria-hidden="true" />
```

**After** (storing icon name):
```tsx
const iconName = item.iconName;
<Icon name={iconName} size={20} aria-hidden="true" />
```

### Case 2: Conditional Icon Rendering

**Before**:
```tsx
{isOpen ? (
  <X className="h-6 w-6 text-gray-700" aria-hidden="true" />
) : (
  <Menu className="h-6 w-6 text-gray-700" aria-hidden="true" />
)}
```

**After**:
```tsx
<Icon
  name={isOpen ? 'close' : 'menu'}
  size={24}
  className="text-gray-700"
  aria-hidden="true"
/>
```

### Case 3: Icons Not Available in CORIA

**DollarSign** - Not available, options:
1. Create custom dollar-sign icon in Phase 3.4
2. Use text alternative: `<span className="text-lg font-bold">$</span>`
3. Use emoji: `💰` (less accessible)

**MessageCircle** - Use `'chat'` as alternative:
```tsx
// Before
<MessageCircle className="h-5 w-5" />

// After
<Icon name="chat" size={20} />
```

---

## File-by-File Migration Checklist

### High Priority Files (Most Icons)

- [ ] **mobile-navigation.tsx** (8 icons)
  - `X` → `'close'`
  - `Menu` → `'menu'`
  - `Star` → `'star'`
  - `DollarSign` → Custom or alternative needed
  - `Info` → `'info'`
  - `MessageCircle` → `'chat'`
  - `BookOpen` → `'book-open'`
  - `Leaf` → `'leaf'`

- [ ] **error-boundary.tsx** (4 icons)
  - `AlertTriangle` → `'alert-triangle'`
  - `RefreshCw` → `'refresh'`
  - `Bug` → `'bug'`
  - `Home` → `'home'`

- [ ] **feature-detail.tsx** (4 icons)
  - `ArrowLeftIcon` → `'arrow-left'`
  - `CheckIcon` → `'check'`
  - `InfoIcon` → `'info'`
  - `ExternalLinkIcon` → `'external-link'`

- [ ] **analytics-dashboard.tsx** (4 icons)
  - `BarChart3Icon` → `'bar-chart'`
  - `TrendingUpIcon` → `'trending-up'`
  - `FileTextIcon` → `'file-text'`
  - `FlaskConicalIcon` → `'flask'`

- [ ] **install-prompt.tsx** (3 icons)
  - `X` → `'close'`
  - `Download` → `'download'`
  - `Smartphone` → `'smartphone'`

### Medium Priority Files

- [ ] **admin/monitoring/page.tsx**
- [ ] **[locale]/foundation/page.tsx**
- [ ] **features/why-it-matters.tsx**
- [ ] **features/feature-overview.tsx**
- [ ] **features/methodology-explanation.tsx**
- [ ] **features/data-source-attribution.tsx**
- [ ] **features/features-sidebar.tsx**

---

## Accessibility Guidelines

### When to Use aria-hidden="true"

✅ **Use aria-hidden="true" when:**
- Icon accompanies text that provides context
- Icon is purely decorative
- Parent element has appropriate label

```tsx
<button aria-label="Download app">
  <Icon name="download" size={20} aria-hidden="true" />
  Download
</button>
```

### When to Add title and aria-label

✅ **Add title/aria-label when:**
- Icon stands alone without text
- Icon conveys important meaning
- Icon is interactive (button, link)

```tsx
<Icon
  name="alert-triangle"
  size={48}
  title="Warning"
  aria-label="Warning: Review your settings"
  className="text-orange-500"
/>
```

---

## Testing Checklist

After migration, verify:

- [ ] All icons render correctly (visual check)
- [ ] Icon sizes match previous implementation
- [ ] Colors and theming work correctly
- [ ] Accessibility attributes present where needed
- [ ] Screen reader announces icons appropriately
- [ ] No console warnings about missing icons
- [ ] TypeScript types are correct
- [ ] Bundle size decreased (lucide-react removed)

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting Size Conversion
```tsx
// Wrong - className size won't work
<Icon name="check" className="h-4 w-4" />

// Correct - use size prop
<Icon name="check" size={16} />
```

### ❌ Pitfall 2: Missing Import
```tsx
// Wrong - Icon not imported
<Icon name="home" />

// Correct
import { Icon } from '@/components/icons/Icon';
<Icon name="home" />
```

### ❌ Pitfall 3: Incorrect Icon Name
```tsx
// Wrong - PascalCase
<Icon name="AlertTriangle" />

// Correct - kebab-case
<Icon name="alert-triangle" />
```

### ❌ Pitfall 4: Missing aria-hidden on Decorative Icons
```tsx
// Wrong - screen reader will announce icon
<button>
  <Icon name="refresh" size={16} />
  Refresh
</button>

// Correct - hide from screen readers
<button>
  <Icon name="refresh" size={16} aria-hidden="true" />
  Refresh
</button>
```

---

## Automated Migration Script Template

```typescript
// Example find-and-replace patterns for bulk migration

// Pattern 1: Simple icon usage
// Find: <AlertTriangle className="([^"]*)" />
// Replace: <Icon name="alert-triangle" className="$1" aria-hidden="true" />

// Pattern 2: Icon with size
// Find: <Bug className="h-8 w-8 ([^"]*)" />
// Replace: <Icon name="bug" size={32} className="$1" />

// Pattern 3: Import statements
// Find: import { (.*) } from 'lucide-react';
// Replace: // Migrated to CORIA Icon component
//          import { Icon } from '@/components/icons/Icon';
```

---

## Success Metrics

Phase 3.3 migration complete when:

- ✅ 0 files importing from lucide-react
- ✅ All icons render correctly in visual tests
- ✅ WCAG 2.1 AA accessibility compliance maintained
- ✅ TypeScript build passes with no errors
- ✅ Bundle size reduced by ~185KB (lucide-react removed)
- ✅ `npm run icons:check` passes with 0 lucide-react usages

---

**Next Steps**: Begin systematic migration starting with high-priority files
