# E2E Test Suite Documentation

## Overview

Comprehensive end-to-end test suite for the AI Course Generator application using Playwright. Tests cover user flows, responsive design, and accessibility compliance.

## Test Files

### 1. `home.spec.ts` - Home Page Tests
**Purpose**: Verify homepage rendering and basic functionality

**Test Coverage**:
- Page title and meta tags
- Hero section display
- Form rendering (all input fields)
- CTA button functionality
- Smooth scroll navigation
- Empty state display
- Semantic HTML structure
- Visual elements and styling
- Focus visibility

**Test Suites**:
- `Home Page` (20 tests)
- `Home Page - Visual Elements` (3 tests)

**Total Tests**: 23

---

### 2. `course-generation.spec.ts` - Course Generation Flow Tests
**Purpose**: Test complete course generation workflow

**Test Coverage**:
- Form input and validation
- API interaction with mocked responses
- Loading state indicators
- Success state display
- Error handling (empty fields, API errors, network timeout)
- Form field interactions
- Course result display (modules, lessons, metadata)
- Action buttons
- Language support
- Multiple generation cycles

**Test Suites**:
- `Course Generation Flow` (18 tests)
- `Course Generation - Language Support` (2 tests)

**Total Tests**: 20

**Key Features Tested**:
- Topic input validation
- Level selection (beginner, intermediate, advanced)
- Duration selection (1-week, 2-weeks, 1-month, 3-months, self-paced)
- Language selection (English, Japanese, Spanish, French, Chinese)
- API error handling (500 errors, timeouts)
- Loading state (disabled inputs, spinner)
- Results display (modules, lessons, estimated hours)

---

### 3. `responsive.spec.ts` - Responsive Design Tests
**Purpose**: Verify responsive behavior across device sizes

**Test Coverage**:
- Mobile viewport (375px × 667px)
- Tablet viewport (768px × 1024px)
- Desktop viewport (1280px × 720px)
- Large desktop (1920px × 1080px)
- Cross-device functionality
- Layout adaptation
- Touch interactions
- Viewport transitions
- Horizontal scroll prevention

**Test Suites**:
- `Responsive Design - Mobile (375px)` (9 tests)
- `Responsive Design - Tablet (768px)` (6 tests)
- `Responsive Design - Desktop (1280px)` (7 tests)
- `Responsive Design - Cross-Device` (4 tests)
- `Responsive Design - Images and Media` (3 tests)

**Total Tests**: 29

**Key Features Tested**:
- Text readability and font sizes
- Touch target sizes (minimum 44×44px)
- Form layout adaptation
- Button stacking vs. side-by-side
- Content max-width constraints
- Portrait/landscape orientation
- No horizontal overflow

---

### 4. `accessibility.spec.ts` - Accessibility Tests
**Purpose**: Ensure WCAG 2.1 Level AA compliance

**Test Coverage**:
- Keyboard navigation (Tab, Shift+Tab, Enter, Space)
- Focus management and visibility
- ARIA attributes and roles
- Screen reader support
- Semantic HTML
- Form labels and placeholders
- Color contrast
- Focus indicators
- Heading hierarchy
- Error announcements

**Test Suites**:
- `Accessibility - Keyboard Navigation` (8 tests)
- `Accessibility - ARIA Attributes` (10 tests)
- `Accessibility - Screen Reader Support` (6 tests)
- `Accessibility - Focus Management` (4 tests)
- `Accessibility - Color and Contrast` (4 tests)
- `Accessibility - Forms` (3 tests)

**Total Tests**: 35

**WCAG Compliance Checklist**:
- ✅ Keyboard accessible
- ✅ Focus indicators visible
- ✅ Proper heading hierarchy
- ✅ Form labels associated
- ✅ Error messages announced (role="alert")
- ✅ Meaningful button text
- ✅ Language attribute (lang="en")
- ✅ No focus traps
- ✅ Tab order logical

---

### 5. `fixtures/test-data.json` - Test Data
**Purpose**: Centralized test data and configuration

**Contents**:
- Course form data (valid and invalid scenarios)
- Mock API responses
- Error messages
- CSS selectors
- Viewport configurations
- Accessibility keyboard keys
- ARIA roles

---

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Test File
```bash
npm run test:e2e tests/e2e/home.spec.ts
```

### Specific Test Suite
```bash
npm run test:e2e -- --grep "Home Page"
```

### Single Browser
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e -- --debug
```

### Headed Mode (See Browser)
```bash
npm run test:e2e -- --headed
```

---

## Test Configuration

### Playwright Config (`playwright.config.ts`)
```typescript
{
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
}
```

---

## Test Statistics

### Total Test Count
- **Home Page**: 23 tests
- **Course Generation**: 20 tests
- **Responsive Design**: 29 tests
- **Accessibility**: 35 tests
- **Grand Total**: 107 tests

### Coverage Areas
- ✅ UI Rendering
- ✅ User Interactions
- ✅ Form Validation
- ✅ API Integration
- ✅ Error Handling
- ✅ Loading States
- ✅ Responsive Layouts
- ✅ Keyboard Navigation
- ✅ Screen Reader Support
- ✅ WCAG Compliance

---

## Best Practices

### Test Organization
1. Group related tests in `describe` blocks
2. Use `beforeEach` for common setup
3. Keep tests focused and atomic
4. Use descriptive test names

### Page Loading
```typescript
// Use domcontentloaded instead of networkidle for faster, more reliable tests
await page.goto('/');
await page.waitForLoadState('domcontentloaded');
await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });
```

### Selectors
1. Prefer user-facing attributes:
   - `page.getByRole('button', { name: /Submit/i })`
   - `page.getByLabel(/Email/i)`
   - `page.getByText(/Welcome/i)`
2. Avoid CSS selectors when possible
3. Use test IDs sparingly (`data-testid`)

### Assertions
```typescript
// Prefer built-in matchers
await expect(element).toBeVisible();
await expect(element).toHaveText('Expected text');
await expect(element).toBeEnabled();

// Check computed styles
const color = await element.evaluate(el => getComputedStyle(el).color);
```

### API Mocking
```typescript
await page.route('**/api/generate', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Debugging Failed Tests

### 1. Check Screenshots
Failed tests automatically capture screenshots:
```
test-results/[test-name]/test-failed-1.png
```

### 2. Watch Videos
Videos are retained on failure:
```
test-results/[test-name]/video.webm
```

### 3. View Traces
Open trace viewer for detailed debugging:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### 4. Run in Debug Mode
```bash
npm run test:e2e -- --debug
```

---

## Maintenance

### Updating Test Data
Edit `fixtures/test-data.json` to update:
- Mock API responses
- Form field values
- Viewport sizes
- Error messages

### Adding New Tests
1. Create new spec file in `tests/e2e/`
2. Import test data: `import testData from './fixtures/test-data.json'`
3. Follow existing patterns
4. Update this README

### Updating Selectors
If UI changes break tests:
1. Check component changes
2. Update selectors to match new structure
3. Prefer semantic selectors over CSS
4. Update test data if needed

---

## Known Issues

### Next.js Dev Server Warning
You may see warnings about workspace root detection. This is harmless and can be ignored or fixed by setting `turbopack.root` in `next.config.ts`.

### Timeout Issues
If tests timeout:
1. Ensure dev server is running properly
2. Check for infinite loading states
3. Increase timeout in test if necessary
4. Use `domcontentloaded` instead of `networkidle`

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)

---

**Last Updated**: 2025-11-28
**Test Suite Version**: 1.0.0
**Playwright Version**: 1.57.0
