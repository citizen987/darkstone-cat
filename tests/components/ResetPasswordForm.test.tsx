import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

const mockPush = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}))

vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  })),
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...filterProps(props)}>{children}</form>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

function filterProps(props: Record<string, any>) {
  const invalid = [
    'initial', 'animate', 'exit', 'whileInView', 'viewport',
    'transition', 'variants', 'whileHover', 'whileTap',
  ]
  const filtered: Record<string, any> = {}
  for (const [k, v] of Object.entries(props)) {
    if (!invalid.includes(k)) filtered[k] = v
  }
  return filtered
}

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

function fillAndSubmit(password = 'newpassword123', confirm = password) {
  fireEvent.change(screen.getByLabelText(/reset_password_label/), {
    target: { value: password },
  })
  fireEvent.change(screen.getByLabelText(/reset_confirm_label/), {
    target: { value: confirm },
  })
  fireEvent.submit(screen.getByRole('button', { name: 'reset_submit' }))
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with password and confirm fields', () => {
    render(<ResetPasswordForm />)
    expect(screen.getByLabelText(/reset_password_label/)).toBeInTheDocument()
    expect(screen.getByLabelText(/reset_confirm_label/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reset_submit' })).toBeInTheDocument()
  })

  it('shows validation errors when fields are empty', () => {
    render(<ResetPasswordForm />)
    fireEvent.submit(screen.getByRole('button', { name: 'reset_submit' }))

    const errors = screen.getAllByText('required_field')
    expect(errors).toHaveLength(2)
  })

  it('shows error when password is too short', () => {
    render(<ResetPasswordForm />)
    fillAndSubmit('1234567', '1234567')
    expect(screen.getByText('reset_error_too_short')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', () => {
    render(<ResetPasswordForm />)
    fillAndSubmit('password123', 'different123')
    expect(screen.getByText('reset_error_mismatch')).toBeInTheDocument()
  })

  it('shows success message after successful password update', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })

    render(<ResetPasswordForm />)
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('reset_success_title')).toBeInTheDocument()
      expect(screen.getByText('reset_success_message')).toBeInTheDocument()
      expect(screen.getByText('reset_redirecting')).toBeInTheDocument()
    })
  })

  it('auto-redirects to /profile after success', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })

    render(<ResetPasswordForm />)
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('reset_success_title')).toBeInTheDocument()
    })

    // The useEffect sets a 3s timeout — wait for it
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile')
    }, { timeout: 5000 })
  })

  it('shows error message when updateUser fails', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'fail' } })

    render(<ResetPasswordForm />)
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('reset_error_generic')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not redirect on error', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'fail' } })

    render(<ResetPasswordForm />)
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('reset_error_generic')).toBeInTheDocument()
    })

    // Status is "error", not "success" — redirect effect should not fire
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables inputs and shows loading text while submitting', async () => {
    let resolveUpdate!: (v: any) => void
    mockUpdateUser.mockReturnValue(
      new Promise((resolve) => { resolveUpdate = resolve })
    )

    render(<ResetPasswordForm />)
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByLabelText(/reset_password_label/)).toBeDisabled()
      expect(screen.getByLabelText(/reset_confirm_label/)).toBeDisabled()
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByRole('button')).toHaveTextContent('reset_submitting')
    })

    await act(async () => {
      resolveUpdate({ error: null })
    })
  })
})
