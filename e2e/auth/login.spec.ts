import { test, expect } from '@playwright/test'
import { PAGES, TEXT, MEMBER_EMAIL, MEMBER_PASSWORD } from '../helpers/constants'

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.login)
  })

  test('renders login form', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#email-error')).toContainText(TEXT.required_field)
    await expect(page.locator('#password-error')).toContainText(TEXT.required_field)
  })

  test('shows email format error', async ({ page }) => {
    await page.locator('#email').fill('not-an-email')
    await page.locator('#password').fill('somepassword')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#email-error')).toContainText(TEXT.invalid_email)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.locator('#email').fill('wrong@test.local')
    await page.locator('#password').fill('WrongPassword1!')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(TEXT.login_error_invalid)).toBeVisible()
  })

  test('shows submitting state', async ({ page }) => {
    await page.locator('#email').fill(MEMBER_EMAIL)
    await page.locator('#password').fill(MEMBER_PASSWORD)
    await page.locator('button[type="submit"]').click()
    // Button text changes during submission
    await expect(page.locator('button[type="submit"]')).toContainText(TEXT.login_submitting)
  })

  test('successful login redirects to profile', async ({ page }) => {
    await page.locator('#email').fill(MEMBER_EMAIL)
    await page.locator('#password').fill(MEMBER_PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/profile', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/profile/)
  })

  test('login with redirect param', async ({ page }) => {
    await page.goto(`${PAGES.login}?redirect=/about`)
    await page.locator('#email').fill(MEMBER_EMAIL)
    await page.locator('#password').fill(MEMBER_PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/about', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/about/)
  })

  test('has link to register page', async ({ page }) => {
    const registerLink = page.locator('a[href*="/register"]')
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('has link to forgot password page', async ({ page }) => {
    const forgotLink = page.locator('a[href*="/forgot-password"]')
    await expect(forgotLink).toBeVisible()
    await forgotLink.click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('shows confirmed=success banner', async ({ page }) => {
    await page.goto(`${PAGES.login}?confirmed=success`)
    await expect(page.locator('[role="status"]')).toBeVisible()
  })
})
