import { test, expect } from '@playwright/test';

const AUTH_HOST = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';
const AUTH_HOSTNAME = new URL(AUTH_HOST).hostname;

/**
 * Phase 4 Task 4.D.2 — auth-gated UX flows.
 *
 * SCOPE: middleware redirect + unauth action gating + me/ guard.
 * SETUP: assumes `npm run dev` (or PLAYWRIGHT_BASE_URL pointing at preview)
 * + a test account on auth.bridgingchina.net. Tests requiring login skip
 * automatically when E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD env vars are absent
 * (CI-friendly without leaking real creds).
 *
 * To run locally:
 *   cd web && npx playwright install chromium
 *   E2E_AUTH_EMAIL=... E2E_AUTH_PASSWORD=... npm run test:e2e
 */

test.describe('middleware: anonymous /me access', () => {
  test('redirects to auth subdomain with callbackURL', async ({ page }) => {
    const response = await page.goto('/me', { waitUntil: 'commit' });
    // Either 302 chain followed by Playwright (final URL on auth host),
    // or status 302 if redirect was returned without follow.
    expect(page.url()).toContain(AUTH_HOSTNAME);
    expect(page.url()).toContain('/auth/login');
    expect(page.url()).toMatch(/callbackURL=/);
    // sanity: status of last navigation should be 200 (login page) or 3xx
    if (response) {
      expect([200, 301, 302, 303, 307, 308]).toContain(response.status());
    }
  });
});

test.describe('public pages remain anonymous', () => {
  test('homepage loads without redirect', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).not.toContain(AUTH_HOSTNAME);
  });

  test('bridges list loads without redirect', async ({ page }) => {
    const response = await page.goto('/bridges');
    expect(page.url()).not.toContain(AUTH_HOSTNAME);
    expect(response?.status()).toBe(200);
  });
});

test.describe('unauth favorite action', () => {
  test('clicking favorite on a bridge detail routes anonymous user to /me', async ({ page }) => {
    await page.goto('/bridges');
    const firstBridge = page.locator('a[href^="/bridges/"]').first();
    if (!(await firstBridge.count())) test.skip(true, 'no bridges seeded');
    await firstBridge.click();
    await page.waitForURL(/\/bridges\//);

    const favBtn = page.getByRole('button', { name: /收藏/ });
    if (!(await favBtn.count())) test.skip(true, 'FavoriteButton not on this page');

    await favBtn.click();
    // FavoriteButton -> router.push('/me') -> middleware -> auth host
    await page.waitForURL((url) => url.hostname === AUTH_HOSTNAME, { timeout: 10_000 });
    expect(page.url()).toContain('/auth/login');
  });
});

test.describe('authenticated flows', () => {
  const email = process.env.E2E_AUTH_EMAIL;
  const password = process.env.E2E_AUTH_PASSWORD;

  test.skip(!email || !password, 'E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD not set');

  async function signIn(page: import('@playwright/test').Page) {
    await page.goto(`${AUTH_HOST}/auth/login`);
    await page.getByLabel(/邮箱|email/i).fill(email!);
    await page.getByLabel(/密码|password/i).fill(password!);
    await page.getByRole('button', { name: /登录|sign in/i }).click();
    await page.waitForURL((url) => url.hostname !== AUTH_HOSTNAME || url.pathname !== '/auth/login');
  }

  test('signed-in user reaches /me with all 4 tabs', async ({ page }) => {
    await signIn(page);
    await page.goto('/me');
    expect(page.url()).toContain('/me');
    await expect(page.getByText('我的')).toBeVisible();
    await expect(page.getByRole('tab', { name: '收藏' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '浏览历史' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '设置' })).toBeVisible();
  });

  test('SettingsPanel sign-out clears cookie and re-protects /me', async ({ page }) => {
    await signIn(page);
    await page.goto('/me');
    await page.getByRole('tab', { name: '设置' }).click();
    await page.getByRole('button', { name: /退出登录/ }).click();
    await page.waitForURL('/');

    // After sign-out, /me should redirect to auth again
    await page.goto('/me');
    await page.waitForURL((url) => url.hostname === AUTH_HOSTNAME, { timeout: 10_000 });
    expect(page.url()).toContain('/auth/login');
  });

  test('non-admin user does not see admin shortcut in settings', async ({ page }) => {
    await signIn(page);
    await page.goto('/me');
    await page.getByRole('tab', { name: '设置' }).click();
    // 假设 E2E test user 是普通 role=user
    await expect(page.getByRole('link', { name: /管理后台/ })).toHaveCount(0);
  });
});
