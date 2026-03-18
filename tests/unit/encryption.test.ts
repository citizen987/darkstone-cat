import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('encryption', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  })

  it('roundtrip encrypt → decrypt recovers plaintext', async () => {
    const { encrypt, decrypt } = await import('@/lib/encryption')
    expect(decrypt(encrypt('Hello Darkstone!'))).toBe('Hello Darkstone!')
  })

  it('produces different ciphertexts for the same input (unique IVs)', async () => {
    const { encrypt } = await import('@/lib/encryption')
    expect(encrypt('same')).not.toBe(encrypt('same'))
  })

  it('output format is iv:authTag:ciphertext (3 base64 parts)', async () => {
    const { encrypt } = await import('@/lib/encryption')
    const parts = encrypt('test').split(':')
    expect(parts).toHaveLength(3)
    for (const part of parts) {
      expect(Buffer.from(part, 'base64').length).toBeGreaterThan(0)
    }
  })

  it('handles unicode (accents, emojis)', async () => {
    const { encrypt, decrypt } = await import('@/lib/encryption')
    const text = 'Associació Darkstone Catalunya 🎲 àèéíòóúü'
    expect(decrypt(encrypt(text))).toBe(text)
  })

  it('rejects corrupted ciphertext data', async () => {
    const { encrypt, decrypt } = await import('@/lib/encryption')
    const parts = encrypt('test').split(':')
    parts[2] = Buffer.from('corrupted-data').toString('base64')
    expect(() => decrypt(parts.join(':'))).toThrow()
  })

  it('rejects tampered auth tag', async () => {
    const { encrypt, decrypt } = await import('@/lib/encryption')
    const parts = encrypt('test').split(':')
    const tagBuf = Buffer.from(parts[1], 'base64')
    tagBuf[0] ^= 0xff
    parts[1] = tagBuf.toString('base64')
    expect(() => decrypt(parts.join(':'))).toThrow()
  })

  it('throws when ENCRYPTION_KEY is missing', async () => {
    delete process.env.ENCRYPTION_KEY
    const { encrypt } = await import('@/lib/encryption')
    expect(() => encrypt('test')).toThrow(
      'ENCRYPTION_KEY must be a 64-character hex string'
    )
  })

  it('throws when ENCRYPTION_KEY has wrong length', async () => {
    process.env.ENCRYPTION_KEY = 'tooshort'
    const { encrypt } = await import('@/lib/encryption')
    expect(() => encrypt('test')).toThrow(
      'ENCRYPTION_KEY must be a 64-character hex string'
    )
  })
})
