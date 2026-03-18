import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockAccept = vi.fn()
const mockReject = vi.fn()
let mockStatus: 'accepted' | 'rejected' | null = null

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}))

vi.mock('@/components/CookieConsentProvider', () => ({
  useCookieConsentContext: vi.fn(() => ({
    status: mockStatus,
    accept: mockAccept,
    reject: mockReject,
  })),
}))

import CookieBanner from '@/components/CookieBanner'

describe('CookieBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus = null
  })

  it('renders when status is null (no consent yet)', () => {
    render(<CookieBanner />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('does not render when consent is already accepted', () => {
    mockStatus = 'accepted'
    render(<CookieBanner />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render when consent is already rejected', () => {
    mockStatus = 'rejected'
    render(<CookieBanner />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls accept via handleDismiss on accept button click', () => {
    vi.useFakeTimers()
    render(<CookieBanner />)

    fireEvent.click(screen.getByText('accept'))
    vi.advanceTimersByTime(300)
    expect(mockAccept).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('calls reject via handleDismiss on reject button click', () => {
    vi.useFakeTimers()
    render(<CookieBanner />)

    fireEvent.click(screen.getByText('reject'))
    vi.advanceTimersByTime(300)
    expect(mockReject).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('has proper ARIA attributes', () => {
    render(<CookieBanner />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'title')
    expect(dialog).toHaveAttribute('aria-describedby', 'cookie-banner-desc')
  })
})
