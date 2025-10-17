# CORIA Website Testing Suite

This directory contains comprehensive testing infrastructure for the CORIA website, including unit tests, integration tests, end-to-end tests, performance tests, security tests, and accessibility tests.

## Test Structure

```
src/test/
├── components/          # Component unit tests
├── e2e/                # End-to-end tests (Playwright)
├── lib/                # Utility function tests
├── load/               # Load testing configuration
├── performance/        # Performance tests
├── security/           # Security tests
├── setup.ts            # Test setup and configuration
├── utils.tsx           # Test utilities and helpers
└── README.md           # This file
```

## Testing Technologies

- **Unit Tests**: Vitest + Testing Library
- **E2E Tests**: Playwright
- **Accessibility**: axe-core + axe-playwright
- **Performance**: Lighthouse CI + Custom metrics
- **Load Testing**: Artillery
- **Security**: Custom security utilities + penetration testing
- **Visual Regression**: Playwright screenshots

## Running Tests

### Individual Test Suites

```bash
# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# End-to-end tests
npm run test:e2e
npm run test:e2e:ui

# Accessibility tests
npm run test:a11y

# Performance tests
npm run lighthouse
npm run lighthouse:ci

# Load tests
npm run load:test
npm run load:test:report

# Security tests
npm run security:audit
npm run security:headers

# All tests
npm run test:all
```

### CI/CD Pipeline

```bash
# Quick CI check
npm run test:ci

# Full test suite (requires server)
npm run test:all
```

## Test Categories

### 1. Unit Tests

Located in `src/test/lib/` and `src/test/components/`

**Coverage:**
- Utility functions (formatting, URLs, security)
- UI components (Button, Card, Typography)
- Business logic functions
- Form validation
- Data transformations

**Example:**
```typescript
import { render, screen } from '@/test/utils'
import { Button } from '@/components/ui/button'

test('should render button with correct variant', () => {
  render(<Button variant="secondary">Click me</Button>)
  expect(screen.getByRole('button')).toHaveClass('border-coria-green')
})
```

### 2. Integration Tests

Located in `src/test/e2e/`

**Coverage:**
- Page navigation and routing
- Form submissions
- User interactions
- Multi-language functionality
- Mobile responsiveness

**Example:**
```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Features')
  await expect(page).toHaveURL(/.*\/features/)
})
```

### 3. Accessibility Tests

Integrated into E2E tests with axe-playwright

**Coverage:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- ARIA attributes

**Example:**
```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

### 4. Performance Tests

Located in `src/test/performance/`

**Coverage:**
- Core Web Vitals (LCP, FID, CLS)
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- JavaScript execution time
- Image loading performance
- Mobile performance

**Thresholds:**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- FCP: < 1.8s
- TTI: < 3.8s

### 5. Security Tests

Located in `src/test/security/`

**Coverage:**
- XSS prevention
- SQL injection protection
- CSRF protection
- Input validation
- Rate limiting
- Security headers
- File upload security
- Path traversal prevention

**Example:**
```typescript
test('should prevent XSS attacks', () => {
  const maliciousInput = '<script>alert("XSS")</script>'
  const sanitized = sanitizeHtml(maliciousInput)
  expect(sanitized).not.toContain('<script>')
})
```

### 6. Load Tests

Configuration in `src/test/load/artillery.yml`

**Scenarios:**
- Homepage browsing (40% traffic)
- Feature exploration (30% traffic)
- Multi-language browsing (20% traffic)
- Contact and about (10% traffic)

**Load Phases:**
1. Warm up: 5 users/sec for 60s
2. Ramp up: 5→50 users/sec over 120s
3. Sustained: 50 users/sec for 300s
4. Peak: 50→100 users/sec over 120s
5. Cool down: 100→5 users/sec over 60s

**Performance Targets:**
- 95% of requests < 2s
- 99% of requests < 5s
- Error rate < 1%

### 7. Visual Regression Tests

Integrated into E2E tests with Playwright screenshots

**Coverage:**
- Homepage layout
- Component rendering
- Mobile responsiveness
- Dark/light themes
- Multi-language layouts

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './src/test/e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ]
})
```

### Lighthouse CI Configuration (`lighthouserc.js`)

```javascript
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }]
      }
    }
  }
}
```

## Test Utilities

### Custom Render Function

```typescript
import { render as rtlRender } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options
  })
}
```

### Accessibility Helper

```typescript
export const expectToBeAccessible = async (container: HTMLElement) => {
  const { axe } = await import('axe-core')
  const results = await axe(container)
  expect(results.violations).toHaveLength(0)
}
```

## Continuous Integration

The test suite runs automatically on:
- Pull requests
- Pushes to main/develop branches
- Scheduled runs (daily)

### GitHub Actions Workflow

1. **Test Job**: Unit tests, linting, type checking, build
2. **E2E Job**: End-to-end tests with Playwright
3. **Lighthouse Job**: Performance testing
4. **Security Job**: Security audits and header checks
5. **Load Test Job**: Load testing (main branch only)

## Test Data and Mocks

### Mock Data

```typescript
export const mockFeature = {
  id: '1',
  name: { en: 'Test Feature' },
  description: { en: 'Test Description' },
  // ...
}
```

### Environment Variables

```bash
# Test environment
NODE_ENV=test
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=test_space
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=test_token
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain what is being tested
3. **Test Behavior, Not Implementation**: Focus on user-facing functionality
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Page Object Model**: For E2E tests, create reusable page objects

### Performance Testing

1. **Set Realistic Thresholds**: Based on user expectations and business requirements
2. **Test on Different Devices**: Include mobile and desktop scenarios
3. **Monitor Trends**: Track performance over time, not just pass/fail
4. **Test Real Scenarios**: Use realistic user journeys and data

### Security Testing

1. **Test Input Validation**: All user inputs should be validated and sanitized
2. **Check Authentication**: Verify proper access controls
3. **Test Error Handling**: Ensure errors don't leak sensitive information
4. **Validate Headers**: Security headers should be properly configured

## Troubleshooting

### Common Issues

1. **Tests Timing Out**: Increase timeout values or optimize test setup
2. **Flaky Tests**: Add proper waits and make tests more deterministic
3. **Memory Issues**: Clean up resources and use proper mocking
4. **CI Failures**: Ensure tests work in headless environments

### Debug Commands

```bash
# Run tests in debug mode
npm run test:watch
npm run test:e2e:ui

# Generate detailed reports
npm run test:coverage
npm run load:test:report

# Check specific test files
npx vitest run src/test/lib/utils.test.ts
npx playwright test src/test/e2e/homepage.spec.ts
```

## Reporting

Test results are automatically generated and stored in:
- `coverage/`: Unit test coverage reports
- `playwright-report/`: E2E test reports
- `test-results/`: Combined test results
- `.lighthouseci/`: Performance test results

Reports are also uploaded to CI artifacts for review and historical tracking.