import { test as teardown } from '@playwright/test'
import { deleteTestUser } from './helpers/supabase-admin'
import { MEMBER_EMAIL, ADMIN_EMAIL } from './helpers/constants'

teardown('delete test users', async () => {
  await deleteTestUser(MEMBER_EMAIL)
  await deleteTestUser(ADMIN_EMAIL)
})
