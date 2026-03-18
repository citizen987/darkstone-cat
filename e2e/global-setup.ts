import { test as setup } from '@playwright/test'
import { createTestUser } from './helpers/supabase-admin'
import {
  MEMBER_EMAIL, MEMBER_PASSWORD, MEMBER_FIRST_NAME, MEMBER_LAST_NAME,
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME,
  MEMBER_STATE_PATH, ADMIN_STATE_PATH,
} from './helpers/constants'

setup('create test users and save auth state', async ({ browser }) => {
  // Create test users in Supabase (admin API, no browser needed)
  await createTestUser({
    email: MEMBER_EMAIL,
    password: MEMBER_PASSWORD,
    firstName: MEMBER_FIRST_NAME,
    lastName: MEMBER_LAST_NAME,
    role: 'member',
  })

  await createTestUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    firstName: ADMIN_FIRST_NAME,
    lastName: ADMIN_LAST_NAME,
    role: 'admin',
  })

  // Login member and save state
  const memberCtx = await browser.newContext()
  const memberPage = await memberCtx.newPage()
  await memberPage.goto('/login')
  await memberPage.locator('#email').fill(MEMBER_EMAIL)
  await memberPage.locator('#password').fill(MEMBER_PASSWORD)
  await memberPage.locator('button[type="submit"]').click()
  await memberPage.waitForURL('**/profile', { timeout: 30_000 })
  await memberCtx.storageState({ path: MEMBER_STATE_PATH })
  await memberCtx.close()

  // Login admin and save state
  const adminCtx = await browser.newContext()
  const adminPage = await adminCtx.newPage()
  await adminPage.goto('/login')
  await adminPage.locator('#email').fill(ADMIN_EMAIL)
  await adminPage.locator('#password').fill(ADMIN_PASSWORD)
  await adminPage.locator('button[type="submit"]').click()
  await adminPage.waitForURL('**/profile', { timeout: 30_000 })
  await adminCtx.storageState({ path: ADMIN_STATE_PATH })
  await adminCtx.close()
})
