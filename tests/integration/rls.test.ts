import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestUser,
  createTestAdmin,
  createAuthenticatedClient,
  cleanupUsers,
} from '../helpers/supabase'
import { createClient } from '@supabase/supabase-js'

let userA: { id: string }
let userB: { id: string }
let admin: { id: string }
const userIds: string[] = []

beforeAll(async () => {
  userA = await createTestUser('rls-a@test.local', 'password123', {
    first_name: 'UserA',
    last_name: 'Test',
  })
  userB = await createTestUser('rls-b@test.local', 'password123', {
    first_name: 'UserB',
    last_name: 'Test',
  })
  admin = await createTestAdmin('rls-admin@test.local', 'password123')
  userIds.push(userA.id, userB.id, admin.id)
})

afterAll(() => cleanupUsers(userIds))

describe('SELECT policies', () => {
  it('member sees only their own profile', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { data } = await client.from('members').select('*')

    expect(data).toHaveLength(1)
    expect(data![0].id).toBe(userA.id)
  })

  it('member cannot see other profiles', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { data } = await client
      .from('members')
      .select('*')
      .eq('id', userB.id)

    expect(data).toHaveLength(0)
  })

  it('admin sees all members', async () => {
    const client = await createAuthenticatedClient(
      'rls-admin@test.local',
      'password123'
    )
    const { data } = await client.from('members').select('id')

    expect(data!.length).toBeGreaterThanOrEqual(3)
    const ids = data!.map((m) => m.id)
    expect(ids).toContain(userA.id)
    expect(ids).toContain(userB.id)
    expect(ids).toContain(admin.id)
  })

  it('anonymous client sees nothing', async () => {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      { auth: { persistSession: false } }
    )
    const { data } = await anon.from('members').select('*')

    expect(data).toHaveLength(0)
  })
})

describe('UPDATE policies', () => {
  it('member can update their own profile', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { error } = await client
      .from('members')
      .update({ postal_code: '08221' })
      .eq('id', userA.id)

    expect(error).toBeNull()

    const { data } = await client
      .from('members')
      .select('postal_code')
      .eq('id', userA.id)
      .single()

    expect(data!.postal_code).toBe('08221')
  })

  it('member cannot update other profiles (0 rows affected)', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { data } = await client
      .from('members')
      .update({ postal_code: 'HACKED' })
      .eq('id', userB.id)
      .select()

    // RLS silently filters — returns empty result
    expect(data).toHaveLength(0)
  })

  it('member cannot change their own role', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { error } = await client
      .from('members')
      .update({ role: 'admin' })
      .eq('id', userA.id)

    expect(error).not.toBeNull()
  })

  it('member cannot change their own member_number', async () => {
    const client = await createAuthenticatedClient(
      'rls-a@test.local',
      'password123'
    )
    const { error } = await client
      .from('members')
      .update({ member_number: 'XXX-999' })
      .eq('id', userA.id)

    expect(error).not.toBeNull()
  })

  it('admin can update any member profile', async () => {
    const client = await createAuthenticatedClient(
      'rls-admin@test.local',
      'password123'
    )
    const { error } = await client
      .from('members')
      .update({ postal_code: '08001' })
      .eq('id', userA.id)

    expect(error).toBeNull()
  })
})
