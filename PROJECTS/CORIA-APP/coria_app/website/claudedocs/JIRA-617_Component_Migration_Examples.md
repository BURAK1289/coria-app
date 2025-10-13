# JIRA-617: Component Migration Examples

## Overview
This document provides before/after examples for migrating existing components to use the CORIA gray scale system with Tailwind CSS v4.

## Migration Strategy

### 1. Text Color Migration

**Before** (using generic Tailwind grays):
```tsx
<h1 className="text-gray-900">Heading</h1>
<p className="text-gray-700">Body text</p>
<small className="text-gray-500">Caption</small>
```

**After** (using CORIA gray scale):
```tsx
<h1 className="text-coria-gray-900">Heading</h1>
<p className="text-coria-gray-700">Body text</p>
<small className="text-coria-gray-600">Caption</small> {/* Changed from 500 to 600 for better contrast */}
```

### 2. Background Color Migration

**Before**:
```tsx
<div className="bg-gray-50">Card</div>
<div className="bg-gray-100">Light surface</div>
```

**After**:
```tsx
<div className="bg-coria-gray-50">Card</div>
<div className="bg-coria-gray-100">Light surface</div>
```

### 3. Border Color Migration

**Before**:
```tsx
<div className="border border-gray-300">Content</div>
```

**After**:
```tsx
<div className="border border-coria-gray-300">Content</div>
```

## Complete Component Examples

### Example 1: Card Component Migration

**Before** (`src/components/ui/card.tsx`):
```tsx
interface CardProps {
  title: string;
  description: string;
  footer?: React.ReactNode;
}

export function Card({ title, description, footer }: CardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      {footer && (
        <div className="border-t border-gray-200 pt-4 mt-4 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </div>
  );
}
```

**After** (JIRA-617 compliant):
```tsx
interface CardProps {
  title: string;
  description: string;
  footer?: React.ReactNode;
}

export function Card({ title, description, footer }: CardProps) {
  return (
    <div className="bg-white border border-coria-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-coria-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-coria-gray-700 mb-4"> {/* Changed from gray-600 to gray-700 for better contrast */}
        {description}
      </p>
      {footer && (
        <div className="border-t border-coria-gray-200 pt-4 mt-4 text-sm text-coria-gray-600"> {/* Changed from gray-500 to gray-600 */}
          {footer}
        </div>
      )}
    </div>
  );
}
```

**Changes**:
- `text-gray-900` → `text-coria-gray-900` (heading)
- `text-gray-600` → `text-coria-gray-700` (body - improved contrast from 5.2:1 to 7.2:1)
- `text-gray-500` → `text-coria-gray-600` (footer - improved contrast from 3.8:1 to 5.2:1)
- `border-gray-200` → `border-coria-gray-200` (consistent borders)

### Example 2: Button Component Migration

**Before** (`src/components/ui/button.tsx`):
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-md font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-coria-primary text-white hover:bg-coria-primary-dark',
    secondary: 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

**After** (JIRA-617 compliant):
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-md font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-coria-primary text-white hover:bg-coria-primary-dark',
    secondary: 'bg-coria-gray-100 text-coria-gray-900 border border-coria-gray-300 hover:bg-coria-gray-200 hover:border-coria-gray-400',
    ghost: 'bg-transparent text-coria-gray-700 border border-coria-gray-300 hover:bg-coria-gray-50',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

**Changes**:
- All `gray-*` classes → `coria-gray-*`
- Added hover state for secondary button border: `hover:border-coria-gray-400`

### Example 3: Form Input Migration

**Before** (`src/components/ui/input.tsx`):
```tsx
interface InputProps {
  label: string;
  placeholder?: string;
  error?: string;
}

export function Input({ label, placeholder, error }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full border rounded-md px-4 py-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-coria-primary focus:ring-coria-primary'
        } placeholder:text-gray-400 text-gray-900`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
```

**After** (JIRA-617 compliant):
```tsx
interface InputProps {
  label: string;
  placeholder?: string;
  error?: string;
}

export function Input({ label, placeholder, error }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-coria-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full border rounded-md px-4 py-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-coria-gray-300 focus:border-coria-primary focus:ring-coria-primary'
        } placeholder:text-coria-gray-400 text-coria-gray-900 bg-white`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
```

**Changes**:
- `text-gray-700` → `text-coria-gray-700` (label)
- `border-gray-300` → `border-coria-gray-300` (input border)
- `placeholder:text-gray-400` → `placeholder:text-coria-gray-400`
- `text-gray-900` → `text-coria-gray-900`
- Added `bg-white` for explicit background (better for dark mode)

### Example 4: Navigation Component Migration

**Before** (`src/components/layout/navigation.tsx`):
```tsx
export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl font-bold text-gray-900">
            CORIA
          </a>
          <div className="flex gap-6">
            <a href="/features" className="text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="/pricing" className="text-gray-700 hover:text-gray-900">
              Pricing
            </a>
            <a href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**After** (JIRA-617 compliant):
```tsx
export function Navigation() {
  return (
    <nav className="bg-white border-b border-coria-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl font-bold text-coria-gray-900">
            CORIA
          </a>
          <div className="flex gap-6">
            <a
              href="/features"
              className="text-coria-gray-700 hover:text-coria-gray-900 hover:bg-coria-gray-50 px-3 py-2 rounded-md transition-colors"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="text-coria-gray-700 hover:text-coria-gray-900 hover:bg-coria-gray-50 px-3 py-2 rounded-md transition-colors"
            >
              Pricing
            </a>
            <a
              href="/about"
              className="text-coria-gray-700 hover:text-coria-gray-900 hover:bg-coria-gray-50 px-3 py-2 rounded-md transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Changes**:
- All `gray-*` → `coria-gray-*`
- Added hover background: `hover:bg-coria-gray-50`
- Added padding and transitions for better UX

## Automated Migration Script

You can use this script to find components that need migration:

```bash
#!/bin/bash
# find-gray-usage.sh

echo "Finding components using generic gray colors..."
echo ""

echo "=== Text Colors ==="
grep -r "text-gray-" src/components --include="*.tsx" --include="*.ts" | grep -v "coria-gray" | wc -l
echo "occurrences found"
echo ""

echo "=== Background Colors ==="
grep -r "bg-gray-" src/components --include="*.tsx" --include="*.ts" | grep -v "coria-gray" | wc -l
echo "occurrences found"
echo ""

echo "=== Border Colors ==="
grep -r "border-gray-" src/components --include="*.tsx" --include="*.ts" | grep -v "coria-gray" | wc -l
echo "occurrences found"
echo ""

echo "=== Files needing migration ==="
grep -r "text-gray-\|bg-gray-\|border-gray-" src/components --include="*.tsx" --include="*.ts" -l | grep -v "coria-gray" | sort | uniq
```

## Testing Checklist

After migration, verify:

- [ ] All text has sufficient contrast (use browser DevTools Lighthouse)
- [ ] Components work in both light and dark modes
- [ ] Hover states are visible and accessible
- [ ] Focus indicators are clear (test with keyboard navigation)
- [ ] No visual regressions compared to before migration
- [ ] Print stylesheet still works if applicable

## Common Pitfalls

### ❌ Don't: Mix generic and CORIA grays

```tsx
// Bad - inconsistent gray usage
<div className="border border-gray-200">
  <p className="text-coria-gray-700">Content</p>
</div>
```

```tsx
// Good - consistent CORIA gray usage
<div className="border border-coria-gray-200">
  <p className="text-coria-gray-700">Content</p>
</div>
```

### ❌ Don't: Use gray-500 for small text

```tsx
// Bad - insufficient contrast
<p className="text-sm text-coria-gray-500">Small text</p>
```

```tsx
// Good - use gray-600 or darker for small text
<p className="text-sm text-coria-gray-600">Small text</p>
```

### ❌ Don't: Forget hover states

```tsx
// Bad - no visual feedback
<button className="bg-coria-gray-100 text-coria-gray-900">
  Button
</button>
```

```tsx
// Good - clear hover feedback
<button className="bg-coria-gray-100 text-coria-gray-900 hover:bg-coria-gray-200 hover:border-coria-gray-400 transition-colors">
  Button
</button>
```

## Resources

- [Design_System_Colors_Gray_Scale.md](./Design_System_Colors_Gray_Scale.md) - Complete gray scale reference
- [gray-scale-showcase.tsx](../src/components/examples/gray-scale-showcase.tsx) - Live examples
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/) - Test your colors

## Version History

- **2024-10-08**: Initial migration guide (JIRA-617)
