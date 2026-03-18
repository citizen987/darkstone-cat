import { test, expect } from '@playwright/test'
import { PAGES, TEXT } from '../helpers/constants'

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.contact)
  })

  test('renders contact form', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#subject')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#name-error')).toContainText(TEXT.required_field)
    await expect(page.locator('#email-error')).toContainText(TEXT.required_field)
    await expect(page.locator('#subject-error')).toContainText(TEXT.required_field)
    await expect(page.locator('#message-error')).toContainText(TEXT.required_field)
  })

  test('shows email format error', async ({ page }) => {
    await page.locator('#name').fill('Test User')
    await page.locator('#email').fill('bad-email')
    await page.locator('#subject').fill('Subject')
    await page.locator('#message').fill('Message body')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#email-error')).toContainText(TEXT.invalid_email)
  })

  test('successful submission shows success message', async ({ page }) => {
    // Mock the contact API endpoint
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
    )

    await page.locator('#name').fill('E2E Tester')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#subject').fill('E2E Test Subject')
    await page.locator('#message').fill('This is an automated test message.')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('[role="status"]')).toContainText(
      TEXT.contact_success_title,
      { timeout: 5_000 },
    )
  })

  test('shows error on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    )

    await page.locator('#name').fill('E2E Tester')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#subject').fill('Test')
    await page.locator('#message').fill('Test message')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText(TEXT.contact_error_title)).toBeVisible()
  })

  test('clears validation errors on input', async ({ page }) => {
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#name-error')).toBeVisible()

    await page.locator('#name').fill('Test')
    await expect(page.locator('#name-error')).not.toBeVisible()
  })
})
