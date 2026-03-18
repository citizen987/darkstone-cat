import { test, expect } from '../fixtures'
import { PAGES } from '../helpers/constants'

test.describe('Member card page', () => {
  test('loads member card page', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileCard)
    // Should have a heading or card preview
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('has card preview image', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileCard)
    // Card preview image from API
    const cardImage = page.locator('img[alt*="carnet" i], img[alt*="card" i], img[src*="/api/members/card"]').first()
    await expect(cardImage).toBeVisible({ timeout: 10_000 })
  })

  test('has download button', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileCard)
    const downloadBtn = page.locator('button, a').filter({ hasText: /descarregar|download/i })
    await expect(downloadBtn).toBeVisible()
  })
})
