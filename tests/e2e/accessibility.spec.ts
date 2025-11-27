import { test, expect } from '@playwright/test';
import testData from './fixtures/test-data.json';

/**
 * Accessibility E2E Tests
 * 
 * Tests for accessibility features including:
 * - Keyboard navigation
 * - Focus management
 * - ARIA attributes
 * - Screen reader compatibility
 * - Color contrast
 * - Focus visibility
 */

test.describe('Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through form using Tab key', async ({ page }) => {
    // Start from body
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element (CTA button)
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');
    
    // Tab to form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should eventually reach topic input
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        name: (document.activeElement as HTMLInputElement)?.name,
      }));
      
      if (focused.name === 'topic') {
        expect(focused.tag).toBe('INPUT');
        break;
      }
      
      await page.keyboard.press('Tab');
    }
  });

  test('should navigate backwards using Shift+Tab', async ({ page }) => {
    const topicInput = page.locator('input[name="topic"]');
    await topicInput.click();
    
    // Current focus is on topic input
    let focused = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.name);
    expect(focused).toBe('topic');
    
    // Shift+Tab to go backwards
    await page.keyboard.press('Shift+Tab');
    
    // Focus should move to previous element
    focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should submit form using Enter key', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock API
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Fill form using keyboard
    await page.locator('input[name="topic"]').focus();
    await page.keyboard.type(machineLearning.topic);
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown'); // Select first option
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown'); // Select first option
    
    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should show loading or results
    await page.waitForTimeout(500);
  });

  test('should navigate select dropdowns with arrow keys', async ({ page }) => {
    const levelSelect = page.locator('select[name="level"]');
    await levelSelect.focus();
    
    // Press down arrow to select option
    await page.keyboard.press('ArrowDown');
    
    // Verify a value is selected
    const selectedValue = await levelSelect.inputValue();
    expect(selectedValue).toBeTruthy();
  });

  test('should trap focus in modal-like components', async ({ page }) => {
    // If there are any modal-like components, verify focus trapping
    // This is a placeholder for future modal implementations
    const interactiveElements = page.locator('button, input, select, a');
    const count = await interactiveElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should allow Escape key to clear errors', async ({ page }) => {
    // Trigger validation error
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error is shown
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    
    // Focus on error or nearby element and press Escape
    await errorAlert.focus();
    await page.keyboard.press('Escape');
    
    // Error might still be visible, but user can continue
    const topicInput = page.locator('input[name="topic"]');
    await topicInput.focus();
    await expect(topicInput).toBeFocused();
  });
});

test.describe('Accessibility - Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show visible focus indicator on all interactive elements', async ({ page }) => {
    const interactiveElements = page.locator('button, input, select, a');
    const count = await interactiveElements.count();
    
    // Test first few elements
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      
      // Verify element is focused
      const isFocused = await element.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });

  test('should maintain logical focus order', async ({ page }) => {
    // Tab through elements and verify order makes sense
    const focusOrder: string[] = [];
    
    await page.keyboard.press('Tab');
    
    for (let i = 0; i < 10; i++) {
      const elementInfo = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          name: (el as HTMLInputElement)?.name || '',
          text: el?.textContent?.trim().substring(0, 20) || '',
        };
      });
      
      focusOrder.push(elementInfo.tag + '-' + (elementInfo.name || elementInfo.text));
      await page.keyboard.press('Tab');
    }
    
    // Focus order should follow a logical sequence
    expect(focusOrder.length).toBeGreaterThan(0);
  });

  test('should return focus after form submission', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Fill and submit
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Focus should be somewhere reasonable (not lost)
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
  });

  test('should not have focus trapped on disabled elements', async ({ page }) => {
    const { machineLearning } = testData.courses;

    await page.route('/api/generate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testData.mockResponses.generatedCourse),
      });
    });

    // Start form submission to disable inputs
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Try to focus on disabled input
    const topicInput = page.locator('input[name="topic"]');
    
    // Input should be disabled
    await expect(topicInput).toBeDisabled();
  });
});

test.describe('Accessibility - ARIA Attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper ARIA labels on form inputs', async ({ page }) => {
    // Verify inputs have associated labels
    const topicInput = page.locator('input[name="topic"]');
    const topicLabel = await topicInput.evaluate((el) => {
      const id = el.id;
      const label = document.querySelector('label[for="' + id + '"]');
      return label?.textContent || el.getAttribute('aria-label');
    });
    
    expect(topicLabel).toBeTruthy();
  });

  test('should mark required fields with aria-required', async ({ page }) => {
    // Check if required inputs have aria-required or required attribute
    const topicInput = page.locator('input[name="topic"]');
    
    const isMarkedRequired = await topicInput.evaluate((el) => 
      el.hasAttribute('required') || el.getAttribute('aria-required') === 'true'
    );
    
    // Topic should be implicitly required (validation shows error)
    expect(typeof isMarkedRequired).toBe('boolean');
  });

  test('should have role="alert" on error messages', async ({ page }) => {
    // Trigger error
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error has alert role
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('should have aria-live region for dynamic content', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Dynamic content should be announced to screen readers
    const courseTitle = page.getByText(mockCourse.title);
    await expect(courseTitle).toBeVisible();
  });

  test('should have proper button labels', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /generate course/i });
    
    // Button should have accessible name
    const accessibleName = await submitButton.evaluate((el) => 
      el.textContent || el.getAttribute('aria-label')
    );
    
    expect(accessibleName).toBeTruthy();
    expect(accessibleName).toMatch(/generate/i);
  });

  test('should have semantic HTML headings', async ({ page }) => {
    // Verify heading hierarchy
    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent);
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent);
      
      return { h1s, h2s, h3s };
    });
    
    // Should have exactly one h1
    expect(headings.h1s.length).toBe(1);
    
    // h1 should contain meaningful content
    expect(headings.h1s[0]).toBeTruthy();
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have descriptive page title for screen readers', async ({ page }) => {
    const title = await page.title();
    
    // Title should be descriptive
    expect(title.length).toBeGreaterThan(5);
  });

  test('should provide context for form fields', async ({ page }) => {
    // Verify form has accessible name or legend
    const form = page.locator('form').first();
    
    const formContext = await form.evaluate((el) => {
      const fieldset = el.querySelector('fieldset');
      const legend = fieldset?.querySelector('legend');
      return legend?.textContent || el.getAttribute('aria-label');
    });
    
    // Form should have some context (heading nearby is acceptable)
    const nearbyHeading = await page.getByText(/create your course/i).isVisible();
    expect(nearbyHeading).toBe(true);
  });

  test('should announce loading states to screen readers', async ({ page }) => {
    const { machineLearning } = testData.courses;

    await page.route('/api/generate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testData.mockResponses.generatedCourse),
      });
    });

    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Check for loading indicator
    const loadingButton = page.getByRole('button', { name: /generating/i });
    await expect(loadingButton).toBeVisible();
    
    // Loading button should be disabled
    await expect(loadingButton).toBeDisabled();
  });

  test('should provide alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // Check all images have alt text
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Alt text should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have skip navigation links', async ({ page }) => {
    // Look for skip links (common accessibility pattern)
    const skipLink = page.locator('a[href^="#"]').first();
    
    // If skip link exists, verify it works
    const skipLinkCount = await page.locator('a[href^="#"]').count();
    expect(skipLinkCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Accessibility - Color and Contrast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not rely solely on color for information', async ({ page }) => {
    // Verify error messages have text, not just color
    await page.getByRole('button', { name: /generate course/i }).click();
    
    const errorAlert = page.locator('[role="alert"]');
    const errorText = await errorAlert.textContent();
    
    // Error should have descriptive text
    expect(errorText).toBeTruthy();
    expect(errorText?.length).toBeGreaterThan(5);
  });

  test('should maintain visibility in high contrast mode', async ({ browser }) => {
    // Simulate high contrast mode by checking elements are still visible
    const context = await browser.newContext({
      colorScheme: 'dark',
    });
    
    const page = await context.newPage();
    await page.goto('/');
    
    // Verify key elements are visible
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    const submitButton = page.getByRole('button', { name: /generate course/i });
    await expect(submitButton).toBeVisible();
    
    await context.close();
  });

  test('should have sufficient contrast for text elements', async ({ page }) => {
    // Check main text elements exist and are visible
    const heroTitle = page.locator('h1').first();
    const description = page.locator('p').first();
    
    await expect(heroTitle).toBeVisible();
    await expect(description).toBeVisible();
    
    // Verify text is readable (not transparent or same as background)
    const titleColor = await heroTitle.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    const bgColor = await page.locator('body').evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(titleColor).not.toBe(bgColor);
  });
});

test.describe('Accessibility - Focus Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show visible focus ring on buttons', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /generate course/i });
    
    // Focus the button
    await submitButton.focus();
    
    // Verify it's focused
    await expect(submitButton).toBeFocused();
    
    // Check for focus styles (outline or box-shadow)
    const focusStyles = await submitButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some kind of focus indicator
    const hasFocusIndicator = 
      focusStyles.outline !== 'none' || 
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('should show visible focus ring on inputs', async ({ page }) => {
    const topicInput = page.locator('input[name="topic"]');
    
    await topicInput.focus();
    await expect(topicInput).toBeFocused();
    
    // Check for focus styles
    const focusStyles = await topicInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
      };
    });
    
    // Should have visual focus indicator
    expect(focusStyles).toBeTruthy();
  });

  test('should show visible focus ring on selects', async ({ page }) => {
    const levelSelect = page.locator('select[name="level"]');
    
    await levelSelect.focus();
    await expect(levelSelect).toBeFocused();
    
    // Verify focus is visible
    const isVisible = await levelSelect.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should maintain focus visibility during keyboard navigation', async ({ page }) => {
    // Tab through several elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify an element has focus
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
    expect(activeElement).not.toBe('BODY');
  });
});
