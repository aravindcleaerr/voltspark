import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads with hero and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Save Energy');
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('bad@email.com');
    await page.getByPlaceholder(/password/i).fill('wrongpass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('login with demo credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('demo@voltspark.in');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('register page loads with form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
