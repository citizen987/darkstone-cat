import { describe, it, expect } from 'vitest'
import { supabaseAdmin, createTestUser } from '../helpers/supabase'

describe('account deletion', () => {
  it('deleting member + auth user cleans up both tables', async () => {
    const user = await createTestUser('delete-1@test.local', 'password123')

    // Verify member exists
    const { data: before } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id', user.id)
      .single()
    expect(before).not.toBeNull()

    // Delete member first (FK constraint), then auth user
    await supabaseAdmin.from('members').delete().eq('id', user.id)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    expect(error).toBeNull()

    // Verify member row is gone
    const { data: afterMember } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id', user.id)
      .single()
    expect(afterMember).toBeNull()
  })

  it('auth.users entry is removed after deletion', async () => {
    const user = await createTestUser('delete-2@test.local', 'password123')

    await supabaseAdmin.from('members').delete().eq('id', user.id)
    await supabaseAdmin.auth.admin.deleteUser(user.id)

    const { data } = await supabaseAdmin.auth.admin.getUserById(user.id)
    expect(data.user).toBeNull()
  })

  it('deleting non-existent user returns error', async () => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(
      '00000000-0000-0000-0000-000000000000'
    )
    expect(error).not.toBeNull()
  })
})
