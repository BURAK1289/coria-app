# Color Migration Guide - Hardcoded to Design System

**Purpose**: Quick reference for replacing hardcoded hex colors with CORIA design system variables
**Date**: October 2, 2025
**Related**: UI_Audit.md, UI_Remediation_Plan.md

---

## Quick Reference Table

### Primary Brand Colors

| Hex Code | CSS Variable | Tailwind Class | Use Case |
|----------|--------------|----------------|----------|
| `#1B5E3F` | `var(--coria-primary)` | `text-coria-primary` / `bg-coria-primary` | Primary brand color, CTAs, headings |
| `#0D3B2F` | `var(--coria-primary-dark)` | `text-coria-primary-dark` / `bg-coria-primary-dark` | Dark accent, gradients, hover states |
| `#3F7C5A` | `var(--coria-primary-light)` | `text-coria-primary-light` / `bg-coria-primary-light` | Light variant, backgrounds |
| `#66BB6A` | `var(--acik-yesil)` / `var(--leaf)` | `text-acik-yesil` / `bg-acik-yesil` | Success messages, positive indicators |
| `#26A69A` | `var(--su-yesili)` / `var(--coria-accent)` | `text-su-yesili` / `bg-su-yesili` | Links, hover states, secondary accents |

### Support Colors

| Hex Code | CSS Variable | Tailwind Class | Use Case |
|----------|--------------|----------------|----------|
| `#FF6B6B` | `var(--mercan)` / `var(--coral)` | `text-mercan` / `bg-mercan` | Warnings, critical info, error states |
| `#8D6E63` | `var(--toprak)` / `var(--earth)` | `text-toprak` / `bg-toprak` | Neutral areas, tertiary elements |
| `#F5F5F5` | `var(--acik-gri)` | `bg-acik-gri` | Card backgrounds, light surfaces |
| `#2C2C2C` | `var(--koyu-gri)` | `text-koyu-gri` | Text, headings (light mode) |

### Extended Palette

| Hex Code | CSS Variable | Tailwind Class | Use Case |
|----------|--------------|----------------|----------|
| `#C5D86D` | `var(--lime)` | `text-lime` / `bg-lime` | Energetic highlights, accents |
| `#87CEEB` | `var(--sky)` | `text-sky` / `bg-sky` | Water & clarity themes, info states |
| `#FFD93D` | `var(--gold)` | `text-gold` / `bg-gold` | Achievements, premium features |
| `#F5F0E6` | `var(--foam)` | `bg-foam` | Primary surface color |
| `#E8E5E0` | `var(--mist)` | `bg-mist` | Secondary wash color |
| `#F4E8D6` | `var(--coria-sand)` | `bg-coria-sand` | Warm backgrounds |
| `#E3F0DF` | `var(--coria-mint)` | `bg-coria-mint` | Cool backgrounds |

### Neutral Grays

| Hex Code | CSS Variable | Tailwind Class | Use Case |
|----------|--------------|----------------|----------|
| `#FFFFFF` | `var(--coria-white)` | `bg-white` / `text-white` | Pure white backgrounds |
| `#FBFAF7` | `var(--coria-gray-50)` | `bg-coria-gray-50` | Lightest gray |
| `#F3EEE4` | `var(--coria-gray-100)` | `bg-coria-gray-100` | Very light gray |
| `#E8E5E0` | `var(--coria-gray-200)` | `bg-coria-gray-200` | Light gray |
| `#D4D0C9` | `var(--coria-gray-300)` | `bg-coria-gray-300` | Medium-light gray |
| `#B6B2AA` | `var(--coria-gray-400)` | `text-coria-gray-400` | Medium gray |
| `#7A8B7F` | `var(--coria-gray-500)` | `text-coria-gray-500` | Medium-dark gray |
| `#5F6F64` | `var(--coria-gray-600)` | `text-coria-gray-600` | Dark gray |
| `#46554B` | `var(--coria-gray-700)` | `text-coria-gray-700` | Very dark gray |
| `#38453C` | `var(--coria-gray-800)` | `text-coria-gray-800` | Darker gray |
| `#2C3E34` | `var(--coria-gray-900)` | `text-coria-gray-900` | Primary text color |
| `#101713` | `var(--coria-black)` | `text-coria-black` | Pure black |

### Semantic Colors

| Hex Code | CSS Variable | Tailwind Class | Use Case |
|----------|--------------|----------------|----------|
| `#66BB6A` | `var(--coria-success)` | `text-coria-success` / `bg-coria-success` | Success states |
| `#FFD93D` | `var(--coria-warning)` | `text-coria-warning` / `bg-coria-warning` | Warning states |
| `#FF6B6B` | `var(--coria-error)` | `text-coria-error` / `bg-coria-error` | Error states |
| `#87CEEB` | `var(--coria-info)` | `text-coria-info` / `bg-coria-info` | Info states |

---

## Common Pattern Replacements

### Text Colors

**Before**:
```tsx
<h1 className="text-[#1B5E3F]">Heading</h1>
<p className="text-[#2C2C2C]">Body text</p>
<span className="text-[#FF6B6B]">Error message</span>
```

**After**:
```tsx
<h1 className="text-coria-primary">Heading</h1>
<p className="text-koyu-gri">Body text</p>
<span className="text-mercan">Error message</span>
```

### Background Colors

**Before**:
```tsx
<div className="bg-[#F5F5F5]">Card</div>
<button className="bg-[#1B5E3F]">Button</button>
<div className="bg-[#87CEEB]/20">Info box</div>
```

**After**:
```tsx
<div className="bg-acik-gri">Card</div>
<button className="bg-coria-primary">Button</button>
<div className="bg-sky/20">Info box</div>
```

### Border Colors

**Before**:
```tsx
<div className="border-[#1B5E3F]">Bordered</div>
<div className="border-[#1B5E3F]/8">Subtle border</div>
```

**After**:
```tsx
<div className="border-coria-primary">Bordered</div>
<div className="border-coria-primary/8">Subtle border</div>
```

### Gradients

**Before**:
```tsx
className="bg-gradient-to-r from-[#1B5E3F] to-[#0D3B2F]"
className="bg-gradient-to-br from-[#1B5E3F]/6 via-[#7FB069]/4 to-transparent"
className="bg-gradient-to-r from-[#1B5E3F] via-[#0D3B2F] to-[#1B5E3F]"
```

**After**:
```tsx
className="bg-gradient-coria"
className="bg-gradient-to-br from-coria-primary/6 via-leaf/4 to-transparent"
className="bg-gradient-to-r from-coria-primary via-coria-primary-dark to-coria-primary"
```

**Predefined Gradient Classes**:
```css
.bg-gradient-coria {
  background: linear-gradient(135deg,
    var(--coria-primary) 0%,
    var(--coria-secondary) 45%,
    var(--lime) 70%,
    var(--gold) 100%);
}

.bg-gradient-organic {
  background: linear-gradient(135deg,
    var(--coria-green) 0%,
    var(--acik-yesil) 50%,
    var(--su-yesili) 100%);
}

.bg-gradient-organic-soft {
  background: linear-gradient(135deg,
    rgba(27, 94, 63, 0.1) 0%,
    rgba(102, 187, 106, 0.05) 50%,
    rgba(38, 166, 154, 0.1) 100%);
}
```

### Shadow Colors

**Before**:
```tsx
className="shadow-lg shadow-[#1B5E3F]/20"
className="hover:shadow-xl hover:shadow-[#1B5E3F]/30"
```

**After**:
```tsx
className="shadow-lg shadow-coria-primary/20"
className="hover:shadow-xl hover:shadow-coria-primary/30"
```

### Ring Colors

**Before**:
```tsx
className="ring-1 ring-[rgba(27,94,63,0.08)]"
className="focus:ring-2 focus:ring-[#1B5E3F]"
```

**After**:
```tsx
className="ring-1 ring-coria-primary/8"
className="focus:ring-2 focus:ring-coria-primary"
```

---

## File-Specific Migration Checklist

### `src/components/sections/hero-section.tsx` (20 replacements)

**Line 51**: `bg-gradient-to-br from-white via-white/98 to-[#F8F9FA]`
→ `bg-gradient-to-br from-white via-white/98 to-acik-gri`

**Line 61**: `from-[#1B5E3F]/6 via-[#7FB069]/4`
→ `from-coria-primary/6 via-leaf/4`

**Line 71**: `from-[#87CEEB]/6 via-[#C5D86D]/4`
→ `from-sky/6 via-lime/4`

**Line 81**: `from-[#FFD93D]/5 via-[#1B5E3F]/3`
→ `from-gold/5 via-coria-primary/3`

**Line 98**: `border-[#1B5E3F]/8` and `text-[#1B5E3F]`
→ `border-coria-primary/8` and `text-coria-primary`

**Line 100**: `bg-[#7FB069]`
→ `bg-leaf`

**Line 112**: `from-[#1B5E3F] via-[#0D3B2F] to-[#1B5E3F]`
→ `bg-gradient-coria` (predefined gradient)

**Line 137**: `from-[#1B5E3F] to-[#0D3B2F]` and `shadow-[#1B5E3F]/20`
→ `bg-gradient-coria` and `shadow-coria-primary/20`

**Line 148**: `border-[#1B5E3F]/15` and `text-[#1B5E3F]`
→ `border-coria-primary/15` and `text-coria-primary`

**Line 178**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Lines 231, 245, 258-261, 266**: Various `border-[#1B5E3F]` and `bg-[#1B5E3F]`
→ Replace all with `border-coria-primary` and `bg-coria-primary`

**Line 295**: `from-[#1B5E3F]/40 to-[#7FB069]/40`
→ `from-coria-primary/40 to-leaf/40`

**Line 304**: `from-[#C5D86D]/40 to-[#87CEEB]/40`
→ `from-lime/40 to-sky/40`

**Line 314**: `from-[#1B5E3F]/20` and `to-[#7FB069]/20`
→ `from-coria-primary/20` and `to-leaf/20`

### `src/app/[locale]/foundation/page.tsx` (29 replacements)

**Line 129**: `to-[#F8F9FA]`
→ `to-acik-gri`

**Line 141**: `from-[#1B5E3F]/8 via-[#7FB069]/6`
→ `from-coria-primary/8 via-leaf/6`

**Line 151**: `from-[#87CEEB]/8 via-[#C5D86D]/6`
→ `from-sky/8 via-lime/6`

**Line 169**: `from-[#1B5E3F]/10 to-[#7FB069]/10` and `border-[#1B5E3F]/10`
→ `from-coria-primary/10 to-leaf/10` and `border-coria-primary/10`

**Line 175**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Line 196**: `from-[#1B5E3F] to-[#0D3B2F]`
→ `bg-gradient-coria`

**Line 216**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Line 241**: `bg-[#1B5E3F]/10` and `text-[#1B5E3F]`
→ `bg-coria-primary/10` and `text-coria-primary`

**Line 244**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Line 258**: `to-[#F8F9FA]`
→ `to-acik-gri`

**Line 266**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Line 284**: `bg-[#1B5E3F]/10` and `text-[#1B5E3F]`
→ `bg-coria-primary/10` and `text-coria-primary`

**Line 287**: `text-[#1B5E3F]`
→ `text-coria-primary`

### `src/components/sections/features-showcase.tsx` (8 replacements)

**Line 53**: `bg-[#1B5E3F]/10` and `text-[#1B5E3F]` and `group-hover:bg-[#1B5E3F]/20`
→ `bg-coria-primary/10` and `text-coria-primary` and `group-hover:bg-coria-primary/20`

**Line 59**: `text-[#1B5E3F]` and `group-hover:text-[#0D3B2F]`
→ `text-coria-primary` and `group-hover:text-coria-primary-dark`

**Line 68**: `from-[#1B5E3F] to-[#7FB069]`
→ `bg-gradient-organic` or `from-coria-primary to-leaf`

**Line 114**: `to-[#F8F9FA]`
→ `to-acik-gri`

**Line 124**: `from-[#7FB069]/8 via-[#C5D86D]/6`
→ `from-leaf/8 via-lime/6`

**Line 134**: `from-[#87CEEB]/8 via-[#1B5E3F]/6`
→ `from-sky/8 via-coria-primary/6`

**Line 148**: `text-[#1B5E3F]`
→ `text-coria-primary`

**Line 184**: `from-[#1B5E3F] to-[#0D3B2F]`
→ `bg-gradient-coria`

### `src/components/blog/*.tsx` (4 replacements)

**`blog-categories.tsx:59`**:
```tsx
style={{ backgroundColor: category.color || '#1B5E3F' }}
```
→
```tsx
style={{ backgroundColor: category.color || 'var(--coria-primary)' }}
```

**`blog-card.tsx:39`**:
```tsx
style={{ backgroundColor: post.category.color || '#1B5E3F' }}
```
→
```tsx
style={{ backgroundColor: post.category.color || 'var(--coria-primary)' }}
```

**`blog-post-header.tsx:16`**:
```tsx
style={{ backgroundColor: post.category.color || '#1B5E3F' }}
```
→
```tsx
style={{ backgroundColor: post.category.color || 'var(--coria-primary)' }}
```

**`blog-post-meta.tsx:119`**:
```tsx
style={{ backgroundColor: post.category.color || '#1B5E3F' }}
```
→
```tsx
style={{ backgroundColor: post.category.color || 'var(--coria-primary)' }}
```

### `src/components/seo/seo-head.tsx` (2 replacements)

**Lines 75-76**:
```tsx
<meta name="theme-color" content="#1B5E3F" />
<meta name="msapplication-TileColor" content="#1B5E3F" />
```
→
```tsx
<meta name="theme-color" content="var(--coria-primary)" />
<meta name="msapplication-TileColor" content="var(--coria-primary)" />
```

**Note**: For `<meta>` tags, CSS variables won't work. Use the actual hex value `#1B5E3F` but add a comment:
```tsx
{/* Keep hex value for meta tags - CSS variables not supported */}
<meta name="theme-color" content="#1B5E3F" />
```

### `src/app/[locale]/layout.tsx` (3 replacements)

**Lines 149, 160-161**:
```tsx
{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1B5E3F' },
'msapplication-TileColor': '#1B5E3F',
'theme-color': '#1B5E3F',
```
→ **Keep as hex values** (required for meta tags and manifest):
```tsx
{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1B5E3F' }, // Safari pinned tab requires hex
'msapplication-TileColor': '#1B5E3F', // Windows tile requires hex
'theme-color': '#1B5E3F', // Browser UI requires hex
```

**Exception**: These are **acceptable hardcoded values** because meta tags and manifests don't support CSS variables. Document this exception in code comments.

---

## Automated Replacement Script

**File**: `scripts/fix-hardcoded-colors.sh`

```bash
#!/bin/bash

# CORIA Color Migration Script
# Replaces hardcoded hex colors with design system variables

set -e  # Exit on error

echo "🎨 CORIA Color Migration Script"
echo "================================"
echo ""

# Backup files before modification
echo "📦 Creating backup..."
mkdir -p backups
cp -r src backups/src-$(date +%Y%m%d-%H%M%S)

# Function to replace colors in a file
replace_colors() {
  local file=$1
  echo "🔧 Processing: $file"

  # Text colors
  sed -i '' 's/text-\[#1B5E3F\]/text-coria-primary/g' "$file"
  sed -i '' 's/text-\[#0D3B2F\]/text-coria-primary-dark/g' "$file"
  sed -i '' 's/text-\[#66BB6A\]/text-acik-yesil/g' "$file"
  sed -i '' 's/text-\[#7FB069\]/text-leaf/g' "$file"
  sed -i '' 's/text-\[#26A69A\]/text-su-yesili/g' "$file"
  sed -i '' 's/text-\[#FF6B6B\]/text-mercan/g' "$file"
  sed -i '' 's/text-\[#8D6E63\]/text-toprak/g' "$file"
  sed -i '' 's/text-\[#2C2C2C\]/text-koyu-gri/g' "$file"

  # Background colors
  sed -i '' 's/bg-\[#1B5E3F\]/bg-coria-primary/g' "$file"
  sed -i '' 's/bg-\[#0D3B2F\]/bg-coria-primary-dark/g' "$file"
  sed -i '' 's/bg-\[#66BB6A\]/bg-acik-yesil/g' "$file"
  sed -i '' 's/bg-\[#7FB069\]/bg-leaf/g' "$file"
  sed -i '' 's/bg-\[#26A69A\]/bg-su-yesili/g' "$file"
  sed -i '' 's/bg-\[#F5F5F5\]/bg-acik-gri/g' "$file"
  sed -i '' 's/bg-\[#F8F9FA\]/bg-acik-gri/g' "$file"
  sed -i '' 's/bg-\[#87CEEB\]/bg-sky/g' "$file"
  sed -i '' 's/bg-\[#C5D86D\]/bg-lime/g' "$file"
  sed -i '' 's/bg-\[#FFD93D\]/bg-gold/g' "$file"

  # Border colors
  sed -i '' 's/border-\[#1B5E3F\]/border-coria-primary/g' "$file"
  sed -i '' 's/border-\[#0D3B2F\]/border-coria-primary-dark/g' "$file"

  # Gradients - simple patterns
  sed -i '' 's/from-\[#1B5E3F\]/from-coria-primary/g' "$file"
  sed -i '' 's/to-\[#1B5E3F\]/to-coria-primary/g' "$file"
  sed -i '' 's/via-\[#1B5E3F\]/via-coria-primary/g' "$file"
  sed -i '' 's/from-\[#0D3B2F\]/from-coria-primary-dark/g' "$file"
  sed -i '' 's/to-\[#0D3B2F\]/to-coria-primary-dark/g' "$file"
  sed -i '' 's/from-\[#7FB069\]/from-leaf/g' "$file"
  sed -i '' 's/to-\[#7FB069\]/to-leaf/g' "$file"
  sed -i '' 's/via-\[#7FB069\]/via-leaf/g' "$file"
  sed -i '' 's/from-\[#87CEEB\]/from-sky/g' "$file"
  sed -i '' 's/via-\[#87CEEB\]/via-sky/g' "$file"
  sed -i '' 's/from-\[#C5D86D\]/from-lime/g' "$file"
  sed -i '' 's/via-\[#C5D86D\]/via-lime/g' "$file"
  sed -i '' 's/from-\[#FFD93D\]/from-gold/g' "$file"

  # Shadow colors
  sed -i '' 's/shadow-\[#1B5E3F\]/shadow-coria-primary/g' "$file"

  # Ring colors - handle rgba separately
  sed -i '' 's/ring-\[rgba(27,94,63,0\.08)\]/ring-coria-primary\/8/g' "$file"
  sed -i '' 's/ring-\[rgba(27,94,63,0\.18)\]/ring-coria-primary\/18/g' "$file"
}

# Process all component files
echo ""
echo "🔍 Finding files to process..."
files=$(find src/components src/app -type f -name "*.tsx" ! -path "*/node_modules/*")

for file in $files; do
  replace_colors "$file"
done

# Special handling for blog components (inline styles)
echo ""
echo "🎨 Processing inline styles in blog components..."
for file in src/components/blog/*.tsx; do
  if [ -f "$file" ]; then
    sed -i '' "s/|| '#1B5E3F'/|| 'var(--coria-primary)'/g" "$file"
  fi
done

# Verify replacements
echo ""
echo "🔍 Verifying replacements..."
remaining=$(grep -r "#1B5E3F\|#0D3B2F\|#7FB069" src/ --include="*.tsx" --exclude-dir=node_modules | wc -l)
echo "   Remaining hardcoded colors: $remaining"

if [ "$remaining" -gt 10 ]; then
  echo "⚠️  Warning: More than 10 hardcoded colors remain (expected < 5 for meta tags)"
  echo "   Manual review required:"
  grep -r "#1B5E3F\|#0D3B2F\|#7FB069" src/ --include="*.tsx" --exclude-dir=node_modules
else
  echo "✅ Color migration completed successfully!"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Review git diff to verify changes"
echo "   2. Test light/dark theme switching"
echo "   3. Run visual regression tests"
echo "   4. Commit changes: git commit -m 'refactor: migrate hardcoded colors to design system'"
echo ""
echo "💾 Backup location: backups/src-$(date +%Y%m%d-%H%M%S)"
```

**Usage**:
```bash
chmod +x scripts/fix-hardcoded-colors.sh
./scripts/fix-hardcoded-colors.sh
```

---

## Validation Checklist

After completing color migration, verify:

### Visual Validation
- [ ] All pages render correctly in light mode
- [ ] All pages render correctly in dark mode
- [ ] Gradient backgrounds display properly
- [ ] Button hover states work
- [ ] Shadow colors are appropriate
- [ ] No visual regressions detected

### Code Validation
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)

### Theme Validation
- [ ] Theme toggle switches colors correctly
- [ ] System preference detection works
- [ ] Theme persists across page navigation
- [ ] Dark mode colors have 80% brightness (as per design)

### Accessibility Validation
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible in both themes
- [ ] Text readable on all backgrounds
- [ ] No contrast issues reported by automated tools

### Performance Validation
- [ ] No increase in bundle size
- [ ] CSS variables compile correctly
- [ ] No runtime performance degradation

---

## Troubleshooting

### Issue: Colors not updating in dark mode

**Cause**: Hardcoded colors bypass CSS variable system

**Solution**: Ensure all colors use CSS variables, not hex values

### Issue: Gradients look different after migration

**Cause**: Gradient syntax changed or color values don't match exactly

**Solution**: Compare before/after screenshots, adjust opacity values if needed

### Issue: Build fails after replacement

**Cause**: Tailwind class doesn't exist in config

**Solution**: Add missing classes to `tailwind.config.ts`:
```ts
theme: {
  extend: {
    colors: {
      'coria-primary': 'var(--coria-primary)',
      'coria-primary-dark': 'var(--coria-primary-dark)',
      // ... add all custom colors
    }
  }
}
```

### Issue: Meta tag colors not working

**Cause**: Meta tags don't support CSS variables

**Solution**: Keep hex values for meta tags, document exception

---

**End of Color Migration Guide**

**Questions?** Refer to `UI_Audit.md` or `UI_Remediation_Plan.md`
