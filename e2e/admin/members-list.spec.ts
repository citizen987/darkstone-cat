import { test, expect } from '../fixtures'
import { PAGES } from '../helpers/constants'

test.describe('Admin members list', () => {
  test('admin can access members list', async ({ adminPage: page }) => {
    await page.goto(PAGES.adminMembers)
    await expect(page).toHaveURL(/\/admin\/members/)
  })

  test('has search input', async ({ adminPage: page }) => {
    await page.goto(PAGES.adminMembers)
    const search = page.locator('input[type="text"], input[placeholder*="Cerca"]').first()
    await expect(search).toBeVisible()
  })

  test('has export button', async ({ adminPage: page }) => {
    await page.goto(PAGES.adminMembers)
    const exportBtn = page.locator('button').filter({ hasText: /exportar|export|CSV/i })
    await expect(exportBtn).toBeVisible()
  })
})
