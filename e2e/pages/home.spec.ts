import { test, expect } from '@playwright/test'
import { PAGES, TEXT } from '../helpers/constants'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.home)
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Darkstone/i)
  })

  test('hero section is visible', async ({ page }) => {
    await expect(page.getByText(TEXT.hero_tagline)).toBeVisible({ timeout: 10_000 })
  })

  test('has CTA button in hero', async ({ page }) => {
    const cta = page.locator('a[href*="join-us"], a[href*="register"], a:has-text("Fes-te soci")')
    await expect(cta.first()).toBeVisible({ timeout: 10_000 })
  })

  test('about section exists', async ({ page }) => {
    const about = page.locator('#about')
    await expect(about).toBeAttached()
  })

  test('schedule section exists', async ({ page }) => {
    const schedule = page.locator('#schedule')
    await expect(schedule).toBeAttached()
  })

  test('location section exists', async ({ page }) => {
    const location = page.locator('#location')
    await expect(location).toBeAttached()
  })
})
