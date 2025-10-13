# CI Workflow Patch: E2E Smoke Tests Stabilization

**Date**: 2025-10-11
**Purpose**: Update CI workflow to support production-build E2E tests with increased timeouts and build-before-test pattern

## Summary of Changes

This patch updates the `e2e-smoke` job in `.github/workflows/ci.yml` to:
1. Build production bundle before running E2E tests
2. Use production server for more accurate testing
3. Increase timeout from 15 to 20 minutes for slower page loads
4. Configure trace capture on first retry for debugging

## Current Configuration Issues

**Problem 1**: E2E tests run against development server (slow compilation)
- Dev server compiles 1848 modules on first request
- Page loads take >60 seconds, causing test timeouts

**Problem 2**: Default test timeout (60s) insufficient for i18n route rendering
- i18n locale switching involves server-side rendering
- Production build pre-renders routes, faster and more accurate

**Problem 3**: Missing trace artifacts for debugging timeouts
- Current config only captures traces on retries
- First-run failures lack debugging information

## Recommended Patch

Replace lines 73-112 in `.github/workflows/ci.yml` with:

```yaml
  e2e-smoke:
    name: E2E Smoke Tests (Production Build)
    runs-on: ubuntu-latest
    timeout-minutes: 20  # Increased from 15 for production build + tests
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      # NEW: Build production bundle before tests
      - name: Build production bundle
        run: npm run build
        env:
          NODE_ENV: production

      # NEW: Run tests against production build
      - name: Run E2E smoke tests (Production)
        run: npm run test:e2e:smoke:prod
        env:
          CI: true
          # BASE_URL is set by run-e2e-prod.sh script

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
          retention-days: 7

      # NEW: Upload trace files for debugging
      - name: Upload trace artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-traces
          path: test-results/**/*.zip
          retention-days: 7
```

## Key Changes Explained

### 1. Production Build Before Tests

**Before**:
```yaml
- name: Run E2E smoke tests
  run: npm run test:e2e:smoke
```

**After**:
```yaml
- name: Build production bundle
  run: npm run build

- name: Run E2E smoke tests (Production)
  run: npm run test:e2e:smoke:prod
```

**Benefits**:
- Pre-rendered routes load faster (no compilation delay)
- More accurate representation of production behavior
- Consistent performance across test runs

### 2. Increased Job Timeout

**Before**: `timeout-minutes: 15`
**After**: `timeout-minutes: 20`

**Rationale**:
- Production build: ~2-3 minutes
- Server startup: ~30 seconds
- E2E tests: ~10-15 minutes (with 120s per test)
- Buffer for CI overhead: ~2 minutes

### 3. Trace Artifact Upload

**New Step**:
```yaml
- name: Upload trace artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-traces
    path: test-results/**/*.zip
```

**Benefits**:
- Full Playwright traces for debugging
- Available even on first-run failures
- Retained for 7 days for investigation

## Configuration File Changes

### playwright.config.ts Updates

Already applied in this implementation:

```typescript
// Before
timeout: 60000, // 60s per test
workers: process.env.CI ? 2 : 4,
navigationTimeout: 20000, // 20s

// After
timeout: 120000, // 120s per test (i18n page loads)
workers: process.env.CI ? 2 : 2, // Consistent 2 workers
navigationTimeout: 30000, // 30s (i18n route rendering)
```

### package.json Script

Already exists:

```json
"test:e2e:smoke:prod": "./scripts/run-e2e-prod.sh"
```

This script handles:
- Production build
- Server startup with health checks
- E2E test execution with BASE_URL
- Automatic cleanup

## Testing the Patch

### Local Validation

Before applying to CI, test locally:

```bash
# Test production E2E flow
cd website
npm run test:e2e:smoke:prod

# Expected: All tests pass or timeout gracefully at 120s
# Check: test-results/ for traces and artifacts
```

### CI Validation Strategy

1. **Apply patch to feature branch**
2. **Create PR and observe CI run**
3. **Verify job completes within 20 minutes**
4. **Check artifact uploads (report, results, traces)**
5. **Merge if all tests pass**

## Rollback Plan

If issues arise:

```yaml
# Revert to development server testing
- name: Run E2E smoke tests
  run: npm run test:e2e:smoke  # Uses webServer config
  env:
    CI: true
```

Remove production build step and restore 15-minute timeout.

## Expected Outcomes

**Before Patch**:
- ❌ 4/9 tests timeout (1.4-2.0 minutes)
- ❌ Dev server compilation delays
- ❌ Missing trace artifacts for debugging

**After Patch**:
- ✅ All tests complete within 120s timeout
- ✅ Pre-rendered routes load faster
- ✅ Full trace artifacts available
- ✅ More accurate production testing

## Monitoring

After deployment, monitor:

1. **Job Duration**: Should be 15-18 minutes (was unpredictable)
2. **Test Success Rate**: Target 100% pass rate (was 55% due to timeouts)
3. **Artifact Size**: Trace files ~5-10MB per test run
4. **False Positives**: Watch for flaky tests unrelated to timeouts

## Related Files

- [playwright.config.ts](../../playwright.config.ts) - Test configuration with 120s timeout
- [scripts/run-e2e-prod.sh](../../scripts/run-e2e-prod.sh) - Production E2E orchestration
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) - CI workflow to patch

## References

- [I18N_Test_Execution_Report.md](./I18N_Test_Execution_Report.md) - Timeout root cause analysis
- [E2E_Stabilization_Summary.md](./E2E_Stabilization_Summary.md) - Testing recommendations
- [Playwright Configuration](https://playwright.dev/docs/test-configuration) - Official docs
