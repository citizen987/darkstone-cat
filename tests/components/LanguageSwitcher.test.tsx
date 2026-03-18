import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockReplace = vi.fn()

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'ca'),
}))

vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(() => ({ replace: mockReplace })),
  usePathname: vi.fn(() => '/about'),
}))

import LanguageSwitcher from '@/components/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockReset()
  })

  it('renders all three locale buttons', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText('CAT')).toBeInTheDocument()
    expect(screen.getByText('ESP')).toBeInTheDocument()
    expect(screen.getByText('ENG')).toBeInTheDocument()
  })

  it('marks current locale with aria-current="page"', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText('CAT')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('ESP')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('ENG')).not.toHaveAttribute('aria-current')
  })

  it('calls router.replace with new locale on click', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByText('ESP'))
    expect(mockReplace).toHaveBeenCalledWith('/about', { locale: 'es' })
  })

  it('has accessible aria-label on each button', () => {
    render(<LanguageSwitcher />)
    expect(
      screen.getByRole('button', { name: /Switch to CAT/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Switch to ESP/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Switch to ENG/i })
    ).toBeInTheDocument()
  })
})
