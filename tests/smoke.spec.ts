import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('backend health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:5000/live');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('frontend loads and shows login page', async ({ page }) => {
    await page.goto('http://localhost:5174/login');
    await expect(page.locator('text=Sign in')).toBeVisible({ timeout: 10000 });
  });
});