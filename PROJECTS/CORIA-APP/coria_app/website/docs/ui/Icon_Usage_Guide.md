# Icon Usage Guide

**Version**: 1.0.0
**Last Updated**: October 12, 2025
**For**: CORIA Website Development Team

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Reference](#api-reference)
3. [Usage Examples](#usage-examples)
4. [Accessibility Best Practices](#accessibility-best-practices)
5. [Styling & Theming](#styling--theming)
6. [Performance Optimization](#performance-optimization)
7. [Migration from lucide-react](#migration-from-lucide-react)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

Icons are built-in to the CORIA design system - no installation needed!

```tsx
// Single import for all icons
import { Icon } from '@/components/icons/Icon';
```

### Basic Usage

```tsx
// Simple icon
<Icon name="search" />

// With custom size
<Icon name="menu" size={32} />

// With color
<Icon name="heart" className="text-coria-primary" />

// With accessibility
<Icon name="close" title="Close dialog" aria-label="Close dialog" />
```

---

## API Reference

### Icon Component Props

```typescript
interface IconProps extends SVGProps<SVGSVGElement> {
  // Required: Icon name from the icon library
  name: IconName;

  // Optional: Size in pixels (default: 24)
  size?: number | 16 | 20 | 24 | 32;

  // Optional: Color (default: currentColor - inherits from parent)
  color?: string;

  // Optional: Accessible label for screen readers
  title?: string;

  // Optional: Additional CSS classes
  className?: string;

  // Optional: Hide from screen readers if decorative
  'aria-hidden'?: boolean;

  // Optional: ARIA label (overrides title)
  'aria-label'?: string;
}
```

### Available Icon Names

```typescript
type IconName =
  // Navigation
  | 'home'
  | 'menu'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'external-link'

  // Actions
  | 'search'
  | 'filter'
  | 'sort'
  | 'download'
  | 'upload'
  | 'share'
  | 'plus'
  | 'minus'
  | 'close'
  | 'check'
  | 'refresh'

  // User & Account
  | 'user'
  | 'settings'
  | 'bell'
  | 'heart'
  | 'star'
  | 'wallet'

  // Communication
  | 'envelope'
  | 'chat'
  | 'globe'
  | 'language'

  // CORIA Brand Icons
  | 'coria-foundation'
  | 'vegan-analysis'
  | 'ai-assistant'
  | 'smart-pantry'
  | 'esg-score'
  | 'carbon-water'
  | 'community'
  | 'token-economy'
  | 'transparency'
  | 'impact-focus'
  | 'green-energy'
  | 'sustainability'
  | 'leaf'
  | 'carbon'
  | 'water'
  | 'cycle'

  // Social Media
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  ;
```

### Size Variants

| Size Prop | Actual Size | Use Case |
|-----------|-------------|----------|
| `16` | 16×16px | Inline with text, dense UI |
| `20` | 20×20px | Compact buttons, navigation |
| `24` | 24×24px (default) | Standard UI elements |
| `32` | 32×32px | Large buttons, hero sections |
| `number` | Custom size | Flexible sizing |

**Example**:
```tsx
<Icon name="search" size={16} /> {/* 16×16 */}
<Icon name="menu" size={20} />   {/* 20×20 */}
<Icon name="heart" size={24} />  {/* 24×24 (default) */}
<Icon name="star" size={32} />   {/* 32×32 */}
<Icon name="home" size={48} />   {/* Custom 48×48 */}
```

---

## Usage Examples

### Navigation Icons

```tsx
// Top navigation
<nav className="flex items-center gap-4">
  <Icon name="home" size={24} className="text-coria-primary" />
  <Icon name="search" size={24} />
  <Icon name="menu" size={24} />
</nav>

// Breadcrumbs
<div className="flex items-center gap-2 text-sm">
  <span>Home</span>
  <Icon name="chevron-right" size={16} className="text-coria-gray-400" />
  <span>Products</span>
</div>

// Back button
<button className="flex items-center gap-2">
  <Icon name="arrow-left" size={20} />
  Back
</button>
```

### Action Buttons

```tsx
// Primary action
<button className="bg-coria-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
  <Icon name="download" size={20} aria-hidden="true" />
  Download App
</button>

// Icon-only button (requires aria-label)
<button
  aria-label="Search products"
  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-coria-gray-100"
>
  <Icon name="search" size={20} aria-hidden="true" />
</button>

// Floating action button
<button
  aria-label="Add to favorites"
  className="fixed bottom-4 right-4 w-14 h-14 bg-coria-primary text-white rounded-full shadow-lg flex items-center justify-center"
>
  <Icon name="heart" size={24} aria-hidden="true" />
</button>
```

### Form Elements

```tsx
// Search input with icon
<div className="relative">
  <Icon
    name="search"
    size={20}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-coria-gray-400"
    aria-hidden="true"
  />
  <input
    type="search"
    placeholder="Search products..."
    className="pl-10 pr-4 py-2 border rounded-lg w-full"
  />
</div>

// Select with icon
<div className="relative">
  <select className="pr-10 py-2 border rounded-lg w-full appearance-none">
    <option>Select option</option>
  </select>
  <Icon
    name="chevron-down"
    size={20}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-coria-gray-400 pointer-events-none"
    aria-hidden="true"
  />
</div>
```

### Status Indicators

```tsx
// Success message
<div className="flex items-center gap-2 text-coria-success">
  <Icon name="check" size={20} aria-hidden="true" />
  <span>Product saved successfully</span>
</div>

// Error message
<div className="flex items-center gap-2 text-coria-error">
  <Icon name="close" size={20} aria-hidden="true" />
  <span>Failed to load data</span>
</div>

// Loading state
<div className="flex items-center gap-2">
  <Icon name="refresh" size={20} className="animate-spin" aria-hidden="true" />
  <span>Loading...</span>
</div>
```

### Cards & Lists

```tsx
// Feature card
<div className="p-6 border rounded-lg">
  <div className="w-12 h-12 bg-coria-primary/10 rounded-lg flex items-center justify-center mb-4">
    <Icon name="ai-assistant" size={24} className="text-coria-primary" />
  </div>
  <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
  <p className="text-coria-gray-600">Smart vegan product analysis</p>
</div>

// List item with icon
<ul className="space-y-2">
  <li className="flex items-start gap-3">
    <Icon name="check" size={20} className="text-coria-success mt-0.5" aria-hidden="true" />
    <span>100% vegan verified</span>
  </li>
  <li className="flex items-start gap-3">
    <Icon name="check" size={20} className="text-coria-success mt-0.5" aria-hidden="true" />
    <span>Allergen-free</span>
  </li>
</ul>
```

### Brand & Social

```tsx
// Footer social links
<div className="flex items-center gap-4">
  <a
    href="https://twitter.com/coria"
    aria-label="Follow us on Twitter"
    className="text-coria-gray-600 hover:text-coria-primary transition-colors"
  >
    <Icon name="twitter" size={24} aria-hidden="true" />
  </a>
  <a
    href="https://instagram.com/coria"
    aria-label="Follow us on Instagram"
    className="text-coria-gray-600 hover:text-coria-primary transition-colors"
  >
    <Icon name="instagram" size={24} aria-hidden="true" />
  </a>
</div>

// CORIA brand logo
<Icon name="coria-foundation" size={48} className="text-coria-primary" />
```

---

## Accessibility Best Practices

### When to Use `aria-hidden="true"`

Use `aria-hidden="true"` when the icon is **decorative** and the meaning is conveyed by text:

```tsx
// ✅ Good: Icon is decorative, button text conveys meaning
<button>
  <Icon name="download" size={20} aria-hidden="true" />
  Download App
</button>

// ❌ Bad: Screen reader announces both icon and text redundantly
<button>
  <Icon name="download" size={20} aria-label="Download" />
  Download App
</button>
```

### When to Use `aria-label` or `title`

Use `aria-label` or `title` when the icon is **semantic** and conveys meaning on its own:

```tsx
// ✅ Good: Icon-only button with clear label
<button aria-label="Close dialog">
  <Icon name="close" size={24} title="Close" />
</button>

// ✅ Good: Standalone status icon
<Icon
  name="check"
  size={20}
  className="text-coria-success"
  title="Verified"
  aria-label="Product verified"
/>

// ❌ Bad: No label for screen readers
<button>
  <Icon name="close" size={24} />
</button>
```

### Interactive Elements

Ensure icons within interactive elements have proper focus states and touch targets:

```tsx
// ✅ Good: 44×44px touch target, visible focus
<button className="w-11 h-11 flex items-center justify-center rounded-lg focus:ring-2 focus:ring-coria-primary focus:outline-none">
  <Icon name="heart" size={24} aria-hidden="true" />
</button>

// ❌ Bad: Touch target too small (icon-only is 24×24px)
<Icon name="heart" size={24} className="cursor-pointer" />
```

### Color Contrast

Ensure icons meet WCAG 2.1 AA contrast requirements:

```tsx
// ✅ Good: Primary color (#1B5E3F) on white has 8.3:1 ratio
<Icon name="search" className="text-coria-primary" />

// ⚠️ Warning: Gray-400 on white is only 2.8:1 - fails for text-sized
<Icon name="search" className="text-coria-gray-400" size={16} />

// ✅ Better: Use darker gray for small icons
<Icon name="search" className="text-coria-gray-600" size={16} />
```

---

## Styling & Theming

### Color Customization

Icons inherit color via `currentColor` by default:

```tsx
// Inherits from parent text color
<div className="text-coria-primary">
  <Icon name="heart" size={24} /> {/* Will be primary green */}
</div>

// Explicit color via className
<Icon name="star" className="text-gold" />

// Custom color via style prop
<Icon name="leaf" style={{ color: '#66BB6A' }} />
```

### Size Customization

```tsx
// Predefined sizes
<Icon name="menu" size={16} />
<Icon name="menu" size={20} />
<Icon name="menu" size={24} /> {/* default */}
<Icon name="menu" size={32} />

// Responsive sizing with Tailwind
<Icon name="home" className="w-6 h-6 md:w-8 md:h-8" />

// Custom size prop
<Icon name="logo" size={64} />
```

### Hover & Active States

```tsx
// Hover state
<button className="group">
  <Icon
    name="heart"
    size={24}
    className="text-coria-gray-400 group-hover:text-coria-error transition-colors"
  />
</button>

// Active/Selected state
<button className={isActive ? 'text-coria-primary' : 'text-coria-gray-400'}>
  <Icon name="home" size={24} aria-hidden="true" />
  Home
</button>
```

### Dark Mode

Icons automatically adapt to dark mode via CSS variables:

```tsx
// No special handling needed - just use design tokens
<Icon name="search" className="text-coria-primary" />

// In dark mode, --coria-primary automatically becomes lighter variant
```

### Animation

```tsx
// Loading spinner
<Icon name="refresh" size={24} className="animate-spin" />

// Pulse animation
<Icon
  name="bell"
  size={24}
  className="animate-pulse text-coria-error"
/>

// Scale on hover
<button className="group">
  <Icon
    name="heart"
    size={24}
    className="transition-transform group-hover:scale-110"
  />
</button>

// Respect reduced motion
<Icon
  name="refresh"
  className={prefersReducedMotion ? '' : 'animate-spin'}
/>
```

---

## Performance Optimization

### Tree-Shaking

The Icon component is designed for optimal tree-shaking:

```tsx
// ✅ Good: Only imports used icons
import { Icon } from '@/components/icons/Icon';

<Icon name="search" /> {/* Only search icon bundled */}
<Icon name="heart" />  {/* Only heart icon bundled */}

// ❌ Bad: Imports all icons even if unused
import * as Icons from '@/components/icons';
```

### Code Splitting

For large icon sets, use dynamic imports:

```tsx
// Lazy load icons for specific routes
const FeatureIcons = lazy(() => import('@/components/icons/feature-icons'));

// In component
<Suspense fallback={<div className="w-6 h-6 bg-coria-gray-200 animate-pulse" />}>
  <Icon name="ai-assistant" />
</Suspense>
```

### Caching

Icons are inlined SVGs, so they benefit from component-level caching:

```tsx
// Memoize icon components in lists
const MemoizedIcon = memo(Icon);

// In list rendering
{items.map(item => (
  <li key={item.id}>
    <MemoizedIcon name={item.icon} size={20} />
    {item.name}
  </li>
))}
```

### Bundle Size

- Single icon: ~0.5-2KB (optimized SVG)
- Icon component: ~1KB (wrapper logic)
- Total overhead: ~2KB base + 1KB per icon

**Optimization Tips**:
1. Use icon sprites for 10+ icons (future enhancement)
2. Ensure proper tree-shaking in build config
3. Lazy load feature-specific icon sets

---

## Migration from lucide-react

### Step-by-Step Migration

#### 1. Update Imports

**Before**:
```tsx
import { Search, Menu, ChevronDown } from 'lucide-react';
```

**After**:
```tsx
import { Icon } from '@/components/icons/Icon';
```

#### 2. Replace Icon Usage

**Before**:
```tsx
<Search className="w-5 h-5 text-gray-600" />
<Menu size={24} color="#1B5E3F" />
<ChevronDown strokeWidth={2} />
```

**After**:
```tsx
<Icon name="search" size={20} className="text-coria-gray-600" />
<Icon name="menu" size={24} className="text-coria-primary" />
<Icon name="chevron-down" size={24} />
```

#### 3. Icon Name Mapping

| lucide-react | CORIA Icon | Notes |
|--------------|------------|-------|
| `<Search />` | `<Icon name="search" />` | Direct mapping |
| `<Menu />` | `<Icon name="menu" />` | Direct mapping |
| `<X />` | `<Icon name="close" />` | Semantic name |
| `<ChevronDown />` | `<Icon name="chevron-down" />` | Kebab-case |
| `<ArrowLeft />` | `<Icon name="arrow-left" />` | Kebab-case |
| `<Home />` | `<Icon name="home" />` | Direct mapping |
| `<Settings />` | `<Icon name="settings" />` | Direct mapping |
| `<User />` | `<Icon name="user" />` | Direct mapping |
| `<Bell />` | `<Icon name="bell" />` | Direct mapping |
| `<Heart />` | `<Icon name="heart" />` | Direct mapping |
| `<Star />` | `<Icon name="star" />` | Direct mapping |
| `<Download />` | `<Icon name="download" />` | Direct mapping |
| `<Upload />` | `<Icon name="upload" />` | Direct mapping |
| `<Share />` | `<Icon name="share" />` | Direct mapping |
| `<ExternalLink />` | `<Icon name="external-link" />` | Kebab-case |
| `<RefreshCw />` | `<Icon name="refresh" />` | Semantic name |
| `<AlertTriangle />` | Use semantic component | Not direct icon |
| `<Info />` | `<Icon name="info" />` | Direct mapping |
| `<Check />` | `<Icon name="check" />` | Direct mapping |

### Automated Migration Script

```bash
# Find all lucide-react imports
grep -r "from 'lucide-react'" src/ --include="*.tsx"

# Replace with Icon component (manual review recommended)
# Use IDE refactor tools or sed for bulk replacement
```

### Testing After Migration

```tsx
// Visual regression test
describe('Icon Migration', () => {
  it('renders icons consistently', () => {
    const { container } = render(<Icon name="search" size={24} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
    expect(container.querySelector('svg')).toHaveAttribute('height', '24');
  });

  it('applies color correctly', () => {
    const { container } = render(<Icon name="heart" className="text-coria-primary" />);
    expect(container.querySelector('svg')).toHaveClass('text-coria-primary');
  });
});
```

---

## Troubleshooting

### Icon Not Rendering

**Problem**: Icon component renders but no icon appears

**Solutions**:
```tsx
// ✅ Check icon name is valid
<Icon name="search" /> // Correct
<Icon name="Search" /> // ❌ Wrong - case sensitive

// ✅ Ensure icon is in icons-map
import { iconMap } from '@/components/icons/icons-map';
console.log(iconMap['search']); // Should return SearchIcon component

// ✅ Check console for errors
// Look for: "Warning: Icon 'xyz' not found in icon map"
```

### Icon Size Not Applying

**Problem**: Icon doesn't respect size prop

**Solutions**:
```tsx
// ✅ Use number, not string
<Icon name="menu" size={24} /> // Correct
<Icon name="menu" size="24" /> // ❌ Wrong

// ✅ Check for conflicting className
<Icon name="menu" size={24} /> // 24×24
<Icon name="menu" size={24} className="w-6 h-6" /> // Overridden to 24×24 by className

// ✅ Use either size prop OR className, not both
<Icon name="menu" className="w-8 h-8" /> // 32×32 via Tailwind
```

### Color Not Applying

**Problem**: Icon doesn't change color

**Solutions**:
```tsx
// ✅ Use text color classes
<Icon name="heart" className="text-coria-primary" /> // Correct
<Icon name="heart" className="bg-coria-primary" /> // ❌ Wrong - use text, not bg

// ✅ Ensure currentColor is used
// Check SVG source uses stroke="currentColor" or fill="currentColor"

// ✅ Check specificity
<div className="text-red-500">
  <Icon name="star" /> // Will be red
  <Icon name="star" className="text-blue-500" /> // Will be blue (higher specificity)
</div>
```

### Accessibility Warnings

**Problem**: Screen reader announces icon incorrectly

**Solutions**:
```tsx
// ✅ For decorative icons (with text)
<button>
  <Icon name="download" aria-hidden="true" />
  Download
</button>

// ✅ For semantic icons (no text)
<button aria-label="Download report">
  <Icon name="download" title="Download" />
</button>

// ❌ Don't do both
<button aria-label="Download report">
  <Icon name="download" aria-label="Download" />
  Download
</button>
```

### Build Errors

**Problem**: TypeScript errors with icon names

**Solutions**:
```tsx
// ✅ Use IconName type
import { Icon, type IconName } from '@/components/icons/Icon';

const iconName: IconName = 'search'; // Type-safe
<Icon name={iconName} />

// ❌ Avoid any type
const iconName: any = 'search'; // Loses type safety

// ✅ For dynamic icons, validate at runtime
const getIcon = (name: string): IconName => {
  if (isValidIconName(name)) return name as IconName;
  return 'home'; // Fallback
};
```

### Performance Issues

**Problem**: Icons causing re-renders or slow performance

**Solutions**:
```tsx
// ✅ Memoize in lists
const MemoIcon = memo(Icon);
{items.map(item => <MemoIcon key={item.id} name={item.icon} />)}

// ✅ Use static size prop
<Icon name="search" size={24} /> // Optimized
<Icon name="search" size={width / 2} /> // Recalculates on every render

// ✅ Avoid inline functions
<Icon name="heart" onClick={() => handleLike(id)} /> // ❌ New function each render
<Icon name="heart" onClick={handleLike} /> // ✅ Stable reference
```

---

## Advanced Patterns

### Conditional Icons

```tsx
// Icon based on state
<Icon name={isActive ? 'heart' : 'heart-outline'} />

// Dynamic icon size
<Icon
  name="search"
  size={isMobile ? 20 : 24}
/>

// Icon with status color
<Icon
  name="check"
  className={status === 'success' ? 'text-coria-success' : 'text-coria-gray-400'}
/>
```

### Icon Composition

```tsx
// Badge on icon
<div className="relative">
  <Icon name="bell" size={24} />
  <span className="absolute -top-1 -right-1 w-3 h-3 bg-coria-error rounded-full" />
</div>

// Icon in avatar
<div className="w-12 h-12 bg-coria-primary/10 rounded-full flex items-center justify-center">
  <Icon name="user" size={24} className="text-coria-primary" />
</div>
```

### Custom Icon Wrapper

```tsx
// Reusable icon button component
function IconButton({
  icon,
  label,
  onClick,
  ...props
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-coria-gray-100 transition-colors"
      {...props}
    >
      <Icon name={icon} size={20} aria-hidden="true" />
    </button>
  );
}

// Usage
<IconButton icon="search" label="Search products" onClick={handleSearch} />
```

---

## Resources

### Documentation
- Icon Inventory Report: `/docs/ui/Icon_Inventory_Report.md`
- Icon Design Brief: `/docs/ui/Icon_Design_Brief.md`
- Color Migration Guide: `/docs/ui/Color_Migration_Guide.md`

### Design Assets
- Figma Icon Library: [Link to Figma]
- Icon Design Templates: `/design/icon-templates/`

### Code References
- Icon Component: `/src/components/icons/Icon.tsx`
- Icons Map: `/src/components/icons/icons-map.ts`
- Icon Tests: `/src/test/components/icons/`

### External Resources
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- SVG Optimization: https://jakearchibald.github.io/svgomg/
- Contrast Checker: https://webaim.org/resources/contrastchecker/

---

**Guide Prepared By**: Claude (Frontend Architect Agent)
**Questions?** File an issue on GitHub or contact the frontend team
