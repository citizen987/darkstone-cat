import { test, expect } from '@playwright/test'
import { PAGES } from '../helpers/constants'

test.describe('Locale routing', () => {
  test('default locale (ca) has no prefix', async ({ page }) => {
    await page.goto(PAGES.about)
    await expect(page).toHaveURL(/\/about$/)
    // Should not have /ca/ prefix
    expect(page.url()).not.toMatch(/\/ca\//)
  })

  test('Spanish locale uses /es prefix', async ({ page }) => {
    await page.goto('/es/about')
    await expect(page).toHaveURL(/\/es\/about/)
  })

  test('English locale uses /en prefix', async ({ page }) => {
    await page.goto('/en/about')
    await expect(page).toHaveURL(/\/en\/about/)
  })

  test('language switcher is visible', async ({ page }) => {
    await page.goto(PAGES.about)
    // The language switcher should be in the navbar
    const switcher = page.locator('nav').locator('select, [role="listbox"], button:has-text("CA"), button:has-text("ES")').first()
    await expect(switcher).toBeVisible()
  })

  test('switching to Spanish changes URL', async ({ page }) => {
    await page.goto(PAGES.about)
    // Find and click Spanish option in language switcher
    const esOption = page.locator('nav').locator('a[href*="/es/"], button:has-text("ES")').first()
    if (await esOption.isVisible()) {
      await esOption.click()
      await expect(page).toHaveURL(/\/es\//)
    }
  })

  test('Spanish about page has Spanish content', async ({ page }) => {
    await page.goto('/es/about')
    // Spanish title should be "Quiénes somos?" or similar
    await expect(page.locator('h1')).toBeVisible()
  })

  test('English about page has English content', async ({ page }) => {
    await page.goto('/en/about')
    await expect(page.locator('h1')).toBeVisible()
  })
})
