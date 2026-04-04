import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill('demo@voltspark.in');
  await page.getByPlaceholder(/password/i).fill('demo123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('Dashboard & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads with summary cards', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    // Should have compliance score or energy data
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('sidebar shows all main sections', async ({ page }) => {
    await expect(page.locator('text=Energy')).toBeVisible();
    await expect(page.locator('text=Compliance & Safety')).toBeVisible();
    await expect(page.locator('text=Financial')).toBeVisible();
    await expect(page.locator('text=Tools')).toBeVisible();
  });

  test('sidebar shows IoT Metering section (addon enabled)', async ({ page }) => {
    await expect(page.locator('text=IoT Metering')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=IoT Dashboard')).toBeVisible();
  });

  test('sidebar shows Power Quality section (addon enabled)', async ({ page }) => {
    await expect(page.locator('text=Power Quality')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=PQ Dashboard')).toBeVisible();
  });

  test('can navigate to consumption page', async ({ page }) => {
    await page.click('text=Consumption');
    await page.waitForURL('**/consumption');
    await expect(page.locator('text=Consumption Log')).toBeVisible();
  });

  test('can navigate to settings page', async ({ page }) => {
    await page.click('text=Settings');
    await page.waitForURL('**/settings');
    await expect(page.locator('text=Branding')).toBeVisible();
    await expect(page.locator('text=Change Password')).toBeVisible();
  });

  test('can navigate to IoT dashboard', async ({ page }) => {
    await page.click('text=IoT Dashboard');
    await page.waitForURL('**/iot/dashboard');
  });

  test('can navigate to PQ dashboard', async ({ page }) => {
    await page.click('text=PQ Dashboard');
    await page.waitForURL('**/pq/dashboard');
  });
});
