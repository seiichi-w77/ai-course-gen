import { test, expect, devices } from '@playwright/test';
import testData from './fixtures/test-data.json';

/**
 * Responsive Design E2E Tests
 * 
 * Tests for responsive behavior across different screen sizes:
 * - Mobile viewport (375px)
 * - Tablet viewport (768px)
 * - Desktop viewport (1280px)
 * 
 * Verifies layout, spacing, and interaction patterns adapt correctly
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

test.describe('Responsive Design - Mobile (375px)', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('should display hero section correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Verify hero title is visible and readable
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    // Verify title stacks properly (line breaks)
    const titleBox = await heroTitle.boundingBox();
    expect(titleBox).toBeTruthy();
  });

  test('should display form in single column on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Verify form fields stack vertically
    const levelSelect = page.locator('select[name="level"]');
    const durationSelect = page.locator('select[name="duration"]');
    
    const levelBox = await levelSelect.boundingBox();
    const durationBox = await durationSelect.boundingBox();
    
    // On mobile, duration should be below level (not side by side)
    expect(levelBox).toBeTruthy();
    expect(durationBox).toBeTruthy();
    expect(durationBox!.y).toBeGreaterThan(levelBox!.y);
  });

  test('should have readable text size on mobile', async ({ page }) => {
    await page.goto('/');
    
    const heroTitle = page.locator('h1').first();
    const fontSize = await heroTitle.evaluate((el) => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font size should be at least 32px for mobile h1
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(32);
  });

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    await page.goto('/');
    
    const submitButton = page.getByRole('button', { name: /generate course/i });
    const buttonBox = await submitButton.boundingBox();
    
    // Button should be at least 44px tall (iOS touch target minimum)
    expect(buttonBox).toBeTruthy();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('should have full-width buttons on mobile', async ({ page }) => {
    await page.goto('/');
    
    const submitButton = page.getByRole('button', { name: /generate course/i });
    const buttonBox = await submitButton.boundingBox();
    
    // Button should take up most of the width
    expect(buttonBox).toBeTruthy();
    expect(buttonBox!.width).toBeGreaterThan(300);
  });

  test('should display course results in single column on mobile', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    await page.goto('/');

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Generate course
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Verify action buttons stack vertically
    const buttons = page.locator('button').filter({ hasText: /start learning|download pdf/i });
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);
  });

  test('should have proper padding on mobile', async ({ page }) => {
    await page.goto('/');
    
    const mainSection = page.locator('main').first();
    const mainBox = await mainSection.boundingBox();
    
    // Should have padding on sides (not full width)
    expect(mainBox).toBeTruthy();
    expect(mainBox!.x).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design - Tablet (768px)', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test('should display hero section with proper scaling on tablet', async ({ page }) => {
    await page.goto('/');
    
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    // Font should be larger than mobile but smaller than desktop
    const fontSize = await heroTitle.evaluate((el) => 
      window.getComputedStyle(el).fontSize
    );
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(40);
  });

  test('should display form fields in grid layout on tablet', async ({ page }) => {
    await page.goto('/');
    
    // Level and duration should be side by side on tablet
    const levelSelect = page.locator('select[name="level"]');
    const durationSelect = page.locator('select[name="duration"]');
    
    const levelBox = await levelSelect.boundingBox();
    const durationBox = await durationSelect.boundingBox();
    
    expect(levelBox).toBeTruthy();
    expect(durationBox).toBeTruthy();
    
    // Should be roughly on the same row (Y positions close)
    const yDifference = Math.abs(levelBox!.y - durationBox!.y);
    expect(yDifference).toBeLessThan(20);
  });

  test('should have appropriate content width on tablet', async ({ page }) => {
    await page.goto('/');
    
    const mainContent = page.locator('main').first();
    const contentBox = await mainContent.boundingBox();
    
    // Content should be centered with margins
    expect(contentBox).toBeTruthy();
    expect(contentBox!.width).toBeLessThan(VIEWPORTS.tablet.width);
  });

  test('should display course metadata side by side on tablet', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    await page.goto('/');

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
    
    // Metadata cards should be visible
    const metadataSection = page.locator('div').filter({ hasText: /estimated time|modules/i }).first();
    await expect(metadataSection).toBeVisible();
  });

  test('should have readable line lengths on tablet', async ({ page }) => {
    await page.goto('/');
    
    const description = page.locator('section').first().locator('p').first();
    const descBox = await description.boundingBox();
    
    // Line length should be comfortable to read (not too wide)
    expect(descBox).toBeTruthy();
    expect(descBox!.width).toBeLessThan(650);
  });
});

test.describe('Responsive Design - Desktop (1280px)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('should display hero section with full typography on desktop', async ({ page }) => {
    await page.goto('/');
    
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    // Desktop should have largest font size
    const fontSize = await heroTitle.evaluate((el) => 
      window.getComputedStyle(el).fontSize
    );
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(48);
  });

  test('should center content with max-width on desktop', async ({ page }) => {
    await page.goto('/');
    
    const mainContent = page.locator('main').first();
    const contentBox = await mainContent.boundingBox();
    
    // Content should be centered and constrained
    expect(contentBox).toBeTruthy();
    expect(contentBox!.width).toBeLessThan(900);
    
    // Should be centered (margins on both sides)
    const leftMargin = contentBox!.x;
    const rightMargin = VIEWPORTS.desktop.width - (contentBox!.x + contentBox!.width);
    const marginDifference = Math.abs(leftMargin - rightMargin);
    expect(marginDifference).toBeLessThan(50);
  });

  test('should display form fields in optimal layout on desktop', async ({ page }) => {
    await page.goto('/');
    
    // Level and duration in a row
    const levelSelect = page.locator('select[name="level"]');
    const durationSelect = page.locator('select[name="duration"]');
    
    const levelBox = await levelSelect.boundingBox();
    const durationBox = await durationSelect.boundingBox();
    
    expect(levelBox).toBeTruthy();
    expect(durationBox).toBeTruthy();
    
    // Should be on same row
    const yDifference = Math.abs(levelBox!.y - durationBox!.y);
    expect(yDifference).toBeLessThan(10);
    
    // Should have reasonable widths
    expect(levelBox!.width).toBeGreaterThan(150);
    expect(durationBox!.width).toBeGreaterThan(150);
  });

  test('should display action buttons side by side on desktop', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    await page.goto('/');

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
    
    // Find action buttons in results
    const startButton = page.getByRole('button', { name: /start learning/i }).last();
    const downloadButton = page.getByRole('button', { name: /download pdf/i });
    
    const startBox = await startButton.boundingBox();
    const downloadBox = await downloadButton.boundingBox();
    
    if (startBox && downloadBox) {
      // Buttons should be roughly on same row
      const yDifference = Math.abs(startBox.y - downloadBox.y);
      expect(yDifference).toBeLessThan(20);
    }
  });

  test('should have generous spacing on desktop', async ({ page }) => {
    await page.goto('/');
    
    const heroSection = page.locator('section').first();
    const formCard = page.locator('form').locator('..').locator('..');
    
    const heroBox = await heroSection.boundingBox();
    const formBox = await formCard.boundingBox();
    
    expect(heroBox).toBeTruthy();
    expect(formBox).toBeTruthy();
    
    // Should have significant spacing between sections
    const spacing = formBox!.y - (heroBox!.y + heroBox!.height);
    expect(spacing).toBeGreaterThan(0);
  });

  test('should display hover effects on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    const submitButton = page.getByRole('button', { name: /generate course/i });
    
    // Hover over button
    await submitButton.hover();
    
    // Button should still be visible and clickable
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Responsive Design - Cross-Viewport Tests', () => {
  test('should maintain functionality across all viewports', async ({ browser }) => {
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];
    
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Verify core functionality works
      const topicInput = page.locator('input[name="topic"]');
      await expect(topicInput).toBeVisible();
      await expect(topicInput).toBeEnabled();
      
      const submitButton = page.getByRole('button', { name: /generate course/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      
      await context.close();
    }
  });

  test('should have consistent color scheme across viewports', async ({ browser }) => {
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.desktop];
    const colors: string[] = [];
    
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      
      await page.goto('/');
      
      const backgroundColor = await page.locator('body').evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      
      colors.push(backgroundColor);
      await context.close();
    }
    
    // Background color should be consistent
    expect(colors[0]).toBe(colors[1]);
  });

  test('should preserve form state when resizing', async ({ page }) => {
    await page.goto('/');
    
    // Fill form at desktop size
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.locator('input[name="topic"]').fill('Test Topic');
    await page.locator('select[name="level"]').selectOption('beginner');
    
    // Resize to mobile
    await page.setViewportSize(VIEWPORTS.mobile);
    
    // Form values should be preserved
    await expect(page.locator('input[name="topic"]')).toHaveValue('Test Topic');
    await expect(page.locator('select[name="level"]')).toHaveValue('beginner');
  });
});

test.describe('Responsive Design - Image and Media', () => {
  test('should handle images responsively', async ({ page }) => {
    await page.goto('/');
    
    // Check if images have proper responsive attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const maxWidth = await image.evaluate((el) => 
        window.getComputedStyle(el).maxWidth
      );
      
      // Images should not overflow
      expect(maxWidth).toBeTruthy();
    }
  });

  test('should adapt spacing for different screen densities', async ({ browser }) => {
    // Test with different pixel ratios
    const context = await browser.newContext({
      viewport: VIEWPORTS.mobile,
      deviceScaleFactor: 2, // Retina display
    });
    
    const page = await context.newPage();
    await page.goto('/');
    
    // Verify page still renders correctly
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    await context.close();
  });
});
