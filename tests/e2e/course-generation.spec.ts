import { test, expect } from '@playwright/test';
import testData from './fixtures/test-data.json';

/**
 * Course Generation Flow E2E Tests
 * 
 * Tests for the complete course generation workflow:
 * - Form input and validation
 * - API request handling
 * - Loading states
 * - Result display
 * - Error handling
 */

test.describe('Course Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should fill out the form with valid data', async ({ page }) => {
    const { machineLearning } = testData.courses;

    // Fill in topic
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    
    // Select level
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    
    // Select duration
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    
    // Select language
    await page.locator('select[name="language"]').selectOption(machineLearning.language);

    // Verify all fields are filled
    await expect(page.locator('input[name="topic"]')).toHaveValue(machineLearning.topic);
    await expect(page.locator('select[name="level"]')).toHaveValue(machineLearning.level);
    await expect(page.locator('select[name="duration"]')).toHaveValue(machineLearning.duration);
  });

  test('should show validation error when topic is empty', async ({ page }) => {
    // Leave topic empty, fill other fields
    await page.locator('select[name="level"]').selectOption('beginner');
    await page.locator('select[name="duration"]').selectOption('1-month');
    
    // Try to submit
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error message is displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/enter.*topic/i);
  });

  test('should show validation error when level is not selected', async ({ page }) => {
    // Fill topic but leave level empty
    await page.locator('input[name="topic"]').fill('Machine Learning');
    await page.locator('select[name="duration"]').selectOption('1-month');
    
    // Try to submit
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error message
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/select.*level/i);
  });

  test('should show validation error when duration is not selected', async ({ page }) => {
    // Fill topic and level but leave duration empty
    await page.locator('input[name="topic"]').fill('Machine Learning');
    await page.locator('select[name="level"]').selectOption('beginner');
    
    // Try to submit
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error message
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/select.*duration/i);
  });

  test('should clear error message when user corrects input', async ({ page }) => {
    // Trigger validation error
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify error is shown
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    
    // Start typing in topic field
    await page.locator('input[name="topic"]').fill('M');
    
    // Error should disappear
    await expect(errorAlert).not.toBeVisible();
  });

  test('should show loading state when submitting form', async ({ page }) => {
    const { machineLearning } = testData.courses;

    // Mock the API to delay response
    await page.route('/api/generate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testData.mockResponses.generatedCourse),
      });
    });

    // Fill and submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    
    // Click generate button
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify loading state
    const loadingButton = page.getByRole('button', { name: /generating/i });
    await expect(loadingButton).toBeVisible();
    await expect(loadingButton).toBeDisabled();
    
    // Wait for loading to complete
    await expect(loadingButton).not.toBeVisible({ timeout: 10000 });
  });

  test('should disable form inputs during loading', async ({ page }) => {
    const { machineLearning } = testData.courses;

    // Mock delayed API response
    await page.route('/api/generate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testData.mockResponses.generatedCourse),
      });
    });

    // Fill and submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Verify form inputs are disabled
    await expect(page.locator('input[name="topic"]')).toBeDisabled();
    await expect(page.locator('select[name="level"]')).toBeDisabled();
    await expect(page.locator('select[name="duration"]')).toBeDisabled();
  });

  test('should display generated course after successful submission', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock successful API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Fill and submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify course title is displayed
    const courseTitle = page.getByText(mockCourse.title);
    await expect(courseTitle).toBeVisible();
    
    // Verify course description is displayed
    const courseDescription = page.getByText(mockCourse.description);
    await expect(courseDescription).toBeVisible();
  });

  test('should display course modules and lessons', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify first module is displayed
    const firstModule = page.getByText(mockCourse.modules[0].title);
    await expect(firstModule).toBeVisible();
    
    // Verify first lesson is displayed
    const firstLesson = page.getByText(mockCourse.modules[0].lessons[0]);
    await expect(firstLesson).toBeVisible();
  });

  test('should display course metadata (hours and module count)', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify estimated hours is displayed
    const hoursText = page.getByText(new RegExp(`${mockCourse.estimatedHours}.*hour`, 'i'));
    await expect(hoursText).toBeVisible();
    
    // Verify module count is displayed
    const moduleCountText = page.getByText(new RegExp(`${mockCourse.modules.length}.*module`, 'i'));
    await expect(moduleCountText).toBeVisible();
  });

  test('should display action buttons after course generation', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify "Start Learning" button
    const startButton = page.getByRole('button', { name: /start learning/i }).last();
    await expect(startButton).toBeVisible();
    
    // Verify "Download PDF" button
    const downloadButton = page.getByRole('button', { name: /download pdf/i });
    await expect(downloadButton).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    const { machineLearning } = testData.courses;

    // Mock API error
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for error
    await page.waitForTimeout(1000);
    
    // Verify error message is displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/error|failed/i);
  });

  test('should allow generating another course after successful generation', async ({ page }) => {
    const { machineLearning, nlp } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // First generation
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Scroll back to form
    await page.locator('form').first().scrollIntoViewIfNeeded();
    
    // Fill new data
    await page.locator('input[name="topic"]').fill(nlp.topic);
    await page.locator('select[name="level"]').selectOption(nlp.level);
    
    // Verify form is functional
    await expect(page.locator('input[name="topic"]')).toHaveValue(nlp.topic);
    await expect(page.getByRole('button', { name: /generate course/i })).toBeEnabled();
  });

  test('should make correct API request with form data', async ({ page }) => {
    const { machineLearning } = testData.courses;
    let requestBody: any = null;

    // Intercept API request
    await page.route('/api/generate', async (route) => {
      const request = route.request();
      requestBody = JSON.parse(request.postData() || '{}');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testData.mockResponses.generatedCourse),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for request
    await page.waitForTimeout(500);
    
    // Verify request body
    expect(requestBody).toBeTruthy();
    expect(requestBody.topic).toBe(machineLearning.topic);
    expect(requestBody.level).toBe(machineLearning.level);
    expect(requestBody.numModules).toBeGreaterThan(0);
  });

  test('should hide empty state when course is generated', async ({ page }) => {
    const { machineLearning } = testData.courses;
    const mockCourse = testData.mockResponses.generatedCourse;

    // Verify empty state is visible initially
    const emptyState = page.getByText(/fill in the form above/i);
    await expect(emptyState).toBeVisible();

    // Mock API response
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCourse),
      });
    });

    // Submit form
    await page.locator('input[name="topic"]').fill(machineLearning.topic);
    await page.locator('select[name="level"]').selectOption(machineLearning.level);
    await page.locator('select[name="duration"]').selectOption(machineLearning.duration);
    await page.getByRole('button', { name: /generate course/i }).click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify empty state is hidden
    await expect(emptyState).not.toBeVisible();
  });
});
