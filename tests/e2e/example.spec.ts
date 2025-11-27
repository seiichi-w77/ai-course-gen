/**
 * Example E2E Test
 *
 * This is a sample Playwright test to verify the E2E setup is working correctly.
 * Replace this with actual end-to-end tests.
 */

import { test, expect } from '@playwright/test';

test.describe('Example E2E Test Suite', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Example assertion - adjust based on your actual homepage content
    await expect(page).toHaveTitle(/AI Course Gen/);
  });

  test('should have viewport size', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
  });
});
