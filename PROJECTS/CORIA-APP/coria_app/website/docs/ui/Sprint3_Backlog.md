# Sprint 3 Backlog - Component Unification & Test Stabilization

**Sprint Period**: October 4-6, 2025 (3 days)
**Sprint Goal**: Complete component refactoring for blog/features/pricing + stabilize test infrastructure
**Total Story Points**: 32 SP (based on Fibonacci scale)
**Estimated Hours**: 15-20 hours

---

## 📊 Sprint Overview

### Objectives
1. ✅ Complete component unification across all remaining pages
2. ✅ Fix test infrastructure issues (NextIntl mock)
3. ✅ Execute comprehensive UI regression testing
4. ✅ Achieve 100% component reusability target

### Success Criteria
- [ ] All blog/features/pricing pages using unified Card/Button components
- [ ] Test suite passing at >90% (up from current 75.3%)
- [ ] UI regression checklist complete (112/112 test cases)
- [ ] Zero hardcoded card/button instances remaining
- [ ] Production build successful with no warnings

---

## 🎯 Epic 1: Complete Component Refactoring

**Epic Goal**: Eliminate all remaining hardcoded card/button instances
**Total Story Points**: 13 SP
**Estimated Hours**: 7-9 hours

### JIRA-301: Blog Page Card Refactoring
**Story Points**: 5 SP
**Priority**: HIGH
**Assignee**: Frontend Developer
**Estimated Time**: 2-3 hours

**Description**:
Refactor all blog post cards to use the unified Card component instead of hardcoded styling.

**Acceptance Criteria**:
- [ ] All blog post cards use `<Card variant="elevated" rounded="lg" hover={true}>`
- [ ] Blog category cards use unified styling
- [ ] Featured post cards maintain glass effect with Card component
- [ ] Lint passes with zero errors on modified files
- [ ] Build successful
- [ ] Visual parity maintained (before/after screenshots match)

**Technical Details**:
```tsx
// Files to modify:
- src/components/blog/blog-card.tsx (main blog post card)
- src/components/blog/blog-categories.tsx (category filter cards)
- src/app/[locale]/blog/page.tsx (featured posts section)

// Expected pattern:
// BEFORE:
<div className="rounded-xl bg-white border shadow-md hover:shadow-lg p-6">
  {content}
</div>

// AFTER:
<Card variant="elevated" rounded="lg" hover={true} padding="md">
  {content}
</Card>
```

**Testing Requirements**:
- Manual: Verify hover effects, responsive layout (mobile/tablet/desktop)
- Automated: Update blog-card.test.tsx with new component structure
- Regression: Check blog list, single post, category filtering

**Dependencies**: None
**Blockers**: None
**Related Issues**: Sprint 2 completion (JIRA-201, JIRA-204)

---

### JIRA-302: Features Showcase Refactoring
**Story Points**: 5 SP
**Priority**: HIGH
**Assignee**: Frontend Developer
**Estimated Time**: 3-4 hours

**Description**:
Refactor feature showcase cards across features page and component sections.

**Acceptance Criteria**:
- [ ] Feature cards use `<Card variant="default" rounded="organic" padding="lg">`
- [ ] Icon containers maintain design system consistency
- [ ] Hover effects preserved with Card hover prop
- [ ] All 8+ card instances refactored
- [ ] Responsive grid layout maintained
- [ ] Zero visual regression

**Technical Details**:
```tsx
// Files to modify:
- src/components/sections/features-showcase.tsx (8 feature cards)
- src/components/features/feature-overview.tsx (overview cards)
- src/app/[locale]/features/page.tsx (main features page)

// Expected instances:
// - AI Scanner feature card
// - Product Database feature card
// - Favorites feature card
// - Nutrition Analysis card
// - Community features card
// - Premium features card
// - Data sources attribution card
// - Methodology explanation card

// Refactoring pattern:
<motion.div whileHover={{y: -8}} asChild>
  <Card variant="default" rounded="organic" hover={true} padding="lg">
    {featureContent}
  </Card>
</motion.div>
```

**Testing Requirements**:
- Manual: Test all hover animations, check responsive breakpoints
- Automated: Update features-showcase.test.tsx
- Performance: Verify no animation jank with Framer Motion + Card

**Dependencies**: None
**Blockers**: None
**Code Reduction Estimate**: ~120 lines

---

### JIRA-303: Pricing Page Refactoring
**Story Points**: 3 SP
**Priority**: MEDIUM
**Assignee**: Frontend Developer
**Estimated Time**: 2 hours

**Description**:
Refactor pricing tier cards to use unified Card component.

**Acceptance Criteria**:
- [ ] Free tier card: `<Card variant="default" rounded="lg" padding="lg">`
- [ ] Premium tier card: `<Card variant="elevated" rounded="lg" padding="lg" hover={true}>`
- [ ] Enterprise tier card: Same as Premium
- [ ] Pricing feature lists maintain structure
- [ ] CTA buttons use unified Button component (already done in Sprint 2)
- [ ] Visual hierarchy preserved (Premium should stand out)

**Technical Details**:
```tsx
// File to modify:
- src/app/[locale]/pricing/page.tsx

// Instances:
// - Free Tier card (left column)
// - Premium Tier card (center column, highlighted)
// - Enterprise Tier card (right column)

// Premium tier pattern (highlighted):
<Card
  variant="elevated"
  rounded="lg"
  padding="lg"
  hover={true}
  className="border-2 border-coria-primary shadow-2xl"
>
  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
    <span className="bg-coria-primary text-white px-4 py-1 rounded-full text-sm">
      Most Popular
    </span>
  </div>
  {tierContent}
</Card>
```

**Testing Requirements**:
- Manual: Verify pricing comparison, mobile stacking order
- Visual: Ensure Premium tier prominence
- Functional: Check all CTA button links

**Dependencies**: None
**Blockers**: None
**Code Reduction Estimate**: ~45 lines

---

## 🧪 Epic 2: Test Infrastructure Stabilization

**Epic Goal**: Achieve >90% test pass rate and stable CI/CD pipeline
**Total Story Points**: 8 SP
**Estimated Hours**: 3-4 hours

### JIRA-304: Fix NextIntlClientProvider Mock Configuration
**Story Points**: 3 SP
**Priority**: 🔴 CRITICAL
**Assignee**: QA Engineer / Frontend Developer
**Estimated Time**: 1-2 hours

**Description**:
Fix the NextIntlClientProvider mock in test utilities to resolve 27 failing component tests.

**Root Cause Analysis**:
```
Error: [vitest] No "NextIntlClientProvider" export is defined on the "next-intl" mock.

Current mock (src/test/utils.tsx):
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  // Missing: NextIntlClientProvider export
}))
```

**Acceptance Criteria**:
- [ ] NextIntlClientProvider properly exported in mock
- [ ] All component tests pass (button.test.tsx, card.test.tsx, hero-section.test.tsx)
- [ ] Test pass rate increases from 75.3% to >90%
- [ ] No console warnings during test execution

**Implementation**:
```typescript
// src/test/utils.tsx

import { ReactNode } from 'react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  // Add other missing exports as needed
}));
```

**Testing Requirements**:
```bash
# Verify fix:
npm run test -- button.test.tsx  # Should pass all 12 tests
npm run test -- card.test.tsx    # Should pass all 15 tests
npm run test -- hero-section.test.tsx  # Should pass all 8 tests

# Full suite:
npm run test  # Target: >290/324 passing (>90%)
```

**Dependencies**: None
**Blockers**: None
**Impact**: Fixes 27+ failing tests across 8 test files

---

### JIRA-305: Update Component Tests for New Variants
**Story Points**: 5 SP
**Priority**: HIGH
**Assignee**: QA Engineer
**Estimated Time**: 2-3 hours

**Description**:
Add comprehensive test coverage for new Button and Card component variants introduced in Sprint 2.

**Acceptance Criteria**:
- [ ] Button tests cover all 5 variants (primary, secondary, outline, ghost, glass)
- [ ] Button tests cover all 4 sizes (sm, md, lg, xl)
- [ ] Button tests cover both rounding options (full, organic)
- [ ] Card tests cover all 6 variants (default, elevated, outlined, outline, ghost, glass)
- [ ] Card tests cover all 6 rounding options
- [ ] Card tests cover hover prop (true/false)
- [ ] Test coverage >80% maintained
- [ ] All tests pass with proper assertions

**Test Cases to Add**:
```typescript
// button.test.tsx additions:
describe('Glass Variant', () => {
  it('renders with glass effect styling', () => {
    render(<Button variant="glass">Glass Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white/70');
    expect(screen.getByRole('button')).toHaveClass('backdrop-blur-md');
  });
});

describe('XL Size', () => {
  it('renders with correct dimensions', () => {
    render(<Button size="xl">XL Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-14');
    expect(screen.getByRole('button')).toHaveClass('px-8');
  });
});

// card.test.tsx additions:
describe('Hover Prop', () => {
  it('applies hover transform when hover=true', () => {
    render(<Card hover={true} data-testid="card">Hover Card</Card>);
    expect(screen.getByTestId('card')).toHaveClass('hover:-translate-y-2');
  });
});
```

**Testing Requirements**:
- Run tests locally before commit
- Verify coverage report: `npm run test -- --coverage`
- Check for console warnings/errors

**Dependencies**: JIRA-304 (mock fix must be completed first)
**Blockers**: NextIntl mock issue
**Files to Modify**:
- src/test/components/ui/button.test.tsx (+15 test cases)
- src/test/components/ui/card.test.tsx (+18 test cases)

---

## 🎨 Epic 3: Comprehensive UI Regression Testing

**Epic Goal**: Execute all 84 remaining manual UI regression test cases
**Total Story Points**: 11 SP
**Estimated Hours**: 5-6 hours

### JIRA-306: Dark Mode Regression Testing
**Story Points**: 3 SP
**Priority**: HIGH
**Assignee**: QA Engineer
**Estimated Time**: 2 hours

**Description**:
Execute comprehensive dark mode testing for all Button and Card variants.

**Scope**:
- Test all 40 button combinations in dark mode
- Test all 72 card combinations in dark mode
- Verify contrast ratios meet WCAG AA (4.5:1 for text)
- Test theme switching transitions

**Acceptance Criteria**:
- [ ] All button variants readable in dark mode
- [ ] All card variants maintain proper contrast
- [ ] Glass effect visible with dark backgrounds
- [ ] Hover states clearly visible
- [ ] Focus indicators high contrast
- [ ] Theme switching smooth (no flash)

**Testing Procedure**:
```bash
# 1. Enable dark mode in browser
# Chrome DevTools > Rendering > Emulate CSS media feature prefers-color-scheme: dark

# 2. Navigate through pages:
- Homepage (hero section)
- /foundation (all card sections)
- /blog (blog cards)
- /features (feature cards)
- /pricing (pricing tiers)

# 3. Check each variant:
- Button: primary, glass, secondary, outline, ghost
- Card: default, elevated, glass, outlined, ghost

# 4. Verify interactivity:
- Hover effects visible
- Focus indicators clear
- Active states distinguishable
```

**Issues to Track**:
- Screenshot any contrast violations
- Document theme switching glitches
- Note any invisible hover states

**Deliverable**: Updated UI_Regression_Checklist.md with dark mode section marked ✓/✗

---

### JIRA-307: Responsive Breakpoint Testing
**Story Points**: 3 SP
**Priority**: HIGH
**Assignee**: QA Engineer
**Estimated Time**: 2 hours

**Description**:
Test all pages at mobile (320px), tablet (768px), and desktop (1440px) breakpoints.

**Acceptance Criteria**:
- [ ] All buttons touch-target compliant (44x44px minimum)
- [ ] Card grid layouts adapt properly
- [ ] No horizontal scroll at any breakpoint
- [ ] Text remains readable
- [ ] Images scale appropriately
- [ ] Navigation accessible

**Testing Matrix**:
| Page | 320px | 768px | 1440px | Notes |
|------|-------|-------|--------|-------|
| Home | ☐ | ☐ | ☐ | Hero buttons, feature cards |
| Foundation | ☐ | ☐ | ☐ | 4 card sections |
| Blog | ☐ | ☐ | ☐ | Post grid, filters |
| Features | ☐ | ☐ | ☐ | Feature showcase |
| Pricing | ☐ | ☐ | ☐ | Pricing tiers stack |

**Testing Tools**:
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Physical device testing (iPhone, iPad if available)

**Common Issues to Check**:
- Button text wrapping
- Card content overflow
- Grid column counts
- Padding/spacing adjustments

**Deliverable**: Updated UI_Regression_Checklist.md with responsive section marked ✓/✗

---

### JIRA-308: Cross-Browser Validation
**Story Points**: 5 SP
**Priority**: MEDIUM
**Assignee**: QA Engineer
**Estimated Time**: 3 hours

**Description**:
Test all refactored components across Chrome, Firefox, and Safari browsers.

**Browser Coverage**:
- Chrome (latest stable)
- Firefox (latest stable)
- Safari (latest stable, macOS only)
- Edge (optional, Chromium-based)

**Acceptance Criteria**:
- [ ] All components render identically across browsers
- [ ] CSS grid/flexbox layouts consistent
- [ ] Border-radius organic values (28px, 32px) render correctly
- [ ] Backdrop-blur filter works (Safari may differ)
- [ ] Framer Motion animations smooth
- [ ] No console errors in any browser

**Testing Focus Areas**:
1. **CSS Compatibility**:
   - `backdrop-filter: blur()` (Safari requires -webkit prefix)
   - `rounded-[28px]` arbitrary values
   - CSS variables (--coria-primary)
   - Gradient backgrounds

2. **JavaScript/React**:
   - Next.js hydration
   - Framer Motion animations
   - Event handlers (onClick, onHover)

3. **Performance**:
   - Page load times
   - Animation FPS
   - Smooth scrolling

**Known Browser Differences**:
```css
/* Safari backdrop-filter may need fallback */
.glass-card {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari */
  background-color: rgba(255, 255, 255, 0.7); /* Fallback */
}
```

**Testing Procedure**:
1. Open same page in all 3 browsers side-by-side
2. Compare visual rendering
3. Test all interactions (hover, click, focus)
4. Check browser console for errors
5. Document any differences

**Deliverable**: Cross-browser compatibility matrix in UI_Regression_Checklist.md

---

## 📋 Sprint Backlog Summary

### By Priority
**🔴 Critical (Must Complete)**:
- JIRA-304: Fix NextIntl mock (blocks testing)
- JIRA-301: Blog page refactoring (high visibility)

**🟡 High Priority (Should Complete)**:
- JIRA-302: Features page refactoring
- JIRA-305: Update component tests
- JIRA-306: Dark mode testing
- JIRA-307: Responsive testing

**🟢 Medium Priority (Nice to Have)**:
- JIRA-303: Pricing page refactoring
- JIRA-308: Cross-browser validation

### By Epic
| Epic | Story Points | Tasks | Hours |
|------|-------------|-------|-------|
| Epic 1: Component Refactoring | 13 SP | 3 | 7-9h |
| Epic 2: Test Stabilization | 8 SP | 2 | 3-4h |
| Epic 3: UI Regression | 11 SP | 3 | 5-6h |
| **TOTAL** | **32 SP** | **8** | **15-20h** |

### By Assignee
**Frontend Developer** (12-16 hours):
- JIRA-301, JIRA-302, JIRA-303, JIRA-304

**QA Engineer** (6-8 hours):
- JIRA-305, JIRA-306, JIRA-307, JIRA-308

### Dependencies Graph
```
JIRA-304 (Mock Fix)
  ├─→ JIRA-305 (Test Updates) - BLOCKS
  └─→ JIRA-306/307/308 (Regression) - PARTIAL BLOCK

JIRA-301 (Blog Refactor)
  └─→ JIRA-306/307 (Testing) - SEQUENTIAL

JIRA-302 (Features Refactor)
  └─→ JIRA-306/307 (Testing) - SEQUENTIAL
```

---

## 🎯 Sprint Goals & Metrics

### Primary Goals
1. **Component Reusability**: 90% → 100% (eliminate all hardcoded instances)
2. **Test Pass Rate**: 75.3% → >90% (fix mock + update tests)
3. **UI Regression**: 28/112 → 112/112 test cases (complete manual testing)
4. **Code Reduction**: ~254 lines → ~420 lines total eliminated

### Success Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Hardcoded cards remaining | ~17 | 0 | `rg "rounded-\[.*\] bg-white.*backdrop-blur" src` |
| Test pass rate | 244/324 (75.3%) | >290/324 (>90%) | `npm run test` |
| Regression tests complete | 28/112 (25%) | 112/112 (100%) | Checklist status |
| Build warnings | 0 | 0 | `npm run build` |
| Lint errors (modified files) | 0 | 0 | `npm run lint` |
| Bundle size | 196 kB | <200 kB | Build output |

### Quality Gates
**Definition of Done** (for each task):
- [ ] Code review completed
- [ ] Lint passes with zero errors
- [ ] All tests pass (>90% suite-wide)
- [ ] Build successful
- [ ] Manual QA verification (screenshots)
- [ ] Documentation updated
- [ ] PR merged to main branch

**Sprint Done Criteria**:
- [ ] All 8 tasks completed (or explicitly deferred)
- [ ] Test pass rate >90%
- [ ] Zero hardcoded card/button instances remaining
- [ ] UI regression checklist 100% complete
- [ ] Production deployment ready

---

## 🚀 Sprint Execution Plan

### Day 1 (Friday, Oct 4) - 6-8 hours
**Morning (3-4h)**:
1. JIRA-304: Fix NextIntl mock (1-2h) - CRITICAL PATH
2. JIRA-301: Blog page refactoring (2-3h)

**Afternoon (3-4h)**:
3. JIRA-305: Update component tests (2-3h)
4. JIRA-306: Dark mode testing (2h)

**End of Day Checkpoint**:
- [ ] Mock fixed, tests passing >90%
- [ ] Blog page fully refactored
- [ ] Dark mode testing complete

### Day 2 (Saturday, Oct 5) - 6-8 hours
**Morning (3-4h)**:
5. JIRA-302: Features page refactoring (3-4h)

**Afternoon (3-4h)**:
6. JIRA-307: Responsive testing (2h)
7. JIRA-303: Pricing page refactoring (2h)

**End of Day Checkpoint**:
- [ ] All pages refactored (blog, features, pricing)
- [ ] Responsive testing complete
- [ ] Zero hardcoded instances remaining

### Day 3 (Sunday, Oct 6) - 3-4 hours
**Morning/Afternoon (3-4h)**:
8. JIRA-308: Cross-browser validation (3h)
9. Final build validation and documentation update (1h)

**Sprint Retrospective**:
- [ ] All tasks complete
- [ ] Metrics targets achieved
- [ ] Production deployment approved
- [ ] Sprint 4 planning initiated

---

## 📊 Risk Assessment

### High Risk
**Test Infrastructure Failure** (JIRA-304)
- **Risk**: Mock fix doesn't resolve all test failures
- **Impact**: Blocks Epic 2 completion
- **Mitigation**: Allocate extra time for debugging, consider alternative mock strategies
- **Contingency**: Defer some component test updates to Sprint 4

### Medium Risk
**Scope Creep in Refactoring**
- **Risk**: More hardcoded instances discovered than estimated
- **Impact**: Epic 1 takes longer than 7-9h
- **Mitigation**: Time-box each refactoring task, defer edge cases
- **Contingency**: Prioritize high-visibility pages (blog, features), defer pricing to Sprint 4

### Low Risk
**Cross-Browser Compatibility Issues**
- **Risk**: Safari/Firefox rendering differences require CSS fixes
- **Impact**: JIRA-308 takes longer
- **Mitigation**: Use progressive enhancement, test early
- **Contingency**: Document issues for Sprint 4, use feature flags

---

## 📁 Deliverables

### Code Artifacts
1. Refactored components:
   - `src/components/blog/blog-card.tsx`
   - `src/components/sections/features-showcase.tsx`
   - `src/app/[locale]/pricing/page.tsx`
2. Updated tests:
   - `src/test/components/ui/button.test.tsx`
   - `src/test/components/ui/card.test.tsx`
   - `src/test/utils.tsx` (mock fix)

### Documentation
1. **Sprint3_Backlog.md** (this file) - Sprint planning and task details
2. **UI_Remediation_Plan.md** - Updated Sprint 3 section
3. **NEXT_STEPS_GUIDE.md** - Updated with sprint summary table
4. **UI_Regression_Checklist.md** - Marked with ✓/✗ for all 112 test cases
5. **Component_Unification_Summary.md** - Final completion report

### Reports
1. Sprint completion report with final metrics
2. Cross-browser compatibility matrix
3. Before/after code reduction summary
4. Test coverage report

---

## 🔗 Related Documentation

- [Component_Unification_Summary.md](./Component_Unification_Summary.md) - Sprint 1-2 completion report
- [UI_Regression_Checklist.md](./UI_Regression_Checklist.md) - Complete testing guide
- [UI_Remediation_Plan.md](./UI_Remediation_Plan.md) - Overall remediation strategy
- [NEXT_STEPS_GUIDE.md](./NEXT_STEPS_GUIDE.md) - Quick reference guide

---

**Sprint 3 Status**: 🟡 PLANNED (Ready to Execute)
**Last Updated**: October 3, 2025
**Sprint Master**: Development Team Lead
**Next Review**: End of Day 1 (October 4, 18:00)
