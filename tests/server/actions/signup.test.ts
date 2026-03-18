import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdatePayload = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn((payload: unknown) => {
        mockUpdatePayload(payload)
        return { eq: mockEq }
      }),
    })),
  })),
}))

vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((text: string) => `encrypted:${text}`),
}))

import { updateMemberAfterSignup } from '@/lib/supabase/actions'
import { encrypt } from '@/lib/encryption'

describe('updateMemberAfterSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
  })

  const baseData = {
    userId: 'user-1',
    conduct_accepted: true,
    privacy_accepted: true,
    newsletter_accepted: false,
  }

  it('returns error when userId is missing', async () => {
    const result = await updateMemberAfterSignup({ ...baseData, userId: '' })
    expect(result).toEqual({ error: 'Missing user ID' })
    expect(mockUpdatePayload).not.toHaveBeenCalled()
  })

  it('encrypts phone when provided', async () => {
    await updateMemberAfterSignup({ ...baseData, phone: '612345678' })
    expect(encrypt).toHaveBeenCalledWith('612345678')
    expect(mockUpdatePayload.mock.calls[0][0].phone_encrypted).toBe(
      'encrypted:612345678'
    )
  })

  it('encrypts DNI when provided', async () => {
    await updateMemberAfterSignup({ ...baseData, dni: '12345678A' })
    expect(encrypt).toHaveBeenCalledWith('12345678A')
    expect(mockUpdatePayload.mock.calls[0][0].dni_nie_encrypted).toBe(
      'encrypted:12345678A'
    )
  })

  it('omits optional fields when empty or whitespace', async () => {
    await updateMemberAfterSignup({
      ...baseData,
      phone: '',
      dni: '  ',
      postal_code: '',
    })
    const payload = mockUpdatePayload.mock.calls[0][0]
    expect(payload).not.toHaveProperty('phone_encrypted')
    expect(payload).not.toHaveProperty('dni_nie_encrypted')
    expect(payload).not.toHaveProperty('postal_code')
  })

  it('includes optional fields when non-empty', async () => {
    await updateMemberAfterSignup({
      ...baseData,
      postal_code: '08221',
      ludoya_username: 'darkstone',
      bgg_username: 'darkstone_bcn',
    })
    const payload = mockUpdatePayload.mock.calls[0][0]
    expect(payload.postal_code).toBe('08221')
    expect(payload.ludoya_username).toBe('darkstone')
    expect(payload.bgg_username).toBe('darkstone_bcn')
  })

  it('sets acceptance timestamps when accepted', async () => {
    await updateMemberAfterSignup(baseData)
    const payload = mockUpdatePayload.mock.calls[0][0]
    expect(payload.conduct_accepted).toBe(true)
    expect(payload.conduct_accepted_at).toBeTruthy()
    expect(payload.privacy_accepted).toBe(true)
    expect(payload.privacy_accepted_at).toBeTruthy()
  })

  it('sets null timestamps when not accepted', async () => {
    await updateMemberAfterSignup({
      ...baseData,
      conduct_accepted: false,
      privacy_accepted: false,
    })
    const payload = mockUpdatePayload.mock.calls[0][0]
    expect(payload.conduct_accepted_at).toBeNull()
    expect(payload.privacy_accepted_at).toBeNull()
  })

  it('targets the correct user ID', async () => {
    await updateMemberAfterSignup({ ...baseData, userId: 'user-xyz' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-xyz')
  })

  it('returns error message on database failure', async () => {
    mockEq.mockResolvedValueOnce({ error: { message: 'update failed' } })
    const result = await updateMemberAfterSignup(baseData)
    expect(result).toEqual({ error: 'update failed' })
  })
})
