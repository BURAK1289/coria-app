# E2E Test Execution Guide

**Last Updated**: 2025-10-12T01:45:00Z  
**Playwright Version**: Latest  
**Configuration**: [playwright.config.ts](../../playwright.config.ts)

---

## Quick Start

### Development Mode (with hot reload)
```bash
# Start dev server and run all E2E tests
npm run test:e2e

# Start dev server and run smoke tests only
npm run test:e2e:smoke

# Interactive UI mode for debugging
npm run test:e2e:ui
```

### Production Mode (full build)
```bash
# Complete production test cycle: BUILD → START → TEST → CLEANUP
npm run test:e2e:smoke:prod

# This script automatically:
# 1. Builds production bundle (npm run build)
# 2. Starts production server on port 3000
# 3. Waits for server health check (max 60s)
# 4. Runs smoke tests with BASE_URL=http://localhost:3000
# 5. Cleans up server and processes
```

---

## Configuration

### Timeout Settings (Updated 2025-10-12)

| Setting | Value | Reason |
|---------|-------|--------|
| **Test Timeout** | 180s (3 min) | i18n pages load in 1.0-1.2min in production |
| **Expect Timeout** | 10s | Standard assertion wait time |
| **Action Timeout** | 15s | Standard for form interactions |
| **Navigation Timeout** | 30s | i18n route rendering overhead |

**Rationale**: Previous 120s timeout was insufficient for reliable i18n page loads. 180s provides 50% buffer for production builds.

### Worker Configuration

| Environment | Workers | Reason |
|-------------|---------|--------|
| **CI** | 2 | Stability over speed |
| **Local** | 2 | Consistent with CI behavior |

**Rationale**: Reduced from 4 to 2 workers for test stability. Prevents resource contention during parallel execution.

### Artifact Collection

| Artifact | CI | Local | Storage |
|----------|----|----|---------|
| **Traces** | On first retry | Always on | `test-results/*/trace.zip` |
| **Screenshots** | Only on failure | Only on failure | `test-results/*/screenshots/` |
| **Videos** | Retain on failure | Always on | `test-results/*/video.webm` |

---

## Environment Variables

### BASE_URL Configuration

**Default**: `http://localhost:3000`  
**Override**: Set `BASE_URL` environment variable

```bash
# Test against local production build
BASE_URL=http://localhost:3000 npm run test:e2e:smoke

# Test against staging server
BASE_URL=https://staging.coria.app npm run test:e2e:smoke

# Test against production (read-only tests only!)
BASE_URL=https://coria.app npm run test:e2e:smoke
```

**Note**: Production test script automatically sets `BASE_URL=http://localhost:3000`.

### CI Environment Detection

Playwright automatically detects CI environment and adjusts:
- **Retries**: 2 in CI, 0 locally
- **Workers**: 2 in CI, 2 locally (consistent)
- **Artifacts**: Optimized for CI storage (traces on retry, videos on failure)

---

## Test Suites

### Smoke Tests (@smoke tag)
**Purpose**: Critical path validation  
**Runtime**: ~3-5 minutes (33 tests)  
**Coverage**:
- Homepage rendering and navigation
- Core user flows (iOS/Android download CTAs)
- i18n page loads (TR, EN, DE, FR)
- Image loading and performance
- SEO meta tags

**Run**:
```bash
# Development mode
npm run test:e2e:smoke

# Production mode (recommended)
npm run test:e2e:smoke:prod
```

### Regression Tests (@regression tag)
**Purpose**: Comprehensive validation  
**Runtime**: ~15-30 minutes (full suite)  
**Coverage**: All smoke tests + edge cases + cross-browser

**Run**:
```bash
npm run test:e2e:regression
```

### i18n Tests (language-switch.spec.ts)
**Purpose**: Locale switching and translation validation  
**Runtime**: ~2-3 minutes (9 tests)  
**Coverage**:
- Language switcher functionality
- URL locale parameter updates
- Translation completeness
- Browser back/forward navigation

**Run**:
```bash
npx playwright test e2e/tests/language-switch.spec.ts
```

---

## Production Test Script Details

### Script Location
[scripts/run-e2e-prod.sh](../../scripts/run-e2e-prod.sh)

### Execution Flow
```
1. 📦 BUILD     → npm run build (Next.js production bundle)
2. 🚀 START     → npm start on port 3000 (background process)
3. ❤️  HEALTH   → Wait for server (max 60s, curl http://localhost:3000)
4. 🎭 TEST      → npx playwright test --grep @smoke (BASE_URL set)
5. 🧹 CLEANUP   → Kill server, remove PID file, clear port
```

### Exit Codes
| Code | Meaning | Action |
|------|---------|--------|
| 0 | All tests passed | ✅ Success |
| 1 | Tests failed | Check playwright-report/index.html |
| 2 | Build failed | Check build errors |
| 3 | Server failed to start | Check /tmp/next-prod-server.log |

### Logs & Artifacts
- **Server Log**: `/tmp/next-prod-server.log`
- **Test Results**: `test-results/results.json`
- **HTML Report**: `playwright-report/index.html`
- **JUnit XML**: `test-results/junit.xml` (for CI integration)

---

## Debugging Failed Tests

### Step 1: View HTML Report
```bash
npx playwright show-report
```
This opens an interactive report with:
- Test results with pass/fail status
- Screenshots at failure points
- Traces for debugging (timeline, network, console)

### Step 2: Inspect Traces
```bash
# Open specific trace file
npx playwright show-trace test-results/[test-name]/trace.zip
```
Trace viewer shows:
- **Timeline**: Actions, assertions, waits
- **Network**: All HTTP requests/responses
- **Console**: Browser console logs
- **Source**: Test code with execution highlights

### Step 3: Run in Headed Mode
```bash
# See browser window during test execution
npm run test:e2e:headed

# Run specific test in headed mode
npx playwright test e2e/tests/smoke/homepage.spec.ts --headed
```

### Step 4: Debug with UI Mode
```bash
# Interactive debugging with time-travel
npm run test:e2e:ui
```
UI mode provides:
- Pause/resume test execution
- Step through actions
- Inspect DOM at each step
- Edit test code with hot reload

### Step 5: Check Server Logs
```bash
# If running production script
tail -f /tmp/next-prod-server.log

# If server health check failed
cat /tmp/next-prod-server.log
```

---

## Common Issues & Solutions

### Issue 1: Tests Timing Out (Timeout: 180000ms exceeded)
**Symptoms**: Tests fail with timeout error after 180 seconds

**Causes**:
- i18n page taking longer than expected to load
- Server not responding or slow
- Network issues or API delays

**Solutions**:
```bash
# 1. Check server is running
curl http://localhost:3000

# 2. Check server logs for errors
cat /tmp/next-prod-server.log

# 3. Increase timeout temporarily for debugging
# Edit playwright.config.ts line 9:
timeout: 240000, // 4 minutes

# 4. Run single test to isolate issue
npx playwright test e2e/tests/smoke/homepage.spec.ts --headed
```

### Issue 2: Port 3000 Already in Use
**Symptoms**: Server fails to start, "EADDRINUSE" error

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use production script (has automatic cleanup)
npm run test:e2e:smoke:prod
```

### Issue 3: Build Warnings/Errors
**Symptoms**: "npm run build" fails, exit code 2

**Solutions**:
```bash
# 1. Check for missing translations
npm run i18n:validate

# 2. Run build separately to see full errors
npm run build

# 3. Check for TypeScript errors
npm run type-check
```

### Issue 4: Flaky Tests (Random Failures)
**Symptoms**: Tests pass sometimes, fail other times

**Causes**:
- Race conditions in async operations
- Timeout too aggressive for slow operations
- Element not stable before interaction

**Solutions**:
```typescript
// Use auto-wait assertions (preferred)
await expect(page.locator('button')).toBeVisible()

// Add explicit waits if needed
await page.waitForLoadState('networkidle')

// Increase action timeout for specific operation
await page.click('button', { timeout: 30000 })
```

### Issue 5: i18n Pages Not Loading
**Symptoms**: Timeout on locale-specific pages (/en, /de, /fr)

**Solutions**:
```bash
# 1. Verify locale files exist
ls src/messages/{en,de,fr}.json

# 2. Check for missing translations
npm run i18n:validate

# 3. Test manually
curl http://localhost:3000/en
curl http://localhost:3000/de
curl http://localhost:3000/fr
```

---

## CI/CD Integration

### GitHub Actions Workflow

**Recommended Configuration**:
```yaml
name: E2E Smoke Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  e2e-smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E smoke tests (production build)
        run: npm run test:e2e:smoke:prod
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7
      
      - name: Upload server logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: server-logs
          path: /tmp/next-prod-server.log
          retention-days: 3
```

### CI Environment Variables
```yaml
env:
  CI: true                           # Auto-detected by Playwright
  BASE_URL: http://localhost:3000    # Default (can override for staging/prod)
  NODE_ENV: production               # Ensures production optimizations
```

---

## Performance Benchmarks

### Expected Test Durations (Production Mode)

| Test Suite | Tests | Expected Duration | Timeout Budget |
|------------|-------|-------------------|----------------|
| Smoke (@smoke) | 33 | 3-5 min | 180s per test |
| i18n Switch | 9 | 2-3 min | 180s per test |
| Regression | ~100 | 15-30 min | 180s per test |

### Page Load Benchmarks (Production)

| Page | Locale | Expected Load Time | Timeout |
|------|--------|-------------------|---------|
| Homepage (/) | EN | 40-60s | 180s |
| Homepage (/) | DE/FR | 60-80s | 180s |
| Features (/features) | EN | 40-60s | 180s |
| Pricing (/pricing) | EN | 40-60s | 180s |

**Note**: Load times include SSR + hydration + i18n route rendering.

---

## Best Practices

### Test Writing
1. **Tag Tests Appropriately**: Use `@smoke` for critical paths, `@regression` for comprehensive
2. **Avoid Hard Waits**: Use `expect()` assertions instead of `page.waitForTimeout()`
3. **Locators First**: Prefer `page.getByRole()`, `page.getByLabel()` over CSS selectors
4. **Isolate Tests**: Each test should be independent (no shared state)

### Production Testing
1. **Always Use Production Script**: `npm run test:e2e:smoke:prod` (not manual build + start)
2. **Monitor Server Logs**: Check `/tmp/next-prod-server.log` if issues occur
3. **Clean Ports Before**: Run `lsof -ti:3000 | xargs kill -9` if port conflicts
4. **CI Consistency**: Run same script in CI as locally for reproducibility

### Debugging Strategy
1. **Start with HTML Report**: `npx playwright show-report` for overview
2. **Use Traces for Details**: Inspect network, console, timeline in trace viewer
3. **Headed Mode for Visual**: See what browser sees with `--headed`
4. **UI Mode for Step-by-Step**: Pause and inspect with `npm run test:e2e:ui`

---

## Maintenance

### Regular Updates
- **Weekly**: Review flaky test reports, update expectations
- **Monthly**: Update Playwright version, review configuration
- **Quarterly**: Benchmark performance, adjust timeouts if needed

### Adding New Tests
1. Create test file in `e2e/tests/` with appropriate subdirectory
2. Add `@smoke` or `@regression` tag
3. Follow naming convention: `[feature]-[scenario].spec.ts`
4. Run locally with production script before committing

### Configuration Changes
When modifying [playwright.config.ts](../../playwright.config.ts):
1. Test locally with both dev and production modes
2. Update this documentation with rationale
3. Run full regression suite to verify no breakage
4. Update CI workflow if environment variables change

---

## Troubleshooting Checklist

Before reporting issues, verify:
- [ ] Port 3000 is not in use (`lsof -ti:3000`)
- [ ] All dependencies installed (`npm ci`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Build succeeds (`npm run build`)
- [ ] Server starts (`npm start`)
- [ ] Server responds (`curl http://localhost:3000`)
- [ ] No missing translations (`npm run i18n:validate`)
- [ ] Playwright config timeout is 180s (line 9)
- [ ] Using production script (`npm run test:e2e:smoke:prod`)
- [ ] Checked server logs (`/tmp/next-prod-server.log`)

---

## Additional Resources

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **CORIA i18n Guide**: [I18N_Coverage_Report.md](I18N_Coverage_Report.md)
- **CORIA E2E Report**: [I18N_E2E_Report.md](I18N_E2E_Report.md) (if exists)
- **CI Workflow Patch**: [CI_Workflow_Patch_E2E_Smoke.md](CI_Workflow_Patch_E2E_Smoke.md)

---

**Maintained By**: CORIA Technical Team  
**Questions**: Refer to troubleshooting section or check server logs
**Updates**: Document all configuration changes with rationale
