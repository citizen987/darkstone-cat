import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { updateSession } from '@/lib/supabase/middleware'

describe('updateSession', () => {
  const mockGetUser = vi.fn()
  let capturedCookieHandlers: {
    getAll: () => { name: string; value: string }[]
    setAll: (
      cookies: { name: string; value: string; options?: object }[]
    ) => void
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null } })

    vi.mocked(createServerClient).mockImplementation(
      (_url: string, _key: string, options: any) => {
        capturedCookieHandlers = options.cookies
        return { auth: { getUser: mockGetUser } } as any
      }
    )

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = 'test-anon-key'
  })

  function createMockRequest() {
    const cookies = new Map<string, string>()
    return {
      cookies: {
        getAll: () =>
          Array.from(cookies.entries()).map(([name, value]) => ({
            name,
            value,
          })),
        set: (name: string, value: string) => cookies.set(name, value),
      },
      _cookies: cookies,
    }
  }

  function createMockResponse() {
    return {
      cookies: {
        set: vi.fn(),
      },
    }
  }

  it('returns user when authenticated', async () => {
    const user = { id: 'u1', email: 'test@test.com' }
    mockGetUser.mockResolvedValue({ data: { user } })

    const req = createMockRequest()
    const res = createMockResponse()
    const result = await updateSession(req as any, res as any)

    expect(result.user).toEqual(user)
    expect(result.response).toBe(res)
  })

  it('returns null user when not authenticated', async () => {
    const req = createMockRequest()
    const res = createMockResponse()
    const result = await updateSession(req as any, res as any)
    expect(result.user).toBeNull()
  })

  it('mirrors cookies to both request and response via setAll', async () => {
    const req = createMockRequest()
    const res = createMockResponse()
    await updateSession(req as any, res as any)

    capturedCookieHandlers.setAll([
      { name: 'session', value: 'abc', options: { path: '/' } },
    ])

    // Request should have the cookie set
    expect(req._cookies.get('session')).toBe('abc')
    // Response should have set called
    expect(res.cookies.set).toHaveBeenCalledWith('session', 'abc', {
      path: '/',
    })
  })

  it('passes existing request cookies to getAll', async () => {
    const req = createMockRequest()
    req._cookies.set('existing', 'value')
    const res = createMockResponse()
    await updateSession(req as any, res as any)

    const cookies = capturedCookieHandlers.getAll()
    expect(cookies).toContainEqual({ name: 'existing', value: 'value' })
  })
})
