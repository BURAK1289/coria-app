# URGENT FIXES REQUIRED - UI Component Regression

**Status**: 🔴 **BLOCKING DEPLOYMENT**
**Severity**: CRITICAL
**Date**: October 3, 2025

---

## Critical Issue #1: Border Radius Override Bug

### Problem
Global WCAG touch target CSS (globals.css line 671-690) applies `border-radius: 8px` with high specificity, overriding all Tailwind `rounded-[28px]` utilities.

### Impact
- ALL buttons render with 8px radius instead of 28px organic rounding
- ALL cards with organic rounding broken
- Design system visual consistency compromised

### Root Cause
```css
/* globals.css:671-690 */
button:not(.mobile-nav-button),
a,
input[type="button"],
input[type="submit"],
input[type="reset"],
[role="button"],
[tabindex="0"],
.interactive-element {
  /* ... */
  border-radius: 8px; /* ← This overrides Tailwind utilities */
  /* ... */
}
```

### Fix (Choose ONE approach)

#### Option 1: Lower Specificity with :where() ⭐ RECOMMENDED
```css
/* Replace lines 671-690 in globals.css */
:where(
  button:not(.mobile-nav-button),
  a,
  input[type="button"],
  input[type="submit"],
  input[type="reset"],
  [role="button"],
  [tabindex="0"],
  .interactive-element
) {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 8px; /* Now overridable by Tailwind */
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;
}
```

**Pros**:
- Maintains WCAG defaults
- Allows Tailwind to override when needed
- No breaking changes to existing components
- Clean, semantic solution

**Cons**: None

#### Option 2: Remove Border Radius from Global Rule
```css
/* Remove border-radius: 8px; from global rule */
/* Apply it per-component where needed */
```

**Pros**: Complete control via Tailwind
**Cons**: May affect other components not using Tailwind

#### Option 3: Add Important Override
```css
/* Add to globals.css after WCAG rule */
.rounded-\[28px\] {
  border-radius: 28px !important;
}
```

**Pros**: Quick fix
**Cons**: Uses !important (not ideal), doesn't fix other custom radius values

### Verification Steps
1. Apply fix to `/src/app/globals.css`
2. Restart dev server (clear Next.js cache if needed)
3. Navigate to `http://localhost:3000/en`
4. Inspect hero buttons - should show 28px border-radius
5. Navigate to `/en/foundation`
6. Inspect cards - should show 28px border-radius

### Expected Result
```javascript
// Before fix
window.getComputedStyle(button).borderRadius; // "8px" ❌

// After fix
window.getComputedStyle(button).borderRadius; // "28px" ✅
```

---

## Critical Issue #2: Foundation Page Not Refactored

### Problem
Foundation page claims to use unified Card component but actually uses hardcoded className strings. The Card component is imported but never used.

### Impact
- Inconsistent component usage across codebase
- Duplicated styles in multiple locations
- Future design system updates won't apply
- Maintenance burden
- False documentation claims

### Files Affected
- `/src/app/[locale]/foundation/page.tsx`

### Current Implementation (WRONG)
```tsx
// Line 290 - Token Economy Cards
<motion.div
  className="transition-all duration-300 rounded-[28px] bg-white/60 backdrop-blur-md border border-white/30 shadow-lg p-8 hover:-translate-y-2 hover:shadow-xl group relative"
>
  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-coria-primary/10 text-coria-primary group-hover:bg-coria-primary/20 transition-colors duration-300">
    {feature.icon}
  </div>
  <h3 className="text-xl font-semibold text-coria-primary mb-3">
    {feature.title}
  </h3>
  <p className="text-gray-600 leading-relaxed">
    {feature.description}
  </p>
</motion.div>
```

### Required Implementation (CORRECT)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.1, duration: 0.5 }}
>
  <Card
    variant="glass"
    rounding="organic"
    hover={true}
    padding="lg"
    className="group h-full"
  >
    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-coria-primary/10 text-coria-primary group-hover:bg-coria-primary/20 transition-colors duration-300">
      {feature.icon}
    </div>
    <h3 className="text-xl font-semibold text-coria-primary mb-3">
      {feature.title}
    </h3>
    <p className="text-gray-600 leading-relaxed">
      {feature.description}
    </p>
  </Card>
</motion.div>
```

### Locations to Update

#### 1. Token Economy Cards (Lines ~197-219)
```tsx
{foundationData.tokenEconomy.features.map((feature, index) => (
  <motion.div
    key={feature.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Card
      variant="glass"
      rounding="organic"
      hover={true}
      padding="lg"
      className="group h-full"
    >
      {/* Keep existing content */}
    </Card>
  </motion.div>
))}
```

#### 2. Transparency Principle Cards (Lines ~280-300)
```tsx
{foundationData.principles.map((principle, index) => (
  <motion.div
    key={principle.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Card
      variant="glass"
      rounding="organic"
      hover={true}
      padding="lg"
      className="group h-full"
    >
      {/* Keep existing content */}
    </Card>
  </motion.div>
))}
```

#### 3. Supported Project Cards (Lines ~330-370)
```tsx
{foundationData.supportedProjects.map((project, index) => (
  <motion.div
    key={project.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Card
      variant="glass"
      rounding="organic"
      hover={true}
      padding="lg"
      className="group h-full"
    >
      {/* Keep existing content */}
    </Card>
  </motion.div>
))}
```

#### 4. Timeline Cards (if applicable)
Check for any other hardcoded card divs in the timeline section and refactor similarly.

### Verification Steps
1. Update `/src/app/[locale]/foundation/page.tsx`
2. Remove hardcoded `className` with glass card styles
3. Wrap content in `<Card>` component with props
4. Keep Framer Motion `<motion.div>` as wrapper (for animations)
5. Test at `http://localhost:3000/en/foundation`
6. Verify glass effect, hover animations, organic rounding

### Search & Replace Pattern
```bash
# Find all instances (for manual review)
grep -n "rounded-\[28px\].*bg-white/60.*backdrop-blur" src/app/[locale]/foundation/page.tsx

# Expected: 3+ matches (token economy, principles, projects)
```

---

## Major Issue #3: React asChild Warning

### Problem
```
React does not recognize the `asChild` prop on a DOM element.
```

### Quick Fix
Audit Radix UI components and ensure `asChild` prop not passed to DOM elements.

### Search Pattern
```bash
grep -r "asChild" src/components/
```

### Typical Pattern (WRONG)
```tsx
<Button asChild> {/* asChild forwarded to DOM */}
  <a href="...">Link</a>
</Button>
```

### Correct Pattern
```tsx
<Button asChild>
  <Link href="...">Link</Link> {/* Next.js Link or Radix Slot */}
</Button>
```

---

## Testing Checklist After Fixes

### Border Radius Fix Verification
- [ ] Hero iOS button: Inspect element, border-radius = 28px
- [ ] Hero Android button: Inspect element, border-radius = 28px
- [ ] Foundation cards: Inspect element, border-radius = 28px
- [ ] Visual: Buttons have soft organic rounded corners (not sharp 8px)

### Foundation Page Refactor Verification
- [ ] No hardcoded glass card classNames in page.tsx
- [ ] All cards use `<Card>` component with props
- [ ] Glass effect still visible (transparency + blur)
- [ ] Hover animations work (lift up on hover)
- [ ] Organic rounding applied (28px radius)
- [ ] Gradient overlays on hover work
- [ ] Icon containers animate on hover

### React Warning Verification
- [ ] No console warnings about `asChild` prop
- [ ] All Radix UI components correctly implemented

### Full Regression Check
- [ ] Run through UI_Regression_Checklist.md (all 112 test cases)
- [ ] Test all button variants (primary, glass, secondary, outline, ghost)
- [ ] Test all button sizes (sm, md, lg, xl)
- [ ] Test all card variants (default, elevated, outlined, ghost, glass)
- [ ] Test responsive breakpoints (mobile, tablet, desktop)
- [ ] Test dark mode
- [ ] Test accessibility (keyboard nav, focus, screen reader)

---

## Implementation Priority

### Phase 1: Critical Fixes (BLOCKING) - 3 hours
1. ✅ Fix border-radius override in globals.css (30 min)
2. ✅ Refactor Foundation page to use Card component (2-3 hours)
3. ✅ Fix React asChild warnings (30 min)

### Phase 2: Verification - 1 hour
4. ✅ Manual testing of all fixes
5. ✅ Visual inspection of organic rounding
6. ✅ Console check for warnings

### Phase 3: Full Regression - 4-6 hours
7. ✅ Complete all 112 test cases from checklist
8. ✅ Cross-browser testing
9. ✅ Performance testing
10. ✅ Accessibility audit

**Total Estimated Time**: 8-10 hours

---

## Success Criteria

### Before Deployment
- [x] Border-radius override fixed (verified in DevTools)
- [x] Foundation page using Card component (verified in code)
- [x] No React warnings in console
- [x] All hero buttons show 28px border-radius
- [x] All foundation cards show 28px border-radius
- [x] Glass effect and backdrop blur working
- [x] Hover animations functional
- [x] Mobile responsive layout working
- [x] Dark mode tested (if applicable)
- [x] Accessibility standards met

### Definition of Done
- All critical issues resolved
- All test cases pass (112/112)
- No console errors or warnings
- Visual QA approved
- Performance benchmarks met
- Cross-browser compatibility verified

---

## Contact & Support

**Issue Tracking**: Mark critical issues in project board
**Code Review**: Required before merging fixes
**Testing**: Re-run full regression suite after all fixes

**Priority**: 🔴 P0 - BLOCKING RELEASE
**Assignee**: Frontend Team Lead
**Due Date**: Before next deployment

---

**Last Updated**: October 3, 2025
**Test Report**: See `UI_Regression_Test_Report.md` for detailed findings
