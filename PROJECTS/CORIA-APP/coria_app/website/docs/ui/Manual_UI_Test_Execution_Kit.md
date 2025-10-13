# Manual UI Test Execution Kit

**Purpose**: Comprehensive guide for executing 71 manual UI regression tests across browsers, themes, and breakpoints
**Target**: Sprint 3 component unification validation
**Estimated Time**: 4-6 hours total execution
**Last Updated**: October 6, 2025

---

## 📋 Table of Contents

1. [Pre-Test Setup](#pre-test-setup)
2. [Testing Environment Configuration](#testing-environment-configuration)
3. [Test Execution Workflows](#test-execution-workflows)
4. [Result Recording Templates](#result-recording-templates)
5. [Issue Tracking & Reporting](#issue-tracking--reporting)
6. [Evidence Collection Guidelines](#evidence-collection-guidelines)
7. [Quick Reference Checklists](#quick-reference-checklists)

---

## 🚀 Pre-Test Setup

### 1. Development Environment

**Start Development Server**:
```bash
cd /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/website
npm run dev
```

**Verify Server Running**:
- Open http://localhost:3000 in browser
- Confirm homepage loads without errors
- Check browser console for warnings (translation warnings OK)

**Build Validation** (Optional):
```bash
npm run build
# Expected: Build succeeds (translation warnings non-critical)
```

### 2. Browser Setup

**Required Browsers**:
- ✅ Chrome (latest stable, version 120+)
- ✅ Firefox (latest stable, version 120+)
- ✅ Safari (latest stable, version 17+, macOS only)

**Browser Extensions to Install**:
1. **axe DevTools** (accessibility testing)
   - Chrome: https://chrome.google.com/webstore (search "axe DevTools")
   - Firefox: https://addons.mozilla.org/firefox/ (search "axe DevTools")
   - Safari: Use built-in Accessibility Inspector

2. **React Developer Tools** (optional, for debugging)
   - Helps inspect component state if issues arise

### 3. Testing Tools Configuration

**Chrome DevTools Setup**:
```
1. Open DevTools (Cmd+Option+I on macOS, F12 on Windows)
2. Navigate to "Rendering" tab (⋮ menu → More tools → Rendering)
3. Locate "Emulate CSS media feature prefers-color-scheme"
4. Open Device Toolbar (Cmd+Shift+M)
5. Add custom devices for testing:
   - Mobile: 320x568 (iPhone SE)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1440x900 (MacBook)
```

**Firefox Responsive Design Mode**:
```
1. Open Responsive Design Mode (Cmd+Option+M)
2. Add custom breakpoints: 320px, 768px, 1440px
3. Enable touch simulation
4. Access theme emulation: Settings → Theme
```

**Safari Responsive Design Mode**:
```
1. Enable Developer menu: Safari → Preferences → Advanced → Show Develop menu
2. Develop → Enter Responsive Design Mode
3. Select device presets or custom dimensions
```

### 4. Documentation Setup

**Create Testing Session Folder**:
```bash
mkdir -p docs/ui/test-results/sprint3-manual-testing
mkdir -p docs/ui/test-results/sprint3-manual-testing/screenshots
mkdir -p docs/ui/test-results/sprint3-manual-testing/issues
```

**Prepare Test Recording Sheet**:
- Copy template from [Result Recording Templates](#result-recording-templates)
- Open in text editor or Markdown viewer
- Prepare for real-time note-taking

---

## 🔧 Testing Environment Configuration

### Theme Testing Setup

**Enable Dark Mode (Chrome)**:
```
DevTools → Rendering panel → Emulate CSS media feature prefers-color-scheme: dark
```

**Enable Dark Mode (Firefox)**:
```
Responsive Design Mode → Settings (⚙️) → Device Pixel Ratio → Select theme
```

**Enable Dark Mode (Safari)**:
```
System Preferences → General → Appearance → Dark
(Or use Develop → Experimental Features → Dark Mode CSS Override)
```

**Toggle Between Themes**:
- Test each component in BOTH light and dark modes
- Verify smooth theme transition (no flash)
- Check contrast ratios meet WCAG AA (4.5:1)

### Responsive Breakpoints Configuration

**Primary Test Breakpoints**:
1. **Mobile**: 320px width (smallest supported)
2. **Tablet**: 768px width (standard breakpoint)
3. **Desktop**: 1440px width (target resolution)

**Secondary Breakpoints** (Optional):
- 375px (iPhone standard)
- 1024px (desktop small)
- 1920px (desktop large)

**Viewport Setup Commands**:

**Chrome**:
```
Device Toolbar (Cmd+Shift+M) → Custom → Set width
Mobile: 320 x 568
Tablet: 768 x 1024
Desktop: 1440 x 900
```

**Firefox**:
```
Responsive Design Mode (Cmd+Option+M) → Enter custom dimensions
320 x 568 | 768 x 1024 | 1440 x 900
```

**Safari**:
```
Develop → Enter Responsive Design Mode → Select device or custom size
```

### Accessibility Testing Setup

**axe DevTools Configuration**:
```
1. Open axe DevTools panel in browser DevTools
2. Select "Scan All of My Page"
3. Review violations by severity (Critical, Serious, Moderate, Minor)
4. Focus on WCAG AA compliance (Level A + AA)
```

**Manual Keyboard Navigation**:
```
1. Close mouse/trackpad (optional, for focus)
2. Use Tab key to navigate through interactive elements
3. Use Enter/Space to activate buttons
4. Use Arrow keys for selection controls
5. Verify focus indicators visible at all times
```

---

## 🧪 Test Execution Workflows

### Workflow 1: Single Component Test (Example: Button)

**Step 1: Visual Inspection (Light Mode)**
1. Navigate to page containing button (e.g., homepage hero section)
2. Identify button variant (primary, glass, secondary, outline, ghost)
3. Verify visual properties:
   - ✓ Background color correct (gradient for primary, glass effect for glass)
   - ✓ Border visible (if applicable)
   - ✓ Text readable
   - ✓ Icon rendering correctly
   - ✓ Size proportional (sm, md, lg, xl)
   - ✓ Rounding correct (full or organic 28px)

**Step 2: Interactive States (Light Mode)**
1. **Hover**: Move mouse over button
   - ✓ Shadow expands (lg → xl)
   - ✓ Slight upward transform (-1px or -8px)
   - ✓ Transition smooth (300ms)
2. **Focus**: Tab to button
   - ✓ Focus ring visible (2px coria-primary)
   - ✓ Ring offset 2px from button edge
3. **Active**: Click and hold button
   - ✓ Brightness reduces (brightness-95)
   - ✓ Visual feedback immediate
4. **Disabled**: Find disabled button (if exists)
   - ✓ Opacity 60%
   - ✓ Cursor shows "not-allowed"
   - ✓ No hover/click effects

**Step 3: Dark Mode Testing**
1. Enable dark mode (see configuration above)
2. Repeat Step 1 visual inspection
   - ✓ Gradient adapts to dark theme
   - ✓ Glass effect maintains transparency
   - ✓ Text high contrast (4.5:1 minimum)
3. Repeat Step 2 interactive states
   - ✓ Focus ring clearly visible in dark mode

**Step 4: Responsive Testing**
1. Set viewport to **320px** (mobile)
   - ✓ Button size adequate (minimum 44x44px touch target)
   - ✓ Text readable (no truncation)
   - ✓ No horizontal overflow
2. Set viewport to **768px** (tablet)
   - ✓ Button proportional
   - ✓ Layout adjusts correctly
3. Set viewport to **1440px** (desktop)
   - ✓ Button appropriately sized (not too large)
   - ✓ Spacing correct

**Step 5: Cross-Browser Validation**
1. Test in **Chrome**
   - Record results: ✅ Pass | ⚠️ Minor issue | ❌ Fail
2. Test in **Firefox**
   - Compare with Chrome visually
   - Note any differences
3. Test in **Safari**
   - Compare with Chrome/Firefox
   - Note Safari-specific behaviors

**Step 6: Record Results**
```markdown
### Button Component - Primary Variant (Hero Section)

**Light Mode**:
- Chrome: ✅ Pass
- Firefox: ✅ Pass
- Safari: ✅ Pass

**Dark Mode**:
- Chrome: ✅ Pass
- Firefox: ✅ Pass
- Safari: ⚠️ Minor issue - gradient slightly darker (acceptable)

**Responsive**:
- 320px: ✅ Pass
- 768px: ✅ Pass
- 1440px: ✅ Pass

**Issues**: None critical
```

---

### Workflow 2: Page-Wide Test (Example: Foundation Page)

**Pages to Test** (Priority Order):
1. Homepage (`/`)
2. Foundation Page (`/foundation`)
3. Features Page (`/features`)
4. Pricing Page (`/pricing`)
5. Blog Page (`/blog`)

**Test Sequence Per Page**:

**Phase 1: Layout Validation (5 minutes)**
```
1. Open page in Chrome at 1440px
2. Scroll entire page top to bottom
3. Check for:
   ✓ No layout breaks
   ✓ All sections visible
   ✓ Images load correctly
   ✓ No console errors (F12)
```

**Phase 2: Component Validation (10 minutes)**
```
For each Card component on page:
1. Visual: Glass effect, organic rounding, proper padding
2. Hover: Transform (-8px), shadow expansion
3. Content: Text readable, icons render
4. Animation: Smooth 60fps (check for jank)

For each Button component on page:
1. Visual: Correct variant styling
2. Interactive: Hover/focus/active states
3. Accessibility: Focus indicators visible
```

**Phase 3: Theme Switching (5 minutes)**
```
1. Enable dark mode
2. Scroll entire page
3. Check:
   ✓ All components adapt to dark theme
   ✓ Text contrast maintained
   ✓ Glass effects still visible
   ✓ No white flash during switch
4. Toggle back to light mode
   ✓ Smooth transition
```

**Phase 4: Responsive Validation (10 minutes)**
```
Mobile (320px):
1. Scroll entire page
2. Check:
   ✓ Cards stack vertically
   ✓ Buttons full-width where appropriate
   ✓ No horizontal scroll
   ✓ Touch targets ≥44x44px
   ✓ Text readable

Tablet (768px):
1. Check:
   ✓ Card grid adapts (2-column)
   ✓ Buttons sized appropriately
   ✓ Spacing balanced

Desktop (1440px):
1. Check:
   ✓ Multi-column layouts (3-4 columns)
   ✓ Max-width constraints respected
   ✓ No excessive whitespace
```

**Phase 5: Cross-Browser (15 minutes)**
```
Repeat Phases 1-4 in Firefox and Safari
Focus on:
- Visual parity with Chrome
- Backdrop-filter support (glass effect)
- Animation smoothness
- JavaScript errors
```

**Total Time Per Page**: ~45 minutes
**Total for 5 Pages**: ~3.75 hours

---

### Workflow 3: Accessibility Testing

**Keyboard Navigation Test**:
```
1. Close mouse/trackpad
2. Tab through entire page
3. Verify:
   ✓ Logical tab order
   ✓ All interactive elements focusable
   ✓ Focus indicators clearly visible
   ✓ No focus traps
   ✓ Enter/Space activates buttons/links
```

**Screen Reader Test** (Optional, if available):
```
macOS VoiceOver:
1. Enable: Cmd+F5
2. Navigate with VO+→ (Ctrl+Option+Right Arrow)
3. Verify:
   ✓ Button labels announced
   ✓ Card content readable
   ✓ Headings announced correctly
   ✓ Images have alt text
```

**axe DevTools Automated Scan**:
```
1. Open axe DevTools panel
2. Click "Scan All of My Page"
3. Review violations:
   - Critical: Must fix immediately
   - Serious: Should fix
   - Moderate: Nice to fix
   - Minor: Optional
4. Document violations with JIRA issues
```

**Color Contrast Validation**:
```
Chrome DevTools:
1. Inspect text element
2. Right-click → Inspect
3. Check "Contrast ratio" in Styles panel
4. Verify ≥4.5:1 for WCAG AA

Manual check:
- Light mode: Dark text on light backgrounds
- Dark mode: Light text on dark backgrounds
- Buttons: Text on button background
- Cards: All text content
```

---

## 📊 Result Recording Templates

### Template 1: Component Test Record

```markdown
## Component: [Button | Card | Navigation]
**Variant**: [Primary | Glass | Secondary | etc.]
**Location**: [Page name, section]
**Test Date**: YYYY-MM-DD
**Tester**: [Your Name]

### Visual Properties (Light Mode)
| Property | Chrome | Firefox | Safari | Notes |
|----------|--------|---------|--------|-------|
| Background | ✅ | ✅ | ✅ | - |
| Border | ✅ | ✅ | ✅ | - |
| Rounding | ✅ | ✅ | ⚠️ | Safari: 27.8px rendered (acceptable) |
| Shadow | ✅ | ✅ | ✅ | - |
| Text | ✅ | ✅ | ✅ | - |
| Icons | ✅ | ✅ | ✅ | - |

### Interactive States
| State | Chrome | Firefox | Safari | Notes |
|-------|--------|---------|--------|-------|
| Hover | ✅ | ✅ | ✅ | - |
| Focus | ✅ | ✅ | ✅ | - |
| Active | ✅ | ✅ | ✅ | - |
| Disabled | ✅ | ✅ | ✅ | - |

### Dark Mode
| Aspect | Chrome | Firefox | Safari | Notes |
|--------|--------|---------|--------|-------|
| Visual Parity | ✅ | ✅ | ⚠️ | Safari: Glass slightly different |
| Contrast | ✅ | ✅ | ✅ | All text ≥4.5:1 |
| Transitions | ✅ | ✅ | ✅ | - |

### Responsive (Chrome as reference)
| Breakpoint | Layout | Touch Targets | Text | Scroll | Notes |
|------------|--------|---------------|------|--------|-------|
| 320px | ✅ | ✅ | ✅ | ✅ | - |
| 768px | ✅ | ✅ | ✅ | ✅ | - |
| 1440px | ✅ | ✅ | ✅ | ✅ | - |

### Overall Assessment
- **Status**: [✅ PASS | ⚠️ PASS WITH MINOR ISSUES | ❌ FAIL]
- **Issues Found**: [Count]
- **JIRA Tickets**: [JIRA-309, JIRA-310, etc.]

### Issues Details
1. **[Issue Title]**
   - Severity: [Critical | Major | Minor]
   - Browsers Affected: [Chrome | Firefox | Safari]
   - Description: [Brief description]
   - JIRA: [JIRA-XXX]
```

---

### Template 2: Page-Wide Test Record

```markdown
## Page: [Homepage | Foundation | Features | Pricing | Blog]
**URL**: /[route]
**Test Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Duration**: [XX minutes]

### Component Inventory
| Component Type | Count | Tested | Pass | Issues |
|----------------|-------|--------|------|--------|
| Buttons | X | X | X | X |
| Cards | X | X | X | X |
| Navigation | 1 | 1 | 1 | 0 |
| Forms | X | X | X | X |
| Images | X | X | X | X |

### Theme Testing
| Theme | Chrome | Firefox | Safari | Issues |
|-------|--------|---------|--------|--------|
| Light Mode | ✅ | ✅ | ✅ | - |
| Dark Mode | ✅ | ✅ | ⚠️ | Safari backdrop-filter quality |
| Theme Switch | ✅ | ✅ | ✅ | - |

### Responsive Testing
| Breakpoint | Chrome | Firefox | Safari | Issues |
|------------|--------|---------|--------|--------|
| 320px | ✅ | ✅ | ✅ | - |
| 768px | ✅ | ✅ | ✅ | - |
| 1440px | ✅ | ✅ | ✅ | - |

### Accessibility
| Check | Result | Notes |
|-------|--------|-------|
| Keyboard Nav | ✅ | Tab order logical |
| Focus Indicators | ✅ | Visible in all themes |
| axe Scan | ⚠️ | 2 minor issues (non-blocking) |
| Contrast Ratio | ✅ | All text ≥4.5:1 |

### Performance
| Metric | Chrome | Firefox | Safari | Target |
|--------|--------|---------|--------|--------|
| FCP | 1.2s | 1.3s | 1.4s | <1.8s ✅ |
| LCP | 1.8s | 1.9s | 2.1s | <2.5s ✅ |
| TTI | 2.5s | 2.7s | 2.9s | <3.8s ✅ |
| Animation FPS | 60 | 60 | 58 | ≥60 ⚠️ |

### Overall Page Assessment
- **Status**: [✅ PASS | ⚠️ PASS WITH ISSUES | ❌ FAIL]
- **Critical Issues**: [Count]
- **Major Issues**: [Count]
- **Minor Issues**: [Count]
- **JIRA Tickets Created**: [JIRA-309, JIRA-310, ...]

### Screenshots
- Light mode: `docs/ui/test-results/sprint3-manual-testing/screenshots/[page]-light.png`
- Dark mode: `docs/ui/test-results/sprint3-manual-testing/screenshots/[page]-dark.png`
- Mobile: `docs/ui/test-results/sprint3-manual-testing/screenshots/[page]-mobile.png`
```

---

### Template 3: Cross-Browser Compatibility Matrix

```markdown
## Cross-Browser Compatibility Summary
**Test Date**: YYYY-MM-DD
**Pages Tested**: 5 (Homepage, Foundation, Features, Pricing, Blog)
**Browsers**: Chrome 120+, Firefox 120+, Safari 17+

### Overall Status
| Page | Chrome | Firefox | Safari | Critical Issues |
|------|--------|---------|--------|-----------------|
| Homepage (/) | ✅ | ✅ | ✅ | 0 |
| Foundation (/foundation) | ✅ | ✅ | ⚠️ | 0 |
| Features (/features) | ✅ | ✅ | ✅ | 0 |
| Pricing (/pricing) | ✅ | ✅ | ✅ | 0 |
| Blog (/blog) | ✅ | ✅ | ✅ | 0 |

**Legend**: ✅ Pass | ⚠️ Minor Issues | ❌ Fail

### Component-Level Compatibility
| Component | Chrome | Firefox | Safari | Notes |
|-----------|--------|---------|--------|-------|
| Button (Primary) | ✅ | ✅ | ✅ | - |
| Button (Glass) | ✅ | ✅ | ⚠️ | Safari: backdrop-filter slight difference |
| Card (Glass) | ✅ | ✅ | ⚠️ | Safari: backdrop-filter slight difference |
| Card (Elevated) | ✅ | ✅ | ✅ | - |
| Navigation | ✅ | ✅ | ✅ | - |

### CSS Feature Compatibility
| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| Backdrop-filter | ✅ | ✅ | ⚠️ | Safari: requires -webkit- (applied) |
| CSS Variables | ✅ | ✅ | ✅ | - |
| Arbitrary Values | ✅ | ✅ | ✅ | rounded-[28px] works |
| Gradients | ✅ | ✅ | ✅ | - |

### JavaScript/React Compatibility
| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| Next.js Hydration | ✅ | ✅ | ✅ | - |
| Framer Motion | ✅ | ✅ | ✅ | - |
| Event Handlers | ✅ | ✅ | ✅ | - |

### Known Browser Differences
1. **Safari Backdrop-Filter Quality**
   - Impact: Minor visual difference in glass effect
   - Severity: Low (acceptable variance)
   - Status: Documented, no fix needed

2. **Firefox Scrollbar Styling**
   - Impact: Different scrollbar appearance
   - Severity: Low (by design)
   - Status: Documented, intentional

### Issues Summary
- **Critical**: 0
- **Major**: 0
- **Minor**: 2 (Safari glass quality, Firefox scrollbar)
- **Total JIRA Tickets**: [Count]
```

---

## 🐛 Issue Tracking & Reporting

### JIRA Issue Template

```markdown
## JIRA Issue Format

**Issue ID**: JIRA-[309+]
**Type**: [Bug | Visual Defect | Accessibility | Performance]
**Severity**: [Critical | Major | Minor]
**Priority**: [P0 | P1 | P2 | P3]

### Title
[Component] [Brief description] on [Browser/Breakpoint/Theme]

**Example**: Button: Glass variant backdrop-filter quality on Safari dark mode

### Description
**Summary**: [1-2 sentence summary of issue]

**Steps to Reproduce**:
1. Open [page] in [browser]
2. Navigate to [section]
3. [Enable dark mode / Set viewport to 320px / etc.]
4. [Interact with component]
5. Observe [issue]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- Browser: [Chrome 120 / Firefox 120 / Safari 17]
- OS: [macOS 14 / Windows 11 / etc.]
- Viewport: [320px / 768px / 1440px]
- Theme: [Light / Dark]
- URL: http://localhost:3000/[route]

**Severity Justification**:
- **Critical (P0)**: Breaks core functionality, blocks user flow
- **Major (P1)**: Significant UX degradation, affects many users
- **Minor (P2)**: Cosmetic issue, minor UX impact
- **Trivial (P3)**: Edge case, low user impact

**Screenshots/Video**:
[Attach evidence]

**Suggested Fix** (Optional):
[If you have a solution idea]

**Related Issues**:
- JIRA-XXX (if applicable)

---

### Labels
- Component: [button | card | navigation | etc.]
- Browser: [chrome | firefox | safari]
- Breakpoint: [mobile | tablet | desktop]
- Theme: [light | dark]
- Sprint: sprint-3
```

---

### Example JIRA Issues

**Example 1: Visual Defect**
```
JIRA-309: Card: Glass effect backdrop-filter quality difference on Safari

**Type**: Visual Defect
**Severity**: Minor
**Priority**: P2

**Description**:
The glass effect on Card components using `variant="glass"` renders with slightly different blur quality in Safari compared to Chrome/Firefox.

**Steps to Reproduce**:
1. Open /foundation in Safari 17
2. Scroll to feature cards section
3. Observe glass effect backdrop-filter
4. Compare with Chrome side-by-side

**Expected**: Identical blur quality across all browsers
**Actual**: Safari blur slightly softer/different quality

**Environment**:
- Browser: Safari 17.1
- OS: macOS 14.0
- Viewport: 1440px
- Theme: Light

**Severity Justification**: Minor cosmetic difference, acceptable variance. Safari's -webkit-backdrop-filter implementation differs slightly from standard spec.

**Screenshots**: See docs/ui/test-results/sprint3-manual-testing/screenshots/safari-glass-comparison.png

**Suggested Fix**: Document as known Safari behavior, no fix required unless user complaints.

**Labels**: card, safari, visual, sprint-3
```

**Example 2: Accessibility**
```
JIRA-310: Button: Focus indicator low contrast in dark mode on Safari

**Type**: Accessibility
**Severity**: Major
**Priority**: P1

**Description**:
Button focus ring (ring-2 ring-coria-primary) has insufficient contrast in dark mode on Safari, falling below WCAG AA 3:1 requirement.

**Steps to Reproduce**:
1. Open / in Safari 17
2. Enable dark mode (System Preferences → Appearance → Dark)
3. Tab to hero CTA button
4. Observe focus ring contrast

**Expected**: Focus ring contrast ≥3:1 with background (WCAG AA)
**Actual**: Contrast ~2.5:1 (fails WCAG AA)

**Environment**:
- Browser: Safari 17.1
- OS: macOS 14.0
- Theme: Dark
- URL: http://localhost:3000/

**Severity Justification**: Major accessibility issue affecting keyboard navigation users. WCAG AA compliance required.

**Screenshots**: See docs/ui/test-results/sprint3-manual-testing/screenshots/safari-focus-contrast-fail.png

**Suggested Fix**: Increase focus ring color brightness in dark mode or add background to ring for better contrast.

**Labels**: button, safari, accessibility, dark-mode, wcag, sprint-3
```

**Example 3: Responsive**
```
JIRA-311: Card: Horizontal scroll on mobile (320px) on Foundation page

**Type**: Bug
**Severity**: Critical
**Priority**: P0

**Description**:
Feature cards on /foundation page cause horizontal scroll at 320px viewport width.

**Steps to Reproduce**:
1. Open /foundation in Chrome
2. Open Device Toolbar (Cmd+Shift+M)
3. Set viewport to 320 x 568
4. Scroll down to feature cards section
5. Observe horizontal scrollbar

**Expected**: No horizontal scroll, cards fit within viewport
**Actual**: Page scrolls horizontally ~20px

**Environment**:
- Browser: Chrome 120
- OS: macOS 14.0
- Viewport: 320px
- Theme: Light

**Severity Justification**: Critical usability issue on mobile devices. Breaks responsive design requirement.

**Screenshots**: See docs/ui/test-results/sprint3-manual-testing/screenshots/mobile-horizontal-scroll.png

**Suggested Fix**: Check card padding at 320px breakpoint, ensure max-width: 100% on card container.

**Labels**: card, mobile, responsive, critical, sprint-3
```

---

## 📸 Evidence Collection Guidelines

### Screenshot Best Practices

**Naming Convention**:
```
[page]-[component]-[browser]-[theme]-[breakpoint]-[issue].png

Examples:
- foundation-card-safari-dark-1440-glass-quality.png
- homepage-button-chrome-light-320-horizontal-scroll.png
- features-navigation-firefox-dark-768-focus-ring.png
```

**Screenshot Tools**:

**macOS**:
- Full screen: Cmd+Shift+3
- Selection: Cmd+Shift+4
- Window: Cmd+Shift+4 → Spacebar → Click window

**Chrome DevTools**:
```
1. Open DevTools (Cmd+Option+I)
2. Cmd+Shift+P (Command Palette)
3. Type "screenshot"
4. Select:
   - "Capture full size screenshot" (entire page)
   - "Capture screenshot" (visible area)
   - "Capture node screenshot" (selected element)
```

**Firefox Developer Tools**:
```
1. Right-click on page
2. "Take a Screenshot"
3. Select:
   - "Save visible" (viewport only)
   - "Save full page" (entire page)
```

**Safari Web Inspector**:
```
1. Develop → Show Web Inspector
2. Right-click element
3. "Capture Screenshot"
```

**What to Capture**:
- ✅ Full page screenshots for layout issues
- ✅ Zoomed component screenshots for visual defects
- ✅ Side-by-side browser comparisons
- ✅ Before/after theme switching
- ✅ Focus states (use browser tools to maintain focus)
- ✅ Hover states (may need screen recording)

**Screenshot Organization**:
```
docs/ui/test-results/sprint3-manual-testing/screenshots/
├── chrome/
│   ├── light/
│   ├── dark/
│   └── responsive/
├── firefox/
│   ├── light/
│   ├── dark/
│   └── responsive/
└── safari/
    ├── light/
    ├── dark/
    └── responsive/
```

---

### Screen Recording Guidelines

**Use Cases for Video**:
- Hover animations (difficult to capture in static screenshot)
- Theme switching transitions
- Performance issues (jank, lag)
- Keyboard navigation flow
- Scroll behavior
- Interactive state changes

**Recording Tools**:

**macOS QuickTime**:
```
1. QuickTime Player → File → New Screen Recording
2. Click red record button
3. Select area or full screen
4. Perform test actions
5. Stop recording (menu bar icon)
```

**Chrome DevTools Performance**:
```
1. DevTools → Performance tab
2. Click record (●)
3. Perform interaction
4. Stop recording
5. Analyze frame rate, paint times
```

**macOS Built-in** (macOS Mojave+):
```
Cmd+Shift+5 → Select recording type → Record
```

**Video Naming**:
```
[page]-[component]-[browser]-[action]-[issue].mov

Examples:
- foundation-card-chrome-hover-animation.mov
- homepage-button-safari-theme-switch.mov
- features-navigation-firefox-keyboard-nav.mov
```

**Video Organization**:
```
docs/ui/test-results/sprint3-manual-testing/videos/
├── chrome/
├── firefox/
└── safari/
```

---

## ✅ Quick Reference Checklists

### Daily Testing Session Checklist

**Before Starting** (5 minutes):
- [ ] Dev server running (`npm run dev`)
- [ ] All browsers open (Chrome, Firefox, Safari)
- [ ] DevTools configured (dark mode toggle, responsive mode)
- [ ] axe DevTools extension installed
- [ ] Test recording sheet prepared
- [ ] Screenshot/video folder ready

**During Testing** (per page, ~45 min):
- [ ] Visual inspection (light mode, all browsers)
- [ ] Interactive states (hover, focus, active)
- [ ] Dark mode testing
- [ ] Responsive breakpoints (320, 768, 1440)
- [ ] Keyboard navigation
- [ ] axe DevTools scan
- [ ] Screenshot critical findings
- [ ] Record results in template

**After Session** (15 minutes):
- [ ] Review test notes
- [ ] Create JIRA issues for bugs found
- [ ] Organize screenshots/videos
- [ ] Update UI_Regression_Checklist.md
- [ ] Update cross-browser compatibility matrix
- [ ] Commit test results to repository

---

### Component-Specific Quick Checks

**Button Quick Check** (2 minutes):
- [ ] Visual: Correct variant styling
- [ ] Hover: Shadow expands, upward transform
- [ ] Focus: Ring visible (2px, coria-primary)
- [ ] Active: Brightness reduces
- [ ] Dark mode: Gradient adapts
- [ ] Mobile: Touch target ≥44x44px

**Card Quick Check** (3 minutes):
- [ ] Visual: Glass effect visible (if variant="glass")
- [ ] Rounding: Organic (28px) or standard
- [ ] Hover: Transform (-8px) if hover=true
- [ ] Shadow: Expands on hover (if elevated)
- [ ] Dark mode: Transparency maintained
- [ ] Mobile: Full width, no overflow

**Page Quick Check** (10 minutes):
- [ ] No layout breaks
- [ ] All images load
- [ ] No horizontal scroll (all breakpoints)
- [ ] Theme switching smooth
- [ ] Navigation accessible
- [ ] No console errors

---

### Browser Comparison Quick Checks

**Chrome → Firefox Comparison**:
- [ ] Visual layout identical
- [ ] Backdrop-filter renders (Firefox 103+)
- [ ] Animations smooth (no jank)
- [ ] Console errors match (or none)
- [ ] Performance similar (FCP, LCP)

**Chrome → Safari Comparison**:
- [ ] Visual layout identical (allow minor differences)
- [ ] Backdrop-filter works (-webkit- prefix applied)
- [ ] Gradients render correctly
- [ ] Flex layouts work (no overflow)
- [ ] Animations smooth (may be slower)

**Known Acceptable Differences**:
- ✅ Safari: Backdrop-filter quality slightly different
- ✅ Firefox: Scrollbar styling different
- ✅ Safari: Animation performance may be ~5-10% slower

---

## 🎯 Testing Goals & Success Criteria

### Sprint 3 Testing Objectives

**Primary Goal**: Validate component unification across browsers, themes, and breakpoints

**Success Criteria**:
- [ ] Zero critical bugs (P0)
- [ ] ≤5 major bugs (P1)
- [ ] ≤10 minor bugs (P2)
- [ ] All 5 pages tested in 3 browsers
- [ ] Cross-browser matrix 100% populated
- [ ] Accessibility: Zero WCAG AA violations
- [ ] Performance: All Core Web Vitals within targets

### Estimated Testing Timeline

| Task | Duration | Cumulative |
|------|----------|------------|
| Pre-test setup | 30 min | 0.5h |
| Homepage testing | 45 min | 1.25h |
| Foundation page | 45 min | 2h |
| Features page | 45 min | 2.75h |
| Pricing page | 45 min | 3.5h |
| Blog page | 45 min | 4.25h |
| Accessibility audit | 30 min | 4.75h |
| Documentation | 30 min | 5.25h |
| **Total** | **5.25h** | - |

**Recommended Schedule**:
- Day 1: Setup + Homepage + Foundation (2h)
- Day 2: Features + Pricing + Blog (2.25h)
- Day 3: Accessibility + Documentation (1h)

---

## 📝 Final Notes

### Tips for Efficient Testing

1. **Use Side-by-Side Browser Windows**: Open Chrome, Firefox, Safari in split view for quick comparison
2. **Batch Similar Tests**: Test all light mode first, then all dark mode
3. **Screenshot as You Go**: Don't wait until end to capture evidence
4. **Take Notes in Real-Time**: Memory fades quickly, record immediately
5. **Use Browser Profiles**: Create separate testing profiles to avoid extension conflicts
6. **Clear Cache Between Tests**: Ensure fresh loads (Cmd+Shift+R)
7. **Test Edge Cases**: Try extreme viewport sizes (280px, 2560px)
8. **Monitor Console**: Keep DevTools console open, watch for warnings

### Common Pitfalls to Avoid

- ❌ Testing only in one browser (Chrome bias)
- ❌ Skipping dark mode testing
- ❌ Ignoring mobile breakpoints
- ❌ Not testing keyboard navigation
- ❌ Forgetting to clear cache
- ❌ Not documenting minor issues (they add up)
- ❌ Testing too quickly (rushing leads to missed bugs)

### When to Stop Testing

**You're done when**:
- [ ] All 71 test cases in checklist marked ✓/✗
- [ ] Cross-browser matrix fully populated
- [ ] All discovered bugs have JIRA tickets
- [ ] Screenshots organized and committed
- [ ] Test results documented in Component_Unification_Summary.md

---

## 🔗 Related Documentation

- [UI_Regression_Checklist.md](./UI_Regression_Checklist.md) - Complete test case list
- [Component_Unification_Summary.md](./Component_Unification_Summary.md) - Sprint 3 context
- [Sprint3_Backlog.md](./Sprint3_Backlog.md) - Original planning

---

**Last Updated**: October 6, 2025
**Version**: 1.0
**Status**: Ready for execution
**Estimated Completion**: 5-6 hours manual testing
