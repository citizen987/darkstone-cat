import { test, expect } from '@playwright/test'

test('home page loads and has correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Darkstone/i)
})
