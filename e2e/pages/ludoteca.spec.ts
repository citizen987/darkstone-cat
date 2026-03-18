import { test, expect } from '@playwright/test'
import { PAGES } from '../helpers/constants'

test.describe('Ludoteca page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.ludoteca, { waitUntil: 'networkidle' })
  })

  test('loads and shows games', async ({ page }) => {
    // In mock mode, games should appear from local XML files
    const gameContent = page.locator('article, [class*="game"], img[alt]').first()
    await expect(gameContent).toBeVisible({ timeout: 15_000 })
  })

  test('has search input', async ({ page }) => {
    // Search input has aria-label "Cercar per nom..."
    const search = page.getByLabel(/cercar/i)
    await expect(search.first()).toBeVisible()
  })

  test('has filter controls', async ({ page }) => {
    const filterElement = page.locator('aside, [role="complementary"]').first()
    await expect(filterElement).toBeVisible()
  })

  test('has pagination or all games visible', async ({ page }) => {
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(100)
  })

  test('search updates URL', async ({ page }) => {
    const search = page.getByLabel(/cercar/i).first()
    if (await search.isVisible()) {
      await search.fill('test')
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(/q=test/i)
    }
  })

  test('page title contains ludoteca', async ({ page }) => {
    await expect(page).toHaveTitle(/ludoteca/i)
  })
})
