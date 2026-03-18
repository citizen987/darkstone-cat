import { test, expect } from '../fixtures'
import { PAGES, TEXT } from '../helpers/constants'

test.describe('Profile edit', () => {
  test('loads profile edit form', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileEdit)
    await expect(page.locator('#first_name')).toBeVisible()
    await expect(page.locator('#last_name')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#dni')).toBeVisible()
    await expect(page.locator('#postal_code')).toBeVisible()
    await expect(page.locator('#ludoya_username')).toBeVisible()
    await expect(page.locator('#bgg_username')).toBeVisible()
  })

  test('email is read-only', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileEdit)
    // Email is displayed as a div, not an input
    const emailInput = page.locator('input#email')
    await expect(emailInput).toHaveCount(0)
  })

  test('has cancel button linking to profile', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileEdit)
    const cancelLink = page.locator('a[href*="/profile"]').filter({ hasText: TEXT.profile_edit_save }).or(
      page.locator('a[href*="/profile"]').last()
    )
    await expect(cancelLink).toBeVisible()
  })

  test('can update name and save', async ({ memberPage: page }) => {
    test.slow()
    await page.goto(PAGES.profileEdit)

    const firstNameInput = page.locator('#first_name')
    await firstNameInput.clear()
    await firstNameInput.fill('E2E-Updated')

    await page.locator('button[type="submit"]').click()

    // Should redirect to profile after success
    await page.waitForURL('**/profile', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/profile$/)

    // Verify updated name is shown
    await expect(page.getByText('E2E-Updated')).toBeVisible()

    // Restore original name
    await page.goto(PAGES.profileEdit)
    const input = page.locator('#first_name')
    await input.clear()
    await input.fill('E2E')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/profile', { timeout: 10_000 })
  })

  test('shows section headers', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileEdit)
    await expect(page.getByText(TEXT.profile_section_personal)).toBeVisible()
    await expect(page.getByText(TEXT.profile_section_gaming)).toBeVisible()
    await expect(page.getByText(TEXT.profile_section_membership)).toBeVisible()
  })

  test('newsletter checkbox is visible', async ({ memberPage: page }) => {
    await page.goto(PAGES.profileEdit)
    await expect(page.locator('input[name="newsletter"]')).toBeVisible()
  })
})
