import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

const STORAGE_KEY = 'darkstone_cookie_consent'

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no consent stored', () => {
    const { result } = renderHook(() => useCookieConsent())
    expect(result.current.status).toBeNull()
  })

  it('accept() sets status to accepted', () => {
    const { result } = renderHook(() => useCookieConsent())
    act(() => result.current.accept())
    expect(result.current.status).toBe('accepted')
  })

  it('reject() sets status to rejected', () => {
    const { result } = renderHook(() => useCookieConsent())
    act(() => result.current.reject())
    expect(result.current.status).toBe('rejected')
  })

  it('persists consent to localStorage', () => {
    const { result } = renderHook(() => useCookieConsent())
    act(() => result.current.accept())
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.status).toBe('accepted')
    expect(stored.date).toBeTruthy()
  })

  it('reads existing consent from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: 'rejected', date: new Date().toISOString() })
    )
    const { result } = renderHook(() => useCookieConsent())
    expect(result.current.status).toBe('rejected')
  })

  it('returns null for expired consent (>12 months)', () => {
    const expired = new Date()
    expired.setFullYear(expired.getFullYear() - 1)
    expired.setDate(expired.getDate() - 2) // 1 year + 2 days ago
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: 'accepted', date: expired.toISOString() })
    )
    const { result } = renderHook(() => useCookieConsent())
    expect(result.current.status).toBeNull()
  })

  it('clears expired consent from localStorage', () => {
    const expired = new Date()
    expired.setFullYear(expired.getFullYear() - 2)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: 'accepted', date: expired.toISOString() })
    )
    renderHook(() => useCookieConsent())
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json')
    const { result } = renderHook(() => useCookieConsent())
    expect(result.current.status).toBeNull()
  })
})
