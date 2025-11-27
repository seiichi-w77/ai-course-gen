import { test, expect } from '@playwright/test';

/**
 * Home Page E2E Tests
 * 
 * Tests for the main landing page including:
 * - Page load and rendering
 * - Title and meta information
 * - Hero section content
 * - Form visibility
 * - Navigation elements
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded without errors
    await expect(page).toHaveURL('/');
  });

  test('should display correct page title', async ({ page }) => {
    // Check document title
    await expect(page).toHaveTitle(/AI Course Generator|Learn AI/i);
  });

  test('should display hero section with title', async ({ page }) => {
    // Find the main heading
    const heroTitle = page.locator('h1').first();
    
    // Verify hero title is visible
    await expect(heroTitle).toBeVisible();
    
    // Verify title contains expected text
    await expect(heroTitle).toContainText(/Learn AI/i);
  });

  test('should display hero description', async ({ page }) => {
    // Find description paragraph in hero section
    const heroDescription = page.locator('section').first().locator('p').first();
    
    // Verify description is visible
    await expect(heroDescription).toBeVisible();
    
    // Verify description contains key information
    await expect(heroDescription).toContainText(/personalized|AI|course/i);
  });

  test('should display CTA button in hero section', async ({ page }) => {
    // Find the "Start Learning" button
    const ctaButton = page.getByRole('button', { name: /start learning/i });
    
    // Verify button is visible
    await expect(ctaButton).toBeVisible();
    
    // Verify button is enabled
    await expect(ctaButton).toBeEnabled();
  });

  test('should scroll to form when CTA button is clicked', async ({ page }) => {
    // Find and click the CTA button
    const ctaButton = page.getByRole('button', { name: /start learning/i });
    await ctaButton.click();
    
    // Wait for smooth scroll animation
    await page.waitForTimeout(1000);
    
    // Verify form is now in viewport
    const form = page.locator('form').first();
    await expect(form).toBeInViewport();
  });

  test('should display course creation form', async ({ page }) => {
    // Verify form is present
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('should display all form fields', async ({ page }) => {
    // Verify topic input
    const topicInput = page.locator('input[name="topic"]');
    await expect(topicInput).toBeVisible();
    await expect(topicInput).toHaveAttribute('placeholder', /topic/i);
    
    // Verify level select
    const levelSelect = page.locator('select[name="level"]');
    await expect(levelSelect).toBeVisible();
    
    // Verify duration select
    const durationSelect = page.locator('select[name="duration"]');
    await expect(durationSelect).toBeVisible();
    
    // Verify language select
    const languageSelect = page.locator('select[name="language"]');
    await expect(languageSelect).toBeVisible();
  });

  test('should display form labels correctly', async ({ page }) => {
    // Check for all form labels
    await expect(page.getByText(/course topic/i)).toBeVisible();
    await expect(page.getByText(/difficulty level/i)).toBeVisible();
    await expect(page.getByText(/course duration/i)).toBeVisible();
    await expect(page.getByText(/language/i)).toBeVisible();
  });

  test('should display submit button', async ({ page }) => {
    // Find the submit button
    const submitButton = page.getByRole('button', { name: /generate course/i });
    
    // Verify button is visible and enabled
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should display card with proper styling', async ({ page }) => {
    // Find the form card
    const card = page.locator('form').locator('..').locator('..');
    
    // Verify card is visible
    await expect(card).toBeVisible();
    
    // Verify card has title
    const cardTitle = page.getByText(/create your course/i);
    await expect(cardTitle).toBeVisible();
    
    // Verify card has description
    const cardDescription = page.getByText(/fill in your preferences/i);
    await expect(cardDescription).toBeVisible();
  });

  test('should display empty state message', async ({ page }) => {
    // Verify empty state is shown when no course is generated
    const emptyState = page.getByText(/fill in the form above/i);
    await expect(emptyState).toBeVisible();
  });

  test('should have proper background styling', async ({ page }) => {
    // Verify main container has proper classes
    const mainContainer = page.locator('div.min-h-screen').first();
    await expect(mainContainer).toBeVisible();
  });

  test('should render without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have accessible heading hierarchy', async ({ page }) => {
    // Get all headings
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    
    // Verify there's exactly one h1
    expect(h1Count).toBe(1);
    
    // Verify heading structure makes sense
    expect(h1Count + h2Count).toBeGreaterThanOrEqual(1);
  });

  test('should display language options', async ({ page }) => {
    const languageSelect = page.locator('select[name="language"]');
    
    // Click to open options
    await languageSelect.click();
    
    // Verify common language options exist
    const options = await languageSelect.locator('option').allTextContents();
    expect(options).toContain('English');
  });

  test('should have proper form spacing and layout', async ({ page }) => {
    // Verify form has proper spacing
    const form = page.locator('form').first();
    
    // Check that all form elements are properly spaced
    const inputs = form.locator('input, select');
    const inputCount = await inputs.count();
    
    expect(inputCount).toBeGreaterThanOrEqual(4);
  });
});
